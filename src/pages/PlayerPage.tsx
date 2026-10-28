import React, { useState } from 'react';
import { audioPlayer, AudioState } from '../audio/audioStore';
import { STOPS, StopData } from '../data/stops';
import { t, SupportedLanguage } from '../i18n/translations';
import { Waveform } from '../components/Waveform';
import { Scrubber } from '../components/Scrubber';

interface PlayerPageProps {
  onSelectStopDetail: (stopId: string) => void;
  currentLang: SupportedLanguage;
}

export const PlayerPage: React.FC<PlayerPageProps> = ({
  onSelectStopDetail,
  currentLang,
}) => {
  const [audioState, setAudioState] = useState<AudioState>(audioPlayer.getState());
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  React.useEffect(() => {
    return audioPlayer.subscribe((next) => setAudioState(next));
  }, []);

  const currentStop: StopData = STOPS.find((s) => s.id === audioState.currentStopId) || STOPS[0];
  const currentIndex = STOPS.findIndex((s) => s.id === currentStop.id);
  const nextStop = currentIndex < STOPS.length - 1 ? STOPS[currentIndex + 1] : null;

  const progressPercent = audioState.duration > 0
    ? (audioState.currentTime / audioState.duration) * 100
    : 0;

  return (
    <div className="flex flex-col w-full pb-28 space-y-5">
      {/* Indoor Museum Context Banner */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl bg-[#262a31] text-[#dfe2eb] shadow-sm border border-[#31353c]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#c3cc8c]">
            {t('museum_indoor_signal', currentLang)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#d0c5af] text-[11px] font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px] text-[#f2ca50]">museum</span>
          <span>{currentStop.spotTag}</span>
        </div>
      </div>

      {/* Main Player Display Card */}
      <section className="flex flex-col items-center bg-[#1c2026] border border-[#31353c]/70 rounded-2xl p-5 shadow-xl text-center relative overflow-hidden">
        {/* Tactile atmospheric glow */}
        <div className="absolute -top-16 inset-x-0 h-36 bg-gradient-to-b from-[#f2ca50]/10 via-transparent to-transparent pointer-events-none" />

        {/* Archival Visual Sound Halo */}
        <div className="relative w-44 h-44 my-2 flex items-center justify-center">
          {audioState.isPlaying && (
            <div className="absolute inset-0 rounded-full bg-[#434b18]/40 animate-ping opacity-35" />
          )}
          <div className="absolute inset-2 rounded-full bg-[#262a31] border border-[#d4af37]/40 flex items-center justify-center shadow-inner">
            <img
              src={currentStop.imageUrl}
              alt={currentStop.title}
              className="w-36 h-36 rounded-full object-cover shadow-lg filter contrast-125"
            />
          </div>
          {/* Audio 3D Spatial Badge */}
          <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-[#434b18] text-[#dfe8a6] border border-[#c3cc8c]/40 shadow-md flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[16px] text-[#f2ca50]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#c3cc8c]">
              {t('audio_spatial', currentLang)}
            </span>
          </div>
        </div>

        {/* Track Identification & Title */}
        <div className="mt-4 mb-2 px-2">
          <span className="text-[11px] font-bold text-[#f2ca50] tracking-widest uppercase">
            {currentStop.witnessBadge}
          </span>
          <h2 className="text-[20px] font-bold text-[#dfe2eb] mt-1 tracking-tight leading-snug font-heading">
            {currentStop.playerTitle}
          </h2>
          <p className="text-[12px] text-[#d0c5af] mt-1.5 max-w-xs mx-auto">
            {currentStop.speakers}
          </p>
        </div>

        {/* Animated Waveform Visualizer */}
        <Waveform isPlaying={audioState.isPlaying} progressPercent={progressPercent} />

        {/* High-Contrast Progress Bar with Tactile Scrubber */}
        <Scrubber
          currentTime={audioState.currentTime}
          duration={audioState.duration}
          onSeek={(seconds) => audioPlayer.seek(seconds)}
          subTextLeft={currentStop.sector}
          subTextRight={t('total_duration', currentLang, { duration: currentStop.duration })}
        />
      </section>

      {/* Giant Outdoor Transport Controls */}
      <section className="bg-[#1c2026] border border-[#31353c]/70 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-around w-full">
          {/* Jump Back -15s Button */}
          <button
            onClick={() => audioPlayer.rewind(15)}
            aria-label={t('rewind_15', currentLang)}
            className="w-16 h-16 min-w-[56px] min-h-[56px] rounded-full bg-[#262a31] border border-[#31353c] text-[#dfe2eb] flex flex-col items-center justify-center active:scale-95 transition-transform shadow-md hover:bg-[#353940]"
            type="button"
          >
            <span className="material-symbols-outlined text-[28px]">replay_10</span>
            <span className="text-[10px] font-bold -mt-0.5">-15s</span>
          </button>

          {/* Giant XXL Central Play/Pause Button */}
          <button
            onClick={() => audioPlayer.togglePlayPause()}
            aria-label={audioState.isPlaying ? t('pause', currentLang) : t('play', currentLang)}
            className="w-24 h-24 min-w-[80px] min-h-[80px] rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-2xl active:scale-90 transition-transform ring-4 ring-[#ffe088]/25 hover:brightness-105"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[48px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {audioState.isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Jump Forward +15s Button */}
          <button
            onClick={() => audioPlayer.forward(15)}
            aria-label={t('forward_15', currentLang)}
            className="w-16 h-16 min-w-[56px] min-h-[56px] rounded-full bg-[#262a31] border border-[#31353c] text-[#dfe2eb] flex flex-col items-center justify-center active:scale-95 transition-transform shadow-md hover:bg-[#353940]"
            type="button"
          >
            <span className="material-symbols-outlined text-[28px]">forward_10</span>
            <span className="text-[10px] font-bold -mt-0.5">+15s</span>
          </button>
        </div>

        {/* Ergonomic Audio Modifiers */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Boost Voice Clarity Button */}
          <button
            onClick={() => audioPlayer.toggleVoiceBoost()}
            aria-pressed={audioState.isVoiceBoostActive}
            className={`min-h-[56px] h-14 px-3 rounded-xl flex items-center justify-center gap-2 shadow transition-all active:scale-95 border ${
              audioState.isVoiceBoostActive
                ? 'bg-[#434b18] text-[#dfe8a6] border-[#c3cc8c]/40'
                : 'bg-[#262a31] text-[#dfe2eb] border-[#31353c]'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[22px] text-[#f2ca50]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              record_voice_over
            </span>
            <div className="text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c3cc8c]">
                {t('voice_boost', currentLang)}
              </span>
              <span className="block text-[11px] opacity-80 leading-none">
                {t('wind_cut', currentLang)}
              </span>
            </div>
          </button>

          {/* Playback Speed Cycle Selector */}
          <button
            onClick={() => audioPlayer.cyclePlaybackRate()}
            aria-label={t('speed', currentLang)}
            className="min-h-[56px] h-14 px-3 rounded-2xl bg-[#262a31] border border-[#31353c] text-[#dfe2eb] flex items-center justify-between shadow active:scale-95 transition-transform"
            type="button"
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-[#d0c5af]">speed</span>
              <span className="text-[13px] font-bold">{t('speed', currentLang)}</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#0a0e14] text-[#f2ca50] text-[13px] font-bold shadow-inner border border-[#31353c]">
              {audioState.playbackRate.toFixed(1)}x
            </span>
          </button>
        </div>
      </section>

      {/* Complete Transcript Accessibility Panel */}
      <section className="bg-[#1c2026] border border-[#31353c]/70 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
        <button
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          aria-expanded={isTranscriptOpen}
          className="w-full min-h-[56px] p-4 flex items-center justify-between text-left bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] transition-colors"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1c2026] flex items-center justify-center text-[#f2ca50] border border-[#d4af37]/30">
              <span className="material-symbols-outlined text-[20px]">subtitles</span>
            </div>
            <div>
              <span className="block text-[16px] font-bold font-heading">
                {t('text_transcript', currentLang)}
              </span>
              <span className="block text-[11px] text-[#d0c5af]">
                {t('transcript_comfort', currentLang)}
              </span>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-[24px] text-[#d0c5af] transition-transform duration-300 ${
              isTranscriptOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {/* Collapsible Transcript Content */}
        {isTranscriptOpen && (
          <div className="p-4 bg-[#1c2026] space-y-3">
            <div className="p-3 rounded bg-[#0a0e14] border border-[#262a31] text-[#d0c5af] text-[12px]">
              <span className="font-bold text-[#f2ca50] block mb-1">
                {t('archive_note_title', currentLang)}
              </span>
              {t('archive_note_body', currentLang)}
            </div>

            <div className="space-y-3 text-[#dfe2eb] text-[14px] leading-relaxed select-text">
              {currentStop.transcript.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#262a31] border border-[#31353c]/50">
                  <p className="text-[#f2ca50] text-[11px] font-bold uppercase tracking-wider mb-1">
                    {item.timeRange} • {item.title}
                  </p>
                  <p className="whitespace-pre-line">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="h-10 px-3 rounded bg-[#262a31] text-[#dfe2eb] text-[12px] font-semibold flex items-center gap-1 active:scale-95 border border-[#31353c]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                <span>{t('back_to_player', currentLang)}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Next Museum Exhibit Suggestion */}
      {nextStop && (
        <aside
          onClick={() => onSelectStopDetail(nextStop.id)}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-[#181c22] border border-[#262a31] shadow-sm cursor-pointer hover:bg-[#1c2026] transition-colors"
        >
          <div className="w-12 h-12 rounded-lg bg-[#262a31] border border-[#31353c] flex-shrink-0 flex items-center justify-center text-[#f2ca50]">
            <span className="material-symbols-outlined text-[24px]">museum</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c3cc8c]">
              {t('next_stop_distance', currentLang)}
            </span>
            <p className="text-[13px] font-bold text-[#dfe2eb] truncate font-heading">
              {nextStop.title}
            </p>
          </div>
          <span className="material-symbols-outlined text-[#d0c5af] text-[20px]">chevron_right</span>
        </aside>
      )}
    </div>
  );
};
