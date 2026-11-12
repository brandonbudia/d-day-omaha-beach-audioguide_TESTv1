import { tokenizeTranscript } from '../src/audio/transcriptTiming';
import { getMediaResource } from '../src/data/mediaCatalog';
import { STOPS } from '../src/data/stops';
import { resolveTranscript } from '../src/data/transcripts';
import { LANGUAGES } from '../src/i18n/translations';

const percentage = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2 });

function coverageCells(synchronized: number, total: number) {
  return total > 0
    ? `${synchronized} | ${total - synchronized} | ${percentage.format(synchronized / total)}`
    : '— | — | Non mesurable';
}

console.log('| Langue | Station | Mots synchronisés | Mots manquants | Couverture |');
console.log('|---|---|---:|---:|---:|');

for (const { code } of LANGUAGES) {
  const language = code.toUpperCase();
  if (code !== 'fr' && code !== 'en') {
    console.log(`| ${language} | Toutes (${STOPS.length}) | — | — | Suivi par phrase |`);
    continue;
  }
  let totalSynchronized = 0;
  let totalWords = 0;
  const stations = STOPS.map(({ id }) => {
    const resource = getMediaResource(id, code);
    const transcript = resolveTranscript(id, code, resource);
    if (resource.status === 'unavailable' || transcript.contentLanguage !== code) {
      return { id, synchronized: 0, total: 0 };
    }

    const total = transcript.paragraphs.reduce((sum, text) => sum + tokenizeTranscript(text).length, 0);
    const synchronized = transcript.segments.reduce((sum, segment) => sum + (segment.wordTimings?.length ?? 0), 0);
    totalWords += total;
    totalSynchronized += synchronized;
    return { id, synchronized, total };
  });

  if (totalWords === 0) {
    console.log(`| ${language} | Toutes (${stations.length}) | ${coverageCells(0, 0)} |`);
    continue;
  }

  for (const { id, synchronized, total } of stations) {
    console.log(`| ${language} | ${id} | ${coverageCells(synchronized, total)} |`);
  }
  console.log(`| **${language}** | **Total** | ${coverageCells(totalSynchronized, totalWords)} |`);
}
