import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STOPS } from '../src/data/stops';
import { LANGUAGES } from '../src/i18n/translations';
import { ENGLISH_STOP_LABELS, ENGLISH_STOP_LABEL_EVIDENCE, getStopLabel } from '../src/data/stopLabels';
import { ENGLISH_TRANSCRIPT_EVIDENCE, ENGLISH_TRANSCRIPT_SOURCES } from '../src/data/englishTranscripts';
import { matchesStopSearch } from '../src/pages/ParcoursPage';

test('all 22 published English titles retain the matching narration source and review status', () => {
  assert.deepEqual(Object.keys(ENGLISH_STOP_LABELS).sort(), STOPS.map((stop) => stop.id).sort());
  assert.equal(ENGLISH_STOP_LABEL_EVIDENCE.sourceReferenceSha256, ENGLISH_TRANSCRIPT_EVIDENCE.sourceReferenceSha256);
  assert.equal(ENGLISH_STOP_LABEL_EVIDENCE.humanEditorialReviewed, false);
  for (const stop of STOPS) {
    const published = ENGLISH_STOP_LABELS[stop.id];
    assert.equal(published.sourceUrl, ENGLISH_TRANSCRIPT_SOURCES[stop.id].sourceUrl, stop.id);
    assert.equal(published.title, published.title.trim(), stop.id);
    assert.ok(published.title.length > 0, stop.id);
    assert.equal(new URL(published.sourceUrl).searchParams.get('hl'), 'en');
    assert.equal(getStopLabel(stop, 'en').text, `${stop.number}. ${published.title}`);
    assert.equal(getStopLabel(stop, 'en').language, 'en');
    assert.equal(getStopLabel(stop, 'en', 'shortTitle').text, published.title);
  }
  assert.equal(getStopLabel(STOPS.find((stop) => stop.id === '14')!, 'en').text, '14. SOE mannequin');
});

test('French and the five untranslated interfaces preserve all original title variants', () => {
  for (const { code } of LANGUAGES.filter(({ code }) => code !== 'en')) {
    for (const stop of STOPS) {
      for (const field of ['title', 'shortTitle', 'playerTitle'] as const) {
        const label = getStopLabel(stop, code, field);
        assert.equal(label.text, stop[field], `${code}/${stop.id}/${field}`);
        assert.equal(label.language, 'fr');
        assert.equal(label.sourceUrl, null);
      }
    }
  }
});

test('English visitors can search published names without losing French accent-insensitive search', () => {
  const engine = STOPS.find((stop) => stop.id === '02')!;
  assert.equal(matchesStopSearch(engine, 'engine', 'en'), true);
  assert.equal(matchesStopSearch(engine, 'moteur', 'en'), true);
  assert.equal(matchesStopSearch(STOPS.find((stop) => stop.id === '07')!, 'chaplain', 'en'), true);
  assert.deepEqual(STOPS.filter((stop) => matchesStopSearch(stop, 'resistance', 'en')).map((stop) => stop.id), ['14', '22']);
});
