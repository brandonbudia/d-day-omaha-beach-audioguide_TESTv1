import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { getWordState } from '../src/audio/transcriptTiming';
import { MEDIA_CATALOG, getMediaResource } from '../src/data/mediaCatalog';
import { getStopLabel } from '../src/data/stopLabels';
import { STOPS } from '../src/data/stops';
import { resolveTranscript, TRANSCRIPT_REGISTRY, type TranscriptRecord } from '../src/data/transcripts';
import { LANGUAGES, translations } from '../src/i18n/translations';

const expectedIds = Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0'));

test('the tour keeps its 22 ordered stations, readable labels and locally available cover images', () => {
  assert.deepEqual(STOPS.map((stop) => stop.id), expectedIds);
  assert.deepEqual(STOPS.map((stop) => stop.number), expectedIds);
  for (const stop of STOPS) {
    assert.ok(stop.detailDescription.trim(), stop.id);
    assert.match(stop.imageUrl, /^\/images\//, stop.id);
    assert.ok(existsSync(new URL('../public' + stop.imageUrl, import.meta.url)), stop.imageUrl);
    for (const { code } of LANGUAGES) {
      for (const field of ['title', 'shortTitle', 'playerTitle'] as const) {
        const label = getStopLabel(stop, code, field);
        assert.ok(label.text.trim(), `${code}/${stop.id}/${field}`);
        assert.equal(label.language, code === 'en' ? 'en' : 'fr');
      }
    }
  }
});

test('the seven locales expose all current interface keys and nonempty labels', () => {
  assert.deepEqual(LANGUAGES.map(({ code }) => code).sort(), ['de', 'en', 'es', 'fr', 'it', 'nl', 'pl']);
  const keys = Object.keys(translations.fr).sort();
  for (const { code, name } of LANGUAGES) {
    assert.ok(name.trim(), code);
    assert.deepEqual(Object.keys(translations[code]).sort(), keys, code);
    for (const [key, value] of Object.entries(translations[code])) {
      assert.ok(value.trim(), `${code}/${key}`);
    }
  }
});

test('the 154 catalogue identities resolve the correct narration and timing contract', async (context) => {
  for (const { code } of LANGUAGES) {
    await context.test(code, () => {
      const records = TRANSCRIPT_REGISTRY[code];
      assert.ok(records);
      assert.deepEqual(Object.keys(MEDIA_CATALOG[code]).sort(), expectedIds);
      assert.deepEqual(Object.keys(records).sort(), expectedIds);
      const followsWords = code === 'fr' || code === 'en';
      for (const id of expectedIds) {
        const identity = `${code}/${id}`;
        const media = getMediaResource(id, code);
        const record: TranscriptRecord = records[id];
        assert.equal(media.status, 'ready', identity);
        assert.deepEqual([media.language, media.id, record.language, record.id], [code, id, code, id]);
        assert.match(media.sha256, /^[a-f0-9]{64}$/, identity);
        assert.equal(record.audioSha256, media.sha256, identity);
        assert.equal(media.url, `/audio/${code}/stop-${id}.mp3?v=${media.sha256}`, identity);
        assert.ok(Number.isSafeInteger(media.bytes) && media.bytes > 0, identity);
        assert.ok(Number.isFinite(media.durationSeconds) && media.durationSeconds > 0, identity);
        assert.ok(record.durationSeconds !== null && Math.abs(record.durationSeconds - media.durationSeconds) <= 0.05, identity);
        const transcript = resolveTranscript(id, code, media);
        assert.equal(transcript.mode, followsWords ? 'synchronized' : 'phrase-synchronized', identity);
        assert.equal(transcript.contentLanguage, code, identity);
        assert.ok(transcript.segments.length, identity);
        let previousEnd = 0;
        for (const [index, segment] of transcript.segments.entries()) {
          const { startSeconds } = segment;
          const endSeconds = followsWords
            ? transcript.segments[index + 1]?.startSeconds ?? Math.min(media.durationSeconds, record.durationSeconds)
            : segment.endSeconds;
          assert.ok(segment.text.trim(), identity);
          assert.ok(Number.isFinite(startSeconds) && startSeconds >= previousEnd, identity);
          assert.ok(typeof endSeconds === 'number' && Number.isFinite(endSeconds) && endSeconds > startSeconds, identity);
          assert.ok(endSeconds <= media.durationSeconds + 0.05, identity);
          previousEnd = endSeconds;
        }
        const words = transcript.segments.flatMap((segment) => segment.wordTimings ?? []);
        if (followsWords) {
          assert.ok(words.length, identity);
          assert.equal(getWordState(words[0].startSeconds - 0.001, words[0]), 'upcoming', identity);
          assert.equal(getWordState(words.at(-1)!.endSeconds, words.at(-1)!), 'read', identity);
        } else {
          assert.equal(words.length, 0, identity);
        }
        const changed = resolveTranscript(id, code, { ...media, sha256: '0'.repeat(64) });
        assert.equal(changed.mode, 'static', identity);
        assert.equal(changed.segments.length, 0, identity);
        assert.ok(changed.paragraphs.some((text) => text.trim()), identity);
      }
    });
  }
});
