import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import svgPaths from "../../imports/svg-hyvz41orky";
import { SaveButton } from "./SaveButton";
import { VaultControls } from "./VaultControls";
import { motion } from "motion/react";
import { playSound } from "../utils/sound";
import { Celebration } from "./Celebration";
import { BronzeStrip } from "./BronzeStrip";
import { WalletAddressLabel } from "./WalletAddressLabel";

// Inline "NO FEE" text — BlueChip now uses the strip; only HIP-3 keeps inline label
const NO_FEE_VAULTS = ["HIP-3"];

// Bronze left-strip shown for these vaults
const BRONZE_STRIP_VAULTS = ["BlueChip", "Trending"];

interface ActivatedVaultRowProps {
  title: string;
  volume: string;
  apr: string;
  users: string;
  pnl?: string;
  onStop: () => void;
  badge?: "popular" | "high_apr" | "high_risk" | "trending";
  icon?: React.ReactNode;
  source?: string;
  initialAmount: string;
  initialPercent: number;
  walletAddress: string;
  isNew?: boolean;
}

function EditIcon() {
  return (
    <div className="relative shrink-0 size-[13.997px]">
      <svg className="block size-full" fill="none" viewBox="0 0 14 14">
        <path
          d={svgPaths.p370bcb00}
          stroke="#2F9E85"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.16645"
        />
      </svg>
    </div>
  );
}

function StopIcon() {
  return (
    <div className="relative shrink-0 size-[13.997px]">
      <svg className="block size-full" fill="none" viewBox="0 0 14 14">
        <path
          d={svgPaths.p27262e40}
          stroke="#E5484D"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.16645"
        />
        <path
          d={svgPaths.pbe15480}
          stroke="#E5484D"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.16645"
        />
      </svg>
    </div>
  );
}

function ActiveBadge() {
  return (
    <div className="bg-[rgba(204,177,127,0.1)] flex gap-[6px] items-center px-[9px] py-[2px] relative rounded-[100px] shrink-0 border-[0.83px] border-[rgba(204,177,127,0.2)] shadow-[0px_0px_10px_0px_rgba(204,177,127,0.15)]">
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.2, 1],
          boxShadow: [
            "0px 0px 5px 0px rgba(204,177,127,0.5)",
            "0px 0px 12px 2px rgba(204,177,127,0.8)",
            "0px 0px 5px 0px rgba(204,177,127,0.5)",
          ],
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

const MAX_AMOUNT = 10000;

export function ActivatedVaultRow({
  title,
  volume,
  apr,
  users,
  pnl = "+26.2%",
  onStop,
  // badge prop is received but ignored for rendering in activated state
  icon,
  source,
  initialAmount,
  initialPercent,
  walletAddress,
  isNew = false,
}: ActivatedVaultRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(initialAmount);
  const [percent, setPercent] = useState(initialPercent);
  const [showCelebration, setShowCelebration] = useState(isNew);

  const showBronzeStrip = BRONZE_STRIP_VAULTS.includes(title);

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Recalculate percent based on initialAmount if needed when starting edit?
  // Or trust the props. Let's sync them on mount if we want to be strict, but respecting props is safer for display.
  // However, when editing starts, we want the slider to be correct relative to MAX_AMOUNT.
  useEffect(() => {
    // Sync percent to amount relative to MAX_AMOUNT for consistent editing
    if (isEditing) {
      const val = parseFloat(amount) || 0;
      const newPercent = Math.min(100, Math.max(0, (val / MAX_AMOUNT) * 100));
      if (Math.abs(newPercent - percent) > 1) {
        setPercent(Math.round(newPercent));
      }
    }
  }, [isEditing]);

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
    if (val === "") {
      setPercent(0);
    } else {
      const newPercent = Math.min(
        100,
        Math.max(0, (numVal / MAX_AMOUNT) * 100),
      );
      setPercent(Math.round(newPercent));
    }
  };

  const handlePercentChange = (val: number) => {
    setPercent(val);
    // Update amount
    const newAmount = MAX_AMOUNT * (val / 100);
    setAmount(
      newAmount % 1 === 0 ? newAmount.toFixed(0) : newAmount.toFixed(2),
    );
  };

  const handleEditClick = () => {
    setIsEditing(true);
    playSound("stop"); // "Apply the same sound effect used for Stop to Edit action"
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    playSound("success");
  };

  const handleStopClick = () => {
    playSound("stop");
    onStop();
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.005, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-[16px] w-full shrink-0 h-[88px] overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.4) 100%), linear-gradient(90deg, rgb(12, 12, 12) 0%, rgb(12, 12, 12) 100%)",
        boxShadow:
          "0px 0px 15px -5px rgba(204,177,127,0.2), 0px 4px 20px -5px rgba(0,0,0,0.5)",
      }}
    >
      {showCelebration && <Celebration />}

      {/* Bronze accent strip — BlueChip & Trending only */}
      {showBronzeStrip && <BronzeStrip />}

      {/* Border with Gold Glow - Animated */}
      <motion.div
        className="absolute inset-0 border-[0.5px] border-solid rounded-[16px] pointer-events-none"
        animate={
          isNew
            ? {
                borderColor: [
                  "rgba(120,90,40,0.2)",
                  "rgba(204,177,127,0.6)",
                  "rgba(120,90,40,0.2)",
                ],
                boxShadow: [
                  "inset 0 0 0 0 rgba(0,0,0,0)",
                  "inset 0 0 10px 0 rgba(204,177,127,0.1)",
                  "inset 0 0 0 0 rgba(0,0,0,0)",
                ],
              }
            : {
                borderColor: "rgba(204,177,127,0.2)",
                boxShadow: "none",
              }
        }
        transition={
          isNew ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}
        }
      />
      <div className="absolute inset-0 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.03)] rounded-[16px] pointer-events-none" />

      {/* Running Gradient Overlay */}
      <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
        />
      </div>

      <div
        className={`flex items-center justify-between h-full ${showBronzeStrip ? "pl-[42px]" : "pl-[16px]"} pr-[16px] py-[25px] relative z-10`}
      >
        {/* Left Section */}
        <div className="flex items-center gap-[16px]">
          {/* Title & Badges */}
          <div className="flex items-center gap-[12px] w-[200px] shrink-0">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="shrink-0 text-[#ccb17f] opacity-80">{icon}</div>
              )}
            </div>
            <div className="flex flex-col gap-[2px]">
              <div className="flex items-center gap-[6px]">
                <span className="font-['Onest',sans-serif] font-medium text-[#e8d5b5] text-[16px] leading-[20px]">
                  {title}
                </span>
                <ActiveBadge />
              </div>
              {NO_FEE_VAULTS.includes(title) && (
                <span className="font-['Onest',sans-serif] font-medium text-[#ccb17f] text-[9px] tracking-[0.5px] uppercase leading-[13px]">
                  NO FEE
                </span>
              )}
              <span className="font-['Onest',sans-serif] font-normal text-[#717182] text-[11px] tracking-[0.275px] uppercase leading-[16.5px]">
                Automated Strategy
              </span>
              <WalletAddressLabel address={walletAddress} className="mt-0.5" />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-[32px] bg-[rgba(255,255,255,0.05)]" />

          {/* Stats: Volume, APR, PnL, Users */}
          <div className="flex items-center gap-[30px]">
            {/* Volume */}
            <div className="flex flex-col gap-[2px]">
              <span className="font-['Arial',sans-serif] text-[#717182] text-[10px] tracking-[0.5px] uppercase leading-[15px]">
                Volume
              </span>
              <span className="font-['Onest',sans-serif] font-medium text-[#d4d4d8] text-[14px] leading-[20px]">
                {volume}
              </span>
            </div>
            {/* APR */}
            <div className="flex flex-col gap-[2px]">
              <span className="font-['Arial',sans-serif] text-[#717182] text-[10px] tracking-[0.5px] uppercase leading-[15px]">
                APR
              </span>
              <span className="font-['Onest',sans-serif] font-bold text-[#ccb17f] text-[14px] leading-[20px]">
                {apr}
              </span>
            </div>
            {/* PnL - Only visible when activated (which this component always is) */}
            <div className="flex flex-col gap-[2px]">
              <span className="font-['Arial',sans-serif] text-[#717182] text-[10px] tracking-[0.5px] uppercase leading-[15px]">
                PnL
              </span>
              <span className="font-['Onest',sans-serif] font-bold text-[#ccb17f] text-[14px] leading-[20px]">
                {pnl}
              </span>
            </div>
            {/* Users */}
            <div className="flex flex-col gap-[2px]">
              <span className="font-['Arial',sans-serif] text-[#717182] text-[10px] tracking-[0.5px] uppercase leading-[15px]">
                Users
              </span>
              <span className="font-['Onest',sans-serif] font-medium text-[#717182] text-[14px] leading-[20px]">
                {users}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Slider & Controls */}
        <div className="flex items-center gap-[21px]">
          {/* Slider & Input Group */}
          <VaultControls
            disabled={!isEditing}
            amount={amount}
            percent={percent}
            maxAmount={MAX_AMOUNT}
            onAmountChange={handleAmountChange}
            onPercentChange={handlePercentChange}
          />

          {/* Vertical Divider */}
          <div className="w-[1px] h-[32px] bg-[rgba(255,255,255,0.05)]" />

          {/* Controls */}
          <div className="flex items-center gap-[8px]">
            {isEditing ? (
              /* Save Button */
              <SaveButton onClick={handleSaveClick} />
            ) : (
              /* Edit Button */
              <motion.button
                onClick={handleEditClick}
                whileTap={{ scale: 0.95 }}
                className="w-[36px] h-[36px] relative rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-[rgba(47,158,133,0.1)] transition-colors group"
              >
                <div className="absolute inset-0 border-[0.83px] border-[rgba(47,158,133,0.5)] rounded-[10px] pointer-events-none transition-colors" />
                <EditIcon />
              </motion.button>
            )}

            {/* Stop Button */}
            <motion.button
              onClick={handleStopClick}
              whileTap={{ scale: 0.95 }}
              className="w-[36px] h-[36px] relative rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-[rgba(229,72,77,0.1)] transition-colors group"
            >
              <div className="absolute inset-0 border-[0.83px] border-[rgba(229,72,77,0.5)] rounded-[10px] pointer-events-none transition-colors" />
              <StopIcon />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
