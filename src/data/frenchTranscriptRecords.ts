import { FRENCH_TRANSCRIPTS, FRENCH_TRANSCRIPT_EVIDENCE } from './frenchTranscripts';
import type { TranscriptRecord } from './transcriptResolution';

/** Adapt the existing data and keep its timings, text and review evidence. */
export const FRENCH_TRANSCRIPT_RECORDS = Object.fromEntries(Object.entries(FRENCH_TRANSCRIPTS).map(([id, transcript]): [string, TranscriptRecord] => [id, {
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
}]));
