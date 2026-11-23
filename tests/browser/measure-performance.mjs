// Run manually with installed Chrome: node tests/browser/measure-performance.mjs
// Resource Timing counts decoded bodies, including responses from the worker.
// JS heap snapshots are page metrics, not total memory or a leak test.
import assert from 'node:assert/strict';
import { createHarness } from './harness.mjs';
import { offlineProof } from './offline-scenario.mjs';
const harness = await createHarness();
try {
  const label = process.argv[2] ?? 'current';
  const build = await harness.build(label);
  const { probePath, setReachable } = await harness.serve(build);
  const browser = await harness.openBrowser();
  for (const language of ['fr', 'en']) {
    const tab = await browser.openTab();
    await tab.send('Performance.enable');
    const heap = async () => Math.round((await tab.send('Performance.getMetrics')).metrics.find(item => item.name === 'JSHeapUsedSize')?.value ?? 0);
    const scriptBytes = () => tab.evaluate(() => performance.getEntriesByType('resource')
      .filter(entry => new URL(entry.name).origin === location.origin && new URL(entry.name).pathname.endsWith('.js'))
      .map(entry => ({ name: new URL(entry.name).pathname.split('/').at(-1), bytes: entry.decodedBodySize })));
    await tab.navigate('/?hl=' + language);
    await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    const beforeReload = await tab.evaluate(() => performance.timeOrigin);
    await tab.reload();
    await tab.waitFor((locale, previous) => performance.timeOrigin !== previous && document.documentElement.lang === locale &&
      document.readyState === 'complete' && Boolean(navigator.serviceWorker.controller) && Boolean(document.querySelector('.museum-start-visit')), language, beforeReload);
    const initial = await scriptBytes();
    const nav = await tab.evaluate(() => performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd);
    const heapBefore = await heap();
    await tab.evaluate(() => { performance.clearResourceTimings(); window.__ddayPerfStart = performance.now(); });
    await tab.click('.museum-start-visit');
    const tour = await tab.waitFor(() => location.pathname === '/parcours' && Boolean(document.querySelector('a[href^="/stop/10"]')) && performance.now() - window.__ddayPerfStart);
    await tab.click('a[href^="/stop/10"]');
    await tab.waitFor(() => location.pathname === '/stop/10' && Boolean(document.querySelector('.museum-piece-listen')));
    await tab.evaluate((language) => {
      window.__ddayTranscriptMs = null;
      window.__ddayTranscriptStart = performance.now();
      const observer = new MutationObserver(() => {
        if (document.querySelector('.synced-transcript[lang="' + language + '"]')) {
          window.__ddayTranscriptMs = performance.now() - window.__ddayTranscriptStart;
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }, language);
    await tab.click('.museum-piece-listen');
    let player;
    try {
      await tab.waitFor(() => location.pathname === '/player' && Boolean(document.querySelector('.player-page')));
      if (await tab.evaluate(() => document.querySelector('.player-view-toggle')?.getAttribute('aria-expanded') === 'false')) {
        await tab.click('.player-view-toggle');
      }
      player = await tab.waitFor((locale) => document.querySelector('.synced-transcript[lang="' + locale + '"]') &&
        (window.__ddayTranscriptMs ?? performance.now() - window.__ddayTranscriptStart), language);
    } catch (error) {
      console.error(JSON.stringify(await tab.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang,
        text: document.querySelector('main')?.innerText.slice(0, 240) }))));
      throw error;
    }
    const scripts = await scriptBytes();
    const before = initial.reduce((bytes, file) => bytes + file.bytes, 0);
    const extra = scripts.reduce((bytes, file) => bytes + file.bytes, 0);
    const firstHeap = await heap();
    const warm = [];
    for (let iteration = 0; iteration < 3; iteration += 1) {
      await tab.click('nav button', language === 'fr' ? 'Accueil' : 'Home');
      await tab.waitFor(() => location.pathname === '/' && Boolean(document.querySelector('.museum-start-visit')));
      await tab.evaluate(() => performance.clearResourceTimings());
      await tab.click('.museum-start-visit');
      await tab.click('a[href^="/stop/10"]');
      await tab.click('.museum-piece-listen');
      await tab.waitFor((locale) => Boolean(document.querySelector('.synced-transcript[lang="' + locale + '"]')), language);
      warm.push({ scriptBytes: (await scriptBytes()).reduce((bytes, file) => bytes + file.bytes, 0), jsHeapUsed: await heap() });
    }
    console.log(JSON.stringify({ label, language, initial: before, tourToTranscriptScripts: extra, scripts,
      domContentLoadedMs: Math.round(nav), tourMs: Math.round(tour), transcriptMs: Math.round(player),
      jsHeapBefore: heapBefore, jsHeapAfter: firstHeap, warmNavigations: warm }));
    await tab.close();
  }
  const storageTab = await browser.openTab();
  await storageTab.navigate('/?hl=fr');
  await storageTab.waitFor(() => document.documentElement.lang === 'fr' && navigator.serviceWorker.controller?.state === 'activated');
  await storageTab.click('.offline-manager summary');
  await storageTab.evaluate(() => {
    const panel = document.querySelector('.offline-manager');
    window.__ddayDownloadMs = null;
    let start;
    const observer = new MutationObserver(() => {
      if (panel.innerText.includes('Téléchargement en cours')) start ??= performance.now();
      if (start !== undefined && panel.innerText.includes('Visite prête hors connexion')) {
        window.__ddayDownloadMs = performance.now() - start;
        observer.disconnect();
      }
    });
    observer.observe(panel, { childList: true, subtree: true, characterData: true });
  });
  await storageTab.click('.offline-manager button', 'Télécharger cette langue');
  const download = await storageTab.waitFor(() => window.__ddayDownloadMs);
  await storageTab.offline(true);
  await offlineProof(storageTab, probePath);
  setReachable(false);
  const storage = await storageTab.evaluate(async (track) => {
    const cache = await caches.open('dday-verified-media-v1');
    const entries = await cache.keys();
    let bytes = 0;
    let shaMs = 0;
    const start = performance.now();
    for (const entry of entries) {
      const response = await cache.match(entry);
      const data = await response.arrayBuffer();
      bytes += data.byteLength;
      const digestStart = performance.now();
      const digest = await crypto.subtle.digest('SHA-256', data);
      shaMs += performance.now() - digestStart;
      if (entry.url.endsWith(track.url)) {
        const actual = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
        if (actual !== track.sha256) throw new Error('Digest fixture incohérent.');
      }
    }
    const inspectionMs = performance.now() - start;
    const rangeStart = performance.now();
    const partial = await fetch(track.url, { headers: { Range: 'bytes=0-4095' } });
    const rangeBytes = (await partial.arrayBuffer()).byteLength;
    return { entries: entries.length, bytes, shaMs, inspectionMs, rangeMs: performance.now() - rangeStart,
      rangeBytes, rangeStatus: partial.status, contentRange: partial.headers.get('Content-Range') };
  }, build.tracks['fr/10']);
  assert.equal(storage.entries, build.shared + 2);
  assert.equal(storage.rangeBytes, 4096);
  assert.equal(storage.rangeStatus, 206);
  console.log(JSON.stringify({ label, fixture: '2 MP3 FR et ressources communes', browser: browser.product,
    downloadMs: Math.round(download), ...storage }));
} finally { await harness.close(); }
