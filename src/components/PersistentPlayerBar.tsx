import React from 'react';
import { LoaderCircle, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { audioPlayer, AudioState } from '../audio/audioStore';
import { STOPS } from '../data/stops';
import { t } from '../i18n/translations';
import { visualLabel } from '../i18n/visualLabels';
import { getMediaResource } from '../data/mediaCatalog';
import { experienceText as x } from '../i18n/experienceLabels';
import { getStopLabel } from '../data/stopLabels';

interface PersistentPlayerBarProps {
  onOpenFullPlayer: () => void;
}

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  return `${Math.floor(safeSeconds / 60).toString().padStart(2, '0')}:${Math.floor(safeSeconds % 60).toString().padStart(2, '0')}`;
};

export const PersistentPlayerBar: React.FC<PersistentPlayerBarProps> = ({ onOpenFullPlayer }) => {
  const [state, setState] = React.useState<AudioState>(audioPlayer.getState());
  const openLabelId = React.useId();
  const titleId = React.useId();
  const speedId = React.useId();
  React.useEffect(() => audioPlayer.subscribe(setState), []);
  const currentStop = STOPS.find((stop) => stop.id === state.currentStopId) || STOPS[0];
  const title = getStopLabel(currentStop, state.language);
  const unavailable = getMediaResource(currentStop.id, state.language).status === 'unavailable';
  const duration = !unavailable && Number.isFinite(state.duration) ? Math.max(0, state.duration) : 0;
  const progress = duration > 0 ? Math.max(0, Math.min(100, state.currentTime / duration * 100)) : 0;
  const showSpeed = !unavailable && state.playbackRate !== 1;

  return (
    <aside aria-label={visualLabel(state.language, 'persistentPlayer')} className="museum-mini-player fixed inset-x-0 z-40">
      {state.error && !unavailable && <p role="alert" className="museum-mini-player-error">{state.errorReason === 'network' ? t('audio_error', state.language) : x('playbackRetry', state.language)}</p>}
      {state.isBuffering && <p role="status" className="sr-only">{x('audioLoading', state.language)}</p>}
      <div className="museum-mini-player-inner">
        {duration > 0 && <input
          type="range"
          className="museum-mini-player-range"
          min={0}
          max={duration}
          step={0.1}
          value={Math.min(duration, Math.max(0, state.currentTime))}
          onChange={(event) => audioPlayer.seek(Number(event.currentTarget.value))}
          onKeyDown={(event) => {
            const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 0;
            if (direction) {
              event.preventDefault();
              audioPlayer.seek(Math.max(0, Math.min(duration, state.currentTime + direction * 5)));
            }
          }}
          style={{ '--audio-progress': `${progress}%` } as React.CSSProperties}
          aria-label={visualLabel(state.language, 'audioProgress')}
          aria-valuetext={`${formatTime(state.currentTime)} ${visualLabel(state.language, 'audioTime')} ${formatTime(duration)}`}
        />}
        <div className="museum-mini-player-row">
          <button type="button" className="museum-mini-player-open" onClick={onOpenFullPlayer} aria-labelledby={`${openLabelId} ${titleId}`} aria-describedby={showSpeed ? speedId : undefined}>
            <span id={openLabelId} className="sr-only" lang={state.language}>{visualLabel(state.language, 'openPlayer')}</span>
            <img src={currentStop.imageUrl} alt="" width="44" height="44" />
            <span className="museum-mini-player-copy">
              <span className="museum-mini-player-meta">
                {t('nav_stop', state.language)} {currentStop.number}
                <span>{unavailable ? x('readText', state.language) : `${formatTime(state.currentTime)} / ${formatTime(duration)}`}</span>
                {showSpeed && <span className="museum-mini-player-speed"><span id={speedId} className="sr-only">{t('reading_speed_current', state.language, { speed: state.playbackRate })}</span><span aria-hidden="true">{state.playbackRate}×</span></span>}
              </span>
            <strong id={titleId} lang={title.language} title={title.text}>{title.text}</strong>
            </span>
          </button>
          <div className="museum-mini-player-controls">
            <button type="button" onClick={() => audioPlayer.prevStop()} aria-label={currentStop.id === STOPS[0].id ? x('backToAudioStart', state.language) : visualLabel(state.language, 'previous')} className="museum-icon-button"><SkipBack size={21} aria-hidden="true" /></button>
            <button type="button" disabled={unavailable} onClick={() => {
              audioPlayer.togglePlayPause();
              if (!state.isPlaying && !state.isBuffering) onOpenFullPlayer();
            }} aria-label={t(state.isPlaying || state.isBuffering ? 'pause' : 'play', state.language)} className="museum-mini-player-play">
              {state.isBuffering ? <LoaderCircle size={23} aria-hidden="true" /> : state.isPlaying ? <Pause size={23} fill="currentColor" aria-hidden="true" /> : <Play size={23} fill="currentColor" aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => audioPlayer.nextStop()} aria-label={visualLabel(state.language, 'next')} className="museum-icon-button"><SkipForward size={21} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </aside>
  );
};
