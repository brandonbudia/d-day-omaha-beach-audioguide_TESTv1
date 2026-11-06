import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FRENCH_TRANSCRIPTS, FRENCH_TRANSCRIPT_EVIDENCE } from '../src/data/frenchTranscripts';
import { STOPS } from '../src/data/stops';
import { getTimedTokens, getWordState, tokenizeTranscript } from '../src/audio/transcriptTiming';
import { SyncedTranscript } from '../src/components/SyncedTranscript';
import transcriptSource from '../src/data/french-transcripts.fr.json';

test('French data covers the exact 22 MP3s and immutable supplied reference', () => {
  assert.deepEqual(Object.keys(FRENCH_TRANSCRIPTS).sort(), STOPS.map((stop) => stop.id).sort());
  assert.equal(FRENCH_TRANSCRIPT_EVIDENCE.referenceSha256, 'a0d9e5d6eb83fc2ea7f0c98fad471fbff4882b71a0dbdcea4b710eb3cdc1db34');
  const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
  assert.equal(sha(FRENCH_TRANSCRIPT_EVIDENCE.referencePath), FRENCH_TRANSCRIPT_EVIDENCE.referenceSha256);
  for (const [id, transcript] of Object.entries(FRENCH_TRANSCRIPTS)) {
    assert.equal(sha(`public/audio/fr/stop-${id}.mp3`), transcript.audioSha256, `stale audio ${id}`);
  }
  assert.equal(FRENCH_TRANSCRIPT_EVIDENCE.interpolation, 'none');
  assert.equal(FRENCH_TRANSCRIPT_EVIDENCE.humanListeningReviewed, false);
});

test('all displayed French timings survive runtime validation and never overlap', () => {
  for (const [id, transcript] of Object.entries(FRENCH_TRANSCRIPTS)) {
    let previousEnd = 0;
    let total = 0;
    for (const [index, segment] of transcript.segments.entries()) {
      const supplied = segment.wordTimings ?? [];
      const accepted = getTimedTokens(segment.text, supplied, segment.startSeconds, transcript.segments[index + 1]?.startSeconds ?? transcript.durationSeconds);
      assert.equal(accepted.length, supplied.length, `runtime rejection ${id}/${index}`);
      for (const word of accepted) {
        assert.ok(word.startSeconds >= previousEnd, `overlap ${id}/${index}/${word.text}`);
        assert.ok(word.endSeconds <= transcript.durationSeconds, `outside audio ${id}`);
        assert.ok(word.endSeconds - word.startSeconds <= 2.5, `word includes a suspicious silence ${id}/${word.text}`);
        previousEnd = word.endSeconds;
      }
      total += accepted.length;
    }
    assert.equal(total, transcript.timedWords, `coverage mismatch ${id}`);
    assert.equal(transcript.unresolvedWords.length, transcript.totalWords - transcript.timedWords, `missing word accounting ${id}`);
    if (id !== '22') {
      for (const word of transcript.unresolvedWords) {
        assert.equal(tokenizeTranscript(transcript.segments[word.segmentIndex!].text)[word.tokenIndex][0], word.text);
      }
    }
  }
});

test('all 77 previously accepted station 01 bounds are preserved exactly', () => {
  const original = STOPS[0].timedTranscript!.flatMap((segment) => segment.wordTimings ?? []);
  const current = FRENCH_TRANSCRIPTS['01'].segments.flatMap((segment) => segment.wordTimings ?? []);
  assert.equal(original.length, 77);
  for (const word of original) {
    assert.ok(current.some((candidate) => candidate.startSeconds === word.startSeconds && candidate.endSeconds === word.endSeconds && candidate.text.toLocaleLowerCase('fr') === word.text.toLocaleLowerCase('fr')), word.text);
  }
});

test('station 01 seventh block restores the short à without shifting any existing word', () => {
  const transcript = FRENCH_TRANSCRIPTS['01'];
  const segment = transcript.segments[6];
  const accepted = getTimedTokens(segment.text, segment.wordTimings ?? [], segment.startSeconds, transcript.segments[7].startSeconds);
  assert.equal(tokenizeTranscript(segment.text).length, 36);
  assert.equal(accepted.length, 36);
  const word = accepted.find((candidate) => candidate.tokenIndex === 10)!;
  assert.deepEqual(word, { text: 'à', tokenIndex: 10, startSeconds: 45.533, endSeconds: 45.573 });
  assert.equal(getWordState(45.532, word), 'upcoming');
  assert.equal(getWordState(45.553, word), 'current');
  assert.equal(getWordState(45.574, word), 'read');
  assert.equal(accepted.filter((candidate) => getWordState(45.553, candidate) === 'current').length, 1);
  assert.equal(transcript.timedWords, transcript.totalWords);
  assert.deepEqual(transcript.unresolvedWords, []);

  // Snapshot of every pre-existing bound before this single-word repair.
  // This guards all 22 stations without relying on a Git checkout at test time.
  const preserved = Object.fromEntries(Object.entries(transcriptSource.stations).map(([id, record]) => [
    id,
    record.segments.map((item, segmentIndex) => item.timings.filter(([tokenIndex]) => !(id === '01' && segmentIndex === 6 && tokenIndex === 10))),
  ]));
  assert.equal(createHash('sha256').update(JSON.stringify(preserved)).digest('hex'), '302bb83e8bbd06ce65364c4628688f6e9402d64fa753d326a2ff1a6c2f4046af');
});

test('recovered French narration replaces snippets and leaves absent document passages separate', () => {
  for (const stop of STOPS.slice(0, 21)) {
    assert.ok(FRENCH_TRANSCRIPTS[stop.id].totalWords > stop.transcript.reduce((count, item) => count + tokenizeTranscript(item.text).length, 0), stop.id);
  }
  assert.match(FRENCH_TRANSCRIPTS['09'].segments.map((s) => s.text).join(' '), /Heinrich Severloh/);
  assert.match(FRENCH_TRANSCRIPTS['12'].segments.map((s) => s.text).join(' '), /Big Red One/);
  assert.match(FRENCH_TRANSCRIPTS['18'].segments.map((s) => s.text).join(' '), /La mer était alors entre deux marées/);
  assert.match(FRENCH_TRANSCRIPTS['19'].segments.map((s) => s.text).join(' '), /proposèrent de vendre une machine Enigma/);
  assert.ok(FRENCH_TRANSCRIPTS['02'].referenceOnlyParagraphs.length > 0);
  const placeholder = FRENCH_TRANSCRIPTS['22'];
  assert.equal(placeholder.verification, 'audio-unavailable');
  assert.equal(placeholder.totalWords, 326);
  assert.equal(placeholder.timedWords, 0);
  assert.deepEqual(placeholder.segments, []);
  const eighteen = FRENCH_TRANSCRIPTS['18'];
  assert.ok(eighteen.segments.every((segment) => !/Amara\.org|merde de drogue/.test(segment.text)));
});

test('every accepted word is selected alone at its acoustic position, including backwards seeks', () => {
  for (const transcript of Object.values(FRENCH_TRANSCRIPTS)) {
    const words = transcript.segments.flatMap((segment) => segment.wordTimings ?? []);
    for (const word of [...words].reverse()) {
      const time = (word.startSeconds + word.endSeconds) / 2;
      assert.equal(getWordState(time, word), 'current');
      assert.equal(words.filter((candidate) => getWordState(time, candidate) === 'current').length, 1);
      assert.equal(getWordState(time, word), 'current'); // A paused clock preserves selection.
    }
  }
});

test('rendered French transcript exposes one current word at start, middle and end', () => {
  for (const transcript of Object.values(FRENCH_TRANSCRIPTS)) {
    const words = transcript.segments.flatMap((segment) => segment.wordTimings ?? []);
    if (!words.length) continue;
    for (const word of [words[0], words[Math.floor(words.length / 2)], words.at(-1)!]) {
      const html = renderToStaticMarkup(<SyncedTranscript segments={transcript.segments} currentTime={(word.startSeconds + word.endSeconds) / 2} textSize={26} onSelectPhrase={() => {}} />);
      assert.equal((html.match(/data-word-state="current"/g) ?? []).length, 1);
      assert.equal((html.match(/class="transcript-word"/g) ?? []).length, transcript.timedWords);
    }
  }
});
