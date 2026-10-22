import React, { useEffect, useState } from 'react';

interface WaveformProps {
  isPlaying: boolean;
  progressPercent: number; // 0 to 100
}

export const Waveform: React.FC<WaveformProps> = ({ isPlaying, progressPercent }) => {
  const barCount = 24;
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, (_, i) => 10 + Math.sin(i * 0.45) * 18 + ((i * 7) % 15))
  );

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHeights((prev) =>
        prev.map((h, i) => {
          const rand = Math.floor(Math.random() * 32) + 8;
          return Math.max(6, Math.min(46, (h + rand) / 2));
        })
      );
    }, 280);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div
      aria-hidden="true"
      className="w-full h-14 bg-[#0a0e14] rounded-lg my-3 px-3 flex items-center justify-between gap-1 overflow-hidden border border-[#1c2026]"
    >
      {heights.map((h, index) => {
        const threshold = (index / barCount) * 100;
        const isPassed = threshold <= progressPercent;
        return (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isPassed ? 'bg-[#f2ca50] shadow-sm' : 'bg-[#4d4635]/60'
            }`}
            style={{
              height: `${Math.round(h)}px`,
            }}
          />
        );
      })}
    </div>
  );
};
