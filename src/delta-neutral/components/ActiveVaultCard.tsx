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
import { VaultLegChip } from "./VaultLegChip";
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
  /**
   * Notional traded by the vault, all-time and over the trailing week. Optional
   * because a vault opened a second ago has genuinely traded nothing: absent reads as
   * zero rather than as missing, which is what a fresh vault should say.
   */
  totalVolumeUsd?: number;
  volume7dUsd?: number;
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

/**
 * Volume runs from nothing to eight figures inside the same column, so it is written
 * short: $0, $146.7K, $2.4M. Written in full, the widest vault would set the column
 * width for every other one.
 */
function formatCompactUsd(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
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
  variant = "default",
}: ActiveVaultCardProps) {
  const isV2 = variant === "v2";
  const payoutSec = usePayoutCountdown();
  const syncing = vault.status === "rebalancing";
  const [pnlOpen, setPnlOpen] = useState(false);

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
  const status = statusToneAndText(syncing, vault.hedgeHealth);
  const exposure = useMemo(
    () => clamp((100 - vault.hedgeHealth) / 10, -5.5, 5.5),
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
  const capitalTone = getCapitalUsedTone(capitalUsed);
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
            {/*
              Venue and wallet, paired per leg, on one row.

              This block used to run four ragged lines deep -- name, venues, wallets,
              then a lone link -- each shorter and quieter than the last, while the
              right half of the header held nothing but two buttons. Two of those lines
              said the same thing twice: "Hyperliquid <-> Pacifica" over
              "0x7a3f...9f2e <-> 0x4d5e...c3a6", with the same arrow in the middle and
              nothing but column position to say which address belonged to which venue.

              Pairing each venue with its own wallet inside a chip states that
              relationship outright and buys back a line, which PnL Breakdown then
              takes: the sub-header is one row, and the chips are wide enough to hold
              the right edge of the card rather than trailing off into empty space.
            */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 tablet:mt-2">
              <VaultLegChip
                venue={vault.longAccount}
                address={vault.longWallet}
                isV2={isV2}
              />
              <span
                aria-hidden
                className={clsx(
                  "text-[11px] leading-none",
                  isV2 ? "text-[#555]" : "text-[#717182]",
                )}
              >
                ↔
              </span>
              <VaultLegChip
                venue={vault.shortAccount}
                address={vault.shortWallet}
                isV2={isV2}
              />

              {/* A hairline holds the read-only detour apart from the two chips, which
                  are about the vault's identity rather than about what you can open. */}
              <span
                aria-hidden
                className={clsx(
                  "hidden h-[14px] w-px shrink-0 tablet:block",
                  isV2 ? "bg-[#262626]" : "bg-[rgba(255,255,255,0.1)]",
                )}
              />

              <button
                type="button"
                onClick={() => setPnlOpen(true)}
                className={clsx(
                  "h-[20px] shrink-0 border-none bg-transparent p-0 text-[10px] font-semibold uppercase tracking-[0.75px] underline decoration-dashed underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 tablet:tracking-[0.85px]",
                  isV2
                    ? "text-[#888888] hover:text-[#c9a962] focus-visible:ring-[#c9a962]/40"
                    : "text-[#9596a1] hover:text-[#e8d5b5] focus-visible:ring-[rgba(204,177,127,0.45)]",
                )}
              >
                PnL Breakdown
              </button>
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
          {/*
            What a running vault is doing, in the order you ask it.

            This panel used to lead with NAV and two P&L figures over a second row of
            three risk percentages -- six numbers, all of them restated in the PnL
            Breakdown dialog and the deep dive below. What it did not say was how much
            the vault had actually traded, which is the thing that distinguishes a
            working vault from a funded one sitting still.

            Volume answers that, all-time beside the trailing week so a stalled vault
            shows as a full total against a flat 7d. Funding keeps its column: it is
            the clock the position runs on.
          */}
          <div className="grid grid-cols-3 gap-2 max-tablet:gap-1.5 tablet:gap-3">
            <div className="min-w-0">
              <MetricLabel
                label="Total Volume"
                mobileTitle="Volume"
                description="Notional traded by this vault since it was opened, across both legs."
              />
              <p
                className={clsx(
                  "mt-0.5 font-mono text-[15px] font-semibold leading-tight max-tablet:text-[14px] tablet:mt-1 tablet:text-[18px] tablet:leading-none",
                  isV2 ? "text-white" : "text-[#f2e2c4]",
                )}
              >
                {formatCompactUsd(vault.totalVolumeUsd ?? 0)}
              </p>
            </div>
            <div className="min-w-0">
              <MetricLabel
                label="Volume 7D"
                mobileTitle="7D"
                description="Notional traded over the last seven days. Flat against a rising total means the vault has gone quiet."
              />
              <p
                className={clsx(
                  "mt-0.5 font-mono text-[15px] font-semibold leading-tight max-tablet:text-[14px] tablet:mt-1 tablet:text-[18px] tablet:leading-none",
                  isV2 ? "text-white" : "text-[#f2e2c4]",
                )}
              >
                {formatCompactUsd(vault.volume7dUsd ?? 0)}
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

          {/*
            How the position is sized, on its own row under a rule.

            Two figures rather than three columns of risk: they are a pair -- margin is
            what is committed, leverage is the multiple it is working at -- and they are
            also exactly what the Edit button below changes, so they sit closest to it.
            The rule separates a fact about the vault's activity from a setting you can
            reach in and change.
          */}
          <div
            className={clsx(
              "mt-2.5 border-t pt-2 max-tablet:mt-2 tablet:mt-3",
              isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.08)]",
            )}
          >
            <div className="grid grid-cols-2 gap-2 max-tablet:gap-1.5 tablet:gap-3">
              <div className="flex min-w-0 flex-col gap-0.5 max-tablet:items-start tablet:flex-row tablet:items-baseline tablet:gap-2">
                <MetricLabel
                  label="Margin"
                  description="Percent of your collateral currently committed to maintaining the hedge."
                />
                <p
                  className={`font-mono text-[11px] font-semibold max-tablet:text-[11px] tablet:text-[13px] tablet:font-normal ${riskValueTone(capitalTone)}`}
                >
                  {formatPercent(capitalUsed, 0)}
                </p>
              </div>
              <div
                className={clsx(
                  "flex min-w-0 flex-col gap-0.5 border-l pl-3 max-tablet:items-start tablet:flex-row tablet:items-baseline tablet:gap-2",
                  isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.08)]",
                )}
              >
                <MetricLabel
                  label="Leverage"
                  description="The multiple both legs are sized at. Higher magnifies the funding spread and the cost of drift alike."
                />
                <p
                  className={clsx(
                    "font-mono text-[11px] font-semibold max-tablet:text-[11px] tablet:text-[13px] tablet:font-normal",
                    isV2 ? "text-white" : "text-[#f2e2c4]",
                  )}
                >
                  {leverage}x
                </p>
              </div>
            </div>
          </div>
        </div>

        {/*
          The editor, inside the card rather than in a modal.
          
          What it changes -- how much capital is at work and at what multiple -- is
          stated on the row directly above it as Margin and Leverage, and a dialog would
          cover exactly the figures the user is adjusting against. It opens where the
          change will show.

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
    </motion.article>
  );
}
