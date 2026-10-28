import React, { useState } from 'react';
import { t, SupportedLanguage } from '../i18n/translations';
import { LanguageSelector } from '../components/LanguageSelector';

interface WelcomePageProps {
  onStartTour: () => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartTour,
  currentLang,
  onLanguageChange,
}) => {
  const [isComfortMode, setIsComfortMode] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);

  const toggleComfort = () => {
    const next = !isComfortMode;
    setIsComfortMode(next);
    if (next) {
      document.documentElement.classList.add('sun-mode');
    } else {
      document.documentElement.classList.remove('sun-mode');
    }
  };

  const toggleSize = () => {
    const next = !isLargeText;
    setIsLargeText(next);
    if (next) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-28">
      {/* Zone Outils Visite Musée */}
      <div className="flex items-center justify-between bg-[#181c22] px-3.5 py-2 rounded-lg border border-[#262a31] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f2ca50] text-[18px]">museum</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#d0c5af]">
            {t('museum_status_bar', currentLang)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleComfort}
            aria-label={t('museum_guide_mode', currentLang)}
            className={`px-2.5 py-1 flex items-center gap-1.5 rounded text-[12px] font-semibold transition-all active:scale-95 ${
              isComfortMode
                ? 'bg-[#f2ca50] text-[#3c2f00]'
                : 'bg-[#262a31] text-[#dfe2eb] hover:bg-[#434b18]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#f2ca50]">headphones</span>
            <span>{t('museum_guide_mode', currentLang)}</span>
          </button>
          <button
            onClick={toggleSize}
            aria-label={t('font_size', currentLang)}
            className={`px-2.5 py-1 flex items-center rounded text-[12px] font-bold transition-all active:scale-95 ${
              isLargeText
                ? 'bg-[#c3cc8c] text-[#2d3404]'
                : 'bg-[#262a31] text-[#dfe2eb] hover:bg-[#31353c]'
            }`}
            type="button"
          >
            <span>A+</span>
          </button>
        </div>
      </div>

      {/* Carte Immersive Principale du Musée D-Day Omaha */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#1c2026] border border-[#31353c]/70 ring-1 ring-white/5">
        <div
          className="welcome-hero w-full min-h-[22rem] sm:min-h-[25rem] bg-cover bg-center relative flex flex-col justify-between p-5 sm:p-6"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAz93dU9rQXhvncqbOs2yExY4TtNNFPwCEfQTuq4m02S7wjh5hFnaMRBVsdKqOFltjtR1k8mbr1i6kUbdM0Q3kWhr-qqe0QNrPUYdqMrBigmEvyB54SFZ8gZnz46LUcUgnvz_HQTy28bmm27iF3rMA2PzYUHdi5ASdhu3IMFtVbeIqtxQIMrckc-9oDnbcyRk5C0tpO2cE-kBJlmdVgnCBfd8XdPXJ3_fYRScflwKvzolxab4cUxkebyw')`,
          }}
        >
          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#10141a] via-[#10141a]/70 to-[#10141a]/20 pointer-events-none" />

          {/* Badges d'accueil musée */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0e14]/90 backdrop-blur-md border border-[#4d4635]/60 shadow-md">
              <span className="material-symbols-outlined text-[#f2ca50] text-[16px]">local_hospital</span>
              <span className="text-[11px] font-semibold text-[#dfe2eb] tracking-wider uppercase">
                {t('memorial_sector', currentLang)}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-[#434b18]/90 backdrop-blur-md border border-[#c3cc8c]/40">
              <span className="text-[11px] font-bold text-[#dfe8a6] uppercase tracking-widest">
                {t('h_hour', currentLang)}
              </span>
            </div>
          </div>

          {/* Titrage Historique Solennel du Musée */}
          <div className="relative z-10 flex flex-col gap-1 mt-auto">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 bg-[#f2ca50]" />
              <span className="text-[11px] uppercase tracking-widest text-[#f2ca50] font-bold">
                {t('living_archive', currentLang)}
              </span>
            </div>
            <h2 className="text-[clamp(1.8rem,8vw,2.35rem)] font-extrabold text-[#dfe2eb] tracking-tight leading-[1.05] drop-shadow-md font-heading max-w-[18ch]">
              {t('app_title', currentLang)}
            </h2>
            <p className="text-[15px] sm:text-base text-[#d0c5af] tracking-normal font-normal leading-relaxed max-w-[34ch]">
              {t('app_subtitle', currentLang)}
            </p>
          </div>
        </div>

        {/* Sélecteur de Langue Tactile Horizontal */}
        <LanguageSelector
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
        />
      </div>

      {/* Bouton d'Action Principal XXL */}
      <button
        onClick={onStartTour}
        className="w-full min-h-16 rounded-2xl bg-[#f2ca50] text-[#3c2f00] text-[15px] uppercase tracking-wider font-bold flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:brightness-105 hover:shadow-xl transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2ca50]"
        type="button"
      >
        <div className="w-10 h-10 rounded-full bg-[#3c2f00] text-[#f2ca50] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[24px]">headphones</span>
        </div>
        <span>{t('start_visit', currentLang)}</span>
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>

      {/* Bannière Informations Pratiques du Musée */}
      <div className="bg-[#181c22] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-[#262a31] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#dfe2eb]">
            <span className="material-symbols-outlined text-[#f2ca50] text-[20px]">timer</span>
            <span className="text-[13px] font-semibold">{t('estimated_duration', currentLang)}</span>
          </div>
          <span className="text-[13px] font-bold text-[#dfe2eb]">{t('duration_val', currentLang)}</span>
        </div>
        <div className="w-full h-1 bg-[#262a31] rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-[#f2ca50]" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="flex items-center gap-2 bg-[#1c2026] px-3 py-2.5 rounded-lg border border-[#31353c]/50">
            <span className="material-symbols-outlined text-[#c3cc8c] text-[20px]">museum</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] text-[#dfe2eb] font-bold">{t('stations_count', currentLang)}</span>
              <span className="text-[11px] text-[#d0c5af] truncate">{t('route_name', currentLang)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#1c2026] px-3 py-2.5 rounded-lg border border-[#31353c]/50">
            <span className="material-symbols-outlined text-[#c3cc8c] text-[20px]">offline_pin</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] text-[#dfe2eb] font-bold">{t('offline_ready', currentLang)}</span>
              <span className="text-[11px] text-[#c3cc8c] truncate">{t('audio_synced', currentLang)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Solennelle d'Usage dans le Musée */}
      <div className="flex items-start gap-3 bg-[#434b18]/60 p-3 rounded-lg border border-[#c3cc8c]/25">
        <span className="material-symbols-outlined text-[#dfe8a6] text-[20px] shrink-0 mt-0.5">
          volume_off
        </span>
        <p className="text-[12px] text-[#dfe8a6] leading-relaxed">
          {t('solemn_notice', currentLang)}
        </p>
      </div>
    </div>
  );
};
