import React from 'react';
import type { TranscriptResolution } from '../data/transcripts';
import { getMediaResource } from '../data/mediaCatalog';
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
  const [loaded, setLoaded] = React.useState<{ stopId: string; transcript: TranscriptResolution | null; failed: boolean } | null>(null);
  React.useEffect(() => {
    let active = true;
    setLoaded({ stopId, transcript: null, failed: false });
    // Keep the large transcript registry out of the initial French visit bundle.
    void import('../data/transcripts').then(({ resolveTranscript }) => {
      if (active) setLoaded({ stopId, transcript: resolveTranscript(stopId, 'en', getMediaResource(stopId, 'en')), failed: false });
    }).catch(() => {
      if (active) setLoaded({ stopId, transcript: null, failed: true });
    });
    return () => { active = false; };
  }, [stopId]);

  // A rapid station change must never show the previous station's narrative.
  const current = loaded?.stopId === stopId ? loaded : null;
  if (!current?.transcript) return <p className="museum-piece-resource-note" role="status" lang="en">
    {current?.failed ? 'The English text could not load. The French reference remains below.' : 'Loading the English narration…'}
  </p>;
  return <EnglishNarrativeContent transcript={current.transcript} />;
});
