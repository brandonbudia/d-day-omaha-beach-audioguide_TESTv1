import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { MEDIA_CATALOG, getMediaResource, getDownloadableAudio, getLanguageResourceSummary, SHARED_OFFLINE_RESOURCES, type OfflineResource } from '../src/data/mediaCatalog';
import { LANGUAGES, type SupportedLanguage } from '../src/i18n/translations';
import french from '../src/data/french-transcripts.fr.json';
import { resolveTranscript } from '../src/data/transcripts';
import { VERIFIED_MEDIA_CACHE, createOfflineStore, getOfflineResources, verifyCompleteResponse, type OfflineDependencies } from '../src/offline/offlineStore';

const subtle = webcrypto.subtle as SubtleCrypto;
const hash = (body: string | Uint8Array) => createHash('sha256').update(body).digest('hex');
const body = 'complete audio bytes';
const resource: OfflineResource = { url: '/audio/fr/stop-01.mp3?v=verified', bytes: Buffer.byteLength(body), sha256: hash(body) };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => { resolve = finish; });
  return { promise, resolve };
}

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
  async keys() { return [...this.entries.keys()].map((url) => ({ url })); }
}

function fixture(overrides: Partial<OfflineDependencies> = {}) {
  const cache = new MemoryCache();
  const names: string[] = [];
  const requests: { url: string; options?: RequestInit }[] = [];
  const dependencies: OfflineDependencies = {
    caches: { has: async (name) => name === VERIFIED_MEDIA_CACHE, open: async (name) => { names.push(name); return cache; } },
    fetch: (async (url: string | URL | Request, options?: RequestInit) => { requests.push({ url: String(url), options }); return new Response(body); }) as typeof fetch,
    subtle, origin: 'https://guide.example', resources: () => [resource],
    shellAvailable: async () => true, estimateStorage: async () => ({ usage: 1234, quota: 100000 }),
    ...overrides,
  };
  return { cache, names, requests, dependencies, store: createOfflineStore(dependencies) };
}

test('catalogue reflects all 154 actual audio files and separates readiness from editorial review', async () => {
  const placeholder = 'eeb31574962689da3867ef0db9b71bd55c4bf9809069e06ce404c529c40e685d';
  const stations = Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0'));
  const partiallyAligned = new Set(['nl09', 'it07', 'es06', 'pl01', 'es03', 'de14', 'es10', 'de02', 'de15', 'de20', 'es14', 'es19', 'es12', 'es15', 'it08', 'nl18', 'de06', 'de21', 'de22', 'nl21', 'it15', 'pl02', 'nl16', 'de13', 'de17', 'nl06', 'it03', 'de03', 'nl04', 'pl03', 'de04', 'nl17', 'it17', 'pl04', 'de09', 'de12', 'de18', 'nl01', 'it01', 'it16', 'pl05', 'nl02', 'nl03', 'it02', 'it04', 'it05', 'it06', 'nl05', 'nl07', 'pl06', 'pl07', 'pl08', 'it09', 'it10', 'nl08', 'nl10', 'nl11', 'it11', 'it12', 'pl11', 'pl12', 'nl12', 'nl13', 'it13', 'pl13', 'it14', 'nl14', 'pl14', 'it18', 'nl15', 'pl16', 'it19', 'nl19', 'nl20', 'it20', 'pl17', 'pl18', 'it21', 'it22', 'nl22', 'pl19', 'pl21']);
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
      } else {
        assert.equal(record.status, 'ready');
        assert.equal(record.reason, partiallyAligned.has(`${code}${record.id}`) ? 'wivi-narration-partially-aligned' : code === 'pl' ? 'synthetic-narration' : 'wivi-narration-compared');
        assert.notEqual(record.sha256, placeholder);
        assert.equal(resolveTranscript(record.id, code, record).mode, 'phrase-synchronized');
      }
    }
  }
  assert.equal(getDownloadableAudio('fr').length, 22);
  assert.equal(getDownloadableAudio('en').length, 22);
  for (const language of ['de', 'es', 'it', 'nl', 'pl'] as const) {
    assert.deepEqual(getDownloadableAudio(language).map(({ id }) => id).toSorted(), stations);
    assert.deepEqual(getOfflineResources(language).filter(({ url }) => url.startsWith('/audio/')).map(({ url }) => url).toSorted(),
      stations.map(id => getMediaResource(id, language).url));
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
  assert.deepEqual(names, [VERIFIED_MEDIA_CACHE, VERIFIED_MEDIA_CACHE]);
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

test('a corrupt legacy entry with the expected SHA-256 header is never counted as verified', async () => {
  const { cache, requests, store } = fixture();
  const url = `https://guide.example${resource.url}`;
  const corrupt = body.replace('audio', 'other');
  await cache.put(url, new Response(corrupt, {
    headers: { 'Content-Length': String(resource.bytes), 'x-dday-verified-sha256': resource.sha256 },
  }));
  await store.inspect('fr');
  assert.equal(store.getSnapshot().packs.fr.verifiedCount, 0);
  assert.equal(store.getSnapshot().packs.fr.status, 'partial');
  assert.equal(await (await cache.match(url))?.text(), corrupt, 'inspection preserves existing entries');
  await store.download('fr');
  assert.equal(requests.length, 1);
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  assert.equal(await (await cache.match(url))?.text(), body);
});

test('a failed download still counts verified audio cached after a missing file', async () => {
  const cached = { ...resource, url: '/audio/fr/stop-22.mp3?v=verified' };
  const attempted: string[] = [];
  const { store, cache, dependencies } = fixture({
    resources: () => [resource, cached],
    fetch: (async (url: string | URL | Request) => {
      attempted.push(new URL(String(url)).pathname);
      if (attempted.length === 1) throw new TypeError('No connection');
      return new Response(body);
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

  const reopened = createOfflineStore(dependencies);
  await reopened.inspect('fr');
  assert.equal(reopened.getSnapshot().packs.fr.status, 'partial');
  assert.equal(reopened.getSnapshot().packs.fr.cachedAudioCount, 1);
  await reopened.download('fr');
  assert.equal(reopened.getSnapshot().packs.fr.status, 'ready');
  assert.deepEqual(attempted, ['/audio/fr/stop-01.mp3', '/audio/fr/stop-01.mp3']);
  assert.equal(cache.entries.size, 2);
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

test('network interruptions preserve written files and a new store resumes missing files', async (context) => {
  const pack = Array.from({ length: 10 }, (_, i) => ({ ...resource, url: `/audio/fr/stop-${i + 1}.mp3?v=verified` }));
  for (const downloaded of [0, 5, 9]) {
    await context.test(`interrupted after ${downloaded} files`, async () => {
      let attempts = 0;
      const { cache, store, dependencies } = fixture({
        resources: () => pack,
        fetch: async () => {
          if (attempts++ === downloaded) throw new TypeError('Disconnected');
          return new Response(body);
        },
      });
      await store.download('fr');
      const interrupted = store.getSnapshot().packs.fr;
      assert.equal(interrupted.error, 'network');
      assert.equal(interrupted.cachedAudioCount, downloaded);
      assert.equal(interrupted.currentFile, pack[downloaded].url.split('?')[0]);
      assert.equal(cache.entries.size, downloaded);
      assert.equal(store.getSnapshot().activeLanguage, null);

      const resumed: string[] = [];
      const reopened = createOfflineStore({ ...dependencies, fetch: async (input) => {
        resumed.push(new URL(String(input)).pathname);
        return new Response(body);
      } });
      await reopened.download('fr');
      assert.deepEqual(resumed, pack.slice(downloaded).map(({ url }) => url.split('?')[0]));
      assert.equal(reopened.getSnapshot().packs.fr.status, 'ready');
      assert.equal(reopened.getSnapshot().packs.fr.cachedAudioCount, pack.length);
      assert.equal(cache.entries.size, pack.length);
    });
  }
});

test('HTTP status and storage quota are reported separately from network interruptions', async (context) => {
  for (const httpStatus of [404, 503]) {
    await context.test(`HTTP ${httpStatus}`, async () => {
      const { store, cache } = fixture({ fetch: async () => new Response(null, { status: httpStatus }) });
      await store.download('fr');
      assert.equal(store.getSnapshot().packs.fr.error, 'http');
      assert.equal(store.getSnapshot().packs.fr.httpStatus, httpStatus);
      assert.equal(cache.entries.size, 0);
    });
  }
  const { store, cache, requests } = fixture();
  context.mock.method(cache, 'put', async () => { throw new DOMException('Storage full', 'QuotaExceededError'); });
  await store.download('fr');
  assert.equal(requests.length, 1);
  assert.equal(store.getSnapshot().packs.fr.error, 'quota');
  assert.equal(store.getSnapshot().packs.fr.cachedAudioCount, 0);
  assert.equal(cache.entries.size, 0);
  assert.equal(store.getSnapshot().activeLanguage, null);
});

test('fixture pack storage handles unreliable response metadata and request failures', async (context) => {
  for (const contentLength of [undefined, '9999']) {
    await context.test(contentLength ? 'wrong advertised length with complete matching bytes' : 'no Content-Length', async () => {
      const headers = new Headers();
      if (contentLength) headers.set('Content-Length', contentLength);
      const { store, cache } = fixture({ fetch: async () => new Response(body, { headers }) });
      await store.download('fr');
      const state = store.getSnapshot().packs.fr;
      assert.equal(state.status, 'ready');
      assert.equal(state.verifiedBytes, resource.bytes);
      const cached = await cache.match(`https://guide.example${resource.url}`);
      assert.equal(cached?.headers.get('Content-Length'), String(resource.bytes));
      assert.equal(cached?.headers.get('x-dday-verified-sha256'), resource.sha256);
      assert.equal(await cached?.text(), body);
      assert.equal(cache.entries.size, 1);
    });
  }

  const failures: Array<{ name: string; reply: () => Response; error: string; httpStatus?: number }> = [
    { name: 'HTTP 500', reply: () => new Response(null, { status: 500 }), error: 'http', httpStatus: 500 },
    { name: 'empty HTTP 200', reply: () => new Response(null), error: 'size-mismatch' },
    { name: 'truncated response advertising the correct length', reply: () => new Response(body.slice(1), {
      headers: { 'Content-Length': String(resource.bytes), 'x-dday-verified-sha256': resource.sha256 },
    }), error: 'size-mismatch' },
    { name: 'network abort without requesting cancellation', reply: () => { throw new DOMException('Transport aborted', 'AbortError'); }, error: 'network' },
  ];
  for (const { name, reply, error, httpStatus } of failures) {
    await context.test(name, async () => {
      const common = { ...resource, url: '/images/shared.webp?v=verified' };
      const { store, cache } = fixture({ resources: () => [resource, common], fetch: async () => reply() });
      const commonUrl = `https://guide.example${common.url}`;
      await cache.put(commonUrl, new Response(body));
      await store.download('fr');
      const state = store.getSnapshot().packs.fr;
      assert.equal(state.status, 'error');
      assert.equal(state.error, error);
      assert.equal(state.httpStatus, httpStatus);
      assert.equal(state.verifiedCount, 1);
      assert.equal(state.cachedAudioCount, 0);
      assert.equal(await (await cache.match(commonUrl))?.text(), body);
      assert.equal(cache.entries.size, 1);
      assert.equal(store.getSnapshot().activeLanguage, null);
    });
  }
});

test('fixture pack storage preserves completed files after a later cache.put is denied', async (context) => {
  const other = { ...resource, url: '/audio/fr/stop-02.mp3?v=verified' };
  const { store, cache, requests } = fixture({ resources: () => [resource, other] });
  const put = cache.put.bind(cache);
  const blocked = context.mock.method(cache, 'put', async (url: string, response: Response) => {
    if (url.endsWith(other.url)) throw new DOMException('Writes denied', 'SecurityError');
    await put(url, response);
  });
  await store.download('fr');
  const state = store.getSnapshot().packs.fr;
  assert.equal(state.status, 'error');
  assert.equal(state.error, 'storage');
  assert.equal(state.cachedAudioCount, 1);
  assert.equal(state.verifiedBytes, resource.bytes);
  assert.equal(await (await cache.match(`https://guide.example${resource.url}`))?.text(), body);
  assert.equal(cache.entries.size, 1);
  assert.equal(store.getSnapshot().activeLanguage, null);

  blocked.mock.restore();
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  assert.deepEqual(requests.map(({ url }) => new URL(url).pathname), ['/audio/fr/stop-01.mp3', '/audio/fr/stop-02.mp3', '/audio/fr/stop-02.mp3']);
  assert.equal(cache.entries.size, 2);
});

test('fixture pack storage catches eviction during a download and repairs just the missing file', async () => {
  const other = { ...resource, url: '/audio/fr/stop-02.mp3?v=verified' };
  const otherStarted = deferred<void>();
  const finishOther = deferred<void>();
  const paths: string[] = [];
  const { store, cache } = fixture({
    resources: () => [resource, other],
    fetch: async (input) => {
      const path = new URL(String(input)).pathname;
      paths.push(path);
      if (path === '/audio/fr/stop-02.mp3') {
        otherStarted.resolve();
        await finishOther.promise;
      }
      return new Response(body);
    },
  });
  const download = store.download('fr');
  await otherStarted.promise;
  const evicted = `https://guide.example${resource.url}`;
  const removed = cache.entries.delete(evicted);
  finishOther.resolve();
  await download;

  assert.equal(removed, true);
  const state = store.getSnapshot().packs.fr;
  assert.equal(state.status, 'error');
  assert.equal(state.error, 'storage');
  assert.equal(state.cachedAudioCount, 1);
  assert.equal(state.verifiedBytes, other.bytes);
  assert.equal(cache.entries.size, 1);
  assert.equal(await (await cache.match(`https://guide.example${other.url}`))?.text(), body);

  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  assert.deepEqual(paths, ['/audio/fr/stop-01.mp3', '/audio/fr/stop-02.mp3', '/audio/fr/stop-01.mp3']);
  assert.equal(await (await cache.match(evicted))?.text(), body);
  assert.equal(cache.entries.size, 2);
});

test('fixture pack storage rejects success when the named cache is evicted during a transfer', async () => {
  const requestStarted = deferred<void>();
  const finishResponse = deferred<void>();
  const detached = new MemoryCache();
  let current: MemoryCache | undefined = detached;
  let cacheCreations = 0;
  const caches = {
    has: async () => current !== undefined,
    open: async () => {
      if (!current) {
        cacheCreations += 1;
        current = new MemoryCache();
      }
      return current;
    },
  };
  const { store } = fixture({
    caches,
    fetch: async () => {
      requestStarted.resolve();
      await finishResponse.promise;
      return new Response(body);
    },
  });
  const download = store.download('fr');
  await requestStarted.promise;
  current = undefined;
  finishResponse.resolve();
  await download;

  const state = store.getSnapshot().packs.fr;
  assert.equal(state.status, 'error');
  assert.equal(state.error, 'storage');
  assert.equal(state.cachedAudioCount, 0);
  assert.equal(detached.entries.size, 1, 'the write to the old cache handle alone does not prove availability');
  assert.equal(cacheCreations, 0);
});

test('transfer deadlines abort a stalled request both before headers and during the body', async (context) => {
  for (const phase of ['headers', 'body']) {
    await context.test(phase, async (subtest) => {
      subtest.mock.timers.enable({ apis: ['setTimeout'] });
      const started = deferred<void>();
      const { cache, store } = fixture({ fetch: async (_input, options) => {
        const signal = options?.signal;
        assert.ok(signal);
        if (phase === 'headers') {
          return new Promise<Response>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
            started.resolve();
          });
        }
        return new Response(new ReadableStream({ start(stream) {
          stream.enqueue(new TextEncoder().encode(body.slice(0, 4)));
          signal.addEventListener('abort', () => stream.error(new DOMException('Aborted', 'AbortError')), { once: true });
          started.resolve();
        } }));
      } });
      const download = store.download('fr');
      await started.promise;
      subtest.mock.timers.tick(120_000);
      await download;
      assert.equal(store.getSnapshot().packs.fr.error, 'timeout');
      assert.equal(store.getSnapshot().packs.fr.verifiedCount, 0);
      assert.equal(cache.entries.size, 0);
      assert.equal(store.getSnapshot().activeLanguage, null);
    });
  }
});

test('cancelling during SHA verification leaves no entry and never reports ready', async () => {
  const started = deferred<void>();
  const finishDigest = deferred<ArrayBuffer>();
  const { cache, store } = fixture({ subtle: { digest: () => { started.resolve(); return finishDigest.promise; } } });
  const download = store.download('fr');
  await started.promise;
  store.cancelDownload();
  finishDigest.resolve(await subtle.digest('SHA-256', new TextEncoder().encode(body)));
  await download;
  const cancelled = store.getSnapshot().packs.fr;
  assert.equal(cancelled.status, 'partial');
  assert.equal(cancelled.error, 'cancelled');
  assert.equal(cancelled.verifiedCount, 0);
  assert.equal(cache.entries.size, 0);
  assert.equal(store.getSnapshot().activeLanguage, null);
});

test('cancelling during cache.put keeps a verified file whose write succeeds', async (context) => {
  const { cache, store, dependencies, requests } = fixture();
  const started = deferred<void>();
  const finishWrite = deferred<void>();
  const put = cache.put.bind(cache);
  context.mock.method(cache, 'put', async (url: string, response: Response) => {
    started.resolve();
    await finishWrite.promise;
    await put(url, response);
  });
  const download = store.download('fr');
  await started.promise;
  store.cancelDownload();
  finishWrite.resolve();
  await download;
  const cancelled = store.getSnapshot().packs.fr;
  assert.equal(cancelled.status, 'partial');
  assert.equal(cancelled.error, 'cancelled');
  assert.equal(cancelled.verifiedCount, 1);
  assert.equal(cache.entries.size, 1);
  const reopened = createOfflineStore(dependencies);
  await reopened.download('fr');
  assert.equal(reopened.getSnapshot().packs.fr.status, 'ready');
  assert.equal(requests.length, 1);
});

test('two tabs check the shared cache in turn and only fetch missing versions', async () => {
  const writeAllowed = deferred<void>();
  const requestStarted = deferred<void>();
  let previous = Promise.resolve();
  let attempts = 0;
  const common = { ...resource, url: '/images/diagram.webp?v=verified' };
  const { store, cache, dependencies } = fixture({
    resources: () => [resource, common],
    withDownloadLock: (signal, download) => {
      const execution = previous.then(() => { signal.throwIfAborted(); return download(); });
      previous = execution.catch(() => {});
      return execution;
    },
    fetch: async () => {
      attempts += 1;
      requestStarted.resolve();
      await writeAllowed.promise;
      return new Response(body);
    },
  });
  const previousAudio = 'https://guide.example/audio/fr/stop-01.mp3?v=previous';
  await cache.put(previousAudio, new Response(body));
  await cache.put(`https://guide.example${common.url}`, new Response(body));
  const secondTab = createOfflineStore(dependencies);
  const first = store.download('fr');
  await requestStarted.promise;
  const second = secondTab.download('fr');
  assert.equal(secondTab.getSnapshot().activeLanguage, 'fr');
  writeAllowed.resolve();
  await Promise.all([first, second]);
  assert.equal(attempts, 1);
  for (const tab of [store, secondTab]) {
    assert.equal(tab.getSnapshot().packs.fr.status, 'ready');
    assert.equal(tab.getSnapshot().packs.fr.verifiedCount, 2);
    assert.equal(tab.getSnapshot().packs.fr.cachedAudioCount, 1);
  }
  assert.ok(await cache.match(previousAudio));
  assert.equal(cache.entries.size, 3);
});

test('unlocked downloads reuse a resource verified by another tab after their initial scan', async () => {
  const firstRequestStarted = deferred<void>();
  const finishFirstRequest = deferred<void>();
  const other = { ...resource, url: '/audio/fr/stop-02.mp3?v=verified' };
  const firstRequests: string[] = [];
  const secondRequests: string[] = [];
  const { store, cache, dependencies } = fixture({
    resources: () => [resource, other],
    fetch: async (input) => {
      firstRequests.push(new URL(String(input)).pathname);
      if (firstRequests.length === 1) {
        firstRequestStarted.resolve();
        await finishFirstRequest.promise;
      }
      return new Response(body);
    },
  });
  const secondTab = createOfflineStore({ ...dependencies, fetch: async (input) => {
    secondRequests.push(new URL(String(input)).pathname);
    return new Response(body);
  } });
  const first = store.download('fr');
  await firstRequestStarted.promise;
  await secondTab.download('fr');
  finishFirstRequest.resolve();
  await first;

  assert.deepEqual(secondRequests, ['/audio/fr/stop-01.mp3', '/audio/fr/stop-02.mp3']);
  assert.deepEqual(firstRequests, ['/audio/fr/stop-01.mp3'], 'only the transfer already in flight can be duplicated');
  assert.equal(cache.entries.size, 2);
  for (const tab of [store, secondTab]) {
    assert.equal(tab.getSnapshot().packs.fr.status, 'ready');
    assert.equal(tab.getSnapshot().packs.fr.cachedAudioCount, 2);
  }
  for (const item of [resource, other]) {
    assert.equal(await (await cache.match(`https://guide.example${item.url}`))?.text(), body);
  }
});

test('cancelling while waiting for the cross-tab lock does not open the cache', async () => {
  const { store, names, requests } = fixture({ withDownloadLock: (signal) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }) });
  const download = store.download('fr');
  store.cancelDownload();
  await download;
  assert.equal(store.getSnapshot().packs.fr.error, 'cancelled');
  assert.equal(store.getSnapshot().activeLanguage, null);
  assert.equal(names.length, 0);
  assert.equal(requests.length, 0);
});

test('storage refusal is distinct from network failure and cannot claim downloaded bytes', async () => {
  const { store } = fixture({ caches: { has: async () => false, open: async () => { throw new DOMException('Denied', 'SecurityError'); } } });
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.error, 'storage');
  assert.equal(store.getSnapshot().packs.fr.verifiedBytes, 0);
  assert.equal(store.getSnapshot().packs.fr.status, 'error');
});

test('a refused cache read reports storage failure and releases the download slot', async () => {
  const { store, requests } = fixture({
    caches: {
      has: async () => false,
      open: async () => ({
        match: async () => { throw new DOMException('Denied', 'SecurityError'); },
        put: async () => assert.fail('must not write after a refused read'),
        keys: async () => assert.fail('must not check keys after a refused read'),
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

test('a failed recheck reports only files verified during that inspection', async (context) => {
  const second = { ...resource, url: '/audio/fr/stop-02.mp3?v=verified' };
  const { store, cache } = fixture({ resources: () => [resource, second] });
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.cachedAudioCount, 2);

  const match = cache.match.bind(cache);
  context.mock.method(cache, 'match', async (url: string) => {
    if (url.endsWith(second.url)) throw new DOMException('Denied', 'SecurityError');
    return match(url);
  });
  await store.inspect('fr');
  const state = store.getSnapshot().packs.fr;
  assert.equal(state.status, 'error');
  assert.equal(state.error, 'storage');
  assert.equal(state.verifiedCount, 1);
  assert.equal(state.cachedAudioCount, 1);
  assert.equal(state.verifiedBytes, resource.bytes);
  assert.equal(cache.entries.size, 2);
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
  await store.download('fr');
  await store.download('en');
  assert.equal(store.getSnapshot().packs.en.status, 'idle');
  assert.equal(calls, 1);
  store.cancelDownload();
  await active;
  assert.equal(store.getSnapshot().packs.fr.status, 'partial');
  assert.equal(store.getSnapshot().packs.fr.error, 'cancelled');
  assert.equal(store.getSnapshot().activeLanguage, null);
  assert.equal(await (await cache.match(saved))?.text(), 'preserved');
});

test('cancellation during the final shell check keeps verified bytes without reporting success', async () => {
  let startedChecking!: () => void;
  const checking = new Promise<void>((resolve) => { startedChecking = resolve; });
  let finishChecking!: (ready: boolean) => void;
  const shell = new Promise<boolean>((resolve) => { finishChecking = resolve; });
  const { store, cache, requests } = fixture({
    shellAvailable: () => {
      startedChecking();
      return shell;
    },
  });

  const download = store.download('fr');
  await checking;
  store.cancelDownload();
  finishChecking(true);
  await download;

  const state = store.getSnapshot();
  assert.equal(state.packs.fr.status, 'partial');
  assert.equal(state.packs.fr.error, 'cancelled');
  assert.equal(state.packs.fr.verifiedBytes, resource.bytes);
  assert.equal(state.activeLanguage, null);
  assert.equal(cache.entries.size, 1);
  await store.inspect('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  assert.equal(requests.length, 1);
});

test('downloaded files and an installed application shell are separate guarantees', async () => {
  const { store } = fixture({ shellAvailable: async () => false });
  await store.download('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'ready');
  assert.equal(store.getSnapshot().packs.fr.shellReady, false);
});

test('an offline shell does not imply the media pack is complete', async () => {
  const { store } = fixture();
  await store.inspect('fr');
  assert.equal(store.getSnapshot().packs.fr.status, 'partial');
  assert.equal(store.getSnapshot().packs.fr.shellReady, true);
  assert.equal(store.getSnapshot().packs.fr.verifiedCount, 0);
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

test('the generated MP3 route serves coherent ranges without writing to the verified cache', async (context) => {
  const { buildSync, transformSync } = await import('esbuild');
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const { runtimeCachingConverter } = require('workbox-build/build/lib/runtime-caching-converter');
  const configModule = { exports: {} as { default: () => void } };
  let workboxOptions: { runtimeCaching: import('workbox-build').RuntimeCaching[] } | undefined;
  const configUrl = new URL('../vite.config.ts', import.meta.url);
  const requireConfig = createRequire(configUrl);
  const configCode = transformSync(await readFile(configUrl, 'utf8'), {
    loader: 'ts', format: 'cjs', define: { 'import.meta.url': JSON.stringify(configUrl.href) },
  }).code;
  // Capture the production options without starting Vite or writing any worker files.
  const loadConfigDependency = (name: string) => {
    if (name === 'vite-plugin-pwa') return { VitePWA: (options: { workbox: typeof workboxOptions }) => { workboxOptions = options.workbox; } };
    if (name === 'vite') return { defineConfig: (config: unknown) => config };
    if (name === '@vitejs/plugin-react' || name === '@tailwindcss/vite') return () => {};
    return requireConfig(name);
  };
  new Function('require', 'module', 'exports', configCode)(loadConfigDependency, configModule, configModule.exports);
  configModule.exports.default();
  const route = workboxOptions?.runtimeCaching.find(({ options }) => options?.cacheName === VERIFIED_MEDIA_CACHE);
  assert.ok(route);
  const bundle = buildSync({
    stdin: {
      contents: "export { CacheFirst } from 'workbox-strategies'; export { RangeRequestsPlugin } from 'workbox-range-requests';",
      resolveDir: process.cwd(),
    },
    bundle: true, platform: 'node', format: 'cjs', write: false,
    define: { 'process.env.NODE_ENV': '"production"' },
  }).outputFiles[0].text;
  const workbox = { exports: {} };
  new Function('module', 'exports', bundle)(workbox, workbox.exports);
  const registered: {
    match?: (input: { url: URL }) => boolean;
    handler?: import('workbox-strategies').CacheFirst;
  } = {};
  const registerRoute = (match: typeof registered.match, handler: typeof registered.handler, method: string) => {
    assert.equal(method, 'GET');
    registered.match = match;
    registered.handler = handler;
  };
  const workerCode: string[] = runtimeCachingConverter({ use: (_module: string, name: string) => name }, [route]);
  new Function('registerRoute', ...Object.keys(workbox.exports), workerCode.join('\n'))(registerRoute, ...Object.values(workbox.exports));
  const { match: routeMatches, handler: strategy } = registered;
  assert.ok(routeMatches && strategy);

  const origin = 'https://guide.example';
  const url = new URL(resource.url, origin);
  let cachedMedia: Map<string, Response> | undefined = new Map();
  let networkResponse: Response | undefined;
  let sentRequest: Request | undefined;
  let matches = 0;
  let opens = 0;
  const workerGlobals = {
    FetchEvent: class {},
    caches: {
      match: async (request: Request, options: MultiCacheQueryOptions) => {
        matches += 1;
        assert.equal(options.cacheName, VERIFIED_MEDIA_CACHE);
        assert.equal(request.url, url.href);
        return cachedMedia?.get(request.url)?.clone();
      },
      open: async (name: string) => {
        assert.equal(name, VERIFIED_MEDIA_CACHE);
        opens += 1;
        cachedMedia ??= new Map();
        return { put: async (request: Request, response: Response) => { cachedMedia!.set(request.url, response); } };
      },
    },
    fetch: async (request: Request) => {
      sentRequest = request;
      if (!networkResponse) throw new TypeError('Offline');
      return networkResponse;
    },
  };
  const worker = { ...workerGlobals, self: { ...workerGlobals, location: new URL(origin), registration: { scope: origin + '/' } } };
  for (const [key, value] of Object.entries(worker)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    context.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else Reflect.deleteProperty(globalThis, key);
    });
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  assert.equal(routeMatches({ url }), true);
  assert.equal(routeMatches({ url: new URL(url.href + '&__dday_download=1') }), false);
  const handle = async (range?: string, ifRange?: string) => {
    matches = 0;
    sentRequest = undefined;
    const headers = new Headers();
    if (range) headers.set('Range', range);
    if (ifRange) headers.set('If-Range', ifRange);
    const request = new Request(url, { headers });
    const workerRequest = { request, event: { waitUntil() {} } } as Parameters<typeof strategy.handleAll>[0];
    const [response] = await Promise.all(strategy.handleAll(workerRequest));
    assert.equal(matches, 1, 'only one cache lookup');
    return response;
  };
  const bytes = Buffer.from('01234567');
  const cases = [
    [undefined, 200, null, '8', '01234567'],
    ['bytes=0-7', 206, 'bytes 0-7/8', '8', '01234567'],
    ['bytes=2-4', 206, 'bytes 2-4/8', '3', '234'],
    ['bytes=5-', 206, 'bytes 5-7/8', '3', '567'],
    ['bytes=-2', 206, 'bytes 6-7/8', '2', '67'],
    ['bytes=8-', 416, 'bytes */8', '0', ''],
    ['bytes=12-', 416, 'bytes */8', '0', ''],
    ['bytes=5-2', 200, null, '8', '01234567'],
    ['bytes=6-8', 206, 'bytes 6-7/8', '2', '67'],
    ['bytes=6-20', 206, 'bytes 6-7/8', '2', '67'],
    ['bytes=-20', 206, 'bytes 0-7/8', '8', '01234567'],
    ['bytes=-0', 416, 'bytes */8', '0', ''],
    ['bytes=0-1,3-4', 416, null, null, ''],
    ['bytes=nonsense', 416, null, null, ''],
    ['bytes=bad2-4', 200, null, '8', '01234567'],
  ] as const;
  for (const [range, status, contentRange, contentLength, expected] of cases) {
    await context.test(range ?? 'no range', async () => {
      cachedMedia!.set(url.href, new Response(bytes, {
        headers: { 'Content-Length': String(bytes.length), 'x-dday-verified-sha256': hash(bytes) },
      }));
      const response = await handle(range);
      assert.equal(sentRequest, undefined);
      assert.equal(response.status, status);
      assert.equal(response.headers.get('Content-Range'), contentRange);
      assert.equal(response.headers.get('Content-Length'), contentLength);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), Buffer.from(expected));
      assert.equal(opens, 0);
    });
  }
  await context.test('range from the real FR01 MP3', async () => {
    const mp3 = await readFile('public/audio/fr/stop-01.mp3');
    cachedMedia!.set(url.href, new Response(mp3, { headers: { 'Content-Type': 'audio/mpeg' } }));
    const response = await handle('bytes=128-255');
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Range'), `bytes 128-255/${mp3.length}`);
    assert.equal(response.headers.get('Content-Length'), '128');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), mp3.subarray(128, 256));
  });
  cachedMedia!.clear();
  const networkCases: Array<{ name: string; body: string; init: ResponseInit; range?: string }> = [
    { name: 'complete HTTP 200', body, init: { status: 200 } },
    { name: 'incomplete HTTP 200', body: body.slice(0, 4), init: { status: 200, headers: { 'Content-Range': 'bytes 0-3/20' } } },
    { name: 'wrong-size HTTP 200', body: body.slice(1), init: { status: 200 } },
    { name: 'wrong SHA-256 HTTP 200', body: body.replace('audio', 'other'), init: { status: 200 } },
    { name: 'forged SHA-256 header', body: body.replace('audio', 'other'), init: { status: 200, headers: { 'x-dday-verified-sha256': resource.sha256 } } },
    { name: 'HTTP 206', body: '67', init: { status: 206, headers: { 'Content-Range': 'bytes 6-7/8', 'Content-Length': '2' } }, range: 'bytes=6-20' },
  ];
  for (const entry of networkCases) {
    await context.test(`${entry.name} is returned from the network without being cached`, async () => {
      networkResponse = new Response(entry.body, entry.init);
      const response = await handle(entry.range);
      assert.equal(response, networkResponse);
      assert.equal(sentRequest?.headers.get('Range'), entry.range ?? null);
      assert.equal(await response.text(), entry.body);
      assert.equal(opens, 0);
      assert.equal(cachedMedia?.size, 0);
    });
  }
  await context.test('a cache miss forwards an origin multipart response without caching it', async () => {
    const range = 'bytes=0-1,3-4';
    const contentType = 'multipart/byteranges; boundary=test-range';
    const multipart = [
      '--test-range',
      'Content-Type: audio/mpeg',
      'Content-Range: bytes 0-1/8',
      '',
      '01',
      '--test-range',
      'Content-Type: audio/mpeg',
      'Content-Range: bytes 3-4/8',
      '',
      '34',
      '--test-range--',
      '',
    ].join('\r\n');
    const length = String(Buffer.byteLength(multipart));
    networkResponse = new Response(multipart, { status: 206, headers: { 'Content-Type': contentType, 'Content-Length': length } });
    const response = await handle(range);
    assert.equal(sentRequest?.headers.get('Range'), range);
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Type'), contentType);
    assert.equal(response.headers.get('Content-Length'), length);
    assert.equal(response.headers.get('Content-Range'), null);
    assert.equal(await response.text(), multipart);
    assert.equal(opens, 0);
    assert.equal(cachedMedia?.size, 0);
  });
  await context.test('a cache miss forwards If-Range and preserves the full origin response', async () => {
    const range = 'bytes=2-4';
    const ifRange = '"previous"';
    const etag = '"current"';
    const length = String(bytes.length);
    networkResponse = new Response(bytes, { status: 200, headers: { ETag: etag, 'Content-Length': length } });
    const response = await handle(range, ifRange);
    assert.equal(sentRequest?.headers.get('Range'), range);
    assert.equal(sentRequest?.headers.get('If-Range'), ifRange);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('ETag'), etag);
    assert.equal(response.headers.get('Content-Length'), length);
    assert.equal(response.headers.get('Content-Range'), null);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
    assert.equal(opens, 0);
    assert.equal(cachedMedia?.size, 0);
  });
  await context.test('an older revision remains stored but does not satisfy the current URL offline', async () => {
    const oldUrl = new URL(`${url.pathname}?v=previous-revision`, url.origin);
    cachedMedia!.set(oldUrl.href, new Response('old revision'));
    networkResponse = undefined;
    await assert.rejects(handle(), /no-response/);
    assert.equal(sentRequest?.url, url.href);
    assert.equal(cachedMedia?.size, 1);
    assert.equal(opens, 0);
  });
  await context.test('a missing cache is not created by an online media request', async () => {
    cachedMedia = undefined;
    networkResponse = new Response(body);
    assert.equal(await handle(), networkResponse);
    assert.equal(await networkResponse.text(), body);
    assert.equal(opens, 0);
    assert.equal(cachedMedia, undefined);
  });
  await context.test('an offline media request misses cleanly without creating a cache', async () => {
    networkResponse = undefined;
    await assert.rejects(handle('bytes=6-20'), /no-response/);
    assert.equal(sentRequest?.headers.get('Range'), 'bytes=6-20');
    assert.equal(opens, 0);
    assert.equal(cachedMedia, undefined);
  });
});
