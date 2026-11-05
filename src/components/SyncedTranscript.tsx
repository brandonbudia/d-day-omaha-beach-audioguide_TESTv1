import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TimedTranscriptSegment, TimedTranscriptWord } from '../data/stops';
import { getTimedTokens, getWordState, tokenizeTranscript } from '../audio/transcriptTiming';

function renderTimedWords(text: string, words: TimedTranscriptWord[], currentTime: number, onSelect: (seconds: number) => void) {
  const tokens = tokenizeTranscript(text);
  const timings = new Map(words.map((word, index) => [word.tokenIndex ?? index, word]));
  let cursor = 0;
  const rendered: React.ReactNode[] = [];
  tokens.forEach((token, index) => {
    const start = token.index ?? cursor;
    const end = start + token[0].length;
    const before = text.slice(cursor, start);
    cursor = end;
    const word = timings.get(index);
    const state = word ? getWordState(currentTime, word) : 'untimed';
    rendered.push(
      <React.Fragment key={index}>
        {before}
        {word ? (
          <button
            type="button"
            className="transcript-word"
            data-word-state={state}
            aria-current={state === 'current' ? 'true' : undefined}
            onClick={() => onSelect(word.startSeconds)}
          >{token[0]}</button>
        ) : <span>{token[0]}</span>}
      </React.Fragment>
    );
  });
  rendered.push(text.slice(cursor));
  return rendered;
}

const TimedWords = React.memo(function TimedWords({ text, words, currentTime, onSelect }: {
  text: string;
  words: TimedTranscriptWord[];
  currentTime: number;
  onSelect: (seconds: number) => void;
}) {
  return <>{renderTimedWords(text, words, currentTime, onSelect)}</>;
});

interface SyncedTranscriptProps {
  segments: TimedTranscriptSegment[];
  currentTime: number;
  textSize: number;
  isPlaying?: boolean;
  onSelectPhrase: (seconds: number) => void;
}

export const SyncedTranscript: React.FC<SyncedTranscriptProps> = ({
  segments,
  currentTime,
  textSize,
  isPlaying = false,
  onSelectPhrase,
}) => {
  const [isFollowing, setIsFollowing] = useState(true);
  const transcriptViewportRef = useRef<HTMLDivElement>(null);
  const activePhraseRef = useRef<HTMLDivElement>(null);
  const pointerInteractionRef = useRef(false);
  const onSelectPhraseRef = useRef(onSelectPhrase);
  onSelectPhraseRef.current = onSelectPhrase;
  const timedWords = useMemo(() => segments.map((segment, index) => getTimedTokens(
    segment.text, segment.wordTimings ?? [], segment.startSeconds, segments[index + 1]?.startSeconds,
  )), [segments]);

  const activeIndex = useMemo(() => {
    let active = 0;
    for (let index = 0; index < segments.length; index += 1) {
      if (currentTime >= segments[index].startSeconds) active = index;
      else break;
    }
    return active;
  }, [currentTime, segments]);

  const activeWordIndex = timedWords[activeIndex]?.findIndex((word) => getWordState(currentTime, word) === 'current') ?? -1;

  const scrollToActivePhrase = useCallback((force = true, behaviorOverride?: ScrollBehavior) => {
    if (pointerInteractionRef.current) return;
    const viewport = transcriptViewportRef.current;
    const activePhrase = activePhraseRef.current;
    if (!viewport || !activePhrase) return;

    const viewportRect = viewport.getBoundingClientRect();
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    const navigationTop = document.querySelector('[aria-label="Navigation principale"]')?.getBoundingClientRect().top ?? window.innerHeight;
    const visibleTop = Math.max(viewportRect.top, headerBottom + 8);
    const visibleBottom = Math.min(viewportRect.bottom, navigationTop - 8, window.innerHeight);
    const visibleHeight = visibleBottom - visibleTop;
    if (visibleHeight < 60) return;
    const activeWord = activePhrase.querySelector<HTMLElement>('.transcript-word[data-word-state="current"]');
    if (!force && !activeWord) return;
    const targetRect = (activeWord ?? activePhrase).getBoundingClientRect();
    if (!force && targetRect.top >= visibleTop + 16 && targetRect.bottom <= visibleBottom - 16) return;
    const targetHeight = Math.min(targetRect.height, visibleHeight);
    const offset = targetRect.top - visibleTop + targetHeight / 2 - visibleHeight / 2;
    const behavior = behaviorOverride ?? (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
    viewport.scrollTo({ top: viewport.scrollTop + offset, behavior });
  }, []);

  useEffect(() => {
    if (isFollowing) {
      scrollToActivePhrase();
    }
  }, [activeIndex, isFollowing, textSize, isPlaying, scrollToActivePhrase]);

  useEffect(() => {
    if (isFollowing && activeWordIndex >= 0) scrollToActivePhrase(false);
  }, [activeIndex, activeWordIndex, isFollowing, scrollToActivePhrase]);

  useEffect(() => {
    if (!isFollowing) return;
    let frame: number | undefined;
    const updateVisibleArea = () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        scrollToActivePhrase(false, 'auto');
      });
    };
    window.addEventListener('resize', updateVisibleArea);
    return () => {
      window.removeEventListener('resize', updateVisibleArea);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [isFollowing, scrollToActivePhrase]);

  useEffect(() => {
    const releasePointer = () => { pointerInteractionRef.current = false; };
    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    window.addEventListener('blur', releasePointer);
    return () => {
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      window.removeEventListener('blur', releasePointer);
    };
  }, []);

  const selectTime = useCallback((seconds: number) => {
    pointerInteractionRef.current = false;
    setIsFollowing(true);
    onSelectPhraseRef.current(seconds);
  }, []);

  const pauseFollowingForManualScroll = () => setIsFollowing(false);
  const pauseFollowingForPointer = (event: React.SyntheticEvent) => {
    // A word/phrase tap must not move its button between pointer down and click.
    if (!(event.target instanceof Element) || !event.target.closest('button')) pauseFollowingForManualScroll();
  };

  const resumeFollowing = () => {
    pointerInteractionRef.current = false;
    setIsFollowing(true);
    scrollToActivePhrase();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#d0c5af]" id="synced-transcript-help">
          Touchez un mot aligné ou « Lire cette phrase » pour reprendre l’écoute à cet endroit.
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
        onTouchStart={pauseFollowingForPointer}
        onTouchMove={pauseFollowingForManualScroll}
        onPointerDown={(event) => {
          pointerInteractionRef.current = true;
          pauseFollowingForPointer(event);
        }}
        onPointerUp={() => { pointerInteractionRef.current = false; }}
        onPointerCancel={() => { pointerInteractionRef.current = false; }}
        onKeyDown={(event) => {
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
            pauseFollowingForManualScroll();
          }
        }}
        tabIndex={0}
        role="region"
        aria-label="Transcription synchronisée"
        aria-describedby="synced-transcript-help"
      >
        <ol className="space-y-2">
          {segments.map((segment, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={`${segment.startSeconds}-${index}`}>
                <div
                  ref={isActive ? activePhraseRef : undefined}
                  className="synced-transcript-phrase"
                  data-active={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  style={{ fontSize: `${textSize}px` }}
                >
                  {timedWords[index].length ? (
                    <>
                      <TimedWords text={segment.text} words={timedWords[index]} currentTime={isActive ? currentTime : index < activeIndex ? Infinity : -Infinity} onSelect={selectTime} />
                      <button type="button" className="mt-2 block min-h-11 rounded border px-3 text-sm" onClick={() => selectTime(segment.startSeconds)} aria-label={`Lire cette phrase : ${segment.text}`}>Lire cette phrase</button>
                    </>
                  ) : <button type="button" className="transcript-phrase-button" onClick={() => selectTime(segment.startSeconds)}>{segment.text}</button>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
