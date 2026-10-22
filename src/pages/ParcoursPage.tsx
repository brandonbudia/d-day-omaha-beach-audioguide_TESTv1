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
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());

  React.useEffect(() => {
    return audioPlayer.subscribe((next) => setAudioState(next));
  }, []);

  const totalCount = STOPS.length; // 22 stops
  const currentStopIndex = STOPS.findIndex((s) => s.id === audioState.currentStopId);
  const currentStepNum = currentStopIndex >= 0 ? currentStopIndex + 1 : 1;
  const completedCount = STOPS.filter((s) => s.status === 'completed').length;
  const remainingCount = totalCount - completedCount;
  const progressPercent = Math.round((currentStepNum / totalCount) * 100);

  const filteredStops = STOPS.filter((stop) => {
    if (filter === 'remaining') {
      return stop.status !== 'completed';
    }
    if (filter === 'favorites') {
      return stop.isFavorite;
    }
    return true;
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
            Pièce {currentStepNum} <span className="text-[14px] text-[#d0c5af] font-normal">/ {totalCount}</span>
          </span>
          <span className="text-[11px] text-[#d0c5af] uppercase tracking-wider font-semibold">
            {t('sector_omaha', currentLang)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#262a31] overflow-hidden mb-3 border border-[#31353c]">
          <div
            className="h-full bg-[#f2ca50] rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
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
      <div className="relative w-full">
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
