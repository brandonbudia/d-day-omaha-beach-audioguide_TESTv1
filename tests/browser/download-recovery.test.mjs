// Run with installed Chrome: node --test tests/browser/download-recovery.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { offlineProof, readFrenchPack } from './offline-scenario.mjs';

test('a refused network transfer reports the failure, then the ordinary retry verifies the pack', async (context) => {
  const harness = await createHarness();
  try {
    const build = await harness.build('download-recovery');
    const { probePath, requests, setReachable } = await harness.serve(build);
    const browser = await harness.openBrowser();
    const tab = await browser.openTab();
    await tab.navigate();
    await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await tab.reload();
    await tab.waitFor(() => navigator.serviceWorker.controller?.state === 'activated' &&
      Boolean(document.querySelector('.offline-manager summary')));
    await tab.click('.offline-manager summary');
    await tab.offline(true);
    await offlineProof(tab, probePath);
    setReachable(false);
    await tab.click('.offline-manager button', 'Télécharger cette langue');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Téléchargement interrompu'));
    assert.equal(await tab.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion')), false);
    assert.equal((await tab.evaluate(readFrenchPack)).entries.length, 0);

    setReachable(true);
    await tab.offline(false);
    await tab.click('.offline-manager button', 'Télécharger cette langue');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion'));
    const cached = await tab.evaluate(readFrenchPack);
    assert.deepEqual(cached.audio, [build.tracks['fr/10'], build.tracks['fr/11']].map((track) => ({ ...track, header: track.sha256 })));
    assert.equal(cached.entries.length, build.shared + 2);
    assert(requests.some(({ url, status }) => url.includes('__dday_download=1') && status === 200));
    assert.equal(await tab.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Téléchargement interrompu')), false);
    context.diagnostic(browser.product + '; erreur réseau annoncée, puis 27 ressources après relance normale et contrôle SHA des deux pistes.');
  } finally {
    await harness.close();
  }
});
