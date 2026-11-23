import { getTimedTokens } from '../audio/transcriptTiming';
import type { SupportedLanguage } from '../i18n/translations';
import type { MediaResource } from './mediaCatalog';
import type { TimedTranscriptSegment } from './stops';

export type TranscriptStatus = 'aligned' | 'reference-only' | 'unverified' | 'unavailable';
export interface TranscriptProvenance {
  source: string;
  verification: string;
  humanListeningReviewed: boolean;
  issues: readonly string[];
  referencePath?: string;
  referenceSha256?: string;
}
export interface TranscriptRecord {
  id: string;
  language: SupportedLanguage;
  audioSha256: string | null;
  durationSeconds: number | null;
  status: TranscriptStatus;
  provenance: TranscriptProvenance;
  segments: readonly TimedTranscriptSegment[];
  /** Readable phrases whose boundaries or spoken wording still need review. */
  untimedPhrases?: readonly UntimedPhrase[];
  referenceOnlyParagraphs: readonly string[];
}
export interface UntimedPhrase { beforeSegment: number; text: string; }
export type TranscriptRegistry = Partial<Record<SupportedLanguage, Readonly<Record<string, TranscriptRecord>>>>;
export type TranscriptAudioResource = Pick<MediaResource, 'id' | 'language' | 'sha256' | 'durationSeconds' | 'status'>;
export type TranscriptResolutionReason = 'matched' | 'transcript-missing' | 'transcript-identity-mismatch'
  | 'audio-identity-mismatch' | 'audio-hash-mismatch' | 'audio-unavailable' | 'audio-unverified'
  | 'transcript-unavailable' | 'transcript-unverified' | 'reference-only' | 'invalid-timings' | 'no-word-timings';
export interface TranscriptResolution {
  mode: 'synchronized' | 'phrase-synchronized' | 'static' | 'french-fallback' | 'missing';
  requestedLanguage: SupportedLanguage;
  contentLanguage: SupportedLanguage | null;
  /** Present only when every supplied bound is valid for the selected audio. */
  segments: TimedTranscriptSegment[];
  untimedPhrases?: readonly UntimedPhrase[];
  paragraphs: string[];
  /** Unspoken document passages remain separate from the aligned narration. */
  referenceOnlyParagraphs: string[];
  provenance: TranscriptProvenance | null;
  reason: TranscriptResolutionReason;
}

const hasText = (record: TranscriptRecord) => record.segments.some((segment) => segment.text.trim().length > 0)
  || record.referenceOnlyParagraphs.some((paragraph) => paragraph.trim().length > 0);
const sameIdentity = (record: TranscriptRecord | undefined, id: string, language: SupportedLanguage): record is TranscriptRecord =>
  record?.id === id && record.language === language;
const isSha256 = (value: string | null): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);

function validateSegments(record: TranscriptRecord, audio: TranscriptAudioResource): TimedTranscriptSegment[] | null {
  if (!Number.isFinite(record.durationSeconds) || record.durationSeconds === null || record.durationSeconds <= 0
    || !Number.isFinite(audio.durationSeconds) || audio.durationSeconds <= 0) return null;
  const duration = Math.min(record.durationSeconds, audio.durationSeconds);
  let previousStart = -Infinity;
  const segments: TimedTranscriptSegment[] = [];
  for (const [index, segment] of record.segments.entries()) {
    const start = segment.startSeconds;
    const end = record.segments[index + 1]?.startSeconds ?? duration;
    if (!segment.text.trim() || !Number.isFinite(start) || start < 0 || start <= previousStart
      || !Number.isFinite(end) || end <= start || end > duration) return null;
    const supplied = segment.wordTimings ?? [];
    const accepted = getTimedTokens(segment.text, supplied, start, end);
    if (accepted.length !== supplied.length) return null;
    segments.push({ startSeconds: start, text: segment.text, wordTimings: accepted });
    previousStart = start;
  }
  return segments;
}

function validatePhraseSegments(record: TranscriptRecord, audio: TranscriptAudioResource): TimedTranscriptSegment[] | null {
  const { durationSeconds } = record;
  if (durationSeconds === null || !Number.isFinite(durationSeconds) || durationSeconds <= 0
    || !Number.isFinite(audio.durationSeconds) || audio.durationSeconds <= 0 || !record.segments.length) return null;

  const duration = Math.min(durationSeconds, audio.durationSeconds);
  const phrases: TimedTranscriptSegment[] = [];
  let previousEnd = 0;
  for (const { text, startSeconds, endSeconds, wordTimings } of record.segments) {
    if (!text.trim() || wordTimings?.length || !Number.isFinite(startSeconds) || startSeconds < previousEnd
      || endSeconds === undefined || !Number.isFinite(endSeconds) || endSeconds <= startSeconds || endSeconds > duration) return null;
    phrases.push({ text, startSeconds, endSeconds });
    previousEnd = endSeconds;
  }
  return phrases;
}

/** Resolve text independently from UI language; never synchronize a fallback. */
export function resolveTranscriptFromRegistry(
  id: string,
  language: SupportedLanguage,
  audio: TranscriptAudioResource,
  registry: TranscriptRegistry,
): TranscriptResolution {
  const candidate = registry[language]?.[id];
  const base: TranscriptResolution = {
    mode: 'missing', requestedLanguage: language, contentLanguage: null, segments: [],
    paragraphs: [], referenceOnlyParagraphs: [], provenance: null,
    reason: candidate && !sameIdentity(candidate, id, language) ? 'transcript-identity-mismatch' : 'transcript-missing',
  };
  const selected = sameIdentity(candidate, id, language) && hasText(candidate) ? candidate : undefined;
  const french = registry.fr?.[id];
  const fallback = !selected && language !== 'fr' && sameIdentity(french, id, 'fr') && hasText(french) ? french : undefined;
  const text = selected ?? fallback;
  if (!text) return base;
  const untimedPhrases = text.language === 'fr' || text.language === 'en' ? [] : text.untimedPhrases ?? [];
  const ordered = untimedPhrases.every(({ beforeSegment, text: phrase }, index) => Number.isInteger(beforeSegment)
    && beforeSegment >= (untimedPhrases[index - 1]?.beforeSegment ?? 0)
    && beforeSegment <= text.segments.length && phrase.trim());
  const paragraphs = text.segments.map((segment) => segment.text);
  if (ordered) untimedPhrases.forEach((phrase, index) => paragraphs.splice(phrase.beforeSegment + index, 0, phrase.text));
  else paragraphs.push(...untimedPhrases.map((phrase) => phrase.text));
  const result: TranscriptResolution = {
    ...base,
    mode: fallback ? 'french-fallback' : 'static',
    contentLanguage: text.language,
    paragraphs,
    referenceOnlyParagraphs: [...text.referenceOnlyParagraphs],
    provenance: text.provenance,
  };
  if (fallback) return result;
  if (audio.id !== id || audio.language !== language) return { ...result, reason: 'audio-identity-mismatch' };
  if (audio.status === 'unavailable') return { ...result, reason: 'audio-unavailable' };
  if (audio.status !== 'ready') return { ...result, reason: 'audio-unverified' };
  if (!isSha256(text.audioSha256) || !isSha256(audio.sha256) || text.audioSha256.toLowerCase() !== audio.sha256.toLowerCase()) {
    return { ...result, reason: 'audio-hash-mismatch' };
  }
  if (text.status !== 'aligned') return { ...result, reason: text.status === 'unavailable' ? 'transcript-unavailable'
    : text.status === 'unverified' ? 'transcript-unverified' : 'reference-only' };
  if (language !== 'fr' && language !== 'en') {
    const phrases = validatePhraseSegments(text, audio);
    return phrases && ordered ? { ...result, mode: 'phrase-synchronized', segments: phrases,
      ...(untimedPhrases.length ? { untimedPhrases } : {}), reason: 'matched' }
      : { ...result, reason: 'invalid-timings' };
  }
  const segments = validateSegments(text, audio);
  if (!segments) return { ...result, reason: 'invalid-timings' };
  if (!segments.some((segment) => segment.wordTimings?.length)) return { ...result, reason: 'no-word-timings' };
  return { ...result, mode: 'synchronized', segments, reason: 'matched' };
}
