import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { runInNewContext } from 'node:vm';
import { hasActiveOfflineShell, OFFLINE_SHELL_MESSAGE, OFFLINE_SHELL_REVISION_META } from '../src/offline/offlineShell';
import { createOfflineStore } from '../src/offline/offlineStore';

const workerScript = readFileSync(new URL('../scripts/offlineShellWorker.js', import.meta.url), 'utf8');
const origin = 'https://guide.example';
const cacheName = `workbox-precache-v2-${origin}/`;
const revision = 'build-a';
const entries = [
  { url: 'index.html', revision: 'workbox-index-a' },
  { url: 'assets/entry-a.js', revision: null },
  { url: 'assets/style-a.css', revision: null },
  { url: 'assets/lazy-player-a.js', revision: null },
  { url: 'images/common.jpg', revision: 'workbox-common-a' },
];

interface WorkerMessage {
  data: { type: string; revision: string };
  ports: { postMessage: (result: { type: string; revision: string; ready: boolean }) => void }[];
  waitUntil: (pending: Promise<void>) => void;
}

function fixture(complete = true) {
  const cache = new Map<string, Response>();
  const put = (path: string, response = new Response('contents')) => cache.set(origin + path, response);
  const indexKey = '/index.html?__WB_REVISION__=workbox-index-a';
  put(indexKey, new Response(`<meta name="${OFFLINE_SHELL_REVISION_META}" content="${revision}">`));
  put('/assets/entry-a.js');
  put('/assets/style-a.css');
  put('/assets/lazy-player-a.js');
  put('/images/common.jpg?__WB_REVISION__=workbox-common-a');
  let failReads = false;
  let listener: ((event: WorkerMessage) => void) | undefined;
  const checked: string[] = [];
  runInNewContext(`(${workerScript})(${JSON.stringify({ type: OFFLINE_SHELL_MESSAGE, metaName: OFFLINE_SHELL_REVISION_META, revision, complete, entries })});`, {
    URL,
    self: {
      registration: { scope: `${origin}/` },
      location: { href: `${origin}/sw.js` },
      caches: {
        match: async (key: string, options: { cacheName: string }) => {
          assert.equal(options.cacheName, cacheName);
          checked.push(key);
          if (failReads) throw new Error('CacheStorage inaccessible');
          return cache.get(key)?.clone();
        },
      },
      addEventListener: (_name: 'message', callback: (event: WorkerMessage) => void) => { listener = callback; },
    },
  });

  const probe = async (pageRevision = revision) => {
    let task: Promise<void> | undefined;
    let message: Parameters<WorkerMessage['ports'][number]['postMessage']>[0] | undefined;
    listener!({
      data: { type: OFFLINE_SHELL_MESSAGE, revision: pageRevision },
      ports: [{ postMessage: (value) => { message = value; } }],
      waitUntil: (pending) => { task = pending; },
    });
    await task;
    return message;
  };
  return { cache, put, probe, indexKey, checked, rejectReads: () => { failReads = true; } };
}

test('offline shell requires the active build index, entry, CSS, lazy imports and common resources', async () => {
  const { probe, cache, put, indexKey, checked } = fixture();
  assert.equal((await probe())?.ready, true);
  assert.equal(checked.length, entries.length);

  cache.delete(`${origin}/assets/lazy-player-a.js`);
  assert.equal((await probe())?.ready, false, 'missing lazy import after eviction');
  put('/assets/lazy-player-a.js');
  cache.delete(`${origin}/images/common.jpg?__WB_REVISION__=workbox-common-a`);
  put('/images/common.jpg?__WB_REVISION__=workbox-common-b');
  assert.equal((await probe())?.ready, false, 'another revision cannot fill the common asset');
  put('/images/common.jpg?__WB_REVISION__=workbox-common-a');
  put(indexKey, new Response(`<meta name="${OFFLINE_SHELL_REVISION_META}" content="build-b">`));
  assert.equal((await probe())?.ready, false, 'a response at the right key must still identify the right build');
});

test('offline shell does not certify a different page revision, an incomplete manifest, or failed reads', async () => {
  const { probe, checked, rejectReads } = fixture();
  const otherBuild = await probe('build-b');
  assert.equal(otherBuild?.revision, revision);
  assert.equal(otherBuild?.ready, false);
  assert.equal(checked.length, 0);
  assert.equal((await fixture(false).probe())?.ready, false);
  rejectReads();
  assert.equal((await probe())?.ready, false);
});

function worker(send: (message: unknown, port: MessagePort) => void, state: ServiceWorkerState = 'activated') {
  return { state, postMessage: (message: unknown, ports: MessagePort[]) => send(message, ports[0]) } as unknown as ServiceWorker;
}

function respond(port: MessagePort, value = revision) {
  port.postMessage({ type: OFFLINE_SHELL_MESSAGE, revision: value, ready: true });
}

test('the active controller can attest its own page while a newer worker waits', async () => {
  let checked = 0;
  const active = worker((_message, port) => { checked += 1; respond(port); });
  const waiting = worker(() => assert.fail('waiting worker cannot certify the page'), 'installed');
  const registration = { active, waiting } as ServiceWorkerRegistration;
  const workers = { controller: active, getRegistration: async () => registration };
  assert.equal(await hasActiveOfflineShell(workers, revision), true);
  assert.equal(await hasActiveOfflineShell(workers, 'build-b'), false);
  assert.equal(await hasActiveOfflineShell({ ...workers, controller: null }, revision), false);
  assert.equal(await hasActiveOfflineShell({ ...workers, controller: waiting }, revision), false);
  assert.equal(checked, 2);
});

test('a silent old worker and inaccessible registration leave readiness unconfirmed', async () => {
  const controller = worker(() => {});
  const registration = { active: controller } as ServiceWorkerRegistration;
  assert.equal(await hasActiveOfflineShell({ controller, getRegistration: async () => registration }, revision, 5), false);
  assert.equal(await hasActiveOfflineShell({ controller, getRegistration: async () => { throw new Error('Unavailable'); } }, revision), false);
});

test('the browser rechecks once if the controller changes before it receives a reply', async () => {
  let secondChecks = 0;
  const second = worker((_message, port) => { secondChecks += 1; respond(port, 'build-b'); });
  const first = worker((_message, port) => {
    active = second;
    respond(port);
  });
  let active = first;
  const workers = {
    get controller() { return active; },
    getRegistration: async () => ({ active } as ServiceWorkerRegistration),
  };
  assert.equal(await hasActiveOfflineShell(workers, revision), false, 'late success from the old controller is discarded');
  assert.equal(secondChecks, 1);
  assert.equal(await hasActiveOfflineShell(workers, 'build-b'), true);
});

test('an inspection requested during another download is coalesced and catches eviction after release', async () => {
  const frUrl = '/audio/fr/stop-10.mp3?v=fr';
  const enUrl = '/audio/en/stop-10.mp3?v=en';
  const body = 'fixture audio';
  const integrity = { bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') };
  const cache = new Map([[origin + frUrl, new Response(body)]]);
  const readUrls: string[] = [];
  let startFetch!: () => void;
  let completeFetch!: (response: Response) => void;
  const fetchStarted = new Promise<void>((resolve) => { startFetch = resolve; });
  const fetchResponse = new Promise<Response>((resolve) => { completeFetch = resolve; });
  const store = createOfflineStore({
    origin,
    subtle: webcrypto.subtle,
    resources: (language) => language === 'fr' || language === 'en' ? [{ ...integrity, url: language === 'fr' ? frUrl : enUrl }] : [],
    shellAvailable: async () => true,
    withDownloadLock: async (_signal, download) => download(),
    fetch: async () => { startFetch(); return fetchResponse; },
    caches: {
      has: async () => true,
      open: async () => ({
        match: async (url) => { readUrls.push(url); return cache.get(url)?.clone(); },
        put: async (url, response) => { cache.set(url, response); },
        keys: async () => [...cache.keys()].map((url) => ({ url })),
      }),
    },
  });

  await store.inspect('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  const download = store.download('en');
  await fetchStarted;
  cache.delete(origin + frUrl);
  await store.inspect('fr');
  await store.inspect('fr');
  await store.inspect('en');
  assert.deepEqual(readUrls, [origin + frUrl, origin + enUrl]);

  completeFetch(new Response(body));
  await download;
  await nextTurn();
  assert.equal(store.getSnapshot().packs.fr.status, 'partial');
  assert.equal(store.getSnapshot().packs.en.status, 'ready');
  assert.deepEqual(readUrls, [origin + frUrl, origin + enUrl, origin + frUrl]);
});
