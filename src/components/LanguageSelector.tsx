import React from 'react';
import { LANGUAGES, SupportedLanguage, t } from '../i18n/translations';
import { audioPlayer } from '../audio/audioStore';

interface LanguageSelectorProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  const activeMeta = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="p-4 bg-[#1c2026] rounded-xl border border-[#31353c]/50 flex flex-col gap-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#d0c5af]">
          {t('commentary_language', currentLang)}
        </span>
        <span className="text-[12px] font-bold text-[#f2ca50] uppercase tracking-wider">
          {activeMeta.name}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLang;
          return (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                audioPlayer.setLanguage(lang.code);
              }}
              className={`min-w-[58px] h-14 rounded-lg flex flex-col items-center justify-center transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-md ring-2 ring-[#ffe088]'
                  : 'bg-[#262a31] text-[#dfe2eb] hover:bg-[#31353c] border border-[#4d4635]/40'
              }`}
              type="button"
              aria-label={lang.name}
            >
              <span className="text-base leading-none select-none">{lang.flag}</span>
              <span className="text-[11px] font-bold tracking-wider mt-1 leading-none">{lang.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
