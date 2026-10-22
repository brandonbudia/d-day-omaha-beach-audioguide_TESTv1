import React, { useState } from 'react';
import { STOPS, StopData } from '../data/stops';
import { t, SupportedLanguage } from '../i18n/translations';
import { audioPlayer, AudioState } from '../audio/audioStore';

interface StopDetailPageProps {
  stopId: string;
  onNavigateStop: (newId: string) => void;
  onOpenPlayer: () => void;
  currentLang: SupportedLanguage;
}

export const StopDetailPage: React.FC<StopDetailPageProps> = ({
  stopId,
  onNavigateStop,
  onOpenPlayer,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'recit' | 'transcript' | 'photos' | 'carte'>('recit');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());

  React.useEffect(() => {
    return audioPlayer.subscribe((next) => setAudioState(next));
  }, []);

  const stop = STOPS.find((s) => s.id === stopId) || STOPS[0];
  const isCurrentActive = audioState.currentStopId === stop.id;
  const isPlaying = isCurrentActive && audioState.isPlaying;

  const currentIndex = STOPS.findIndex((s) => s.id === stop.id);
  const prevStop = currentIndex > 0 ? STOPS[currentIndex - 1] : null;
  const nextStop = currentIndex < STOPS.length - 1 ? STOPS[currentIndex + 1] : null;

  const progressPercent = isCurrentActive && audioState.duration > 0
    ? (audioState.currentTime / audioState.duration) * 100
    : 0;

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayToggle = () => {
    if (audioState.currentStopId !== stop.id) {
      audioPlayer.setStop(stop.id, true);
    } else {
      audioPlayer.togglePlayPause();
    }
  };

  return (
    <div className="flex flex-col w-full pb-36">
      {/* Archival Visual Header Card */}
      <div className="relative w-full rounded-xl overflow-hidden bg-[#1c2026] shadow-xl border border-[#31353c]/70">
        <div
          className="w-full h-64 bg-cover bg-center filter contrast-110"
          style={{ backgroundImage: `url('${stop.imageUrl}')` }}
        />

        {/* Vignette Scrim & Status Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c2026] via-[#1c2026]/40 to-transparent flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e14]/85 backdrop-blur-md text-[#c3cc8c] text-[11px] font-bold tracking-wider uppercase border border-[#4d4635]/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse" />
              {t('piece_identified', currentLang)}
            </span>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              aria-label={t('save_step', currentLang)}
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-md border border-[#4d4635]/60 ${
                isBookmarked
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'bg-[#181c22]/80 text-[#dfe2eb] hover:text-[#f2ca50]'
              }`}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>

          <div className="flex items-end justify-between pointer-events-auto">
            <span className="px-2.5 py-1 rounded bg-[#434b18] text-[#dfe8a6] text-[11px] font-bold uppercase tracking-widest border border-[#c3cc8c]/30">
              {stop.sector}
            </span>
            <span className="text-[11px] font-medium text-[#d0c5af] flex items-center gap-1 bg-[#0a0e14]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-[#31353c]">
              <span className="material-symbols-outlined text-[16px] text-[#f2ca50]">layers</span>
              {stop.altitude}
            </span>
          </div>
        </div>
      </div>

      {/* Title & Tactical Headline */}
      <div className="mt-5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[#f2ca50] text-[12px] font-bold uppercase tracking-wider">
          <span>{t('station_badge', currentLang, { num: stop.number, total: STOPS.length })}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]" />
          <span className="text-[#d0c5af]">{stop.spotTag}</span>
        </div>
        <h2 className="text-[22px] font-bold text-[#dfe2eb] leading-tight font-heading">
          {stop.title}
        </h2>
        <p className="text-[13px] text-[#d0c5af] leading-relaxed">
          {stop.subtitle}
        </p>
      </div>

      {/* Prominent Field Audio Player */}
      <div className="mt-5 p-4 rounded-xl bg-[#262a31] border border-[#d4af37]/40 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenPlayer}>
            <span className="material-symbols-outlined text-[#f2ca50] text-[22px]">volume_up</span>
            <span className="text-[13px] font-bold text-[#dfe2eb] hover:text-[#f2ca50] transition-colors">
              {t('immersive_guide', currentLang)}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#31353c] text-[#c3cc8c] text-[11px] font-bold uppercase tracking-wider border border-[#4d4635]/50">
            {t('original_voice', currentLang)}
          </span>
        </div>

        {/* Scrubber Timeline */}
        <div className="flex flex-col gap-1.5">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              if (isCurrentActive) {
                audioPlayer.seek(ratio * audioState.duration);
              } else {
                audioPlayer.setStop(stop.id, true);
              }
            }}
            className="relative w-full h-3 bg-[#181c22] rounded-full overflow-hidden flex items-center cursor-pointer border border-[#31353c]"
          >
            <div
              className="h-full bg-[#f2ca50] rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[12px] font-semibold text-[#d0c5af]">
            <span className="tabular-nums text-[#f2ca50]">
              {isCurrentActive ? formatSecs(audioState.currentTime) : '00:00'}
            </span>
            <span className="tabular-nums">
              {stop.duration}
            </span>
          </div>
        </div>

        {/* Player Controls (Ergonomic Touch Targets) */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={() => audioPlayer.rewind(15)}
            aria-label={t('rewind_15', currentLang)}
            className="w-14 h-14 rounded-full bg-[#1c2026] hover:bg-[#31353c] text-[#dfe2eb] flex items-center justify-center transition-all active:scale-95 shadow-md border border-[#31353c]"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">replay_10</span>
          </button>
          <button
            onClick={handlePlayToggle}
            aria-label={isPlaying ? t('pause', currentLang) : t('play', currentLang)}
            className="w-16 h-16 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-xl hover:brightness-105 transition-all active:scale-90 ring-4 ring-[#ffe088]/20"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={() => audioPlayer.forward(15)}
            aria-label={t('forward_15', currentLang)}
            className="w-14 h-14 rounded-full bg-[#1c2026] hover:bg-[#31353c] text-[#dfe2eb] flex items-center justify-center transition-all active:scale-95 shadow-md border border-[#31353c]"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">forward_10</span>
          </button>
        </div>
      </div>

      {/* Tactical Navigation Tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveTab('recit')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'recit'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">history_edu</span>
          {t('tab_narrative', currentLang)}
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'transcript'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">subtitles</span>
          {t('tab_transcript', currentLang)}
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'photos'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">photo_library</span>
          {t('tab_photos', currentLang, { count: stop.photos.length })}
        </button>

        <button
          onClick={() => setActiveTab('carte')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'carte'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">map</span>
          {t('tab_map', currentLang)}
        </button>
      </div>

      {/* Tab Content: Historical Narrative */}
      {activeTab === 'recit' && (
        <div className="mt-4 flex flex-col gap-5">
          {/* Historical & Technical Context Card */}
          <div className="p-4 rounded-xl bg-[#181c22] border border-[#262a31] shadow-md flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#c3cc8c]">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
              <h3 className="text-[17px] font-bold text-[#dfe2eb] font-heading">
                {t('operational_context', currentLang)}
              </h3>
            </div>
            <p className="text-[14px] text-[#d0c5af] leading-relaxed">
              {stop.operationalContext}
            </p>
          </div>

          {/* Eyewitness / Founder Quotes */}
          {stop.quotes.map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#1c2026] border border-[#31353c]/70 flex flex-col gap-2.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  q.type === 'axis' ? 'text-[#f2ca50]' : 'text-[#c3cc8c]'
                }`}>
                  {q.type === 'axis' ? t('quote_axis', currentLang) : t('quote_allies', currentLang)}
                </span>
                <span className="material-symbols-outlined text-[#99907c] text-[20px]">
                  record_voice_over
                </span>
              </div>
              <blockquote className="text-[15px] text-[#dfe2eb] italic leading-snug font-heading">
                {q.quote}
              </blockquote>
              <div className="flex items-center gap-3 pt-1 border-t border-[#262a31]">
                <div className="w-9 h-9 rounded-full bg-[#434b18] text-[#dfe8a6] flex items-center justify-center font-bold text-[13px]">
                  {q.initials}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#dfe2eb]">{q.name}</p>
                  <p className="text-[11px] text-[#d0c5af]">{q.rankAndUnit}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Key Facts Mosaic */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#d0c5af] px-1">
              {t('key_facts', currentLang)}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#262a31] border border-[#31353c] shadow-sm flex flex-col justify-between">
                <span className="material-symbols-outlined text-[#f2ca50] text-[26px]">timer</span>
                <div className="mt-3">
                  <span className="text-[20px] text-[#dfe2eb] font-bold font-heading">
                    {stop.facts.time}
                  </span>
                  <p className="text-[11px] text-[#d0c5af] mt-0.5 leading-snug">
                    {stop.facts.timeLabel}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#262a31] border border-[#31353c] shadow-sm flex flex-col justify-between">
                <span className="material-symbols-outlined text-[#c3cc8c] text-[26px]">verified</span>
                <div className="mt-3">
                  <span className="text-[20px] text-[#dfe2eb] font-bold font-heading">
                    {stop.facts.stat}
                  </span>
                  <p className="text-[11px] text-[#d0c5af] mt-0.5 leading-snug">
                    {stop.facts.statLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Transcription Intégrale de la visite */}
      {activeTab === 'transcript' && (
        <div className="mt-4 p-4 rounded-xl bg-[#1c2026] border border-[#31353c] text-[#d0c5af] flex flex-col gap-3 shadow-md">
          {stop.transcript.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-[#262a31] border border-[#31353c]/50">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-[#f2ca50] uppercase tracking-wider">
                  [{item.timeRange}]
                </span>
                <span className="text-[13px] font-bold text-[#dfe2eb] font-heading">
                  {item.title}
                </span>
              </div>
              <p className="text-[14px] text-[#dfe2eb] leading-relaxed select-text whitespace-pre-line">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Archival Photos */}
      {activeTab === 'photos' && (
        <div className="mt-4 flex flex-col gap-4">
          {stop.photos.map((photo, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden bg-[#1c2026] border border-[#31353c] shadow-md"
            >
              <div
                className="w-full h-48 bg-cover bg-center filter contrast-110"
                style={{ backgroundImage: `url('${photo.url}')` }}
              />
              <div className="p-3">
                <p className="text-[13px] font-bold text-[#dfe2eb] font-heading">
                  {photo.caption}
                </p>
                <p className="text-[11px] text-[#d0c5af] mt-0.5">
                  {photo.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Museum Plan & Instructions */}
      {activeTab === 'carte' && (
        <div className="mt-4 flex flex-col gap-4">
          <div
            className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg border border-[#31353c] bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6fqNmD_maIFqJmkncUGKHEiOIAfggBsccvt7zBxZNQPX_LOOPglwYHlqyDWlYNOkWhxp3P5GJYUVJOhsTL_DKcXMk62EzgHY4i2MGAYl_wZ792gdt_QEXJCpwGMp_D144-rz2d4wheNX1-OHx_WO2CvI6M4OLUcX8AKMqynv4cwi1XcK3OwQcjHvlzWleZmgdeQMu50N21L0ntzZdSAAAmuGgJO1Pm1OpPdDvFnw5TiJL3nqvO0sMlg')`,
            }}
          >
            <div className="absolute inset-0 bg-[#0a0e14]/40 flex items-center justify-center p-4">
              <div className="px-4 py-3 rounded-xl bg-[#1c2026]/95 backdrop-blur-md flex items-center gap-2 text-[#f2ca50] shadow-xl border border-[#d4af37]/40 text-center">
                <span className="material-symbols-outlined text-[24px]">museum</span>
                <span className="text-[13px] font-bold text-[#dfe2eb] font-heading">
                  {stop.title} • {stop.coordinates}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#262a31] border border-[#31353c]">
            <h4 className="text-[11px] font-bold text-[#f2ca50] uppercase tracking-wider">
              {t('tactical_instructions', currentLang)}
            </h4>
            <p className="text-[13px] text-[#dfe2eb] mt-1 leading-relaxed">
              {stop.sector} — {t('tactical_guide_text', currentLang)}
            </p>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (Thumb Friendly >56px Targets) */}
      <div className="fixed bottom-20 inset-x-0 z-40 bg-[#0a0e14]/95 backdrop-blur-xl px-4 py-3 border-t border-[#262a31]">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Previous Station Action */}
          {prevStop ? (
            <button
              onClick={() => onNavigateStop(prevStop.id)}
              aria-label={`Aller à la pièce ${prevStop.number}`}
              className="h-14 px-3 rounded-xl bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md text-left border border-[#31353c]"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px] text-[#f2ca50] shrink-0">arrow_back</span>
              <div className="flex flex-col truncate">
                <span className="text-[10px] uppercase tracking-wider text-[#99907c] font-bold">
                  {t('btn_prev', currentLang)}
                </span>
                <span className="text-[12px] font-bold truncate">
                  {prevStop.number} • {prevStop.shortTitle}
                </span>
              </div>
            </button>
          ) : (
            <div className="h-14" />
          )}

          {/* Next Station Action */}
          {nextStop ? (
            <button
              onClick={() => onNavigateStop(nextStop.id)}
              aria-label={`Aller à la pièce ${nextStop.number}`}
              className="h-14 px-3 rounded-xl bg-[#f2ca50] hover:brightness-105 text-[#3c2f00] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg text-right"
              type="button"
            >
              <div className="flex flex-col truncate">
                <span className="text-[10px] uppercase tracking-wider text-[#554300] font-bold">
                  {t('btn_next', currentLang)}
                </span>
                <span className="text-[12px] font-bold truncate">
                  {nextStop.number} • {nextStop.shortTitle}
                </span>
              </div>
              <span className="material-symbols-outlined text-[22px] shrink-0">arrow_forward</span>
            </button>
          ) : (
            <div className="h-14" />
          )}
        </div>
      </div>
    </div>
  );
};
