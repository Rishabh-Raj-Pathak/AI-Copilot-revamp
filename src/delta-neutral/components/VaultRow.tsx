import React, { useState } from 'react';
import { PopularBadge } from './badges/PopularBadge';
import { HighAprBadge } from './badges/HighAprBadge';
import { HighRiskBadge } from './badges/HighRiskBadge';
import { TrendingBadge } from './badges/TrendingBadge';
import { VaultControls } from './VaultControls';
import { motion } from 'motion/react';
import { playSound } from '../utils/sound';
import { BronzeStrip } from './BronzeStrip';

export interface VaultRowProps {
  id?: string;
  title: string;
  badge?: 'popular' | 'high_apr' | 'high_risk' | 'trending';
  volume: string;
  apr: string;
  users: string;
  icon?: React.ReactNode;
  source?: string;
  onActivate?: (data: { amount: string, percent: number }) => void;
}

function StatColumn({ label, value, valueColor = "text-[#d4d4d8]", valueWeight = "font-medium" }: { label: string, value: string, valueColor?: string, valueWeight?: string }) {
  return (
    <div className="w-[80px] h-[37px] flex flex-col gap-[2px] items-start shrink-0">
      <span className="font-['Arial',sans-serif] text-[#717182] text-[10px] tracking-[0.5px] uppercase leading-[15px]">
        {label}
      </span>
      <span className={`font-['Onest',sans-serif] ${valueWeight} ${valueColor} text-[14px] leading-[20px]`}>
        {value}
      </span>
    </div>
  );
}

const NO_FEE_VAULTS = ['HIP-3'];

// Bronze left-strip shown for these vaults
const BRONZE_STRIP_VAULTS = ['BlueChip', 'Trending'];

const MAX_AMOUNT = 10000;

export function VaultRow({ title, badge, volume, apr, users, icon, source, onActivate }: VaultRowProps) {
  const [amount, setAmount] = useState("5");
  const [percent, setPercent] = useState(0);

  const showBronzeStrip = BRONZE_STRIP_VAULTS.includes(title);

  // Sync state on mount (optional, or just init correctly)
  React.useEffect(() => {
     // If we start with 5, percent should be (5/10000)*100 = 0.05
     // But for prototype visual, let's just respect the defaults or sync them
     const initVal = parseFloat(amount) || 0;
     setPercent(Math.min(100, Math.max(0, (initVal / MAX_AMOUNT) * 100)));
  }, []);

  const handleAmountChange = (val: string) => {
    // Allow only numbers and decimals
    if (!/^\d*\.?\d*$/.test(val)) return;
    
    let numVal = parseFloat(val);
    if (isNaN(numVal)) numVal = 0;

    // Check Max
    if (numVal > MAX_AMOUNT) {
        val = MAX_AMOUNT.toString();
        numVal = MAX_AMOUNT;
    }

    setAmount(val);
    
    // Update percent
    // If val is empty, percent is 0
    if (val === '') {
        setPercent(0);
    } else {
        const newPercent = Math.min(100, Math.max(0, (numVal / MAX_AMOUNT) * 100));
        setPercent(Math.round(newPercent)); // Round for slider integer
    }
  };

  const handlePercentChange = (val: number) => {
    setPercent(val);
    // Update amount
    const newAmount = (MAX_AMOUNT * (val / 100));
    // Format to cleaner string (max 2 decimals usually sufficient)
    setAmount(newAmount % 1 === 0 ? newAmount.toFixed(0) : newAmount.toFixed(2));
  };

  const handleActivateClick = () => {
    playSound('success');
    if (onActivate) {
      onActivate({ amount, percent });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.002, zIndex: 10 }}
      transition={{ duration: 0.2 }}
      className="w-full h-[72.45px] relative shrink-0"
    >
       {/* Background Container */}
      <motion.div 
        className={`w-full h-full relative rounded-[inherit] overflow-hidden flex items-center ${showBronzeStrip ? 'pl-[42px]' : 'pl-[16px]'} pr-[16px]`}
        style={{ 
          background: "linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.4) 100%), linear-gradient(90deg, rgb(12, 12, 12) 0%, rgb(12, 12, 12) 100%)",
          boxShadow: "0px 4px 20px -5px rgba(0,0,0,0.5)"
        }}
        whileHover={{
            backgroundColor: "rgba(22, 20, 18, 0.8)",
            boxShadow: "0px 4px 25px -5px rgba(0,0,0,0.7)"
        }}
      >
        {/* Top Highlight Border */}
        <div className="absolute inset-0 border-t border-[rgba(255,255,255,0.03)] pointer-events-none rounded-[inherit]" />
        
        {/* Hover Border Glow */}
        <motion.div 
            className="absolute inset-0 border border-[rgba(120,90,40,0.3)] opacity-0 rounded-[inherit] pointer-events-none"
            whileHover={{ opacity: 1 }}
        />

        {/* Bronze accent strip — BlueChip & Trending only */}
        {showBronzeStrip && <BronzeStrip />}

        <div className="w-full flex items-center justify-between relative z-10">
            {/* Left Section: Title & Subtext */}
            <div className="w-[200px] flex items-center gap-[12px] shrink-0">
                <div className="flex items-center gap-2">
                    {icon && (
                      <div className="flex-shrink-0 text-[#ccb17f] opacity-80">
                        {icon}
                      </div>
                    )}
                </div>
                <div className="flex flex-col gap-[1px] items-start">
                    <div className="flex items-center gap-[6px]">
                        <span className="font-['Onest',sans-serif] font-medium text-[#e8d5b5] text-[16px] leading-[20px]">
                            {title}
                        </span>
                        {badge === 'popular' && <PopularBadge />}
                        {badge === 'high_apr' && <HighAprBadge />}
                        {badge === 'high_risk' && <HighRiskBadge />}
                        {badge === 'trending' && <TrendingBadge />}
                    </div>
                    {NO_FEE_VAULTS.includes(title) && (
                      <span className="font-['Onest',sans-serif] font-medium text-[#ccb17f] text-[9px] tracking-[0.5px] uppercase leading-[13px]">
                        NO FEE
                      </span>
                    )}
                    <span className="font-['Onest',sans-serif] font-normal text-[#717182] text-[11px] tracking-[0.275px] uppercase leading-[16.5px]">
                        Automated Strategy
                    </span>
                </div>
            </div>

            {/* Vertical Divider 1 */}
            <div className="w-[1px] h-[32px] bg-[rgba(255,255,255,0.05)] mx-4" />

            {/* Middle Section: Stats */}
            <div className="flex items-center gap-[32px] w-[304px] shrink-0">
                <StatColumn label="Volume" value={volume} />
                <StatColumn label="APR" value={apr} valueColor="text-[#ccb17f]" valueWeight="font-bold" />
                <StatColumn label="Users" value={users} valueColor="text-[#717182]" />
            </div>

            {/* Right Section: Controls */}
             <div className="flex items-center gap-[21px] ml-auto">
                {/* Vault Controls (Slider + Input) - Always enabled for VaultRow */}
                <VaultControls 
                  disabled={false} 
                  amount={amount}
                  percent={percent}
                  maxAmount={MAX_AMOUNT}
                  onAmountChange={handleAmountChange}
                  onPercentChange={handlePercentChange}
                />

                {/* Vertical Divider 2 */}
                <div className="w-[1px] h-[32px] bg-[rgba(255,255,255,0.05)]" />

                {/* Activate Button */}
                <motion.button 
                    onClick={handleActivateClick}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-[120px] h-[37px] relative rounded-[10px] flex items-center justify-center cursor-pointer group transition-all"
                    style={{
                        backgroundImage: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)"
                    }}
                >
                    <div className="absolute inset-0 border-[0.83px] border-[rgba(120,90,40,0.2)] rounded-[10px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] pointer-events-none group-hover:border-[rgba(120,90,40,0.4)] transition-colors" />
                    <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] rounded-[10px] pointer-events-none" />
                    <span className="font-['Onest',sans-serif] font-medium text-[13px] text-[#bfbfbf] tracking-[0.35px] uppercase group-hover:text-white transition-colors">
                        ACTIVATE
                    </span>
                </motion.button>
             </div>
        </div>
      </motion.div>
    </motion.div>
  );
}