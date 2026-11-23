// Run with installed Chrome: node --test tests/browser/recovery.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { offlineProof } from './offline-scenario.mjs';

test('a missing reader chunk leaves the tour and saved favorite available, and a reload can recover', async (context) => {
  const harness = await createHarness();
  try {
    const build = await harness.build('recovery');
    const { origin, probePath, setReachable } = await harness.serve(build);
    const browser = await harness.openBrowser();
    const tab = await browser.openTab();
    await tab.navigate();
    await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await tab.reload();
    await tab.waitFor(() => navigator.serviceWorker.controller?.state === 'activated' &&
      Boolean(document.querySelector('.museum-start-visit')));
    await tab.click('.museum-start-visit');
    await tab.click('a[href^="/stop/10"]');
    await tab.waitFor(() => location.pathname === '/stop/10');
    await tab.click('main button[aria-pressed]', 'Ajouter aux favoris');
    await tab.waitFor(() => Boolean(JSON.parse(localStorage.getItem('dday_visitor_state_v2') || '{}').pieces?.['10']?.favorite));

    // The fixture owns this precache. The real Chrome profile is never opened.
    const chunk = await tab.evaluate(async () => {
      const name = (await caches.keys()).find((candidate) => candidate.startsWith('workbox-precache-v2-'));
      const cache = await caches.open(name);
      const entry = (await cache.keys()).find((key) => new URL(key.url).pathname.includes('/assets/PlayerPage-'));
      return entry && await cache.delete(entry) ? new URL(entry.url).pathname : null;
    });
    assert(chunk);
    await tab.send('Network.setBlockedURLs', { urls: [origin + chunk] });
    await tab.offline(true);
    await offlineProof(tab, probePath);
    setReachable(false);
    await tab.click('.museum-piece-listen');
    await tab.waitFor(() => location.pathname === '/player' &&
      Boolean(document.querySelector('main [role="alert"]')?.innerText.includes('Le lecteur n’a pas pu se charger')));
    assert(await tab.evaluate(() => Boolean(document.querySelector('nav'))));
    await tab.click('main button', 'Revenir à la pièce 10');
    await tab.waitFor(() => location.pathname === '/stop/10' &&
      Boolean(document.querySelector('main button[aria-pressed="true"]')));
    assert(await tab.evaluate(() => Boolean(JSON.parse(localStorage.getItem('dday_visitor_state_v2') || '{}').pieces?.['10']?.favorite)));

    setReachable(true);
    await tab.offline(false);
    await tab.send('Network.setBlockedURLs', { urls: [] });
    const before = await tab.evaluate(() => performance.timeOrigin);
    await tab.reload();
    await tab.waitFor((previous) => previous !== performance.timeOrigin && location.pathname === '/stop/10' &&
      Boolean(document.querySelector('.museum-piece-listen')), before);
    await tab.click('.museum-piece-listen');
    await tab.waitFor(() => location.pathname === '/player' && Boolean(document.querySelector('.player-page')));
    context.diagnostic(browser.product + '; navigation et favori préservés malgré un import bloqué, lecteur retrouvé après rechargement normal.');
  } finally {
    await harness.close();
  }
});
