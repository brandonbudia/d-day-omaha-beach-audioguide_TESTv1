import type { TimedTranscriptWord } from '../data/stops';

export const tokenizeTranscript = (text: string) => [...text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:[’'\u2011-][\p{L}\p{M}\p{N}]+)*/gu)];
const normalizeWord = (text: string) => text.normalize('NFC').toLocaleLowerCase('fr').replace(/[^\p{L}\p{N}]/gu, '');

/** Reject mismatched, overlapping or out-of-segment timings. Never create missing times. */
export function getTimedTokens(text: string, words: TimedTranscriptWord[], start: number, end = Infinity) {
  const tokens = tokenizeTranscript(text);
  const mapped = words.map((word, index) => ({ ...word, tokenIndex: word.tokenIndex ?? index }));
  if (words.some((word) => word.tokenIndex === undefined) && words.length !== tokens.length) return [];
  if (mapped.some((word, index) => {
    const previous = mapped[index - 1];
    return !Number.isInteger(word.tokenIndex) || !tokens[word.tokenIndex]
      || normalizeWord(tokens[word.tokenIndex][0]) !== normalizeWord(word.text)
      || !Number.isFinite(word.startSeconds) || !Number.isFinite(word.endSeconds)
      || word.startSeconds < start || word.endSeconds > end || word.endSeconds <= word.startSeconds
      || (previous && (word.tokenIndex <= previous.tokenIndex || word.startSeconds < previous.endSeconds));
  })) return [];
  return mapped;
}

export function getWordState(time: number, word: TimedTranscriptWord) {
  if (time < word.startSeconds) return 'upcoming';
  if (time < word.endSeconds) return 'current';
  return 'read';
}
