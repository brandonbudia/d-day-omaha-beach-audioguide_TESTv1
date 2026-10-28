import React, { useState } from 'react';
import { STOPS, StopData } from '../data/stops';
import { StopCard } from '../components/StopCard';
import { t, SupportedLanguage } from '../i18n/translations';
import { audioPlayer, AudioState } from '../audio/audioStore';

interface ParcoursPageProps {
  onSelectStopDetail: (stopId: string) => void;
  onOpenPlayer: () => void;
  currentLang: SupportedLanguage;
}

export const ParcoursPage: React.FC<ParcoursPageProps> = ({
  onSelectStopDetail,
  onOpenPlayer,
  currentLang,
}) => {
  const [filter, setFilter] = useState<'all' | 'remaining' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [visitedStopIds, setVisitedStopIds] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem('dday_visited_stops') || '[]');
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());

  React.useEffect(() => {
    return audioPlayer.subscribe((next) => setAudioState(next));
  }, []);

  React.useEffect(() => {
    const refreshVisited = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem('dday_visited_stops') || '[]');
        setVisitedStopIds(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []);
      } catch {
        setVisitedStopIds([]);
      }
    };
    window.addEventListener('dday-visited-stops-updated', refreshVisited);
    return () => window.removeEventListener('dday-visited-stops-updated', refreshVisited);
  }, []);

  const totalCount = STOPS.length; // 22 stops
  const completedCount = STOPS.filter((s) => s.status === 'completed').length;
  const remainingCount = totalCount - completedCount;
  const visitedCount = visitedStopIds.filter((id) => STOPS.some((stop) => stop.id === id)).length;
  const progressPercent = Math.round((visitedCount / totalCount) * 100);

  const sectors = Array.from(new Set(STOPS.map((stop) => stop.sector).filter(Boolean)));
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase(currentLang);
  const filteredStops = STOPS.filter((stop) => {
    const matchesStatus = filter === 'remaining'
      ? stop.status !== 'completed'
      : filter === 'favorites' ? stop.isFavorite : true;
    const searchableText = `${stop.id} ${stop.number} ${stop.title} ${stop.shortTitle} ${stop.sector} ${stop.spotTag}`.toLocaleLowerCase(currentLang);
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesSector = sectorFilter === 'all' || stop.sector === sectorFilter;
    return matchesStatus && matchesQuery && matchesSector;
  });

  const handlePlayStop = (stopId: string) => {
    if (audioState.currentStopId === stopId && audioState.isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.setStop(stopId, true);
    }
  };

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Progress Overview Card */}
      <div className="w-full bg-[#1c2026] border border-[#31353c]/60 rounded-xl p-4 shadow-md mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#f2ca50] text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              museum
            </span>
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#dfe2eb]">
              {t('circuit_progress', currentLang)}
            </span>
          </div>
          <span className="text-[14px] text-[#f2ca50] font-bold">{progressPercent}%</span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[20px] font-bold text-[#dfe2eb] font-heading">
            {visitedCount} <span className="text-[14px] text-[#d0c5af] font-normal">/ {totalCount}</span>
          </span>
          <span className="text-[11px] text-[#d0c5af] uppercase tracking-wider font-semibold">
            {t('sector_omaha', currentLang)}
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-2 rounded-full bg-[#262a31] overflow-hidden mb-3 border border-[#31353c]"
          role="progressbar"
          aria-label={t('circuit_progress', currentLang)}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={visitedCount}
        >
          <div
            className="h-full bg-[#f2ca50] rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Search and sector filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <label className="relative block">
            <span className="sr-only">{t('search_stations', currentLang)}</span>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#99907c] text-[20px] pointer-events-none">search</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('search_stations', currentLang)}
              className="w-full min-h-11 rounded-xl bg-[#181c22] border border-[#31353c] pl-10 pr-3 text-sm text-[#dfe2eb] placeholder:text-[#99907c] outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] focus-visible:border-[#f2ca50]"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t('all_sectors', currentLang)}</span>
            <select
              value={sectorFilter}
              onChange={(event) => setSectorFilter(event.target.value)}
              className="w-full min-h-11 rounded-xl bg-[#181c22] border border-[#31353c] px-3 text-sm text-[#dfe2eb] outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50] focus-visible:border-[#f2ca50]"
            >
              <option value="all">{t('all_sectors', currentLang)}</option>
              {sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
            </select>
          </label>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0a0e14] p-1 rounded-lg border border-[#262a31]">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 min-h-[44px] flex items-center justify-center rounded-md font-semibold text-[13px] transition-all active:scale-95 ${
              filter === 'all'
                ? 'bg-[#262a31] text-[#f2ca50] shadow-sm border border-[#d4af37]/30'
                : 'text-[#d0c5af] hover:text-[#dfe2eb]'
            }`}
            type="button"
          >
            {t('filter_all', currentLang, { count: totalCount })}
          </button>
          <button
            onClick={() => setFilter('remaining')}
            className={`flex-1 min-h-[44px] flex items-center justify-center rounded-md font-semibold text-[13px] transition-all active:scale-95 ${
              filter === 'remaining'
                ? 'bg-[#262a31] text-[#f2ca50] shadow-sm border border-[#d4af37]/30'
                : 'text-[#d0c5af] hover:text-[#dfe2eb]'
            }`}
            type="button"
          >
            {t('filter_remaining', currentLang, { count: remainingCount })}
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex-1 min-h-[44px] flex items-center justify-center rounded-md font-semibold text-[13px] transition-all active:scale-95 ${
              filter === 'favorites'
                ? 'bg-[#262a31] text-[#f2ca50] shadow-sm border border-[#d4af37]/30'
                : 'text-[#d0c5af] hover:text-[#dfe2eb]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">bookmark</span>
            {t('filter_favorites', currentLang)}
          </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative w-full" aria-live="polite">
        {filteredStops.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#99907c]/50 bg-[#1c2026]/60 px-5 py-8 text-center">
            <span className="material-symbols-outlined text-3xl text-[#c3cc8c]">search_off</span>
            <p className="mt-2 text-sm font-semibold text-[#dfe2eb]">{t('no_stations_found', currentLang)}</p>
            <p className="mt-1 text-xs text-[#d0c5af]">{t('adjust_search_filters', currentLang)}</p>
            <button type="button" onClick={() => { setSearchQuery(''); setSectorFilter('all'); setFilter('all'); }} className="mt-3 min-h-11 rounded-full border border-[#d4af37]/40 px-4 text-sm font-semibold text-[#f2ca50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2ca50]">{t('reset_filters', currentLang)}</button>
          </div>
        )}
        {/* Continuous Vertical Backbone Guide */}
        <div className="absolute left-[27px] top-4 bottom-8 w-0.5 bg-[#262a31] -z-0" />

        {filteredStops.map((stop) => {
          const isActive = audioState.currentStopId === stop.id;
          const isPlaying = isActive && audioState.isPlaying;

          return (
            <StopCard
              key={stop.id}
              stop={stop}
              isActive={isActive}
              isPlaying={isPlaying}
              onPlay={handlePlayStop}
              onSelectDetail={onSelectStopDetail}
            />
          );
        })}
      </div>

      {/* End of Museum Sequence Footer Note */}
      <div className="w-full mt-6 p-4 rounded-xl bg-[#0a0e14] border border-[#262a31] text-center shadow-md">
        <span className="material-symbols-outlined text-[#f2ca50] text-[28px] mb-1">museum</span>
        <p className="text-[13px] font-bold text-[#dfe2eb] uppercase tracking-wider">
          {t('additional_steps_title', currentLang)}
        </p>
        <p className="text-[12px] text-[#d0c5af] mt-1 leading-relaxed">
          {t('additional_steps_desc', currentLang)}
        </p>
      </div>
    </div>
  );
};
