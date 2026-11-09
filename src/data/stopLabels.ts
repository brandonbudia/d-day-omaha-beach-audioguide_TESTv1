import source from './english-stop-labels.en.json';
import type { StopData } from './stops';
import type { SupportedLanguage } from '../i18n/translations';

export const ENGLISH_STOP_LABEL_EVIDENCE = source.evidence;
export const ENGLISH_STOP_LABELS: Readonly<Record<string, { title: string; sourceUrl: string }>> = source.stations;
type LabelField = 'title' | 'shortTitle' | 'playerTitle';

/** Published English labels are separate from the preserved French catalogue. */
export function getStopLabel(stop: StopData, language: SupportedLanguage, field: LabelField = 'title') {
  const published = language === 'en' ? ENGLISH_STOP_LABELS[stop.id] : undefined;
  if (published) {
    return {
      text: field === 'shortTitle' ? published.title : `${stop.number}. ${published.title}`,
      language: 'en' as const,
      sourceUrl: published.sourceUrl,
    };
  }
  return { text: stop[field], language: 'fr' as const, sourceUrl: null };
}
