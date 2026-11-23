import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createVisitorStore, hasListened, isConsulted, isDiscovered, mergeHeardRanges, VISITOR_STORAGE_KEY, LEGACY_VISITS_KEY, type VisitorStorage } from '../src/visit/visitorStore';

function storage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  let writes = 0;
  const adapter: VisitorStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); writes += 1; } };
  return { values, adapter, writes: () => writes };
}

function queuedLocks() {
  const requests: { write: () => void; resolve: () => void; reject: (error: Error) => void }[] = [];
  return {
    coordinate: (write: () => void) => new Promise<void>((resolve, reject) => requests.push({ write, resolve, reject })),
    async grant(index = 0) {
      await Promise.resolve();
      const [request] = requests.splice(index, 1);
      assert.ok(request, 'expected a queued write');
      request.write();
      request.resolve();
    },
    async reject() {
      await Promise.resolve();
      const request = requests.shift();
      assert.ok(request, 'expected a queued write');
      request.reject(new Error('Web Locks unavailable for this document'));
    },
  };
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

test('a native finish requires at least 90 percent and repeated finishes preserve the first completion', () => {
  let now = 100;
  const store = createVisitorStore(storage().adapter, () => now);
  const finish = { ...capture, positionSeconds: 100, ended: true };
  store.capturePlayback({ ...finish, playedRanges: [[0, 79.9], [90, 100]] });
  assert.equal(hasListened(store.getSnapshot().pieces['01']), false);

  now = 200;
  store.capturePlayback({ ...finish, playedRanges: [[0, 80], [90, 100]] });
  assert.equal(store.getSnapshot().pieces['01'].listening.fr?.completedAt, 200);

  now = 300;
  store.capturePlayback({ ...finish, playedRanges: [[90, 100]] });
  assert.equal(store.getSnapshot().pieces['01'].listening.fr?.completedAt, 200);
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
  for (const raw of ['', 'broken JSON', JSON.stringify({ version: 3, important: ['never delete'] })]) {
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

test('two queued tabs retain independent favorites and re-read current storage without losing pending changes', async () => {
  const disk = storage();
  const locks = queuedLocks();
  const first = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  const second = createVisitorStore(disk.adapter, () => 200, locks.coordinate);
  first.toggleFavorite('04');
  second.toggleFavorite('05');
  assert.equal(first.getSnapshot().pieces['04'].favorite, true);
  assert.equal(second.getSnapshot().pieces['05'].favorite, true);
  assert.equal(disk.writes(), 0);

  await locks.grant();
  assert.equal(await first.whenPersisted(), true);
  second.reloadFromStorage();
  assert.equal(second.getSnapshot().pieces['04'].favorite, true);
  assert.equal(second.getSnapshot().pieces['05'].favorite, true);
  assert.equal(disk.writes(), 1, 'storage notifications do not write');

  await locks.grant();
  assert.equal(await second.whenPersisted(), true);
  first.reloadFromStorage(); // A delayed notification reads the latest value, including both changes.
  assert.equal(first.getSnapshot().pieces['04'].favorite, true);
  assert.equal(first.getSnapshot().pieces['05'].favorite, true);
  assert.equal(disk.writes(), 2);
});

test('a checkpoint queued before seeing a favorite/discovery preserves both on commit', async () => {
  const disk = storage({ [LEGACY_VISITS_KEY]: '["07"]' });
  const locks = queuedLocks();
  const first = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  const second = createVisitorStore(disk.adapter, () => 200, locks.coordinate);
  first.toggleFavorite('01');
  first.markDiscovered('01');
  second.capturePlayback(capture);
  assert.equal(second.getSnapshot().pieces['01'].favorite, undefined);
  await locks.grant();
  await locks.grant();
  assert.equal(await second.whenPersisted(), true);
  const saved = createVisitorStore(disk.adapter).getSnapshot();
  assert.equal(saved.pieces['01'].favorite, true);
  assert.equal(saved.pieces['01'].discoveredAt, 100);
  assert.deepEqual(saved.pieces['01'].listening.fr?.heardRanges, [[0, 30]]);
  assert.equal(saved.pieces['07'].legacyConsulted, true);
  assert.equal(disk.values.get(LEGACY_VISITS_KEY), '["07"]');
});

test('a delayed same-identity checkpoint merges listened ranges without rolling back the latest resume position', async () => {
  const disk = storage();
  const locks = queuedLocks();
  const older = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  const newer = createVisitorStore(disk.adapter, () => 200, locks.coordinate);
  older.capturePlayback(capture);
  newer.capturePlayback({ ...capture, positionSeconds: 70, playedRanges: [[45, 70]] });
  await locks.grant(1);
  await locks.grant();
  assert.equal(await older.whenPersisted(), true);
  const saved = createVisitorStore(disk.adapter).getSnapshot();
  assert.deepEqual(saved.pieces['01'].listening.fr?.heardRanges, [[0, 30], [45, 70]]);
  assert.equal(saved.pieces['01'].listening.fr?.positionSeconds, 70);
  assert.equal(saved.lastPlayback?.positionSeconds, 70);
  assert.equal(saved.lastPlayback?.updatedAt, 200);
});

test('completion and the latest resume language both survive separate queued tabs and later replays', async () => {
  const disk = storage();
  const locks = queuedLocks();
  const first = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  const second = createVisitorStore(disk.adapter, () => 200, locks.coordinate);
  first.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[0, 100]], ended: true });
  second.capturePlayback({ ...capture, language: 'en', audioIdentity: 'english-mp3' });
  await locks.grant(1);
  await locks.grant();
  assert.equal(await first.whenPersisted(), true);
  assert.equal(first.getSnapshot().pieces['01'].listening.fr?.completedAt, 100);
  assert.equal(first.getSnapshot().lastPlayback?.language, 'en');
  const replay = createVisitorStore(disk.adapter, () => 300);
  replay.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[0, 100]], ended: true });
  assert.equal(replay.getSnapshot().pieces['01'].listening.fr?.completedAt, 100);
  assert.deepEqual(replay.getSnapshot().pieces['01'].listening.en?.heardRanges, [[0, 30]]);
});

test('a delayed checkpoint for an older audio identity updates its archive and keeps the newer recording active', async () => {
  const disk = storage();
  createVisitorStore(disk.adapter, () => 10).capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[0, 100]], ended: true });
  const locks = queuedLocks();
  const older = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  const newer = createVisitorStore(disk.adapter, () => 200, locks.coordinate);
  older.capturePlayback(capture);
  newer.capturePlayback({ ...capture, audioIdentity: 'new-fr-mp3', positionSeconds: 50, playedRanges: [[40, 50]] });
  await locks.grant(1);
  await locks.grant();
  assert.equal(await older.whenPersisted(), true);
  const saved = createVisitorStore(disk.adapter).getSnapshot();
  assert.equal(saved.lastPlayback?.audioIdentity, 'new-fr-mp3');
  assert.equal(saved.pieces['01'].listening.fr?.audioIdentity, 'new-fr-mp3');
  assert.deepEqual(saved.pieces['01'].archivedListening?.fr?.map(({ audioIdentity, completedAt }) => [audioIdentity, completedAt]), [['exact-mp3-a', 10]]);
});

test('a lock request failure keeps memory changes without writing outside the lock', async () => {
  const disk = storage();
  const locks = queuedLocks();
  const store = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  store.toggleFavorite('01');
  await locks.reject();
  assert.equal(await store.whenPersisted(), false);
  assert.equal(disk.writes(), 0);
  assert.equal(store.getSnapshot().pieces['01'].favorite, true);
  store.capturePlayback(capture);
  assert.equal(await store.whenPersisted(), false);
  assert.deepEqual(store.getSnapshot().pieces['01'].listening.fr?.heardRanges, [[0, 30]]);
  assert.equal(disk.writes(), 0);
});

test('future storage set after queuing a write is left untouched and reported as protected', async () => {
  const disk = storage();
  const locks = queuedLocks();
  const store = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  store.toggleFavorite('01');
  const future = JSON.stringify({ version: 3, important: [1, 2] });
  disk.values.set(VISITOR_STORAGE_KEY, future);
  await locks.grant();
  assert.equal(await store.whenPersisted(), false);
  assert.equal(store.getSnapshot().persistence, 'protected');
  assert.equal(store.getSnapshot().pieces['01'].favorite, true);
  assert.equal(disk.values.get(VISITOR_STORAGE_KEY), future);
});

test('fallback re-reads writes from a stale tab and keeps memory changes after LocalStorage rejects writes', async () => {
  const disk = storage();
  const first = createVisitorStore(disk.adapter, () => 100);
  let writeBlocked = true;
  const second = createVisitorStore({
    getItem: disk.adapter.getItem,
    setItem(key, value) {
      if (writeBlocked) throw new Error('quota');
      disk.adapter.setItem(key, value);
    },
  }, () => 200);
  first.toggleFavorite('01');
  second.markDiscovered('01');
  assert.equal(await second.whenPersisted(), false);
  second.reloadFromStorage();
  assert.equal(second.getSnapshot().pieces['01'].favorite, true);
  assert.equal(second.getSnapshot().pieces['01'].discoveredAt, 200);
  writeBlocked = false;
  second.capturePlayback(capture);
  assert.equal(await second.whenPersisted(), false);
  assert.deepEqual(second.getSnapshot().pieces['01'].listening.fr?.heardRanges, [[0, 30]]);
  assert.equal(createVisitorStore(disk.adapter).getSnapshot().pieces['01'].discoveredAt, undefined);
  assert.equal(disk.writes(), 1, 'memory-only mode does not retry writes in this document');
});

test('unlocked visitor writes rebase sequential edits from stale tabs and preserve completion and archives', () => {
  const disk = storage();
  let now = 100;
  const first = createVisitorStore(disk.adapter, () => ++now);
  const second = createVisitorStore(disk.adapter, () => ++now);
  first.toggleFavorite('01');
  second.toggleFavorite('02');
  first.capturePlayback(capture);
  second.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[30, 100]], ended: true });
  first.markDiscovered('01');

  const completed = createVisitorStore(disk.adapter).getSnapshot();
  assert.equal(completed.pieces['01'].favorite, true);
  assert.equal(completed.pieces['02'].favorite, true);
  assert.equal(isDiscovered(completed.pieces['01']), true);
  assert.deepEqual(completed.pieces['01'].listening.fr?.heardRanges, [[0, 100]]);
  assert.equal(hasListened(completed.pieces['01']), true);
  assert.equal(completed.lastPlayback?.positionSeconds, 100);

  second.capturePlayback({ ...capture, audioIdentity: 'next-mp3' });
  const updated = createVisitorStore(disk.adapter).getSnapshot();
  assert.deepEqual(updated.pieces['01'].archivedListening?.fr, [completed.pieces['01'].listening.fr]);
  assert.equal(updated.lastPlayback?.audioIdentity, 'next-mp3');
});

test('unlocked visitor writes can lose a competing edit between the last read and setItem', async (context) => {
  await context.test('favorite during a checkpoint write', () => {
    const disk = storage();
    const second = createVisitorStore(disk.adapter, () => 200);
    const first = createVisitorStore({
      getItem: disk.adapter.getItem,
      setItem(key, value) {
        second.toggleFavorite('01');
        disk.adapter.setItem(key, value);
      },
    }, () => 100);
    first.capturePlayback(capture);
    assert.equal(second.getSnapshot().pieces['01'].favorite, true);
    const reloaded = createVisitorStore(disk.adapter).getSnapshot();
    assert.equal(reloaded.lastPlayback?.positionSeconds, 30);
    assert.equal(reloaded.pieces['01'].favorite, undefined);
  });

  await context.test('completed listening during an older checkpoint write', () => {
    const disk = storage();
    createVisitorStore(disk.adapter, () => 50).capturePlayback(capture);
    const second = createVisitorStore(disk.adapter, () => 200);
    const first = createVisitorStore({
      getItem: disk.adapter.getItem,
      setItem(key, value) {
        second.capturePlayback({ ...capture, positionSeconds: 100, playedRanges: [[30, 100]], ended: true });
        disk.adapter.setItem(key, value);
      },
    }, () => 100);
    first.capturePlayback({ ...capture, positionSeconds: 55, playedRanges: [[30, 55]] });
    assert.equal(hasListened(second.getSnapshot().pieces['01']), true);
    const reloaded = createVisitorStore(disk.adapter).getSnapshot();
    assert.deepEqual(reloaded.pieces['01'].listening.fr?.heardRanges, [[0, 55]]);
    assert.equal(hasListened(reloaded.pieces['01']), false);
  });
});

test('visitor persistence waits for an ungranted lock and a discarded write leaves committed storage intact', async () => {
  const disk = storage({ [LEGACY_VISITS_KEY]: '["07"]' });
  const locks = queuedLocks();
  const closingTab = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  const survivingTab = createVisitorStore(disk.adapter, () => 200, locks.coordinate);
  closingTab.toggleFavorite('01');
  survivingTab.toggleFavorite('02');
  let settled = false;
  const waiting = closingTab.whenPersisted().then((persisted) => { settled = true; return persisted; });
  await new Promise<void>((resolve) => { setImmediate(resolve); });
  assert.equal(settled, false);
  assert.equal(disk.writes(), 0);

  await locks.reject();
  await locks.grant();
  assert.equal(await waiting, false);
  assert.equal(await survivingTab.whenPersisted(), true);
  assert.equal(closingTab.getSnapshot().pieces['01'].favorite, true);
  const reopened = createVisitorStore(disk.adapter).getSnapshot();
  assert.equal(reopened.pieces['01'], undefined);
  assert.equal(reopened.pieces['02'].favorite, true);
  assert.equal(disk.values.get(LEGACY_VISITS_KEY), '["07"]');
});

test('an older uncoordinated writer can overwrite a current tab commit', async () => {
  const olderSnapshot = JSON.stringify({ version: 2, pieces: { '02': { consulted: true, listening: {} } } });
  const disk = storage({ [VISITOR_STORAGE_KEY]: olderSnapshot });
  const locks = queuedLocks();
  const current = createVisitorStore(disk.adapter, () => 100, locks.coordinate);
  current.toggleFavorite('01');
  await locks.grant();
  assert.equal(await current.whenPersisted(), true);

  disk.adapter.setItem(VISITOR_STORAGE_KEY, olderSnapshot);
  current.reloadFromStorage();
  assert.equal(current.getSnapshot().pieces['01'], undefined);
  assert.equal(isConsulted(current.getSnapshot().pieces['02']), true);
  assert.equal(disk.writes(), 2, 'a storage notification does not overwrite the older writer');
});

test('a read failure after startup keeps the in-memory changes and prevents a destructive reload', async () => {
  const disk = storage();
  let readBlocked = false;
  const store = createVisitorStore({
    getItem(key) {
      if (readBlocked) throw new Error('denied');
      return disk.adapter.getItem(key);
    },
    setItem: disk.adapter.setItem,
  });
  store.markDiscovered('01');
  readBlocked = true;
  store.toggleFavorite('01');
  store.reloadFromStorage();
  assert.equal(await store.whenPersisted(), false);
  assert.equal(store.getSnapshot().pieces['01'].favorite, true);
  assert.equal(isDiscovered(store.getSnapshot().pieces['01']), true);
  assert.equal(disk.writes(), 1);
});
