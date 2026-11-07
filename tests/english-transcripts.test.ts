import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { getTimedTokens, tokenizeTranscript } from '../src/audio/transcriptTiming';
import { ENGLISH_TRANSCRIPTS, ENGLISH_TRANSCRIPT_SOURCES, ENGLISH_TRANSCRIPT_EVIDENCE } from '../src/data/englishTranscripts';
import { FRENCH_TRANSCRIPTS } from '../src/data/frenchTranscripts';
import { getMediaResource } from '../src/data/mediaCatalog';
import { resolveTranscript } from '../src/data/transcripts';

test('all 22 English texts identify their own real recording and retain an explicit provisional review status', () => {
  assert.equal(Object.keys(ENGLISH_TRANSCRIPTS).length, 22);
  assert.equal(ENGLISH_TRANSCRIPT_EVIDENCE.humanListeningReviewed, false);
  for (const [id, record] of Object.entries(ENGLISH_TRANSCRIPTS)) {
    assert.equal(record.language, 'en');
    assert.equal(record.id, id);
    assert.equal(record.audioSha256, getMediaResource(id, 'en').sha256);
    assert.notEqual(record.audioSha256, FRENCH_TRANSCRIPTS[id].audioSha256);
    assert.equal(record.provenance.humanListeningReviewed, false);
    assert.match(record.provenance.verification, /human-review-pending/);
    assert.match(record.provenance.source, /wivi\.app\/pois\/.+hl=en$/);
    assert.ok(ENGLISH_TRANSCRIPT_SOURCES[id].languageProbability >= .98);
  }
});

test('every retained English word survives token/boundary validation and no missing timing is fabricated', () => {
  for (const [id, record] of Object.entries(ENGLISH_TRANSCRIPTS)) {
    const raw = ENGLISH_TRANSCRIPT_SOURCES[id];
    let timed = 0, words = 0;
    for (const [index, segment] of record.segments.entries()) {
      const nextStart = record.segments[index + 1]?.startSeconds ?? record.durationSeconds!;
      assert.ok(segment.startSeconds < nextStart, `${id}/${index}: chronological phrase start`);
      const accepted = getTimedTokens(segment.text, segment.wordTimings!, segment.startSeconds, nextStart);
      assert.equal(accepted.length, segment.wordTimings!.length, `${id}/${index}: exact validated tokens`);
      assert.equal(segment.startSeconds, accepted[0].startSeconds, 'phrase begins on a real retained bound');
      words += tokenizeTranscript(segment.text).length;
      timed += accepted.length;
    }
    assert.equal(words, raw.totalWords);
    assert.equal(timed, raw.timedWords);
    assert.equal(words - timed, raw.unresolvedWords.filter(word => !word.referenceOnly).length);
    assert.ok(words > timed, 'uncertain tokens must remain explicitly untimed');
    const resolved = resolveTranscript(id, 'en', { ...getMediaResource(id, 'en'), status: 'ready' }, { en: ENGLISH_TRANSCRIPTS });
    assert.equal(resolved.mode, 'synchronized', id);
    assert.equal(resolved.contentLanguage, 'en');
    assert.equal(resolveTranscript(id, 'en', { ...getMediaResource(id, 'en'), status: 'ready', sha256: '0'.repeat(64) }, { en: ENGLISH_TRANSCRIPTS }).mode, 'static');
  }
});

test('unspoken published passages and identified background dialogue do not receive narration timings', () => {
  assert.ok(ENGLISH_TRANSCRIPT_SOURCES['08'].referenceOnlyParagraphs.some(text => text.includes('We invite you to delve')));
  assert.ok(!ENGLISH_TRANSCRIPT_SOURCES['08'].segments.some(segment => segment.text.includes('We invite you to delve')));
  assert.ok(ENGLISH_TRANSCRIPT_SOURCES['12'].referenceOnlyParagraphs.some(text => text.includes('bloody beach of Omaha')));
  for (const id of ['12', '16', '18']) {
    const raw = ENGLISH_TRANSCRIPT_SOURCES[id];
    for (const segment of raw.segments) for (const [, start] of segment.timings) {
      assert.ok(!raw.excludedBackgroundDialogue.some(range => start >= range.startSeconds && start < range.endSeconds), `${id}: background dialogue excluded`);
    }
  }
  assert.ok(ENGLISH_TRANSCRIPTS['16'].segments[0].startSeconds >= 18.78);
});

// The application dataset is portable. When the original local evidence is present,
// additionally compare every stored number with the independent, cached model output.
const cacheRoot = 'C:/Users/brand/.codex/visualizations/2026/10/30/01a18a71-0798-7bd2-8114-5567c885946a/audio-language-audit-20261107';
test('retained times and probabilities are exactly the original native recognition bounds', { skip: !existsSync(cacheRoot) }, () => {
  for (const [id, record] of Object.entries(ENGLISH_TRANSCRIPT_SOURCES)) {
    const bytes = readFileSync(join(cacheRoot, `en-${id}-${record.recognitionCacheKey}.json`));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.recognitionCacheSha256);
    const cached = JSON.parse(bytes.toString('utf8'));
    assert.equal(cached.source.sha256, record.audioSha256);
    const words = cached.segments.flatMap((segment: { words: { word: string; start: number; end: number; probability: number }[] }) => segment.words);
    const normalize = (text: string) => text.normalize('NFC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
    for (const segment of record.segments) {
      const tokens = tokenizeTranscript(segment.text);
      for (const [tokenIndex, start, end, probability, nativeIndex] of segment.timings) {
        const native = words[nativeIndex];
        assert.equal(start, native.start);
        assert.equal(end, native.end);
        assert.equal(probability, native.probability);
        assert.ok(probability >= .8);
        assert.equal(normalize(tokens[tokenIndex][0]), normalize(native.word));
      }
    }
  }
});
