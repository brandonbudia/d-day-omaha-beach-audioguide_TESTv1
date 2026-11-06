import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createVisitorStore, hasListened, isConsulted, isDiscovered, mergeHeardRanges, VISITOR_STORAGE_KEY, LEGACY_VISITS_KEY, type VisitorStorage } from '../src/visit/visitorStore';

function storage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  let writes = 0;
  const adapter: VisitorStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); writes += 1; } };
  return { values, adapter, writes: () => writes };
}
const capture = { id: '01', language: 'fr' as const, positionSeconds: 30, durationSeconds: 100, playedRanges: [[0, 30]] as [number, number][], audioIdentity: 'exact-mp3-a' };

test('legacy consultations migrate without rewriting their storage or creating listened, discovered or favorite data', () => {
  const legacy = JSON.stringify(['01', '02', '02', '99', 8]);
  const disk = storage({ [LEGACY_VISITS_KEY]: legacy });
  const store = createVisitorStore(disk.adapter);
  assert.equal(disk.writes(), 0);
  assert.equal(store.getSnapshot(), store.getSnapshot());
  assert.equal(isConsulted(store.getSnapshot().pieces['01']), true);
  assert.equal(hasListened(store.getSnapshot().pieces['01']), false);
  assert.equal(isDiscovered(store.getSnapshot().pieces['01']), false);
  assert.equal(store.getSnapshot().pieces['01'].favorite, undefined);
  assert.equal(store.getSnapshot().lastConsultedId, undefined);
  assert.deepEqual(store.getSnapshot().legacyConsultedIds, ['01', '02']);
  store.recordConsulted('03');
  assert.equal(disk.values.get(LEGACY_VISITS_KEY), legacy);
  const reloaded = createVisitorStore(disk.adapter);
  assert.equal(isConsulted(reloaded.getSnapshot().pieces['01']), true);
  assert.equal(isConsulted(reloaded.getSnapshot().pieces['03']), true);
  assert.equal(reloaded.getSnapshot().lastConsultedId, '03');
});

test('favorites are shared, immediately notified, durable and independent of catalogue defaults', () => {
  const disk = storage();
  const store = createVisitorStore(disk.adapter);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => { notifications += 1; });
  const before = store.getSnapshot();
  store.toggleFavorite('05');
  assert.equal(notifications, 1);
  assert.notEqual(store.getSnapshot(), before);
  assert.equal(store.getSnapshot().pieces['05'].favorite, true);
  const reloaded = createVisitorStore(disk.adapter);
  assert.equal(reloaded.getSnapshot().pieces['05'].favorite, true);
  reloaded.toggleFavorite('05');
  assert.equal(createVisitorStore(disk.adapter).getSnapshot().pieces['05'].favorite, false);
  unsubscribe();
});

test('manual discovery does not invent an audio completion and survives reload', () => {
  const disk = storage();
  const store = createVisitorStore(disk.adapter, () => 12345);
  store.markDiscovered('07');
  assert.equal(isDiscovered(store.getSnapshot().pieces['07']), true);
  assert.equal(hasListened(store.getSnapshot().pieces['07']), false);
  assert.equal(store.getSnapshot().pieces['07'].discoveredAt, 12345);
  assert.equal(isDiscovered(createVisitorStore(disk.adapter).getSnapshot().pieces['07']), true);
});

test('seeking to the end never credits unplayed time or completes a nearly finished but unheard tail', () => {
  const store = createVisitorStore(storage().adapter);
  store.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [], ended: true });
  assert.equal(store.getSnapshot().lastPlayback, undefined);
  store.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[0, 10]], ended: true });
  assert.equal(hasListened(store.getSnapshot().pieces['01']), false);
  store.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[0, 95]], ended: true });
  assert.equal(hasListened(store.getSnapshot().pieces['01']), false);
  store.capturePlayback({ ...capture, positionSeconds: 99.99, playedRanges: [[99.9, 100]], ended: true });
  assert.equal(hasListened(store.getSnapshot().pieces['01']), false);
});

test('real played intervals accumulate across sessions, are not double counted and require a native finish', () => {
  const disk = storage();
  let store = createVisitorStore(disk.adapter);
  store.capturePlayback(capture);
  store = createVisitorStore(disk.adapter);
  store.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[25, 60], [60, 100]], ended: false });
  assert.equal(hasListened(store.getSnapshot().pieces['01']), false);
  assert.deepEqual(store.getSnapshot().pieces['01'].listening.fr?.heardRanges, [[0, 100]]);
  store.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[60, 100]], ended: true });
  assert.equal(hasListened(store.getSnapshot().pieces['01']), true);
  assert.equal(isDiscovered(store.getSnapshot().pieces['01']), true);
  assert.equal(hasListened(createVisitorStore(disk.adapter).getSnapshot().pieces['01']), true);
});

test('a replaced MP3 archives old completion without using it to complete the new recording', () => {
  const store = createVisitorStore(storage().adapter, () => 12345);
  store.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[0, 100]], ended: true });
  store.capturePlayback({ ...capture, audioIdentity: 'new-mp3-b', playedRanges: [[0, 3]], positionSeconds: 3 });
  const piece = store.getSnapshot().pieces['01'];
  assert.equal(hasListened(piece), false);
  assert.equal(piece.archivedListening?.fr?.[0].completedAt, 12345);
  assert.equal(piece.archivedListening?.fr?.[0].audioIdentity, 'exact-mp3-a');
  assert.equal(isDiscovered(piece), true);
  assert.equal(store.getSnapshot().lastPlayback?.audioIdentity, 'new-mp3-b');
});

test('consulted and listened pointers are distinct; changing language cannot duplicate a discovered piece', () => {
  const store = createVisitorStore(storage().adapter);
  store.recordConsulted('07');
  store.capturePlayback(capture);
  store.capturePlayback({ ...capture, language: 'en', audioIdentity: 'english-mp3', playedRanges: [[0, 100]], positionSeconds: 100, ended: true });
  assert.equal(store.getSnapshot().lastConsultedId, '07');
  assert.equal(store.getSnapshot().lastListenedId, '01');
  assert.equal(store.getSnapshot().lastPlayback?.language, 'en');
  assert.equal(Object.values(store.getSnapshot().pieces).filter(isDiscovered).length, 1);
});

test('malformed and future-version storage remains untouched; storage denial does not break in-memory use', () => {
  for (const raw of ['broken JSON', JSON.stringify({ version: 3, important: ['never delete'] })]) {
    const disk = storage({ [VISITOR_STORAGE_KEY]: raw });
    const store = createVisitorStore(disk.adapter);
    store.markDiscovered('01');
    assert.equal(store.getSnapshot().persistence, 'protected');
    assert.equal(disk.values.get(VISITOR_STORAGE_KEY), raw);
    assert.equal(disk.writes(), 0);
  }
  const blocked = createVisitorStore({ getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
  blocked.toggleFavorite('01');
  assert.equal(blocked.getSnapshot().pieces['01'].favorite, true);
  assert.equal(blocked.getSnapshot().persistence, 'memory');
});

test('unknown root and piece data survive normal saves and invalid IDs never enter progress', () => {
  const disk = storage({ [VISITOR_STORAGE_KEY]: JSON.stringify({ version: 2, pieces: { '01': { consulted: true, listening: {}, authorAddition: 'keep' }, '99': { preserve: true } }, authorMetadata: { extra: 42 } }) });
  const store = createVisitorStore(disk.adapter);
  store.toggleFavorite('01');
  const again = createVisitorStore(disk.adapter);
  again.recordConsulted('02');
  const final = createVisitorStore(disk.adapter).getSnapshot();
  assert.equal(final.pieces['01'].authorAddition, 'keep');
  assert.deepEqual(final.authorMetadata, { extra: 42 });
  assert.deepEqual(final.preservedUnknownPieces, { '99': { preserve: true } });
  again.markDiscovered('99');
  assert.equal(again.getSnapshot().pieces['99'], undefined);
});

test('unknown languages and malformed listening data are preserved without crediting progress', () => {
  const disk = storage({ [VISITOR_STORAGE_KEY]: JSON.stringify({ version: 2, pieces: { '01': { listening: { futureLanguage: { extra: 'keep' }, fr: 'not a record' }, archivedListening: { fr: ['keep invalid archive'], futureLanguage: [1, 2] } }, '02': ['keep invalid piece'] } }) });
  const store = createVisitorStore(disk.adapter);
  store.toggleFavorite('01');
  const again = createVisitorStore(disk.adapter);
  again.recordConsulted('02');
  const final = createVisitorStore(disk.adapter).getSnapshot();
  assert.equal(hasListened(final.pieces['01']), false);
  assert.deepEqual(final.pieces['01'].preservedUnrecognizedPlayback, { listening: { futureLanguage: { extra: 'keep' }, fr: 'not a record' }, archivedListening: { fr: ['keep invalid archive'], futureLanguage: [1, 2] } });
  assert.deepEqual(final.pieces['02'].preservedInvalidPiece, ['keep invalid piece']);
});

test('played range validation excludes malformed, negative, overlapping and out-of-duration values', () => {
  assert.deepEqual(mergeHeardRanges([[10, 20], [0, 11], [-5, 1], [99, 130], [5, 5], [NaN, 4]], 100), [[0, 20], [99, 100]]);
});
