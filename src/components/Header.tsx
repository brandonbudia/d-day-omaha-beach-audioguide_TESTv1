import React from 'react';
import { Contrast, Download, Moon, Sun, Type, UserRound } from 'lucide-react';
import { t } from '../i18n/translations';
import { visualLabel } from '../i18n/visualLabels';
import { audioPlayer } from '../audio/audioStore';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  title: string;
  onOpenSettings?: () => void;
  onOpenInstallGuide?: () => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenInstallGuide, onGoHome, onOpenProfile }) => {
  const [isHighContrast, setIsHighContrast] = React.useState(() => document.documentElement.classList.contains('high-contrast') || document.documentElement.classList.contains('sun-mode'));
  const [isLightMode, setIsLightMode] = React.useState(() => {
    try {
      const savedTheme = window.localStorage.getItem('dday-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme === 'light';
    } catch {
      // Keep the document theme when storage is unavailable.
    }
    return document.documentElement.classList.contains('light-mode');
  });
  const [isLargeText, setIsLargeText] = React.useState(() => document.documentElement.classList.contains('large-text'));
  const { isInstallable, isIOS, install } = usePWAInstall();
  const currentLang = audioPlayer.getState().language;

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    document.documentElement.classList.toggle('high-contrast', next);
    document.documentElement.classList.toggle('sun-mode', next);
  };

  React.useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLightMode);
    document.body.classList.toggle('light-mode', isLightMode);
    document.documentElement.dataset.theme = isLightMode ? 'light' : 'dark';
    document.body.dataset.theme = isLightMode ? 'light' : 'dark';
  }, [isLightMode]);

  const toggleTheme = () => {
    const next = !isLightMode;
    setIsLightMode(next);
    try { window.localStorage.setItem('dday-theme', next ? 'light' : 'dark'); } catch {
      // Theme changes remain available for this session.
    }
  };

  const toggleFontSize = () => {
    const next = !isLargeText;
    setIsLargeText(next);
    document.documentElement.classList.toggle('large-text', next);
  };

  return (
    <header className="museum-header fixed top-0 inset-x-0 z-50 pt-safe">
      <div className="museum-header-inner">
        <a
          className="museum-home-link"
          href="/"
          aria-label={visualLabel(currentLang, 'home')}
          onClick={(event) => {
            if (onGoHome && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
              event.preventDefault();
              onGoHome();
            }
          }}
        >
          <BrandLogo wordmark />
        </a>
        <h1 className="museum-header-title">{title}</h1>
        <div className="museum-header-controls">
          <button type="button" onClick={toggleTheme} className="museum-icon-button" aria-label={t(isLightMode ? 'theme_switch_to_dark' : 'theme_switch_to_light', currentLang)} title={t(isLightMode ? 'theme_switch_to_dark' : 'theme_switch_to_light', currentLang)} aria-pressed={isLightMode}>
            {isLightMode ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}
          </button>
          <button type="button" onClick={toggleContrast} className="museum-icon-button" aria-label={t('contrast_mode', currentLang)} title={t('contrast_mode', currentLang)} aria-pressed={isHighContrast}>
            <Contrast size={21} aria-hidden="true" />
          </button>
          <button type="button" onClick={toggleFontSize} className="museum-icon-button" aria-label={t('font_size', currentLang)} title={t('font_size', currentLang)} aria-pressed={isLargeText}>
            <Type size={21} aria-hidden="true" />
          </button>
          {(isInstallable || isIOS) ? (
            <button type="button" className="museum-icon-button museum-install-button" title={t('pwa_install_btn', currentLang)} aria-label={t('pwa_install_btn', currentLang)} onClick={() => {
              if (isInstallable) void install();
              else onOpenInstallGuide?.();
            }}>
              <Download size={21} aria-hidden="true" />
            </button>
          ) : onOpenProfile ? (
            <button type="button" className="museum-icon-button" aria-label={visualLabel(currentLang, 'profile')} onClick={onOpenProfile}>
              <UserRound size={21} aria-hidden="true" />
            </button>
          ) : (
            <span className="museum-profile-symbol" role="img" aria-label={visualLabel(currentLang, 'profile')}><UserRound size={20} aria-hidden="true" /></span>
          )}
        </div>
      </div>
    </header>
  );
};
