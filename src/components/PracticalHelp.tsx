import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { SupportedLanguage } from '../i18n/translations';
import { experienceText as x } from '../i18n/experienceLabels';

export function PracticalHelp({ language }: { language: SupportedLanguage }) {
  return <details className="museum-card museum-visitor-help">
    <summary><HelpCircle size={21} aria-hidden="true" /><span>{x('help', language)}</span><ChevronDown size={18} aria-hidden="true" /></summary>
    <ul className="mt-3 max-w-prose space-y-4 leading-relaxed museum-muted list-disc pl-5">{(['helpAudio', 'helpReading', 'helpHeadphones', 'helpOffline'] as const).map((key) => <li key={key}>{x(key, language)}</li>)}</ul>
  </details>;
}
