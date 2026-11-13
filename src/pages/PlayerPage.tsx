import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, FileText, Pause, Play, RotateCcw, RotateCw, Settings2, X } from 'lucide-react';
import { audioPlayer, AudioState } from '../audio/audioStore';
import { STOPS } from '../data/stops';
import { LANGUAGES, t, SupportedLanguage } from '../i18n/translations';
import { Scrubber } from '../components/Scrubber';
import { SyncedTranscript } from '../components/SyncedTranscript';
import { resolveTranscript } from '../data/transcripts';
import { TranscriptNotice } from '../components/TranscriptNotice';
import { useReadingPreferences } from '../hooks/useReadingPreferences';
import { getMediaResource } from '../data/mediaCatalog';
import { experienceText as x } from '../i18n/experienceLabels';
import { getStopLabel } from '../data/stopLabels';

interface PlayerPageProps {
  onSelectStopDetail: (stopId: string) => void;
  currentLang: SupportedLanguage;
}

export const PlayerPage: React.FC<PlayerPageProps> = ({ onSelectStopDetail, currentLang }) => {
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);
  const [transcriptTextSize, setTranscriptTextSize] = useState(() => {
    try { const size = Number(localStorage.getItem('dday-transcript-text-size')); return size >= 16 && size <= 30 ? size : 20; }
    catch { return 20; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { preferences, toggle } = useReadingPreferences();
  const [shellHeights, setShellHeights] = useState({ header: 81, navigation: 81 });
  const settingsRef = useRef<HTMLDialogElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const stationHeadingId = React.useId();

  useEffect(() => audioPlayer.subscribe(setAudioState), []);
  useEffect(() => { try { localStorage.setItem('dday-transcript-text-size', String(transcriptTextSize)); } catch { /* Reading remains available without storage. */ } }, [transcriptTextSize]);

  // Include wrapped accessibility controls and safe-area insets in the available space.
  useEffect(() => {
    const header = document.querySelector('header');
    const navigation = document.querySelector('.museum-bottom-nav');
    const measure = () => setShellHeights({
      header: header?.getBoundingClientRect().bottom ?? 81,
      navigation: navigation?.getBoundingClientRect().height ?? 81,
    });
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    if (navigation) observer.observe(navigation);
    measure();
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    if (audioState.isPlaying) setIsTranscriptOpen(true);
  }, [audioState.isPlaying, audioState.currentStopId]);

  useEffect(() => {
    const dialog = settingsRef.current;
    if (settingsOpen && dialog && !dialog.open) dialog.showModal();
    if (!settingsOpen && dialog?.open) dialog.close();
  }, [settingsOpen]);

  const currentStop = STOPS.find((stop) => stop.id === audioState.currentStopId) ?? STOPS[0];
  const title = getStopLabel(currentStop, currentLang, 'playerTitle');
  const imageTitle = getStopLabel(currentStop, currentLang);
  const currentIndex = STOPS.findIndex((stop) => stop.id === currentStop.id);
  const nextStop = STOPS[currentIndex + 1];
  const nextTitle = nextStop ? getStopLabel(nextStop, currentLang) : null;
  const resource = getMediaResource(currentStop.id, audioState.language);
  const transcript = useMemo(() => resolveTranscript(currentStop.id, audioState.language, resource), [currentStop.id, audioState.language, resource]);
  const followsPhrases = transcript.mode === 'phrase-synchronized';
  const showsFollowingHelp = followsPhrases || audioState.language === 'fr' || audioState.language === 'en';
  const colorAssistanceHint = followsPhrases ? 'reading_phrase_color_assistance_hint'
    : showsFollowingHelp ? 'reading_color_assistance_hint' : null;
  const selectTime = (seconds: number) => {
    audioPlayer.seek(seconds);
    if (!audioState.isPlaying) void audioPlayer.play();
  };

  return (
    <div className="player-page" data-reduced-motion={preferences.reducedMotion} style={{
      '--player-header-height': `${shellHeights.header}px`,
      '--player-navigation-height': `${shellHeights.navigation}px`,
    } as React.CSSProperties}>
      <section className="player-station" aria-labelledby={stationHeadingId}>
        <img className="player-cover" src={currentStop.imageUrl} alt={imageTitle.text} lang={imageTitle.language} />
        <div className="player-station-copy">
          <p className="player-eyebrow">{t('station_badge', currentLang, { num: currentStop.number, total: STOPS.length })} · {LANGUAGES.find((lang) => lang.code === audioState.language)?.short}</p>
          <h2 id={stationHeadingId} lang={title.language}>{title.text}</h2>
          {resource.reason === 'synthetic-narration'
            ? <p className="player-speakers">{x('syntheticNarration', currentLang)}</p>
            : <p lang="fr" className="player-speakers">{currentStop.speakers}</p>}
          <button type="button" className="player-detail-link" onClick={() => onSelectStopDetail(currentStop.id)}>
            <BookOpen size={16} aria-hidden="true" /> {t('tab_narrative', currentLang)}
          </button>
        </div>
        <button ref={settingsButtonRef} type="button" className="player-icon-button player-settings-button" onClick={() => setSettingsOpen(true)} aria-label={t('reading_settings_label', currentLang)}>
          <Settings2 size={22} aria-hidden="true" />
        </button>
      </section>

      <section className="player-reading" aria-label={t('text_transcript', currentLang)}>
        <div className="player-reading-toolbar">
          <button type="button" className="player-view-toggle" aria-expanded={isTranscriptOpen} aria-controls="player-transcript" onClick={() => setIsTranscriptOpen((open) => !open)}>
            <FileText size={18} aria-hidden="true" /> {t('tab_transcript', currentLang)}
            <span aria-hidden="true">{isTranscriptOpen ? '−' : '+'}</span>
          </button>
          <button type="button" className="player-speed-button" onClick={() => audioPlayer.cyclePlaybackRate()} aria-label={t('reading_speed_current', currentLang, { speed: audioState.playbackRate })}>
            <span>{t('speed', currentLang)}</span><strong>{audioState.playbackRate}×</strong>
          </button>
          <div className="player-text-size" role="group" aria-label={t('reading_text_size', currentLang)}>
            <button type="button" className="player-icon-button" disabled={transcriptTextSize <= 16} onClick={() => setTranscriptTextSize((size) => Math.max(16, size - 2))} aria-label={t('reading_text_decrease', currentLang)}>A−</button>
            <button type="button" className="player-icon-button" disabled={transcriptTextSize >= 30} onClick={() => setTranscriptTextSize((size) => Math.min(30, size + 2))} aria-label={t('reading_text_increase', currentLang)}>A+</button>
          </div>
        </div>
        <div id="player-transcript" className="player-transcript-content" data-wide-spacing={preferences.wideSpacing} data-color-assistance={preferences.colorAssistance} data-dyslexic-font={preferences.dyslexicFont} hidden={!isTranscriptOpen}>
          {resource.status !== 'ready' && <p className="player-resource-notice" role="note">{x(resource.status === 'unavailable' ? 'unavailable' : 'unverified', currentLang)}</p>}
          {resource.status === 'ready' && <TranscriptNotice transcript={transcript} language={currentLang} compact />}
          {transcript.mode === 'synchronized' || followsPhrases ? (
            <SyncedTranscript
              key={`${currentStop.id}-${audioState.language}`}
              segments={transcript.segments}
              untimedPhrases={transcript.untimedPhrases}
              language={transcript.contentLanguage ?? audioState.language}
              uiLanguage={currentLang}
              phraseOnly={followsPhrases}
              currentTime={audioState.currentTime}
              textSize={transcriptTextSize}
              isPlaying={audioState.isPlaying}
              reducedMotion={preferences.reducedMotion}
              onSelectPhrase={selectTime}
            />
          ) : (
            <div className="player-static-transcript" tabIndex={0} style={{ fontSize: `${transcriptTextSize}px` }}>
              {transcript.mode === 'french-fallback' && <p className="player-eyebrow" lang={currentLang}>{x('frenchReference', currentLang)}</p>}
              <div lang={transcript.contentLanguage ?? 'fr'}>{transcript.mode !== 'missing' ? <>
                {transcript.paragraphs.map((paragraph, index) => <p key={`s-${index}`}>{paragraph}</p>)}
                {!transcript.paragraphs.length && transcript.referenceOnlyParagraphs.map((paragraph, index) => <p key={`r-${index}`}>{paragraph}</p>)}
              </> : currentStop.transcript.map((item, index) => <p key={index}>{item.text}</p>)}</div>
            </div>
          )}
        </div>
        {!isTranscriptOpen && <div className="player-resting-cover"><img src={currentStop.imageUrl} alt="" /><p lang="fr">{currentStop.witnessBadge}</p><button type="button" className="player-secondary-button" onClick={() => setIsTranscriptOpen(true)}>{t('text_transcript', currentLang)}</button></div>}
      </section>

      <section className="player-transport" aria-label={x('audioControls', currentLang)}>
        {audioState.error && resource.status !== 'unavailable' && <p role="alert" className="player-error">{t('audio_error', currentLang)}</p>}
        <Scrubber currentTime={audioState.currentTime} duration={resource.status === 'unavailable' ? 0 : audioState.duration} language={currentLang} onSeek={(seconds) => audioPlayer.seek(seconds)} />
        <div className="player-transport-buttons">
          <button type="button" className="player-track-button" onClick={() => audioPlayer.prevStop()} disabled={currentIndex === 0} aria-label={t('btn_prev', currentLang)}><ChevronLeft size={26} aria-hidden="true" /><span>{t('btn_prev', currentLang)}</span></button>
          <button type="button" className="player-skip-button" disabled={resource.status === 'unavailable'} onClick={() => audioPlayer.rewind(15)} aria-label={t('rewind_15', currentLang)}><RotateCcw size={21} aria-hidden="true" /><span>15 s</span></button>
          <button type="button" className="player-play-button" disabled={resource.status === 'unavailable'} onClick={() => audioPlayer.togglePlayPause()} aria-label={audioState.isPlaying ? t('pause', currentLang) : t('play', currentLang)}>
            {audioState.isPlaying ? <Pause size={27} fill="currentColor" aria-hidden="true" /> : <Play size={27} fill="currentColor" aria-hidden="true" />}
            <span>{audioState.isPlaying ? ({ fr: 'Pause', en: 'Pause', de: 'Pause', it: 'Pausa', pl: 'Pauza', nl: 'Pauze', es: 'Pausa' }[currentLang]) : ({ fr: 'Écouter', en: 'Play', de: 'Start', it: 'Ascolta', pl: 'Odtwórz', nl: 'Afspelen', es: 'Escuchar' }[currentLang])}</span>
          </button>
          <button type="button" className="player-skip-button" disabled={resource.status === 'unavailable'} onClick={() => audioPlayer.forward(15)} aria-label={t('forward_15', currentLang)}><RotateCw size={21} aria-hidden="true" /><span>15 s</span></button>
          <button type="button" className="player-track-button" onClick={() => audioPlayer.nextStop()} aria-label={t('btn_next', currentLang)}><ChevronRight size={26} aria-hidden="true" /><span>{t('btn_next', currentLang)}</span></button>
        </div>
      </section>

      <dialog ref={settingsRef} className="player-settings" aria-labelledby="player-settings-title" onClose={() => { setSettingsOpen(false); settingsButtonRef.current?.focus(); }} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setSettingsOpen(false);
      }}>
        <div className="player-settings-heading"><h2 id="player-settings-title">{t('reading_settings', currentLang)}</h2><button type="button" className="player-icon-button" onClick={() => setSettingsOpen(false)} aria-label={t('close_reading_settings', currentLang)}><X size={22} aria-hidden="true" /></button></div>
        {showsFollowingHelp && <aside className="player-reading-help" aria-label={t('reading_help_title', currentLang)}>
          <h3>{t('reading_help_title', currentLang)}</h3>
          <ul>
            <li>{t(followsPhrases ? 'reading_help_phrase_color' : 'reading_help_color', currentLang)}</li>
            <li>{t(followsPhrases ? 'reading_help_phrase_tap' : 'reading_help_tap', currentLang)}</li>
            <li>{t('reading_help_scroll', currentLang)}</li>
          </ul>
        </aside>}
        <div className="player-setting-row"><span>{t('reading_spacing', currentLang)}</span><button type="button" className="player-secondary-button" aria-pressed={preferences.wideSpacing} onClick={() => toggle('wideSpacing')}>{t(preferences.wideSpacing ? 'reading_spacing_wide' : 'reading_spacing_normal', currentLang)}</button></div>
        {([
          ['colorAssistance', 'reading_color_assistance', colorAssistanceHint],
          ['dyslexicFont', 'reading_dyslexic_font', 'reading_dyslexic_hint'],
          ['reducedMotion', 'reading_reduce_motion', null],
        ] as const).map(([key, label, hint]) => <label className="player-setting-row player-reading-option" key={key}>
          <span><strong>{t(label, currentLang)}</strong>{hint && <small>{t(hint, currentLang)}</small>}</span>
          <input type="checkbox" checked={preferences[key]} onChange={() => toggle(key)} />
        </label>)}
        <div className="player-setting-row"><span>{t('voice_boost', currentLang)}</span><button type="button" className="player-secondary-button" aria-pressed={audioState.isVoiceBoostActive} onClick={() => audioPlayer.toggleVoiceBoost()}>{t(audioState.isVoiceBoostActive ? 'reading_on' : 'reading_off', currentLang)}</button></div>
        <details className="player-text-info"><summary>{t('archive_note_title', currentLang)}</summary><p>{t('archive_note_body', currentLang)}</p><TranscriptNotice transcript={transcript} language={currentLang} /></details>
        {nextStop && nextTitle && <button type="button" className="player-next-detail" onClick={() => onSelectStopDetail(nextStop.id)}>{t('next_stop_distance', currentLang)}<strong lang={nextTitle.language}>{nextTitle.text}</strong><ChevronRight size={20} aria-hidden="true" /></button>}
      </dialog>
    </div>
  );
};
