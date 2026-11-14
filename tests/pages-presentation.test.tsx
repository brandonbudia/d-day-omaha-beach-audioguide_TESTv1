import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { STOPS } from '../src/data/stops';
import { StopDetailPage } from '../src/pages/StopDetailPage';
import { ParcoursPage, matchesStopSearch } from '../src/pages/ParcoursPage';
import { WelcomePage } from '../src/pages/WelcomePage';
import { visitorStore } from '../src/visit/visitorStore';
import { getMediaResource } from '../src/data/mediaCatalog';
import { formatTime } from '../src/audio/formatTime';
import { PlayerPage } from '../src/pages/PlayerPage';
import { audioPlayer } from '../src/audio/audioStore';
import { LANGUAGES } from '../src/i18n/translations';
import { experienceText } from '../src/i18n/experienceLabels';
import { LanguageSelector } from '../src/components/LanguageSelector';
import { PhotoViewer } from '../src/components/PhotoViewer';
import { PersistentPlayerBar } from '../src/components/PersistentPlayerBar';
import { detailLabel, visualLabel } from '../src/i18n/visualLabels';
import { getStopLabel } from '../src/data/stopLabels';
import { OfflineManager } from '../src/components/OfflineManager';
import { offlineStore } from '../src/offline/offlineStore';
import App from '../src/App';

const noop = () => {};
const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

test('the home page offers only a usable listening or exhibit resume action', (context) => {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { documentElement: { classList: { contains: () => false } } },
  });
  try {
    const recording = getMediaResource('02', 'fr');
    const snapshot = {
      ...visitorStore.getSnapshot(),
      lastConsultedId: undefined as string | undefined,
      lastPlayback: {
        id: '02', language: 'fr' as const, audioIdentity: 'old-audio-version',
        positionSeconds: 55, durationSeconds: recording.durationSeconds, updatedAt: 100,
      },
    };
    context.mock.method(visitorStore, 'getSnapshot', () => snapshot);

    assert.equal(renderToStaticMarkup(<App />).includes('museum-resume-card'), false);
    snapshot.lastConsultedId = '07';
    assert.match(renderToStaticMarkup(<App />), /Revenir à la pièce 07/);

    snapshot.lastPlayback = { ...snapshot.lastPlayback, audioIdentity: recording.sha256 };
    assert.match(renderToStaticMarkup(<App />), /Continuer l’écoute — pièce 02 · 00:55/);
    snapshot.lastPlayback = { ...snapshot.lastPlayback, positionSeconds: recording.durationSeconds - 0.1 };
    assert.match(renderToStaticMarkup(<App />), /Continuer l’écoute — pièce 02 · 00:00/);
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});

test('station search finds Resistance with or without accents and preserves existing identifiers', () => {
  for (const { code } of LANGUAGES) {
    for (const query of ['resistance', ' RÉSISTANCE ', 'Re\u0301sistance']) {
      assert.deepEqual(STOPS.filter((stop) => matchesStopSearch(stop, query, code)).map((stop) => stop.id), ['14', '22'], `${code}/${query}`);
    }
    assert.equal(STOPS.filter((stop) => matchesStopSearch(stop, '  ', code)).length, 22);
    assert.deepEqual(STOPS.filter((stop) => matchesStopSearch(stop, 'Enigma', code)).map((stop) => stop.id), ['19']);
    assert.equal(STOPS.filter((stop) => matchesStopSearch(stop, 'zzzz-no-piece', code)).length, 0);
    assert.equal(matchesStopSearch(STOPS.find((stop) => stop.id === '19')!, '19', code), true);
  }
});

test('station links retain the selected language when opened directly or shared', () => {
  for (const { code } of LANGUAGES) {
    const html = renderToStaticMarkup(<ParcoursPage onSelectStopDetail={noop} onOpenPlayer={noop} currentLang={code} />);
    const links = Array.from(html.matchAll(/href="(\/stop\/[^"]+)"/g), (match) => match[1]);
    assert.deepEqual(links, STOPS.map((stop) => `/stop/${stop.id}?hl=${code}`));
  }
});

test('a download can be stopped after switching to a different or unavailable language', (context) => {
  const initial = offlineStore.getSnapshot();
  const packs = {
    ...initial.packs,
    fr: { ...initial.packs.fr, status: 'downloading' as const },
    en: { ...initial.packs.en, status: 'idle' as const },
    de: { ...initial.packs.de, status: 'unavailable' as const },
  };
  let activeLanguage: 'fr' | null = 'fr';
  context.mock.method(offlineStore, 'getSnapshot', () => ({ activeLanguage, packs }));

  const english = renderToStaticMarkup(<OfflineManager language="en" />);
  assert.match(english, /A download is already running in another language/);
  assert.match(english, /Stop download<\/button>/);
  assert.equal((english.match(/<button[^>]* disabled=""/g) ?? []).length, 2);

  const german = renderToStaticMarkup(<OfflineManager language="de" />);
  assert.match(german, /Ein Download in einer anderen Sprache läuft bereits/);
  assert.match(german, /Download stoppen<\/button>/);
  assert.doesNotMatch(german, /Diese Sprache herunterladen/);

  activeLanguage = null;
  assert.doesNotMatch(renderToStaticMarkup(<OfflineManager language="en" />), /Stop download/);
});

test('photo viewer distinguishes inherited French captions from translated cover captions', () => {
  const photo = STOPS[0].photos[0];
  const french = renderToStaticMarkup(<PhotoViewer photo={photo} language="en" onClose={noop} />);
  assert.match(french, /class="museum-photo-stage" lang="fr"/);
  assert.ok(french.includes(`lang="fr">${escapeText(photo.caption)}</h2>`));
  assert.ok(french.includes(`<p lang="fr">${escapeText(photo.source)}</p>`));
  assert.ok(french.includes(`aria-label="${escapeText(detailLabel('en', 'zoomIn'))}"`));
  assert.ok(french.includes(escapeText(detailLabel('en', 'credits'))));
  const translated = renderToStaticMarkup(<PhotoViewer photo={{ ...photo, caption: 'Collection photo', source: 'Association pending', contentLanguage: 'en' }} language="en" onClose={noop} />);
  assert.match(translated, /lang="en">Collection photo<\/h2>/);
  assert.match(translated, /<p lang="en">Association pending<\/p>/);
  assert.match(translated, /alt="Collection photo" lang="en"/);
  assert.match(translated, /class="museum-photo-stage" lang="en"/);
});

test('mini-player accessible name uses published English titles and identifies French fallbacks', () => {
  audioPlayer.setStop('19', false);
  try {
    for (const language of ['en', 'de'] as const) {
      audioPlayer.setLanguage(language);
      const title = getStopLabel(STOPS.find((stop) => stop.id === '19')!, language);
      const html = renderToStaticMarkup(<PersistentPlayerBar onOpenFullPlayer={noop} />);
      assert.match(html, /class="museum-mini-player-open"[^>]*aria-labelledby="[^"]+ [^"]+"/);
      assert.ok(html.includes(`class="sr-only" lang="${language}">${escapeText(visualLabel(language, 'openPlayer'))}</span>`));
      assert.ok(html.includes(`lang="${title.language}">${escapeText(title.text)}</strong>`));
      assert.doesNotMatch(html, /class="museum-mini-player-open"[^>]*aria-label=/);
    }
  } finally {
    audioPlayer.setLanguage('fr');
    audioPlayer.setStop('01', false);
  }
});

test('English tour and all 22 detail pages display published titles while other languages retain French labels', () => {
  const tour = renderToStaticMarkup(<ParcoursPage onSelectStopDetail={noop} onOpenPlayer={noop} currentLang="en" />);
  const headings = Array.from(tour.matchAll(/<h2\b([^>]*)>(.*?)<\/h2>/g));
  assert.equal(headings.length, 22);
  for (const [index, stop] of STOPS.entries()) {
    const title = getStopLabel(stop, 'en');
    assert.match(headings[index][1], /lang="en"/);
    assert.equal(headings[index][2], escapeText(title.text));
    const detail = renderToStaticMarkup(<StopDetailPage stopId={stop.id} onNavigateStop={noop} onOpenPlayer={noop} currentLang="en" />);
    assert.ok(detail.includes(`lang="en">${escapeText(title.text)}</h2>`), stop.id);
  }
  const stop = STOPS.find((item) => item.id === '14')!;
  const fallback = renderToStaticMarkup(<StopDetailPage stopId="14" onNavigateStop={noop} onOpenPlayer={noop} currentLang="de" />);
  assert.ok(fallback.includes(`lang="fr">${escapeText(stop.title)}</h2>`));
});

test('player settings identify the next exhibit with its published title and actual text language', () => {
  try {
    for (const { code } of LANGUAGES) {
      audioPlayer.setLanguage(code);
      for (const [index, stop] of STOPS.entries()) {
        audioPlayer.setStop(stop.id, false);
        const html = renderToStaticMarkup(<PlayerPage currentLang={code} onSelectStopDetail={noop} />);
        const action = html.match(/<button[^>]*class="player-next-detail"[^>]*>(.*?)<\/button>/);
        if (index === STOPS.length - 1) {
          assert.equal(action, null, 'last station has no next-exhibit link');
        } else {
          const next = getStopLabel(STOPS[index + 1], code);
          assert.ok(action, `${code}/${stop.id}: next exhibit remains accessible`);
          assert.ok(action[1].includes(`<strong lang="${next.language}">${escapeText(next.text)}</strong>`), `${code}/${stop.id}: title matches the destination and its language`);
        }
      }
    }
  } finally {
    audioPlayer.setLanguage('fr');
    audioPlayer.setStop('01', false);
  }
});

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
    assert.ok(html.includes(`href="/stop/${stop.id}?hl=fr"`), stop.id);
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

test('language selection distinguishes seven interfaces and reports validated audio counts', () => {
  const audioCounts = { fr: 22, en: 22, de: 19, es: 22, pl: 9, it: 5, nl: 7 };
  for (const { code } of LANGUAGES) {
    const html = renderToStaticMarkup(<LanguageSelector currentLang={code} onLanguageChange={noop} />);
    assert.equal((html.match(/class="museum-language-button"/g) ?? []).length, 7);
    assert.match(html, /FR · EN · DE · NL · ES · IT · PL/);
    assert.match(html, /aria-describedby="language-audio-status"/);
    assert.match(html, /role="status"/);
    assert.doesNotMatch(html, /disabled=|\{languages\}|\{count\}|\{total\}/);
    const count = audioCounts[code];
    assert.ok(html.includes(escapeText(experienceText(count ? 'audioCount' : 'interfaceOnly', code, { count, total: 22 }))));
    if (count === 22) assert.match(html, /22\/22/);
    else assert.doesNotMatch(html, /22\/22/);
  }
});

test('unavailable languages expose French reference text with disabled audio; restored FR22 and real English use their own synchronized text', () => {
  audioPlayer.setLanguage('de');
  audioPlayer.setStop('18', false);
  const missing = renderToStaticMarkup(<PlayerPage currentLang="fr" onSelectStopDetail={noop} />);
  assert.match(missing, /Texte de référence en français/);
  assert.match(missing, /pas encore disponible/);
  assert.match(missing, /class="player-play-button" disabled=""/);
  assert.doesNotMatch(missing, /class="transcript-word"/);
  audioPlayer.setStop('01', false);
  const german = renderToStaticMarkup(<PlayerPage currentLang="de" onSelectStopDetail={noop} />);
  assert.match(german, /lang="de" data-phrase-follow="true"/);
  assert.match(german, /class="transcript-phrase-button"/);
  assert.doesNotMatch(german, /class="transcript-word"|class="player-play-button" disabled=""/);
  audioPlayer.setLanguage('fr');
  audioPlayer.setStop('22', false);
  const french22 = renderToStaticMarkup(<PlayerPage currentLang="fr" onSelectStopDetail={noop} />);
  assert.match(french22, /class="synced-transcript" lang="fr"/);
  assert.match(french22, /class="transcript-word"/);
  assert.match(french22, /en attente de vérification humaine/);
  assert.doesNotMatch(french22, /class="player-play-button" disabled=""/);
  audioPlayer.setStop('01', false);
  audioPlayer.setLanguage('en');
  const english = renderToStaticMarkup(<PlayerPage currentLang="en" onSelectStopDetail={noop} />);
  assert.match(english, /human review is pending/);
  assert.match(english, /class="synced-transcript" lang="en"/);
  assert.match(english, /class="transcript-word"/);
  assert.match(english, /aria-label="Audio position"/);
  assert.doesNotMatch(english, /French reference text|Synchronized text is available only in French/);
  audioPlayer.setLanguage('fr');
});

test('the Polish synthetic narration is identified on the exhibit and player', () => {
  const label = escapeText(experienceText('syntheticNarration', 'pl'));
  const detail = renderToStaticMarkup(<StopDetailPage stopId="09" currentLang="pl" onNavigateStop={noop} onOpenPlayer={noop} />);
  assert.ok(detail.includes(label));
  audioPlayer.setLanguage('pl');
  audioPlayer.setStop('09', false);
  try {
    const player = renderToStaticMarkup(<PlayerPage currentLang="pl" onSelectStopDetail={noop} />);
    assert.ok(player.includes(label));
    assert.match(player, /lang="pl" data-phrase-follow="true"/);
    assert.doesNotMatch(player, /class="transcript-word"|class="player-play-button" disabled=""/);
  } finally {
    audioPlayer.setLanguage('fr');
  }
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
