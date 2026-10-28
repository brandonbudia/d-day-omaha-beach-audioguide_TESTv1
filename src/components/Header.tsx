import React from 'react';
import { t } from '../i18n/translations';
import { audioPlayer } from '../audio/audioStore';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  title: string;
  onOpenSettings?: () => void;
  onOpenInstallGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenInstallGuide }) => {
  const [isLightMode, setIsLightMode] = React.useState(
    () => document.documentElement.classList.contains('light-mode')
  );
  const [isLargeText, setIsLargeText] = React.useState(
    () => document.documentElement.classList.contains('large-text')
  );
  const { isInstallable, isIOS, install } = usePWAInstall();

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains('light-mode');
    document.documentElement.classList.toggle('light-mode', next);
    setIsLightMode(next);
  };

  const toggleFontSize = () => {
    const next = !document.documentElement.classList.contains('large-text');
    document.documentElement.classList.toggle('large-text', next);
    setIsLargeText(next);
  };

  const currentLang = audioPlayer.getState().language;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#10141a]/90 backdrop-blur-2xl pt-safe border-b border-[#262a31]/70 shadow-md">
      <div className="h-[4.5rem] px-4 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#262a31] text-[#dfe2eb] border border-[#d4af37]/30 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[#f2ca50] text-[18px]">museum</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f2ca50]">
              {t('museum_badge', currentLang)}
            </span>
          </div>
          <h1 className="text-[19px] font-bold text-[#dfe2eb] tracking-tight truncate font-heading">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={toggleTheme}
            aria-label={isLightMode ? 'Activer le thème sombre' : 'Activer le thème clair'}
            aria-pressed={isLightMode}
            title={isLightMode ? 'Thème clair activé' : 'Passer au thème clair'}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              isLightMode
                ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-md'
                : 'bg-[#262a31] border-[#31353c] text-[#d0c5af] hover:text-[#f2ca50] hover:border-[#d4af37]/60'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[21px]">
              {isLightMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={toggleFontSize}
            aria-label={t('font_size', currentLang)}
            aria-pressed={isLargeText}
            title={isLargeText ? 'Taille de texte agrandie' : 'Agrandir le texte'}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              isLargeText
                ? 'bg-[#c3cc8c] text-[#10141a] border-[#c3cc8c] shadow-md'
                : 'bg-[#262a31] border-[#31353c] text-[#d0c5af] hover:text-[#f2ca50] hover:border-[#d4af37]/60'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[21px]">format_size</span>
          </button>

          {(isInstallable || isIOS) ? (
            <button
              onClick={() => {
                if (isInstallable) install();
                else if (onOpenInstallGuide) onOpenInstallGuide();
              }}
              title={t('pwa_install_btn', currentLang)}
              aria-label={t('pwa_install_btn', currentLang)}
              className="w-10 h-10 rounded-2xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center ml-0.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                download_for_offline
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
