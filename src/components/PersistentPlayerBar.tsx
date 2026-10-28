import React from 'react';
import { audioPlayer, AudioState } from '../audio/audioStore';
import { STOPS } from '../data/stops';

interface PersistentPlayerBarProps {
  onOpenFullPlayer: () => void;
}

export const PersistentPlayerBar: React.FC<PersistentPlayerBarProps> = ({ onOpenFullPlayer }) => {
  const [state, setState] = React.useState<AudioState>(audioPlayer.getState());

  React.useEffect(() => {
    return audioPlayer.subscribe((next) => setState(next));
  }, []);

  const currentStop = STOPS.find((s) => s.id === state.currentStopId) || STOPS[0];
  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audioPlayer.seek(ratio * state.duration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="Lecteur audio persistant"
      className="fixed bottom-20 inset-x-0 z-40 bg-[#181c22]/95 backdrop-blur-2xl border-t border-[#d4af37]/30 shadow-xl"
    >
      {/* Scrubable mini-progress bar at top of docked player */}
      <div
        onClick={handleScrub}
        className="w-full h-2 bg-[#262a31] cursor-pointer relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ca50]"
        role="slider"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); audioPlayer.seek(state.currentTime + 5); }
          if (event.key === "ArrowLeft") { event.preventDefault(); audioPlayer.seek(state.currentTime - 5); }
          if (event.key === "Home") { event.preventDefault(); audioPlayer.seek(0); }
          if (event.key === "End") { event.preventDefault(); audioPlayer.seek(state.duration); }
        }}
        aria-valuenow={Math.round(state.currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(state.duration)}
        aria-valuetext={formatTime(state.currentTime) + " sur " + formatTime(state.duration)}
        aria-label="Progression audio"
      >
        <div
          className="h-full bg-[#f2ca50] transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#f2ca50] shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <div className="min-h-16 px-3 py-1 flex items-center justify-between max-w-md mx-auto gap-2">
        {/* Click to open full player */}
        <div
          onClick={onOpenFullPlayer}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpenFullPlayer(); } }}
          role="button"
          tabIndex={0}
          aria-label="Ouvrir le lecteur audio complet"
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer pr-2 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ca50]"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#d4af37]/40">
            <img
              src={currentStop.imageUrl}
              alt={currentStop.title}
              className="w-full h-full object-cover filter contrast-125"
            />
            {state.isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-ping" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#f2ca50] uppercase tracking-wider">
                Station {currentStop.number}
              </span>
              <span className="text-[10px] text-[#d0c5af] tabular-nums">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </span>
            </div>
            <span className="text-[13px] font-bold text-[#dfe2eb] truncate font-heading">
              {currentStop.title}
            </span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => audioPlayer.prevStop()}
            aria-label="Arrêt précédent"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#d0c5af] hover:text-[#dfe2eb] hover:bg-[#262a31] transition-colors active:scale-90"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">skip_previous</span>
          </button>

          <button
            onClick={() => audioPlayer.togglePlayPause()}
            aria-label={state.isPlaying ? 'Mettre en pause' : 'Lancer la lecture'}
            className="w-11 h-11 rounded-full bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center shadow-lg hover:brightness-105 transition-all active:scale-90"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {state.isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={() => audioPlayer.nextStop()}
            aria-label="Arrêt suivant"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#d0c5af] hover:text-[#dfe2eb] hover:bg-[#262a31] transition-colors active:scale-90"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">skip_next</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
