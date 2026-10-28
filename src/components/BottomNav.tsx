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
    { id: 'accueil', labelKey: 'nav_home', icon: 'home' },
    { id: 'parcours', labelKey: 'nav_tour', icon: 'route' },
    { id: 'arret', labelKey: 'nav_stop', icon: 'location_on' },
    { id: 'lecteur', labelKey: 'nav_player', icon: 'headphones' },
  ];

  return (
    <nav aria-label="Navigation principale" className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#1c2026]/90 backdrop-blur-2xl border-t border-[#31353c]/70 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]">
      <div className="grid grid-cols-4 items-center min-h-[68px] px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(tab.labelKey, currentLang)}
              className={`group flex flex-col items-center justify-center gap-1 min-w-0 h-[58px] mx-0.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#434b18]/55 text-[#f2ca50] ring-1 ring-[#d4af37]/30 shadow-inner'
                  : 'text-[#d0c5af] hover:bg-[#262a31] hover:text-[#dfe2eb]'
              }`}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[23px] transition-transform duration-200 ${isActive ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide truncate max-w-full px-1 ${isActive ? 'text-[#f2ca50]' : 'text-[#d0c5af]'}`}>
                {t(tab.labelKey, currentLang)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
