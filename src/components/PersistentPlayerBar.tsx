import React from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { audioPlayer, AudioState } from '../audio/audioStore';
import { STOPS } from '../data/stops';
import { t } from '../i18n/translations';
import { visualLabel } from '../i18n/visualLabels';
import { getMediaResource } from '../data/mediaCatalog';
import { experienceText as x } from '../i18n/experienceLabels';

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
  React.useEffect(() => audioPlayer.subscribe(setState), []);
  const currentStop = STOPS.find((stop) => stop.id === state.currentStopId) || STOPS[0];
  const unavailable = getMediaResource(currentStop.id, state.language).status === 'unavailable';
  const duration = !unavailable && Number.isFinite(state.duration) ? Math.max(0, state.duration) : 0;
  const progress = duration > 0 ? Math.max(0, Math.min(100, state.currentTime / duration * 100)) : 0;

  return (
    <aside aria-label={visualLabel(state.language, 'persistentPlayer')} className="museum-mini-player fixed inset-x-0 z-40">
      {state.error && !unavailable && <p role="alert" className="museum-mini-player-error">{t('audio_error', state.language)}</p>}
      <div className="museum-mini-player-inner">
        <input
          type="range"
          className="museum-mini-player-range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(duration, Math.max(0, state.currentTime))}
          disabled={duration <= 0}
          onChange={(event) => audioPlayer.seek(Number(event.currentTarget.value))}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              audioPlayer.seek(Math.max(0, Math.min(duration, state.currentTime + (event.key === 'ArrowRight' ? 5 : -5))));
            }
          }}
          style={{ '--audio-progress': `${progress}%` } as React.CSSProperties}
          aria-label={visualLabel(state.language, 'audioProgress')}
          aria-valuetext={`${formatTime(state.currentTime)} ${visualLabel(state.language, 'audioTime')} ${formatTime(duration)}`}
        />
        <div className="museum-mini-player-row">
          <button type="button" className="museum-mini-player-open" onClick={onOpenFullPlayer} aria-labelledby={`${openLabelId} ${titleId}`}>
            <span id={openLabelId} className="sr-only" lang={state.language}>{visualLabel(state.language, 'openPlayer')}</span>
            <img src={currentStop.imageUrl} alt="" width="44" height="44" />
            <span className="museum-mini-player-copy">
              <span className="museum-mini-player-meta">{t('nav_stop', state.language)} {currentStop.number}<span>{unavailable ? x('readText', state.language) : `${formatTime(state.currentTime)} / ${formatTime(duration)}`}</span></span>
              <strong id={titleId} lang="fr">{currentStop.title}</strong>
            </span>
          </button>
          <div className="museum-mini-player-controls">
            <button type="button" onClick={() => audioPlayer.prevStop()} aria-label={visualLabel(state.language, 'previous')} className="museum-icon-button"><SkipBack size={21} aria-hidden="true" /></button>
            <button type="button" disabled={unavailable} onClick={() => {
              audioPlayer.togglePlayPause();
              if (!state.isPlaying) onOpenFullPlayer();
            }} aria-label={t(state.isPlaying ? 'pause' : 'play', state.language)} className="museum-mini-player-play">
              {state.isPlaying ? <Pause size={23} fill="currentColor" aria-hidden="true" /> : <Play size={23} fill="currentColor" aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => audioPlayer.nextStop()} aria-label={visualLabel(state.language, 'next')} className="museum-icon-button"><SkipForward size={21} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </aside>
  );
};
