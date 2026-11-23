import type { SupportedLanguage } from '../i18n/translations';
import { resolveTranscriptFromRegistry, type TranscriptAudioResource, type TranscriptRecord } from './transcriptResolution';

type Records = Readonly<Record<string, TranscriptRecord>>;

const importRecords: Record<SupportedLanguage, () => Promise<Records>> = {
  fr: () => import('./frenchTranscriptRecords').then(({ FRENCH_TRANSCRIPT_RECORDS }) => FRENCH_TRANSCRIPT_RECORDS),
  en: () => import('./englishTranscripts').then(({ ENGLISH_TRANSCRIPTS }) => ENGLISH_TRANSCRIPTS),
  de: () => import('./de-phrase-transcripts.json').then(({ default: records }) => records as Records),
  pl: () => import('./pl-phrase-transcripts.json').then(({ default: records }) => records as Records),
  es: () => import('./es-phrase-transcripts.json').then(({ default: records }) => records as Records),
  nl: () => import('./nl-phrase-transcripts.json').then(({ default: records }) => records as Records),
  it: () => import('./it-phrase-transcripts.json').then(({ default: records }) => records as Records),
};

const loaded = new Map<SupportedLanguage, Records>();
const pending = new Map<SupportedLanguage, Promise<Records>>();

function loadRecords(language: SupportedLanguage): Promise<Records> {
  const existing = loaded.get(language);
  if (existing) return Promise.resolve(existing);
  const loading = pending.get(language);
  if (loading) return loading;
  const request = importRecords[language]().then((records) => {
    loaded.set(language, records);
    return records;
  }).finally(() => pending.delete(language));
  pending.set(language, request);
  return request;
}

/** An undefined result still needs a module. A missing result is an editorial fallback. */
export function getLoadedTranscript(id: string, language: SupportedLanguage, audio: TranscriptAudioResource) {
  const records = loaded.get(language);
  if (!records) return undefined;
  const selected = resolveTranscriptFromRegistry(id, language, audio, { [language]: records });
  if (selected.mode !== 'missing' || language === 'fr') return selected;
  const french = loaded.get('fr');
  return french ? resolveTranscriptFromRegistry(id, language, audio, { [language]: records, fr: french }) : undefined;
}

export async function loadTranscript(id: string, language: SupportedLanguage, audio: TranscriptAudioResource) {
  const records = await loadRecords(language);
  const selected = resolveTranscriptFromRegistry(id, language, audio, { [language]: records });
  if (selected.mode !== 'missing' || language === 'fr') return selected;
  const french = await loadRecords('fr');
  return resolveTranscriptFromRegistry(id, language, audio, { [language]: records, fr: french });
}
