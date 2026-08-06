import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Activity } from 'lucide-react';
import { DexLabel } from './DexLogo';
import type { ManagedDexId } from './ActiveVaultCard';

interface DeltaNeutralVaultRowProps {
  pair: string;
  totalPositionValue: string;
  fundingRate: string;
  dexA: { name: string; amount: string };
  dexB: { name: string; amount: string };
  historicalFunding: { period: string; rate: string }[];
  onActivate?: () => void;
}

// SVG paths for icons
const chevronPath = "M0.625 0.625L5.625 5.625L10.625 0.625";
const dropdownArrowPath = "M2.99805 4.49708L5.9961 7.49513L8.99415 4.49708";

export function DeltaNeutralVaultRow({
  pair,
  totalPositionValue,
  fundingRate,
  dexA,
  dexB,
  historicalFunding,
  onActivate
}: DeltaNeutralVaultRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDexA, setSelectedDexA] = useState('Hyperliquid');
  const [selectedDexB, setSelectedDexB] = useState('Pacifica');
  const [dexADropdownOpen, setDexADropdownOpen] = useState(false);
  const [dexBDropdownOpen, setDexBDropdownOpen] = useState(false);
  const [initializePopoverOpen, setInitializePopoverOpen] = useState(false);
  const [initializingDex, setInitializingDex] = useState<string>('');
  const [amount, setAmount] = useState('5');
  const [percent, setPercent] = useState(0);
  const [selectedLeverage, setSelectedLeverage] = useState<'3x' | '5x'>('3x');

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dexARef = useRef<HTMLDivElement>(null);
  const dexBRef = useRef<HTMLDivElement>(null);

  const MAX_AMOUNT = 10000;

  // Mock connection status - in real app, this would come from wallet/account context
  const [dexConnectionStatus, setDexConnectionStatus] = useState<Record<string, boolean>>({
    'Hyperliquid': true,
    'Pacifica': false,
    'Nado': true,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dexARef.current && !dexARef.current.contains(event.target as Node)) {
        setDexADropdownOpen(false);
      }
      if (dexBRef.current && !dexBRef.current.contains(event.target as Node)) {
        setDexBDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Slider handlers
  const updateSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newPercent = Math.round((x / rect.width) * 100);

    if (newPercent !== percent) {
      setPercent(newPercent);
      const newAmount = MAX_AMOUNT * (newPercent / 100);
      setAmount(newAmount % 1 === 0 ? newAmount.toFixed(0) : newAmount.toFixed(2));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
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

  const handleAmountChange = (val: string) => {
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

  // Determine button state based on DEX connections (Sequential Logic)
  const dexAConnected = dexConnectionStatus[selectedDexA];
  const dexBConnected = dexConnectionStatus[selectedDexB];

  const getButtonState = () => {
    // Step 1: Check DEX #1 (Left Dropdown)
    if (!dexAConnected) {
      return {
        type: 'connect',
        label: `CONNECT ${selectedDexA.toUpperCase()}`,
        targetDex: selectedDexA
      };
    }

    // Step 2: Check DEX #2 (Right Dropdown) - only if DEX #1 is connected
    if (!dexBConnected) {
      return {
        type: 'connect',
        label: `CONNECT ${selectedDexB.toUpperCase()}`,
        targetDex: selectedDexB
      };
    }

    // Step 3: Both connected - ready to activate
    return {
      type: 'activate',
      label: 'ACTIVATE',
      targetDex: null
    };
  };

  const buttonState = getButtonState();

  const handleConnect = (dex: string) => {
    setInitializingDex(dex);
    setInitializePopoverOpen(true);
  };

  const handleConnectSuccess = () => {
    // Update connection status for the specific DEX
    setDexConnectionStatus(prev => ({ ...prev, [initializingDex]: true }));
    setInitializePopoverOpen(false);
    setInitializingDex('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[14px]"
      style={{ position: 'relative', zIndex: (dexADropdownOpen || dexBDropdownOpen || initializePopoverOpen) ? 99 : 1 }}
    >
      {/* Main Row - Always Visible */}
      <motion.div
        whileHover={{ backgroundColor: 'rgba(22, 20, 18, 0.8)' }}
        className="w-full relative cursor-pointer transition-colors rounded-[14px] px-[16px] py-[16px]"
        style={{
          background: 'linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.4) 100%), linear-gradient(90deg, rgb(12, 12, 12) 0%, rgb(12, 12, 12) 100%)',
          boxShadow: '0px 4px 20px 0px rgba(0,0,0,0.5)',
          overflow: 'visible'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="absolute inset-0 border-t border-[rgba(255,255,255,0.03)] pointer-events-none rounded-[inherit]" />

        <div className="w-full flex items-center gap-[32px] relative z-10">
          {/* Chevron + DEX Dropdowns */}
          <div className="flex items-center gap-[15.99px] shrink-0">
            {/* Chevron Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-[12px] h-[7px] cursor-pointer shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.25 6.25">
                <path d={chevronPath} stroke="#CCB17F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              </svg>
            </motion.div>

            {/* DEX Selectors Container */}
            <div className="flex items-center gap-0 relative">
              {/* Arrow Separator (positioned absolutely) */}
              <div className="absolute left-[140.25px] top-[7.5px]">
                <p className="font-['Onest',sans-serif] font-light text-[14px] text-[#717182]">↔</p>
              </div>

              {/* DEX A Button - Hyperliquid */}
              <div className="relative" ref={dexARef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDexADropdownOpen(!dexADropdownOpen);
                    setDexBDropdownOpen(false);
                  }}
                  className="h-[35.99px] w-[130.247px] rounded-[8px] relative overflow-hidden flex items-center"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.8) 100%)',
                  }}
                >
                  <div className="absolute inset-0 border-[0.833px] border-[rgba(120,90,40,0.2)] rounded-[8px] pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.03)] rounded-[8px] pointer-events-none" />

                  {/* Status Dot */}
                  <motion.div
                    className={`absolute left-[11.99px] top-[15px] w-[5.99px] h-[5.99px] rounded-full ${dexAConnected ? 'bg-[#4ade80]' : 'bg-[#71717a]'}`}
                    animate={dexAConnected ? {
                      boxShadow: [
                        '0px 0px 11.988px 0px rgba(74,222,128,0.9)',
                        '0px 0px 8px 0px rgba(74,222,128,0.6)',
                        '0px 0px 11.988px 0px rgba(74,222,128,0.9)'
                      ]
                    } : {
                      boxShadow: '0px 0px 4px 0px rgba(113,113,130,0.4)'
                    }}
                    transition={dexAConnected ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                  />

                  <div className="absolute left-[22px] top-1/2 flex -translate-y-1/2 items-center gap-1.5 font-['Onest',sans-serif] text-[13px] font-medium text-[#e8d5b5] tracking-[0.2px]">
                    <DexLabel dex={selectedDexA as ManagedDexId} />
                  </div>

                  {/* Dropdown Icon */}
                  <div className="absolute left-[106.26px] top-[11.99px] w-[11.992px] h-[11.992px] opacity-60">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9922 11.9922">
                      <path d={dropdownArrowPath} stroke="#CCB17F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.749512" />
                    </svg>
                  </div>
                </button>

                {dexADropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-[180px] rounded-md shadow-[0px_8px_24px_rgba(0,0,0,0.9)] overflow-hidden"
                    style={{
                      zIndex: 1000,
                      background: 'rgba(10, 10, 10, 0.98)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(36, 36, 36, 1)'
                    }}
                  >
                    {['Hyperliquid', 'Pacifica', 'Nado'].map((dex) => (
                      <button
                        key={dex}
                        className="block w-full text-left px-4 py-2.5 font-['Onest',sans-serif] font-medium text-[13px] text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDexA(dex);
                          setDexADropdownOpen(false);
                        }}
                      >
                        <motion.div
                          className={`w-[6px] h-[6px] rounded-full ${dexConnectionStatus[dex] ? 'bg-[#4ade80]' : 'bg-[#71717a]'}`}
                          animate={dexConnectionStatus[dex] ? {
                            boxShadow: [
                              '0 0 8px rgba(74, 222, 128, 0.6)',
                              '0 0 12px rgba(74, 222, 128, 0.9)',
                              '0 0 8px rgba(74, 222, 128, 0.6)'
                            ]
                          } : {
                            boxShadow: '0 0 4px rgba(113, 113, 130, 0.4)'
                          }}
                          transition={dexConnectionStatus[dex] ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          } : {}}
                        />
                        <DexLabel dex={dex as ManagedDexId} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DEX B Button - Pacifica */}
              <div className="relative ml-[34px]" ref={dexBRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDexBDropdownOpen(!dexBDropdownOpen);
                    setDexADropdownOpen(false);
                  }}
                  className="h-[35.99px] w-[107.396px] rounded-[8px] relative overflow-hidden flex items-center"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.8) 100%)',
                  }}
                >
                  <div className="absolute inset-0 border-[0.833px] border-[rgba(120,90,40,0.2)] rounded-[8px] pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.03)] rounded-[8px] pointer-events-none" />

                  {/* Status Dot */}
                  <motion.div
                    className={`absolute left-[11.99px] top-[15px] w-[5.99px] h-[5.99px] rounded-full ${dexBConnected ? 'bg-[#4ade80]' : 'bg-[#71717a]'}`}
                    animate={dexBConnected ? {
                      boxShadow: [
                        '0px 0px 11.988px 0px rgba(74,222,128,0.9)',
                        '0px 0px 8px 0px rgba(74,222,128,0.6)',
                        '0px 0px 11.988px 0px rgba(74,222,128,0.9)'
                      ]
                    } : {
                      boxShadow: '0px 0px 4px 0px rgba(113,113,130,0.4)'
                    }}
                    transition={dexBConnected ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                  />

                  <div className="absolute left-[22px] top-1/2 flex -translate-y-1/2 items-center gap-1.5 font-['Onest',sans-serif] text-[13px] font-medium text-[#e8d5b5] tracking-[0.2px]">
                    <DexLabel dex={selectedDexB as ManagedDexId} />
                  </div>

                  {/* Dropdown Icon */}
                  <div className="absolute left-[83.41px] top-[11.99px] w-[11.992px] h-[11.992px] opacity-60">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9922 11.9922">
                      <path d={dropdownArrowPath} stroke="#CCB17F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.749512" />
                    </svg>
                  </div>
                </button>

                {dexBDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-[180px] rounded-md shadow-[0px_8px_24px_rgba(0,0,0,0.9)] overflow-hidden"
                    style={{
                      zIndex: 1000,
                      background: 'rgba(10, 10, 10, 0.98)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(36, 36, 36, 1)'
                    }}
                  >
                    {['Hyperliquid', 'Pacifica', 'Nado'].map((dex) => (
                      <button
                        key={dex}
                        className="block w-full text-left px-4 py-2.5 font-['Onest',sans-serif] font-medium text-[13px] text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDexB(dex);
                          setDexBDropdownOpen(false);
                        }}
                      >
                        <motion.div
                          className={`w-[6px] h-[6px] rounded-full ${dexConnectionStatus[dex] ? 'bg-[#4ade80]' : 'bg-[#71717a]'}`}
                          animate={dexConnectionStatus[dex] ? {
                            boxShadow: [
                              '0 0 8px rgba(74, 222, 128, 0.6)',
                              '0 0 12px rgba(74, 222, 128, 0.9)',
                              '0 0 8px rgba(74, 222, 128, 0.6)'
                            ]
                          } : {
                            boxShadow: '0 0 4px rgba(113, 113, 130, 0.4)'
                          }}
                          transition={dexConnectionStatus[dex] ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          } : {}}
                        />
                        <DexLabel dex={dex as ManagedDexId} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[0.99px] h-[40px] bg-[rgba(255,255,255,0.05)] shrink-0" onClick={(e) => e.stopPropagation()} />

          {/* Funding APR */}
          <div className="flex flex-col gap-[7.995px] items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="font-['Arial',sans-serif] text-[10px] text-[#717182] tracking-[0.5px] uppercase">
              Funding APR
            </p>
            <p className="font-['Onest',sans-serif] font-bold text-[13px] text-[#ccb17f]">
              {fundingRate}
            </p>
          </div>

          {/* Divider */}
          <div className="w-[0.99px] h-[40px] bg-[rgba(255,255,255,0.05)] shrink-0" onClick={(e) => e.stopPropagation()} />

          {/* Leverage */}
          <div className="flex flex-col gap-[7.995px] items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="font-['Arial',sans-serif] text-[9px] text-[#717182] tracking-[0.5px] uppercase">
              Leverage
            </p>
            <div className="flex gap-[8px]">
              {/* 3x Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLeverage('3x');
                }}
                className="h-[21px] w-[36px] rounded-[6px] relative flex items-center justify-center"
                style={{
                  backgroundImage: selectedLeverage === '3x'
                    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)'
                    : 'linear-gradient(90deg, rgba(22, 20, 18, 0.4) 0%, rgba(14, 12, 10, 0.4) 100%)'
                }}
              >
                {selectedLeverage === '3x' && (
                  <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.03)] rounded-[6px] pointer-events-none" />
                )}
                <div className={`absolute inset-0 border-[0.83px] ${
                  selectedLeverage === '3x'
                    ? 'border-[rgba(120,90,40,0.5)]'
                    : 'border-[rgba(120,90,40,0.2)]'
                } rounded-[6px] pointer-events-none`} />
                <p className={`font-['Onest',sans-serif] font-semibold text-[11px] tracking-[0.4px] uppercase ${
                  selectedLeverage === '3x' ? 'text-[#e8d5b5]' : 'text-[#717182]'
                }`}>
                  3x
                </p>
              </button>

              {/* 5x Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLeverage('5x');
                }}
                className="h-[21px] w-[36px] rounded-[6px] relative flex items-center justify-center"
                style={{
                  backgroundImage: selectedLeverage === '5x'
                    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)'
                    : 'linear-gradient(90deg, rgba(22, 20, 18, 0.4) 0%, rgba(14, 12, 10, 0.4) 100%)'
                }}
              >
                {selectedLeverage === '5x' && (
                  <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.03)] rounded-[6px] pointer-events-none" />
                )}
                <div className={`absolute inset-0 border-[0.83px] ${
                  selectedLeverage === '5x'
                    ? 'border-[rgba(120,90,40,0.5)]'
                    : 'border-[rgba(120,90,40,0.2)]'
                } rounded-[6px] pointer-events-none`} />
                <p className={`font-['Onest',sans-serif] font-semibold text-[11px] tracking-[0.4px] uppercase ${
                  selectedLeverage === '5x' ? 'text-[#e8d5b5]' : 'text-[#717182]'
                }`}>
                  5x
                </p>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[0.99px] h-[40px] bg-[rgba(255,255,255,0.05)] shrink-0" onClick={(e) => e.stopPropagation()} />

          {/* Slider + Percentage */}
          <div className="flex items-center gap-[12px] shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Slider Container */}
            <div
              ref={sliderRef}
              className="w-[104px] h-[16px] relative select-none cursor-pointer"
              onMouseDown={handleMouseDown}
            >
              {/* Track */}
              <div className="absolute top-[6px] left-[7.99px] w-[103.997px] h-[3.997px] bg-[#1e1b18] rounded-full border-[0.833px] border-[rgba(255,255,255,0.05)] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="absolute left-[0.833px] top-[0.833px] right-[103.164px] bottom-[0.833px]">
                  <div
                    className="h-[2.331px] bg-gradient-to-b from-[#5a431e] via-[#694e23] to-[#785a28] rounded-full"
                    style={{ width: `calc(${percent}% * 103.997 / 100)` }}
                  />
                </div>
              </div>

              {/* Thumb */}
              <div
                className="absolute top-0 w-[15.99px] h-[15.99px] bg-[#ccb17f] rounded-full border-[0.833px] border-[rgba(232,213,181,0.2)] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] z-10"
                style={{ left: `calc(${percent}% * 103.997 / 100)` }}
              >
                <div className="absolute inset-[0.833px] bg-[#ccb17f] rounded-full blur-[4px] opacity-40" />
              </div>
            </div>

            {/* Percentage Label */}
            <div className="w-[32px] shrink-0">
              <p className="font-['Onest',sans-serif] font-medium text-[12px] text-white text-right">
                {percent}%
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="w-[185px] h-[33.997px] bg-[#0c0a08] rounded-[8px] relative flex items-center shadow-[inset_0px_2px_6px_0px_rgba(0,0,0,0.4)] shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 border-[0.833px] border-[rgba(255,255,255,0.05)] rounded-[8px] pointer-events-none" />

            {/* $ Symbol */}
            <p className="absolute left-[12.8px] top-[6.5px] font-['Onest',sans-serif] font-medium text-[14px] text-[#ccb17f]">
              $
            </p>

            {/* Input */}
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="absolute left-[28.01px] top-[6.5px] w-[46.914px] bg-transparent border-none outline-none font-['Onest',sans-serif] font-semibold text-[14px] text-[#f0f0f0] text-right"
            />

            {/* USDC Label */}
            <p className="absolute left-[82.92px] top-[8.5px] font-['Onest',sans-serif] font-medium text-[10px] text-[rgba(255,255,255,0.3)] tracking-[0.5px]">
              USDC
            </p>

            {/* Divider */}
            <div className="absolute left-[121.22px] top-[6.99px] w-[0.99px] h-[20px] bg-[rgba(255,255,255,0.05)]" />

            {/* MAX Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAmount(MAX_AMOUNT.toString());
                setPercent(100);
              }}
              className="absolute left-[130.21px] top-[3.5px] h-[26.979px] w-[53.997px] flex items-center justify-center"
            >
              <p className="font-['Onest',sans-serif] font-semibold text-[9px] text-[#ccb17f] tracking-[0.225px] uppercase text-center">
                MAX: {MAX_AMOUNT.toLocaleString()}
              </p>
            </button>
          </div>

          {/* Divider */}
          <div className="w-[0.99px] h-[31.992px] bg-[rgba(255,255,255,0.05)] shrink-0" onClick={(e) => e.stopPropagation()} />

          {/* Connect/Activate Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (buttonState.type === 'activate') {
                onActivate?.();
              } else {
                // Trigger connection flow for specific DEX
                handleConnect(buttonState.targetDex);
              }
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="w-[120px] h-[40px] relative rounded-[10px] flex items-center justify-center cursor-pointer shrink-0 px-[12px] py-[1px]"
            style={{
              backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)'
            }}
          >
            <div className="absolute inset-0 border-[0.833px] border-[rgba(120,90,40,0.2)] rounded-[10px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.5)] pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.05)] rounded-[10px] pointer-events-none" />

            {/* Text with smooth cross-fade transition */}
            <AnimatePresence mode="wait">
              <motion.p
                key={buttonState.label}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="font-['Onest',sans-serif] font-medium text-[13px] tracking-[0.35px] uppercase text-[#bfbfbf] text-center"
              >
                {buttonState.label}
              </motion.p>
            </AnimatePresence>
          </motion.button>

          {/* Connection Popover - Positioned relative to button */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence>
              {initializePopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-[300px] rounded-[12px] p-[20px] shadow-[0px_8px_24px_rgba(0,0,0,0.9)]"
                  style={{
                    zIndex: 1000,
                    background: 'rgba(10, 10, 10, 0.98)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(204,177,127,0.3)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[8px]">
                      <h3 className="font-['Onest',sans-serif] font-semibold text-[16px] text-[#e8d5b5]">
                        Connect to {initializingDex}
                      </h3>
                      <p className="font-['Onest',sans-serif] text-[13px] text-[#717182] leading-[18px]">
                        Connect your wallet to {initializingDex} with a single signature. This allows you to participate in delta neutral strategies on this exchange.
                      </p>
                    </div>

                    <div className="flex gap-[8px]">
                      <motion.button
                        onClick={handleConnectSuccess}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 h-[36px] rounded-[8px] relative overflow-hidden"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)'
                        }}
                      >
                        <div className="absolute inset-0 border-[0.83px] border-[rgba(120,90,40,0.4)] rounded-[8px] pointer-events-none" />
                        <span className="font-['Onest',sans-serif] font-semibold text-[13px] text-[#e8d5b5] uppercase tracking-[0.3px]">
                          Sign & Connect
                        </span>
                      </motion.button>
                      <motion.button
                        onClick={() => setInitializePopoverOpen(false)}
                        whileTap={{ scale: 0.95 }}
                        className="px-[16px] h-[36px] rounded-[8px] border border-[rgba(255,255,255,0.1)] hover:bg-white/5 transition-colors"
                      >
                        <span className="font-['Onest',sans-serif] font-medium text-[13px] text-[#717182] uppercase tracking-[0.3px]">
                          Cancel
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-b-[14px]"
            style={{
              background: 'linear-gradient(90deg, rgba(16, 14, 12, 0.9) 0%, rgba(10, 8, 6, 0.9) 100%)',
            }}
          >
            <div className="px-[16px] py-[20px] border-t border-[rgba(255,255,255,0.05)]">
              <div className="grid grid-cols-2 gap-[20px]">
                {/* Left Column */}
                <div className="flex flex-col gap-[16px]">
                  {/* Position Distribution */}
                  <div className="flex flex-col gap-[8px]">
                    <span className="font-['Onest',sans-serif] font-semibold text-[12px] text-[#ccb17f] uppercase tracking-[1px]">
                      Position Distribution
                    </span>

                    <div className="flex items-center justify-between py-[8px] border-b border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-[6px]">
                        <Activity size={14} className="text-[#717182]" />
                        <span className="font-['Onest',sans-serif] text-[13px] text-[#717182]">{dexA.name}</span>
                      </div>
                      <span className="font-['Onest',sans-serif] font-medium text-[13px] text-[#e8d5b5]">{dexA.amount}</span>
                    </div>

                    <div className="flex items-center justify-between py-[8px]">
                      <div className="flex items-center gap-[6px]">
                        <Activity size={14} className="text-[#717182]" />
                        <span className="font-['Onest',sans-serif] text-[13px] text-[#717182]">{dexB.name}</span>
                      </div>
                      <span className="font-['Onest',sans-serif] font-medium text-[13px] text-[#e8d5b5]">{dexB.amount}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Historical Funding */}
                <div className="flex flex-col gap-[8px]">
                  <span className="font-['Onest',sans-serif] font-semibold text-[12px] text-[#ccb17f] uppercase tracking-[1px]">
                    Historical Funding Rates
                  </span>

                  <div className="bg-[#0c0a08] rounded-[8px] border border-[rgba(255,255,255,0.05)] p-[12px]">
                    <div className="flex flex-col gap-[8px]">
                      {historicalFunding.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-['Onest',sans-serif] text-[12px] text-[#717182]">{item.period}</span>
                          <div className="flex items-center gap-[4px]">
                            <TrendingUp size={12} className="text-[#4ade80]" />
                            <span className="font-['Onest',sans-serif] font-medium text-[12px] text-[#ccb17f]">{item.rate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
