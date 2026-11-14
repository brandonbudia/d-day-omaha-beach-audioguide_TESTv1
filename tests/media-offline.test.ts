import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { MEDIA_CATALOG, getMediaResource, getDownloadableAudio, getLanguageResourceSummary, SHARED_OFFLINE_RESOURCES, type OfflineResource } from '../src/data/mediaCatalog';
import { LANGUAGES, type SupportedLanguage } from '../src/i18n/translations';
import french from '../src/data/french-transcripts.fr.json';
import { resolveTranscript } from '../src/data/transcripts';
import { VERIFIED_MEDIA_CACHE, createOfflineStore, getOfflineResources, hasMatchingCachedShell, verifyCompleteResponse, type OfflineDependencies } from '../src/offline/offlineStore';

const subtle = webcrypto.subtle as SubtleCrypto;
const hash = (body: string | Uint8Array) => createHash('sha256').update(body).digest('hex');
const body = 'complete audio bytes';
const resource: OfflineResource = { url: '/audio/fr/stop-01.mp3?v=verified', bytes: Buffer.byteLength(body), sha256: hash(body) };

class MemoryCache {
  entries = new Map<string, Response>();
  async match(url: string, options?: CacheQueryOptions) {
    const key = options?.ignoreSearch ? [...this.entries.keys()].find((candidate) => {
      const cached = new URL(candidate), requested = new URL(url);
      return cached.origin === requested.origin && cached.pathname === requested.pathname;
    }) : url;
    return this.entries.get(key ?? '')?.clone();
  }
  async put(url: string, response: Response) { this.entries.set(url, response.clone()); }
}

function fixture(overrides: Partial<OfflineDependencies> = {}) {
  const cache = new MemoryCache();
  const names: string[] = [];
  const requests: { url: string; options?: RequestInit }[] = [];
  const dependencies: OfflineDependencies = {
    caches: { open: async (name: string) => { names.push(name); return cache; } },
    fetch: (async (url: string | URL | Request, options?: RequestInit) => { requests.push({ url: String(url), options }); return new Response(body); }) as typeof fetch,
    subtle, origin: 'https://guide.example', resources: () => [resource],
    shellAvailable: async () => true, estimateStorage: async () => ({ usage: 1234, quota: 100000 }),
    ...overrides,
  };
  return { cache, names, requests, dependencies, store: createOfflineStore(dependencies) };
}

test('catalogue reflects all 154 actual audio files and separates readiness from editorial review', async () => {
  const placeholder = 'eeb31574962689da3867ef0db9b71bd55c4bf9809069e06ce404c529c40e685d';
  const phraseStops: Partial<Record<SupportedLanguage, string[]>> = { de: Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0')), es: Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0')), pl: ['01', '02', '03', '04', '05', '06', '07', '09', '10', '15', '20', '22'], nl: ['01', '02', '03', '04', '05', '06', '07', '09', '16', '17', '18', '21'], it: ['01', '02', '03', '04', '05', '06', '07', '08', '15', '16', '17'] };
  const partiallyAligned = new Set(['nl09', 'it07', 'es06', 'pl01', 'es03', 'de14', 'es10', 'de02', 'de15', 'de20', 'es14', 'es19', 'es12', 'es15', 'it08', 'nl18', 'de06', 'de21', 'de22', 'nl21', 'it15', 'pl02', 'nl16', 'de13', 'de17', 'nl06', 'it03', 'de03', 'nl04', 'pl03', 'de04', 'nl17', 'it17', 'pl04', 'de09', 'de12', 'de18', 'nl01', 'it01', 'it16', 'pl05', 'nl02', 'nl03', 'it02', 'it04', 'it05', 'it06', 'nl05', 'nl07', 'pl06', 'pl07']);
  assert.equal(LANGUAGES.length, 7);
  for (const { code } of LANGUAGES) {
    assert.equal(Object.keys(MEDIA_CATALOG[code]).length, 22);
    for (const record of Object.values(MEDIA_CATALOG[code])) {
      const file = new URL(`../public/audio/${code}/stop-${record.id}.mp3`, import.meta.url);
      assert.equal((await stat(file)).size, record.bytes, `${code}-${record.id} bytes`);
      assert.equal(hash(await readFile(file)), record.sha256, `${code}-${record.id} hash`);
      assert.ok(record.durationSeconds > 0);
      assert.ok(record.url.endsWith(`?v=${record.sha256}`));
      if (code === 'fr') {
        const transcript = french.stations[record.id as keyof typeof french.stations];
        assert.equal(record.status, 'ready');
        assert.equal(record.sha256, transcript.audioSha256);
        assert.ok(Math.abs(record.durationSeconds - transcript.durationSeconds) < 0.1);
      } else if (code === 'en') {
        assert.equal(record.status, 'ready');
        assert.equal(record.reason, 'language-detected-editorial-review-pending');
        assert.notEqual(record.sha256, placeholder);
      } else if (phraseStops[code]?.includes(record.id)) {
        assert.equal(record.status, 'ready');
        assert.equal(record.reason, partiallyAligned.has(`${code}${record.id}`) ? 'wivi-narration-partially-aligned' : code === 'pl' ? 'synthetic-narration' : 'wivi-narration-compared');
        assert.notEqual(record.sha256, placeholder);
        assert.equal(resolveTranscript(record.id, code, record).mode, 'phrase-synchronized');
      } else {
        assert.equal(record.status, 'unavailable');
        assert.equal(record.sha256, placeholder);
      }
    }
  }
  assert.equal(getDownloadableAudio('fr').length, 22);
  assert.equal(getDownloadableAudio('en').length, 22);
  for (const language of ['de', 'es', 'it', 'nl', 'pl'] as const) {
    const expected = (phraseStops[language] ?? []).toSorted();
    assert.deepEqual(getDownloadableAudio(language).map(({ id }) => id).toSorted(), expected);
    assert.deepEqual(getOfflineResources(language).filter(({ url }) => url.startsWith('/audio/')).map(({ url }) => url).toSorted(),
      expected.map(id => getMediaResource(id, language).url));
  }
  assert.equal(getMediaResource('99', 'fr').status, 'unavailable');
  assert.equal(getLanguageResourceSummary('fr').unavailable, 0);
  assert.equal(getLanguageResourceSummary('en').ready, 22);
  assert.equal(getLanguageResourceSummary('en').editorialReviewRequired, 22);
  assert.equal(getLanguageResourceSummary('de').unavailable, 0);
  const restored = getMediaResource('22', 'fr');
  assert.equal(restored.reason, 'public-source-restored');
  assert.equal(restored.sha256, '7087e3c96086d3186c922812cef0ea3af3d908ec73675bfc6b1886c8b0731346');
  assert.equal(restored.durationSeconds, 142.0623);
  assert.ok(getOfflineResources('fr').some((resource) => resource.url === restored.url));
  assert.ok(!getOfflineResources('fr').some((resource) => resource.sha256 === placeholder));
});

test('offline packs include the exact local photographs and both reading fonts', async () => {
  assert.equal(SHARED_OFFLINE_RESOURCES.length, 25);
  assert.equal(SHARED_OFFLINE_RESOURCES.filter((item) => item.url.endsWith('.woff2')).length, 2);
  for (const record of SHARED_OFFLINE_RESOURCES) {
    const actual = await readFile(new URL(`../public${record.url}`, import.meta.url));
    assert.equal(actual.byteLength, record.bytes);
    assert.equal(hash(actual), record.sha256);
  }
  assert.equal(getOfflineResources('fr').length, 47);
  assert.equal(getOfflineResources('en').length, 47);
});

test('full-file verification requires HTTP 200, actual byte length and exact SHA256', async () => {
  assert.equal(Buffer.from(await verifyCompleteResponse(resource, new Response(body), subtle)).toString(), body);
  for (const [response, code] of [
    [new Response(body, { status: 206 }), 'partial-response'],
    [new Response(body, { headers: { 'content-range': 'bytes 0-19/20' } }), 'partial-response'],
    [new Response('not found', { status: 404 }), 'http'],
    [new Response(body.slice(1)), 'size-mismatch'],
    [new Response(body.replace('audio', 'other')), 'hash-mismatch'],
  ] as const) await assert.rejects(verifyCompleteResponse(resource, response, subtle), { code });
});

test('download saves only verified full files and recovers readiness from actual CacheStorage', async () => {
  const { cache, names, requests, dependencies, store } = fixture();
  assert.equal(store.getSnapshot(), store.getSnapshot(), 'stable external-store snapshot');
  await store.download('fr');
  const state = store.getSnapshot().packs.fr;
  assert.equal(state.status, 'ready');
  assert.equal(state.cachedAudioCount, 1);
  assert.equal(state.verifiedBytes, resource.bytes);
  assert.equal(state.shellReady, true);
  assert.equal(state.storageQuotaBytes, 100000);
  assert.deepEqual(names, [VERIFIED_MEDIA_CACHE]);
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0].url).searchParams.get('__dday_download'), '1');
  assert.equal(requests[0].options?.cache, 'no-store');
  assert.equal(await (await cache.match(`https://guide.example${resource.url}`))?.text(), body);
  const reloaded = createOfflineStore(dependencies);
  await reloaded.inspect('fr');
  assert.equal(reloaded.getSnapshot().packs.fr.status, 'ready');
  await reloaded.download('fr');
  assert.equal(requests.length, 1, 'valid cached files are not downloaded again');
});

test('corrupt cache entries are repaired from the network, never counted as verified', async () => {
  const { cache, requests, store } = fixture();
  await cache.put(`https://guide.example${resource.url}`, new Response('bad cache entry'));
  await store.inspect('fr');
  assert.equal(store.getSnapshot().packs.fr.verifiedCount, 0);
  assert.equal(store.getSnapshot().packs.fr.status, 'partial');
  await store.download('fr');
  assert.equal(requests.length, 1);
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
});

test('a failed download still counts verified audio cached after a missing file', async () => {
  const cached = { ...resource, url: '/audio/fr/stop-22.mp3?v=verified' };
  const attempted: string[] = [];
  const { store, cache } = fixture({
    resources: () => [resource, cached],
    fetch: (async (url: string | URL | Request) => {
      attempted.push(new URL(String(url)).pathname);
      throw new TypeError('No connection');
    }) as typeof fetch,
  });
  await cache.put(`https://guide.example${cached.url}`, new Response(body));
  await store.inspect('fr');
  assert.equal(store.getSnapshot().packs.fr.cachedAudioCount, 1);

  await store.download('fr');
  const state = store.getSnapshot();
  assert.equal(state.packs.fr.status, 'error');
  assert.equal(state.packs.fr.error, 'network');
  assert.equal(state.packs.fr.cachedAudioCount, 1);
  assert.equal(state.packs.fr.verifiedCount, 1);
  assert.equal(state.packs.fr.verifiedBytes, cached.bytes);
  assert.equal(state.activeLanguage, null);
  assert.deepEqual(attempted, ['/audio/fr/stop-01.mp3']);
  assert.equal(cache.entries.size, 1);
});

test('a successful request with partial or corrupt bytes never creates a ready pack', async () => {
  for (const response of [new Response(body, { status: 206 }), new Response('bad')]) {
    const { cache, store } = fixture({ fetch: (async () => response) as typeof fetch });
    await store.download('fr');
    assert.equal(store.getSnapshot().packs.fr.status, 'error');
    assert.equal(store.getSnapshot().packs.fr.verifiedCount, 0);
    assert.equal(cache.entries.size, 0);
    assert.equal(store.getSnapshot().activeLanguage, null);
  }
});

test('storage refusal is distinct from network failure and cannot claim downloaded bytes', async () => {
  const { store } = fixture({ caches: { open: async () => { throw new DOMException('Denied', 'SecurityError'); } } });
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.error, 'storage');
  assert.equal(store.getSnapshot().packs.fr.verifiedBytes, 0);
  assert.equal(store.getSnapshot().packs.fr.status, 'error');
});

test('a refused cache read reports storage failure and releases the download slot', async () => {
  const { store, requests } = fixture({
    caches: {
      open: async () => ({
        match: async () => { throw new DOMException('Denied', 'SecurityError'); },
        put: async () => assert.fail('must not write after a refused read'),
      }),
    },
  });

  await store.download('fr');
  const state = store.getSnapshot();
  assert.equal(state.packs.fr.status, 'error');
  assert.equal(state.packs.fr.error, 'storage');
  assert.equal(state.packs.fr.verifiedBytes, 0);
  assert.equal(state.activeLanguage, null);
  assert.deepEqual(requests, []);
});

test('one language downloads at a time and cancellation preserves prior cached resources', async () => {
  let calls = 0;
  const { store, cache } = fixture({ fetch: ((_url: unknown, options: RequestInit) => {
    calls += 1;
    return new Promise<Response>((_resolve, reject) => options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
  }) as typeof fetch });
  const saved = 'https://guide.example/older-user-resource';
  await cache.put(saved, new Response('preserved'));
  const active = store.download('fr');
  await nextTurn();
  assert.equal(store.getSnapshot().activeLanguage, 'fr');
  await store.download('en');
  assert.equal(calls, 1);
  store.cancelDownload();
  await active;
  assert.equal(store.getSnapshot().packs.fr.status, 'partial');
  assert.equal(store.getSnapshot().packs.fr.error, 'cancelled');
  assert.equal(store.getSnapshot().activeLanguage, null);
  assert.equal(await (await cache.match(saved))?.text(), 'preserved');
});

test('downloaded files and an installed application shell are separate guarantees', async () => {
  const { store } = fixture({ shellAvailable: async () => false });
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  assert.equal(store.getSnapshot().packs.fr.shellReady, false);
});

test('shell verification finds the current index after an old cache and requires its entries in that same cache', async () => {
  const origin = 'https://guide.example';
  const old = new MemoryCache(), current = new MemoryCache(), separate = new MemoryCache();
  const caches = new Map([['old-precache', old], ['current-precache', current], ['separate-cache', separate]]);
  const storage = { keys: async () => [...caches.keys()], open: async (name: string) => caches.get(name)! };
  const entryUrls = [`${origin}/assets/current.js`, `${origin}/assets/current.css`];
  const currentIndex = '<script type="module" src="/assets/current.js"></script><link rel="stylesheet" href="/assets/current.css">';
  await old.put(`${origin}/index.html?__WB_REVISION__=old`, new Response('<script src="/assets/old.js"></script>'));
  await old.put(`${origin}/assets/old.js`, new Response('old app'));
  assert.equal(await hasMatchingCachedShell(storage, origin, entryUrls), false, 'an old app cannot certify the current app');
  await current.put(`${origin}/index.html?__WB_REVISION__=new`, new Response(currentIndex));
  await current.put(entryUrls[0], new Response('current app'));
  await current.put(entryUrls[1], new Response('current styles'));
  assert.equal(await hasMatchingCachedShell(storage, origin, entryUrls), true, 'a later matching cache is found');
  current.entries.delete(entryUrls[1]);
  assert.equal(await hasMatchingCachedShell(storage, origin, entryUrls), false, 'a missing entry prevents readiness');
  await separate.put(entryUrls[1], new Response('current styles'));
  assert.equal(await hasMatchingCachedShell(storage, origin, entryUrls), false, 'files from different caches cannot be combined');
  await current.put(entryUrls[1], new Response('current styles'));
  await current.put(`${origin}/index.html?__WB_REVISION__=new`, new Response('<script src="/assets/old.js"></script>'));
  assert.equal(await hasMatchingCachedShell(storage, origin, entryUrls), false, 'cached files alone do not certify an unrelated index');
  assert.deepEqual([...caches.keys()], ['old-precache', 'current-precache', 'separate-cache'], 'no existing cache is removed');
});

test('unavailable languages and inaccessible browser storage do not start downloads', async () => {
  const { store, requests } = fixture({ resources: (language: SupportedLanguage) => language === 'fr' ? [] : [resource] });
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'unavailable');
  assert.equal(requests.length, 0);
  const unsupported = createOfflineStore({ resources: () => [resource] });
  assert.equal(unsupported.getSnapshot().packs.fr.status, 'unsupported');
  await unsupported.download('fr');
  assert.equal(unsupported.getSnapshot().packs.fr.status, 'unsupported');
});
