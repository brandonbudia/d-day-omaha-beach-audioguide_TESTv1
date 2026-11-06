import { useSyncExternalStore } from 'react';
import { visitorStore } from './visitorStore';

export function useVisitorState() {
  return useSyncExternalStore(visitorStore.subscribe, visitorStore.getSnapshot, visitorStore.getSnapshot);
}
