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
  const [isHighContrast, setIsHighContrast] = React.useState(() => document.documentElement.classList.contains('high-contrast'));
  const [isLightMode, setIsLightMode] = React.useState(() => {
    try {
      const savedTheme = window.localStorage.getItem('dday-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme === 'light';
    } catch {
      // Continue using the current document class when storage is unavailable.
    }
    return document.documentElement.classList.contains('light-mode');
  });
  const [isLargeText, setIsLargeText] = React.useState(() => document.documentElement.classList.contains('large-text'));
  const { isInstallable, isIOS, install } = usePWAInstall();

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const applyTheme = (light: boolean) => {
    // Keep the theme class on both the document root and body so all global
    // styles and components respond consistently.
    document.documentElement.classList.toggle('light-mode', light);
    document.body.classList.toggle('light-mode', light);
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    document.body.dataset.theme = light ? 'light' : 'dark';
  };

  const toggleTheme = () => {
    const next = !isLightMode;
    applyTheme(next);
    setIsLightMode(next);
    try {
      window.localStorage.setItem('dday-theme', next ? 'light' : 'dark');
    } catch {
      // The theme still works for this session if storage is unavailable.
    }
  };

  React.useEffect(() => {
    applyTheme(isLightMode);
  }, [isLightMode]);

  const toggleFontSize = () => {
    const next = !isLargeText;
    setIsLargeText(next);
    if (next) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  };

  const currentLang = audioPlayer.getState().language;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#10141a]/95 backdrop-blur-xl pt-safe border-b border-[#262a31]/60">
      <div className="h-20 px-4 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#262a31] text-[#dfe2eb] border border-[#d4af37]/30 shadow-sm">
            <span className="material-symbols-outlined text-[#f2ca50] text-[18px]">museum</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f2ca50]">
              {t('museum_badge', currentLang)}
            </span>
          </div>
          <h1 className="text-[19px] font-bold text-[#dfe2eb] tracking-tight truncate max-w-[150px] font-heading">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Light / dark theme: added without removing the existing contrast, text-size or profile/install controls. */}
          <button
            onClick={toggleTheme}
            aria-label={t(isLightMode ? 'theme_switch_to_dark' : 'theme_switch_to_light', currentLang)}
            aria-pressed={isLightMode}
            title={t(isLightMode ? 'theme_switch_to_dark' : 'theme_switch_to_light', currentLang)}
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

          {/* Contrast mode */}
          <button
            onClick={toggleContrast}
            aria-label={t('contrast_mode', currentLang)}
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors active:scale-95 ${
              isHighContrast ? 'bg-[#f2ca50] text-[#10141a]' : 'text-[#d0c5af] hover:text-[#dfe2eb] hover:bg-[#262a31]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">contrast</span>
          </button>

          {/* Enlarge text */}
          <button
            onClick={toggleFontSize}
            aria-label={t('font_size', currentLang)}
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors active:scale-95 ${
              isLargeText ? 'bg-[#c3cc8c] text-[#10141a]' : 'text-[#d0c5af] hover:text-[#dfe2eb] hover:bg-[#262a31]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">format_size</span>
          </button>

          {/* PWA Install Trigger / Guide */}
          {(isInstallable || isIOS) ? (
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else if (onOpenInstallGuide) {
                  onOpenInstallGuide();
                }
              }}
              title={t('pwa_install_btn', currentLang)}
              aria-label={t('pwa_install_btn', currentLang)}
              className="w-10 h-10 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center ml-1 shadow-md hover:brightness-110 active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                download_for_offline
              </span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f2ca50] flex items-center justify-center ml-1 shadow-sm">
              <span className="material-symbols-outlined text-[#3c2f00] text-[18px]">person</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
