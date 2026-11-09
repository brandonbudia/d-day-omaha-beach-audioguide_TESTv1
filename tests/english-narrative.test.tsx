import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EnglishNarrative, EnglishNarrativeContent } from '../src/components/EnglishNarrative';
import { STOPS } from '../src/data/stops';
import { resolveTranscript } from '../src/data/transcripts';
import { getMediaResource } from '../src/data/mediaCatalog';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

test('all 22 English narratives reuse the actual registry text without another player', () => {
  for (const stop of STOPS) {
    const transcript = resolveTranscript(stop.id, 'en', getMediaResource(stop.id, 'en'));
    const html = renderToStaticMarkup(<EnglishNarrativeContent transcript={transcript} />);
    const main = html.match(/<div class="museum-narrative-text">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(main, stop.id);
    assert.match(html, /aria-label="English narration" lang="en"/);
    assert.match(html, /human review is pending/);
    for (const paragraph of transcript.paragraphs) assert.ok(main.includes(`<p>${escape(paragraph)}</p>`), stop.id);
    assert.doesNotMatch(html, /<audio|class="transcript-word"|player-play-button/);
  }
});

test('unconfirmed English source passages remain separate from the narration body', () => {
  for (const id of ['08', '09', '12']) {
    const transcript = resolveTranscript(id, 'en', getMediaResource(id, 'en'));
    assert.ok(transcript.referenceOnlyParagraphs.length > 0, id);
    const html = renderToStaticMarkup(<EnglishNarrativeContent transcript={transcript} />);
    const main = html.match(/<div class="museum-narrative-text">([\s\S]*?)<\/div>/)![1];
    assert.match(html, /<summary>Document passages not found in this recording<\/summary>/);
    for (const paragraph of transcript.referenceOnlyParagraphs) {
      assert.ok(html.includes(escape(paragraph)), id);
      assert.ok(!main.includes(escape(paragraph)), id);
    }
  }
});

test('loading and language mismatch never disguise French text as English narration', () => {
  const loading = renderToStaticMarkup(<EnglishNarrative stopId="22" />);
  assert.match(loading, /role="status" lang="en"/);
  assert.match(loading, /Loading the English narration/);
  const french = resolveTranscript('01', 'fr', getMediaResource('01', 'fr'));
  const html = renderToStaticMarkup(<EnglishNarrativeContent transcript={french} />);
  assert.match(html, /French reference remains below/);
  assert.doesNotMatch(html, /museum-narrative-text|<audio/);
});
