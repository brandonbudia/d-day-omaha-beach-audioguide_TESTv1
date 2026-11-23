import { STOPS } from '../data/stops';
import { LANGUAGES, type SupportedLanguage } from '../i18n/translations';
import { createIndexedDBWriteCoordinator, type CoordinateVisitorWrite } from './visitorWriteCoordinator';

export const VISITOR_STORAGE_KEY = 'dday_visitor_state_v2';
export const LEGACY_VISITS_KEY = 'dday_visited_stops';
export const LISTENED_COVERAGE = 0.9;
export type HeardRange = [number, number];

export interface PlaybackRecord {
  positionSeconds: number;
  durationSeconds: number;
  heardRanges: HeardRange[];
  audioIdentity: string;
  updatedAt: number;
  completedAt?: number;
  [extra: string]: unknown;
}

export interface VisitorPiece {
  consulted: boolean;
  consultedAt?: number;
  legacyConsulted?: true;
  discoveredAt?: number;
  favorite?: boolean;
  favoriteUpdatedAt?: number;
  listening: Partial<Record<SupportedLanguage, PlaybackRecord>>;
  archivedListening?: Partial<Record<SupportedLanguage, PlaybackRecord[]>>;
  [extra: string]: unknown;
}

export interface PlaybackCheckpoint {
  id: string;
  language: SupportedLanguage;
  positionSeconds: number;
  durationSeconds: number;
  audioIdentity: string;
  updatedAt: number;
}

export interface VisitorState {
  version: 2;
  pieces: Record<string, VisitorPiece>;
  legacyConsultedIds: string[];
  lastConsultedId?: string;
  lastListenedId?: string;
  lastPlayback?: PlaybackCheckpoint;
  updatedAt: number;
  persistence: 'local' | 'memory' | 'protected';
  [extra: string]: unknown;
}

export interface PlaybackCapture extends Omit<PlaybackCheckpoint, 'updatedAt'> {
  playedRanges: HeardRange[];
  ended?: boolean;
}

export interface VisitorStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type VisitorMutation = (current: VisitorState) => VisitorState;

const ids = new Set(STOPS.map((stop) => stop.id));
const languages = new Set<string>(LANGUAGES.map((language) => language.code));
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const timestamp = (value: unknown) => finite(value) && value >= 0 ? value : undefined;
const emptyPiece = (): VisitorPiece => ({ consulted: false, listening: {} });

export const isConsulted = (piece: VisitorPiece | undefined) => piece?.consulted === true;
export const hasListened = (piece: VisitorPiece | undefined, language?: SupportedLanguage, audioIdentity?: string) => {
  const records = language ? [piece?.listening[language]] : Object.values(piece?.listening ?? {});
  return records.some((record) => record?.completedAt !== undefined && (!audioIdentity || record.audioIdentity === audioIdentity));
};
export const isDiscovered = (piece: VisitorPiece | undefined) => piece?.discoveredAt !== undefined || hasListened(piece)
  || Object.values(piece?.archivedListening ?? {}).some((records) => records?.some((record) => record.completedAt !== undefined));

/** Only actual played intervals are merged. Seeking does not manufacture heard time. */
export function mergeHeardRanges(ranges: unknown, duration: number): HeardRange[] {
  if (!Array.isArray(ranges) || !Number.isFinite(duration) || duration <= 0) return [];
  const valid = ranges.filter((range): range is HeardRange => Array.isArray(range) && range.length === 2 && finite(range[0]) && finite(range[1]))
    .map(([start, end]): HeardRange => [Math.max(0, Math.min(start, duration)), Math.max(0, Math.min(end, duration))])
    .filter(([start, end]) => end > start).sort((a, b) => a[0] - b[0]);
  const merged: HeardRange[] = [];
  for (const range of valid) {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

function normalizeRecord(raw: unknown): PlaybackRecord | undefined {
  if (!isObject(raw) || !finite(raw.durationSeconds) || raw.durationSeconds <= 0 || typeof raw.audioIdentity !== 'string' || !raw.audioIdentity) return;
  return {
    ...raw,
    durationSeconds: raw.durationSeconds,
    positionSeconds: finite(raw.positionSeconds) ? Math.max(0, Math.min(raw.positionSeconds, raw.durationSeconds)) : 0,
    audioIdentity: raw.audioIdentity,
    heardRanges: mergeHeardRanges(raw.heardRanges, raw.durationSeconds),
    updatedAt: timestamp(raw.updatedAt) ?? 0,
    completedAt: timestamp(raw.completedAt),
  };
}

function normalizePiece(raw: unknown): VisitorPiece {
  if (!isObject(raw)) return { ...emptyPiece(), preservedInvalidPiece: raw };
  const listening: VisitorPiece['listening'] = {};
  const archivedListening: NonNullable<VisitorPiece['archivedListening']> = {};
  const preservedPlayback = isObject(raw.preservedUnrecognizedPlayback) ? { ...raw.preservedUnrecognizedPlayback } : {};
  const unrecognizedListening: Record<string, unknown> = {};
  const unrecognizedArchive: Record<string, unknown> = {};
  if (isObject(raw.listening)) for (const [language, value] of Object.entries(raw.listening)) {
    const record = normalizeRecord(value);
    if (languages.has(language) && record) listening[language as SupportedLanguage] = record;
    else unrecognizedListening[language] = value;
  }
  if (isObject(raw.archivedListening)) for (const [language, values] of Object.entries(raw.archivedListening)) {
    if (languages.has(language) && Array.isArray(values)) {
      const normalized = values.map(normalizeRecord);
      archivedListening[language as SupportedLanguage] = normalized.filter((value): value is PlaybackRecord => Boolean(value));
      if (normalized.some((value) => !value)) unrecognizedArchive[language] = values;
    } else unrecognizedArchive[language] = values;
  }
  if (Object.keys(unrecognizedListening).length) preservedPlayback.listening = { ...(isObject(preservedPlayback.listening) ? preservedPlayback.listening : {}), ...unrecognizedListening };
  if (Object.keys(unrecognizedArchive).length) preservedPlayback.archivedListening = { ...(isObject(preservedPlayback.archivedListening) ? preservedPlayback.archivedListening : {}), ...unrecognizedArchive };
  if (raw.listening !== undefined && !isObject(raw.listening)) preservedPlayback.invalidListening = raw.listening;
  if (raw.archivedListening !== undefined && !isObject(raw.archivedListening)) preservedPlayback.invalidArchive = raw.archivedListening;
  return {
    ...raw,
    consulted: raw.consulted === true,
    consultedAt: timestamp(raw.consultedAt),
    discoveredAt: timestamp(raw.discoveredAt),
    favorite: typeof raw.favorite === 'boolean' ? raw.favorite : undefined,
    favoriteUpdatedAt: timestamp(raw.favoriteUpdatedAt),
    listening,
    archivedListening,
    ...(Object.keys(preservedPlayback).length ? { preservedUnrecognizedPlayback: preservedPlayback } : {}),
  };
}

function browserStorage(): VisitorStorage | null {
  try { return typeof window !== 'undefined' ? window.localStorage ?? globalThis.localStorage : null; }
  catch { return null; }
}

export function createVisitorStore(storage: VisitorStorage | null = browserStorage(), now = () => Date.now(), coordinate?: CoordinateVisitorWrite) {
  const listeners = new Set<() => void>();
  const read = (): VisitorState => {
    let raw: Record<string, unknown> = {};
    let legacy: string[] = [];
    let persistence: VisitorState['persistence'] = storage ? 'local' : 'memory';
    try {
      const saved = storage?.getItem(VISITOR_STORAGE_KEY);
      if (saved != null) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (isObject(parsed) && parsed.version === 2 && isObject(parsed.pieces)) raw = parsed;
          else persistence = 'protected';
        } catch { persistence = 'protected'; }
      }
      const old = storage?.getItem(LEGACY_VISITS_KEY);
      if (old) {
        try { const parsed: unknown = JSON.parse(old); if (Array.isArray(parsed)) legacy = parsed.filter((id): id is string => typeof id === 'string' && ids.has(id)); }
        catch { /* The original legacy value is never overwritten or removed. */ }
      }
    } catch { if (persistence !== 'protected') persistence = 'memory'; }
    const pieces: VisitorState['pieces'] = {};
    if (isObject(raw.pieces)) for (const [id, value] of Object.entries(raw.pieces)) if (ids.has(id)) pieces[id] = normalizePiece(value);
    for (const id of legacy) pieces[id] = { ...(pieces[id] ?? emptyPiece()), consulted: true, legacyConsulted: true };
    const checkpoint = isObject(raw.lastPlayback) ? raw.lastPlayback : null;
    const normalizedCheckpoint = normalizeRecord(checkpoint);
    const lastPlayback = checkpoint && normalizedCheckpoint && typeof checkpoint.id === 'string' && ids.has(checkpoint.id) && typeof checkpoint.language === 'string' && languages.has(checkpoint.language)
      ? { ...normalizedCheckpoint, id: checkpoint.id, language: checkpoint.language as SupportedLanguage } : undefined;
    return {
      ...raw,
      version: 2,
      pieces,
      legacyConsultedIds: [...new Set([...legacy, ...(Array.isArray(raw.legacyConsultedIds) ? raw.legacyConsultedIds.filter((id): id is string => typeof id === 'string') : [])])],
      lastConsultedId: typeof raw.lastConsultedId === 'string' && ids.has(raw.lastConsultedId) ? raw.lastConsultedId : undefined,
      lastListenedId: typeof raw.lastListenedId === 'string' && ids.has(raw.lastListenedId) ? raw.lastListenedId : undefined,
      lastPlayback,
      updatedAt: timestamp(raw.updatedAt) ?? 0,
      persistence,
      // Preserve unrecognised entries rather than dropping user data from a future schema.
      preservedUnknownPieces: { ...(isObject(raw.preservedUnknownPieces) ? raw.preservedUnknownPieces : {}), ...(isObject(raw.pieces) ? Object.fromEntries(Object.entries(raw.pieces).filter(([id]) => !ids.has(id))) : {}) },
    };
  };
  let snapshot = read();
  const pending: VisitorMutation[] = [];
  let activeWrite: Promise<void> | undefined;
  let queuedDuringWrite = false;
  const publish = (next: VisitorState) => {
    if (next === snapshot) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const withPending = (latest: VisitorState) => pending.reduce((current, mutate) => mutate(current), latest);
  const keepInMemory = (persistence: 'protected' | 'memory', next = snapshot) => {
    // Keep session edits when persistence fails. Do not retain a growing queue of unsaveable checkpoints.
    pending.length = 0;
    queuedDuringWrite = false;
    publish({ ...next, persistence });
  };
  const writePending = () => {
    queuedDuringWrite = false;
    if (snapshot.persistence !== 'local' || !storage) return;
    const latest = read();
    if (latest.persistence !== 'local') {
      keepInMemory(latest.persistence, coordinate ? snapshot : withPending(snapshot));
      return;
    }
    const next = withPending(latest);
    try {
      if (next !== latest) storage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(next));
    } catch {
      keepInMemory('memory', next);
      return;
    }
    pending.length = 0;
    publish(next);
  };
  const scheduleWrite = () => {
    if (!coordinate) {
      // Rebase synchronously when neither coordinator is available. LocalStorage cannot serialize tabs.
      writePending();
    } else if (activeWrite) {
      queuedDuringWrite = true;
    } else {
      activeWrite = Promise.resolve()
        .then(() => coordinate(writePending))
        .catch(() => {
          // A failed lock request cannot be replaced by an unlocked write while other tabs may hold it.
          if (snapshot.persistence === 'local') keepInMemory('memory');
        })
        .finally(() => {
          activeWrite = undefined;
          if (queuedDuringWrite) scheduleWrite();
        });
    }
  };
  const apply = (mutate: VisitorMutation) => {
    if (snapshot.persistence !== 'local') { publish(mutate(snapshot)); return; }
    pending.push(mutate);
    if (coordinate) publish(mutate(snapshot));
    scheduleWrite();
  };
  const mutatePiece = (id: string, mutate: (piece: VisitorPiece, at: number) => VisitorPiece, consulted = false) => {
    if (!ids.has(id)) return;
    const at = now();
    apply((current) => {
      const lastConsulted = current.lastConsultedId && current.pieces[current.lastConsultedId];
      return {
        ...current,
        ...(consulted && (!lastConsulted || at >= (lastConsulted.consultedAt ?? 0)) ? { lastConsultedId: id } : {}),
        pieces: { ...current.pieces, [id]: mutate(current.pieces[id] ?? emptyPiece(), at) },
        updatedAt: Math.max(current.updatedAt, at),
      };
    });
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    recordConsulted(id: string) {
      mutatePiece(id, (piece, at) => ({ ...piece, consulted: true, consultedAt: Math.max(at, piece.consultedAt ?? 0) }), true);
    },
    markDiscovered(id: string) {
      mutatePiece(id, (piece, at) => ({ ...piece, discoveredAt: piece.discoveredAt ?? at }));
    },
    toggleFavorite(id: string) {
      const favorite = snapshot.pieces[id]?.favorite !== true;
      mutatePiece(id, (piece, at) => at < (piece.favoriteUpdatedAt ?? 0) ? piece : { ...piece, favorite, favoriteUpdatedAt: at });
    },
    capturePlayback(input: PlaybackCapture) {
      if (!ids.has(input.id) || !languages.has(input.language) || !finite(input.positionSeconds) || !finite(input.durationSeconds) || input.durationSeconds <= 0 || !input.audioIdentity) return;
      const at = now();
      const played = mergeHeardRanges(input.playedRanges, input.durationSeconds);
      apply((current) => {
        const piece = current.pieces[input.id] ?? emptyPiece();
        const active = piece.listening[input.language];
        const sameAudio = active?.audioIdentity === input.audioIdentity;
        if (!sameAudio && !played.length) return current;
        const history = [...(piece.archivedListening?.[input.language] ?? [])];
        const matchingArchive = history.filter((entry) => entry.audioIdentity === input.audioIdentity).at(-1);
        const previous = sameAudio ? active : matchingArchive;
        const position = previous && previous.updatedAt > at ? previous : input;
        const duration = position.durationSeconds;
        const ranges = mergeHeardRanges([...(previous?.heardRanges ?? []), ...played], duration);
        const heard = ranges.reduce((sum, [start, end]) => sum + end - start, 0);
        const tail = ranges.at(-1);
        // Completion requires substantial real listening, hearing the final half-second and the native ended event.
        const reachedEndByListening = Boolean(tail && tail[1] >= duration - 0.15 && tail[1] - tail[0] >= Math.min(0.5, duration));
        const completed = input.ended === true && reachedEndByListening && heard / duration >= LISTENED_COVERAGE;
        const record: PlaybackRecord = {
          ...previous,
          positionSeconds: Math.max(0, Math.min(position.positionSeconds, duration)),
          durationSeconds: duration,
          audioIdentity: input.audioIdentity,
          heardRanges: ranges,
          updatedAt: Math.max(at, previous?.updatedAt ?? 0),
          completedAt: previous?.completedAt ?? (completed ? Math.max(at, previous?.updatedAt ?? 0) : undefined),
        };
        const archiveOnly = active && !sameAudio && active.updatedAt > at;
        if (archiveOnly && matchingArchive) history[history.lastIndexOf(matchingArchive)] = record;
        else if (archiveOnly) history.push(record);
        else if (active && !sameAudio) history.push(active);
        const updatePointer = !archiveOnly && at >= (current.lastPlayback?.updatedAt ?? 0);
        return {
          ...current,
          pieces: {
            ...current.pieces,
            [input.id]: {
              ...piece,
              listening: archiveOnly ? piece.listening : { ...piece.listening, [input.language]: record },
              archivedListening: { ...piece.archivedListening, [input.language]: history },
            },
          },
          ...(updatePointer ? {
            lastListenedId: input.id,
            lastPlayback: { id: input.id, language: input.language, positionSeconds: record.positionSeconds, durationSeconds: duration, audioIdentity: input.audioIdentity, updatedAt: at },
          } : {}),
          updatedAt: Math.max(current.updatedAt, at),
        };
      });
    },
    /** A storage event never writes back, avoiding cross-tab notification loops. */
    reloadFromStorage() {
      if (snapshot.persistence !== 'local') return;
      const latest = read();
      if (latest.persistence === 'local') publish(withPending(latest));
      else keepInMemory(latest.persistence);
    },
    /** Deliberate document reloads can wait for the current batch to commit. */
    async whenPersisted(): Promise<boolean> {
      while (activeWrite) await activeWrite;
      return pending.length === 0 && snapshot.persistence === 'local';
    },
  };
}

function browserWriteCoordinator(): CoordinateVisitorWrite | undefined {
  try {
    const locks = typeof window !== 'undefined' ? window.navigator?.locks : undefined;
    if (typeof locks?.request === 'function') return (write) => locks.request(VISITOR_STORAGE_KEY, write);
  } catch { /* Try IndexedDB if Web Locks cannot be accessed. */ }
  if (typeof window === 'undefined') return;
  try {
    const factory = window.indexedDB;
    if (typeof factory?.open === 'function') return createIndexedDBWriteCoordinator(factory);
  } catch (error) {
    // A denied coordinator must not be replaced by an unlocked write while other tabs may hold it.
    return () => Promise.reject(error);
  }
}

const localStorageArea = browserStorage();
export const visitorStore = createVisitorStore(localStorageArea, undefined, browserWriteCoordinator());
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event.storageArea === localStorageArea && (event.key === null || event.key === VISITOR_STORAGE_KEY || event.key === LEGACY_VISITS_KEY)) {
      visitorStore.reloadFromStorage();
    }
  });
}
