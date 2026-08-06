import React, { useState, useRef, useEffect } from 'react';
import { PopularBadge } from './badges/PopularBadge';
import { HighAprBadge } from './badges/HighAprBadge';
import { HighRiskBadge } from './badges/HighRiskBadge';
import { TrendingBadge } from './badges/TrendingBadge';
import { clsx } from 'clsx';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { playSound } from '../utils/sound';
import { Celebration } from './Celebration';
import { BronzeStrip } from './BronzeStrip';
import { WalletAddressLabel } from './WalletAddressLabel';

// Inline "NO FEE" text — BlueChip now uses the strip; only HIP-3 keeps inline label
const NO_FEE_VAULTS = ['HIP-3'];

// Bronze left-strip shown for these vaults
const BRONZE_STRIP_VAULTS = ['BlueChip', 'Trending'];

interface ActivatedVaultCardProps {
  id?: string;
  title: string;
  badge?: 'popular' | 'high_apr' | 'high_risk' | 'trending';
  volume: string;
  apr: string;
  users: string;
  pnl?: string;
  icon?: React.ReactNode;
  source?: string;
  initialAmount: string;
  initialPercent: number;
  walletAddress: string;
  onStop: () => void;
  isNew?: boolean; // Prop to trigger entrance animation/celebration
}

function ActiveBadge() {
  return (
    <div className="bg-[rgba(204,177,127,0.1)] flex gap-[6px] items-center px-[9px] py-[2px] relative rounded-[100px] shrink-0 border-[0.83px] border-[rgba(204,177,127,0.2)] shadow-[0px_0px_10px_0px_rgba(204,177,127,0.15)]">
       <motion.div 
         animate={{ 
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
            boxShadow: ["0px 0px 5px 0px rgba(204,177,127,0.5)", "0px 0px 12px 2px rgba(204,177,127,0.8)", "0px 0px 5px 0px rgba(204,177,127,0.5)"]
         }}
         transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
         className="bg-[#ccb17f] rounded-full size-[6px]" 
       />
       <span className="font-['Onest',sans-serif] font-medium text-[#ccb17f] text-[10px] tracking-[0.5px] uppercase leading-[15px] drop-shadow-[0_0_3px_rgba(204,177,127,0.4)]">
         Active
       </span>
    </div>
  );
}

export function ActivatedVaultCard({ 
  title, 
  badge, 
  volume, 
  apr, 
  users, 
  pnl = "+21.2%",
  icon,
  source,
  initialAmount,
  initialPercent,
  walletAddress,
  onStop,
  isNew = false
}: ActivatedVaultCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(initialAmount);
  const [percent, setPercent] = useState(initialPercent);
  const [showCelebration, setShowCelebration] = useState(isNew);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const showBronzeStrip = BRONZE_STRIP_VAULTS.includes(title);

  // Motion value for smooth interpolation
  const percentMotion = useMotionValue(percent);

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  useEffect(() => {
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

  const widthPercent = useTransform(percentMotion, (p) => `${p}%`);
  const leftPercent = useTransform(percentMotion, (p) => `calc(${p}% - 10px)`);

  const handleMaxClick = () => {
    if (!isEditing) return;
    playSound('max');
    setAmount("0.005");
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
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
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

  const handleEditClick = () => {
    setIsEditing(true);
    playSound('stop'); // "Apply the same sound effect used for Stop to Edit action"
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    playSound('success');
  };

  const handleStopClick = () => {
      playSound('stop');
      onStop();
  };

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative rounded-[20px] w-full overflow-hidden ${showBronzeStrip ? 'pl-[50px]' : 'pl-[24px]'} pr-[24px] pt-[24px] pb-[24px]`}
      style={{ backgroundImage: "linear-gradient(226.746deg, rgba(22, 20, 18, 0.76) 1.9797%, rgba(14, 12, 10, 0.784) 87.36%)" }}
    >
      {showCelebration && <Celebration />}

      {/* Bronze accent strip — BlueChip & Trending only */}
      {showBronzeStrip && <BronzeStrip />}

      {/* Running Border / Pulse Animation for New items */}
      <motion.div 
        aria-hidden="true" 
        className="absolute border-[0.7px] border-solid inset-0 pointer-events-none rounded-[20px] shadow-[0px_0px_15px_-5px_rgba(204,177,127,0.2)]"
        animate={isNew ? { 
            borderColor: ["rgba(120,90,40,0.5)", "rgba(204,177,127,0.8)", "rgba(120,90,40,0.5)"],
            boxShadow: ["0px 0px 15px -5px rgba(204,177,127,0.2)", "0px 0px 25px -2px rgba(204,177,127,0.4)", "0px 0px 15px -5px rgba(204,177,127,0.2)"]
        } : {
            borderColor: "rgba(120,90,40,0.5)",
            boxShadow: "0px 0px 15px -5px rgba(204,177,127,0.2)"
        }}
        transition={isNew ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      />
      
      {/* Running subtle gradient sweep overlay */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
      </div>
      
      <div className="flex flex-col gap-[22px] relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between h-[48px]">
          <div className="flex items-start gap-[12px]">
             <div className="flex items-center gap-2 mt-1 shrink-0">
                 {icon && (
                   <div className="text-[#ccb17f] opacity-80 shrink-0">
                     {icon}
                   </div>
                 )}
             </div>
             <div className="flex flex-col">
               <h3 className="font-['Onest',sans-serif] font-medium text-[20px] leading-[30px] text-[#e8d5b5]">
                 {title}
               </h3>
               {NO_FEE_VAULTS.includes(title) && (
                 <span className="font-['Onest',sans-serif] font-medium text-[#ccb17f] text-[10px] tracking-[0.5px] uppercase leading-[14px] -mt-[2px]">
                   NO FEE
                 </span>
               )}
               <span className="font-['Onest',sans-serif] font-normal text-[12px] leading-[18px] tracking-[0.6px] uppercase text-[#717182]">
                 Automated Strategy
               </span>
               <WalletAddressLabel address={walletAddress} className="mt-1" />
             </div>
          </div>
          <div className="flex items-start justify-end gap-2">
               <ActiveBadge />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />

        {/* Stats */}
        <div className="flex flex-col gap-[16px]">
          {/* Volume */}
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">VOL</span>
            <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] text-[#d4d4d8]">{volume}</span>
          </div>
          {/* APR */}
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">APR</span>
            <span className="font-['Onest',sans-serif] font-bold text-[14px] leading-[21px] text-[#ccb17f]">{apr}</span>
          </div>
          {/* PNL */}
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">PNL</span>
            <span className="font-['Onest',sans-serif] font-bold text-[14px] leading-[21px] text-[#ccb17f]">{pnl}</span>
          </div>
          {/* Users */}
          <div className="flex items-center justify-between h-[21px]">
            <span className="font-['Onest',sans-serif] font-normal text-[14px] leading-[21px] text-[#717182]">Users</span>
            <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] text-[#717182]">{users}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />

        {/* Slider Section */}
        <div className={clsx("flex flex-col gap-[6px] w-full transition-opacity duration-300", !isEditing && "opacity-20 pointer-events-none")}>
            {/* Slider */}
            <div className="flex items-end justify-between h-[40px] w-full">
                <div 
                    ref={sliderRef}
                    className={clsx("relative h-[20px] w-full max-w-[257px]", isEditing && "cursor-pointer")}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={() => isEditing && playSound('hover')}
                >
                     {/* Track */}
                    <div className="absolute top-[7px] left-0 h-[6px] w-full bg-[#1e1b18] rounded-full shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)] border border-[rgba(255,255,255,0.05)] overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-b from-[#5a431e] to-[#785a28] rounded-full" 
                            style={{ width: widthPercent }}
                        />
                    </div>
                    {/* Thumb */}
                    <motion.div 
                        className={clsx("absolute top-0 w-[20px] h-[20px] bg-[#ccb17f] rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,213,181,0.2)]", isEditing && "hover:scale-110 active:scale-110")}
                        style={{ left: leftPercent }}
                    >
                        <div className="absolute inset-0 bg-[#ccb17f] rounded-full blur-[4px] opacity-40" />
                    </motion.div>
                </div>
                <span className="font-['Onest',sans-serif] font-medium text-[18px] leading-[16px] tracking-[0.6px] text-[rgba(255,255,255,0.3)] whitespace-nowrap w-[44px] text-right">
                    {percent}%
                </span>
            </div>

            {/* Input Box */}
            <div className={clsx("w-full h-[50px] bg-[#0c0a08] rounded-[8px] relative flex items-center justify-between px-[12px] shadow-[inset_0px_2px_6px_0px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.05)] transition-all", isEditing && "hover:bg-[#141210] focus-within:ring-1 ring-[#ccb17f]/20")}>
                 <div className="flex items-center gap-[8px] w-full">
                    <span className="font-['Onest',sans-serif] font-medium text-[18px] text-[#ccb17f]">$</span>
                    <input 
                        type="text" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!isEditing}
                        className="bg-transparent border-none outline-none font-['Onest',sans-serif] font-semibold text-[18px] text-[#f0f0f0] text-right w-full disabled:cursor-not-allowed"
                    />
                    <span className="font-['Onest',sans-serif] font-medium text-[18px] text-[rgba(255,255,255,0.3)] tracking-[0.5px]">USDC</span>
                    <div className="w-[1px] h-[20px] bg-[rgba(255,255,255,0.05)] mx-[4px]" />
                    <motion.button 
                        onClick={handleMaxClick}
                        disabled={!isEditing}
                        whileTap={{ scale: 0.95 }}
                        className="font-['Onest',sans-serif] font-semibold text-[14px] text-[#ccb17f] tracking-[0.225px] uppercase whitespace-nowrap hover:text-[#e8d5b5] transition-colors disabled:cursor-not-allowed"
                        onMouseEnter={() => isEditing && playSound('hover')}
                    >
                        MAX: 0.005
                    </motion.button>
                 </div>
            </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between w-full gap-[12px]">
            {isEditing ? (
                /* Save Button */
                <motion.button 
                  onClick={handleSaveClick}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-[45px] rounded-[10px] relative flex items-center justify-center shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] group overflow-hidden cursor-pointer transition-all"
                  style={{ backgroundImage: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(53, 42, 26) 0%, rgb(20, 16, 11) 100%)" }}
                >
                    <div className="absolute inset-0 rounded-[10px] border border-[rgba(120,90,40,0.5)] pointer-events-none" />
                    <div className="absolute inset-0 rounded-[10px] shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] pointer-events-none" />
                    <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] tracking-[0.35px] text-[#bfbfbf] uppercase group-hover:text-white transition-colors">
                        Save
                    </span>
                </motion.button>
            ) : (
                /* Edit Button */
                <motion.button 
                  onClick={handleEditClick}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-[45px] bg-gradient-to-b from-[#14100a] to-[#0a0805] rounded-[10px] relative flex items-center justify-center shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] group overflow-hidden cursor-pointer transition-all"
                >
                     <div className="absolute inset-0 rounded-[10px] border border-[rgba(47,158,133,0.5)] pointer-events-none" />
                     <div className="absolute inset-0 rounded-[10px] shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] pointer-events-none" />
                     <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] tracking-[0.35px] text-[#2f9e85] uppercase group-hover:text-[#3ac9a8] transition-colors">
                         Edit
                     </span>
                </motion.button>
            )}

            {/* Stop Button */}
            <motion.button 
              onClick={handleStopClick}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-[45px] bg-gradient-to-b from-[#14100a] to-[#0a0805] rounded-[10px] relative flex items-center justify-center shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] group overflow-hidden cursor-pointer transition-all"
            >
                 <div className="absolute inset-0 rounded-[10px] border border-[rgba(229,72,77,0.5)] pointer-events-none" />
                 <div className="absolute inset-0 rounded-[10px] shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] pointer-events-none" />
                 <span className="font-['Onest',sans-serif] font-medium text-[14px] leading-[21px] tracking-[0.35px] text-[#e5484d] uppercase group-hover:text-[#ff5c61] transition-colors">
                     Stop
                 </span>
            </motion.button>
        </div>

      </div>
    </motion.div>
  );
}