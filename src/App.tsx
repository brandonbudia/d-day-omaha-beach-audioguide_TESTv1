import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { PersistentPlayerBar } from './components/PersistentPlayerBar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { WelcomePage } from './pages/WelcomePage';
import { ParcoursPage } from './pages/ParcoursPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { audioPlayer, getResumablePlayback } from './audio/audioStore';
import { useAudioSelector } from './audio/useAudioSelector';
import { formatTime } from './audio/formatTime';
import { LANGUAGES, t } from './i18n/translations';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { STOPS } from './data/stops';
import { useVisitorState } from './visit/useVisitorState';
import { visitorStore } from './visit/visitorStore';
import { OfflineManager } from './components/OfflineManager';
import { experienceText as x } from './i18n/experienceLabels';
import { PracticalHelp } from './components/PracticalHelp';

const PlayerPage = React.lazy(() => import('./pages/PlayerPage').then((module) => ({ default: module.PlayerPage })));

class PlayerLoadBoundary extends React.Component<{children: React.ReactNode; fallback: React.ReactNode}> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
const hasActiveAudio = (state = audioPlayer.getState()) => state.isPlaying || state.isBuffering;

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('accueil');
  const [selectedStopId, setSelectedStopId] = useState('01');
  const focusRoute = `${activeTab}:${selectedStopId}`;
  const lastFocusRoute = useRef(focusRoute);
  const [homeRevision, setHomeRevision] = useState(0);
  const language = useAudioSelector((state) => state.language);
  const audioStopId = useAudioSelector((state) => state.currentStopId);
  const visit = useVisitorState();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const isOnline = useOnlineStatus();
  const installation = usePWAInstall();
  const updateWaiting = usePWAUpdate();

  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    if (lastFocusRoute.current === focusRoute) return;
    lastFocusRoute.current = focusRoute;
    document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true });
  }, [focusRoute]);

  useEffect(() => {
    const handleLocationChange = () => {
      const url = new URL(window.location.href);
      const lang = url.searchParams.get('hl');
      if (LANGUAGES.some((item) => item.code === lang)) audioPlayer.setLanguage(lang as typeof language);
      const match = url.pathname.match(/^\/stop\/(\d{2})\/?$/);
      if (match && STOPS.some((stop) => stop.id === match[1])) {
        setSelectedStopId(match[1]);
        setActiveTab('arret');
      } else if (/^\/(player|lecteur)\/?$/.test(url.pathname)) {
        const requested = url.searchParams.get('stop');
        const current = audioPlayer.getState();
        if (requested && STOPS.some((stop) => stop.id === requested) && requested !== current.currentStopId && !hasActiveAudio(current)) audioPlayer.setStop(requested, false);
        setActiveTab('lecteur');
      } else if (/^\/parcours\/?$/.test(url.pathname)) setActiveTab('parcours');
      else setActiveTab('accueil');
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // The player URL follows its actual track. Browsing a piece never follows audio changes.
  useEffect(() => {
    if (activeTab !== 'lecteur') return;
    const expected = `/player?stop=${audioStopId}&hl=${language}`;
    if (`${location.pathname}${location.search}` !== expected) history.replaceState(null, '', expected);
  }, [activeTab, audioStopId, language]);

  useEffect(() => {
    const header = document.querySelector('header');
    const navigation = document.querySelector('.museum-bottom-nav');
    const mini = document.querySelector('.museum-mini-player');
    const measure = () => {
      const style = document.documentElement.style;
      style.setProperty('--museum-header-height', `${header?.getBoundingClientRect().height ?? 81}px`);
      style.setProperty('--museum-nav-height', `${navigation?.getBoundingClientRect().height ?? 81}px`);
      style.setProperty('--museum-mini-player-height', `${mini?.getBoundingClientRect().height ?? 0}px`);
    };
    const observer = new ResizeObserver(measure);
    for (const element of [header, navigation, mini]) if (element) observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [activeTab]);

  const go = (tab: ActiveTab, id = selectedStopId) => {
    if (tab === 'arret') setSelectedStopId(id);
    setActiveTab(tab);
    const state = audioPlayer.getState();
    const path = tab === 'accueil' ? '/' : tab === 'parcours' ? '/parcours' : tab === 'arret' ? `/stop/${id}?hl=${state.language}` : `/player?stop=${state.currentStopId}&hl=${state.language}`;
    if (`${location.pathname}${location.search}` !== path) history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const goHome = () => {
    if (activeTab !== 'accueil') { go('accueil'); return; }
    audioPlayer.flushCheckpoint();
    const refreshHome = () => {
      setHomeRevision((value) => value + 1);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    if (hasActiveAudio()) { refreshHome(); return; }
    const locationBeforeWrite = window.location.href;
    void visitorStore.whenPersisted().then((persisted) => {
      if (window.location.href !== locationBeforeWrite) return;
      // Keep a live audio element and any visit changes that could not be persisted.
      if (persisted && !hasActiveAudio()) window.location.reload();
      else refreshHome();
    });
  };

  const resumablePlayback = getResumablePlayback(visit.lastPlayback);
  const resume = () => {
    if (hasActiveAudio()) { go('lecteur'); return; }
    if (resumablePlayback && audioPlayer.restoreLastPlayback()) {
      go('lecteur');
      void audioPlayer.play(); // Only this explicit visitor action starts playback.
    } else if (visit.lastConsultedId) go('arret', visit.lastConsultedId);
  };
  const resumeLabel = resumablePlayback
    ? x('resumeAudio', language, { number: resumablePlayback.id, time: formatTime(resumablePlayback.positionSeconds) })
    : visit.lastConsultedId ? x('resumePiece', language, { number: visit.lastConsultedId }) : undefined;
  const titles = { accueil: t('nav_home', language), parcours: t('nav_tour', language), arret: `${t('nav_stop', language)} ${selectedStopId}`, lecteur: `${t('nav_player', language)} ${audioStopId}` };

  return (
    <div className="museum-app min-h-screen flex flex-col">
      <a className="museum-skip-link" href="#main-content" onClick={(event) => {
        const main = document.getElementById('main-content');
        if (!main) return;
        event.preventDefault();
        main.focus();
      }}>{x('skipToContent', language)}</a>
      <Header title={titles[activeTab]} installation={installation} onGoHome={goHome} onOpenInstallGuide={() => setIsInstallModalOpen(true)} />
      <main id="main-content" tabIndex={-1} aria-label={titles[activeTab]} className="app-main flex-1 relative w-full px-4 max-w-3xl mx-auto" style={{ paddingTop: 'calc(var(--museum-header-height, 81px) + 1rem)', paddingBottom: 'calc(var(--museum-nav-height, 81px) + var(--museum-mini-player-height, 0px) + 1.5rem)' }}>
        <div role="status">{updateWaiting && <p className="offline-notice">{x('pwaUpdateWaiting', language)}</p>}</div>
        {activeTab === 'accueil' && <div className="space-y-5">
          <WelcomePage key={homeRevision} onStartTour={() => go('parcours')} currentLang={language} onLanguageChange={(lang) => {
            audioPlayer.setLanguage(lang);
            const url = new URL(location.href);
            if (url.searchParams.has('hl')) { url.searchParams.set('hl', lang); history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`); }
          }} onResumeVisit={resumeLabel ? resume : undefined} resumeLabel={resumeLabel} />
          <OfflineManager language={language} />
          <PracticalHelp language={language} />
        </div>}
        {activeTab === 'parcours' && <ParcoursPage onSelectStopDetail={(id) => go('arret', id)} onOpenPlayer={() => go('lecteur')} currentLang={language} />}
        {activeTab === 'arret' && <StopDetailPage stopId={selectedStopId} onNavigateStop={(id) => go('arret', id)} onOpenPlayer={() => go('lecteur')} currentLang={language} />}
        {activeTab === 'lecteur' && <PlayerLoadBoundary fallback={
          <section className="museum-card p-5">
            <p role="alert">{x('playerLoadFailed', language)}</p>
            <button type="button" className="museum-button-secondary mt-3" onClick={() => go('arret', audioStopId)}>
              {x('resumePiece', language, { number: audioStopId })}
            </button>
          </section>
        }>
          <React.Suspense fallback={<p role="status" aria-busy="true">{t('nav_player', language)}…</p>}>
            <PlayerPage onSelectStopDetail={(id) => go('arret', id)} currentLang={language} />
          </React.Suspense>
        </PlayerLoadBoundary>}
      </main>
      {activeTab !== 'lecteur' && <PersistentPlayerBar onOpenFullPlayer={() => go('lecteur')} />}
      <BottomNav currentTab={activeTab} onSelectTab={(tab) => go(tab)} />
      <PWAInstallPrompt installation={installation} isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      {!isOnline && <div className="museum-network-status" role="status">{x('networkOffline', language)}</div>}
    </div>
  );
}
