import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { PersistentPlayerBar } from './components/PersistentPlayerBar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { WelcomePage } from './pages/WelcomePage';
import { ParcoursPage } from './pages/ParcoursPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { PlayerPage } from './pages/PlayerPage';
import { audioPlayer, AudioState } from './audio/audioStore';
import { SupportedLanguage, t } from './i18n/translations';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { STOPS } from './data/stops';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('accueil');
  const [selectedStopId, setSelectedStopId] = useState<string>('01');
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Subscribe to audio player state
  useEffect(() => {
    return audioPlayer.subscribe((next) => {
      setAudioState(next);
      if (next.currentStopId) {
        setSelectedStopId(next.currentStopId);
      }
    });
  }, []);

  // Parse path on load & handle browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setActiveTab('accueil');
      } else if (path.startsWith('/parcours')) {
        setActiveTab('parcours');
      } else if (path.startsWith('/stop/')) {
        const id = path.replace('/stop/', '').replace(/\/$/, '');
        if (id) {
          setSelectedStopId(id);
          setActiveTab('arret');
        }
      } else if (path.startsWith('/player') || path.startsWith('/lecteur')) {
        setActiveTab('lecteur');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update URL history when switching tabs
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    let newPath = '/';
    if (tab === 'parcours') newPath = '/parcours';
    if (tab === 'arret') newPath = `/stop/${selectedStopId}`;
    if (tab === 'lecteur') newPath = '/player';

    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStopDetail = (stopId: string) => {
    setSelectedStopId(stopId);
    setActiveTab('arret');
    const newPath = `/stop/${stopId}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentStop = STOPS.find((s) => s.id === selectedStopId) || STOPS[0];

  // Dynamic header titles according to design
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'accueil':
        return t('nav_home', audioState.language);
      case 'parcours':
        return t('nav_tour', audioState.language);
      case 'arret':
        return t('nav_stop', audioState.language);
      case 'lecteur':
        return t('nav_player', audioState.language);
      default:
        return 'Normandie 1944';
    }
  };

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] flex flex-col grain-overlay">
      {/* Top Header */}
      <Header
        title={getHeaderTitle()}
        onOpenInstallGuide={() => setIsInstallModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 flex flex-col relative w-full pt-24 pb-16 px-4 max-w-md mx-auto">
        {activeTab === 'accueil' && (
          <WelcomePage
            onStartTour={() => handleSelectTab('parcours')}
            currentLang={audioState.language}
            onLanguageChange={(lang) => audioPlayer.setLanguage(lang)}
          />
        )}

        {activeTab === 'parcours' && (
          <ParcoursPage
            onSelectStopDetail={handleSelectStopDetail}
            onOpenPlayer={() => handleSelectTab('lecteur')}
            currentLang={audioState.language}
          />
        )}

        {activeTab === 'arret' && (
          <StopDetailPage
            stopId={selectedStopId}
            onNavigateStop={(id) => handleSelectStopDetail(id)}
            onOpenPlayer={() => handleSelectTab('lecteur')}
            currentLang={audioState.language}
          />
        )}

        {activeTab === 'lecteur' && (
          <PlayerPage
            onSelectStopDetail={handleSelectStopDetail}
            currentLang={audioState.language}
          />
        )}
      </main>

      {/* Persistent Docked Audio Player (Visible on all pages EXCEPT the full player itself) */}
      {activeTab !== 'lecteur' && (
        <PersistentPlayerBar onOpenFullPlayer={() => handleSelectTab('lecteur')} />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* PWA Install Guidance Modal */}
      <PWAInstallPrompt
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-lg bg-[#4a3728] border border-[#d4af37] px-3.5 py-2 text-xs font-semibold text-[#ffe088] shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse" />
          <span>{t('offline_badge', audioState.language)}</span>
        </div>
      )}
    </div>
  );
}
