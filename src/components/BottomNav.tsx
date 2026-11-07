import React from 'react';
import { Headphones, Home, MapPin, Route } from 'lucide-react';
import { t } from '../i18n/translations';
import { visualLabel } from '../i18n/visualLabels';
import { audioPlayer } from '../audio/audioStore';
import { experienceText as x } from '../i18n/experienceLabels';

export type ActiveTab = 'accueil' | 'parcours' | 'arret' | 'lecteur';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const currentLang = audioPlayer.getState().language;
  const tabs = [
    { id: 'accueil', labelKey: 'nav_home', Icon: Home },
    { id: 'parcours', labelKey: 'nav_tour', Icon: Route },
    { id: 'arret', labelKey: 'nav_stop', Icon: MapPin },
    { id: 'lecteur', labelKey: 'nav_player', Icon: Headphones },
  ] as const;

  return (
    <nav aria-label={visualLabel(currentLang, 'navigation')} className="museum-bottom-nav fixed bottom-0 inset-x-0 z-50 pb-safe">
      <div className="museum-bottom-nav-inner">
        {tabs.map(({ id, labelKey, Icon }) => (
          <button key={id} onClick={() => onSelectTab(id)} aria-label={t(labelKey, currentLang)} aria-current={currentTab === id ? 'page' : undefined} className="museum-nav-button" type="button">
            <span className="museum-nav-icon"><Icon size={23} strokeWidth={currentTab === id ? 2.25 : 1.75} aria-hidden="true" /></span>
            <span>{id === 'parcours' ? x('tourShort', currentLang) : t(labelKey, currentLang)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
