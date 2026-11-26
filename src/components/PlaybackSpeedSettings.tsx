import React, { useId, useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { MAX_RATE_PERCENT, MIN_RATE_PERCENT, RATE_STEP_PERCENT } from '../audio/playbackRate';
import { experienceText as x } from '../i18n/experienceLabels';
import { t, type SupportedLanguage } from '../i18n/translations';

const PRESETS = [75, 125, 150, 200];

export function PlaybackSpeedSettings({ language, rate, rejected, onRateChange }: {
  language: SupportedLanguage;
  rate: number;
  rejected: boolean;
  onRateChange: (rate: number) => void;
}) {
  const sliderId = useId();
  const formatter = useMemo(() => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [language]);
  const percent = Math.round(rate * 100);
  const step = formatter.format(RATE_STEP_PERCENT / 100);
  const value = formatter.format(rate);
  const speedLabel = t('reading_speed_current', language, { speed: value });

  return <div className="player-rate-settings">
    <div className="player-rate-heading">
      <div>
        <label htmlFor={sliderId}>{t('speed', language)}</label>
        <span className="player-rate-mode">{x(rate === 1 ? 'playbackSpeedNormal' : 'playbackSpeedCustom', language)}</span>
      </div>
      <output htmlFor={sliderId} aria-live="off">{value}×</output>
    </div>
    <div className="player-rate-adjust">
      <button type="button" className="player-secondary-button" disabled={percent <= MIN_RATE_PERCENT} aria-label={x('playbackSpeedSlower', language, { step })} onClick={() => onRateChange((percent - RATE_STEP_PERCENT) / 100)}><Minus size={19} aria-hidden="true" /></button>
      <input id={sliderId} type="range" min={MIN_RATE_PERCENT} max={MAX_RATE_PERCENT} step={RATE_STEP_PERCENT}
        value={percent} aria-valuetext={speedLabel} onChange={(event) => onRateChange(event.currentTarget.valueAsNumber / 100)} />
      <button type="button" className="player-secondary-button" disabled={percent >= MAX_RATE_PERCENT} aria-label={x('playbackSpeedFaster', language, { step })} onClick={() => onRateChange((percent + RATE_STEP_PERCENT) / 100)}><Plus size={19} aria-hidden="true" /></button>
    </div>
    <div className="player-rate-limits" aria-hidden="true"><span>{formatter.format(MIN_RATE_PERCENT / 100)}×</span><span>{formatter.format(MAX_RATE_PERCENT / 100)}×</span></div>
    <div className="player-rate-presets">
      {PRESETS.map((preset) => <button key={preset} type="button" className="player-secondary-button" aria-pressed={percent === preset} onClick={() => onRateChange(preset / 100)}>{formatter.format(preset / 100)}×</button>)}
    </div>
    <button type="button" className="player-rate-reset" onClick={() => onRateChange(1)}>{x('playbackSpeedReset', language, { speed: formatter.format(1) })}</button>
    {rejected && <p className="player-rate-notice" role="status">{x('playbackSpeedUnavailable', language)}</p>}
  </div>;
}
