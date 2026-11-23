import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createVisitorStore, VISITOR_STORAGE_KEY } from '../src/visit/visitorStore';
import { createIndexedDBWriteCoordinator, VISITOR_COORDINATION_DB } from '../src/visit/visitorWriteCoordinator';

function indexedDBFixture() {
  type EventHandler = () => void;
  const calls: string[] = [];
  const sentinel = { onsuccess: undefined as EventHandler | undefined, onerror: undefined as EventHandler | undefined, error: null as DOMException | null };
  const transaction = {
    onabort: undefined as EventHandler | undefined,
    error: null as DOMException | null,
    objectStore(name: string) {
      calls.push(`store ${name}`);
      return { get(key: string) { calls.push(`get ${key}`); return sentinel; } };
    },
    abort() { calls.push('abort'); this.onabort?.(); },
  };
  const database = {
    createObjectStore(name: string) { calls.push(`create ${name}`); },
    transaction(store: string, mode: string) { calls.push(`${mode} ${store}`); return transaction; },
    close() { calls.push('close'); },
  };
  const opening = {
    result: database,
    transaction,
    onerror: undefined as EventHandler | undefined,
    onupgradeneeded: undefined as EventHandler | undefined,
    onsuccess: undefined as EventHandler | undefined,
    error: null as DOMException | null,
  };
  const factory = {
    open(name: string, version?: number) {
      calls.push(`open ${name} ${version}`);
      return opening as unknown as IDBOpenDBRequest;
    },
  };
  return { calls, factory, opening, transaction, sentinel };
}

test('IndexedDB constructs an empty gate and runs the visitor write only on the exclusive sentinel', async () => {
  const fixture = indexedDBFixture();
  const coordinate = createIndexedDBWriteCoordinator(fixture.factory);
  const committed = coordinate(() => { fixture.calls.push('LocalStorage'); });
  fixture.opening.onupgradeneeded?.();
  fixture.opening.onsuccess?.();
  const before = [`open ${VISITOR_COORDINATION_DB} 1`, 'create gate', 'readwrite gate', 'store gate', 'get visitor'];
  assert.deepEqual(fixture.calls, before);
  fixture.sentinel.onsuccess?.();
  assert.deepEqual(fixture.calls, [...before, 'LocalStorage', 'close']);
  await committed;
});

test('an IndexedDB open that outlives the deadline cannot create a gate or write visitor data', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const fixture = indexedDBFixture();
  const coordinate = createIndexedDBWriteCoordinator(fixture.factory);
  const expired = assert.rejects(coordinate(() => assert.fail('late write')), { name: 'TimeoutError' });
  context.mock.timers.tick(4_999);
  assert.deepEqual(fixture.calls, [`open ${VISITOR_COORDINATION_DB} 1`]);
  context.mock.timers.tick(1);
  await expired;
  fixture.opening.onupgradeneeded?.();
  fixture.opening.onsuccess?.();
  assert.deepEqual(fixture.calls, [`open ${VISITOR_COORDINATION_DB} 1`, 'abort', 'close']);
});

test('an expired IndexedDB transaction is aborted and a late sentinel cannot write visitor data', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const fixture = indexedDBFixture();
  const coordinate = createIndexedDBWriteCoordinator(fixture.factory, 100);
  const expired = assert.rejects(coordinate(() => assert.fail('late write')), { name: 'TimeoutError' });
  fixture.opening.onsuccess?.();
  context.mock.timers.tick(100);
  await expired;
  fixture.sentinel.onsuccess?.();
  assert.deepEqual(fixture.calls, [`open ${VISITOR_COORDINATION_DB} 1`, 'readwrite gate', 'store gate', 'get visitor', 'close', 'abort']);
});

test('closing an IndexedDB transaction before the sentinel preserves the committed data', async () => {
  const fixture = indexedDBFixture();
  const coordinate = createIndexedDBWriteCoordinator(fixture.factory);
  const aborted = assert.rejects(coordinate(() => assert.fail('aborted write')), { name: 'AbortError' });
  fixture.opening.onsuccess?.();
  fixture.transaction.abort();
  await aborted;
  fixture.sentinel.onsuccess?.();
  assert.deepEqual(fixture.calls.slice(-2), ['abort', 'close']);
});

test('an IndexedDB refusal retains the visitor edit in memory without an uncoordinated write', async () => {
  const fixture = indexedDBFixture();
  const coordinate = createIndexedDBWriteCoordinator(fixture.factory);
  const saved = JSON.stringify({ version: 2, pieces: { '01': { consulted: true, listening: {} } } });
  const store = createVisitorStore({
    getItem: (key) => key === VISITOR_STORAGE_KEY ? saved : null,
    setItem: () => assert.fail('uncoordinated LocalStorage write'),
  }, () => 100, coordinate);
  store.toggleFavorite('01');
  await Promise.resolve();
  fixture.opening.error = new DOMException('Denied', 'SecurityError');
  fixture.opening.onerror?.();
  assert.equal(await store.whenPersisted(), false);
  assert.equal(store.getSnapshot().persistence, 'memory');
  assert.equal(store.getSnapshot().pieces['01'].favorite, true);
  assert.equal(store.getSnapshot().pieces['01'].consulted, true);
  assert.deepEqual(fixture.calls, [`open ${VISITOR_COORDINATION_DB} 1`]);
});
