import React, { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { WalletAddressLabel } from "./WalletAddressLabel";

const FUNDING_EPOCH_MS = 8 * 60 * 60 * 1000;
export type ManagedDexId = "Hyperliquid" | "Pacifica" | "Nado";

export type ActiveVaultCardModel = {
  id: string;
  pair: string;
  marketType: "category" | "token";
  longAccount: ManagedDexId;
  shortAccount: ManagedDexId;
  longWallet: string;
  shortWallet: string;
  status: "balanced" | "rebalancing";
  longPnl: number;
  shortPnl: number;
  fundingEarned: number;
  notional: number;
  hedgeHealth: number;
};

type ActiveVaultUiVariant = "default" | "v2";

type ActiveVaultCardProps = {
  vault: ActiveVaultCardModel;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onStop?: () => void;
  variant?: ActiveVaultUiVariant;
};

type RiskTone = "good" | "caution" | "danger";

function usePayoutCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const next = Math.ceil(now / FUNDING_EPOCH_MS) * FUNDING_EPOCH_MS;
      setSecondsLeft(Math.max(0, Math.floor((next - now) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return secondsLeft;
}

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatSignedCurrency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(0)}`;
}

function formatSignedPercent(value?: number, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

function formatCurrency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPercent(value?: number, digits = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value.toFixed(digits)}%`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getExposureTone(value?: number): RiskTone | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const abs = Math.abs(value);
  if (abs > 3) return "danger";
  if (abs > 1) return "caution";
  return "good";
}

function getSafetyBufferTone(value?: number): RiskTone | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value < 15) return "danger";
  if (value < 30) return "caution";
  return "good";
}

function getCapitalUsedTone(value?: number): RiskTone | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value > 70) return "danger";
  if (value > 50) return "caution";
  return "good";
}

function riskValueTone(tone: RiskTone | null) {
  if (tone === "danger") return "text-[color:var(--vault-pnl-negative)]";
  if (tone === "caution") return "text-[#c9a27e]";
  return "text-[#d1d2dc]";
}

function statusToneAndText(syncing: boolean, hedgeHealth: number) {
  if (syncing) {
    return {
      label: "SYNCING",
      tone: "bg-[rgba(184,149,106,0.12)] text-[#b8956a] border border-[rgba(184,149,106,0.32)]",
    };
  }
  if (hedgeHealth < 70) {
    return {
      label: "WARNING",
      tone: "bg-[rgba(112,82,80,0.14)] text-[color:var(--vault-pnl-negative)] border border-[rgba(112,82,80,0.32)]",
    };
  }
  return {
    label: "NEUTRAL",
    tone: "bg-[rgba(100,118,102,0.12)] text-[color:var(--vault-leg-long-fg)] border border-[rgba(100,118,102,0.28)]",
  };
}

function MetricLabel({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="hidden cursor-help text-left text-[10px] uppercase tracking-[0.9px] text-[#9c9cac] outline-none focus-visible:text-[#e8d5b5] md:inline"
          >
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5]">
          {description}
        </TooltipContent>
      </Tooltip>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="cursor-help text-left text-[10px] uppercase tracking-[0.9px] text-[#9c9cac] outline-none focus-visible:text-[#e8d5b5] md:hidden"
      >
        {label}
      </button>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[14px] border border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-4 text-[#f5f5f5]">
          <DialogTitle className="font-['Onest',sans-serif] text-[14px] text-[#e8d5b5]">
            {label}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[12px] text-[#b4b5c2]">
            {description}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ActiveVaultCard({
  vault,
  expanded = false,
  onToggleExpand,
  onStop,
  variant = "default",
}: ActiveVaultCardProps) {
  const isV2 = variant === "v2";
  const payoutSec = usePayoutCountdown();
  const syncing = vault.status === "rebalancing";
  const [pnlOpen, setPnlOpen] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  const netPnl = vault.longPnl + vault.shortPnl + vault.fundingEarned;
  const todayPnl = netPnl * 0.18;
  const nav = vault.notional + netPnl;
  const netPnlPct = useMemo(
    () => (vault.notional > 0 ? (netPnl / vault.notional) * 100 : 0),
    [netPnl, vault.notional],
  );
  const status = statusToneAndText(syncing, vault.hedgeHealth);
  const exposure = useMemo(
    () => clamp((100 - vault.hedgeHealth) / 10, -5.5, 5.5),
    [vault.hedgeHealth],
  );
  const safetyBuffer = useMemo(
    () => clamp(vault.hedgeHealth * 0.42, 8, 60),
    [vault.hedgeHealth],
  );
  const capitalUsed = useMemo(
    () => clamp(35 + (100 - vault.hedgeHealth) * 0.7, 18, 90),
    [vault.hedgeHealth],
  );
  const sharpe = useMemo(
    () => clamp(2.6 - Math.abs(exposure) * 0.35, 0.6, 2.6),
    [exposure],
  );
  const maxDrawdown = useMemo(
    () => -clamp(0.8 + Math.abs(exposure) * 0.55, 0.8, 8),
    [exposure],
  );
  const uptime = useMemo(
    () => clamp(99.95 - Math.abs(exposure) * 0.12, 96.8, 99.95),
    [exposure],
  );
  const hedgeStatus = syncing ? "Syncing" : "Synced";
  const lastRebalanced = syncing
    ? "Just now"
    : `${Math.max(3, Math.round(Math.abs(exposure) * 7 + 4))}m ago`;
  const exposureTone = getExposureTone(exposure);
  const safetyTone = getSafetyBufferTone(safetyBuffer);
  const capitalTone = getCapitalUsedTone(capitalUsed);
  const primaryReturnTone =
    netPnl >= 0
      ? "text-[color:var(--vault-pnl-positive)]"
      : "text-[color:var(--vault-pnl-negative)]";
  return (
    <motion.article
      layout
      className={clsx(
        "font-['Onest',sans-serif] w-full border p-3 transition-colors max-tablet:p-3 md:p-4",
        isV2
          ? clsx(
              "rounded-[10px] bg-[#0a0a0a]",
              expanded
                ? "border-[#c9a962]/55 shadow-[inset_0_0_0_1px_rgba(201,169,98,0.12)]"
                : "border-[#2a2418]",
            )
          : clsx(
              "rounded-[14px] bg-[linear-gradient(180deg,rgba(18,15,12,0.9)_0%,rgba(9,9,9,0.97)_100%)]",
              expanded
                ? "border-[rgba(214,176,106,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "border-[rgba(255,255,255,0.09)]",
            ),
      )}
    >
      <div className="flex flex-col gap-2.5 max-tablet:gap-2 md:gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={clsx(
                  "font-['Onest',sans-serif] text-[18px] font-semibold leading-tight max-tablet:tracking-[-0.01em] md:text-[23px] md:font-medium",
                  isV2 ? "text-[#E8D5A1]" : "text-[#ecd9b7]",
                )}
              >
                {vault.pair}
              </h3>
              {onToggleExpand && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  aria-label={
                    expanded
                      ? "Collapse strategy deep dive"
                      : "Expand strategy deep dive"
                  }
                  className={clsx(
                    "group inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] border transition-colors max-tablet:h-7 max-tablet:w-7",
                    isV2
                      ? "border-[#c9a962]/60 bg-[#0d0d0d] text-[#c9a962] hover:border-[#d4af37] hover:text-[#f0e6c8]"
                      : "border-[rgba(120,90,40,0.45)] bg-[rgba(0,0,0,0.24)] text-[#ccb17f] hover:border-[rgba(176,132,65,0.65)] hover:text-[#e8d5b5]",
                  )}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : "rotate-0"}`}
                    aria-hidden
                  />
                </button>
              )}
            </div>
            <p
              className={clsx(
                "mt-0.5 text-[10px] max-tablet:leading-snug md:mt-1 md:text-[11px]",
                isV2 ? "text-[#888888]" : "text-[#9496a2]",
              )}
            >
              {vault.longAccount}{" "}
              <span className={isV2 ? "text-[#555]" : "text-[#717182]"}>
                ↔
              </span>{" "}
              {vault.shortAccount}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 max-tablet:hidden md:mt-1 md:flex">
              <WalletAddressLabel address={vault.longWallet} />
              <span
                className={clsx(
                  "text-[9px]",
                  isV2 ? "text-[#444]" : "text-[#5a5a68]",
                )}
              >
                ↔
              </span>
              <WalletAddressLabel address={vault.shortWallet} />
            </div>
          </div>

          {onStop && (
            <button
              type="button"
              onClick={onStop}
              aria-label={`Deactivate ${vault.pair} vault`}
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(248,113,113,0.42)] bg-[#0f0f0f] text-[#f87171] transition-colors hover:border-[rgba(248,113,113,0.6)] hover:bg-[rgba(248,113,113,0.08)] tablet:h-[30px] tablet:w-auto tablet:px-3 tablet:text-[10px] tablet:font-semibold tablet:uppercase tablet:tracking-[0.08em]"
            >
              <X className="size-4 tablet:hidden" strokeWidth={2} aria-hidden />
              <span className="hidden tablet:inline">Deactivate</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 max-tablet:gap-2 md:gap-2.5 xl:justify-end">
          <button
            type="button"
            onClick={() => setPnlOpen(true)}
            className={clsx(
              "h-[20px] border-none bg-transparent p-0 text-[9px] font-semibold uppercase tracking-[0.75px] underline decoration-dashed underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 max-tablet:text-[10px] md:tracking-[0.85px]",
              isV2
                ? "text-[#888888] hover:text-[#c9a962] focus-visible:ring-[#c9a962]/40"
                : "text-[#9596a1] hover:text-[#e8d5b5] focus-visible:ring-[rgba(204,177,127,0.45)]",
            )}
          >
            PnL Breakdown
          </button>
          <button
            type="button"
            onClick={() => setMoreInfoOpen(true)}
            className={clsx(
              "h-[20px] border-none bg-transparent p-0 text-[9px] font-semibold uppercase tracking-[0.75px] underline decoration-dashed underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 max-tablet:text-[10px] md:tracking-[0.85px]",
              isV2
                ? "text-[#888888] hover:text-[#c9a962] focus-visible:ring-[#c9a962]/40"
                : "text-[#9596a1] hover:text-[#e8d5b5] focus-visible:ring-[rgba(204,177,127,0.45)]",
            )}
          >
            More Info
          </button>
        </div>

        <div
          className={clsx(
            "rounded-[10px] border p-2.5 max-tablet:p-2.5 md:p-3",
            isV2
              ? "border-[#1f1f1f] bg-[#050505]"
              : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.01)]",
          )}
        >
          <MetricLabel
            label="NAV"
            description="Current total value of your vault position."
          />
          <p
            className={clsx(
              "mt-0.5 font-mono text-[22px] font-semibold leading-none max-tablet:text-[21px] md:mt-1 md:text-[27px]",
              isV2 ? "text-white" : "text-[#f2e2c4]",
            )}
          >
            {formatCurrency(nav)}
          </p>

          <div className="mt-2.5 grid grid-cols-3 gap-2 max-tablet:gap-1.5 md:mt-3 md:gap-3">
            <div className="min-w-0">
              <MetricLabel
                label="Total Return"
                description="Overall profit or loss since this vault started."
              />
              <p
                className={`mt-0.5 font-mono text-[15px] font-semibold leading-tight max-tablet:text-[14px] md:mt-1 md:text-[18px] md:leading-none ${primaryReturnTone}`}
              >
                {formatSignedCurrency(netPnl)}{" "}
                <span
                  className={clsx(
                    "block text-[9px] max-tablet:inline max-tablet:text-[9px] md:text-[10px]",
                    isV2 ? "text-[#666666]" : "text-[#8f90a1]",
                  )}
                >
                  ({formatSignedPercent(netPnlPct)})
                </span>
              </p>
            </div>
            <div className="min-w-0">
              <MetricLabel
                label="Today"
                description="Profit or loss generated today."
              />
              <p
                className={clsx(
                  "mt-0.5 font-mono text-[15px] font-semibold leading-tight max-tablet:text-[14px] md:mt-1 md:text-[18px] md:leading-none",
                  todayPnl >= 0
                    ? "text-[color:var(--vault-pnl-positive)]"
                    : "text-[color:var(--vault-pnl-negative)]",
                )}
              >
                {formatSignedCurrency(todayPnl)}
              </p>
            </div>
            <div className="min-w-0">
              <MetricLabel
                label="Funding Settlement"
                description="Countdown to the next payout or settlement update."
              />
              <p
                className={clsx(
                  "mt-0.5 font-mono text-[14px] font-semibold leading-tight max-tablet:text-[13px] md:mt-1 md:text-[16px] md:leading-none",
                  isV2 ? "text-[#c9a27e]" : "text-[#d6b06a]",
                )}
              >
                {formatCountdown(payoutSec)}
              </p>
            </div>
          </div>

          {isV2 ? (
            <div className="mt-3 border-t border-[#1f1f1f] pt-3">
              <div className="grid grid-cols-3 divide-x divide-[#2a2a2a] text-center">
                <div className="px-2">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                    Risk exposure
                  </p>
                  <p
                    className={clsx(
                      "mt-1 font-mono text-[13px] font-semibold",
                      riskValueTone(exposureTone),
                    )}
                  >
                    {formatSignedPercent(exposure, 1)}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                    Safety buffer
                  </p>
                  <p
                    className={clsx(
                      "mt-1 font-mono text-[13px] font-semibold text-white",
                    )}
                  >
                    {formatPercent(safetyBuffer, 0)}
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                    Capital used
                  </p>
                  <p
                    className={clsx(
                      "mt-1 font-mono text-[13px] font-semibold text-white",
                    )}
                  >
                    {formatPercent(capitalUsed, 0)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 border-t border-[rgba(255,255,255,0.08)] pt-2 max-tablet:mt-2 md:mt-3">
              <div className="grid grid-cols-3 gap-1.5 max-tablet:gap-1 md:grid-cols-[auto_1fr_1fr_1fr] md:items-center md:gap-x-3 md:gap-y-1">
                <p className="col-span-3 text-[9px] uppercase tracking-[0.9px] text-[#898a98] max-tablet:mb-0.5 md:col-span-1 md:mb-0 md:text-[10px] md:tracking-[1px]">
                  Risk
                </p>
                <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start md:flex-row md:items-baseline md:gap-2 md:border-l md:border-[rgba(255,255,255,0.08)] md:pl-3">
                  <MetricLabel
                    label="Exposure"
                    description="Remaining directional market exposure after hedging. Closer to 0% means more neutral."
                  />
                  <p
                    className={`font-mono text-[12px] font-semibold max-tablet:text-[11px] md:text-[13px] md:font-normal ${riskValueTone(exposureTone)}`}
                  >
                    {formatSignedPercent(exposure, 1)}
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start md:flex-row md:items-baseline md:gap-2 md:border-l md:border-[rgba(255,255,255,0.08)] md:pl-3">
                  <MetricLabel
                    label="Safety Buffer"
                    description="Distance from liquidation risk. Higher means safer."
                  />
                  <p
                    className={`font-mono text-[12px] font-semibold max-tablet:text-[11px] md:text-[13px] md:font-normal ${riskValueTone(safetyTone)}`}
                  >
                    {formatPercent(safetyBuffer, 0)}
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start md:flex-row md:items-baseline md:gap-2 md:border-l md:border-[rgba(255,255,255,0.08)] md:pl-3">
                  <MetricLabel
                    label="Capital Used"
                    description="Percent of your collateral currently used to maintain the hedge."
                  />
                  <p
                    className={`font-mono text-[12px] font-semibold max-tablet:text-[11px] md:text-[13px] md:font-normal ${riskValueTone(capitalTone)}`}
                  >
                    {formatPercent(capitalUsed, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {pnlOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.75)] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-[460px] rounded-[16px] border border-[rgba(146,111,56,0.45)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-[#f5f5f5]">
                  Net PnL = {netPnl >= 0 ? "+" : ""}${netPnl.toFixed(0)}
                </p>
                <button
                  type="button"
                  onClick={() => setPnlOpen(false)}
                  className="text-[#8f90a1] hover:text-[#f5f5f5]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 font-mono text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#9c9cac]">Funding Income</span>
                  <span className="text-[color:var(--vault-pnl-positive)]">
                    +${vault.fundingEarned.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9c9cac]">Long Leg PnL</span>
                  <span
                    className={
                      vault.longPnl >= 0
                        ? "text-[color:var(--vault-pnl-positive)]"
                        : "text-[color:var(--vault-pnl-negative)]"
                    }
                  >
                    {vault.longPnl >= 0 ? "+" : ""}${vault.longPnl.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9c9cac]">Short Leg PnL</span>
                  <span
                    className={
                      vault.shortPnl >= 0
                        ? "text-[color:var(--vault-pnl-positive)]"
                        : "text-[color:var(--vault-pnl-negative)]"
                    }
                  >
                    {vault.shortPnl >= 0 ? "+" : ""}${vault.shortPnl.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9c9cac]">Fees</span>
                  <span className="text-[color:var(--vault-pnl-negative)]">
                    -$98
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9c9cac]">Slippage</span>
                  <span className="text-[color:var(--vault-pnl-negative)]">
                    -$12
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9c9cac]">Rebalance PnL</span>
                  <span className="text-[color:var(--vault-pnl-positive)]">
                    +$350
                  </span>
                </div>
                <div className="border-t border-[rgba(255,255,255,0.08)] pt-2 flex justify-between">
                  <span className="text-[#9c9cac]">Net Delta</span>
                  <span className="text-[#8e9eb0]">+0.3%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {moreInfoOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.75)] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-[520px] rounded-[16px] border border-[rgba(146,111,56,0.45)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-[#f5f5f5]">
                  {vault.pair} Vault Info
                </p>
                <button
                  type="button"
                  onClick={() => setMoreInfoOpen(false)}
                  className="text-[#8f90a1] hover:text-[#f5f5f5]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-1 text-[12px] text-[#8f90a1]">
                {vault.longAccount} <span className="text-[#6d6e7d]">↔</span>{" "}
                {vault.shortAccount}
              </p>
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <WalletAddressLabel address={vault.longWallet} />
                <span className="text-[9px] text-[#5a5a68]">↔</span>
                <WalletAddressLabel address={vault.shortWallet} />
              </div>
              <div className="space-y-3">
                <section className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[1px] text-[#ccb17f]">
                    Risk
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Exposure
                        </span>
                        <span
                          className={`font-mono text-[12px] ${riskValueTone(exposureTone)}`}
                        >
                          {formatSignedPercent(exposure, 1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        This shows how much market direction risk is still left
                        after hedging. The closer this value is to 0%, the more
                        truly delta-neutral your vault is.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Safety Buffer
                        </span>
                        <span
                          className={`font-mono text-[12px] ${riskValueTone(safetyTone)}`}
                        >
                          {formatPercent(safetyBuffer, 0)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        Think of this as your cushion before liquidation risk
                        becomes serious. A higher buffer means the vault has
                        more room to absorb volatility safely.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Capital Used
                        </span>
                        <span
                          className={`font-mono text-[12px] ${riskValueTone(capitalTone)}`}
                        >
                          {formatPercent(capitalUsed, 0)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        This is how much of your posted collateral is currently
                        being used by the strategy. Lower usage usually means
                        more free margin and better safety headroom.
                      </p>
                    </div>
                  </div>
                </section>
                <section className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[1px] text-[#ccb17f]">
                    Performance
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Yield Earned
                        </span>
                        <span
                          className={`font-mono text-[12px] ${vault.fundingEarned >= 0 ? "text-[color:var(--vault-pnl-positive)]" : "text-[color:var(--vault-pnl-negative)]"}`}
                        >
                          {formatSignedCurrency(vault.fundingEarned)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        Total income generated so far from funding-rate and
                        spread capture in this vault.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Sharpe
                        </span>
                        <span className="font-mono text-[12px] text-[#d1d2dc]">
                          {sharpe.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        This tells you how efficient returns are after
                        accounting for risk. Higher Sharpe means better return
                        quality, not just higher raw profit.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Max Drawdown
                        </span>
                        <span className="font-mono text-[12px] text-[color:var(--vault-pnl-negative)]">
                          {formatSignedPercent(maxDrawdown, 1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        The biggest drop from a previous peak value during the
                        observed period. It helps you understand the worst dip
                        this vault experienced.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Uptime
                        </span>
                        <span className="font-mono text-[12px] text-[#d1d2dc]">
                          {formatPercent(uptime, 1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8f90a1]">
                        How consistently this vault has been running as expected
                        without interruptions.
                      </p>
                    </div>
                  </div>
                </section>
                <section className="rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[1px] text-[#ccb17f]">
                    System
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#d8d9e3]">Status</span>
                      <span
                        className={`font-mono text-[12px] ${syncing ? "text-[#b8956a]" : vault.hedgeHealth < 70 ? "text-[color:var(--vault-pnl-negative)]" : "text-[color:var(--vault-pnl-positive)]"}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#d8d9e3]">
                        Hedge Status
                      </span>
                      <span
                        className={`font-mono text-[12px] ${syncing ? "text-[#b8956a]" : "text-[color:var(--vault-pnl-positive)]"}`}
                      >
                        {hedgeStatus || "--"}
                      </span>
                    </div>
                    {lastRebalanced ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#d8d9e3]">
                          Last Rebalanced
                        </span>
                        <span className="font-mono text-[12px] text-[#d1d2dc]">
                          {lastRebalanced}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
