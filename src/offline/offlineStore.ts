import { getDownloadableAudio, SHARED_OFFLINE_RESOURCES, type OfflineResource } from '../data/mediaCatalog';
import { LANGUAGES, type SupportedLanguage } from '../i18n/translations';

export const VERIFIED_MEDIA_CACHE = 'dday-verified-media-v1';
export type OfflineFailure = 'http' | 'partial-response' | 'size-mismatch' | 'hash-mismatch' | 'storage' | 'network' | 'cancelled';
export class OfflineIntegrityError extends Error {
  constructor(public readonly code: OfflineFailure) { super(code); }
}
export type PackStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'partial' | 'error' | 'unsupported' | 'unavailable';
export interface OfflinePackState {
  status: PackStatus;
  verifiedCount: number;
  totalCount: number;
  audioCount: number;
  cachedAudioCount: number;
  verifiedBytes: number;
  totalBytes: number;
  shellReady: boolean;
  error?: OfflineFailure;
  currentFile?: string;
  storageUsageBytes?: number;
  storageQuotaBytes?: number;
}
export interface OfflineSnapshot {
  activeLanguage: SupportedLanguage | null;
  packs: Record<SupportedLanguage, OfflinePackState>;
}
interface CacheLike {
  match(url: string): Promise<Response | undefined>;
  put(url: string, response: Response): Promise<void>;
}
interface CacheStorageLike { open(name: string): Promise<CacheLike>; }
export interface OfflineDependencies {
  caches?: CacheStorageLike;
  fetch?: typeof fetch;
  subtle?: SubtleCrypto;
  origin?: string;
  resources?: (language: SupportedLanguage) => readonly OfflineResource[];
  shellAvailable?: () => Promise<boolean>;
  estimateStorage?: () => Promise<{ usage?: number; quota?: number }>;
}

const isAudio = (resource: OfflineResource) => resource.url.startsWith('/audio/');

export function getOfflineResources(language: SupportedLanguage): readonly OfflineResource[] {
  const audio = getDownloadableAudio(language);
  return audio.length ? [...audio, ...SHARED_OFFLINE_RESOURCES] : [];
}

/** A successful HTTP request is insufficient: require a complete, exact catalogued file. */
export async function verifyCompleteResponse(resource: OfflineResource, response: Response, subtle: SubtleCrypto): Promise<ArrayBuffer> {
  if (response.status === 206 || response.headers.has('content-range')) throw new OfflineIntegrityError('partial-response');
  if (response.status !== 200) throw new OfflineIntegrityError('http');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== resource.bytes) throw new OfflineIntegrityError('size-mismatch');
  const digest = await subtle.digest('SHA-256', bytes);
  const hash = [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, '0')).join('');
  if (hash !== resource.sha256) throw new OfflineIntegrityError('hash-mismatch');
  return bytes;
}

function browserDependencies(): OfflineDependencies {
  let cacheStorage: CacheStorage | undefined;
  try { cacheStorage = globalThis.caches; } catch { /* Private browsing can refuse storage access. */ }
  return {
    caches: cacheStorage,
    fetch: globalThis.fetch?.bind(globalThis),
    subtle: globalThis.crypto?.subtle,
    origin: typeof location === 'undefined' ? 'http://localhost' : location.origin,
    shellAvailable: async () => {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !cacheStorage) return false;
      const registration = await navigator.serviceWorker.getRegistration();
      const index = await cacheStorage.match(new URL('/index.html', location.origin).href, { ignoreSearch: true });
      if (!navigator.serviceWorker.controller || registration?.active?.state !== 'activated' || !index || typeof document === 'undefined') return false;
      const html = await index.text();
      const entryPoints = [...document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')];
      if (!entryPoints.length) return false;
      for (const script of entryPoints) {
        const url = new URL(script.src, location.origin);
        if (url.origin !== location.origin || !html.includes(url.pathname) || !await cacheStorage.match(url.href, { ignoreSearch: true })) return false;
      }
      return true;
    },
    estimateStorage: async () => typeof navigator !== 'undefined' && navigator.storage?.estimate ? navigator.storage.estimate() : {},
  };
}

export function createOfflineStore(dependencies: OfflineDependencies = browserDependencies()) {
  const resourcesFor = dependencies.resources ?? getOfflineResources;
  const supported = Boolean(dependencies.caches && dependencies.fetch && dependencies.subtle);
  const absolute = (url: string) => new URL(url, dependencies.origin ?? 'http://localhost').href;
  const listeners = new Set<() => void>();
  let controller: AbortController | null = null;
  const inspections = new Set<SupportedLanguage>();
  let snapshot: OfflineSnapshot = {
    activeLanguage: null,
    packs: Object.fromEntries(LANGUAGES.map(({ code }) => {
      const resources = resourcesFor(code);
      return [code, {
        status: !resources.length ? 'unavailable' : supported ? 'idle' : 'unsupported',
        verifiedCount: 0, totalCount: resources.length, audioCount: resources.filter(isAudio).length,
        cachedAudioCount: 0, verifiedBytes: 0, totalBytes: resources.reduce((sum, item) => sum + item.bytes, 0), shellReady: false,
      }];
    })) as Record<SupportedLanguage, OfflinePackState>,
  };
  const emit = () => listeners.forEach((listener) => listener());
  const update = (language: SupportedLanguage, values: Partial<OfflinePackState>) => {
    snapshot = { ...snapshot, packs: { ...snapshot.packs, [language]: { ...snapshot.packs[language], ...values } } };
    emit();
  };
  const environment = async () => {
    let shellReady = false;
    let estimate: { usage?: number; quota?: number } = {};
    try { shellReady = await dependencies.shellAvailable?.() ?? false; } catch { /* Keep the distinction between files and the app shell. */ }
    try { estimate = await dependencies.estimateStorage?.() ?? {}; } catch { /* Storage estimates are optional. */ }
    return { shellReady, storageUsageBytes: estimate.usage, storageQuotaBytes: estimate.quota };
  };
  const readVerified = async (cache: CacheLike, resource: OfflineResource) => {
    const response = await cache.match(absolute(resource.url));
    if (!response) return false;
    try { await verifyCompleteResponse(resource, response, dependencies.subtle!); return true; }
    catch { return false; }
  };

  const inspect = async (language: SupportedLanguage) => {
    if (!supported || snapshot.activeLanguage || inspections.has(language) || !resourcesFor(language).length) return;
    inspections.add(language);
    update(language, { status: 'checking', error: undefined });
    try {
      const cache = await dependencies.caches!.open(VERIFIED_MEDIA_CACHE);
      let verifiedCount = 0, verifiedBytes = 0, cachedAudioCount = 0;
      for (const resource of resourcesFor(language)) {
        if (await readVerified(cache, resource)) {
          verifiedCount += 1; verifiedBytes += resource.bytes;
          if (isAudio(resource)) cachedAudioCount += 1;
        }
      }
      const details = await environment();
      if (snapshot.activeLanguage === language) return;
      update(language, { status: verifiedCount === resourcesFor(language).length ? 'ready' : 'partial', verifiedCount, verifiedBytes, cachedAudioCount, ...details });
    } catch {
      if (snapshot.activeLanguage !== language) update(language, { status: 'error', error: 'storage' });
    } finally {
      inspections.delete(language);
    }
  };

  const download = async (language: SupportedLanguage) => {
    if (!supported || snapshot.activeLanguage || inspections.has(language) || !resourcesFor(language).length) return;
    controller = new AbortController();
    const signal = controller.signal;
    snapshot = { ...snapshot, activeLanguage: language };
    update(language, { status: 'downloading', verifiedCount: 0, verifiedBytes: 0, cachedAudioCount: 0, error: undefined });
    let verifiedCount = 0, verifiedBytes = 0, cachedAudioCount = 0;
    try {
      let cache: CacheLike;
      try { cache = await dependencies.caches!.open(VERIFIED_MEDIA_CACHE); }
      catch { throw new OfflineIntegrityError('storage'); }
      for (const resource of resourcesFor(language)) {
        if (signal.aborted) throw new OfflineIntegrityError('cancelled');
        update(language, { currentFile: resource.url.split('?')[0] });
        if (!(await readVerified(cache, resource))) {
          const networkUrl = new URL(absolute(resource.url));
          // Bypass the runtime CacheFirst route when repairing a missing or corrupt entry.
          networkUrl.searchParams.set('__dday_download', '1');
          const response = await dependencies.fetch!(networkUrl.href, { signal, cache: 'no-store', credentials: 'same-origin' });
          const bytes = await verifyCompleteResponse(resource, response, dependencies.subtle!);
          if (signal.aborted) throw new OfflineIntegrityError('cancelled');
          const headers = new Headers(response.headers);
          headers.delete('content-encoding'); headers.delete('transfer-encoding'); headers.delete('vary');
          headers.set('content-length', String(bytes.byteLength)); headers.set('accept-ranges', 'bytes');
          headers.set('x-dday-verified-sha256', resource.sha256);
          try { await cache.put(absolute(resource.url), new Response(bytes, { status: 200, headers })); }
          catch { throw new OfflineIntegrityError('storage'); }
        }
        verifiedCount += 1; verifiedBytes += resource.bytes;
        if (isAudio(resource)) cachedAudioCount += 1;
        update(language, { verifiedCount, verifiedBytes, cachedAudioCount });
      }
      update(language, { status: 'ready', currentFile: undefined, ...await environment() });
    } catch (error) {
      const code: OfflineFailure = signal.aborted ? 'cancelled' : error instanceof OfflineIntegrityError ? error.code : 'network';
      update(language, { status: code === 'cancelled' ? 'partial' : 'error', error: code, currentFile: undefined });
    } finally {
      controller = null;
      snapshot = { ...snapshot, activeLanguage: null };
      emit();
    }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    inspect, download,
    cancelDownload: () => controller?.abort(),
  };
}

export const offlineStore = createOfflineStore();
