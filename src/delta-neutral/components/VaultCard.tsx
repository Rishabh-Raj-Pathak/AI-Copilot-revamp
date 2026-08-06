import React, { useState, useRef, useEffect } from 'react';
import { PopularBadge } from './badges/PopularBadge';
import { HighAprBadge } from './badges/HighAprBadge';
import { HighRiskBadge } from './badges/HighRiskBadge';
import { TrendingBadge } from './badges/TrendingBadge';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { playSound } from '../utils/sound';
import { BronzeStrip } from './BronzeStrip';

export interface VaultCardProps {
  id?: string;
  title: string;
  badge?: 'popular' | 'high_apr' | 'high_risk' | 'trending';
  volume: string;
  apr: string;
  users: string;
  icon?: React.ReactNode;
  source?: string;
  onActivate?: (data: { amount: string; percent: number }) => void;
}

// Inline "NO FEE" label — HIP-3 only
const INLINE_NO_FEE_VAULTS = ['HIP-3'];

// Corner sash — BlueChip & Trending
const SASH_VAULTS = ['BlueChip', 'Trending'];

const MAX_AMOUNT = 10000;

export function VaultCard({
  title,
  badge,
  volume,
  apr,
  users,
  icon,
  source,
  onActivate,
}: VaultCardProps) {
  const [amount, setAmount] = useState('5');
  const [percent, setPercent] = useState(0);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const showSash = SASH_VAULTS.includes(title);
  const showInlineNoFee = INLINE_NO_FEE_VAULTS.includes(title);

  // Sync initial percent
  useEffect(() => {
    const initVal = parseFloat('5') || 0;
    setPercent(Math.min(100, Math.max(0, (initVal / MAX_AMOUNT) * 100)));
  }, []);

  const percentMotion = useMotionValue(percent);

  useEffect(() => {
    if (!isDragging.current) {
      animate(percentMotion, percent, { type: 'spring', stiffness: 300, damping: 30 });
    } else {
      percentMotion.set(percent);
    }
  }, [percent, percentMotion]);

  const widthPercent = useTransform(percentMotion, (p) => `${p}%`);
  const leftPercent = useTransform(percentMotion, (p) => `calc(${p}% - 10px)`);

  const handleMaxClick = () => {
    playSound('max');
    setAmount(MAX_AMOUNT.toString());
    setPercent(100);
  };

  const updateSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newPercent = Math.round((x / rect.width) * 100);
    if (newPercent !== percent) {
      setPercent(newPercent);
      if (newPercent === 100) playSound('max');
      const newAmount = MAX_AMOUNT * (newPercent / 100);
      setAmount(newAmount % 1 === 0 ? newAmount.toFixed(0) : newAmount.toFixed(2));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleInputChange = (val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    let numVal = parseFloat(val);
    if (isNaN(numVal)) numVal = 0;
    if (numVal > MAX_AMOUNT) {
      val = MAX_AMOUNT.toString();
      numVal = MAX_AMOUNT;
    }
    setAmount(val);
    if (val === '') {
      setPercent(0);
    } else {
      setPercent(Math.round(Math.min(100, Math.max(0, (numVal / MAX_AMOUNT) * 100))));
    }
  };

  const handleActivateClick = () => {
    playSound('success');
    if (onActivate) {
      onActivate({ amount, percent });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-[20px] w-full overflow-hidden px-[24px] pb-[24px]"
      style={{
        paddingTop: showSash ? '50px' : '24px',
        backgroundImage:
          'linear-gradient(226.746deg, rgba(22, 20, 18, 0.76) 1.9797%, rgba(14, 12, 10, 0.784) 87.36%)',
      }}
    >
      {/* Outer border with glow */}
      <motion.div
        aria-hidden="true"
        className="absolute border-[0.7px] border-[rgba(120,90,40,0.5)] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[0px_0px_15px_-5px_rgba(204,177,127,0.2)]"
        whileHover={{
          borderColor: 'rgba(204,177,127,0.6)',
          boxShadow: '0px 0px 20px -2px rgba(204,177,127,0.3)',
        }}
      />

      {/* Corner sash — BlueChip & Trending */}
      {showSash && (
        <div
          className="absolute top-0 left-0 pointer-events-none rounded-tl-[20px]"
          style={{ width: '90px', height: '90px', overflow: 'hidden', zIndex: 20 }}
        >
          <BronzeStrip variant="corner" />
        </div>
      )}

      <div className="flex flex-col gap-[22px] relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between" style={{ minHeight: '48px' }}>
          <div className="flex items-start gap-[12px]">
            {icon && (
              <div className="text-[#ccb17f] opacity-80 shrink-0 mt-1">{icon}</div>
            )}
            <div className="flex flex-col">
              <h3 className="font-['Onest',sans-serif] font-medium text-[20px] leading-[30px] text-[#e8d5b5]">
                {title}
              </h3>
              {showInlineNoFee && (
                <span className="font-['Onest',sans-serif] font-medium text-[#ccb17f] text-[10px] tracking-[0.5px] uppercase leading-[14px] -mt-[2px]">
                  NO FEE
                </span>
              )}
              <span className="font-['Onest',sans-serif] font-normal text-[12px] leading-[18px] tracking-[0.6px] uppercase text-[#717182]">
                Automated Strategy
              </span>
            </div>
          </div>
          {badge && (
            <div className="flex items-start justify-end">
              {badge === 'popular' && <PopularBadge />}
              {badge === 'high_apr' && <HighAprBadge />}
              {badge === 'high_risk' && <HighRiskBadge />}
              {badge === 'trending' && <TrendingBadge />}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />

        {/* Stats */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">
              VOL
            </span>
            <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] text-[#d4d4d8]">
              {volume}
            </span>
          </div>
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">
              APR
            </span>
            <span className="font-['Onest',sans-serif] font-bold text-[14px] leading-[21px] text-[#ccb17f]">
              {apr}
            </span>
          </div>
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">
              Users
            </span>
            <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] text-[#717182]">
              {users}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />

        {/* Slider Section */}
        <div className="flex flex-col gap-[6px] w-full">
          <div className="flex items-end justify-between h-[40px] w-full">
            <div
              ref={sliderRef}
              className="relative h-[20px] w-full max-w-[257px] cursor-pointer"
              onMouseDown={handleMouseDown}
            >
              {/* Track */}
              <div className="absolute top-[7px] left-0 h-[6px] w-full bg-[#1e1b18] rounded-full border border-[rgba(255,255,255,0.05)] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-b from-[#5a431e] to-[#785a28] rounded-full"
                  style={{ width: widthPercent }}
                />
              </div>
              {/* Thumb */}
              <motion.div
                className="absolute top-0 w-[20px] h-[20px] bg-[#ccb17f] rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,213,181,0.2)]"
                style={{ left: leftPercent }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute inset-0 bg-[#ccb17f] rounded-full blur-[4px] opacity-40" />
              </motion.div>
            </div>
            <span className="font-['Onest',sans-serif] font-medium text-[18px] leading-[16px] tracking-[0.6px] text-[rgba(255,255,255,0.3)] whitespace-nowrap w-[44px] text-right">
              {percent}%
            </span>
          </div>

          {/* Input Box */}
          <div className="w-full h-[50px] bg-[#0c0a08] rounded-[8px] relative flex items-center justify-between px-[12px] shadow-[inset_0px_2px_6px_0px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.05)] hover:bg-[#141210] transition-all">
            <div className="flex items-center gap-[8px] w-full">
              <span className="font-['Onest',sans-serif] font-medium text-[18px] text-[#ccb17f]">$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-transparent border-none outline-none font-['Onest',sans-serif] font-semibold text-[18px] text-[#f0f0f0] text-right w-full"
              />
              <span className="font-['Onest',sans-serif] font-medium text-[18px] text-[rgba(255,255,255,0.3)] tracking-[0.5px]">
                USDC
              </span>
              <div className="w-[1px] h-[20px] bg-[rgba(255,255,255,0.05)] mx-[4px]" />
              <motion.button
                onClick={handleMaxClick}
                whileTap={{ scale: 0.95 }}
                className="font-['Onest',sans-serif] font-semibold text-[14px] text-[#ccb17f] tracking-[0.225px] uppercase whitespace-nowrap hover:text-[#e8d5b5] transition-colors"
              >
                MAX: {MAX_AMOUNT.toLocaleString()}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Activate Button */}
        <motion.button
          onClick={handleActivateClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-[45px] bg-gradient-to-b from-[#14100a] to-[#0a0805] rounded-[10px] relative flex items-center justify-center shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] group overflow-hidden cursor-pointer transition-all"
        >
          <div className="absolute inset-0 rounded-[10px] border border-[rgba(120,90,40,0.4)] pointer-events-none" />
          <div className="absolute inset-0 rounded-[10px] shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] pointer-events-none" />
          <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] tracking-[0.35px] text-[#bfbfbf] uppercase z-10 group-hover:text-white transition-colors">
            Activate
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
