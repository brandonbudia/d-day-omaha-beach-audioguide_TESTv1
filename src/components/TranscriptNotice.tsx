import React from 'react';
import { tokenizeTranscript } from '../audio/transcriptTiming';
import type { TranscriptResolution } from '../data/transcripts';
import type { SupportedLanguage } from '../i18n/translations';

const order: SupportedLanguage[] = ['fr', 'en', 'de', 'it', 'pl', 'nl', 'es'];
const copy = {
  partialPhrases: ['Suivi partiel. Les phrases sans repère restent lisibles.', 'Partial highlighting. Sentences without timing remain readable.', 'Teilweise synchronisiert. Sätze ohne Zeitmarke bleiben lesbar.', 'Sincronizzazione parziale. Le frasi senza tempi restano leggibili.', 'Częściowa synchronizacja. Zdania bez znaczników pozostają czytelne.', 'Gedeeltelijke synchronisatie. Zinnen zonder tijdcode blijven leesbaar.', 'Seguimiento parcial. Las frases sin marca de tiempo se pueden leer.'],
  provisionalShort: ['Transcription automatique · vérification humaine en attente.', 'Automatic transcript; human review is pending.', 'Automatisches Transkript · menschliche Prüfung steht aus.', 'Trascrizione automatica · verifica umana in attesa.', 'Transkrypcja automatyczna · oczekuje na sprawdzenie.', 'Automatisch transcript · menselijke controle is nog nodig.', 'Transcripción automática · revisión humana pendiente.'],
  phraseReview: ['Repères des phrases en attente de vérification humaine.', 'Sentence timings are pending human review.', 'Die Zeitmarken der Sätze müssen noch überprüft werden.', 'I tempi delle frasi sono in attesa di verifica.', 'Znaczniki czasu zdań czekają na sprawdzenie.', 'De tijdcodes van de zinnen moeten nog worden gecontroleerd.', 'Los tiempos de las frases están pendientes de revisión.'],
  provisional: ['Transcription assistée par reconnaissance audio, en attente de vérification humaine. Les mots incertains restent lisibles sans suivi.', 'Audio-assisted transcription; human review is pending. Uncertain words remain readable without highlighting.', 'Audiogestützte Transkription; menschliche Prüfung steht aus. Unsichere Wörter bleiben ohne Hervorhebung lesbar.', 'Trascrizione assistita dall’audio; verifica umana in attesa. Le parole incerte restano leggibili senza evidenziazione.', 'Transkrypcja wspomagana rozpoznawaniem mowy; oczekuje na sprawdzenie przez człowieka. Niepewne słowa pozostają czytelne bez wyróżnienia.', 'Transcript op basis van spraakherkenning; menselijke controle is nog nodig. Onzekere woorden blijven leesbaar zonder markering.', 'Transcripción asistida por reconocimiento de audio; pendiente de revisión humana. Las palabras inciertas siguen legibles sin resaltado.'],
  static: ['Le suivi synchronisé de ce texte n’est pas disponible pour cet enregistrement.', 'Synchronized highlighting of this text is not available for this recording.', 'Die Synchronisierung dieses Textes ist für diese Aufnahme nicht verfügbar.', 'La sincronizzazione di questo testo non è disponibile per questa registrazione.', 'Synchronizacja tego tekstu nie jest dostępna dla tego nagrania.', 'Gesynchroniseerde markering van deze tekst is niet beschikbaar voor deze opname.', 'El seguimiento sincronizado de este texto no está disponible para esta grabación.'],
  coverage: ['{timed} mots sur {total} disposent du suivi audio.', '{timed} of {total} words have audio highlighting.', '{timed} von {total} Wörtern haben eine Audiomarkierung.', '{timed} parole su {total} hanno il seguito audio.', '{timed} z {total} słów ma synchronizację audio.', '{timed} van {total} woorden hebben audiomarkering.', '{timed} de {total} palabras tienen seguimiento de audio.'],
  reference: ['Passages du document non retrouvés dans cet audio', 'Document passages not found in this recording', 'In dieser Aufnahme nicht gefundene Textpassagen', 'Passaggi del documento non presenti in questo audio', 'Fragmenty dokumentu nieodnalezione w tym nagraniu', 'Documentpassages die niet in deze opname zijn gevonden', 'Pasajes del documento no encontrados en esta grabación'],
} as const;

function text(key: keyof typeof copy, language: SupportedLanguage) {
  return copy[key][Math.max(0, order.indexOf(language))];
}

/** Editorial status is separate from whether an audio file is technically playable. */
export const TranscriptNotice: React.FC<{ transcript: TranscriptResolution; language: SupportedLanguage; compact?: boolean }> = ({ transcript, language, compact = false }) => {
  const synchronized = transcript.mode === 'synchronized';
  const pendingReview = transcript.provenance && !transcript.provenance.humanListeningReviewed;
  const message = synchronized ? pendingReview ? text('provisional', language) : null
    : transcript.mode === 'static' ? text('static', language)
    : transcript.mode === 'phrase-synchronized'
      ? transcript.untimedPhrases?.length ? text('partialPhrases', language) : pendingReview ? text('phraseReview', language) : null
      : null;
  if (compact) return message ? <p className="player-resource-notice" role="note" lang={language}>{synchronized && pendingReview ? text('provisionalShort', language) : message}</p> : null;
  const timed = transcript.segments.reduce((count, segment) => count + (segment.wordTimings?.length ?? 0), 0);
  const total = transcript.paragraphs.reduce((count, paragraph) => count + tokenizeTranscript(paragraph).length, 0);
  return (
    <div lang={language}>
      {message && <p role="note">{message}</p>}
      {synchronized && timed < total && <p>{text('coverage', language).replace('{timed}', String(timed)).replace('{total}', String(total))}</p>}
      {transcript.referenceOnlyParagraphs.length > 0 && transcript.paragraphs.length > 0 && (
        <details>
          <summary>{text('reference', language)}</summary>
          <div lang={transcript.contentLanguage ?? undefined}>
            {transcript.referenceOnlyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </details>
      )}
    </div>
  );
};
