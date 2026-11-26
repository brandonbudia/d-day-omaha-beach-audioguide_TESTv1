// Run with Node 22+ and Chrome: node --test tests/browser/versions.test.mjs
// Three private builds, a single loopback origin and one disposable Chrome profile.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { until } from './chrome.mjs';
import { createHarness } from './harness.mjs';
import { audioSample, offlineProof, readFrenchPack, recordAudio } from './offline-scenario.mjs';

function extraLazyImport() {
  const id = 'virtual:dday-fixture-lazy';
  const player = "import('./pages/PlayerPage')";
  return {
    name: 'dday-fixture-add-lazy-import',
    enforce: 'pre',
    resolveId(source) { if (source === id) return '\0dday-fixture-lazy'; },
    load(source) { if (source === '\0dday-fixture-lazy') return 'globalThis.__ddayFixtureLazyLoaded = true;'; },
    transform(source, path) {
      if (!path.endsWith('/src/App.tsx')) return;
      assert(source.includes(player), 'La fixture dépend de l’import différé du lecteur.');
      return source.replace(player, `Promise.all([${player}, import('${id}')]).then(([page]) => page)`);
    },
  };
}

async function workerState() {
  const registration = await navigator.serviceWorker.getRegistration();
  const controller = navigator.serviceWorker.controller;
  return {
    active: registration?.active?.state ?? null, waiting: registration?.waiting?.state ?? null,
    sameController: Boolean(controller && controller === registration?.active), scriptURL: controller?.scriptURL ?? null,
    version: document.querySelector('meta[name="dday-fixture"]')?.content ?? null,
    revision: document.querySelector('meta[name="dday-offline-shell-revision"]')?.content ?? null,
  };
}

const applicationReady = () => document.readyState === 'complete' && Boolean(document.querySelector('main'));
const workerWaiting = async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state === 'installed';
const checkUpdate = async () => (await navigator.serviceWorker.getRegistration()).update().then(() => true, () => false);
const checkpoint = () => JSON.parse(localStorage.getItem('dday_visitor_state_v2') ?? 'null')?.lastPlayback;

async function enter(browser, origin, version, { language = 'fr', offline = false } = {}) {
  const tab = await browser.openTab();
  if (offline) await tab.offline(true);
  await tab.navigate(`/?hl=${language}`);
  await tab.waitFor(applicationReady);
  let latest;
  let state;
  try {
    state = await until(async () => {
      latest = await tab.evaluate(workerState);
      return latest.version === version && latest.sameController && latest.active === 'activated' && latest;
    }, `La version ${version} doit contrôler sa page`);
  } catch (error) {
    throw new Error(`${error.message}. Dernière observation: ${JSON.stringify(latest)}`, { cause: error });
  }
  assert.equal(state.scriptURL, `${origin}/sw.js`);
  assert.match(state.revision, /^[a-f0-9]{64}$/);
  return { tab, state };
}

async function browserWorker(observer, origin, status, versionId) {
  return until(() => {
    const current = new Map();
    for (const { type, data } of observer.events) {
      if (type !== 'ServiceWorker.workerVersionUpdated') continue;
      for (const version of data.versions) current.set(version.versionId, version);
    }
    return Array.from(current.values()).find((version) => version.scriptURL === `${origin}/sw.js` && version.status === status &&
      (!versionId || version.versionId === versionId));
  }, `Le navigateur doit signaler le worker ${versionId ?? ''} ${status}`);
}

async function openOfflinePack(tab) { await tab.click('.offline-manager summary'); }
async function downloadFrenchPack(tab) {
  await openOfflinePack(tab);
  await tab.click('.offline-manager button', 'Télécharger cette langue');
  await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion'));
}

async function playFrench(tab, url) {
  await tab.navigate('/stop/10?hl=fr');
  await tab.waitFor(applicationReady);
  await tab.click('main button', 'Lancer la lecture');
  const media = await until(async () => {
    const sample = await tab.evaluate(audioSample);
    return sample?.src.endsWith(url) && !sample.paused && sample.time > 0.4 && sample;
  }, 'FR10 doit avancer avec le média de cette version');
  assert.equal(media.error, null);
  return media;
}

function servedFromWorker(tab, url) {
  return tab.events.some(({ type, data }) => type === 'Network.responseReceived' && data.response.url.endsWith(url) &&
    data.response.fromServiceWorker && data.response.status === 206);
}

test('PWA A/B/C waits without interrupting visitors, then preserves storage across updates and crash', async (context) => {
  const harness = await createHarness();
  let stage = 'builds isolés';
  let tabs = [];
  let observer;
  try {
    const A = await harness.build('A');
    const B = await harness.build('B');
    const C = await harness.build('C', { replaceTracks: { 'fr/10': 'fr/11' }, plugins: [extraLazyImport()] });
    assert.equal(new Set([A.directory, B.directory, C.directory]).size, 3);
    assert.equal(A.tracks['fr/10'].url, B.tracks['fr/10'].url);
    assert.notEqual(B.tracks['fr/10'].url, C.tracks['fr/10'].url);
    assert.match(await readFile(join(C.directory, 'sw.js'), 'utf8'), /dday-fixture-lazy/);

    stage = 'installation de A et pack français';
    const { origin, probePath, holdDownload, setReachable, requests } = await harness.serve(A);
    const browser = await harness.openBrowser({ install: recordAudio });
    // This tab remains on about:blank. It observes the browser lifecycle
    // without becoming a client that can hold back a waiting worker.
    observer = await browser.openTab();
    await observer.send('ServiceWorker.enable');
    const bootstrap = await browser.openTab();
    await bootstrap.navigate();
    await bootstrap.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await bootstrap.close();
    const { tab: a, state: stateA } = await enter(browser, origin, 'A');
    const { tab: other, state: otherA } = await enter(browser, origin, 'A', { language: 'en' });
    tabs = [a, other];
    assert.equal(stateA.waiting, null);
    assert.equal(otherA.revision, stateA.revision);
    await downloadFrenchPack(a);
    const oldPack = await a.evaluate(readFrenchPack);
    assert.equal(oldPack.entries.length, A.shared + 2);

    stage = 'lecture et téléchargement de A pendant l’attente de B';
    const playing = await playFrench(a, A.tracks['fr/10'].url);
    const englishPath = new URL(A.tracks['en/10'].url, origin).pathname;
    const releaseDownload = holdDownload(englishPath);
    await openOfflinePack(other);
    await other.click('.offline-manager button', 'Download this language');
    const transfer = await until(() => requests.find(({ url, held }) => held && url.startsWith(englishPath)), 'Transfert EN retenu par le serveur de fixture');

    await harness.serve(B);
    assert.equal(await other.evaluate(checkUpdate), true);
    await Promise.all([a.waitFor(workerWaiting), other.waitFor(workerWaiting)]);
    const waitingB = await browserWorker(observer, origin, 'installed');
    await a.waitFor(() => document.body.innerText.includes('Une mise à jour est prête'));
    await other.waitFor(() => document.body.innerText.includes('An update is ready'));
    for (const tab of tabs) {
      const waiting = await tab.evaluate(workerState);
      assert.equal(waiting.revision, stateA.revision);
      assert.equal(waiting.sameController, true);
      assert.equal(waiting.waiting, 'installed');
    }
    assert.equal((await a.evaluate(audioSample)).paused, false);
    assert((await a.evaluate(audioSample)).time > playing.time);
    assert.equal(transfer.status, undefined);
    assert.equal(await other.evaluate(() => document.body.innerText.includes('Downloading')), true);
    releaseDownload();
    await other.waitFor(() => document.body.innerText.includes('Ready offline'));
    assert.equal(transfer.status, 200);
    await other.close();
    assert.equal((await a.evaluate(workerState)).waiting, 'installed');
    await a.click('main button', 'Pause');
    const saved = await until(async () => {
      const checkpointA = await a.evaluate(checkpoint);
      return checkpointA?.id === '10' && checkpointA.positionSeconds > 0 && checkpointA;
    }, 'Position de lecture A persistée');
    await a.close();

    stage = 'activation naturelle de B et rechargement hors connexion';
    await browserWorker(observer, origin, 'activated', waitingB.versionId);
    const { tab: b, state: stateB } = await enter(browser, origin, 'B');
    tabs = [b];
    assert.notEqual(stateB.revision, stateA.revision);
    assert.equal(stateB.waiting, null);
    assert.equal((await b.evaluate(checkpoint)).audioIdentity, saved.audioIdentity);
    assert((await b.evaluate(checkpoint)).positionSeconds >= saved.positionSeconds - 0.1);
    const preservedPack = await b.evaluate(readFrenchPack);
    assert.deepEqual(preservedPack.audio, oldPack.audio);
    assert(oldPack.entries.every((key) => preservedPack.entries.includes(key)));
    await openOfflinePack(b);
    await b.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion'));
    await b.offline(true);
    const offlineError = await offlineProof(b, probePath);
    await b.reload();
    await b.waitFor(applicationReady);
    await playFrench(b, B.tracks['fr/10'].url);
    assert(servedFromWorker(b, B.tracks['fr/10'].url));
    await b.click('main button', 'Pause');

    stage = 'mise à jour C refusée hors connexion puis installée en attente';
    await harness.serve(C);
    // The browser's update fetch is not governed by the page's CDP offline flag.
    // Drop only sockets owned by the disposable fixture server for this check.
    setReachable(false);
    try {
      await offlineProof(b, probePath);
      assert.equal(await b.evaluate(checkUpdate), false, 'le navigateur ne doit pas découvrir C quand son origine est inaccessible');
      assert.equal((await b.evaluate(workerState)).waiting, null);
      assert(requests.some(({ version, url, disconnected }) => version === 'C' && url.startsWith('/sw.js') && disconnected),
        'la coupure doit atteindre la vraie requête de mise à jour du worker');
    } finally {
      setReachable(true);
    }
    await b.offline(false);
    assert.equal(await b.evaluate(checkUpdate), true);
    await b.waitFor(workerWaiting);
    const waitingC = await browserWorker(observer, origin, 'installed');
    assert.equal((await b.evaluate(workerState)).revision, stateB.revision);
    assert.equal((await b.evaluate(audioSample)).src, origin + B.tracks['fr/10'].url);
    await b.click('main button', 'Écouter');
    assert.equal(await b.evaluate(() => Boolean(globalThis.__ddayFixtureLazyLoaded)), false);
    await b.close();

    stage = 'activation naturelle de C, catalogue et nouvel import différé';
    await browserWorker(observer, origin, 'activated', waitingC.versionId);
    const { tab: c, state: stateC } = await enter(browser, origin, 'C');
    tabs = [c];
    assert.notEqual(stateC.revision, stateB.revision);
    assert.equal(stateC.waiting, null);
    assert.equal(await c.evaluate(() => Boolean(globalThis.__ddayFixtureLazyLoaded)), false);
    await openOfflinePack(c);
    const partial = await c.waitFor(() => document.querySelector('.offline-manager').innerText.includes('1/2 commentaires téléchargés'));
    assert(partial);
    assert.equal(await c.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion')), false);
    await c.click('.offline-manager button', 'Compléter le téléchargement');
    await c.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion'));
    const currentPack = await c.evaluate(readFrenchPack);
    assert.deepEqual(currentPack.audio.map(({ url }) => url).sort(), [A.tracks['fr/10'].url, C.tracks['fr/10'].url, C.tracks['fr/11'].url].sort());
    assert(oldPack.entries.every((key) => currentPack.entries.includes(key)));
    assert.deepEqual(currentPack.audio.find(({ url }) => url === A.tracks['fr/10'].url), oldPack.audio.find(({ url }) => url === A.tracks['fr/10'].url));

    await c.offline(true);
    await offlineProof(c, probePath);
    const decoded = await playFrench(c, C.tracks['fr/10'].url);
    assert(decoded.decoded > 0);
    assert(servedFromWorker(c, C.tracks['fr/10'].url));
    await c.waitFor(() => globalThis.__ddayFixtureLazyLoaded === true);
    const lazy = c.events.find(({ type, data }) => type === 'Network.responseReceived' && /dday-fixture-lazy[^/]*\.js$/.test(data.response.url));
    assert(lazy?.data.response.fromServiceWorker, 'l’import indispensable provient du worker hors connexion');
    const beforeCrash = await until(async () => {
      const value = await c.evaluate(checkpoint);
      return value?.id === '10' && value.audioIdentity === C.tracks['fr/10'].sha256 && value.positionSeconds > 0 && value;
    }, 'Une position du nouveau média a été persistée avant la fermeture brutale');

    stage = 'crash du renderer jetable et récupération hors connexion';
    void c.send('Page.crash').catch(() => {});
    await until(() => c.events.some(({ type }) => type === 'Inspector.targetCrashed'), 'Chrome doit confirmer le crash du seul onglet de fixture');
    await c.close();
    const { tab: recovered } = await enter(browser, origin, 'C', { offline: true });
    tabs = [recovered];
    assert.deepEqual(await recovered.evaluate(readFrenchPack), currentPack);
    assert.equal((await recovered.evaluate(checkpoint)).audioIdentity, beforeCrash.audioIdentity);
    assert((await recovered.evaluate(checkpoint)).positionSeconds >= beforeCrash.positionSeconds - 0.1);
    const previousPosition = (await recovered.evaluate(checkpoint)).positionSeconds;
    await recovered.click('main button', await recovered.waitFor(() => Array.from(document.querySelectorAll('main button'))
      .map((button) => button.getAttribute('aria-label') || button.innerText).find((label) => label.includes('Continuer l’écoute'))));
    await until(async () => {
      const sample = await recovered.evaluate(audioSample);
      return sample?.src.endsWith(C.tracks['fr/10'].url) && !sample.paused && sample.time >= previousPosition;
    }, 'La reprise repart de la position du média C après le crash');
    await recovered.click('main button', 'Pause');
    await recovered.click('nav button', 'Accueil');
    await recovered.waitFor(applicationReady);

    stage = 'précache de C incomplet et pack média conservé';
    const removed = await recovered.evaluate(async (url) => {
      const cache = await caches.open(`workbox-precache-v2-${location.origin}/`);
      return cache.delete(url);
    }, lazy.data.response.url);
    assert.equal(removed, true);
    await openOfflinePack(recovered);
    await recovered.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Fichiers téléchargés et vérifiés'));
    assert.equal(await recovered.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion')), false);
    assert.deepEqual((await recovered.evaluate(readFrenchPack)).audio, currentPack.audio);
    context.diagnostic(`${browser.product}; A/B/C distinctes et contrôlées; B en attente durant FR + EN; ${offlineError}; C différée, 206, décodage ${decoded.decoded} octets, ancienne et nouvelle URL conservées; reprise après crash; badge retiré pour seul chunk manquant.`);
  } catch (error) {
    const recent = tabs.flatMap((tab) => tab.events.filter(({ type }) => type === 'Network.loadingFailed' || type === 'Runtime.exceptionThrown').slice(-4));
    const lifecycle = observer?.events.filter(({ type }) => type === 'ServiceWorker.workerVersionUpdated').slice(-8)
      .flatMap(({ data }) => data.versions.map(({ versionId, status, controlledClients }) => ({ versionId, status, controlledClients })));
    context.diagnostic(JSON.stringify({ stage, recent, lifecycle }));
    throw error;
  } finally {
    await harness.close();
  }
});
