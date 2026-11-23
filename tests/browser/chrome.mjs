import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

export async function until(probe, description, timeout = 20_000) {
  const deadline = Date.now() + timeout;
  let cause;
  while (Date.now() < deadline) {
    try {
      const value = await probe();
      if (value) return value;
    } catch (error) {
      cause = error;
    }
    await delay(50);
  }
  throw new Error(`${description} (${timeout} ms)`, { cause });
}

async function chromeExecutable() {
  const paths = process.platform === 'win32'
    ? [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA]
      .filter(Boolean).map((directory) => join(directory, 'Google', 'Chrome', 'Application', 'chrome.exe'))
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const file of paths) {
    if (await access(file).then(() => true, () => false)) return file;
  }
  throw new Error('Chrome/Chromium introuvable aux emplacements installés usuels.');
}

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  const listeners = new Map();
  let nextId = 0;
  const opened = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Ouverture de la connexion CDP expirée.')), 5_000);
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    const fail = () => { clearTimeout(timer); reject(new Error('Connexion CDP impossible.')); };
    socket.addEventListener('error', fail, { once: true });
    socket.addEventListener('close', fail, { once: true });
  });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    const request = pending.get(message.id);
    if (request) {
      clearTimeout(request.timer);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
      else request.resolve(message.result);
    } else if (message.sessionId && message.method) {
      listeners.get(message.sessionId)?.(message.method, message.params);
    }
  });
  socket.addEventListener('close', () => {
    for (const { timer, reject } of pending.values()) {
      clearTimeout(timer);
      reject(new Error('Connexion CDP fermée.'));
    }
    pending.clear();
    listeners.clear();
  });

  async function send(method, params = {}, sessionId) {
    await opened;
    return new Promise((resolve, reject) => {
      if (socket.readyState !== WebSocket.OPEN) { reject(new Error('Connexion CDP fermée.')); return; }
      const id = ++nextId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Commande CDP expirée: ${method}`));
      }, 15_000);
      pending.set(id, { resolve, reject, timer, method });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  return { send, listeners, close: () => socket.close() };
}

async function stopChrome(child, exited, connection) {
  const exitedWithin = (milliseconds) => Promise.race([exited.then(() => true), delay(milliseconds, false, { ref: false })]);
  if (connection) void connection.send('Browser.close').catch(() => {});
  if (!(await exitedWithin(connection ? 4_000 : 50))) {
    child.kill();
    assert(await exitedWithin(4_000), 'Le processus Chrome lancé par le harnais ne s’arrête pas.');
  }
  connection?.close();
}

export async function launchChrome({ profile, origin, install, width = 1100, height = 900 }) {
  const executable = await chromeExecutable();
  const parent = await realpath(dirname(profile));
  assert.equal(dirname(parent), await realpath(tmpdir()));
  assert(basename(parent).startsWith('dday-browser-'));
  assert.equal(basename(profile), 'chrome-profile');
  await mkdir(profile, { recursive: true });
  assert.equal(await realpath(profile), join(parent, 'chrome-profile'));
  await rm(join(profile, 'DevToolsActivePort'), { force: true });
  const child = spawn(executable, [
    '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--no-proxy-server', '--remote-debugging-address=127.0.0.1',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, `--window-size=${width},${height}`, 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  let failure;
  let connection;
  const exited = new Promise((resolve) => {
    child.once('error', (error) => { failure = error; resolve(); });
    child.once('exit', (code) => { failure = new Error(`Chrome arrêté avec le code ${code}.`); resolve(); });
  });

  try {
    const portFile = await until(async () => {
      if (failure) throw failure;
      return readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(() => null);
    }, 'Chrome n’a pas ouvert le port CDP de son profil jetable');
    const [port, endpoint] = portFile.trim().split(/\r?\n/);
    assert.match(port, /^\d{1,5}$/);
    assert.match(endpoint, /^\/devtools\/browser\/[\da-f-]+$/i);
    connection = connect(`ws://127.0.0.1:${port}${endpoint}`);
    const { product } = await connection.send('Browser.getVersion');

    return {
      product,
      profile,
      async openTab() {
        const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await connection.send('Target.attachToTarget', { targetId, flatten: true });
        const send = (method, params) => connection.send(method, params, sessionId);
        const events = [];
        const observedEvents = new Set([
          'Network.requestWillBeSent', 'Network.responseReceived', 'Network.loadingFailed', 'Runtime.exceptionThrown',
          'Runtime.consoleAPICalled', 'Log.entryAdded', 'Inspector.targetCrashed', 'ServiceWorker.workerVersionUpdated',
        ]);
        connection.listeners.set(sessionId, (type, data) => {
          if (observedEvents.has(type)) events.push({ type, data });
        });
        await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable', 'Inspector.enable'].map((method) => send(method)));
        if (install) await send('Page.addScriptToEvaluateOnNewDocument', { source: `(${install.toString()})()` });

        const evaluate = async (fn, ...args) => {
          const expression = typeof fn === 'string' ? fn : `(${fn.toString()})(...${JSON.stringify(args)})`;
          const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
          if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
          return result.value;
        };

        return {
          send, evaluate, events, targetId,
          waitFor: (fn, ...args) => until(() => evaluate(fn, ...args), `Condition navigateur non atteinte: ${fn.toString()}`),
          async navigate(path = '/') {
            const resource = new URL(path, origin);
            assert.equal(resource.origin, origin, 'Navigation limitée à l’origine locale du harnais.');
            const { errorText } = await send('Page.navigate', { url: resource.href });
            if (errorText) throw new Error(errorText);
          },
          reload: () => send('Page.reload', { ignoreCache: false }),
          offline: (offline) => send('Network.emulateNetworkConditions', { offline, latency: 0, downloadThroughput: 0, uploadThroughput: 0 }),
          async click(selector, name) {
            await send('Page.bringToFront');
            const point = await until(() => evaluate((selector, name) => {
              const candidates = Array.from(document.querySelectorAll(selector));
              const target = candidates.find((node) => !node.disabled && node.getClientRects().length &&
                (name === null || (node.getAttribute('aria-label') || node.innerText).trim() === name));
              if (!target) return null;
              target.scrollIntoView({ block: 'center', behavior: 'instant' });
              const rect = target.getBoundingClientRect();
              const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
              return target.contains(document.elementFromPoint(x, y)) ? { x, y } : null;
            }, selector, name ?? null), `Contrôle Chromium inaccessible: ${selector} ${name ?? ''}`);
            const click = { ...point, button: 'left', clickCount: 1 };
            await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...click });
            await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...click });
          },
          async close() {
            connection.listeners.delete(sessionId);
            await connection.send('Target.closeTarget', { targetId });
          },
        };
      },
      close: () => stopChrome(child, exited, connection),
    };
  } catch (error) {
    await stopChrome(child, exited, connection);
    throw error;
  }
}
