import { STOPS } from '../data/stops';
import { LANGUAGES, type SupportedLanguage } from '../i18n/translations';

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

export function createVisitorStore(storage: VisitorStorage | null = browserStorage(), now = () => Date.now()) {
  let canWrite = Boolean(storage);
  const listeners = new Set<() => void>();
  const read = (): VisitorState => {
    canWrite = Boolean(storage);
    let raw: Record<string, unknown> = {};
    let legacy: string[] = [];
    let persistence: VisitorState['persistence'] = storage ? 'local' : 'memory';
    try {
      const saved = storage?.getItem(VISITOR_STORAGE_KEY);
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (isObject(parsed) && parsed.version === 2 && isObject(parsed.pieces)) raw = parsed;
          else { canWrite = false; persistence = 'protected'; }
        } catch { canWrite = false; persistence = 'protected'; }
      }
      const old = storage?.getItem(LEGACY_VISITS_KEY);
      if (old) {
        try { const parsed: unknown = JSON.parse(old); if (Array.isArray(parsed)) legacy = parsed.filter((id): id is string => typeof id === 'string' && ids.has(id)); }
        catch { /* The original legacy value is never overwritten or removed. */ }
      }
    } catch { canWrite = false; persistence = 'memory'; }
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
  const commit = (next: VisitorState) => {
    if (canWrite && storage) {
      try { storage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(next)); }
      catch { next = { ...next, persistence: 'memory' }; }
    }
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const mutatePiece = (id: string, mutate: (piece: VisitorPiece, at: number) => VisitorPiece, pointer?: Partial<VisitorState>) => {
    if (!ids.has(id)) return;
    const at = now();
    commit({ ...snapshot, ...pointer, pieces: { ...snapshot.pieces, [id]: mutate(snapshot.pieces[id] ?? emptyPiece(), at) }, updatedAt: at });
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    recordConsulted(id: string) {
      mutatePiece(id, (piece, at) => ({ ...piece, consulted: true, consultedAt: at }), { lastConsultedId: id });
    },
    markDiscovered(id: string) {
      mutatePiece(id, (piece, at) => ({ ...piece, discoveredAt: piece.discoveredAt ?? at }));
    },
    toggleFavorite(id: string) {
      mutatePiece(id, (piece, at) => ({ ...piece, favorite: piece.favorite !== true, favoriteUpdatedAt: at }));
    },
    capturePlayback(input: PlaybackCapture) {
      if (!ids.has(input.id) || !languages.has(input.language) || !finite(input.positionSeconds) || !finite(input.durationSeconds) || input.durationSeconds <= 0 || !input.audioIdentity) return;
      const at = now();
      const piece = snapshot.pieces[input.id] ?? emptyPiece();
      const old = piece.listening[input.language];
      const sameAudio = old?.audioIdentity === input.audioIdentity;
      const history = [...(piece.archivedListening?.[input.language] ?? [])];
      if (old && !sameAudio) history.push(old);
      const matchingPrevious = sameAudio ? old : [...history].reverse().find((record) => record.audioIdentity === input.audioIdentity);
      if (!sameAudio && mergeHeardRanges(input.playedRanges, input.durationSeconds).length === 0) return;
      const ranges = mergeHeardRanges([...(matchingPrevious?.heardRanges ?? []), ...input.playedRanges], input.durationSeconds);
      const heard = ranges.reduce((sum, [start, end]) => sum + end - start, 0);
      const tail = ranges.at(-1);
      // Completion requires both substantial real listening and hearing the final half-second.
      // The ended flag comes only from the native ended event, never from a seek position.
      const reachedEndByListening = Boolean(tail && tail[1] >= input.durationSeconds - 0.15 && tail[1] - tail[0] >= Math.min(0.5, input.durationSeconds));
      const completed = input.ended === true && reachedEndByListening && heard / input.durationSeconds >= LISTENED_COVERAGE;
      const record: PlaybackRecord = {
        ...matchingPrevious,
        positionSeconds: Math.max(0, Math.min(input.positionSeconds, input.durationSeconds)),
        durationSeconds: input.durationSeconds,
        audioIdentity: input.audioIdentity,
        heardRanges: ranges,
        updatedAt: at,
        completedAt: matchingPrevious?.completedAt ?? (completed ? at : undefined),
      };
      commit({
        ...snapshot,
        pieces: { ...snapshot.pieces, [input.id]: { ...piece, listening: { ...piece.listening, [input.language]: record }, archivedListening: { ...piece.archivedListening, [input.language]: history } } },
        lastListenedId: input.id,
        lastPlayback: { id: input.id, language: input.language, positionSeconds: record.positionSeconds, durationSeconds: record.durationSeconds, audioIdentity: input.audioIdentity, updatedAt: at },
        updatedAt: at,
      });
    },
    /** A storage event never writes back, avoiding cross-tab notification loops. */
    reloadFromStorage() {
      snapshot = read();
      listeners.forEach((listener) => listener());
    },
  };
}

export const visitorStore = createVisitorStore();
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event.key === VISITOR_STORAGE_KEY || event.key === LEGACY_VISITS_KEY) visitorStore.reloadFromStorage();
  });
}
