import React from 'react';
import { Bookmark, Pause, Play, FileText, Check } from 'lucide-react';
import type { StopData } from '../data/stops';
import { t, type SupportedLanguage } from '../i18n/translations';
import { experienceText as x } from '../i18n/experienceLabels';
import { getMediaResource } from '../data/mediaCatalog';
import { formatTime } from '../audio/formatTime';
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
  const status = hasListened(piece) ? x('listened', currentLang) : isDiscovered(piece) ? x('discovered', currentLang) : isConsulted(piece) ? x('consulted', currentLang) : '';
  return <article className="museum-card overflow-hidden mb-4" data-playing={isPlaying} data-selected={isActive}>
    <a href={`/stop/${stop.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px]" onClick={(event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onSelectDetail(stop.id);
    }}>
      <div className="flex gap-4 p-4">
        <img src={stop.imageUrl} alt={stop.title} lang="fr" loading="lazy" decoding="async" width="96" height="104" className="w-24 h-28 sm:w-32 sm:h-32 rounded-xl object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="museum-eyebrow mb-1">{t('nav_stop', currentLang)} {stop.number}{media.status !== 'unavailable' && ` · ${formatTime(media.durationSeconds)}`}</p>
          <h2 lang="fr" className="font-heading font-bold text-lg leading-snug">{stop.title}</h2>
          <p lang="fr" className="museum-muted text-sm mt-2 line-clamp-2">{stop.subtitle}</p>
          {status && <p className="mt-2 text-sm font-semibold flex items-center gap-1">{isDiscovered(piece) && <Check size={15} aria-hidden="true" />}{status}</p>}
        </div>
      </div>
    </a>
    <div className="flex gap-3 px-4 pb-4">
      <button type="button" className="museum-button flex-1" onClick={() => onPlay(stop.id)}>
        {media.status === 'unavailable' ? <FileText size={19} aria-hidden="true" /> : isPlaying ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
        {media.status === 'unavailable' ? x('readText', currentLang) : t(isPlaying ? 'pause' : 'play', currentLang)}
      </button>
      <button type="button" aria-pressed={Boolean(piece?.favorite)} aria-label={x(piece?.favorite ? 'removeFavorite' : 'addFavorite', currentLang)} className="museum-button-secondary w-12 shrink-0" onClick={() => visitorStore.toggleFavorite(stop.id)}><Bookmark size={21} fill={piece?.favorite ? 'currentColor' : 'none'} aria-hidden="true" /></button>
    </div>
  </article>;
}
