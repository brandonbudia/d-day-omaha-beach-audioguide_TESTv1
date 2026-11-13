import React, { useEffect, useState } from 'react';
import type { SupportedLanguage } from '../i18n/translations';
import { t } from '../i18n/translations';

export type WiviNarrativeLanguage = Extract<SupportedLanguage, 'de' | 'it' | 'nl' | 'es'>;

export function hasWiviNarratives(language: SupportedLanguage): language is WiviNarrativeLanguage {
  return language === 'de' || language === 'it' || language === 'nl' || language === 'es';
}

interface WiviText {
  source: string;
  paragraphs: string[];
}

export function WiviNarrative({ stopId, language }: { stopId: string; language: WiviNarrativeLanguage }) {
  const key = `${language}-${stopId}`;
  const [loaded, setLoaded] = useState<{ key: string; text: WiviText } | null>(null);
  useEffect(() => {
    let current = true;
    void import('../data/wivi-narratives.json').then(({ default: narratives }) => {
      const text = narratives[language][stopId as keyof (typeof narratives)[WiviNarrativeLanguage]];
      if (current && text) setLoaded({ key, text });
    }).catch(() => { /* The existing reference remains available if the local text chunk cannot load. */ });
    return () => { current = false; };
  }, [key, language, stopId]);

  if (!loaded || loaded.key !== key) return null;
  return <section className="museum-piece-context museum-card" lang={language}>
    <h3>{t('tab_narrative', language)}</h3>
    <div className="museum-narrative-text">
      {loaded.text.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </div>
    <p><a className="underline" href={loaded.text.source} target="_blank" rel="noreferrer">Wivi</a></p>
  </section>;
}
