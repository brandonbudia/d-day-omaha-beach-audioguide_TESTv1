// Run with installed Chrome: node --test tests/browser/visitor-coordination.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { audioSample, recordAudio } from './offline-scenario.mjs';

const databaseName = 'dday-visitor-write-coordination-v1';
const visitorKey = 'dday_visitor_state_v2';

function disableWebLocksForFixture() {
  Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined });
}

async function holdIndexedDBGate(tab) {
  await tab.evaluate((name) => new Promise((acquired, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const gate = database.transaction('gate', 'readwrite');
      gate.oncomplete = () => database.close();
      gate.onabort = () => { database.close(); reject(gate.error); };
      const store = gate.objectStore('gate');
      const stopAt = performance.now() + 3_500;
      let released = false;
      window.__ddayFixtureReleaseGate = () => { released = true; };
      // Keep the test transaction open briefly to queue two real page writes.
      const enqueue = () => {
        const pending = store.get('fixture-holder');
        pending.onsuccess = () => {
          acquired(true);
          if (!released && performance.now() < stopAt) enqueue();
        };
      };
      enqueue();
    };
  }), databaseName);
  return () => tab.evaluate(() => window.__ddayFixtureReleaseGate());
}

test('IndexedDB serializes favorites and checkpoints without Web Locks, including after a tab closes', async (context) => {
  const harness = await createHarness();
  let release;
  try {
    const build = await harness.build('visitor-coordination');
    await harness.serve(build);
    const browser = await harness.openBrowser({ install: disableWebLocksForFixture });
    const first = await browser.openTab();
    const second = await browser.openTab();
    await first.send('Page.addScriptToEvaluateOnNewDocument', { source: '(' + recordAudio.toString() + ')()' });
    await first.navigate('/stop/10?hl=fr');
    await second.navigate('/stop/11?hl=fr');
    const before = await first.waitFor((key) => {
      const value = JSON.parse(localStorage.getItem(key) ?? 'null');
      return value?.pieces?.['10']?.consultedAt && value?.pieces?.['11']?.consultedAt && value;
    }, visitorKey);
    assert.equal(await first.evaluate(() => navigator.locks === undefined), true);
    assert.equal(await second.evaluate(() => navigator.locks === undefined), true);
    assert(await first.evaluate(async (name) => (await indexedDB.databases()).some((database) => database.name === name), databaseName));

    release = await holdIndexedDBGate(second);
    await first.click('.museum-piece-bookmark');
    await second.click('.museum-piece-bookmark');
    await Promise.all([first, second].map((tab) => tab.waitFor(() => document.querySelector('.museum-piece-bookmark')?.getAttribute('aria-pressed') === 'true')));
    assert.deepEqual(await first.evaluate((key) => JSON.parse(localStorage.getItem(key)), visitorKey), before,
      'Both app changes remain queued while the native IDB transaction is held.');
    await release();
    release = undefined;

    const favorites = await first.waitFor((key) => {
      const value = JSON.parse(localStorage.getItem(key) ?? 'null');
      return value?.pieces?.['10']?.favorite === true && value?.pieces?.['11']?.favorite === true && value;
    }, visitorKey);
    assert.equal(favorites.version, 2);
    for (const id of ['10', '11']) assert.equal(favorites.pieces[id].consultedAt, before.pieces[id].consultedAt);

    const holder = await browser.openTab();
    await holder.navigate('/?hl=fr');
    await holder.waitFor(() => Boolean(document.querySelector('.museum-start-visit')));
    await second.navigate('/stop/09?hl=fr');
    await second.waitFor((key) => Boolean(JSON.parse(localStorage.getItem(key))?.pieces?.['09']?.consultedAt), visitorKey);
    await first.click('.museum-piece-listen');
    await first.waitFor(() => Boolean(document.querySelector('.player-page')));
    await first.waitFor(() => window.__ddayFixtureAudio.some((audio) =>
      audio.currentSrc.includes('/audio/fr/stop-10.mp3') && !audio.paused && audio.currentTime > 0.2));

    release = await holdIndexedDBGate(holder);
    const beforeClose = await second.evaluate((key) => JSON.parse(localStorage.getItem(key)), visitorKey);
    await first.click('main button', 'Pause');
    const paused = await first.evaluate(audioSample);
    assert.equal(paused.paused, true);
    await second.click('.museum-piece-bookmark');
    await second.waitFor(() => document.querySelector('.museum-piece-bookmark')?.getAttribute('aria-pressed') === 'true');
    assert.deepEqual(await second.evaluate((key) => JSON.parse(localStorage.getItem(key)), visitorKey), beforeClose,
      'The favorite and actual media checkpoint are both waiting for the owner to release the gate.');
    await holder.close();
    release = undefined;
    const merged = await second.waitFor((key, position) => {
      const value = JSON.parse(localStorage.getItem(key) ?? 'null');
      const checkpoint = value?.lastPlayback;
      const recording = value?.pieces?.['10']?.listening?.fr;
      return value?.pieces?.['09']?.favorite === true && checkpoint?.id === '10' &&
        Math.abs(checkpoint.positionSeconds - position) < 0.15 &&
        recording?.heardRanges?.length > 0 && recording.completedAt === undefined && value;
    }, visitorKey, paused.time);
    assert.equal(merged.version, 2);
    for (const id of ['10', '11']) assert.equal(merged.pieces[id].favorite, true);

    await harness.closeBrowser();
    const restarted = await harness.openBrowser({ install: disableWebLocksForFixture });
    const reopened = await restarted.openTab();
    await reopened.navigate('/?hl=fr');
    await reopened.waitFor(() => Boolean(document.querySelector('.museum-start-visit')));
    assert.deepEqual(await reopened.evaluate((key) => JSON.parse(localStorage.getItem(key)), visitorKey), merged);
    const coordination = await reopened.evaluate((name) => new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const names = [...database.objectStoreNames];
        const transaction = database.transaction('gate', 'readonly');
        transaction.oncomplete = () => database.close();
        const count = transaction.objectStore('gate').count();
        count.onerror = () => reject(count.error);
        count.onsuccess = () => resolve({ names, count: count.result });
      };
    }), databaseName);
    assert.deepEqual(coordination, { names: ['gate'], count: 0 });
    context.diagnostic(browser.product + '; favoris et checkpoint sérialisés, libération sur fermeture de l’onglet détenteur, LocalStorage v2 intact après redémarrage, registre vide.');
  } finally {
    try { await release?.(); }
    finally { await harness.close(); }
  }
});
