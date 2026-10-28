import React from 'react';
import { t } from '../i18n/translations';
import { audioPlayer } from '../audio/audioStore';

export type ActiveTab = 'accueil' | 'parcours' | 'arret' | 'lecteur';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const currentLang = audioPlayer.getState().language;

  const tabs: { id: ActiveTab; labelKey: 'nav_home' | 'nav_tour' | 'nav_stop' | 'nav_player'; icon: string }[] = [
    { id: 'accueil', labelKey: 'nav_home', icon: 'military_tech' },
    { id: 'parcours', labelKey: 'nav_tour', icon: 'timeline' },
    { id: 'arret', labelKey: 'nav_stop', icon: 'pin_drop' },
    { id: 'lecteur', labelKey: 'nav_player', icon: 'headphones' },
  ];

  return (
    <nav aria-label="Navigation principale" className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#1c2026]/95 backdrop-blur-xl border-t border-[#31353c]/70">
      <div className="grid grid-cols-4 items-center h-20 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-label={t(tab.labelKey, currentLang)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] h-full transition-colors active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f2ca50] ${
                isActive ? 'text-[#f2ca50]' : 'text-[#d0c5af] hover:text-[#dfe2eb]'
              }`}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className={`text-[11px] font-bold tracking-wider mt-1 ${isActive ? 'text-[#f2ca50]' : 'text-[#d0c5af]'}`}>
                {t(tab.labelKey, currentLang)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
