import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { playSound } from '../utils/sound';

export type GoldSliderVariant = 'default' | 'v2';

type GoldSliderProps = {
  /** Fill position, 0–100. The caller owns whatever that percentage means. */
  percent: number;
  onPercentChange: (value: number) => void;
  disabled?: boolean;
  /** 20px thumb / 8px track instead of 16px / 6px. */
  large?: boolean;
  /** Fill the row instead of sitting at the intrinsic 104px width. */
  stretch?: boolean;
  variant?: GoldSliderVariant;
  /** Sound played when the track is dragged to its far end. */
  maxSound?: boolean;
  ariaLabel?: string;
};

/**
 * The gold track shared by the margin and leverage rows. It only ever speaks in
 * percent — the readout beside it is what turns that into dollars or a multiplier.
 */
export function GoldSlider({
  percent,
  onPercentChange,
  disabled = false,
  large = false,
  stretch = false,
  variant = 'default',
  maxSound = true,
  ariaLabel,
}: GoldSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isV2 = variant === 'v2';

  // Motion value for smooth interpolation when the value jumps (e.g. "MAX" is clicked)
  const percentMotion = useMotionValue(percent);

  useEffect(() => {
    // If not dragging, animate to the new value
    if (!isDragging.current) {
      animate(percentMotion, percent, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    } else {
      percentMotion.set(percent);
    }
  }, [percent, percentMotion]);

  const thumbSizePx = large ? 20 : 16;
  const trackInsetPx = thumbSizePx / 2;

  // Derived values for styling — thumb travels inset so track caps don't sit under the oval
  const widthPercent = useTransform(percentMotion, (p) => `${p}%`);
  const thumbLeft = useTransform(
    percentMotion,
    (p) => `calc((100% - ${thumbSizePx}px) * ${p} / 100)`,
  );

  const updateSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newPercent = Math.round((x / rect.width) * 100);

    // Only trigger change if value actually changed to avoid spamming
    if (newPercent !== percent) {
      onPercentChange(newPercent);
      if (newPercent === 100 && maxSound) playSound('max');
    }
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    isDragging.current = true;
    playSound('click');
    updateSlider(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const thumbClassName = clsx(
    'absolute z-20 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.28)]',
    large ? 'top-[1px] h-[20px] w-[20px]' : 'top-[1px] h-[16px] w-[16px]',
    isV2
      ? 'border-[1.5px] border-[#d4af37] bg-gradient-to-b from-[#f5e6c8] to-[#c9a962]'
      : 'border-[0.83px] border-[rgba(232,213,181,0.28)] bg-gradient-to-b from-[#f2ddb5] to-[#ba8f52]',
  );

  return (
    <div
      ref={sliderRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-disabled={disabled || undefined}
      className={clsx(
        large ? 'h-[22px] relative select-none' : 'h-[18px] relative select-none',
        stretch ? 'w-full' : 'w-[104px]',
        !disabled && 'cursor-pointer group',
        disabled && 'cursor-not-allowed',
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        className={clsx(
          'absolute overflow-hidden rounded-full',
          isV2
            ? 'bg-[#2a2a2a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-[#4a4a4a]'
            : 'bg-[rgba(255,255,255,0.14)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-[rgba(255,255,255,0.18)]',
          large ? 'top-[7px] h-[8px]' : 'top-[6px] h-[6px]',
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
    </div>
  );
}
