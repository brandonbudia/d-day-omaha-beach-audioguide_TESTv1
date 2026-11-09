import source from './english-transcripts.en.json';
import { tokenizeTranscript } from '../audio/transcriptTiming';
import type { TranscriptRecord } from './transcripts';

interface EnglishTranscriptSource {
  audioSha256: string;
  durationSeconds: number;
  verification: string;
  sourceUrl: string;
  referenceSha256: string;
  recognitionCacheKey: string;
  recognitionCacheSha256: string;
  supplementaryRecognitionCaches?: {
    id: number;
    path: string;
    sha256: string;
    cacheKey: string;
    modelRevision: string;
    windowSeconds: number[];
  }[];
  languageProbability: number;
  totalWords: number;
  timedWords: number;
  issues: string[];
  referenceOnlyParagraphs: string[];
  unresolvedWords: { segmentIndex: number; tokenIndex: number; text: string; reason: string; referenceOnly?: boolean }[];
  excludedBackgroundDialogue: { startSeconds: number; endSeconds: number; reason: string }[];
  // Display token index, unchanged native ASR start/end, confidence, native word index,
  // optional supplementary cache ID (absent/0 means the original recognition cache).
  segments: { startSeconds: number; text: string; timings: number[][] }[];
}

export const ENGLISH_TRANSCRIPT_EVIDENCE = source.evidence;
export const ENGLISH_TRANSCRIPT_SOURCES = source.stations as Record<string, EnglishTranscriptSource>;

/** English has its own recording, text and acoustic bounds. It never borrows French timings. */
export const ENGLISH_TRANSCRIPTS: Record<string, TranscriptRecord> = Object.fromEntries(
  Object.entries(ENGLISH_TRANSCRIPT_SOURCES).map(([id, record]): [string, TranscriptRecord] => [id, {
    id,
    language: 'en',
    audioSha256: record.audioSha256,
    durationSeconds: record.durationSeconds,
    status: record.timedWords > 0 ? 'aligned' : 'reference-only',
    provenance: {
      source: record.sourceUrl,
      verification: record.verification,
      humanListeningReviewed: false,
      issues: [...record.issues, `${record.timedWords}/${record.totalWords} displayed words have retained native bounds; ${record.totalWords - record.timedWords} remain untimed.`],
      referenceSha256: record.referenceSha256,
    },
    referenceOnlyParagraphs: record.referenceOnlyParagraphs,
    segments: record.segments.map(({ startSeconds, text, timings }) => {
      const tokens = tokenizeTranscript(text);
      return {
        startSeconds,
        text,
        wordTimings: timings.map(([tokenIndex, start, end]) => ({
          tokenIndex,
          text: tokens[tokenIndex]?.[0] ?? '',
          startSeconds: start,
          endSeconds: end,
        })),
      };
    }),
  }]),
);
