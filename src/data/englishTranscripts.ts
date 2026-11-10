import source from './english-transcripts.en.json';
import { tokenizeTranscript } from '../audio/transcriptTiming';
import type { TranscriptRecord } from './transcripts';

interface CtcWordTiming {
  tokenIndex: number;
  startSeconds: number;
  endSeconds: number;
  score: number;
  alignmentCacheId: number;
  nativeIndex: number;
}

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
  // CTC scores remain separate from ASR probabilities. A listening-confirmed
  // word can use a native CTC interval through ctcWordTimings, with provenance.
  alignmentEvidenceCaches?: {
    id: number;
    kind: 'targeted' | 'pilot';
    path: string;
    sha256: string;
    cacheKey: string;
    modelWeightsSha256: string;
  }[];
  wordCorroborations?: {
    segmentIndex: number;
    tokenIndex: number;
    alignmentCacheId: number;
    nativeIndex: number;
    startSeconds: number;
    endSeconds: number;
    score: number;
  }[];
  boundaryCorrections?: {
    segmentIndex: number;
    tokenIndex: number;
    previousTiming: number[];
  }[];
  listeningConfirmedAlignment?: {
    applicationBeforeSha256: string;
    previousRecordSha256: string;
    audioSha256: string;
    presenceConfirmation: {
      source: string;
      audioSha256: string;
      words: { segmentIndex: number; tokenIndex: number; text: string }[];
      wordBoundaryReviewComplete: boolean;
    };
    wordBoundaryReviewComplete: boolean;
    method: string;
    previousTimedWords: number;
    previousUnresolvedWords: EnglishTranscriptSource['unresolvedWords'];
    previousRecognitionCacheIds: number[];
    previousAlignmentCacheIds: number[];
    previousSegmentStarts: { segmentIndex: number; previousStartSeconds: number }[];
    changes: {
      segmentIndex: number;
      tokenIndex: number;
      text: string;
      primary: 'ctc' | 'asr';
      previousTiming: number[] | null;
      recognition: {
        cacheId: number;
        nativeIndex: number;
        word: string;
        startSeconds: number;
        endSeconds: number;
        probability: number;
      }[];
      alignment: (Omit<CtcWordTiming, 'tokenIndex'> & { spokenText: string; minimumCharacterScore: number }) | null;
      reviewFlags: string[];
    }[];
  };
  languageProbability: number;
  totalWords: number;
  timedWords: number;
  issues: string[];
  referenceOnlyParagraphs: string[];
  unresolvedWords: { segmentIndex: number; tokenIndex: number; text: string; reason: string; referenceOnly?: boolean }[];
  excludedBackgroundDialogue: { startSeconds: number; endSeconds: number; reason: string }[];
  // Display token index, unchanged native ASR start/end, confidence, native word index,
  // optional supplementary cache ID (absent/0 means the original recognition cache).
  segments: { startSeconds: number; text: string; timings: number[][]; ctcWordTimings?: CtcWordTiming[] }[];
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
      issues: [
        ...record.issues.map(issue => record.listeningConfirmedAlignment && issue.startsWith('Only exact, context-supported recognized tokens')
          ? `Historical ASR selection rule (before the separately documented listening-confirmed CTC additions): ${issue}` : issue),
        ...(record.listeningConfirmedAlignment ? ['The listener confirmed 16 word occurrences, not their exact boundaries. Native CTC bounds and the documented lexical exceptions supplement the original ASR selection; all boundaries still require human review.'] : []),
        `${record.timedWords}/${record.totalWords} displayed words have retained native bounds; ${record.totalWords - record.timedWords} remain untimed.`,
      ],
      referenceSha256: record.referenceSha256,
    },
    referenceOnlyParagraphs: record.referenceOnlyParagraphs,
    segments: record.segments.map(({ startSeconds, text, timings, ctcWordTimings = [] }) => {
      const tokens = tokenizeTranscript(text);
      return {
        startSeconds,
        text,
        wordTimings: [...timings.map(([tokenIndex, start, end]) => ({
          tokenIndex,
          text: tokens[tokenIndex]?.[0] ?? '',
          startSeconds: start,
          endSeconds: end,
        })), ...ctcWordTimings.map(({ tokenIndex, startSeconds, endSeconds }) => ({
          tokenIndex,
          text: tokens[tokenIndex]?.[0] ?? '',
          startSeconds,
          endSeconds,
        }))].sort((a, b) => a.tokenIndex - b.tokenIndex),
      };
    }),
  }]),
);
