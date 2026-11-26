import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { recordAudio } from './offline-scenario.mjs';

const shortcut = '.player-reading-toolbar > .player-speed-button';
const slider = '.player-rate-adjust input';

async function press(tab, key, code) {
  await tab.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code: key, windowsVirtualKeyCode: code });
  await tab.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code });
}

async function waitForSpeed(tab, rate) {
  await tab.waitFor((rate, selector, control) => {
    const audio = window.__ddayFixtureAudio[0];
    return audio?.playbackRate === rate && document.querySelector(selector)?.valueAsNumber === Math.round(rate * 100) &&
      document.querySelector(control)?.querySelector('strong')?.textContent === `${rate}×`;
  }, rate, slider, shortcut);
}

test('the speed shortcut stays in its toolbar and shares playback, settings and mini-player speed', async (context) => {
  const harness = await createHarness();
  try {
    await harness.serve(await harness.build('speed'));
    const browser = await harness.openBrowser({ install: recordAudio });
    const tab = await browser.openTab();
    await tab.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await tab.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await tab.navigate('/player?stop=10&hl=fr');
    await tab.waitFor(() => window.__ddayFixtureAudio[0]?.readyState >= 1);
    assert.deepEqual(await tab.evaluate((selector) => {
      const button = document.querySelector(selector);
      return { previous: button.previousElementSibling.classList.contains('player-view-toggle'),
        next: button.nextElementSibling.classList.contains('player-text-size'),
        touchTarget: button.getBoundingClientRect().height >= 44 };
    }, shortcut), { previous: true, next: true, touchTarget: true });
    for (const rate of [1.25, 0.8, 1]) {
      await tab.click(shortcut);
      await waitForSpeed(tab, rate);
    }
    await tab.click('.player-settings-button');
    await tab.waitFor(() => Boolean(document.querySelector('.player-settings[open]')));
    assert.equal(await tab.evaluate((selector) => document.querySelector(selector).labels[0].textContent, slider), 'Vitesse');
    await tab.evaluate((selector) => { document.querySelector(selector).focus(); }, slider);
    await press(tab, 'Home', 36);
    await waitForSpeed(tab, 0.5);
    assert.equal(await tab.evaluate(() => document.querySelector('.player-rate-adjust button:first-child').disabled), true);
    await press(tab, 'ArrowRight', 39);
    await waitForSpeed(tab, 0.55);
    await press(tab, 'End', 35);
    await waitForSpeed(tab, 3);
    assert.equal(await tab.evaluate(() => document.querySelector('.player-rate-adjust button:last-child').disabled), true);
    await tab.click('.player-rate-adjust button:first-child');
    await waitForSpeed(tab, 2.95);
    await tab.click('.player-rate-reset');
    await waitForSpeed(tab, 1);
    await tab.click('.player-rate-presets button:nth-child(2)');
    await press(tab, 'Escape', 27);
    await tab.waitFor(() => document.activeElement?.matches('.player-settings-button'));
    await tab.click('.player-play-button');
    const before = await tab.waitFor(() => {
      const audio = window.__ddayFixtureAudio[0];
      return audio.currentTime > 0.5 && !audio.paused && { time: audio.currentTime, src: audio.currentSrc };
    });
    await tab.click('.player-settings-button');
    await tab.click('.player-rate-adjust button:last-child');
    await tab.click('.player-rate-adjust button:last-child');
    await waitForSpeed(tab, 1.35);
    await tab.waitFor(({ time, src }) => {
      const audio = window.__ddayFixtureAudio[0];
      return !audio.paused && audio.currentTime > time && audio.currentSrc === src && audio.preservesPitch &&
        Boolean(document.querySelector('.transcript-word[aria-current="true"]'));
    }, before);
    await tab.evaluate((selector) => { document.querySelector(selector).focus(); }, slider);
    for (const [key, code, rate] of [['Home', 36, 0.5], ['End', 35, 3]]) {
      const time = await tab.evaluate(() => window.__ddayFixtureAudio[0].currentTime);
      await press(tab, key, code);
      await waitForSpeed(tab, rate);
      await tab.waitFor((previousTime) => {
        const audio = window.__ddayFixtureAudio[0];
        return !audio.paused && audio.currentTime > previousTime + 0.1 && audio.webkitAudioDecodedByteCount > 0;
      }, time);
    }
    await tab.click('.player-rate-presets button:nth-child(2)');
    await tab.click('.player-rate-adjust button:last-child');
    await tab.click('.player-rate-adjust button:last-child');
    await waitForSpeed(tab, 1.35);
    await press(tab, 'Escape', 27);
    await tab.click('.museum-nav-button:first-child');
    await tab.waitFor(() => document.querySelector('.museum-mini-player-speed')?.textContent.includes('1.35×'));
    await tab.click('.museum-mini-player-open');
    await waitForSpeed(tab, 1.35);
    await tab.click(shortcut);
    await waitForSpeed(tab, 1);
    await tab.click('.player-play-button', 'Pause');
    await tab.click('.museum-header-controls button:nth-of-type(3)');
    await tab.waitFor(() => document.documentElement.classList.contains('large-text'));
    await tab.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
    for (const language of ['fr', 'en', 'de', 'it', 'pl', 'nl', 'es']) {
      await tab.navigate(`/player?stop=10&hl=${language}`);
      await tab.waitFor((language) => document.documentElement.lang === language, language);
      await tab.click('.player-settings-button');
      const rendered = await tab.waitFor((selector) => {
        const input = document.querySelector(selector);
        const dialog = input?.closest('dialog');
        return dialog?.open && { label: input.labels[0]?.textContent, width: dialog.clientWidth,
          content: dialog.scrollWidth, targetHeight: input.getBoundingClientRect().height,
          valueText: input.getAttribute('aria-valuetext') };
      }, slider);
      assert(rendered.label && rendered.valueText?.includes('×'), language);
      assert(rendered.content <= rendered.width + 1 && rendered.targetHeight >= 44, language);
    }
    context.diagnostic(`${browser.product}; raccourci et cycle conservés, 0,50–3,00× natif, changements en lecture et 7 langues à 320 px.`);
  } finally {
    await harness.close();
  }
});
