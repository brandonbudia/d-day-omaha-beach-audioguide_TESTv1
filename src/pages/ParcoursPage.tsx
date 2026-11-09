import React, { useState } from 'react';
import { Search, Bookmark, Landmark } from 'lucide-react';
import { STOPS, type StopData } from '../data/stops';
import { StopCard } from '../components/StopCard';
import { t, type SupportedLanguage } from '../i18n/translations';
import { experienceText as x } from '../i18n/experienceLabels';
import { audioPlayer } from '../audio/audioStore';
import { useAudioSelector } from '../audio/useAudioSelector';
import { useVisitorState } from '../visit/useVisitorState';
import { isDiscovered } from '../visit/visitorStore';
import { getMediaResource } from '../data/mediaCatalog';

interface ParcoursPageProps {
  onSelectStopDetail: (stopId: string) => void;
  onOpenPlayer: () => void;
  currentLang: SupportedLanguage;
}

/** Search inherited labels without requiring the visitor to type their accents. */
export function matchesStopSearch(stop: StopData, query: string, language: SupportedLanguage) {
  const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase(language);
  const needle = normalize(query.trim());
  const text = normalize(`${stop.id} ${stop.number} ${stop.title} ${stop.shortTitle} ${stop.sector} ${stop.spotTag}`);
  return !needle || text.includes(needle);
}

export function ParcoursPage({ onSelectStopDetail, onOpenPlayer, currentLang }: ParcoursPageProps) {
  const [filter, setFilter] = useState<'all' | 'remaining' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const visit = useVisitorState();
  const audioId = useAudioSelector((state) => state.currentStopId);
  const playing = useAudioSelector((state) => state.isPlaying);
  const total = STOPS.length;
  const count = STOPS.filter((stop) => isDiscovered(visit.pieces[stop.id])).length;
  const percent = Math.round(count / total * 100);
  const progressLabel = x('progress', currentLang, { count, total, percent });
  const sectors = Array.from(new Set(STOPS.map((stop) => stop.sector).filter(Boolean)));
  const filteredStops = STOPS.filter((stop) => {
    const status = filter === 'remaining' ? !isDiscovered(visit.pieces[stop.id]) : filter === 'favorites' ? Boolean(visit.pieces[stop.id]?.favorite) : true;
    return status && matchesStopSearch(stop, searchQuery, currentLang) && (sectorFilter === 'all' || stop.sector === sectorFilter);
  });
  const play = (id: string) => {
    if (audioId === id && playing) { audioPlayer.pause(); return; }
    const available = getMediaResource(id, currentLang).status !== 'unavailable';
    if (audioId !== id) audioPlayer.setStop(id, available);
    else if (available) void audioPlayer.play();
    onOpenPlayer();
  };
  return <div className="w-full">
    <section className="museum-card p-5 mb-6" aria-label={progressLabel}>
      <p className="text-xl font-bold font-heading mb-3">{progressLabel}</p>
      <div className="h-2 w-full rounded-full overflow-hidden bg-[var(--museum-line)]" role="progressbar" aria-label={x('discovered', currentLang)} aria-valuemin={0} aria-valuemax={total} aria-valuenow={count} aria-valuetext={progressLabel}><div className="h-full bg-[var(--museum-action)]" style={{width: `${percent}%`}} /></div>
      <p className="museum-muted text-sm leading-relaxed mt-3">{x('progressHelp', currentLang)}</p>
      {visit.legacyConsultedIds.length > 0 && <p className="museum-muted text-sm mt-2">{x('legacy', currentLang)}</p>}
      {visit.persistence !== 'local' && <p role="status" className="text-sm mt-2">{x('storage', currentLang)}</p>}
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <label className="relative"><span className="sr-only">{t('search_stations', currentLang)}</span><Search size={19} aria-hidden="true" className="absolute left-3 top-4 museum-muted" /><input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('search_stations', currentLang)} className="w-full min-h-12 rounded-lg border border-[var(--museum-line)] pl-10 pr-3 bg-[var(--museum-bg)]" /></label>
        <label><span className="sr-only">{t('all_sectors', currentLang)}</span><select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="w-full min-h-12 rounded-lg border border-[var(--museum-line)] px-3 bg-[var(--museum-bg)]"><option value="all">{t('all_sectors', currentLang)}</option>{sectors.map((sector) => <option key={sector} lang="fr">{sector}</option>)}</select></label>
      </div>
      <div className="tour-filters grid gap-2 mt-3" aria-label={t('filter_all', currentLang, {count: total})}>
        {(['all', 'remaining', 'favorites'] as const).map((value) => <button key={value} type="button" aria-pressed={filter === value} className={`${filter === value ? 'museum-button' : 'museum-button-secondary'} px-2 text-sm`} onClick={() => setFilter(value)}>{value === 'favorites' && <Bookmark size={16} aria-hidden="true" />}{t(value === 'all' ? 'filter_all' : value === 'remaining' ? 'filter_remaining' : 'filter_favorites', currentLang, { count: value === 'all' ? total : total - count })}</button>)}
      </div>
    </section>
    <p className="sr-only" role="status">{filteredStops.length} / {total}</p>
    {filteredStops.length === 0 && <section className="museum-card p-6 text-center"><p className="font-bold">{t('no_stations_found', currentLang)}</p><p className="museum-muted my-3">{t('adjust_search_filters', currentLang)}</p><button className="museum-button-secondary px-4" onClick={() => {setFilter('all'); setSearchQuery(''); setSectorFilter('all');}}>{t('reset_filters', currentLang)}</button></section>}
    {filteredStops.map((stop) => <StopCard key={stop.id} stop={stop} isActive={audioId === stop.id} isPlaying={audioId === stop.id && playing} currentLang={currentLang} onPlay={play} onSelectDetail={onSelectStopDetail} />)}
    <aside className="museum-card p-5 text-center mt-6"><Landmark size={24} aria-hidden="true" className="mx-auto mb-2" /><p className="font-semibold">{t('additional_steps_title', currentLang)}</p><p className="museum-muted text-sm mt-2">{t('additional_steps_desc', currentLang)}</p></aside>
  </div>;
}


