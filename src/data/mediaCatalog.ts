import inventory from './media-catalog.json';
import type { SupportedLanguage } from '../i18n/translations';

export type MediaStatus = 'ready' | 'unverified' | 'unavailable';
export interface MediaResource {
  id: string;
  language: SupportedLanguage;
  status: MediaStatus;
  url: string;
  sha256: string;
  bytes: number;
  durationSeconds: number;
  reason: string;
}
export interface OfflineResource { url: string; sha256: string; bytes: number; }

export const MEDIA_CATALOG: Readonly<Record<SupportedLanguage, Readonly<Record<string, MediaResource>>>> = Object.freeze(
  Object.fromEntries(Object.entries(inventory.audio).map(([language, resources]) => [language, Object.freeze(
    Object.fromEntries(Object.entries(resources).map(([id, record]) => [id, Object.freeze({
      ...record, id, language, url: `/audio/${language}/stop-${id}.mp3?v=${record.sha256}`,
    })])),
  )])) as Record<SupportedLanguage, Record<string, MediaResource>>,
);

/** Availability describes the actual files. It does not certify a translation. */
export function getMediaResource(id: string, language: SupportedLanguage): MediaResource {
  return MEDIA_CATALOG[language]?.[id] ?? {
    id, language, status: 'unavailable', url: '', sha256: '', bytes: 0, durationSeconds: 0, reason: 'missing',
  };
}

export const SHARED_OFFLINE_RESOURCES: readonly OfflineResource[] = inventory.shared;

export function getDownloadableAudio(language: SupportedLanguage): readonly MediaResource[] {
  // File readiness does not certify the narration or transcription. Placeholders never enter a pack.
  return Object.values(MEDIA_CATALOG[language]).filter((resource) => resource.status !== 'unavailable');
}

export function getLanguageResourceSummary(language: SupportedLanguage) {
  const files = Object.values(MEDIA_CATALOG[language]);
  return {
    total: files.length,
    ready: files.filter((resource) => resource.status === 'ready').length,
    unverified: files.filter((resource) => resource.status === 'unverified').length,
    unavailable: files.filter((resource) => resource.status === 'unavailable').length,
    editorialReviewRequired: files.filter((resource) => resource.reason === 'language-detected-editorial-review-pending').length,
    bytes: getDownloadableAudio(language).reduce((sum, resource) => sum + resource.bytes, 0),
  };
}
