import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLoadedTranscript, loadTranscript } from '../src/data/loadTranscript';
import { getMediaResource } from '../src/data/mediaCatalog';
import { STOPS } from '../src/data/stops';
import { resolveTranscript } from '../src/data/transcripts';
import { LANGUAGES } from '../src/i18n/translations';

test('concurrent language or station selections resolve their own transcript, and the cache respects audio identity', async () => {
  const french = getMediaResource('10', 'fr');
  const english = getMediaResource('10', 'en');
  const otherFrench = getMediaResource('22', 'fr');
  assert.equal(getLoadedTranscript('10', 'fr', french), undefined);
  const [first, latest, other] = await Promise.all([
    loadTranscript('10', 'fr', french),
    loadTranscript('10', 'en', english),
    loadTranscript('22', 'fr', otherFrench),
  ]);
  assert.deepEqual(first, resolveTranscript('10', 'fr', french));
  assert.deepEqual(latest, resolveTranscript('10', 'en', english));
  assert.deepEqual(other, resolveTranscript('22', 'fr', otherFrench));
  assert.deepEqual(getLoadedTranscript('22', 'fr', otherFrench), other);
  const mismatched = { ...otherFrench, sha256: '0'.repeat(64) };
  assert.equal(getLoadedTranscript('22', 'fr', mismatched)?.mode, 'static');
  assert.equal(getLoadedTranscript('22', 'fr', mismatched)?.reason, 'audio-hash-mismatch');
  assert.equal(getLoadedTranscript('10', 'de', getMediaResource('10', 'de')), undefined);
});

test('the selected-language loader reproduces the complete registry for all 154 station and language pairs', async () => {
  for (const { code } of LANGUAGES) for (const { id } of STOPS) {
    const resource = getMediaResource(id, code);
    assert.deepEqual(await loadTranscript(id, code, resource), resolveTranscript(id, code, resource), `${code}/${id}`);
  }
});

test('a missing transcript stays missing once the existing French fallback has been checked', async () => {
  const missing = getMediaResource('99', 'de');
  const expected = resolveTranscript('99', 'de', missing);
  assert.equal(expected.mode, 'missing');
  assert.deepEqual(await loadTranscript('99', 'de', missing), expected);
  assert.deepEqual(getLoadedTranscript('99', 'de', missing), expected);
});
