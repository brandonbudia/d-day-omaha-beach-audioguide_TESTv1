import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INTERFACE_PREFERENCES_KEY, readInterfacePreferences, saveInterfacePreferences } from '../src/hooks/useInterfacePreferences';

function storage(initial: string | null = null) {
  let raw = initial;
  const writes: string[] = [];
  return {
    getItem(key: string) { assert.equal(key, INTERFACE_PREFERENCES_KEY); return raw; },
    setItem(key: string, value: string) { assert.equal(key, INTERFACE_PREFERENCES_KEY); raw = value; writes.push(value); },
    get raw() { return raw; },
    writes,
  };
}

test('global contrast and text size survive a save/reload independently from theme or reading preferences', () => {
  const target = storage();
  assert.deepEqual(readInterfacePreferences(target), { highContrast: false, largeText: false });
  assert.equal(saveInterfacePreferences(target, { highContrast: true, largeText: true }), true);
  assert.deepEqual(readInterfacePreferences(target), { highContrast: true, largeText: true });
  assert.equal(saveInterfacePreferences(target, { highContrast: false, largeText: true }), true);
  assert.deepEqual(readInterfacePreferences(target), { highContrast: false, largeText: true });
  assert.equal(JSON.parse(target.raw!).version, 1);
});

test('existing document choices provide defaults and unrelated saved fields survive a normal update', () => {
  const fallback = { highContrast: true, largeText: false };
  assert.deepEqual(readInterfacePreferences(storage(), fallback), fallback);
  const target = storage(JSON.stringify({ version: 1, largeText: true, museumCustomChoice: { retained: true } }));
  assert.deepEqual(readInterfacePreferences(target, fallback), { highContrast: true, largeText: true });
  assert.equal(saveInterfacePreferences(target, { highContrast: false, largeText: true }), true);
  assert.deepEqual(JSON.parse(target.raw!), { version: 1, largeText: true, museumCustomChoice: { retained: true }, highContrast: false });
});

test('malformed, unknown and future stored preferences remain byte-for-byte untouched', () => {
  for (const raw of ['{broken', 'null', '[]', 'true', '{}', '{"version":2,"highContrast":true}', '{"version":1,"largeText":"true"}']) {
    const target = storage(raw);
    assert.deepEqual(readInterfacePreferences(target), { highContrast: false, largeText: false });
    assert.equal(saveInterfacePreferences(target, { highContrast: true, largeText: true }), false, raw);
    assert.equal(target.raw, raw);
    assert.equal(target.writes.length, 0);
  }
});

test('storage denial never prevents in-memory controls or replaces inaccessible data', () => {
  const denied = { getItem(): string | null { throw new Error('denied'); }, setItem() { throw new Error('unexpected write'); } };
  assert.deepEqual(readInterfacePreferences(denied, { highContrast: true, largeText: true }), { highContrast: true, largeText: true });
  assert.equal(saveInterfacePreferences(denied, { highContrast: true, largeText: true }), false);
  assert.equal(saveInterfacePreferences(null, { highContrast: false, largeText: false }), false);
  const full = { getItem: () => null, setItem() { throw new Error('quota'); } };
  assert.equal(saveInterfacePreferences(full, { highContrast: true, largeText: false }), false);
});
