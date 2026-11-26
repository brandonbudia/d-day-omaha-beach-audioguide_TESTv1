import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { audioSample, recordAudio } from './offline-scenario.mjs';

const usesViewport = (tab, width, height) => tab.send('Emulation.setDeviceMetricsOverride', {
  width, height, deviceScaleFactor: 1, mobile: false,
});

async function assertFits(tab, description) {
  const view = await tab.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    transport: document.querySelector('.player-transport')?.scrollWidth,
    transportWidth: document.querySelector('.player-transport')?.clientWidth,
  }));
  assert.equal(view.document, view.viewport, description);
  if (view.transport !== undefined) assert(view.transport <= view.transportWidth + 1, description);
}

test('the seven languages and the museum visit remain navigable with a compact dock', async (context) => {
  const harness = await createHarness();
  let stage = 'initial render';
  try {
    const build = await harness.build('museum-visit');
    await harness.serve(build);
    const browser = await harness.openBrowser({ install: recordAudio });
    const tab = await browser.openTab();
    await tab.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await usesViewport(tab, 320, 740);
    await tab.navigate('/?hl=fr');
    await tab.waitFor(() => Boolean(document.querySelector('.museum-start-visit')));

    const reachable = await tab.evaluate(() => {
      const start = document.querySelector('.museum-start-visit').getBoundingClientRect();
      const dock = document.querySelector('.museum-mini-player').getBoundingClientRect();
      return { startBottom: Math.round(start.bottom), dockTop: Math.round(dock.top) };
    });
    assert(reachable.startBottom < reachable.dockTop, 'The first action is visible with no scrolling.');
    assert.equal(await tab.evaluate(() => Boolean(document.querySelector('.museum-mini-player-range'))), false);

    await tab.click('.museum-header-controls button:nth-of-type(1)');
    await tab.click('.museum-header-controls button:nth-of-type(2)');
    await tab.click('.museum-header-controls button:nth-of-type(3)');
    await tab.waitFor(() => ['light-mode', 'high-contrast', 'large-text'].every(name => document.documentElement.classList.contains(name)));
    for (const language of ['en', 'de', 'it', 'pl', 'nl', 'es', 'fr']) {
      stage = `language ${language}`;
      const selector = `.museum-language-button[lang="${language}"]`;
      await tab.evaluate((target) => { document.querySelector(target).focus(); }, selector);
      await tab.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
      await tab.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await tab.waitFor((code, target) => document.documentElement.lang === code &&
        document.querySelector(target)?.getAttribute('aria-pressed') === 'true', language, selector);
      await assertFits(tab, `320px, texte agrandi, contraste renforcé, interface ${language}`);
    }

    stage = 'tour, search and favorite';
    await usesViewport(tab, 390, 844);
    await tab.click('.museum-start-visit');
    await tab.waitFor(() => document.querySelectorAll('main a[href^="/stop/"]').length === 22);
    await tab.click('input[type=search]');
    await tab.send('Input.insertText', { text: '10' });
    await tab.waitFor(() => document.querySelectorAll('main a[href^="/stop/"]').length === 1);
    await tab.click('main a[href^="/stop/10"]');
    await tab.waitFor(() => location.pathname === '/stop/10');
    await tab.click('.museum-piece-bookmark');
    await tab.waitFor(() => document.querySelector('.museum-piece-bookmark')?.getAttribute('aria-pressed') === 'true');

    stage = 'gallery and focus restoration';
    await tab.click('.museum-piece-cover-open');
    await tab.waitFor(() => Boolean(document.querySelector('.museum-photo-viewer[open]')));
    await tab.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await tab.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await tab.waitFor(() => !document.querySelector('.museum-photo-viewer[open]') && document.activeElement?.matches('.museum-piece-cover-open'));

    stage = 'playback and transcript in landscape';
    await tab.click('.museum-piece-listen');
    await tab.waitFor(() => Boolean(document.querySelector('.synced-transcript .transcript-word[aria-current="true"]')));
    await tab.waitFor(() => window.__ddayFixtureAudio?.some(audio => audio.currentTime > .25 && !audio.paused));
    await usesViewport(tab, 740, 390);
    await assertFits(tab, '740px paysage et texte agrandi');
    const decoded = await tab.evaluate(audioSample);
    assert.equal(decoded.error, null);
    assert(decoded.decoded > 0);

    stage = 'navigation with the mini-player';
    await tab.click('.museum-nav-button:nth-child(2)');
    await tab.waitFor(() => location.pathname === '/parcours' && Boolean(document.querySelector('.museum-mini-player-range')));
    await tab.click('main button', 'Favoris');
    await tab.waitFor(() => document.querySelectorAll('main a[href^="/stop/"]').length === 1);
    assert.match(await tab.evaluate(() => document.querySelector('main a[href^="/stop/"]').pathname), /10$/);
    await tab.click('.museum-mini-player-open');
    await tab.waitFor(() => location.pathname === '/player' && new URL(location.href).searchParams.get('stop') === '10');
    assert.equal((await tab.evaluate(audioSample)).src, decoded.src);
    await tab.click('.player-play-button', 'Pause');
    context.diagnostic(`${browser.product}; 7 langues à 320px, texte agrandi et contraste, galerie Échap, recherche exacte, favori, transcription et retour du mini-lecteur.`);
  } catch (error) {
    context.diagnostic(stage);
    throw error;
  } finally {
    await harness.close();
  }
});
