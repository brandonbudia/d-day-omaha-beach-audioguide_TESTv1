import React from 'react';
import { Check, Languages } from 'lucide-react';
import { LANGUAGES, SupportedLanguage } from '../i18n/translations';
import { visualLabel } from '../i18n/visualLabels';
import { experienceText as x } from '../i18n/experienceLabels';
import { getLanguageResourceSummary } from '../data/mediaCatalog';

interface LanguageSelectorProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang, onLanguageChange }) => {
  const summary = getLanguageResourceSummary(currentLang);
  const audioLanguages = LANGUAGES.filter((lang) => getLanguageResourceSummary(lang.code).ready > 0).map((lang) => lang.short).join(' · ');
  return (
  <section className="museum-language-selector museum-card" aria-labelledby="language-selector-title">
    <h3 id="language-selector-title"><Languages size={20} aria-hidden="true" />{visualLabel(currentLang, 'interfaceLanguage')}</h3>
    <div className="museum-language-grid">
      {LANGUAGES.map((lang) => (
        <button key={lang.code} onClick={() => onLanguageChange(lang.code)} className="museum-language-button" type="button" aria-label={lang.name} aria-pressed={lang.code === currentLang} aria-describedby={lang.code === currentLang ? 'language-audio-status' : undefined} lang={lang.code}>
          <span className="museum-language-flag" aria-hidden="true">{lang.flag}</span>
          <span>{lang.short}</span>
          {lang.code === currentLang && <Check size={14} className="museum-language-check" aria-hidden="true" />}
        </button>
      ))}
    </div>
    <p className="museum-language-name" lang={currentLang}>{LANGUAGES.find((lang) => lang.code === currentLang)?.name}</p>
    <p className="museum-language-audio" id="language-audio-status" role="status">
      <span>{x('audioLanguages', currentLang, { languages: audioLanguages })}</span>
      <span>{summary.ready > 0 ? x('audioCount', currentLang, { count: summary.ready, total: summary.total }) : x(summary.unverified > 0 ? 'unverified' : 'interfaceOnly', currentLang)}</span>
    </p>
  </section>
  );
};
