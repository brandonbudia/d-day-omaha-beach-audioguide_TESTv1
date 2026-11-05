import source from './french-transcripts.fr.json';
import type { TimedTranscriptSegment } from './stops';
import { tokenizeTranscript } from '../audio/transcriptTiming';

interface UnresolvedTranscriptWord {
  segmentIndex?: number;
  referenceParagraphIndex?: number;
  tokenIndex: number;
  text: string;
  reason: string;
}

interface FrenchTranscriptRecord {
  audioSha256: string;
  durationSeconds: number;
  verification: string;
  issues: string[];
  referenceOnlyParagraphs: string[];
  unresolvedWords: UnresolvedTranscriptWord[];
  segments: {
    startSeconds: number;
    text: string;
    // Token index, acoustic start, acoustic end. Missing tokens are never interpolated.
    timings: number[][];
  }[];
}

export interface FrenchTranscript {
  audioSha256: string;
  durationSeconds: number;
  verification: string;
  issues: string[];
  referenceOnlyParagraphs: string[];
  unresolvedWords: UnresolvedTranscriptWord[];
  segments: TimedTranscriptSegment[];
  totalWords: number;
  timedWords: number;
}

export const FRENCH_TRANSCRIPT_EVIDENCE = source.evidence;

export const FRENCH_TRANSCRIPTS: Record<string, FrenchTranscript> = Object.fromEntries(
  Object.entries(source.stations as Record<string, FrenchTranscriptRecord>).map(([id, record]) => {
    const segments = record.segments.map(({ startSeconds, text, timings }) => {
      const tokens = tokenizeTranscript(text);
      return {
        startSeconds,
        text,
        wordTimings: timings.map(([tokenIndex, start, end]) => ({
          text: tokens[tokenIndex]?.[0] ?? '',
          tokenIndex,
          startSeconds: start,
          endSeconds: end,
        })),
      };
    });
    return [id, {
      ...record,
      segments,
      totalWords: segments.length
        ? segments.reduce((count, segment) => count + tokenizeTranscript(segment.text).length, 0)
        : record.referenceOnlyParagraphs.reduce((count, text) => count + tokenizeTranscript(text).length, 0),
      timedWords: segments.reduce((count, segment) => count + segment.wordTimings.length, 0),
    }];
  }),
);
