import { useCallback, useRef, useSyncExternalStore } from 'react';
import { audioPlayer, type AudioState } from './audioStore';

// One stable snapshot per media notification. getState() itself deliberately returns a copy.
let snapshot = audioPlayer.getState();
audioPlayer.subscribe((state) => { snapshot = state; });
const subscribe = (notify: () => void) => audioPlayer.subscribe(() => notify());

export function useAudioSelector<T>(selector: (state: AudioState) => T): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const selection = useRef<{ state: AudioState; selector: typeof selector; value: T } | null>(null);
  const getSnapshot = useCallback(() => {
    const previous = selection.current;
    if (previous?.state === snapshot && previous.selector === selectorRef.current) return previous.value;
    const value = selectorRef.current(snapshot);
    const stable = previous && Object.is(previous.value, value) ? previous.value : value;
    selection.current = { state: snapshot, selector: selectorRef.current, value: stable };
    return stable;
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
