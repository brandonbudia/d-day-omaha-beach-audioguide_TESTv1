import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, realpath, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as viteBuild } from 'vite';
import { launchChrome } from './chrome.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const catalogFile = join(root, 'src/data/media-catalog.json');
const fixtureTracks = ['fr/10', 'fr/11', 'en/10'];
const probePath = '/__dday_browser_probe';
const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg',
};

function checkRepository() {
  const git = (...args) => execFileSync('git', ['--no-optional-locks', ...args], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(git('remote', 'get-url', 'origin'), 'https://github.com/brandonbudia/d-day-omaha-beach-audioguide_TESTv1.git');
  assert.equal(git('branch', '--show-current'), 'codex/overnight-audio-highlight');
  assert.equal(resolve(git('rev-parse', '--show-toplevel')), resolve(root));
}

function contains(parent, candidate) {
  const path = relative(parent, candidate);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

async function fixtureBuild(directory, name, plugins, replaceTracks) {
  assert.match(name, /^[a-zA-Z][a-zA-Z0-9-]*$/);
  const version = join(directory, `build-${name}`);
  const publicDirectory = join(version, 'public');
  const outDir = join(version, 'output');
  await mkdir(version);
  const catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
  const originalAudio = structuredClone(catalog.audio);
  const tracks = {};
  const audioCopies = new Map();
  const copies = [...catalog.shared.map(({ url }) => url.slice(1)), 'manifest.json'];
  const manifest = JSON.parse(await readFile(join(root, 'public/manifest.json'), 'utf8'));
  for (const { src } of manifest.icons ?? []) copies.push(src.replace(/^\//, ''));
  copies.push('icons/audioguide.svg', 'icons/audioguide-apple-touch.png');

  for (const [track, replacement] of Object.entries(replaceTracks)) {
    assert(fixtureTracks.includes(track) && fixtureTracks.includes(replacement), 'Les variantes utilisent uniquement les pistes de fixture.');
  }

  for (const [language, stations] of Object.entries(catalog.audio)) {
    for (const [station, entry] of Object.entries(stations)) {
      const key = `${language}/${station}`;
      if (fixtureTracks.includes(key)) {
        const file = `audio/${language}/stop-${station}.mp3`;
        const [sourceLanguage, sourceStation] = (replaceTracks[key] ?? key).split('/');
        Object.assign(entry, originalAudio[sourceLanguage][sourceStation]);
        audioCopies.set(file, `audio/${sourceLanguage}/stop-${sourceStation}.mp3`);
        tracks[key] = { url: `/${file}?v=${entry.sha256}`, sha256: entry.sha256, bytes: entry.bytes };
      } else entry.status = 'unavailable';
    }
  }

  async function copyPublic(file, destination, fixtureSource = file) {
    const source = resolve(root, 'public', fixtureSource);
    const target = resolve(destination, file);
    assert(contains(join(root, 'public'), source) && contains(destination, target));
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
  }

  // Vite builds the production application against a private public directory.
  // Only non-audio files are staged before Workbox computes the precache.
  for (const file of new Set(copies)) {
    await copyPublic(file, publicDirectory);
    await copyPublic(file, outDir);
  }
  const catalogPath = catalogFile.replaceAll('\\', '/');
  await viteBuild({
    root,
    configLoader: 'runner',
    publicDir: publicDirectory,
    build: { outDir, emptyOutDir: false, copyPublicDir: false },
    logLevel: 'warn',
    plugins: [{
      name: 'dday-browser-fixture',
      enforce: 'pre',
      transform(_source, id) {
        if (id === catalogPath) return JSON.stringify(catalog);
      },
      transformIndexHtml: { order: 'pre', handler: () => [{ tag: 'meta', attrs: { name: 'dday-fixture', content: name } }] },
    }, ...plugins],
  });
  for (const [file, source] of audioCopies) await copyPublic(file, outDir, source);
  return Object.freeze({ name, directory: outDir, tracks: Object.freeze(tracks), shared: catalog.shared.length });
}

async function startServer(currentVersion) {
  const requests = [];
  const sockets = new Set();
  const delayedDownloads = new Map();
  let origin;
  let reachable = true;

  const server = createServer((req, res) => {
    const version = currentVersion();
    const request = { version: version?.name, method: req.method, url: req.url, range: req.headers.range };
    requests.push(request);
    res.on('finish', () => { request.status = res.statusCode; });
    async function respond() {
      if (req.headers.host !== new URL(origin).host || !req.url?.startsWith('/')) { res.writeHead(421).end(); return; }
      const url = new URL(req.url, origin);
      if (url.origin !== origin) { res.writeHead(421).end(); return; }
      if (!reachable) {
        request.disconnected = true;
        req.socket.destroy();
        return;
      }
      if (req.method === 'POST' && url.pathname === probePath) { res.writeHead(204, { 'Cache-Control': 'no-store' }).end(); return; }
      if (!version || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(url.pathname);
      const delayed = url.searchParams.has('__dday_download') && delayedDownloads.get(pathname);
      if (delayed) {
        request.held = true;
        await delayed.wait;
        if (res.destroyed) return;
      }
      const serveIndex = pathname === '/' || (req.headers.accept?.includes('text/html') && !extname(pathname));
      const file = resolve(version.directory, serveIndex ? 'index.html' : `.${pathname}`);
      if (!contains(version.directory, file)) { res.writeHead(403).end(); return; }
      let owned, info;
      try {
        owned = await realpath(file);
        if (!contains(version.directory, owned)) { res.writeHead(403).end(); return; }
        info = await stat(owned);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (!info?.isFile()) { res.writeHead(404).end(); return; }

      const media = extname(file) === '.mp3';
      const bounds = media && req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
      let start = 0, end = info.size - 1;
      const headers = { 'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' };
      if (media) headers['Accept-Ranges'] = 'bytes';
      if (bounds) {
        if (bounds[1]) start = Number(bounds[1]);
        else start = Math.max(0, info.size - Number(bounds[2]));
        if (bounds[1] && bounds[2]) end = Math.min(end, Number(bounds[2]));
        if (start > end) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${info.size}` }).end(); return; }
        headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      }
      res.writeHead(bounds ? 206 : 200, { ...headers, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD' || !info.size) res.end();
      else createReadStream(owned, { start, end }).on('error', () => res.destroy()).pipe(res);
    }
    void respond().catch(() => {
      if (res.headersSent) res.destroy();
      else res.writeHead(500).end();
    });
  });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin, requests,
    setReachable(value) {
      reachable = value;
      if (!value) for (const socket of sockets) socket.destroy();
    },
    holdDownload(path) {
      assert(fixtureTracks.some((track) => `/audio/${track.replace('/', '/stop-')}.mp3` === path));
      assert(!delayedDownloads.has(path));
      let release;
      const wait = new Promise((resolve) => { release = resolve; });
      const resume = () => { delayedDownloads.delete(path); release(); };
      delayedDownloads.set(path, { wait, resume });
      return resume;
    },
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      for (const download of delayedDownloads.values()) download.resume();
      for (const socket of sockets) socket.destroy();
    }),
  };
}

/**
 * Used by the opt-in Chromium tests. Build one or more named fixtures, serve one
 * on the allocated loopback origin, and open tabs only through openBrowser().
 * closeBrowser() preserves the disposable profile for a restart. Always call
 * close() in a finally block to stop Chrome, close the server and free the fixture.
 * The test is intentionally limited to the TESTv1 checkout and its test branch.
 */
export async function createHarness() {
  checkRepository();
  const temp = await realpath(tmpdir());
  assert(!contains(root, temp), 'Le répertoire temporaire doit être extérieur au dépôt.');
  const directory = await mkdtemp(join(temp, 'dday-browser-'));
  const profile = join(directory, 'chrome-profile');
  const versions = new Map();
  let current, server, browser;

  return {
    async build(name, { plugins = [], replaceTracks = {} } = {}) {
      assert(!versions.has(name), 'Une version de fixture ne peut pas être écrasée.');
      const version = await fixtureBuild(directory, name, plugins, replaceTracks);
      versions.set(name, version);
      return version;
    },
    async serve(version) {
      assert(versions.get(version?.name) === version, 'Seules les versions créées ici peuvent être servies.');
      current = version;
      server ??= await startServer(() => current);
      return { origin: server.origin, requests: server.requests, probePath, holdDownload: server.holdDownload, setReachable: server.setReachable };
    },
    async openBrowser(options = {}) {
      assert(server, 'Démarrer l’origine de fixture avant Chrome.');
      assert(!browser, 'Fermer Chrome avant de relancer son profil jetable.');
      browser = await launchChrome({ ...options, profile, origin: server.origin });
      return browser;
    },
    async closeBrowser() {
      if (browser) await browser.close();
      browser = undefined;
    },
    async close() {
      try {
        if (browser) await browser.close();
      } finally {
        try { if (server) await server.close(); }
        finally {
          const owned = await realpath(directory);
          assert.equal(dirname(owned), temp);
          assert(basename(owned).startsWith('dday-browser-'));
          await rm(owned, { recursive: true, maxRetries: 3 });
        }
      }
    },
  };
}
