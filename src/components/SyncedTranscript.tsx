import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TimedTranscriptSegment, TimedTranscriptWord } from '../data/stops';
import { getTimedTokens, getWordState, tokenizeTranscript } from '../audio/transcriptTiming';

function renderTimedWords(text: string, words: TimedTranscriptWord[], currentTime: number, onSelect: (seconds: number) => void, focusToken: number, onFocusToken: (index: number) => void) {
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
            data-timed-token-index={index}
            tabIndex={index === focusToken ? 0 : -1}
            onFocus={() => onFocusToken(index)}
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
  const wordGroupRef = useRef<HTMLSpanElement>(null);
  const [focusedToken, setFocusedToken] = useState(words[0]?.tokenIndex ?? 0);
  const tokenIndices = words.map((word, index) => word.tokenIndex ?? index);
  const focusToken = tokenIndices.includes(focusedToken) ? focusedToken : tokenIndices[0];
  return (
    <span
      ref={wordGroupRef}
      role="group"
      aria-label="Mots de la phrase"
      aria-describedby="synced-transcript-help"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        if (!(event.target instanceof HTMLButtonElement) || !event.target.matches('.transcript-word')) return;
        event.preventDefault();
        const index = tokenIndices.indexOf(Number(event.target.dataset.timedTokenIndex));
        const next = Math.max(0, Math.min(tokenIndices.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
        const token = tokenIndices[next];
        setFocusedToken(token);
        wordGroupRef.current?.querySelector<HTMLButtonElement>(`[data-timed-token-index="${token}"]`)?.focus();
      }}
    >
      {renderTimedWords(text, words, currentTime, onSelect, focusToken, setFocusedToken)}
    </span>
  );
});

interface SyncedTranscriptProps {
  segments: TimedTranscriptSegment[];
  currentTime: number;
  textSize: number;
  isPlaying?: boolean;
  reducedMotion?: boolean;
  onSelectPhrase: (seconds: number) => void;
}

export const SyncedTranscript: React.FC<SyncedTranscriptProps> = ({
  segments,
  currentTime,
  textSize,
  isPlaying = false,
  reducedMotion = false,
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
    const navigationTop = document.querySelector('.museum-bottom-nav')?.getBoundingClientRect().top ?? window.innerHeight;
    const transportRect = document.querySelector('.player-transport')?.getBoundingClientRect();
    // In landscape the controls sit beside the text, rather than underneath it.
    const transportTop = transportRect && transportRect.left < viewportRect.right && transportRect.right > viewportRect.left
      ? transportRect.top : window.innerHeight;
    const visibleTop = Math.max(viewportRect.top, headerBottom + 8);
    const visibleBottom = Math.min(viewportRect.bottom, navigationTop - 8, transportTop - 8, window.innerHeight);
    const visibleHeight = visibleBottom - visibleTop;
    if (visibleHeight < 24) return;
    const activeWord = activePhrase.querySelector<HTMLElement>('.transcript-word[data-word-state="current"]');
    if (!force && !activeWord) return;
    const targetRect = (activeWord ?? activePhrase).getBoundingClientRect();
    const margin = Math.min(16, Math.max(0, (visibleHeight - targetRect.height) / 2));
    if (!force && targetRect.top >= visibleTop + margin && targetRect.bottom <= visibleBottom - margin) return;
    const targetHeight = Math.min(targetRect.height, visibleHeight);
    const offset = targetRect.top - visibleTop + targetHeight / 2 - visibleHeight / 2;
    const behavior = behaviorOverride ?? (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
    viewport.scrollTo({ top: viewport.scrollTop + offset, behavior });
  }, [reducedMotion]);

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
    const observer = new ResizeObserver(updateVisibleArea);
    if (transcriptViewportRef.current) observer.observe(transcriptViewportRef.current);
    document.fonts?.addEventListener('loadingdone', updateVisibleArea);
    window.addEventListener('resize', updateVisibleArea);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', updateVisibleArea);
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
    <div className="synced-transcript" lang="fr">
      <div className="transcript-follow-bar">
        <p id="synced-transcript-help">
          Touchez un mot pour l’écouter.
          <span className="sr-only"> Au clavier, Tab rejoint un mot par phrase. Les flèches gauche et droite parcourent ses mots disponibles. Entrée ou Espace lance la lecture du mot choisi.</span>
        </p>
        {!isFollowing && (
          <button
            type="button"
            onClick={resumeFollowing}
            className="transcript-resume"
          >
            Reprendre le suivi
          </button>
        )}
      </div>

      <div
        ref={transcriptViewportRef}
        className="transcript-viewport"
        onWheel={pauseFollowingForManualScroll}
        onTouchStart={pauseFollowingForPointer}
        onTouchMove={pauseFollowingForManualScroll}
        onPointerDown={(event) => {
          pointerInteractionRef.current = true;
          pauseFollowingForPointer(event);
        }}
        onPointerUp={() => { pointerInteractionRef.current = false; }}
        onPointerCancel={() => { pointerInteractionRef.current = false; }}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) pauseFollowingForManualScroll();
        }}
        onKeyDown={(event) => {
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Tab'].includes(event.key)) {
            pauseFollowingForManualScroll();
          }
        }}
        tabIndex={0}
        role="region"
        aria-label="Transcription synchronisée"
        aria-describedby="synced-transcript-help"
      >
        <ol>
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
                      <button type="button" className="transcript-phrase-replay" onClick={() => selectTime(segment.startSeconds)} aria-label={`Lire cette phrase : ${segment.text}`}>Lire cette phrase</button>
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
