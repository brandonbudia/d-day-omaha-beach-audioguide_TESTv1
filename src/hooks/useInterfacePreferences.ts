import { useEffect, useState } from 'react';

export interface InterfacePreferences {
  highContrast: boolean;
  largeText: boolean;
}

export const INTERFACE_PREFERENCES_KEY = 'dday-interface-preferences-v1';
const defaults: InterfacePreferences = { highContrast: false, largeText: false };
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;

function decodeRecord(raw: string | null): Record<string, unknown> | null {
  if (raw === null) return { version: 1 };
  try {
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
    const supplied = record as Record<string, unknown>;
    if (supplied.version !== 1) return null;
    for (const key of ['highContrast', 'largeText']) {
      if (key in supplied && typeof supplied[key] !== 'boolean') return null;
    }
    return supplied;
  } catch { return null; }
}

/** Unreadable/future formats are preserved and never silently replaced. */
export function readInterfacePreferences(storage: PreferenceStorage | null, fallback: InterfacePreferences = defaults): InterfacePreferences {
  try {
    const supplied = storage ? decodeRecord(storage.getItem(INTERFACE_PREFERENCES_KEY)) : null;
    return {
      highContrast: typeof supplied?.highContrast === 'boolean' ? supplied.highContrast : fallback.highContrast,
      largeText: typeof supplied?.largeText === 'boolean' ? supplied.largeText : fallback.largeText,
    };
  } catch { return { ...fallback }; }
}

export function saveInterfacePreferences(storage: PreferenceStorage | null, preferences: InterfacePreferences): boolean {
  if (!storage) return false;
  try {
    // Re-read before each save so unrelated fields added by another version survive.
    const supplied = decodeRecord(storage.getItem(INTERFACE_PREFERENCES_KEY));
    if (!supplied) return false;
    storage.setItem(INTERFACE_PREFERENCES_KEY, JSON.stringify({ ...supplied, ...preferences }));
    return true;
  } catch { return false; }
}

function browserStorage(): PreferenceStorage | null {
  try { return window.localStorage; }
  catch { return null; }
}

export function useInterfacePreferences() {
  const [preferences, setPreferences] = useState<InterfacePreferences>(() => {
    const classes = typeof document !== 'undefined' ? document.documentElement.classList : null;
    return readInterfacePreferences(browserStorage(), {
      highContrast: Boolean(classes?.contains('high-contrast') || classes?.contains('sun-mode')),
      largeText: Boolean(classes?.contains('large-text')),
    });
  });
  useEffect(() => { saveInterfacePreferences(browserStorage(), preferences); }, [preferences]);
  const toggle = (key: keyof InterfacePreferences) => setPreferences((previous) => ({ ...previous, [key]: !previous[key] }));
  return { preferences, toggle };
}
