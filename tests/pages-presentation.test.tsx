import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { STOPS } from '../src/data/stops';
import { StopDetailPage } from '../src/pages/StopDetailPage';
import { ParcoursPage } from '../src/pages/ParcoursPage';
import { WelcomePage } from '../src/pages/WelcomePage';

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

test('tour shows one visited-piece counter with rounded percentage, ignoring duplicate and unknown IDs', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const renderWithStoredVisits = (stored: string) => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: { getItem: () => stored } },
    });
    return renderToStaticMarkup(<ParcoursPage onSelectStopDetail={noop} onOpenPlayer={noop} currentLang="fr" />);
  };
  try {
    const html = renderWithStoredVisits(JSON.stringify(['01', '02', '03', '04', '05', '05', '99', 5]));
    assert.match(html, /5 \/ 22 pièces visitées · 23 %/);
    assert.equal((html.match(/role="progressbar"/g) ?? []).length, 1);
    assert.match(html, /aria-valuenow="5"/);
    assert.match(html, /aria-valuemax="22"/);
    assert.match(html, /Rechercher une station/);
    assert.equal((html.match(/<h2/g) ?? []).length, 22);
    const empty = renderWithStoredVisits('not JSON');
    assert.match(empty, /0 \/ 22 pièces visitées · 0 %/);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
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
