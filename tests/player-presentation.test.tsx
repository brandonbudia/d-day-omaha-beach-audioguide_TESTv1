import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Scrubber } from '../src/components/Scrubber';
import { SyncedTranscript } from '../src/components/SyncedTranscript';
import type { TimedTranscriptSegment } from '../src/data/stops';

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
