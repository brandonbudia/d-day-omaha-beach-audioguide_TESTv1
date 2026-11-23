import React from 'react';
import type { TranscriptResolution } from '../data/transcriptResolution';
import { getMediaResource } from '../data/mediaCatalog';
import { useTranscript } from '../hooks/useTranscript';
import { TranscriptNotice } from './TranscriptNotice';

/** Read the existing English narration; unconfirmed source passages stay separate. */
export function EnglishNarrativeContent({ transcript }: { transcript: TranscriptResolution }) {
  if (transcript.contentLanguage !== 'en' || transcript.paragraphs.length === 0) {
    return <p className="museum-piece-resource-note" lang="en">English narration text is not available. The French reference remains below.</p>;
  }
  return <section className="museum-piece-context museum-card" aria-label="English narration" lang="en">
    <h3>English narration</h3>
    <TranscriptNotice transcript={transcript} language="en" />
    <div className="museum-narrative-text">
      {transcript.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </div>
  </section>;
}

export const EnglishNarrative = React.memo(function EnglishNarrative({ stopId }: { stopId: string }) {
  const { status, transcript } = useTranscript(stopId, 'en', getMediaResource(stopId, 'en'));
  if (!transcript) return <p className="museum-piece-resource-note" role="status" lang="en">
    {status === 'failed' ? 'The English text could not load. The French reference remains below.' : 'Loading the English narration…'}
  </p>;
  return <EnglishNarrativeContent transcript={transcript} />;
});
