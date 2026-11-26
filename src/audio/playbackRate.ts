export const MIN_RATE_PERCENT = 50;
export const MAX_RATE_PERCENT = 300;
export const RATE_STEP_PERCENT = 5;

export function validatePlaybackRate(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  const percent = Math.round(value * 100);
  if (percent < MIN_RATE_PERCENT || percent > MAX_RATE_PERCENT || percent % RATE_STEP_PERCENT !== 0) return;
  // Keep old compatible preferences and tolerate floating-point representation noise.
  if (Math.abs(value * 100 - percent) <= 1e-8) return percent / 100;
}
