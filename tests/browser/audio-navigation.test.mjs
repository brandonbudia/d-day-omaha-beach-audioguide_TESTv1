// Run with installed Chrome: node --test tests/browser/audio-navigation.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';

function holdFirstStart() {
  const audioElements = [];
  window.__ddayAudioNavigation = { audioElements, release: null, homeAction: null };
  window.Audio = new Proxy(window.Audio, {
    construct(Original, args) {
      const audio = Reflect.construct(Original, args);
      audioElements.push(audio);
      return audio;
    },
  });
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!window.__ddayAudioNavigation.release && (this.currentSrc || this.src).includes('/audio/fr/stop-10.mp3')) {
      return new Promise((resolve, reject) => {
        window.__ddayAudioNavigation.release = () => nativePlay.call(this).then(resolve, reject);
      });
    }
    return nativePlay.call(this);
  };
}

test('home and the persistent player keep an in-flight start, then reopen the same playing media', async (context) => {
  const harness = await createHarness();
  try {
    const build = await harness.build('audio-navigation');
    await harness.serve(build);
    const browser = await harness.openBrowser({ install: holdFirstStart });
    const tab = await browser.openTab();
    await tab.navigate('/player?stop=10&hl=fr');
    await tab.waitFor(() => Boolean(document.querySelector('.player-page')));
    await tab.click('.player-play-button');
    await tab.waitFor(() => Boolean(window.__ddayAudioNavigation.release));
    const timeOrigin = await tab.evaluate(() => performance.timeOrigin);

    await tab.click('.museum-home-link');
    await tab.waitFor(() => location.pathname === '/' && Boolean(document.querySelector('.museum-start-visit')) &&
      Boolean(document.querySelector('.museum-mini-player [role="status"]')));
    await tab.evaluate(() => { window.__ddayAudioNavigation.homeAction = document.querySelector('.museum-start-visit'); });
    await tab.click('.museum-home-link');
    const home = await tab.waitFor((before) => {
      if (performance.timeOrigin !== before) return 'reloaded';
      const nextHomeAction = document.querySelector('.museum-start-visit');
      return nextHomeAction && nextHomeAction !== window.__ddayAudioNavigation.homeAction && 'refreshed';
    }, timeOrigin);
    assert.equal(home, 'refreshed', 'a pending start must keep its original browser document');

    await tab.evaluate(() => { void window.__ddayAudioNavigation.release(); });
    const initial = await tab.waitFor(() => {
      const audio = window.__ddayAudioNavigation.audioElements[0];
      return audio && !audio.paused && audio.currentTime > 0 && audio.webkitAudioDecodedByteCount > 0 &&
        { time: audio.currentTime, bytes: audio.webkitAudioDecodedByteCount };
    });
    await tab.click('.museum-mini-player-open');
    const reopened = await tab.waitFor((time) => {
      const audio = window.__ddayAudioNavigation.audioElements[0];
      return location.pathname === '/player' && Boolean(document.querySelector('.player-page')) && audio && !audio.paused && audio.currentTime > time &&
        { count: window.__ddayAudioNavigation.audioElements.length, path: new URL(audio.currentSrc).pathname };
    }, initial.time);
    assert.deepEqual(reopened, { count: 1, path: '/audio/fr/stop-10.mp3' });
    assert.equal(await tab.evaluate(() => performance.timeOrigin), timeOrigin);
    context.diagnostic(`${browser.product}, navigation continue, ${initial.bytes} octets audio décodés.`);
  } finally {
    await harness.close();
  }
});
