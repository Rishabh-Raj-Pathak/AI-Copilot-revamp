import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { playSound } from '../utils/sound';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type VaultControlsVariant = 'default' | 'v2';

interface VaultControlsProps {
  disabled?: boolean;
  amount: string;
  percent: number; // 0 to 100
  maxAmount?: number;
  /** When set, shown after "MAX: " instead of formatting `maxAmount` (e.g. "—"). */
  maxSummary?: string;
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
  inputPlaceholder,
  stretch = false,
  compactInput = false,
  largeSlider = false,
  variant = 'default',
  infoTooltip = DEFAULT_AMOUNT_INFO,
  disabledSliderTooltip,
  onAmountChange, 
  onPercentChange 
}: VaultControlsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Motion value for smooth interpolation when "MAX" is clicked
  const percentMotion = useMotionValue(percent);
  
  // Update motion value when percent prop changes externally (e.g. from state)
  useEffect(() => {
    // If not dragging, animate to the new value
    if (!isDragging.current) {
        animate(percentMotion, percent, {
            type: "spring",
            stiffness: 300,
            damping: 30
        });
    } else {
        percentMotion.set(percent);
    }
  }, [percent, percentMotion]);

  const thumbSizePx = largeSlider ? 20 : 16;
  const trackInsetPx = thumbSizePx / 2;

  // Derived values for styling — thumb travels inset so track caps don't sit under the oval
  const widthPercent = useTransform(percentMotion, (p) => `${p}%`);
  const thumbLeft = useTransform(
    percentMotion,
    (p) => `calc((100% - ${thumbSizePx}px) * ${p} / 100)`,
  );

  const handleMaxClick = () => {
    if (disabled) return;
    playSound('max');
    onAmountChange(maxAmount.toString());
    onPercentChange(100);
  };

  const updateSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newPercent = Math.round((x / rect.width) * 100);
    
    // Only trigger change if value actually changed to avoid spamming
    if (newPercent !== percent) {
       onPercentChange(newPercent);
       if (newPercent === 100) playSound('max');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    playSound('click');
    updateSlider(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    updateSlider(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const isV2 = variant === 'v2';
  const maxLine = maxSummary !== undefined ? maxSummary : maxAmount.toLocaleString();

  const thumbClassName = clsx(
    'absolute z-20 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.28)]',
    largeSlider ? 'top-[1px] h-[20px] w-[20px]' : 'top-[1px] h-[16px] w-[16px]',
    isV2
      ? 'border-[1.5px] border-[#d4af37] bg-gradient-to-b from-[#f5e6c8] to-[#c9a962]'
      : 'border-[0.83px] border-[rgba(232,213,181,0.28)] bg-gradient-to-b from-[#f2ddb5] to-[#ba8f52]',
  );

  const sliderTrack = (
    <>
      <div
        className={clsx(
          'absolute overflow-hidden rounded-full',
          isV2
            ? 'bg-[#2a2a2a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-[#4a4a4a]'
            : 'bg-[rgba(255,255,255,0.14)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-[rgba(255,255,255,0.18)]',
          largeSlider ? 'top-[7px] h-[8px]' : 'top-[6px] h-[6px]',
          disabled && 'opacity-90',
        )}
        style={{
          left: trackInsetPx,
          width: `calc(100% - ${thumbSizePx}px)`,
        }}
      >
        <motion.div
          className={clsx(
            'h-full rounded-full',
            disabled
              ? isV2
                ? 'bg-[#4a4030]'
                : 'bg-[rgba(143,106,51,0.45)]'
              : isV2
                ? 'bg-gradient-to-r from-[#6b5428] to-[#d4af37]'
                : 'bg-gradient-to-r from-[#8f6a33] to-[#d6b06a]',
          )}
          style={{ width: widthPercent }}
        />
      </div>
      <motion.div
        className={thumbClassName}
        style={{ left: thumbLeft }}
        whileHover={disabled ? undefined : { scale: 1.15 }}
        whileTap={disabled ? undefined : { scale: 0.92 }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[#ccb17f] opacity-15 blur-[3px]" />
      </motion.div>
    </>
  );

  const sliderShell = (
    <div
      ref={sliderRef}
      className={clsx(
        largeSlider ? 'h-[22px] relative select-none' : 'h-[18px] relative select-none',
        stretch ? 'w-full' : 'w-[104px]',
        !disabled && 'cursor-pointer group',
        disabled && 'cursor-not-allowed',
      )}
      onMouseDown={handleMouseDown}
    >
      {sliderTrack}
    </div>
  );
  
  return (
    <div
      className={clsx(
        "flex w-full transition-opacity duration-300 opacity-100",
        stretch
          ? "w-full max-tablet:flex-col max-tablet:items-stretch max-tablet:gap-3 tablet:flex-row tablet:items-center tablet:gap-6"
          : "items-center gap-[21px]",
      )}
    >
        {/* Slider row: info stays interactive when disabled */}
        <div className={clsx("flex w-full items-center gap-3", stretch && "min-w-0 flex-1")}>
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
            <div className={clsx(stretch && 'min-w-0 flex-1')}>
              {disabled && disabledSliderTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>{sliderShell}</TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[260px] border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5]"
                  >
                    <p className="text-[11px] leading-relaxed">{disabledSliderTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                sliderShell
              )}
            </div>
        </div>

        {/* Input */}
        <div
          className={clsx(
            "relative flex h-[40px] items-center rounded-[10px] border pl-[12.8px] pr-[0.8px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.03)] transition-all",
            isV2
              ? "border-[#2a2a2a] bg-[#0d0d0d]"
              : "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(18,18,19,0.98)_0%,rgba(11,11,12,0.99)_100%)]",
            stretch
              ? compactInput
                ? "w-[200px] max-tablet:w-full tablet:w-[220px] shrink-0"
                : "w-[240px] max-tablet:w-full tablet:w-[280px] shrink-0"
              : "w-[185px]",
            !disabled && (isV2 ? "hover:border-[#d4af37]/35 focus-within:ring-1 focus-within:ring-[#d4af37]/25" : "hover:border-[rgba(214,176,106,0.3)] focus-within:ring-1 ring-[#ccb17f]/18"),
            disabled && "pointer-events-none opacity-30",
          )}
        >
            <span className={clsx("mr-[6px] font-['Onest',sans-serif] text-[14px] font-medium", isV2 ? 'text-[#d4af37]' : 'text-[#d6b06a]')}>$</span>
            <input 
                type="text" 
                value={amount}
                placeholder={inputPlaceholder}
                onChange={(e) => onAmountChange(e.target.value)}
                disabled={disabled}
                className={clsx(
                  "w-full flex-1 border-none bg-transparent text-right font-['Onest',sans-serif] text-[14px] font-semibold text-[#f0f0f0] outline-none disabled:cursor-not-allowed",
                  "placeholder:text-[rgba(255,255,255,0.35)]",
                )}
            />
            <span className="mb-[2px] ml-[8px] font-['Onest',sans-serif] text-[10px] font-medium tracking-[0.5px] text-[rgba(255,255,255,0.55)]">USDC</span>
            
            {/* Input Divider */}
            <div className="w-[1px] h-[20px] bg-[rgba(255,255,255,0.08)] mx-[8px]" />
            
            <motion.button 
                onClick={handleMaxClick} 
                disabled={disabled}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  "font-['Onest',sans-serif] font-semibold text-[9px] tracking-[0.225px] uppercase w-[54px] text-center cursor-pointer transition-colors disabled:cursor-not-allowed",
                  isV2
                    ? 'text-[#d4af37] hover:text-[#f0e6c8]'
                    : 'text-[#ccb17f] hover:text-[#e8d5b5]',
                )}
            >
                MAX: {maxLine}
            </motion.button>
        </div>
    </div>
  );
}
