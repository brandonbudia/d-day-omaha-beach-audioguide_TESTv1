import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getTimedTokens, getWordState, tokenizeTranscript } from '../src/audio/transcriptTiming';
import { STOPS } from '../src/data/stops';
import { LANGUAGES } from '../src/i18n/translations';
import { STOP01_ALIGNMENT_EVIDENCE } from '../src/data/stop01-word-timings.fr';
import { getMediaResource } from '../src/data/mediaCatalog';

test('station 01 timings refer to the exact MP3 that was aligned', () => {
  assert.equal(createHash('sha256').update(readFileSync(`public${STOP01_ALIGNMENT_EVIDENCE.audioPath}`)).digest('hex'), STOP01_ALIGNMENT_EVIDENCE.audioSha256);
  assert.equal(STOPS[0].timedTranscript?.reduce((count, segment) => count + (segment.wordTimings?.length ?? 0), 0), 77);
  assert.ok(STOPS.slice(1).every((stop) => !stop.timedTranscript?.some((segment) => segment.wordTimings?.length)));
});

test('22 unique stations retain all seven audio paths and their local cover images', () => {
  assert.equal(STOPS.length, 22);
  assert.equal(new Set(STOPS.map((stop) => stop.id)).size, 22);
  for (const stop of STOPS) {
    assert.ok(existsSync(`public${stop.imageUrl}`), stop.imageUrl);
    for (const language of LANGUAGES) assert.ok(existsSync(`public/audio/${language.code}/stop-${stop.id}.mp3`));
  }
});

test('punctuation is preserved outside spoken tokens and uncertain tokens may remain untimed', () => {
  const text = '« Ici commence… l’histoire. »';
  assert.deepEqual(tokenizeTranscript(text).map((token) => token[0]), ['Ici', 'commence', 'l’histoire']);
  assert.equal(getTimedTokens(text, [{ text: "l'histoire", tokenIndex: 2, startSeconds: 2, endSeconds: 3 }], 0, 4).length, 1);
  assert.deepEqual(getTimedTokens(text, [{ text: 'autre', tokenIndex: 2, startSeconds: 2, endSeconds: 3 }], 0, 4), []);
});

test('invalid, overlapping and out-of-segment word timings are rejected', () => {
  const words = [{ text: 'Ici', startSeconds: 0.5, endSeconds: 1 }, { text: 'commence', startSeconds: 1, endSeconds: 2 }];
  assert.equal(getTimedTokens('Ici commence', words, 0, 3).length, 2);
  for (const invalid of [NaN, Infinity, -1]) {
    assert.deepEqual(getTimedTokens('Ici commence', [{ ...words[0], startSeconds: invalid }, words[1]], 0, 3), []);
  }
  assert.deepEqual(getTimedTokens('Ici commence', [words[0], { ...words[1], startSeconds: 0.9 }], 0, 3), []);
  assert.deepEqual(getTimedTokens('Ici commence', words, 0, 1.5), []);
});

test('word state follows real time, including backwards seeks and a paused fixed time', () => {
  const word = { text: 'Ici', startSeconds: 0.5, endSeconds: 1 };
  assert.equal(getWordState(0.49, word), 'upcoming');
  assert.equal(getWordState(0.5, word), 'current');
  assert.equal(getWordState(0.75, word), 'current');
  assert.equal(getWordState(0.75, word), 'current');
  assert.equal(getWordState(1, word), 'read');
  assert.equal(getWordState(0.6, word), 'current');
});

test('all supplied word timings match the displayed text and phrase boundaries', () => {
  for (const stop of STOPS) {
    for (const [index, segment] of (stop.timedTranscript ?? []).entries()) {
      const words = segment.wordTimings ?? [];
      assert.equal(getTimedTokens(segment.text, words, segment.startSeconds, stop.timedTranscript?.[index + 1]?.startSeconds ?? stop.durationSeconds).length, words.length);
    }
  }
});

test('the shared player follows media events, preserves pause/seek and never simulates failed playback', async () => {
  class MediaMock extends EventTarget {
    currentTime = 0;
    duration = 114.169;
    playbackRate = 1;
    preload = '';
    src = '';
    readyState = 1;
    paused = true;
    error: object | null = null;
    rejectPlay = false;
    async play() {
      if (this.rejectPlay) throw new DOMException('Playback denied', 'NotAllowedError');
      this.paused = false;
      this.dispatchEvent(new Event('play'));
    }
    pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  }
  const media = new MediaMock();
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  Object.assign(globalThis, {
    Audio: class { constructor() { return media; } },
    window: { requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; }, cancelAnimationFrame: (id: number) => frames.delete(id) },
    localStorage: { getItem: () => 'invalid-language', setItem: () => {} },
  });
  const { audioPlayer } = await import('../src/audio/audioStore');
  assert.equal(audioPlayer.getState().language, 'fr');
  await audioPlayer.play();
  assert.equal(audioPlayer.getState().isPlaying, true);
  media.dispatchEvent(new Event('pause')); // A queued event from a previous source must not pause new playback.
  assert.equal(audioPlayer.getState().isPlaying, true);
  media.currentTime = 5.125;
  frames.values().next().value?.(100);
  assert.equal(audioPlayer.getState().currentTime, 5.125);
  audioPlayer.pause();
  assert.equal(audioPlayer.getState().isPlaying, false);
  assert.equal(audioPlayer.getState().currentTime, 5.125);
  media.currentTime = 2.25;
  media.dispatchEvent(new Event('seeked'));
  assert.equal(audioPlayer.getState().currentTime, 2.25);
  audioPlayer.setStop('02', false);
  assert.equal(audioPlayer.getState().currentStopId, '02');
  assert.equal(audioPlayer.getState().currentTime, 0);
  assert.equal(media.src, getMediaResource('02', 'fr').url);
  media.readyState = 0;
  audioPlayer.seek(8);
  media.duration = 4;
  media.readyState = 1;
  media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(audioPlayer.getState().currentTime, 4);
  audioPlayer.seek(0);
  media.currentTime = 0;
  media.rejectPlay = true;
  await audioPlayer.play();
  assert.equal(audioPlayer.getState().isPlaying, false);
  assert.equal(audioPlayer.getState().error, 'playback');
  assert.equal(audioPlayer.getState().currentTime, 0);
  media.error = { code: 4 };
  media.dispatchEvent(new Event('error'));
  assert.equal(audioPlayer.getState().error, 'unavailable');
});
