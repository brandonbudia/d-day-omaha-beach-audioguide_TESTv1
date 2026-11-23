import { useEffect, useMemo, useState } from 'react';
import { getLoadedTranscript, loadTranscript } from '../data/loadTranscript';
import type { TranscriptAudioResource, TranscriptResolution } from '../data/transcriptResolution';
import type { SupportedLanguage } from '../i18n/translations';

type TranscriptSelection = { status: 'loading' | 'ready' | 'failed'; transcript?: TranscriptResolution };

export function useTranscript(id: string, language: SupportedLanguage, audio: TranscriptAudioResource): TranscriptSelection {
  const request = useMemo(() => ({ id, language, audio }), [id, language, audio]);
  const cached = useMemo(() => getLoadedTranscript(request.id, request.language, request.audio), [request]);
  const [completed, setCompleted] = useState<{ request: typeof request; result: TranscriptSelection }>();

  useEffect(() => {
    if (cached) return;
    let active = true;
    void loadTranscript(request.id, request.language, request.audio).then((transcript) => {
      if (active) setCompleted({ request, result: { status: 'ready', transcript } });
    }).catch(() => {
      if (active) setCompleted({ request, result: { status: 'failed' } });
    });
    return () => { active = false; };
  }, [request, cached]);

  // A result from an earlier station, language or audio identity must never be displayed for the new selection.
  if (completed?.request === request) return completed.result;
  return cached ? { status: 'ready', transcript: cached } : { status: 'loading' };
}
