import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TimedTranscriptSegment } from '../data/stops';

interface SyncedTranscriptProps {
  segments: TimedTranscriptSegment[];
  currentTime: number;
  textSize: number;
  onSelectPhrase: (seconds: number) => void;
}

export const SyncedTranscript: React.FC<SyncedTranscriptProps> = ({
  segments,
  currentTime,
  textSize,
  onSelectPhrase,
}) => {
  const [isFollowing, setIsFollowing] = useState(true);
  const transcriptViewportRef = useRef<HTMLDivElement>(null);
  const activePhraseRef = useRef<HTMLButtonElement>(null);
  const previousIndexRef = useRef<number | null>(null);

  const activeIndex = useMemo(() => {
    let active = 0;
    for (let index = 0; index < segments.length; index += 1) {
      if (currentTime >= segments[index].startSeconds) active = index;
      else break;
    }
    return active;
  }, [currentTime, segments]);

  const scrollToActivePhrase = (behavior: ScrollBehavior = 'smooth') => {
    const viewport = transcriptViewportRef.current;
    const activePhrase = activePhraseRef.current;
    if (!viewport || !activePhrase) return;

    const viewportRect = viewport.getBoundingClientRect();
    const phraseRect = activePhrase.getBoundingClientRect();
    const offset = phraseRect.top - viewportRect.top + phraseRect.height / 2 - viewport.clientHeight / 2;
    viewport.scrollTo({ top: viewport.scrollTop + offset, behavior });
  };

  useEffect(() => {
    if (previousIndexRef.current !== activeIndex && isFollowing) {
      scrollToActivePhrase();
    }
    previousIndexRef.current = activeIndex;
  }, [activeIndex, isFollowing]);

  const pauseFollowingForManualScroll = () => setIsFollowing(false);

  const resumeFollowing = () => {
    setIsFollowing(true);
    scrollToActivePhrase();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#d0c5af]" id="synced-transcript-help">
          Touchez une phrase pour reprendre l’écoute à cet endroit.
        </p>
        {!isFollowing && (
          <button
            type="button"
            onClick={resumeFollowing}
            className="min-h-11 shrink-0 rounded-lg border border-[#d4af37]/50 bg-[#262a31] px-3 text-sm font-semibold text-[#f2ca50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ca50]"
          >
            Reprendre le suivi
          </button>
        )}
      </div>

      <div
        ref={transcriptViewportRef}
        className="max-h-[48vh] overflow-y-auto overscroll-contain rounded-xl border border-[#31353c] bg-[#10141a] p-2"
        onWheel={pauseFollowingForManualScroll}
        onTouchStart={pauseFollowingForManualScroll}
        onPointerDown={pauseFollowingForManualScroll}
        onKeyDown={(event) => {
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
            pauseFollowingForManualScroll();
          }
        }}
        aria-describedby="synced-transcript-help"
      >
        <ol className="space-y-2">
          {segments.map((segment, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={`${segment.startSeconds}-${index}`}>
                <button
                  ref={isActive ? activePhraseRef : undefined}
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    setIsFollowing(true);
                    onSelectPhrase(segment.startSeconds);
                  }}
                  className={`w-full min-h-14 rounded-lg border p-4 text-left leading-relaxed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ca50] select-text ${
                    isActive
                      ? 'border-[#f2ca50] bg-[#434b18]/60 text-[#fff4c2] shadow-md'
                      : 'border-[#31353c] bg-[#1c2026] text-[#dfe2eb] hover:bg-[#262a31]'
                  }`}
                  style={{ fontSize: `${textSize}px` }}
                >
                  {segment.text}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
