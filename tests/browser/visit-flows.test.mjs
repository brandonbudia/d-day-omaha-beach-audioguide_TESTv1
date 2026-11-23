// Run with installed Chrome: node --test tests/browser/visit-flows.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { createHarness } from './harness.mjs';
import { audioSample, recordAudio } from './offline-scenario.mjs';

const visitorKey = 'dday_visitor_state_v2';

async function openStation10(tab, language) {
  await tab.click('.museum-start-visit');
  await tab.waitFor(() => location.pathname === '/parcours');
  await tab.click('a[href^="/stop/10"]');
  await tab.waitFor((language) => location.pathname === '/stop/10' && new URL(location.href).searchParams.get('hl') === language, language);
}

async function holdVisitorWrites(tab) {
  await tab.evaluate((name) => new Promise((acquired, reject) => {
    const gate = new Promise((release) => { window.__ddayFixtureReleaseVisitor = release; });
    navigator.locks.request(name, async () => { acquired(true); await gate; }).catch(reject);
  }), visitorKey);
  return () => tab.evaluate(() => window.__ddayFixtureReleaseVisitor());
}

test('FR10 playback and another tab’s favorite survive a full Chrome restart', async (context) => {
  const harness = await createHarness();
  let stage = 'fixture';
  let releaseVisitor;
  try {
    const build = await harness.build('visit-fr');
    const { origin } = await harness.serve(build);
    const browser = await harness.openBrowser({ install: recordAudio });
    const tour = await browser.openTab();
    await tour.navigate('/?hl=fr');
    stage = 'accueil et découverte FR10';
    await openStation10(tour, 'fr');
    await tour.click('.museum-piece-discovered');
    await tour.waitFor((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? 'null')?.pieces?.['10']?.discoveredAt), visitorKey);

    const favorite = await browser.openTab();
    await favorite.navigate('/stop/10?hl=fr');
    await favorite.waitFor(() => Boolean(document.querySelector('.museum-piece-bookmark')));
    releaseVisitor = await holdVisitorWrites(favorite);

    stage = 'lecture native et écritures concurrentes';
    await tour.click('.museum-piece-listen');
    const started = await tour.waitFor(() => {
      const audio = window.__ddayFixtureAudio.find((audio) => audio.currentSrc.includes('/audio/fr/stop-10.mp3'));
      return location.pathname === '/player' && audio && !audio.paused && audio.currentTime >= .6 &&
        audio.webkitAudioDecodedByteCount > 0 && { src: audio.currentSrc, time: audio.currentTime };
    });
    assert.equal(started.src, origin + build.tracks['fr/10'].url);
    await favorite.click('.museum-piece-bookmark');
    await favorite.waitFor(() => document.querySelector('.museum-piece-bookmark')?.getAttribute('aria-pressed') === 'true');
    await favorite.waitFor(async (name) => (await navigator.locks.query()).pending.filter((lock) => lock.name === name).length === 2, visitorKey);
    assert.equal(await favorite.evaluate((key) => JSON.parse(localStorage.getItem(key)).pieces['10'].favorite ?? null, visitorKey), null);
    await releaseVisitor();
    releaseVisitor = undefined;

    stage = 'pause, reprise et sauvegarde';
    await tour.click('.player-play-button', 'Pause');
    const paused = await tour.evaluate(audioSample);
    await delay(300);
    const stillPaused = await tour.evaluate(audioSample);
    assert.equal(stillPaused.paused, true);
    assert(Math.abs(stillPaused.time - paused.time) < .08);
    await tour.click('.player-play-button', 'Écouter');
    const resumed = await tour.waitFor((time) => {
      const audio = window.__ddayFixtureAudio.find((audio) => audio.currentSrc.includes('/audio/fr/stop-10.mp3'));
      return audio && !audio.paused && audio.currentTime > Math.max(1.2, time + .6) && { time: audio.currentTime };
    }, paused.time);
    await tour.click('.player-play-button', 'Pause');
    const finalPause = await tour.evaluate(audioSample);
    assert.equal(finalPause.paused, true);
    assert(finalPause.time >= resumed.time);
    const saved = await tour.waitFor((key, time) => {
      const state = JSON.parse(localStorage.getItem(key) ?? 'null');
      const piece = state?.pieces?.['10'];
      return state?.lastPlayback?.positionSeconds === time && piece?.favorite === true && Boolean(piece.discoveredAt) && state;
    }, visitorKey, finalPause.time);
    assert.equal(saved.version, 2);
    assert.equal(saved.lastPlayback.id, '10');
    assert.equal(saved.lastPlayback.language, 'fr');
    assert.equal(saved.lastPlayback.audioIdentity, build.tracks['fr/10'].sha256);
    assert(saved.pieces['10'].listening.fr.heardRanges.some(([from, to]) => to - from >= .6));
    assert.equal(saved.pieces['10'].listening.fr.completedAt, undefined);

    stage = 'redémarrage Chrome et visite persistée';
    await harness.closeBrowser();
    const reopenedBrowser = await harness.openBrowser({ install: recordAudio });
    const reopened = await reopenedBrowser.openTab();
    await reopened.navigate('/?hl=fr');
    await reopened.waitFor(() => Boolean(document.querySelector('.museum-resume-card')));
    const persisted = await reopened.evaluate((key) => JSON.parse(localStorage.getItem(key)), visitorKey);
    assert.deepEqual(persisted.lastPlayback, saved.lastPlayback);
    assert.equal(persisted.pieces['10'].favorite, true);
    assert.equal(persisted.pieces['10'].discoveredAt, saved.pieces['10'].discoveredAt);
    await reopened.click('.museum-start-visit');
    await reopened.waitFor(() => document.querySelector('main [role="progressbar"]')?.getAttribute('aria-valuenow') === '1');
    assert.equal(await reopened.evaluate(() => document.querySelector('main [role="progressbar"]')?.getAttribute('aria-valuemax')), '22');
    await reopened.click('main button', 'Favoris');
    await reopened.waitFor(() => document.querySelectorAll('main a[href^="/stop/"]').length === 1 && Boolean(document.querySelector('main a[href^="/stop/10"]')));

    await reopened.click('.museum-home-link');
    await reopened.click('.museum-resume-card');
    const restored = await reopened.waitFor((checkpoint) => {
      const audio = window.__ddayFixtureAudio.find((audio) => audio.currentSrc.includes('/audio/fr/stop-10.mp3'));
      return audio && !audio.paused && audio.currentTime >= checkpoint - .2 && { src: audio.currentSrc, time: audio.currentTime };
    }, persisted.lastPlayback.positionSeconds);
    assert.equal(restored.src, started.src);
    assert(restored.time < persisted.lastPlayback.positionSeconds + 1.5, 'La reprise doit se faire près de la position enregistrée.');
    await reopened.click('.player-play-button', 'Pause');
    context.diagnostic(`${browser.product}; FR10 à ${saved.lastPlayback.positionSeconds.toFixed(2)} s, 2 écritures en attente, favori et progression présents après redémarrage.`);
  } catch (error) {
    context.diagnostic(stage);
    throw error;
  } finally {
    try { await releaseVisitor?.(); }
    finally { await harness.close(); }
  }
});

test('choosing English selects EN10 and advances its synchronized transcript during native playback', async (context) => {
  const harness = await createHarness();
  try {
    const build = await harness.build('visit-en');
    const { origin } = await harness.serve(build);
    const browser = await harness.openBrowser({ install: recordAudio });
    const tab = await browser.openTab();
    await tab.navigate('/?hl=fr');
    await tab.click('.museum-language-button[lang="en"]', 'English (EN)');
    await tab.waitFor(() => document.documentElement.lang === 'en' &&
      document.querySelector('.museum-language-button[lang="en"][aria-label="English (EN)"]')?.getAttribute('aria-pressed') === 'true');
    await openStation10(tab, 'en');
    await tab.click('.museum-piece-listen');
    await tab.waitFor(() => location.pathname === '/player' && new URL(location.href).searchParams.get('hl') === 'en');

    const initial = await tab.waitFor(() => {
      const audio = window.__ddayFixtureAudio.find((audio) => audio.currentSrc.includes('/audio/en/stop-10.mp3'));
      const word = document.querySelector('.synced-transcript[lang="en"] .transcript-word[aria-current="true"]');
      return audio && word && !audio.paused && audio.webkitAudioDecodedByteCount > 0 &&
        { src: audio.currentSrc, time: audio.currentTime, word: word.textContent };
    });
    const advanced = await tab.waitFor(({ time, word: previous }) => {
      const audio = window.__ddayFixtureAudio.find((audio) => audio.currentSrc.includes('/audio/en/stop-10.mp3'));
      const word = document.querySelector('.synced-transcript[lang="en"] .transcript-word[aria-current="true"]');
      return audio && word && audio.currentTime > time + .2 && word.textContent !== previous &&
        { src: audio.currentSrc, time: audio.currentTime, word: word.textContent };
    }, initial);
    const expected = origin + build.tracks['en/10'].url;
    assert.equal(initial.src, expected);
    assert.equal(advanced.src, expected);
    assert(tab.events.some(({ type, data }) => type === 'Network.responseReceived' && data.response.url === expected &&
      [200, 206].includes(data.response.status)));
    await tab.click('.player-play-button', 'Pause');
    context.diagnostic(`${browser.product}; EN10 décodée, progression audio de ${initial.time.toFixed(2)} à ${advanced.time.toFixed(2)} s et changement du mot actif.`);
  } finally {
    await harness.close();
  }
});
