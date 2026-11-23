import type { SupportedLanguage } from '../i18n/translations';
import { FRENCH_TRANSCRIPT_RECORDS } from './frenchTranscriptRecords';
import { ENGLISH_TRANSCRIPTS } from './englishTranscripts';
import german from './de-phrase-transcripts.json';
import polish from './pl-phrase-transcripts.json';
import spanish from './es-phrase-transcripts.json';
import dutch from './nl-phrase-transcripts.json';
import italian from './it-phrase-transcripts.json';
import { resolveTranscriptFromRegistry, type TranscriptAudioResource, type TranscriptRecord, type TranscriptRegistry } from './transcriptResolution';

export type * from './transcriptResolution';

/** Complete synchronous registry for editorial audits and fixtures. The player loads one language at a time. */
export const TRANSCRIPT_REGISTRY: TranscriptRegistry = {
  fr: FRENCH_TRANSCRIPT_RECORDS,
  en: ENGLISH_TRANSCRIPTS,
  de: german as Readonly<Record<string, TranscriptRecord>>,
  pl: polish as Readonly<Record<string, TranscriptRecord>>,
  es: spanish as Readonly<Record<string, TranscriptRecord>>,
  nl: dutch as Readonly<Record<string, TranscriptRecord>>,
  it: italian as Readonly<Record<string, TranscriptRecord>>,
};

export function resolveTranscript(id: string, language: SupportedLanguage, audio: TranscriptAudioResource, registry = TRANSCRIPT_REGISTRY) {
  return resolveTranscriptFromRegistry(id, language, audio, registry);
}
