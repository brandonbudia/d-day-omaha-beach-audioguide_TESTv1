import { useEffect, useSyncExternalStore } from 'react';
import type { SupportedLanguage } from '../i18n/translations';
import { offlineStore } from './offlineStore';

export function useOfflineState(language: SupportedLanguage, enabled = true) {
  const snapshot = useSyncExternalStore(offlineStore.subscribe, offlineStore.getSnapshot, offlineStore.getSnapshot);
  useEffect(() => {
    if (enabled && !snapshot.activeLanguage && snapshot.packs[language].status === 'idle') void offlineStore.inspect(language);
  }, [enabled, language, snapshot.activeLanguage, snapshot.packs[language].status]);
  useEffect(() => {
    if (!enabled) return;
    const inspectOnReturn = () => { if (document.visibilityState === 'visible') void offlineStore.inspect(language); };
    window.addEventListener('focus', inspectOnReturn);
    document.addEventListener('visibilitychange', inspectOnReturn);
    void offlineStore.inspect(language);
    return () => { window.removeEventListener('focus', inspectOnReturn); document.removeEventListener('visibilitychange', inspectOnReturn); };
  }, [enabled, language]);
  return { ...snapshot.packs[language], activeLanguage: snapshot.activeLanguage };
}
