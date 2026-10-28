import React from 'react';
import { StopData } from '../data/stops';
import { t } from '../i18n/translations';
import { audioPlayer } from '../audio/audioStore';

interface StopCardProps {
  stop: StopData;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (stopId: string) => void;
  onSelectDetail: (stopId: string) => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  isActive,
  isPlaying,
  onPlay,
  onSelectDetail,
}) => {
  const currentLang = audioPlayer.getState().language;

  if (isActive) {
    return (
      <div className="relative flex items-start gap-4 mb-8">
        {/* Golden Active Node with Pulsing Beacon */}
        <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-xl">
          <span className="absolute inset-0 rounded-full bg-[#f2ca50] animate-ping opacity-30" />
          <span className="text-[19px] font-bold font-heading">{stop.number}</span>
        </div>

        {/* Highlighted Active Card with Brass Tint Elevation */}
        <div className="flex-1 min-w-0 bg-[#262a31] border border-[#d4af37]/50 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          {/* Subtle Top Brass Accent Band */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#f2ca50]" />

          <div className="flex items-center justify-between gap-2 mb-2 pt-1">
            <span className="px-2 py-0.5 rounded bg-[#f2ca50] text-[#3c2f00] text-[11px] uppercase tracking-wider font-bold inline-flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#3c2f00] animate-pulse" />
              {t('status_active', currentLang)}
            </span>
            <span className="text-[11px] text-[#f2ca50] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              {t('remaining_time', currentLang, { time: stop.duration })}
            </span>
          </div>

          <h2
            onClick={() => onSelectDetail(stop.id)}
            className="text-[20px] font-bold text-[#dfe2eb] mb-2 font-heading leading-tight cursor-pointer hover:text-[#f2ca50] transition-colors"
          >
            {stop.title}
          </h2>

          {/* Tactical Image Frame */}
          <div
            onClick={() => onSelectDetail(stop.id)}
            className="w-full h-40 sm:h-44 rounded-xl overflow-hidden my-3 relative cursor-pointer group border border-[#4d4635]/50"
          >
            <img
              src={stop.imageUrl}
              alt={stop.title}
              className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/85 via-transparent to-transparent flex items-end p-2">
              <span className="text-[11px] text-[#dfe2eb] bg-[#0a0e14]/80 backdrop-blur-sm px-2 py-0.5 rounded font-medium">
                {stop.spotTag}
              </span>
            </div>
          </div>

          <p className="text-[14px] text-[#d0c5af] mb-4 leading-relaxed">
            {stop.detailDescription}
          </p>

          {/* Primary Giant Audio Action Button */}
          <button
            onClick={() => onPlay(stop.id)}
            className="w-full min-h-[56px] py-2 px-4 rounded-lg bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center gap-2 text-[15px] font-bold shadow-lg transition-transform active:scale-95 hover:brightness-105"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>
              {isPlaying
                ? t('pause', currentLang)
                : t('listen_step', currentLang, { duration: stop.duration })}
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (stop.status === 'completed') {
    return (
      <div className="relative flex items-start gap-4 mb-6 group">
        <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#434b18] text-[#b1bb7c] flex items-center justify-center shadow-md border border-[#c3cc8c]/30">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <div
          onClick={() => onSelectDetail(stop.id)}
          className="flex-1 min-w-0 bg-[#181c22] hover:bg-[#1c2026] border border-[#262a31] rounded-2xl p-4 transition-all active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-[#c3cc8c] font-bold">
              {t('status_completed', currentLang)} • {stop.duration}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(stop.id);
              }}
              aria-label={t('replay', currentLang)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#d0c5af] hover:text-[#f2ca50] hover:bg-[#262a31] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">replay</span>
            </button>
          </div>
          <h2 className="text-[17px] font-bold text-[#dfe2eb] truncate font-heading group-hover:text-[#f2ca50] transition-colors">
            {stop.title}
          </h2>
          <p className="text-[13px] text-[#d0c5af] mt-1 line-clamp-2">
            {stop.subtitle}
          </p>
        </div>
      </div>
    );
  }

  // Upcoming
  return (
    <div className="relative flex items-start gap-4 mb-6 opacity-75">
      <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#262a31] text-[#d0c5af] flex items-center justify-center border border-[#31353c]">
        <span className="text-[17px] font-bold font-heading">{stop.number}</span>
      </div>

      <div
        onClick={() => onSelectDetail(stop.id)}
        className="flex-1 min-w-0 bg-[#181c22] hover:bg-[#1c2026] border border-[#262a31] rounded-2xl p-4 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[#d0c5af] uppercase tracking-wider font-semibold">
            {t('status_upcoming', currentLang)} • {stop.duration}
          </span>
          <span className="material-symbols-outlined text-[#99907c] text-[18px]">lock</span>
        </div>
        <h2 className="text-[17px] font-bold text-[#dfe2eb] truncate font-heading">
          {stop.title}
        </h2>
        <p className="text-[13px] text-[#99907c] mt-1 line-clamp-2">
          {stop.subtitle}
        </p>
      </div>
    </div>
  );
};
