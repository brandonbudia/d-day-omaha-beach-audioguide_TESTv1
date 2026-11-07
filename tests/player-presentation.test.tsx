import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Scrubber } from '../src/components/Scrubber';
import { SyncedTranscript } from '../src/components/SyncedTranscript';
import type { TimedTranscriptSegment } from '../src/data/stops';
import { normalizeReadingPreferences } from '../src/hooks/useReadingPreferences';
import { translations, LANGUAGES, t } from '../src/i18n/translations';
import { TranscriptNotice } from '../src/components/TranscriptNotice';
import type { TranscriptResolution } from '../src/data/transcripts';

const segments: TimedTranscriptSegment[] = [
  {
    startSeconds: 0,
    text: '« D’abord, à l’abri. »',
    wordTimings: [
      { tokenIndex: 0, text: 'D’abord', startSeconds: 0.1, endSeconds: 0.5 },
      { tokenIndex: 1, text: 'à', startSeconds: 0.6, endSeconds: 0.8 },
      { tokenIndex: 2, text: 'l’abri', startSeconds: 0.9, endSeconds: 1.4 },
    ],
  },
  {
    startSeconds: 2,
    text: 'Puis… ici !',
    wordTimings: [
      { tokenIndex: 0, text: 'Puis', startSeconds: 2, endSeconds: 2.5 },
      { tokenIndex: 1, text: 'ici', startSeconds: 2.6, endSeconds: 3 },
    ],
  },
];

const renderTranscript = (currentTime: number) => renderToStaticMarkup(
  <SyncedTranscript segments={segments} currentTime={currentTime} textSize={24} onSelectPhrase={() => {}} />,
);

test('rendered transcript preserves short words, apostrophes and surrounding punctuation', () => {
  const html = renderTranscript(0.7);
  assert.match(html, /« <button[^>]+data-word-state="read"[^>]*>D’abord<\/button>, <button[^>]+data-word-state="current"[^>]*>à<\/button> <button[^>]+data-word-state="upcoming"[^>]*>l’abri<\/button>\. »/);
  assert.equal((html.match(/class="transcript-word"/g) ?? []).length, 5);
  assert.equal((html.match(/aria-current="true"/g) ?? []).length, 2); // One phrase, one word.
});

test('rendered read/current/upcoming states follow backward seeks and a paused clock', () => {
  const later = renderTranscript(2.2);
  assert.equal((later.match(/data-word-state="read"/g) ?? []).length, 3);
  assert.equal((later.match(/data-word-state="current"/g) ?? []).length, 1);
  assert.equal((later.match(/data-word-state="upcoming"/g) ?? []).length, 1);
  const earlier = renderTranscript(0.2);
  assert.equal((earlier.match(/data-word-state="read"/g) ?? []).length, 0);
  assert.equal((earlier.match(/data-word-state="current"/g) ?? []).length, 1);
  assert.equal((earlier.match(/data-word-state="upcoming"/g) ?? []).length, 4);
  assert.equal(renderTranscript(0.2), earlier);
  const gap = renderTranscript(0.55);
  assert.equal((gap.match(/data-word-state="read"/g) ?? []).length, 1);
  assert.equal((gap.match(/data-word-state="current"/g) ?? []).length, 0);
});

test('each timed phrase exposes one word to Tab while retaining every clickable word and its replay button', () => {
  const html = renderTranscript(0.7);
  const words = html.match(/<button[^>]+class="transcript-word"[^>]*>/g) ?? [];
  assert.equal(words.length, 5);
  assert.equal(words.filter((word) => word.includes('tabindex="0"')).length, 2);
  assert.equal(words.filter((word) => word.includes('tabindex="-1"')).length, 3);
  assert.equal((html.match(/class="transcript-phrase-replay"/g) ?? []).length, 2);
  assert.match(html, /flèches gauche et droite/);
  assert.match(html, /Entrée ou Espace/);
  // The active word does not silently move the keyboard entry point during playback.
  const later = renderTranscript(2.7).match(/<button[^>]+class="transcript-word"[^>]*>/g) ?? [];
  assert.deepEqual(later.map((word) => /tabindex="(-?\d+)"/.exec(word)?.[1]), words.map((word) => /tabindex="(-?\d+)"/.exec(word)?.[1]));
});

test('audio position uses a labelled native range with exact fractional time and no unrelated caption', () => {
  const html = renderToStaticMarkup(<Scrubber currentTime={12.34} duration={60} onSeek={() => {}} />);
  assert.match(html, /type="range"/);
  assert.match(html, /aria-label="Position audio"/);
  assert.match(html, /aria-valuetext="00:12 sur 01:00"/);
  assert.match(html, /step="0.01"/);
  assert.match(html, /value="12.34"/);
  assert.doesNotMatch(html, /Marée|player-scrubber-caption/);
  const noMedia = renderToStaticMarkup(<Scrubber currentTime={0} duration={0} onSeek={() => {}} />);
  assert.match(noMedia, /disabled=""/);
});

test('reading choices reject malformed stored values and keep the four independent options', () => {
  const defaults = { wideSpacing: false, colorAssistance: false, dyslexicFont: false, reducedMotion: false };
  for (const invalid of [null, undefined, [], 'true', 12]) assert.deepEqual(normalizeReadingPreferences(invalid), defaults);
  assert.deepEqual(normalizeReadingPreferences({ wideSpacing: true, colorAssistance: 'true', dyslexicFont: true, reducedMotion: false, unexpected: true }), { ...defaults, wideSpacing: true, dyslexicFont: true });
});

test('reading settings and visited-piece progress are available in all seven interface languages', () => {
  const newKeys = Object.keys(translations.fr).filter((key) => key.startsWith('reading_') || ['start_playback', 'visited_pieces', 'visited_pieces_progress', 'close_reading_settings'].includes(key));
  for (const language of LANGUAGES) {
    for (const key of newKeys) assert.ok((translations[language.code] as Record<string, string>)[key], `${language.code}/${key}`);
  }
  assert.equal(t('visited_pieces_progress', 'fr', { visited: 5, total: 22, percent: 23 }), '5 / 22 pièces visitées · 23 %');
});

test('transcript and scrubber controls follow the interface language without changing the spoken-text language', () => {
  for (const { code } of LANGUAGES) {
    const html = renderToStaticMarkup(<SyncedTranscript segments={segments} currentTime={0.7} textSize={26} language="en" uiLanguage={code} onSelectPhrase={() => {}} />);
    assert.match(html, /class="synced-transcript" lang="en"/);
    assert.ok(html.includes(`class="transcript-follow-bar" lang="${code}"`), code);
    assert.equal((html.match(/data-word-state="current"/g) ?? []).length, 1, code);
    assert.equal((html.match(/class="transcript-phrase-replay"/g) ?? []).length, 2, code);
    const scrubber = renderToStaticMarkup(<Scrubber currentTime={12.3} duration={60} language={code} onSeek={() => {}} />);
    assert.doesNotMatch(scrubber, /undefined/);
    if (code === 'en') {
      assert.match(html, /Left and right arrows/);
      assert.match(scrubber, /aria-valuetext="00:12 of 01:00"/);
    }
  }
});

test('editorial notice never presents automatically aligned words as human-reviewed and separates unspoken passages', () => {
  const transcript: TranscriptResolution = {
    mode: 'synchronized', requestedLanguage: 'en', contentLanguage: 'en', segments,
    paragraphs: segments.map((segment) => segment.text), referenceOnlyParagraphs: ['A document-only passage.'],
    provenance: { source: 'test', verification: 'automatic', humanListeningReviewed: false, issues: [] }, reason: 'matched',
  };
  const compact = renderToStaticMarkup(<TranscriptNotice transcript={transcript} language="en" compact />);
  assert.match(compact, /human review is pending/);
  assert.doesNotMatch(compact, /document-only/);
  const full = renderToStaticMarkup(<TranscriptNotice transcript={transcript} language="en" />);
  assert.match(full, /Document passages not found in this recording/);
  assert.match(full, /lang="en"><p>A document-only passage/);
  const mismatch = renderToStaticMarkup(<TranscriptNotice transcript={{ ...transcript, mode: 'static', reason: 'audio-hash-mismatch', segments: [] }} language="en" compact />);
  assert.match(mismatch, /not available for this recording/);
  assert.doesNotMatch(mismatch, /human review is pending/);
});
