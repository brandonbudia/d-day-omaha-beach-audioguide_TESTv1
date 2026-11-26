import React from 'react';
import { Bookmark, Pause, Play, FileText, Check } from 'lucide-react';
import type { StopData } from '../data/stops';
import { t, type SupportedLanguage } from '../i18n/translations';
import { experienceText as x } from '../i18n/experienceLabels';
import { getMediaResource } from '../data/mediaCatalog';
import { formatTime } from '../audio/formatTime';
import { getStopLabel } from '../data/stopLabels';
import { useVisitorState } from '../visit/useVisitorState';
import { visitorStore, hasListened, isDiscovered, isConsulted } from '../visit/visitorStore';

interface StopCardProps {
  stop: StopData;
  isActive: boolean;
  isPlaying: boolean;
  currentLang: SupportedLanguage;
  onPlay: (stopId: string) => void;
  onSelectDetail: (stopId: string) => void;
}

export function StopCard({ stop, isActive, isPlaying, currentLang, onPlay, onSelectDetail }: StopCardProps) {
  const state = useVisitorState();
  const piece = state.pieces[stop.id];
  const media = getMediaResource(stop.id, currentLang);
  const title = getStopLabel(stop, currentLang);
  const status = hasListened(piece) ? x('listened', currentLang) : isDiscovered(piece) ? x('discovered', currentLang) : isConsulted(piece) ? x('consulted', currentLang) : '';
  return <article className="visit-station-card" data-playing={isPlaying} data-selected={isActive}>
    <a href={`/stop/${stop.id}?hl=${currentLang}`} className="visit-station-reference" aria-current={isPlaying ? 'true' : undefined} onClick={(event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onSelectDetail(stop.id);
    }}>
      <img src={stop.imageUrl} alt={title.text} lang={title.language} loading="lazy" decoding="async" width="72" height="72" />
      <div className="visit-station-copy">
        <p className="museum-eyebrow visit-station-number">{t('nav_stop', currentLang)} {stop.number}{media.status !== 'unavailable' && ` · ${formatTime(media.durationSeconds)}`}</p>
        <h2 lang={title.language}>{title.text}</h2>
        <p lang="fr" className="museum-muted visit-station-description line-clamp-2">{stop.subtitle}</p>
        {status && <p className="visit-station-status">{isDiscovered(piece) && <Check size={15} aria-hidden="true" />}{status}</p>}
      </div>
    </a>
    <div className="visit-station-actions">
      <button type="button" className="visit-station-play" onClick={() => onPlay(stop.id)}>
        {media.status === 'unavailable' ? <FileText size={19} aria-hidden="true" /> : isPlaying ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
        <span>{media.status === 'unavailable' ? x('readText', currentLang) : t(isPlaying ? 'pause' : 'play', currentLang)}</span>
      </button>
      <button type="button" aria-pressed={Boolean(piece?.favorite)} aria-label={x(piece?.favorite ? 'removeFavorite' : 'addFavorite', currentLang)} className="visit-station-favorite" onClick={() => visitorStore.toggleFavorite(stop.id)}><Bookmark size={21} fill={piece?.favorite ? 'currentColor' : 'none'} aria-hidden="true" /></button>
    </div>
  </article>;
}
