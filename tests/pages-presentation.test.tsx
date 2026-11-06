import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { STOPS } from '../src/data/stops';
import { StopDetailPage } from '../src/pages/StopDetailPage';
import { ParcoursPage } from '../src/pages/ParcoursPage';
import { WelcomePage } from '../src/pages/WelcomePage';
import { visitorStore } from '../src/visit/visitorStore';
import { getMediaResource } from '../src/data/mediaCatalog';
import { formatTime } from '../src/audio/formatTime';
import { PlayerPage } from '../src/pages/PlayerPage';
import { audioPlayer } from '../src/audio/audioStore';
import { LANGUAGES } from '../src/i18n/translations';
import { experienceText } from '../src/i18n/experienceLabels';

const noop = () => {};
const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

test('all 22 piece pages expose one launch action and keep narrative, photos, plan and navigation', () => {
  for (const [index, stop] of STOPS.entries()) {
    const html = renderToStaticMarkup(<StopDetailPage stopId={stop.id} onNavigateStop={noop} onOpenPlayer={noop} currentLang="fr" />);
    assert.ok(html.includes(escapeText(stop.title)), stop.id);
    assert.ok(html.includes(escapeText(stop.operationalContext)), stop.id);
    assert.equal((html.match(/Lancer la lecture/g) ?? []).length, 1, stop.id);
    assert.ok(html.includes(`Photos (${stop.photos.length})`), stop.id);
    assert.match(html, /Plan de salle/);
    assert.match(html, /Ajouter aux favoris/);
    assert.doesNotMatch(html, /Transcription|replay_10|forward_10/);
    if (index > 0) assert.ok(html.includes(`Aller à la pièce ${STOPS[index - 1].number}`));
    if (index < STOPS.length - 1) assert.ok(html.includes(`Aller à la pièce ${STOPS[index + 1].number}`));
  }
});

test('tour counts discoveries from the shared visitor state, never consultations or catalogue demo statuses', () => {
  const render = () => renderToStaticMarkup(<ParcoursPage onSelectStopDetail={noop} onOpenPlayer={noop} currentLang="fr" />);
  visitorStore.recordConsulted('02');
  assert.match(render(), /0 \/ 22 pièces découvertes · 0 %/);
  visitorStore.markDiscovered('02');
  const html = render();
  assert.match(html, /1 \/ 22 pièces découvertes · 5 %/);
  assert.equal((html.match(/role="progressbar"/g) ?? []).length, 1);
  assert.match(html, /aria-valuenow="1"/);
  assert.match(html, /aria-valuemax="22"/);
  assert.match(html, /Rechercher une station/);
  assert.equal((html.match(/<h2/g) ?? []).length, 22);
  for (const stop of STOPS) {
    assert.ok(html.includes(`href="/stop/${stop.id}"`), stop.id);
    const media = getMediaResource(stop.id, 'fr');
    if (media.status === 'ready') assert.ok(html.includes(formatTime(media.durationSeconds)), stop.id);
  }
  assert.doesNotMatch(html, /material-symbols|animate-ping|>lock</);
});

test('home keeps its welcome, seven languages and tour action without the redundant tools block', () => {
  const html = renderToStaticMarkup(<WelcomePage onStartTour={noop} currentLang="fr" onLanguageChange={noop} />);
  assert.match(html, /D-DAY OMAHA/);
  assert.match(html, /Commencer la visite du musée/);
  for (const name of ['Français (FR)', 'English (EN)', 'Deutsch (DE)', 'Nederlands (NL)', 'Español (ES)', 'Italiano (IT)', 'Polski (PL)']) {
    assert.ok(html.includes(name), name);
  }
  assert.doesNotMatch(html, /PARCOURS DU MUSÉE|Visite Intérieure|Agrandir le texte/);
});

test('unavailable recordings expose full French text with disabled audio; other languages never reuse French word timings', () => {
  audioPlayer.setLanguage('fr');
  audioPlayer.setStop('22', false);
  const missing = renderToStaticMarkup(<PlayerPage currentLang="fr" onSelectStopDetail={noop} />);
  assert.match(missing, /Cette vitrine est dédiée/);
  assert.match(missing, /pas encore disponible/);
  assert.match(missing, /class="player-play-button" disabled=""/);
  assert.doesNotMatch(missing, /class="transcript-word"/);
  audioPlayer.setStop('01', false);
  audioPlayer.setLanguage('en');
  const english = renderToStaticMarkup(<PlayerPage currentLang="en" onSelectStopDetail={noop} />);
  assert.match(english, /spoken language.*still need review/);
  assert.match(english, /French reference text/);
  assert.match(english, /lang="fr"/);
  assert.doesNotMatch(english, /class="transcript-word"/);
  audioPlayer.setLanguage('fr');
});

test('new visitor instructions provide explicit nonempty interface text in all seven languages', () => {
  for (const {code} of LANGUAGES) {
    for (const key of ['resumeAudio', 'progress', 'helpOffline', 'unavailable', 'frenchReference', 'installHelp'] as const) {
      const text = experienceText(key, code, {number: '01', time:'00:12', count:1, total:22, percent:5});
      assert.ok(text.length > 5, `${code}/${key}`);
      assert.doesNotMatch(text, /\{(?:number|time|count|total|percent)\}/);
    }
  }
});
