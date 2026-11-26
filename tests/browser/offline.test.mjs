// Run manually with Node 22+ and installed Chrome: node --test tests/browser/offline.test.mjs
// The test owns a temporary build, loopback port and Chrome profile. Audio
// decoding is observable. Physical sound and native PWA installation require a human.
import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { until } from './chrome.mjs';
import { createHarness } from './harness.mjs';
import { audioSample, offlineProof, readFrenchPack, recordAudio } from './offline-scenario.mjs';

test('fixture pack survives offline tour, native playback and a full Chrome restart', async (context) => {
  const harness = await createHarness();
  let tab;
  let stage = 'build isolé';
  try {
    const build = await harness.build('baseline');
    const { origin, probePath, requests } = await harness.serve(build);
    stage = 'chargement et activation';
    const browser = await harness.openBrowser({ install: recordAudio });
    tab = await browser.openTab();
    await tab.navigate();
    await tab.waitFor(() => document.readyState === 'complete' && Boolean(document.querySelector('main')));
    await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await tab.reload();
    const controller = await tab.waitFor(() => navigator.serviceWorker.controller?.state === 'activated' && navigator.serviceWorker.controller.scriptURL);
    assert.equal(controller, `${origin}/sw.js`);
    assert.equal(await tab.evaluate(() => isSecureContext), true);

    stage = 'téléchargement du pack de fixture';
    await tab.click('.offline-manager summary');
    await tab.click('.offline-manager button', 'Télécharger cette langue');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion'));
    const initial = await tab.evaluate(readFrenchPack);
    const expected = [build.tracks['fr/10'], build.tracks['fr/11']];
    assert.equal(initial.entries.length, build.shared + expected.length);
    assert.deepEqual(initial.audio, expected.map((track) => ({ ...track, header: track.sha256 })));

    stage = 'coupure et rechargement normal';
    await tab.offline(true);
    const firstFailure = await offlineProof(tab, probePath);
    await tab.reload();
    await tab.waitFor(() => document.readyState === 'complete' && !navigator.onLine && navigator.serviceWorker.controller?.state === 'activated');
    stage = 'parcours et deux stations';
    await tab.click('main button', 'Commencer la visite du musée');
    await tab.waitFor(() => location.pathname === '/parcours' && document.querySelectorAll('a[href^="/stop/"]').length === 22);
    await tab.click('a[href^="/stop/11"]');
    await tab.waitFor(() => location.pathname === '/stop/11');
    await tab.click('.museum-piece-navigation button[aria-label$=" 10"]');
    await tab.waitFor(() => location.pathname === '/stop/10');

    stage = 'lecture, pause et reprise';
    await tab.click('main button', 'Lancer la lecture');
    await tab.waitFor(() => new URLSearchParams(location.search).get('stop') === '10' && location.pathname === '/player');
    const played = await until(async () => {
      const sample = await tab.evaluate(audioSample);
      return sample?.time > 0.5 && !sample.paused && sample;
    }, 'FR10 doit avancer hors connexion');
    assert.equal(played.error, null);
    assert.equal(played.src, origin + expected[0].url);
    const media = tab.events.filter(({ type, data }) => type === 'Network.responseReceived' && data.response.url === played.src);
    assert(media.some(({ data }) => data.response.fromServiceWorker && data.response.status === 206));
    await tab.click('main button', 'Pause');
    const pause = await tab.evaluate(audioSample);
    await delay(500);
    const stable = await tab.evaluate(audioSample);
    assert.equal(stable.paused, true);
    assert(Math.abs(stable.time - pause.time) < 0.1);
    await tab.click('.player-settings-button');
    await tab.click('.player-rate-presets button', '2,00×');
    await tab.waitFor(() => window.__ddayFixtureAudio[0].playbackRate === 2);
    assert(Math.abs((await tab.evaluate(audioSample)).time - stable.time) < 0.1);
    await tab.click('.player-settings-heading button');
    await tab.click('main button', 'Écouter');
    const resumed = await until(async () => {
      const sample = await tab.evaluate(audioSample);
      return sample?.time > stable.time + 0.4 && !sample.paused && sample;
    }, 'FR10 doit reprendre hors connexion');
    assert(resumed.decoded > 0, 'Chrome doit avoir décodé des octets audio.');
    await tab.click('main button', 'Pause');
    await tab.click('nav button', 'Accueil');
    await tab.waitFor(() => location.pathname === '/');
    const errors = tab.events.filter(({ type, data }) => type === 'Runtime.exceptionThrown' ||
      (type === 'Network.responseReceived' && data.response.url.startsWith(origin) && data.response.status >= 400));
    assert.deepEqual(errors.map(({ type, data }) => ({ type, url: data.response?.url, status: data.response?.status, exception: data.exceptionDetails?.text })), []);
    const servedAudio = requests.filter(({ url }) => url?.startsWith('/audio/'));
    assert.deepEqual(servedAudio.map(({ url }) => new URL(url, origin).pathname).sort(), ['/audio/fr/stop-10.mp3', '/audio/fr/stop-11.mp3']);

    stage = 'redémarrage complet hors connexion';
    await harness.closeBrowser();
    tab = undefined;
    const restarted = await harness.openBrowser({ install: recordAudio });
    tab = await restarted.openTab();
    await tab.offline(true);
    await tab.navigate();
    await tab.waitFor(() => document.readyState === 'complete' && !navigator.onLine && navigator.serviceWorker.controller?.state === 'activated' && Boolean(document.querySelector('main')));
    const secondFailure = await offlineProof(tab, probePath);
    assert.deepEqual(await tab.evaluate(readFrenchPack), initial);
    await tab.navigate('/player?stop=10&hl=fr');
    await tab.waitFor(() => window.__ddayFixtureAudio[0].playbackRate === 2 &&
      document.querySelector('.player-speed-button strong')?.textContent === '2×');
    context.diagnostic(`${browser.product}; ${build.shared} ressources communes et ${initial.audio.length} MP3 vérifiés; ${firstFailure}/${secondFailure}; FR10 206 Service Worker, ${resumed.decoded} octets décodés; cache identique et vitesse 2× conservée après redémarrage.`);
  } catch (error) {
    const recent = tab?.events.filter(({ type }) => type === 'Network.loadingFailed' || type === 'Runtime.exceptionThrown').slice(-5);
    context.diagnostic(JSON.stringify({ stage, recent }));
    throw error;
  } finally {
    await harness.close();
  }
});
