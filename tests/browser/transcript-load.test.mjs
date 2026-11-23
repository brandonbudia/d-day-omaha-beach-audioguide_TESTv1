// A language's first page-level import must still work when the origin is unreachable.
// Run with installed Chrome: node --test tests/browser/transcript-load.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { offlineProof, recordAudio } from './offline-scenario.mjs';

test('a fresh English transcript is loaded from the worker after disconnecting the fixture origin', async (context) => {
  const harness = await createHarness();
  let tab;
  try {
    const build = await harness.build('transcript');
    const { origin, probePath, setReachable } = await harness.serve(build);
    const browser = await harness.openBrowser({ install: recordAudio });
    tab = await browser.openTab();
    await tab.navigate('/?hl=en');
    await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await tab.reload();
    await tab.waitFor(() => document.documentElement.lang === 'en' && navigator.serviceWorker.controller?.state === 'activated');
    await tab.click('.offline-manager summary');
    await tab.click('.offline-manager button', 'Download this language');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Ready offline'));

    const englishCorpus = (url) => /\/assets\/transcripts-en-[^/]+\.js$/.test(url);
    assert.equal(tab.events.some(({ type, data }) => type === 'Network.requestWillBeSent' && englishCorpus(data.request.url)),
      false, 'Opening the pack panel must not request the English corpus in the page.');
    await tab.offline(true);
    const disconnected = await offlineProof(tab, probePath);
    setReachable(false);
    const beforeReload = await tab.evaluate(() => performance.timeOrigin);
    const networkMark = tab.events.length;
    await tab.reload();
    await tab.waitFor((before) => performance.timeOrigin !== before && !navigator.onLine &&
      document.documentElement.lang === 'en' && navigator.serviceWorker.controller?.state === 'activated' &&
      Boolean(document.querySelector('.museum-start-visit')), beforeReload);
    await tab.click('.museum-start-visit');
    await tab.click('a[href^="/stop/10"]');
    await tab.waitFor(() => location.pathname === '/stop/10');
    await tab.click('.museum-piece-listen');
    await tab.waitFor(() => location.pathname === '/player' && Boolean(document.querySelector('.player-page')));
    if (await tab.evaluate(() => document.querySelector('.player-view-toggle')?.getAttribute('aria-expanded') === 'false')) {
      await tab.click('.player-view-toggle');
    }
    await tab.waitFor(() => Boolean(document.querySelector('.synced-transcript[lang="en"] button.transcript-word')));
    const audio = await tab.waitFor(() => {
      const sample = window.__ddayFixtureAudio.find((item) => item.currentSrc.includes('/audio/en/stop-10.mp3'));
      return sample && !sample.paused && sample.webkitAudioDecodedByteCount > 0 &&
        { url: sample.currentSrc, bytes: sample.webkitAudioDecodedByteCount };
    });
    assert.equal(audio.url, origin + build.tracks['en/10'].url);
    assert(tab.events.slice(networkMark).some(({ type, data }) => type === 'Network.responseReceived' &&
      englishCorpus(data.response.url) && data.response.status === 200 && data.response.fromServiceWorker),
      'The first English corpus response must come from the active worker.');
    assert(tab.events.some(({ type, data }) => type === 'Network.responseReceived' &&
      data.response.url === audio.url && data.response.status === 206 && data.response.fromServiceWorker));
    context.diagnostic(browser.product + '; ' + disconnected + '; nouvel import EN via SW, synchronisation mot par mot et ' +
      audio.bytes + ' octets audio décodés.');
  } catch (error) {
    const page = await tab?.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang,
      text: document.querySelector('main')?.innerText.slice(0, 300), notices: [...document.querySelectorAll('main [role="status"]')].map(node => node.innerText) })).catch(() => null);
    const responses = tab?.events.filter(({ type, data }) => type === 'Network.responseReceived' &&
      /(?:assets\/.*\.js|stop-10\.mp3)/.test(data.response.url)).map(({ data }) => ({
      name: data.response.url.split('/').at(-1), status: data.response.status, worker: data.response.fromServiceWorker,
    })).slice(-14);
    context.diagnostic(JSON.stringify({ page, responses }));
    throw error;
  } finally {
    await harness.close();
  }
});
