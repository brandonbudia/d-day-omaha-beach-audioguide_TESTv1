import { useEffect, useState } from 'react';

export interface ReadingPreferences {
  wideSpacing: boolean;
  colorAssistance: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
}

export const READING_PREFERENCES_KEY = 'dday-reading-preferences-v1';
const defaults: ReadingPreferences = { wideSpacing: false, colorAssistance: false, dyslexicFont: false, reducedMotion: false };

export function normalizeReadingPreferences(value: unknown): ReadingPreferences {
  const supplied = value && typeof value === 'object' ? value as Partial<ReadingPreferences> : {};
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [
    key, typeof supplied[key as keyof ReadingPreferences] === 'boolean' ? supplied[key as keyof ReadingPreferences] : fallback,
  ])) as unknown as ReadingPreferences;
}

export function useReadingPreferences() {
  const [preferences, setPreferences] = useState<ReadingPreferences>(() => {
    try { return normalizeReadingPreferences(JSON.parse(localStorage.getItem(READING_PREFERENCES_KEY) ?? 'null')); }
    catch { return { ...defaults }; }
  });
  useEffect(() => {
    try { localStorage.setItem(READING_PREFERENCES_KEY, JSON.stringify(preferences)); }
    catch { /* Reading choices still work for this visit if storage is unavailable. */ }
  }, [preferences]);
  const toggle = (key: keyof ReadingPreferences) => setPreferences((previous) => ({ ...previous, [key]: !previous[key] }));
  return { preferences, toggle };
}
