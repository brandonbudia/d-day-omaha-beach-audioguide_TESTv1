import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { getTimedTokens, getWordState, tokenizeTranscript } from '../src/audio/transcriptTiming';
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
    const sources = new Map([[0, words]]);
    for (const source of record.supplementaryRecognitionCaches ?? []) {
      assert.ok(Number.isInteger(source.id) && source.id > 0 && !sources.has(source.id));
      assert.match(source.path, /^[a-z0-9-]+\/[a-z0-9-]+\.json$/);
      const bytes = readFileSync(join(cacheRoot, '..', source.path));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
      const clip = JSON.parse(bytes.toString('utf8'));
      assert.equal(clip.cacheKey, source.cacheKey);
      assert.equal(clip.source.sha256, record.audioSha256);
      assert.equal(clip.inputIdentity.model.revision, source.modelRevision);
      assert.equal(clip.inputIdentity.configuration.language, 'en');
      assert.equal(clip.inputIdentity.configuration.suppliedText, false);
      assert.deepEqual([clip.inputIdentity.firstSample / 16000, clip.inputIdentity.lastSampleExclusive / 16000], source.windowSeconds);
      sources.set(source.id, clip.segments.flatMap((segment: { words: typeof words }) => segment.words));
    }
    const normalize = (text: string) => text.normalize('NFC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
    for (const segment of record.segments) {
      const tokens = tokenizeTranscript(segment.text);
      for (const [tokenIndex, start, end, probability, nativeIndex, sourceId = 0] of segment.timings) {
        const native = sources.get(sourceId)?.[nativeIndex];
        assert.ok(native, `${id}: unregistered native cache or word`);
        assert.equal(start, native.start);
        assert.equal(end, native.end);
        assert.equal(probability, native.probability);
        assert.ok(probability >= .8);
        assert.equal(normalize(tokens[tokenIndex][0]), normalize(native.word));
      }
    }
  }
});

test('EN01 history uses its independent medium cache without shifting any earlier word or another station', () => {
  const record = ENGLISH_TRANSCRIPTS['01'];
  const segment = record.segments[17];
  const words = getTimedTokens(segment.text, segment.wordTimings!, segment.startSeconds, record.durationSeconds!);
  assert.deepEqual(words.map(word => word.text), ['Welcome', 'to', 'history']);
  const history = words[2];
  assert.deepEqual([history.startSeconds, history.endSeconds], [111.1, 111.52]);
  assert.equal(getWordState(111.09, history), 'upcoming');
  assert.equal(getWordState(111.30, history), 'current');
  assert.equal(getWordState(111.53, history), 'read');
  assert.equal(ENGLISH_TRANSCRIPT_SOURCES['01'].timedWords, 239);
  assert.equal(ENGLISH_TRANSCRIPT_SOURCES['01'].unresolvedWords.length, 15);
  assert.deepEqual(ENGLISH_TRANSCRIPT_SOURCES['01'].segments[17].timings.at(-1), [2, 111.1, 111.52, 0.9745679497718811, 6, 1]);
  const source = ENGLISH_TRANSCRIPT_SOURCES['01'].supplementaryRecognitionCaches![0];
  assert.equal(source.id, 1);
  assert.equal(source.sha256, '1bf9c957170f94bf41b184b292b6ec783a894cfffde518679778a747577e827d');
  assert.equal(source.path, `en01-targeted-20261109/en01-medium-window-${source.cacheKey}.json`);
  assert.equal(source.cacheKey, '2372982ffdcacca51a65094105037d74467d54edc5af98849985aa013727338d');
  assert.equal(source.modelRevision, '08e178d48790749d25932bbc082711ddcfdfbc4f');
  assert.deepEqual(source.windowSeconds, [108, 114]);
  assert.equal(createHash('sha256').update(JSON.stringify(ENGLISH_TRANSCRIPT_SOURCES['01'].unresolvedWords)).digest('hex'), '41ede4428dedc051e9db5a0631c47fa2de0672b59bfa2c8d6bb6b35b6477b27f');

  // Reconstruct only the permitted one-word delta; fingerprint every other
  // station, source, uncertainty, sentence and previously accepted interval.
  const preserved = structuredClone(ENGLISH_TRANSCRIPT_SOURCES);
  const raw = preserved['01'];
  delete raw.supplementaryRecognitionCaches;
  raw.timedWords -= 1;
  raw.segments[17].timings = raw.segments[17].timings.filter(([tokenIndex]) => tokenIndex !== 2);
  raw.unresolvedWords.push({ segmentIndex: 17, tokenIndex: 2, text: 'history', reason: 'low-recognition-probability' });
  assert.equal(createHash('sha256').update(JSON.stringify(preserved)).digest('hex'), 'b1b3e28dfe57a1b0cf16d01010150dde286a13ae7a2a23d5916b96ea06374b87');
});
