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
        if (id === '22' && segment === record.segments[6] && tokenIndex === 7) {
          // The listener confirmed served; both recognizers returned serve.
          // This is a documented lexical exception, not a global stemming rule.
          assert.equal(tokens[tokenIndex][0], 'served');
          assert.equal(normalize(native.word), 'serve');
          assert.ok(record.listeningConfirmedAlignment?.presenceConfirmation.words.some(word => word.segmentIndex === 6 && word.tokenIndex === 7 && word.text === 'served'));
        } else assert.equal(normalize(tokens[tokenIndex][0]), normalize(native.word));
      }
    }
  }
});

test('EN01 history keeps its independently corroborated bounds and original uncertainty list', () => {
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

});

const addedAddresses = [
  '01/17/2', '02/0/15', '05/4/0', '07/4/6', '08/9/8', '09/7/0',
  '10/6/5', '10/6/6', '10/10/21', '13/1/14', '13/11/0', '14/15/10',
  '15/0/15', '15/9/6', '19/6/38', '19/8/20', '20/14/2', '20/14/3',
  '21/12/3', '21/31/12',
  '06/19/20', '06/26/6', '09/9/0', '10/14/18', '22/11/5',
];
const previousBounds = [
  { id: '09', segmentIndex: 7, tokenIndex: 1, previousTiming: [1, 23.24, 23.6, 0.9201981425285339, 48] },
  { id: '10', segmentIndex: 6, tokenIndex: 7, previousTiming: [7, 53.2, 53.66, 0.9746642708778381, 127] },
  { id: '13', segmentIndex: 1, tokenIndex: 15, previousTiming: [15, 23.92, 24.22, 0.9774091243743896, 39] },
  { id: '13', segmentIndex: 11, tokenIndex: 1, previousTiming: [1, 133.2, 133.72, 0.9948849081993103, 271] },
  { id: '13', segmentIndex: 11, tokenIndex: 2, previousTiming: [2, 133.72, 133.96, 0.9961200952529907, 272] },
  { id: '06', segmentIndex: 19, tokenIndex: 21, previousTiming: [21, 116.12, 116.54, 0.9617798328399658, 294] },
  { id: '09', segmentIndex: 9, tokenIndex: 1, previousTiming: [1, 51.52, 51.96, 0.9866278767585754, 108] },
  { id: '22', segmentIndex: 11, tokenIndex: 6, previousTiming: [6, 104.58, 104.92, 0.9966288208961487, 242] },
  { id: '22', segmentIndex: 11, tokenIndex: 7, previousTiming: [7, 104.92, 105.46, 0.9981770515441895, 243] },
];

function restoreBeforeListeningConfirmation(sources: typeof ENGLISH_TRANSCRIPT_SOURCES) {
  for (const raw of Object.values(sources)) {
    const review = raw.listeningConfirmedAlignment;
    if (!review) continue;
    for (const change of review.changes) {
      const segment = raw.segments[change.segmentIndex];
      segment.timings = segment.timings.filter(row => row[0] !== change.tokenIndex);
      if (change.previousTiming) segment.timings.push(change.previousTiming);
      segment.timings.sort((a, b) => a[0] - b[0]);
    }
    for (const segment of raw.segments) delete segment.ctcWordTimings;
    for (const old of review.previousSegmentStarts) raw.segments[old.segmentIndex].startSeconds = old.previousStartSeconds;
    raw.timedWords = review.previousTimedWords;
    raw.unresolvedWords = review.previousUnresolvedWords;
    raw.supplementaryRecognitionCaches = raw.supplementaryRecognitionCaches?.filter(cache => review.previousRecognitionCacheIds.includes(cache.id));
    raw.alignmentEvidenceCaches = raw.alignmentEvidenceCaches?.filter(cache => review.previousAlignmentCacheIds.includes(cache.id));
    delete raw.listeningConfirmedAlignment;
    assert.equal(createHash('sha256').update(JSON.stringify(raw)).digest('hex'), review.previousRecordSha256, 'all original EN22 fields and timings survive the new delta');
  }
}

test('only 25 evidenced additions, nine necessary repairs and four phrase starts differ from the original English dataset', () => {
  const preserved = structuredClone(ENGLISH_TRANSCRIPT_SOURCES);
  restoreBeforeListeningConfirmation(preserved);
  const actualAdded: string[] = [];
  const actualRepairs: typeof previousBounds = [];
  for (const [id, raw] of Object.entries(preserved)) {
    for (const repair of raw.boundaryCorrections ?? []) actualRepairs.push({ id, ...repair });
    for (const [segmentIndex, segment] of raw.segments.entries()) {
      segment.timings = segment.timings.flatMap(row => {
        if (!(row[5] > 0)) return [row];
        const repair = previousBounds.find(old => old.id === id && old.segmentIndex === segmentIndex && old.tokenIndex === row[0]);
        if (repair) return [repair.previousTiming];
        actualAdded.push(`${id}/${segmentIndex}/${row[0]}`);
        raw.timedWords--;
        raw.unresolvedWords.push({ segmentIndex, tokenIndex: row[0], text: tokenizeTranscript(segment.text)[row[0]][0], reason: 'low-recognition-probability' });
        return [];
      });
    }
    raw.unresolvedWords.sort((a, b) => a.segmentIndex - b.segmentIndex || a.tokenIndex - b.tokenIndex);
    delete raw.supplementaryRecognitionCaches;
    delete raw.alignmentEvidenceCaches;
    delete raw.wordCorroborations;
    delete raw.boundaryCorrections;
  }
  const byAddress = (a: typeof previousBounds[number], b: typeof previousBounds[number]) => a.id.localeCompare(b.id) || a.segmentIndex - b.segmentIndex || a.tokenIndex - b.tokenIndex;
  assert.deepEqual(actualRepairs.sort(byAddress), previousBounds.toSorted(byAddress));
  assert.deepEqual(actualAdded.sort(), addedAddresses.toSorted());
  // Restore only the four explicitly permitted phrase-start changes.
  preserved['05'].segments[4].startSeconds = 30.12;
  preserved['09'].segments[7].startSeconds = 23.24;
  preserved['13'].segments[11].startSeconds = 133.2;
  preserved['09'].segments[9].startSeconds = 51.52;
  assert.equal(createHash('sha256').update(JSON.stringify(preserved)).digest('hex'), 'b1b3e28dfe57a1b0cf16d01010150dde286a13ae7a2a23d5916b96ea06374b87');
  assert.equal(Object.values(ENGLISH_TRANSCRIPT_SOURCES).reduce((sum, raw) => sum + raw.timedWords, 0), 6613);
  assert.equal(Object.values(ENGLISH_TRANSCRIPT_SOURCES).reduce((sum, raw) => sum + raw.totalWords - raw.timedWords, 0), 409);
});

test('new English bounds require both clear recognition and overlapping independent alignment, including short words', () => {
  const actual: string[] = [];
  for (const [id, raw] of Object.entries(ENGLISH_TRANSCRIPT_SOURCES)) {
    const caches = raw.alignmentEvidenceCaches ?? [];
    assert.equal(new Set(caches.map(cache => cache.id)).size, caches.length);
    const keys = new Set<string>();
    for (const proof of raw.wordCorroborations ?? []) {
      const key = `${id}/${proof.segmentIndex}/${proof.tokenIndex}`;
      assert.ok(!keys.has(key), 'one corroboration per source word'); keys.add(key); actual.push(key);
      const cache = caches.find(cache => cache.id === proof.alignmentCacheId);
      assert.ok(cache);
      assert.equal(cache.modelWeightsSha256, '488fd4f16de84438ffc945334278c1b9fb9b7159a806c1080b16111a958c945d');
      assert.match(cache.path, /^en-(?:01-22-)?ctc-(targeted|pilot)-20261110\/en-\d\d-ctc-[a-f0-9]{64}\.json$/);
      const row = raw.segments[proof.segmentIndex].timings.find(row => row[0] === proof.tokenIndex);
      assert.ok(row && row[5] > 0 && row[3] >= .9);
      assert.ok(Number.isInteger(proof.nativeIndex) && proof.nativeIndex >= 0);
      assert.ok(proof.score >= .8 && proof.score <= 1);
      assert.ok(proof.startSeconds < proof.endSeconds);
      assert.ok(Math.abs(row[1] - proof.startSeconds) <= .2 && Math.abs(row[2] - proof.endSeconds) <= .2);
      const overlap = Math.max(0, Math.min(row[2], proof.endSeconds) - Math.max(row[1], proof.startSeconds));
      assert.ok(overlap / Math.min(row[2] - row[1], proof.endSeconds - proof.startSeconds) >= .5, `${key}: short words need relative agreement`);
    }
  }
  const expected = [...addedAddresses.filter(key => key !== '01/17/2'), ...previousBounds.map(row => `${row.id}/${row.segmentIndex}/${row.tokenIndex}`)];
  assert.deepEqual(actual.sort(), expected.sort());
});

test('English corroborations match cached CTC words, source ownership and complete character evidence', { skip: !existsSync(cacheRoot) }, () => {
  const normalize = (text: string) => text.normalize('NFC').toLocaleLowerCase('en').replace(/’/g, "'").replace(/\u2011/g, '-').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  for (const [id, raw] of Object.entries(ENGLISH_TRANSCRIPT_SOURCES)) {
    for (const proof of raw.wordCorroborations ?? []) {
      const meta = raw.alignmentEvidenceCaches!.find(cache => cache.id === proof.alignmentCacheId)!;
      const bytes = readFileSync(join(cacheRoot, '..', meta.path));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), meta.sha256);
      const cache = JSON.parse(bytes.toString('utf8'));
      assert.equal(cache.cacheKey, meta.cacheKey);
      assert.equal(cache.inputIdentity.audioSha256, raw.audioSha256);
      assert.equal(cache.inputIdentity.model.weightsSha256, meta.modelWeightsSha256);
      assert.equal(cache.inputIdentity.configuration.interpolation, 'ignore');
      const native = cache.result.word_segments[proof.nativeIndex];
      assert.deepEqual([proof.startSeconds, proof.endSeconds, proof.score], [native.start, native.end, native.score]);
      const text = tokenizeTranscript(raw.segments[proof.segmentIndex].text)[proof.tokenIndex][0];
      assert.equal(normalize(native.word), normalize(text));
      if (meta.kind === 'targeted') {
        const owned = cache.words.find((word: { nativeIndex: number }) => word.nativeIndex === proof.nativeIndex);
        assert.ok(owned.fullAlphanumericCharacterEvidence);
        assert.deepEqual(owned.unsupportedCharacters, []);
        assert.deepEqual([owned.segmentIndex, owned.tokenIndex, owned.text], [proof.segmentIndex, proof.tokenIndex, text]);
        assert.deepEqual(owned.raw, native);
      } else {
        const chars = cache.result.segments.flatMap((segment: { chars: { char: string; start?: number; end?: number; score?: number }[] }) => segment.chars);
        assert.equal(chars.map((char: { char: string }) => char.char).join(''), cache.inputIdentity.text);
        const parts = cache.inputIdentity.text.split(' ');
        const offset = parts.slice(0, proof.nativeIndex).reduce((sum: number, part: string) => sum + part.length + 1, 0);
        const wordChars = chars.slice(offset, offset + parts[proof.nativeIndex].length).filter((char: { char: string }) => /[\p{L}\p{N}]/u.test(char.char));
        assert.ok(wordChars.length > 0);
        assert.equal(normalize(parts[proof.nativeIndex]), normalize(text));
        for (const char of wordChars) assert.ok(Number.isFinite(char.start) && Number.isFinite(char.end) && Number.isFinite(char.score) && char.start < char.end);
      }
    }
  }
});

test('EN10 repaired phrase follows real playback in both seek directions without overlapping highlights', () => {
  const segment = ENGLISH_TRANSCRIPTS['10'].segments[6];
  const words = getTimedTokens(segment.text, segment.wordTimings!, segment.startSeconds, ENGLISH_TRANSCRIPTS['10'].segments[7].startSeconds);
  for (const [time, expected] of [[53.1, 'gentleman'], [53.3, 'in'], [53.7, 'question'], [53.3, 'in'], [53.1, 'gentleman']] as const) {
    assert.deepEqual(words.filter(word => getWordState(time, word) === 'current').map(word => word.text), [expected]);
  }
});

test('EN22 transformed retains its published bounds while the separately reviewed using chain is explicit', () => {
  const record = ENGLISH_TRANSCRIPTS['22'];
  const raw = ENGLISH_TRANSCRIPT_SOURCES['22'];
  const segment = record.segments[11];
  const words = getTimedTokens(segment.text, segment.wordTimings!, segment.startSeconds, record.segments[12].startSeconds);
  for (const [time, expected] of [[104.5, 'transformed'], [104.9, 'their'], [105.3, 'environment'], [104.5, 'transformed']] as const) {
    assert.deepEqual(words.filter(word => getWordState(time, word) === 'current').map(word => word.text), [expected]);
  }
  assert.deepEqual(raw.segments[11].timings.filter(row => [5, 6, 7].includes(row[0])), [
    [5, 104.28, 104.8, 0.9680752158164978, 5, 1],
    [6, 104.8, 105.06, 0.9976027607917786, 6, 1],
    [7, 105.06, 105.6, 0.9953235983848572, 7, 1],
  ]);
  assert.deepEqual(raw.listeningConfirmedAlignment!.changes.find(change => change.segmentIndex === 11 && change.tokenIndex === 9)!.previousTiming, [9, 106.2, 106.64, 0.9963611960411072, 245]);
});

const confirmedEn22Words = [
  [4, 8, 'constituted'], [6, 7, 'served'], [7, 7, 'these'], [8, 1, 'green'],
  [8, 5, 'KIEFFER'], [8, 6, 'commandos'], [8, 24, '18'], [8, 17, 'who'], [8, 27, 'by'],
  [9, 8, 'weapon'], [9, 9, 'testify'], [9, 15, 'resistance'], [10, 2, 'there'],
  [11, 8, 'using'], [12, 0, 'We'], [14, 19, 'who'],
] as const;

test('EN22 listener-confirmed words follow native intervals in either seek direction, without hiding old words', () => {
  const raw = ENGLISH_TRANSCRIPT_SOURCES['22'];
  const record = ENGLISH_TRANSCRIPTS['22'];
  const review = raw.listeningConfirmedAlignment!;
  assert.equal(review.applicationBeforeSha256, '727c9e951debc628ea6546890f8222a86fe684efb8354923018109ec48732d84');
  assert.equal(review.audioSha256, raw.audioSha256);
  assert.equal(review.presenceConfirmation.audioSha256, raw.audioSha256);
  assert.deepEqual(review.presenceConfirmation.words.map(word => [word.segmentIndex, word.tokenIndex, word.text]), confirmedEn22Words);
  assert.equal(review.wordBoundaryReviewComplete, false);
  assert.equal(review.presenceConfirmation.wordBoundaryReviewComplete, false);
  assert.equal(record.provenance.humanListeningReviewed, false);
  assert.ok(record.provenance.issues.some(issue => issue.startsWith('Historical ASR selection rule')));
  assert.ok(record.provenance.issues.some(issue => issue.includes('confirmed 16 word occurrences, not their exact boundaries')));
  assert.ok(!record.provenance.issues.some(issue => issue.startsWith('Only exact, context-supported recognized tokens')));
  assert.equal(raw.timedWords, 337);
  assert.deepEqual(raw.unresolvedWords.map(word => [word.segmentIndex, word.tokenIndex, word.text]), [[3, 0, 'The'], [4, 2, 'but'], [5, 1, 'belonged'], [11, 13, 'to']]);
  assert.equal(review.changes.length, 79);
  assert.equal(review.changes.filter(change => change.previousTiming).length, 63);
  assert.equal(new Set(review.changes.map(change => `${change.segmentIndex}/${change.tokenIndex}`)).size, 79);
  assert.deepEqual(review.previousSegmentStarts, [{ segmentIndex: 12, previousStartSeconds: 110.98 }]);
  const all = record.segments.flatMap(segment => segment.wordTimings!);
  for (const [si, ti, text] of [...confirmedEn22Words, ...confirmedEn22Words.toReversed()]) {
    const word = record.segments[si].wordTimings!.find(word => word.tokenIndex === ti)!;
    assert.equal(word.text, text);
    for (const time of [word.startSeconds, (word.startSeconds + word.endSeconds) / 2]) {
      assert.deepEqual(all.filter(candidate => getWordState(time, candidate) === 'current'), [word]);
    }
    assert.equal(getWordState(word.startSeconds - .001, word), 'upcoming');
    assert.equal(getWordState(word.endSeconds, word), 'read');
  }
  // A single old bound put back would collide with the newly supported chain.
  for (const change of review.changes.filter(change => change.previousTiming)) {
    const old = change.previousTiming!;
    const neighbors = all.filter(word => !(record.segments[change.segmentIndex].wordTimings!.includes(word) && word.tokenIndex === change.tokenIndex));
    assert.ok(neighbors.some(word => old[1] < word.endSeconds && word.startSeconds < old[2]), `${change.segmentIndex}/${change.tokenIndex}: repair really necessary`);
  }
});

test('EN22 primary CTC intervals and lexical exceptions retain exact cached ownership and distinct confidence types', { skip: !existsSync(cacheRoot) }, () => {
  const raw = ENGLISH_TRANSCRIPT_SOURCES['22'];
  const review = raw.listeningConfirmedAlignment!;
  const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const recognitionCaches = new Map<number, { word: string; start: number; end: number; probability: number }[]>();
  const original = JSON.parse(readFileSync(join(cacheRoot, `en-22-${raw.recognitionCacheKey}.json`), 'utf8'));
  recognitionCaches.set(0, original.segments.flatMap((s: { words: object[] }) => s.words));
  for (const meta of raw.supplementaryRecognitionCaches!) {
    const bytes = readFileSync(join(cacheRoot, '..', meta.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), meta.sha256);
    const cached = JSON.parse(bytes.toString('utf8'));
    recognitionCaches.set(meta.id, cached.segments.flatMap((s: { words: object[] }) => s.words));
  }
  for (const change of review.changes) {
    const segment = raw.segments[change.segmentIndex];
    assert.equal(tokenizeTranscript(segment.text)[change.tokenIndex][0], change.text);
    assert.ok(change.recognition.length > 0);
    for (const witness of change.recognition) {
      const native = recognitionCaches.get(witness.cacheId)![witness.nativeIndex];
      assert.deepEqual([witness.word, witness.startSeconds, witness.endSeconds, witness.probability], [native.word, native.start, native.end, native.probability]);
      const alias = change.text === 'served' ? 'serve' : change.text === 'KIEFFER' ? 'Kiefer' : change.text === '18' ? '18th' : change.text;
      assert.equal(normalize(witness.word), normalize(alias));
    }
    const asr = segment.timings.find(row => row[0] === change.tokenIndex);
    const ctc = segment.ctcWordTimings?.find(row => row.tokenIndex === change.tokenIndex);
    assert.equal(Boolean(asr), change.primary === 'asr');
    assert.equal(Boolean(ctc), change.primary === 'ctc');
    if (asr) {
      const native = recognitionCaches.get(asr[5])![asr[4]];
      assert.deepEqual(asr.slice(1, 4), [native.start, native.end, native.probability]);
      assert.ok(native.probability >= .8);
    }
    const proof = change.alignment;
    if (!proof) {
      assert.ok(change.previousTiming && asr && change.reviewFlags.includes('necessary-neighbor-two-ASR-native-agreement'));
      assert.ok(Math.abs(asr[1] - change.previousTiming[1]) <= .25 && Math.abs(asr[2] - change.previousTiming[2]) <= .25);
      assert.ok(asr[1] < change.previousTiming[2] && change.previousTiming[1] < asr[2]);
      continue;
    }
    const meta = raw.alignmentEvidenceCaches!.find(meta => meta.id === proof.alignmentCacheId)!;
    assert.match(meta.path, /^en(?:22-human|-01-22)-ctc-(?:targeted-)?20261110\/en-22-ctc-[a-f0-9]{64}\.json$/);
    const bytes = readFileSync(join(cacheRoot, '..', meta.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), meta.sha256);
    const cache = JSON.parse(bytes.toString('utf8'));
    assert.equal(cache.cacheKey, meta.cacheKey);
    assert.equal(cache.inputIdentity.audioSha256, raw.audioSha256);
    assert.equal(cache.inputIdentity.model.weightsSha256, meta.modelWeightsSha256);
    assert.equal(cache.inputIdentity.configuration.interpolation, 'ignore');
    const owner = cache.words.find((word: { nativeIndex: number }) => word.nativeIndex === proof.nativeIndex);
    const native = cache.result.word_segments[proof.nativeIndex];
    assert.deepEqual(owner.raw, native);
    assert.deepEqual([owner.segmentIndex, owner.tokenIndex, owner.displayText ?? owner.text], [change.segmentIndex, change.tokenIndex, change.text]);
    assert.equal(owner.text, proof.spokenText);
    assert.ok(owner.fullAlphanumericCharacterEvidence);
    assert.deepEqual(owner.unsupportedCharacters, []);
    assert.deepEqual([proof.startSeconds, proof.endSeconds, proof.score, proof.minimumCharacterScore], [native.start, native.end, native.score, owner.minimumCharacterScore]);
    if (ctc) assert.deepEqual([ctc.startSeconds, ctc.endSeconds, ctc.score, ctc.alignmentCacheId, ctc.nativeIndex], [proof.startSeconds, proof.endSeconds, proof.score, proof.alignmentCacheId, proof.nativeIndex]);
    if (change.text === 'KIEFFER') {
      assert.deepEqual([change.segmentIndex, change.tokenIndex], [8, 5]);
      assert.ok(proof.score >= .5 && proof.minimumCharacterScore >= .05);
      assert.ok(change.recognition.length >= 2 && change.reviewFlags.includes('proper-name-spelling-requires-boundary-review'));
      for (const witness of change.recognition) assert.ok(Math.abs(witness.startSeconds - proof.startSeconds) <= .15 && Math.abs(witness.endSeconds - proof.endSeconds) <= .15);
    } else if (change.text === 'served') {
      assert.deepEqual([change.segmentIndex, change.tokenIndex], [6, 7]);
      assert.ok(asr && asr[3] >= .9);
      assert.equal(proof.minimumCharacterScore, .001, 'the final consonant is not certified');
      assert.ok(change.reviewFlags.includes('CTC-final-consonant-not-established-min-character-score-0.001'));
    } else if (!change.previousTiming) {
      assert.ok(proof.score >= .8 && proof.minimumCharacterScore >= .1);
    } else if (proof.score < .6) {
      assert.equal(change.text.toLowerCase(), 'a');
      assert.ok(proof.minimumCharacterScore >= .2 && change.recognition.length >= 2);
      for (const witness of change.recognition) assert.ok(witness.probability >= .95 && witness.startSeconds < proof.endSeconds && proof.startSeconds < witness.endSeconds);
    } else assert.ok(proof.score >= .6 && proof.minimumCharacterScore >= .2);
    if (change.text === '18') {
      assert.equal(proof.spokenText, 'eighteenth');
      assert.ok(new Set(change.recognition.map(witness => witness.cacheId)).size >= 2);
      assert.ok(change.reviewFlags.includes('explicit-spoken-ordinal-display-unchanged'));
    }
  }
});
