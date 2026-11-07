import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FRENCH_TRANSCRIPTS } from '../src/data/frenchTranscripts';
import { getMediaResource } from '../src/data/mediaCatalog';
import {
  resolveTranscript,
  type TranscriptAudioResource, type TranscriptRecord, type TranscriptRegistry,
} from '../src/data/transcripts';

// Synthetic resolver fixtures are not museum content and never enter the registry.
const sha = 'a'.repeat(64);
const audio = (overrides: Partial<TranscriptAudioResource> = {}): TranscriptAudioResource => ({
  id: '01', language: 'fr', sha256: sha, durationSeconds: 5, status: 'ready', ...overrides,
});
const record = (overrides: Partial<TranscriptRecord> = {}): TranscriptRecord => ({
  id: '01', language: 'fr', audioSha256: sha, durationSeconds: 5, status: 'aligned',
  provenance: { source: 'test fixture', verification: 'test-only', humanListeningReviewed: false, issues: [] },
  segments: [{ startSeconds: 0, text: 'Bonjour, monde.', wordTimings: [
    { tokenIndex: 0, text: 'Bonjour', startSeconds: .2, endSeconds: .7 },
    { tokenIndex: 1, text: 'monde', startSeconds: .8, endSeconds: 1.2 },
  ] }],
  referenceOnlyParagraphs: ['Passage du document absent de la narration.'], ...overrides,
});

test('an exact station, language and SHA yields validated words without merging reference-only text', () => {
  const source = record();
  const resolved = resolveTranscript('01', 'fr', audio(), { fr: { '01': source } });
  assert.equal(resolved.mode, 'synchronized');
  assert.equal(resolved.contentLanguage, 'fr');
  assert.equal(resolved.reason, 'matched');
  assert.deepEqual(resolved.segments, source.segments);
  assert.notEqual(resolved.segments, source.segments);
  assert.deepEqual(resolved.paragraphs, ['Bonjour, monde.']);
  assert.deepEqual(resolved.referenceOnlyParagraphs, source.referenceOnlyParagraphs);
  assert.equal(resolved.provenance?.humanListeningReviewed, false);
});

test('a changed, empty or malformed audio SHA keeps the original text but removes every interactive timing', () => {
  const registry = { fr: { '01': record() } };
  for (const digest of ['b'.repeat(64), '', 'not-a-sha']) {
    const resolved = resolveTranscript('01', 'fr', audio({ sha256: digest }), registry);
    assert.equal(resolved.mode, 'static');
    assert.equal(resolved.reason, 'audio-hash-mismatch');
    assert.deepEqual(resolved.segments, []);
    assert.deepEqual(resolved.paragraphs, ['Bonjour, monde.']);
  }
});

test('audio belonging to another station or language cannot reuse the timings even with the same digest', () => {
  const registry = { fr: { '01': record() } };
  for (const resource of [audio({ id: '02' }), audio({ language: 'en' })]) {
    const resolved = resolveTranscript('01', 'fr', resource, registry);
    assert.equal(resolved.mode, 'static');
    assert.equal(resolved.reason, 'audio-identity-mismatch');
    assert.deepEqual(resolved.segments, []);
  }
});

test('unavailable and editorially unverified audio remain static independently from byte integrity', () => {
  for (const [status, reason] of [['unavailable', 'audio-unavailable'], ['unverified', 'audio-unverified']] as const) {
    const resolved = resolveTranscript('01', 'fr', audio({ status }), { fr: { '01': record() } });
    assert.equal(resolved.mode, 'static');
    assert.equal(resolved.reason, reason);
    assert.deepEqual(resolved.segments, []);
  }
});

test('unverified transcripts and reference-only text never become synchronized through a matching hash', () => {
  for (const status of ['reference-only', 'unverified', 'unavailable'] as const) {
    const resolved = resolveTranscript('01', 'fr', audio(), { fr: { '01': record({ status }) } });
    assert.equal(resolved.mode, 'static');
    assert.deepEqual(resolved.segments, []);
    assert.deepEqual(resolved.referenceOnlyParagraphs, ['Passage du document absent de la narration.']);
  }
});

test('invalid words, overlapping bounds, unordered phrases and out-of-audio timings fail closed', () => {
  const changes = [
    { wordTimings: [{ text: 'autre', tokenIndex: 0, startSeconds: .1, endSeconds: .5 }] },
    { wordTimings: [{ text: 'Bonjour', tokenIndex: 0, startSeconds: .2, endSeconds: .9 }, { text: 'monde', tokenIndex: 1, startSeconds: .8, endSeconds: 1.2 }] },
    { wordTimings: [{ text: 'Bonjour', tokenIndex: 0, startSeconds: 4.8, endSeconds: 5.2 }] },
    { startSeconds: Number.NaN },
  ];
  for (const change of changes) {
    const invalid = record();
    invalid.segments = [{ ...invalid.segments[0], ...change }];
    const resolved = resolveTranscript('01', 'fr', audio(), { fr: { '01': invalid } });
    assert.equal(resolved.mode, 'static');
    assert.equal(resolved.reason, 'invalid-timings');
    assert.deepEqual(resolved.segments, []);
  }
  const unordered = record();
  unordered.segments = [unordered.segments[0], { startSeconds: 0, text: 'Suite.', wordTimings: [] }];
  assert.equal(resolveTranscript('01', 'fr', audio(), { fr: { '01': unordered } }).reason, 'invalid-timings');
});

test('missing words stay untimed; a real partial alignment is retained without interpolation', () => {
  const partial = record();
  partial.segments = [{ ...partial.segments[0], wordTimings: [partial.segments[0].wordTimings![0]] }];
  const resolved = resolveTranscript('01', 'fr', audio(), { fr: { '01': partial } });
  assert.equal(resolved.mode, 'synchronized');
  assert.equal(resolved.segments[0].wordTimings?.length, 1);
  assert.deepEqual(resolved.segments[0].wordTimings?.[0], partial.segments[0].wordTimings![0]);
  const noWords = record({ segments: [{ startSeconds: 0, text: 'Bonjour, monde.' }] });
  assert.equal(resolveTranscript('01', 'fr', audio(), { fr: { '01': noWords } }).reason, 'no-word-timings');
});

test('a missing translation gives an explicitly French, noninteractive fallback and never an invented EN record', () => {
  const registry: TranscriptRegistry = { fr: { '01': record() } };
  const before = JSON.stringify(registry);
  const resolved = resolveTranscript('01', 'en', audio({ language: 'en' }), registry);
  assert.equal(resolved.mode, 'french-fallback');
  assert.equal(resolved.requestedLanguage, 'en');
  assert.equal(resolved.contentLanguage, 'fr');
  assert.equal(resolved.reason, 'transcript-missing');
  assert.deepEqual(resolved.segments, []);
  assert.deepEqual(resolved.paragraphs, ['Bonjour, monde.']);
  assert.equal(registry.en, undefined);
  assert.equal(JSON.stringify(registry), before);
});

test('a future real language record can be registered without changing the resolver or French data', () => {
  const english = record({ language: 'en', segments: [{ startSeconds: 0, text: 'Hello world.', wordTimings: [
    { text: 'Hello', tokenIndex: 0, startSeconds: .15, endSeconds: .6 },
    { text: 'world', tokenIndex: 1, startSeconds: .7, endSeconds: 1.1 },
  ] }], referenceOnlyParagraphs: [] });
  const registry: TranscriptRegistry = { fr: { '01': record() }, en: { '01': english } };
  const resolved = resolveTranscript('01', 'en', audio({ language: 'en' }), registry);
  assert.equal(resolved.mode, 'synchronized');
  assert.equal(resolved.contentLanguage, 'en');
  assert.equal(resolved.segments[0].wordTimings![0].text, 'Hello');
  const notAligned = resolveTranscript('01', 'en', audio({ language: 'en', sha256: 'b'.repeat(64) }), registry);
  assert.equal(notAligned.mode, 'static');
  assert.equal(notAligned.contentLanguage, 'en');
  assert.equal(notAligned.paragraphs[0], 'Hello world.');
});

test('a wrong station or language inside a registry is never displayed as matching content', () => {
  for (const invalid of [record({ id: '02' }), record({ language: 'en' })]) {
    const resolved = resolveTranscript('01', 'fr', audio(), { fr: { '01': invalid } });
    assert.equal(resolved.mode, 'missing');
    assert.equal(resolved.reason, 'transcript-identity-mismatch');
    assert.equal(resolved.contentLanguage, null);
    assert.deepEqual(resolved.paragraphs, []);
  }
  const missing = resolveTranscript('99', 'de', audio({ id: '99', language: 'de' }), {});
  assert.equal(missing.mode, 'missing');
  assert.deepEqual(missing.segments, []);
  const empty = resolveTranscript('01', 'fr', audio(), { fr: { '01': record({ segments: [], referenceOnlyParagraphs: [] }) } });
  assert.equal(empty.mode, 'missing');
  assert.equal(empty.reason, 'transcript-missing');
});

test('the French adapter resolves existing stations without mutating any accepted FR01–21 text or bound', () => {
  const ids = Object.keys(FRENCH_TRANSCRIPTS).filter((id) => id !== '22');
  const before = JSON.stringify(ids.map((id) => FRENCH_TRANSCRIPTS[id]));
  for (const id of ids) {
    const resolved = resolveTranscript(id, 'fr', getMediaResource(id, 'fr'));
    assert.equal(resolved.mode, 'synchronized', `${id}: ${resolved.reason}`);
    assert.deepEqual(resolved.segments, FRENCH_TRANSCRIPTS[id].segments);
  }
  assert.equal(JSON.stringify(ids.map((id) => FRENCH_TRANSCRIPTS[id])), before);
});
