import React from 'react';
import { ArrowRight, Clock3, Headphones, Landmark, RotateCcw, VolumeX } from 'lucide-react';
import { t, SupportedLanguage } from '../i18n/translations';
import { visualLabel } from '../i18n/visualLabels';
import { LanguageSelector } from '../components/LanguageSelector';
import { BrandLogo } from '../components/BrandLogo';

interface WelcomePageProps {
  onStartTour: () => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onResumeVisit?: () => void;
  resumeLabel?: string;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartTour, currentLang, onLanguageChange, onResumeVisit, resumeLabel,
}) => (
  <div className="museum-welcome">
    <section className="museum-welcome-hero" aria-labelledby="welcome-title">
      <div className="museum-welcome-photos" aria-hidden="true">
        <img src="/images/stop-18.webp" alt="" className="museum-welcome-main-photo" width="800" height="450" fetchPriority="high" />
        <img src="/images/stop-19.webp" alt="" className="museum-welcome-detail-photo" width="800" height="450" />
      </div>
      <div className="museum-welcome-intro">
        <BrandLogo className="museum-welcome-brand" />
        <p className="museum-eyebrow">{visualLabel(currentLang, 'audioGuide')}</p>
        <h2 id="welcome-title">{t('app_title', currentLang)}</h2>
        <p className="museum-welcome-description">{visualLabel(currentLang, 'atYourPace')}</p>
        <p className="museum-welcome-subtitle">{t('app_subtitle', currentLang)}</p>
        <p className="museum-welcome-collection">{t('living_archive', currentLang)}</p>
      </div>
    </section>

    {onResumeVisit && (
      <button type="button" className="museum-resume-card museum-card" onClick={onResumeVisit}>
        <RotateCcw size={23} aria-hidden="true" />
        <span><strong>{visualLabel(currentLang, 'resume')}</strong>{resumeLabel && <small>{resumeLabel}</small>}</span>
        <ArrowRight size={21} aria-hidden="true" />
      </button>
    )}

    <LanguageSelector currentLang={currentLang} onLanguageChange={onLanguageChange} />

    <button onClick={onStartTour} className="museum-button museum-start-visit" type="button">
      <Headphones size={23} aria-hidden="true" />
      <span>{t('start_visit', currentLang)}</span>
      <ArrowRight size={21} aria-hidden="true" />
    </button>

    <section className="museum-visit-info museum-card" aria-label={visualLabel(currentLang, 'visitInfo')}>
      <div><Clock3 size={22} aria-hidden="true" /><span><small>{t('estimated_duration', currentLang)}</small><strong>{t('duration_val', currentLang)}</strong></span></div>
      <div><Landmark size={22} aria-hidden="true" /><span><strong>{t('stations_count', currentLang)}</strong><small>{t('route_name', currentLang)}</small></span></div>
    </section>

    <div className="museum-quiet-notice">
      <VolumeX size={21} aria-hidden="true" />
      <p>{t('solemn_notice', currentLang)}</p>
    </div>
  </div>
);
