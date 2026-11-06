import React from 'react';

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
  subTextLeft,
  subTextRight,
}) => {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const displayTime = Number.isFinite(currentTime) ? Math.max(0, Math.min(currentTime, safeDuration)) : 0;
  const progressPercent = safeDuration > 0 ? (displayTime / safeDuration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player-scrubber">
      <input
        type="range"
        className="player-range"
        min={0}
        max={safeDuration}
        step={0.01}
        value={displayTime}
        disabled={safeDuration <= 0}
        onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
        onKeyDown={(event) => {
          const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 0;
          if (direction) {
            event.preventDefault();
            onSeek(Math.max(0, Math.min(safeDuration, displayTime + direction * 5)));
          }
        }}
        aria-label="Position audio"
        aria-valuetext={`${formatTime(displayTime)} sur ${formatTime(safeDuration)}`}
        style={{ '--audio-progress': `${progressPercent}%`, minHeight: 44 } as React.CSSProperties}
      />
      <div className="player-times">
        <span>{formatTime(displayTime)}</span>
        <span>−{formatTime(safeDuration - displayTime)}</span>
      </div>
      {(subTextLeft || subTextRight) && (
        <div className="player-scrubber-caption">
          <span>{subTextLeft}</span>
          <span>{subTextRight}</span>
        </div>
      )}
    </div>
  );
};
