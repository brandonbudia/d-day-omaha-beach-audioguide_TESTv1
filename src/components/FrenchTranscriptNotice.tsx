import React from 'react';
import type { FrenchTranscript } from '../data/frenchTranscripts';

export const FrenchTranscriptNotice: React.FC<{ transcript: FrenchTranscript }> = ({ transcript }) => {
  const unavailable = transcript.verification === 'audio-unavailable';
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[#d0c5af]">
      <p role="note">
        {unavailable
          ? 'Cet enregistrement ne correspond pas au texte de cette station. Le texte de référence reste consultable ci-dessous, sans suivi audio.'
          : 'Transcription comparée à l’enregistrement, en cours de vérification. Les mots incertains restent lisibles sans être synchronisés.'}
      </p>
      {!unavailable && transcript.timedWords < transcript.totalWords && (
        <p>{transcript.timedWords} mots sur {transcript.totalWords} disposent actuellement du suivi audio.</p>
      )}
      {transcript.referenceOnlyParagraphs.length > 0 && (
        <details className="rounded-lg border border-[#4d4635] p-3">
          <summary className="min-h-11 cursor-pointer font-semibold text-[#f2ca50]">
            {unavailable ? 'Texte de référence' : 'Passage du document non retrouvé dans cet audio'}
          </summary>
          <div className="space-y-3 pt-3 text-base text-[#dfe2eb]">
            {transcript.referenceOnlyParagraphs.map((text, index) => <p key={index}>{text}</p>)}
          </div>
        </details>
      )}
    </div>
  );
};
