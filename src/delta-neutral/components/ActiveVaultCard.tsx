import React, { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { WalletAddressLabel } from "./WalletAddressLabel";
import { VaultControls } from "./VaultControls";
import { LeverageControl } from "./LeverageControl";

const FUNDING_EPOCH_MS = 8 * 60 * 60 * 1000;
export type ManagedDexId = "Hyperliquid" | "Pacifica" | "Nado" | "Variational";

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
  /**
   * What the position was sized with. Optional because the seeded vaults predate the
   * editor and a vault is perfectly describable without them -- notional is the fact,
   * these two are how it was arrived at. Absent, the card infers them (see
   * DEFAULT_LEVERAGE below) rather than refusing to open the editor.
   */
  marginUsd?: number;
  leverage?: number;
};

/**
 * The box both header actions wear. Square and icon-only on mobile, a fixed-width
 * labelled pill from tablet up so Deactivate and Edit/Save stack as one block.
 */
const ACTION_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-[10px] border transition-colors tablet:h-[30px] tablet:w-[112px] tablet:px-3 tablet:text-[10px] tablet:font-semibold tablet:uppercase tablet:tracking-[0.08em]";

/** What a vault is assumed to have been opened at when it does not say. */
const DEFAULT_LEVERAGE = 3;
const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 50;

/** Margin settings a vault is saved with. */
export type VaultSettings = { marginUsd: number; leverage: number };

/**
 * A margin ceiling that always contains the current value, rounded to something a
 * slider can be read against. A max below the amount already committed would put the
 * handle off the end of its own track.
 */
function marginCeilingFor(marginUsd: number) {
  return Math.max(10000, Math.ceil((marginUsd * 2) / 1000) * 1000);
}

type ActiveVaultUiVariant = "default" | "v2";

type ActiveVaultCardProps = {
  vault: ActiveVaultCardModel;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onStop?: () => void;
  /**
   * Save handler for the inline Margin/Leverage editor. Its presence is what puts the
   * Edit button on the card -- a card with nowhere to send the new settings should not
   * offer to collect them.
   */
  onSaveSettings?: (next: VaultSettings) => void;
  /** The More Info sheet. Off where the same figures already sit on the card. */
  showMoreInfo?: boolean;
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
  mobileTitle,
}: {
  label: string;
  description: string;
  mobileTitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const narrowLabel = mobileTitle ?? label;
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="hidden cursor-help text-left text-[10px] uppercase tracking-[0.9px] text-[#9c9cac] outline-none focus-visible:text-[#e8d5b5] tablet:inline"
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
        className="cursor-help text-left text-[10px] uppercase tracking-[0.9px] text-[#9c9cac] outline-none focus-visible:text-[#e8d5b5] max-tablet:inline tablet:hidden"
      >
        <span className="max-tablet:hidden">{label}</span>
        <span className="hidden max-tablet:inline">{narrowLabel}</span>
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
  onSaveSettings,
  showMoreInfo = true,
  variant = "default",
}: ActiveVaultCardProps) {
  const isV2 = variant === "v2";
  const payoutSec = usePayoutCountdown();
  const syncing = vault.status === "rebalancing";
  const [pnlOpen, setPnlOpen] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  /*
   * The inline editor.
   *
   * Its values are a draft, not the vault: the card goes on reporting what the vault
   * is actually running at while the sliders move, and only Save writes them back.
   * Cancel therefore costs nothing to implement and is the difference between a
   * control you can explore and one you have to be sure about before touching.
   */
  const leverage = vault.leverage ?? DEFAULT_LEVERAGE;
  const marginUsd = vault.marginUsd ?? Math.round(vault.notional / leverage);
  const [editing, setEditing] = useState(false);
  const [draftAmount, setDraftAmount] = useState(String(marginUsd));
  const [draftLeverage, setDraftLeverage] = useState(leverage);
  const marginCeiling = marginCeilingFor(marginUsd);
  const draftMargin = Number(draftAmount.replace(/[^0-9.]/g, "")) || 0;
  /*
   * Rounded, as the builder's own margin field rounds it. The slider and the readout
   * are one value in VaultControls, so an unrounded share of the ceiling is not a
   * more precise handle position -- it is "47.1133333%" printed next to the dollar
   * figure it was divided from.
   */
  const draftPercent = Math.round(clamp((draftMargin / marginCeiling) * 100, 0, 100));

  /** Typed amounts: digits only, and never past the ceiling the slider ends at. */
  const handleDraftAmountChange = (val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    const num = parseFloat(val);
    if (!Number.isNaN(num) && num > marginCeiling) {
      setDraftAmount(String(marginCeiling));
      return;
    }
    setDraftAmount(val);
  };

  const handleDraftPercentChange = (nextPercent: number) => {
    setDraftAmount(String(Math.round((nextPercent / 100) * marginCeiling)));
  };

  const startEditing = () => {
    // Reseed from the vault every time, so a cancelled edit does not leave its
    // abandoned numbers waiting in the panel the next time it opens.
    setDraftAmount(String(marginUsd));
    setDraftLeverage(leverage);
    setEditing(true);
  };

  const handleEditToggle = () => {
    if (!editing) {
      startEditing();
      return;
    }
    onSaveSettings?.({
      marginUsd: Math.round(draftMargin),
      leverage: draftLeverage,
    });
    setEditing(false);
  };

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
        "font-['Onest',sans-serif] w-full border p-3 transition-colors max-tablet:p-2.5 tablet:p-4",
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
      <div className="flex flex-col gap-2.5 max-tablet:gap-2 tablet:gap-3">
        <div className="flex items-start justify-between gap-1.5 max-tablet:gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={clsx(
                  "truncate font-['Onest',sans-serif] text-[18px] font-semibold leading-tight max-tablet:tracking-[-0.01em] tablet:text-[23px] tablet:font-medium",
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
                "mt-0.5 text-[10px] max-tablet:leading-snug tablet:mt-1 tablet:text-[11px]",
                isV2 ? "text-[#888888]" : "text-[#9496a2]",
              )}
            >
              {vault.longAccount}{" "}
              <span className={isV2 ? "text-[#555]" : "text-[#717182]"}>
                ↔
              </span>{" "}
              {vault.shortAccount}
            </p>
            <div className="mt-0.5 hidden flex-wrap items-center gap-x-2 gap-y-0.5 tablet:mt-1 tablet:flex">
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

            {/*
              The card's two read-only detours, under the identity they belong to.

              They used to sit on their own row beneath the header, right-aligned --
              which put three things against the right edge at three different heights:
              the button stack, then a lone dashed link under it. Left, they finish the
              block that names the vault, and the right edge is left to the two things
              that act on it.
            */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 tablet:mt-2.5">
              <button
                type="button"
                onClick={() => setPnlOpen(true)}
                className={clsx(
                  "h-[20px] border-none bg-transparent p-0 text-[10px] font-semibold uppercase tracking-[0.75px] underline decoration-dashed underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 tablet:tracking-[0.85px]",
                  isV2
                    ? "text-[#888888] hover:text-[#c9a962] focus-visible:ring-[#c9a962]/40"
                    : "text-[#9596a1] hover:text-[#e8d5b5] focus-visible:ring-[rgba(204,177,127,0.45)]",
                )}
              >
                PnL Breakdown
              </button>
              {showMoreInfo && (
                <button
                  type="button"
                  onClick={() => setMoreInfoOpen(true)}
                  className={clsx(
                    "h-[20px] border-none bg-transparent p-0 text-[10px] font-semibold uppercase tracking-[0.75px] underline decoration-dashed underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 tablet:tracking-[0.85px]",
                    isV2
                      ? "text-[#888888] hover:text-[#c9a962] focus-visible:ring-[#c9a962]/40"
                      : "text-[#9596a1] hover:text-[#e8d5b5] focus-visible:ring-[rgba(204,177,127,0.45)]",
                  )}
                >
                  More Info
                </button>
              )}
            </div>
          </div>

          {/*
            The two actions on a running vault, stacked rather than in a row: they are
            not a pair to choose between. Deactivate ends the thing; Edit changes how
            much of it there is. Stacked, the destructive one keeps the corner it has
            always had and the new one takes the space underneath, which is empty.

            One box for both -- 36px square on mobile where only the icon fits, a
            112px-wide pill from tablet up. Sized rather than hugging their labels,
            because "Save" is half the word "Deactivate" is and a stack of two buttons
            whose right edges align but whose left edges do not reads as a mistake
            rather than as a pair. 112px is what the longer of the two needs.
          */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {onStop && (
              <button
                type="button"
                onClick={onStop}
                aria-label={`Deactivate ${vault.pair} vault`}
                className={clsx(
                  ACTION_BUTTON,
                  "border-[rgba(248,113,113,0.42)] bg-[#0f0f0f] text-[#f87171] hover:border-[rgba(248,113,113,0.6)] hover:bg-[rgba(248,113,113,0.08)]",
                )}
              >
                <X className="size-4 tablet:hidden" strokeWidth={2} aria-hidden />
                <span className="hidden tablet:inline">Deactivate</span>
              </button>
            )}

            {onSaveSettings && (
              <button
                type="button"
                onClick={handleEditToggle}
                aria-expanded={editing}
                aria-label={
                  editing
                    ? `Save margin and leverage for ${vault.pair} vault`
                    : `Edit margin and leverage for ${vault.pair} vault`
                }
                className={clsx(
                  ACTION_BUTTON,
                  editing
                    ? // Saving is the commit, so it is the only filled button on the
                      // card. Outlined, it read as one more thing to consider.
                      "border-[rgba(206,163,95,0.74)] bg-[linear-gradient(180deg,rgba(49,39,29,1)_0%,rgba(22,18,13,1)_100%)] text-[#f0ddb9] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:brightness-110"
                    : "border-[rgba(120,90,40,0.45)] bg-[#0f0f0f] text-[#ccb17f] hover:border-[rgba(176,132,65,0.65)] hover:bg-[rgba(214,176,106,0.08)] hover:text-[#e8d5b5]",
                )}
              >
                {editing ? (
                  <Check className="size-4 tablet:hidden" strokeWidth={2} aria-hidden />
                ) : (
                  <Pencil className="size-4 tablet:hidden" strokeWidth={2} aria-hidden />
                )}
                <span className="hidden tablet:inline">
                  {editing ? "Save" : "Edit"}
                </span>
              </button>
            )}
          </div>
        </div>

        <div
          className={clsx(
            "rounded-[10px] border p-2.5 max-tablet:p-2.5 tablet:p-3",
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
              "mt-0.5 font-mono text-[22px] font-semibold leading-none max-tablet:text-[21px] tablet:mt-1 tablet:text-[27px]",
              isV2 ? "text-white" : "text-[#f2e2c4]",
            )}
          >
            {formatCurrency(nav)}
          </p>

          <div className="mt-2.5 grid grid-cols-3 gap-2 max-tablet:gap-1.5 tablet:mt-3 tablet:gap-3">
            <div className="min-w-0">
              <MetricLabel
                label="Total Return"
                description="Overall profit or loss since this vault started."
              />
              <p
                className={`mt-0.5 font-mono text-[15px] font-semibold leading-tight max-tablet:text-[14px] tablet:mt-1 tablet:text-[18px] tablet:leading-none ${primaryReturnTone}`}
              >
                {formatSignedCurrency(netPnl)}{" "}
                <span
                  className={clsx(
                    "block text-[9px] max-tablet:inline tablet:text-[10px]",
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
                  "mt-0.5 font-mono text-[15px] font-semibold leading-tight max-tablet:text-[14px] tablet:mt-1 tablet:text-[18px] tablet:leading-none",
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
                mobileTitle="Funding"
                description="Countdown to the next payout or settlement update."
              />
              <p
                className={clsx(
                  "mt-0.5 font-mono text-[14px] font-semibold leading-tight max-tablet:text-[13px] tablet:mt-1 tablet:text-[16px] tablet:leading-none",
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
            /*
              Three risk figures under three performance figures, on the same three
              columns. They used to sit in a `[auto_1fr_1fr_1fr]` row led by the word
              "Risk", which pushed all three off the grid above them by the width of
              that word and put a rule between each -- so the card had two rows of three
              numbers that lined up with nothing. The label moves to its own line, where
              it heads the row rather than indenting it.
            */
            <div className="mt-2.5 border-t border-[rgba(255,255,255,0.08)] pt-2 max-tablet:mt-2 tablet:mt-3">
              <p className="mb-1.5 text-[9px] uppercase tracking-[0.9px] text-[#898a98] tablet:text-[10px] tablet:tracking-[1px]">
                Risk
              </p>
              <div className="grid grid-cols-3 gap-2 max-tablet:gap-1.5 tablet:gap-3">
                <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start tablet:flex-row tablet:items-baseline tablet:gap-2">
                  <MetricLabel
                    label="Exposure"
                    description="Remaining directional market exposure after hedging. Closer to 0% means more neutral."
                  />
                  <p
                    className={`font-mono text-[11px] font-semibold max-tablet:text-[11px] tablet:text-[13px] tablet:font-normal ${riskValueTone(exposureTone)}`}
                  >
                    {formatSignedPercent(exposure, 1)}
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start tablet:flex-row tablet:items-baseline tablet:gap-2">
                  <MetricLabel
                    label="Safety Buffer"
                    description="Distance from liquidation risk. Higher means safer."
                  />
                  <p
                    className={`font-mono text-[11px] font-semibold max-tablet:text-[11px] tablet:text-[13px] tablet:font-normal ${riskValueTone(safetyTone)}`}
                  >
                    {formatPercent(safetyBuffer, 0)}
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start tablet:flex-row tablet:items-baseline tablet:gap-2">
                  <MetricLabel
                    label="Capital Used"
                    description="Percent of your collateral currently used to maintain the hedge."
                  />
                  <p
                    className={`font-mono text-[11px] font-semibold max-tablet:text-[11px] tablet:text-[13px] tablet:font-normal ${riskValueTone(capitalTone)}`}
                  >
                    {formatPercent(capitalUsed, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/*
          The editor, inside the card rather than in a modal.
          
          What it changes -- how much capital is at work and at what multiple -- is
          stated three lines above it as NAV and Capital Used, and a dialog would cover
          exactly the figures the user is adjusting against. It opens where the change
          will show.

          Height-animated the same way the strategy deep dive below the card is, so a
          card that grows downward does it one way regardless of which control grew it.
        */}
        <AnimatePresence initial={false}>
          {editing && (
            <motion.div
              key="vault-settings-editor"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className={clsx(
                  "rounded-[10px] border p-2.5 tablet:p-3",
                  isV2
                    ? "border-[#c9a962]/35 bg-[#050505]"
                    : "border-[rgba(214,176,106,0.28)] bg-[rgba(255,255,255,0.01)]",
                )}
              >
                {/*
                  Title left, the way out right. Cancel used to sit alone under its own
                  full-width rule at the foot of the panel, which drew a line whose only
                  job was to have a link under it. Up here it pairs with the eyebrow,
                  and the rule it vacated is free to separate something real.
                */}
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className={clsx(
                      "text-[10px] font-semibold uppercase tracking-[0.9px]",
                      isV2 ? "text-[#c9a962]" : "text-[#ccb17f]",
                    )}
                  >
                    Edit position
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.75px] text-[#8f90a1] underline decoration-dashed underline-offset-2 transition-colors hover:text-[#d8d9e3]"
                  >
                    Cancel
                  </button>
                </div>

                {/*
                  Both controls on one line. They are the same control twice -- an
                  eyebrow, a track and a readout, all 44px tall -- so stacked they cost
                  two rows to say one thing, and the card is wide enough that each was
                  running a slider most of a metre long to set a number with three
                  digits in it.

                  Paired at 1180px of viewport, not at `tablet`. The margin readout is
                  a fixed 248px, so half a card has to be wide enough to leave a track
                  longer than the box beside it -- below that the slider reads as a stub
                  hung off an input rather than as the control it is. 1180 is where that
                  turns over, and it is the step the builder already splits at.

                  Under it they stack at full card width, and under `tablet` each control
                  drops its own readout beneath its own slider -- which is why the
                  pairing step has to sit above that one rather than replace it.
                */}
                <div className="mt-3 grid grid-cols-1 items-start gap-y-4 min-[1180px]:grid-cols-2">
                  <div className="min-[1180px]:pr-5">
                  <VaultControls
                    label="Margin"
                    amount={draftAmount}
                    percent={draftPercent}
                    maxAmount={marginCeiling}
                    stretch
                    compactInput
                    largeSlider
                    variant={variant}
                    onAmountChange={handleDraftAmountChange}
                    onPercentChange={handleDraftPercentChange}
                  />
                  </div>
                  {/*
                    A rule between the halves, not just a gap. Margin's readout ends
                    248px into its column and Leverage's eyebrow starts a few pixels
                    later, so with whitespace alone the two controls read as one run of
                    four boxes and it is not obvious which slider drives which number.
                    The rule only exists where they are actually side by side.
                  */}
                  <div
                    className={clsx(
                      "min-[1180px]:border-l min-[1180px]:pl-5",
                      isV2
                        ? "min-[1180px]:border-[#1f1f1f]"
                        : "min-[1180px]:border-[rgba(255,255,255,0.08)]",
                    )}
                  >
                    <LeverageControl
                      value={draftLeverage}
                      min={MIN_LEVERAGE}
                      max={MAX_LEVERAGE}
                      variant={variant}
                      onChange={setDraftLeverage}
                    />
                  </div>
                </div>

                {/*
                  The consequence, live, under the rule -- inputs above it, the number
                  they resolve to below. Margin and leverage are both terms of one
                  figure the user actually cares about, and it is the figure the card
                  reports as NAV; floated up in the header beside the title it read as a
                  caption, when it is the answer.
                */}
                <div
                  className={clsx(
                    "mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t pt-2.5",
                    isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.08)]",
                  )}
                >
                  <p className="text-[10px] uppercase tracking-[0.9px] text-[#8f90a1]">
                    New position size
                  </p>
                  <p className="font-mono text-[13px] font-semibold">
                    <span className={isV2 ? "text-[#E8D5A1]" : "text-[#e8d5b5]"}>
                      {formatCurrency(draftMargin * draftLeverage)}
                    </span>
                    <span className="ml-2 text-[10px] font-normal text-[#63646f]">
                      was {formatCurrency(marginUsd * leverage)}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {pnlOpen && (
          <motion.div
            className="ds-scrim fixed inset-0 z-[100] flex items-center justify-center p-4"
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
            className="ds-scrim fixed inset-0 z-[100] flex items-center justify-center p-4"
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
