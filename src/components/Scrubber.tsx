import React, { useRef, useState } from 'react';

interface ScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  subTextLeft?: string;
  subTextRight?: string;
}

export const Scrubber: React.FC<ScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  subTextLeft = 'Marée montante 06h30',
  subTextRight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const displayTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;
  const remainingSecs = Math.max(0, duration - displayTime);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (dragTime !== null) {
        onSeek(dragTime);
      }
      setIsDragging(false);
      setDragTime(null);
    }
  };

  const updateFromPointer = (clientX: number) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = ratio * duration;
    setDragTime(target);
  };

  return (
    <div className="w-full mt-2">
      {/* High-visibility Large Timers */}
      <div className="flex justify-between items-baseline mb-1.5 px-1">
        <span className="text-[20px] font-bold text-[#f2ca50] tabular-nums font-heading">
          {formatTime(displayTime)}
        </span>
        <span className="text-[20px] font-bold text-[#d0c5af] tabular-nums font-heading">
          -{formatTime(remainingSecs)}
        </span>
      </div>

      {/* Giant Touch Scrubber */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        role="slider"
        aria-label="Position audio"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(displayTime)}
        className="relative w-full h-8 flex items-center cursor-pointer select-none touch-none"
      >
        <div className="w-full h-3.5 bg-[#31353c] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[#f2ca50] rounded-full shadow transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* High Contrast Thumb Handle */}
        <div
          className="absolute -translate-x-1/2 w-8 h-8 rounded-full bg-[#f2ca50] shadow-xl flex items-center justify-center pointer-events-none ring-2 ring-[#ffe088]"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-[#3c2f00]" />
        </div>
      </div>

      <div className="flex justify-between items-center text-[#d0c5af] text-[11px] font-bold uppercase tracking-wider px-1 mt-1">
        <span>{subTextLeft}</span>
        <span>{subTextRight || `Durée totale : ${formatTime(duration)}`}</span>
      </div>
    </div>
  );
};
