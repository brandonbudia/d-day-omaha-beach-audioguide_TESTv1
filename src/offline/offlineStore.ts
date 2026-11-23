import { getDownloadableAudio, SHARED_OFFLINE_RESOURCES, type OfflineResource } from '../data/mediaCatalog';
import { LANGUAGES, type SupportedLanguage } from '../i18n/translations';
import { checkOfflineShell } from './offlineShell';

export const VERIFIED_MEDIA_CACHE = 'dday-verified-media-v1';
const TRANSFER_TIMEOUT_MS = 120_000;
export type OfflineFailure = 'http' | 'partial-response' | 'size-mismatch' | 'hash-mismatch' | 'storage' | 'quota' | 'network' | 'timeout' | 'cancelled';
export class OfflineIntegrityError extends Error {
  constructor(public readonly code: OfflineFailure, public readonly httpStatus?: number) { super(code); }
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
  httpStatus?: number;
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
  keys(): Promise<readonly { url: string }[]>;
}
interface CacheStorageLike {
  has(name: string): Promise<boolean>;
  open(name: string): Promise<CacheLike>;
}
export interface OfflineDependencies {
  caches?: CacheStorageLike;
  fetch?: typeof fetch;
  subtle?: Pick<SubtleCrypto, 'digest'>;
  origin?: string;
  resources?: (language: SupportedLanguage) => readonly OfflineResource[];
  shellAvailable?: () => Promise<boolean>;
  estimateStorage?: () => Promise<{ usage?: number; quota?: number }>;
  withDownloadLock?: (signal: AbortSignal, download: () => Promise<void>) => Promise<void>;
}

const isAudio = (resource: OfflineResource) => resource.url.startsWith('/audio/');

export function getOfflineResources(language: SupportedLanguage): readonly OfflineResource[] {
  const audio = getDownloadableAudio(language);
  return audio.length ? [...audio, ...SHARED_OFFLINE_RESOURCES] : [];
}

async function readCompleteResponse(resource: OfflineResource, response: Response): Promise<ArrayBuffer> {
  if (response.status === 206 || response.headers.has('content-range')) throw new OfflineIntegrityError('partial-response');
  if (response.status !== 200) throw new OfflineIntegrityError('http', response.status);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== resource.bytes) throw new OfflineIntegrityError('size-mismatch');
  return bytes;
}

async function verifyBytes(resource: OfflineResource, bytes: ArrayBuffer, subtle: Pick<SubtleCrypto, 'digest'>): Promise<void> {
  const digest = await subtle.digest('SHA-256', bytes);
  const hash = [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, '0')).join('');
  if (hash !== resource.sha256) throw new OfflineIntegrityError('hash-mismatch');
}

/** A successful HTTP request is insufficient: require a complete, exact catalogued file. */
export async function verifyCompleteResponse(resource: OfflineResource, response: Response, subtle: Pick<SubtleCrypto, 'digest'>): Promise<ArrayBuffer> {
  const bytes = await readCompleteResponse(resource, response);
  await verifyBytes(resource, bytes, subtle);
  return bytes;
}

function storageFailure(error: unknown): OfflineIntegrityError {
  return new OfflineIntegrityError(error instanceof DOMException && error.name === 'QuotaExceededError' ? 'quota' : 'storage');
}

function browserDependencies(): OfflineDependencies {
  let cacheStorage: CacheStorage | undefined;
  try { cacheStorage = globalThis.caches; } catch { /* Private browsing can refuse storage access. */ }
  let locks: LockManager | undefined;
  try { locks = globalThis.navigator?.locks; } catch { /* Some browsers restrict Web Locks. */ }
  return {
    caches: cacheStorage,
    withDownloadLock: locks && ((signal, download) => locks.request(VERIFIED_MEDIA_CACHE, { signal }, download)),
    fetch: globalThis.fetch?.bind(globalThis),
    subtle: globalThis.crypto?.subtle,
    origin: typeof location === 'undefined' ? 'http://localhost' : location.origin,
    shellAvailable: checkOfflineShell,
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
  const pendingInspections = new Set<SupportedLanguage>();
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
    try { estimate = await dependencies.estimateStorage?.() ?? {}; } catch { /* Storage estimates are optional. */ }
    try { shellReady = await dependencies.shellAvailable?.() ?? false; } catch { /* Keep the distinction between files and the app shell. */ }
    return { shellReady, storageUsageBytes: estimate.usage, storageQuotaBytes: estimate.quota };
  };
  const readVerified = async (cache: CacheLike, resource: OfflineResource) => {
    let response: Response | undefined;
    try {
      response = await cache.match(absolute(resource.url));
    } catch {
      throw new OfflineIntegrityError('storage');
    }
    if (!response) return false;
    try { await verifyCompleteResponse(resource, response, dependencies.subtle!); return true; }
    catch { return false; }
  };

  const inspect = async (language: SupportedLanguage) => {
    if (!supported || !resourcesFor(language).length) return;
    if (snapshot.activeLanguage) {
      if (snapshot.activeLanguage !== language) pendingInspections.add(language);
      return;
    }
    if (inspections.has(language)) return;
    pendingInspections.delete(language);
    inspections.add(language);
    update(language, { status: 'checking', error: undefined, httpStatus: undefined, currentFile: undefined });
    let verifiedCount = 0, verifiedBytes = 0, cachedAudioCount = 0;
    try {
      const cache = await dependencies.caches!.open(VERIFIED_MEDIA_CACHE);
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
      if (snapshot.activeLanguage !== language) {
        update(language, { status: 'error', error: 'storage', verifiedCount, verifiedBytes, cachedAudioCount, shellReady: false });
      }
    } finally {
      inspections.delete(language);
      if (pendingInspections.has(language) && !snapshot.activeLanguage) void inspect(language);
    }
  };

  const fetchCompleteResource = async (resource: OfflineResource, signal: AbortSignal) => {
    if (signal.aborted) throw new OfflineIntegrityError('cancelled');
    const networkUrl = new URL(absolute(resource.url));
    // Bypass the runtime CacheFirst route when repairing a missing or corrupt entry.
    networkUrl.searchParams.set('__dday_download', '1');
    const transfer = new AbortController();
    const abortTransfer = () => transfer.abort();
    signal.addEventListener('abort', abortTransfer, { once: true });
    const timeout = setTimeout(() => transfer.abort(new OfflineIntegrityError('timeout')), TRANSFER_TIMEOUT_MS);
    try {
      const response = await dependencies.fetch!(networkUrl.href, { signal: transfer.signal, cache: 'no-store', credentials: 'same-origin' });
      const bytes = await readCompleteResponse(resource, response);
      if (transfer.signal.aborted) throw transfer.signal.reason;
      return { response, bytes };
    } catch (error) {
      const reason = transfer.signal.reason;
      transfer.abort();
      throw reason instanceof OfflineIntegrityError ? reason : error;
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abortTransfer);
    }
  };

  const download = async (language: SupportedLanguage) => {
    if (!supported || snapshot.activeLanguage || inspections.has(language)) return;
    const resources = resourcesFor(language);
    if (!resources.length) return;
    pendingInspections.delete(language);
    controller = new AbortController();
    const signal = controller.signal;
    snapshot = { ...snapshot, activeLanguage: language };
    update(language, { status: 'downloading', error: undefined, httpStatus: undefined, currentFile: undefined });
    let verifiedCount = 0, verifiedBytes = 0, cachedAudioCount = 0;
    const countVerified = (resource: OfflineResource) => {
      verifiedCount += 1; verifiedBytes += resource.bytes;
      if (isAudio(resource)) cachedAudioCount += 1;
      update(language, { verifiedCount, verifiedBytes, cachedAudioCount });
    };
    const downloadResources = async () => {
      if (signal.aborted) throw new OfflineIntegrityError('cancelled');
      update(language, { verifiedCount, verifiedBytes, cachedAudioCount });
      let cache: CacheLike;
      try { cache = await dependencies.caches!.open(VERIFIED_MEDIA_CACHE); }
      catch (error) { throw storageFailure(error); }
      // Count existing files before any network failure can interrupt the download.
      const missing: OfflineResource[] = [];
      for (const resource of resources) {
        if (signal.aborted) throw new OfflineIntegrityError('cancelled');
        update(language, { currentFile: resource.url.split('?')[0] });
        if (await readVerified(cache, resource)) countVerified(resource);
        else missing.push(resource);
      }
      for (const resource of missing) {
        if (signal.aborted) throw new OfflineIntegrityError('cancelled');
        update(language, { currentFile: resource.url.split('?')[0] });
        // Without a lock, another tab may have verified this file since our initial scan.
        if (!dependencies.withDownloadLock && await readVerified(cache, resource)) {
          countVerified(resource);
          continue;
        }
        const { response, bytes } = await fetchCompleteResource(resource, signal);
        await verifyBytes(resource, bytes, dependencies.subtle!);
        if (signal.aborted) throw new OfflineIntegrityError('cancelled');
        const headers = new Headers(response.headers);
        headers.delete('content-encoding'); headers.delete('transfer-encoding'); headers.delete('vary');
        headers.set('content-length', String(bytes.byteLength)); headers.set('accept-ranges', 'bytes');
        headers.set('x-dday-verified-sha256', resource.sha256);
        try { await cache.put(absolute(resource.url), new Response(bytes, { status: 200, headers })); }
        catch (error) { throw storageFailure(error); }
        countVerified(resource);
      }
    };
    try {
      if (dependencies.withDownloadLock) await dependencies.withDownloadLock(signal, downloadResources);
      else await downloadResources();
      if (signal.aborted) throw new OfflineIntegrityError('cancelled');
      const details = await environment();
      if (signal.aborted) throw new OfflineIntegrityError('cancelled');
      // A cache handle can outlive its name. Check current membership before reporting success.
      const storage = dependencies.caches!;
      let keys: readonly { url: string }[] = [];
      try {
        if (await storage.has(VERIFIED_MEDIA_CACHE)) keys = await (await storage.open(VERIFIED_MEDIA_CACHE)).keys();
      } catch (error) {
        update(language, { verifiedCount: 0, verifiedBytes: 0, cachedAudioCount: 0, currentFile: undefined });
        throw storageFailure(error);
      }
      const urls = new Set(keys.map(({ url }) => url));
      const present = resources.filter((resource) => urls.has(absolute(resource.url)));
      if (present.length !== resources.length) {
        update(language, {
          verifiedCount: present.length,
          verifiedBytes: present.reduce((sum, resource) => sum + resource.bytes, 0),
          cachedAudioCount: present.filter(isAudio).length,
          currentFile: undefined,
        });
        throw new OfflineIntegrityError('storage');
      }
      if (signal.aborted) throw new OfflineIntegrityError('cancelled');
      update(language, { status: 'ready', currentFile: undefined, ...details });
    } catch (error) {
      if (signal.aborted) {
        update(language, { status: 'partial', error: 'cancelled', currentFile: undefined });
      } else {
        const details = error instanceof OfflineIntegrityError ? error : new OfflineIntegrityError('network');
        update(language, { status: 'error', error: details.code, httpStatus: details.httpStatus });
      }
    } finally {
      controller = null;
      snapshot = { ...snapshot, activeLanguage: null };
      emit();
      for (const pending of pendingInspections) void inspect(pending);
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
