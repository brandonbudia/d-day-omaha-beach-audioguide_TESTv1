// Run with installed Chrome: node --test tests/browser/download-recovery.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { until } from './chrome.mjs';
import { createHarness } from './harness.mjs';
import { offlineProof, readFrenchPack } from './offline-scenario.mjs';

test('the offline panel reports a refused transfer, then resumes a cancelled partial pack', async (context) => {
  const harness = await createHarness();
  try {
    const build = await harness.build('download-recovery');
    const { holdDownload, probePath, requests, setReachable } = await harness.serve(build);
    const browser = await harness.openBrowser();
    const tab = await browser.openTab();
    await tab.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: false });
    await tab.navigate();
    await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await tab.reload();
    await tab.waitFor(() => navigator.serviceWorker.controller?.state === 'activated' &&
      Boolean(document.querySelector('.offline-manager summary')));
    await tab.click('.offline-manager summary');
    assert(await tab.evaluate(() => {
      const panel = document.querySelector('.offline-manager');
      const actions = Array.from(panel.querySelectorAll('.offline-actions button'));
      return panel.innerText.includes('Langue du pack') && panel.innerText.includes('Taille du pack') &&
        document.documentElement.scrollWidth <= 361 && actions.every((button) => button.getBoundingClientRect().height >= 44);
    }));
    await tab.offline(true);
    await offlineProof(tab, probePath);
    setReachable(false);
    await tab.click('.offline-manager button', 'Télécharger cette langue');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Téléchargement interrompu'));
    assert.equal(await tab.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion')), false);
    assert.equal((await tab.evaluate(readFrenchPack)).entries.length, 0);

    setReachable(true);
    await tab.offline(false);
    const release = holdDownload('/audio/fr/stop-11.mp3');
    await tab.click('.offline-manager button', 'Télécharger cette langue');
    await until(() => requests.some(({ url, held }) => held && url.startsWith('/audio/fr/stop-11.mp3?')), 'Le transfert FR11 doit rester en attente');
    await tab.waitFor(() => {
      const panel = document.querySelector('.offline-manager');
      const progress = panel.querySelector('progress');
      return panel.innerText.includes('1/2 commentaires téléchargés') && progress.value > 0 && progress.value < progress.max;
    });
    await tab.click('.offline-manager button', 'Arrêter le téléchargement');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Pack incomplet'));
    release();
    const partial = await tab.evaluate(readFrenchPack);
    assert.deepEqual(partial.audio, [{ ...build.tracks['fr/10'], header: build.tracks['fr/10'].sha256 }]);
    assert.equal(await tab.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion')), false);

    await tab.click('.offline-manager button', 'Compléter le téléchargement');
    await tab.waitFor(() => document.querySelector('.offline-manager').innerText.includes('Visite prête hors connexion'));
    const cached = await tab.evaluate(readFrenchPack);
    assert.deepEqual(cached.audio, [build.tracks['fr/10'], build.tracks['fr/11']].map((track) => ({ ...track, header: track.sha256 })));
    assert.equal(cached.entries.length, build.shared + 2);
    assert(requests.some(({ url, status }) => url.includes('__dday_download=1') && status === 200));
    assert.equal(requests.filter(({ url, status }) => url.startsWith('/audio/fr/stop-10.mp3?') && status === 200).length, 1);
    assert.equal(await tab.evaluate(() => document.querySelector('.offline-manager').innerText.includes('Téléchargement interrompu')), false);
    context.diagnostic(browser.product + '; 360 px, erreur réseau annoncée, FR10 conservée après annulation et 27 ressources vérifiées après reprise.');
  } finally {
    await harness.close();
  }
});
