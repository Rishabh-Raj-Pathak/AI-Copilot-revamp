import React from 'react';
import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../utils/sound';
import { GoldSlider } from './GoldSlider';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type VaultControlsVariant = 'default' | 'v2';

interface VaultControlsProps {
  disabled?: boolean;
  amount: string;
  percent: number; // 0 to 100
  maxAmount?: number;
  /** When set, shown after "MAX: " instead of formatting `maxAmount` (e.g. "—"). */
  maxSummary?: string;
  /** Eyebrow above the slider row. The info button moves up beside it when set. */
  label?: string;
  /**
   * Adds a percent segment ahead of the dollar figure. Defaults on in the labelled
   * layout; the inline vault rows keep the narrower dollar-only readout.
   */
  showPercent?: boolean;
  inputPlaceholder?: string;
  stretch?: boolean;
  compactInput?: boolean;
  largeSlider?: boolean;
  variant?: VaultControlsVariant;
  infoTooltip?: string;
  /** Shown when `disabled` on hover over the slider (e.g. explain why amount is locked). */
  disabledSliderTooltip?: string;
  onAmountChange: (val: string) => void;
  onPercentChange: (val: number) => void;
}

export const DEFAULT_AMOUNT_INFO =
  'One margin value for all the assets';

export function VaultControls({
  disabled = false,
  amount,
  percent,
  maxAmount = 10000,
  maxSummary,
  label,
  showPercent,
  inputPlaceholder,
  stretch = false,
  compactInput = false,
  largeSlider = false,
  variant = 'default',
  infoTooltip = DEFAULT_AMOUNT_INFO,
  disabledSliderTooltip,
  onAmountChange,
  onPercentChange,
}: VaultControlsProps) {
  const isV2 = variant === 'v2';
  const maxLine = maxSummary !== undefined ? maxSummary : maxAmount.toLocaleString();
  const withPercent = showPercent ?? Boolean(label);

  const handleMaxClick = () => {
    if (disabled) return;
    playSound('max');
    onAmountChange(maxAmount.toString());
    onPercentChange(100);
  };

  const handlePercentInput = (raw: string) => {
    if (disabled) return;
    const next = Number(raw.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(next)) return;
    onPercentChange(Math.max(0, Math.min(100, next)));
  };

  const infoButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Vault amount info"
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
  );

  const slider = (
    <GoldSlider
      percent={percent}
      onPercentChange={onPercentChange}
      disabled={disabled}
      large={largeSlider}
      stretch={stretch}
      variant={variant}
      ariaLabel={label ?? 'Vault amount'}
    />
  );

  const sliderCell = (
    <div className={clsx(stretch && 'min-w-0 flex-1')}>
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
  );

  const segmentDivider = (
    <div className="mx-[10px] h-[20px] w-[1px] shrink-0 bg-[rgba(255,255,255,0.08)]" />
  );

  const readout = (
    <div
      className={clsx(
        'relative flex items-center rounded-[10px] border px-[12px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] transition-all',
        withPercent ? 'h-[44px]' : 'h-[40px]',
        isV2
          ? 'border-[#2a2a2a] bg-[#0d0d0d]'
          : 'border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(18,18,19,0.98)_0%,rgba(11,11,12,0.99)_100%)]',
        stretch
          ? compactInput
            ? 'w-[248px] max-tablet:w-full tablet:w-[248px] shrink-0'
            : 'w-[280px] max-tablet:w-full tablet:w-[280px] shrink-0'
          : 'w-[185px]',
        !disabled &&
          (isV2
            ? 'hover:border-[#d4af37]/35 focus-within:ring-1 focus-within:ring-[#d4af37]/25'
            : 'hover:border-[rgba(214,176,106,0.3)] focus-within:ring-1 ring-[#ccb17f]/18'),
        disabled && 'pointer-events-none opacity-30',
      )}
    >
      {/* Percent of the deployable max — the same value the track is showing. */}
      {withPercent && (
        <>
          <div className="flex min-w-0 flex-1 items-center">
            <span
              className={clsx(
                "mr-[6px] font-['Onest',sans-serif] text-[13px] font-medium",
                isV2 ? 'text-[#d4af37]' : 'text-[#d6b06a]',
              )}
            >
              %
            </span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Percent of max"
              value={percent}
              onChange={(e) => handlePercentInput(e.target.value)}
              disabled={disabled}
              className="w-full min-w-0 border-none bg-transparent text-left font-['Onest',sans-serif] text-[14px] font-semibold text-[#f0f0f0] outline-none disabled:cursor-not-allowed"
            />
          </div>
          {segmentDivider}
        </>
      )}

      {/* The dollar figure that percent resolves to. */}
      <div className="flex min-w-0 flex-1 items-center">
        <span
          className={clsx(
            "mr-[6px] font-['Onest',sans-serif] text-[13px] font-medium",
            isV2 ? 'text-[#d4af37]' : 'text-[#d6b06a]',
          )}
        >
          $
        </span>
        <input
          type="text"
          aria-label="Vault amount"
          value={amount}
          placeholder={inputPlaceholder}
          onChange={(e) => onAmountChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            "w-full min-w-0 border-none bg-transparent font-['Onest',sans-serif] text-[14px] font-semibold text-[#f0f0f0] outline-none disabled:cursor-not-allowed",
            withPercent ? 'text-left' : 'text-right',
            'placeholder:text-[rgba(255,255,255,0.35)]',
          )}
        />
        {!withPercent && (
          <span className="mb-[2px] ml-[8px] font-['Onest',sans-serif] text-[10px] font-medium tracking-[0.5px] text-[rgba(255,255,255,0.55)]">
            USDC
          </span>
        )}
      </div>

      {segmentDivider}

      <motion.button
        onClick={handleMaxClick}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        className={clsx(
          "shrink-0 cursor-pointer text-center font-['Onest',sans-serif] text-[9px] font-semibold uppercase tracking-[0.225px] transition-colors disabled:cursor-not-allowed",
          !withPercent && 'w-[54px]',
          isV2 ? 'text-[#d4af37] hover:text-[#f0e6c8]' : 'text-[#ccb17f] hover:text-[#e8d5b5]',
        )}
      >
        MAX: {maxLine}
      </motion.button>
    </div>
  );

  // Labelled layout: eyebrow on its own row, slider and readout side by side beneath it.
  if (label) {
    return (
      <div className="w-full transition-opacity duration-300 opacity-100">
        <div className="mb-2.5 flex items-center gap-1.5">
          <p
            className={clsx(
              'text-[11px] uppercase tracking-[1.1px]',
              isV2 ? 'text-[#c9a962]' : 'text-[rgba(227,202,157,0.82)]',
            )}
          >
            {label}
          </p>
          {infoButton}
        </div>
        <div className="flex w-full items-center gap-3 max-tablet:flex-col max-tablet:items-stretch">
          {sliderCell}
          {readout}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex w-full transition-opacity duration-300 opacity-100',
        stretch
          ? 'w-full max-tablet:flex-col max-tablet:items-stretch max-tablet:gap-3 tablet:flex-row tablet:items-center tablet:gap-6'
          : 'items-center gap-[21px]',
      )}
    >
      <div className={clsx('flex w-full items-center gap-3', stretch && 'min-w-0 flex-1')}>
        {infoButton}
        {sliderCell}
      </div>
      {readout}
    </div>
  );
}
