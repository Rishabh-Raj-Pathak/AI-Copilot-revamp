import React from 'react';
import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import { GoldSlider } from './GoldSlider';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type LeverageControlVariant = 'default' | 'v2';

interface LeverageControlProps {
  /** Current multiplier, between `min` and `max`. */
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  variant?: LeverageControlVariant;
  infoTooltip?: string;
  /** Shown when `disabled` on hover over the slider. */
  disabledSliderTooltip?: string;
  onChange: (value: number) => void;
}

export const DEFAULT_LEVERAGE_INFO =
  'Multiplies both legs equally, so the hedge stays delta-neutral. Higher leverage captures more funding but liquidates on a smaller adverse move.';

/** Multiplier → 0–100 track position, and back. */
export function leverageToPercent(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

export function percentToLeverage(percent: number, min: number, max: number) {
  return Math.round(min + (percent / 100) * (max - min));
}

/**
 * Leverage as a continuous track rather than a two-option dropdown — the venues quote a
 * range, not a pair of presets, so the control should let the user land anywhere in it.
 */
export function LeverageControl({
  value,
  min = 1,
  max = 50,
  disabled = false,
  variant = 'default',
  infoTooltip = DEFAULT_LEVERAGE_INFO,
  disabledSliderTooltip,
  onChange,
}: LeverageControlProps) {
  const isV2 = variant === 'v2';
  const percent = leverageToPercent(value, min, max);

  const handleInput = (raw: string) => {
    if (disabled) return;
    const next = Number(raw.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(next)) return;
    onChange(Math.max(min, Math.min(max, next)));
  };

  const slider = (
    <GoldSlider
      percent={percent}
      onPercentChange={(p) => onChange(percentToLeverage(p, min, max))}
      disabled={disabled}
      large
      stretch
      variant={variant}
      maxSound={false}
      ariaLabel="Leverage multiplier"
    />
  );

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-center gap-1.5">
        <p
          className={clsx(
            'text-[11px] uppercase tracking-[1.1px]',
            isV2 ? 'text-[#c9a962]' : 'text-[rgba(227,202,157,0.82)]',
          )}
        >
          Leverage
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Leverage info"
              className={clsx(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-1',
                isV2
                  ? 'border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.1)] text-[#d4af37] hover:border-[rgba(212,175,55,0.6)] hover:bg-[rgba(212,175,55,0.16)] focus-visible:ring-[#d4af37]/35'
                  : 'border-[rgba(204,177,127,0.4)] bg-[rgba(204,177,127,0.1)] text-[#ccb17f] hover:border-[rgba(204,177,127,0.6)] hover:bg-[rgba(204,177,127,0.16)] focus-visible:ring-[#ccb17f]/35',
              )}
            >
              <Info className="h-3 w-3" strokeWidth={2.25} />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5]">
            <p className="whitespace-pre-line text-[11px] leading-relaxed">{infoTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex w-full items-center gap-3 max-tablet:flex-col max-tablet:items-stretch">
        <div className="min-w-0 flex-1">
          {disabled && disabledSliderTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{slider}</div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[260px] border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5]"
              >
                <p className="text-[11px] leading-relaxed">{disabledSliderTooltip}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            slider
          )}
        </div>

        <div
          className={clsx(
            'relative flex h-[44px] w-[168px] shrink-0 items-center rounded-[10px] border px-[12px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] transition-all max-tablet:w-full',
            isV2
              ? 'border-[#2a2a2a] bg-[#0d0d0d]'
              : 'border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(18,18,19,0.98)_0%,rgba(11,11,12,0.99)_100%)]',
            !disabled &&
              (isV2
                ? 'hover:border-[#d4af37]/35 focus-within:ring-1 focus-within:ring-[#d4af37]/25'
                : 'hover:border-[rgba(214,176,106,0.3)] focus-within:ring-1 ring-[#ccb17f]/18'),
            disabled && 'pointer-events-none opacity-30',
          )}
        >
          <div className="flex min-w-0 flex-1 items-center">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Leverage multiplier"
              value={value}
              onChange={(e) => handleInput(e.target.value)}
              disabled={disabled}
              className="w-full min-w-0 border-none bg-transparent text-left font-['Onest',sans-serif] text-[14px] font-semibold text-[#f0f0f0] outline-none disabled:cursor-not-allowed"
            />
            <span
              className={clsx(
                "ml-[4px] font-['Onest',sans-serif] text-[13px] font-medium",
                isV2 ? 'text-[#d4af37]' : 'text-[#d6b06a]',
              )}
            >
              x
            </span>
          </div>

          <div className="mx-[10px] h-[20px] w-[1px] shrink-0 bg-[rgba(255,255,255,0.08)]" />

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(max)}
            className={clsx(
              "shrink-0 cursor-pointer text-center font-['Onest',sans-serif] text-[9px] font-semibold uppercase tracking-[0.225px] transition-colors disabled:cursor-not-allowed",
              isV2 ? 'text-[#d4af37] hover:text-[#f0e6c8]' : 'text-[#ccb17f] hover:text-[#e8d5b5]',
            )}
          >
            MAX: {max}x
          </button>
        </div>
      </div>
    </div>
  );
}
