import { getTimedTokens } from '../audio/transcriptTiming';
import type { SupportedLanguage } from '../i18n/translations';
import { FRENCH_TRANSCRIPTS, FRENCH_TRANSCRIPT_EVIDENCE } from './frenchTranscripts';
import { ENGLISH_TRANSCRIPTS } from './englishTranscripts';
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
  referenceOnlyParagraphs: readonly string[];
}
export type TranscriptRegistry = Partial<Record<SupportedLanguage, Readonly<Record<string, TranscriptRecord>>>>;
export type TranscriptAudioResource = Pick<MediaResource, 'id' | 'language' | 'sha256' | 'durationSeconds' | 'status'>;
export type TranscriptResolutionReason = 'matched' | 'transcript-missing' | 'transcript-identity-mismatch'
  | 'audio-identity-mismatch' | 'audio-hash-mismatch' | 'audio-unavailable' | 'audio-unverified'
  | 'transcript-unavailable' | 'transcript-unverified' | 'reference-only' | 'invalid-timings' | 'no-word-timings';
export interface TranscriptResolution {
  mode: 'synchronized' | 'static' | 'french-fallback' | 'missing';
  requestedLanguage: SupportedLanguage;
  contentLanguage: SupportedLanguage | null;
  /** Present only when every supplied bound is valid for the selected audio. */
  segments: TimedTranscriptSegment[];
  paragraphs: string[];
  /** Unspoken document passages remain separate from the aligned narration. */
  referenceOnlyParagraphs: string[];
  provenance: TranscriptProvenance | null;
  reason: TranscriptResolutionReason;
}

/** Adapt the existing data; do not rewrite its text, timings or review evidence. */
export const TRANSCRIPT_REGISTRY: TranscriptRegistry = {
  fr: Object.fromEntries(Object.entries(FRENCH_TRANSCRIPTS).map(([id, transcript]): [string, TranscriptRecord] => [id, {
    id,
    language: 'fr',
    audioSha256: transcript.audioSha256,
    durationSeconds: transcript.durationSeconds,
    status: transcript.verification === 'audio-unavailable' ? 'unavailable'
      : transcript.segments.some((segment) => segment.wordTimings?.length) ? 'aligned' : 'reference-only',
    provenance: {
      source: transcript.source?.page ?? 'src/data/french-transcripts.fr.json',
      verification: transcript.verification,
      humanListeningReviewed: FRENCH_TRANSCRIPT_EVIDENCE.humanListeningReviewed,
      issues: transcript.issues,
      referencePath: FRENCH_TRANSCRIPT_EVIDENCE.referencePath,
      referenceSha256: FRENCH_TRANSCRIPT_EVIDENCE.referenceSha256,
    },
    segments: transcript.segments,
    referenceOnlyParagraphs: transcript.referenceOnlyParagraphs,
  }])),
  en: ENGLISH_TRANSCRIPTS,
};

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

/** Resolve text independently from UI language; never synchronize a fallback. */
export function resolveTranscript(
  id: string,
  language: SupportedLanguage,
  audio: TranscriptAudioResource,
  registry: TranscriptRegistry = TRANSCRIPT_REGISTRY,
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
  const result: TranscriptResolution = {
    ...base,
    mode: fallback ? 'french-fallback' : 'static',
    contentLanguage: text.language,
    paragraphs: text.segments.map((segment) => segment.text),
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
  const segments = validateSegments(text, audio);
  if (!segments) return { ...result, reason: 'invalid-timings' };
  if (!segments.some((segment) => segment.wordTimings?.length)) return { ...result, reason: 'no-word-timings' };
  return { ...result, mode: 'synchronized', segments, reason: 'matched' };
}
