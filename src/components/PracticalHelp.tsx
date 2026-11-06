import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { SupportedLanguage } from '../i18n/translations';
import { experienceText as x } from '../i18n/experienceLabels';

export function PracticalHelp({ language }: { language: SupportedLanguage }) {
  return <details className="museum-card p-5">
    <summary className="min-h-11 cursor-pointer font-semibold flex items-center gap-2"><HelpCircle size={21} aria-hidden="true" />{x('help', language)}</summary>
    <ul className="mt-3 space-y-4 leading-relaxed museum-muted list-disc pl-5">{(['helpAudio', 'helpReading', 'helpHeadphones', 'helpOffline'] as const).map((key) => <li key={key}>{x(key, language)}</li>)}</ul>
  </details>;
}
