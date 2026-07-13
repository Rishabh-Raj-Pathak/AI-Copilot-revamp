import React, { useMemo, useState, useEffect } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, CircleAlert, Wallet } from "lucide-react";
import { VaultControls } from "./VaultControls";
import { VaultOpeningOverlay } from "./VaultOpeningOverlay";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { DexLabel } from "./DexLogo";
import { formatWalletAddress } from "../utils/wallet";
import {
  DEX_FUNDING_INTERVAL_HOURS,
  DEX_PROFILES,
  resolveLegs,
  type DexSelection,
  type ManagedDexId,
} from "../utils/legs";

const PREPARE_MS = 5000;

export type { ManagedDexId };
type MarketMode = "themes" | "tokens";
type ThemeOption =
  | "Bluechip"
  | "Trending"
  | "HIP-3"
  | "Commodities"
  | "Equities"
  | "Perps"
  | "Spot"
  | "Meme"
  | "FX"
  | "Default";
type TokenOption = "BTC-USDC" | "ETH-USDC" | "SOL-USDC";

type MarketSelection = {
  mode: MarketMode;
  themes: ThemeOption[];
  token: TokenOption;
};

const MAX_NOTIONAL = 10000;
const THEME_OPTIONS: ThemeOption[] = [
  "Bluechip",
  "Trending",
  "HIP-3",
  "Commodities",
  "Equities",
  "Perps",
  "Spot",
  "Meme",
  "FX",
  "Default",
];
const TOKEN_OPTIONS: TokenOption[] = ["BTC-USDC", "ETH-USDC", "SOL-USDC"];

function parseMoney(s: string): number {
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function useNextEpochCountdown(intervalMs: number) {
  const [anchorMs, setAnchorMs] = useState(() => Date.now());
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    setAnchorMs(Date.now());
  }, [intervalMs]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const safeIntervalMs = Math.max(1000, intervalMs);
      const elapsedMs = Math.max(0, now - anchorMs);
      const remainderMs = elapsedMs % safeIntervalMs;
      const remainingMs =
        remainderMs === 0 ? safeIntervalMs : safeIntervalMs - remainderMs;
      setSecondsLeft(Math.max(0, Math.floor(remainingMs / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [intervalMs, anchorMs]);

  return secondsLeft;
}

function formatHms(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

function formatSignedPct(value: number, digits = 4) {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded >= 0 ? "+" : "";
  return `${sign}${rounded.toFixed(digits)}%`;
}

function formatCompactUsd(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatThemesSelection(themes: ThemeOption[]): string {
  if (themes.length === 0) return "Default";
  return themes.join(", ");
}

function createMockWalletAddress(dex: ManagedDexId) {
  const seed: Record<ManagedDexId, string> = {
    Hyperliquid: "0x7a3f84",
    Nado: "0x92bc18",
    Pacifica: "0x4d5e09",
  };
  const suffix = Math.random().toString(16).slice(2, 8);
  return `${seed[dex]}${suffix}`;
}

/** Tiny DEX connection indicator beside venue name (green pulse vs grey). */
function DexConnIndicator({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
        connected ? "bg-[color:var(--vault-dex-online)]" : "bg-[#6b7280]"
      }`}
      title={connected ? "Connected" : "Not connected"}
      aria-hidden
    />
  );
}

function VaultMetricLabel({
  label,
  description,
  className = "text-[10px] uppercase tracking-[0.8px] text-[#8f90a1]",
}: {
  label: string;
  description: string;
  className?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`hidden cursor-help text-left outline-none transition-colors hover:text-[#d8d9e3] focus-visible:text-[#e8d5b5] tablet:inline ${className}`}
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
        className={`cursor-help text-left outline-none transition-colors hover:text-[#d8d9e3] focus-visible:text-[#e8d5b5] max-tablet:inline tablet:hidden ${className}`}
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

const LEVERAGE_OPTIONS = [
  {
    value: "3x",
    label: "3x",
    profile: "Balanced",
    description: "Moderate yield with lower liquidation sensitivity.",
  },
  {
    value: "5x",
    label: "5x",
    profile: "Higher yield",
    description:
      "More funding capture, but higher liquidation and rebalance risk.",
  },
] as const;

type LeverageOption = (typeof LEVERAGE_OPTIONS)[number]["value"];

function leverageMeta(option: LeverageOption) {
  return LEVERAGE_OPTIONS.find((o) => o.value === option);
}

type BuilderUiVariant = "default" | "v2";

type DexPairSetupCardProps = {
  dexA: DexSelection;
  dexB: DexSelection;
  onDexAChange: (v: DexSelection) => void;
  onDexBChange: (v: DexSelection) => void;
  onConnectDex: (dex: ManagedDexId) => void;
  onDepositDex: (dex: ManagedDexId) => void;
  onChangeWalletDex: (dex: ManagedDexId) => void;
  dexConnectionMap: Record<ManagedDexId, boolean>;
  dexBalanceMap: Record<ManagedDexId, number>;
  dexWalletMap: Record<ManagedDexId, string | null>;
  market: MarketSelection;
  onModeChange: (mode: MarketMode) => void;
  onThemesChange: (themes: ThemeOption[]) => void;
  onTokenChange: (token: TokenOption) => void;
  variant?: BuilderUiVariant;
};

function DexPairSetupCard({
  dexA,
  dexB,
  onDexAChange,
  onDexBChange,
  onConnectDex,
  onDepositDex,
  onChangeWalletDex,
  dexConnectionMap,
  dexBalanceMap,
  dexWalletMap,
  market,
  onModeChange,
  onThemesChange,
  onTokenChange,
  variant = "default",
}: DexPairSetupCardProps) {
  const isV2 = variant === "v2";
  const selectTriggerClass = clsx(
    "h-[44px] w-full rounded-[10px] px-3 text-left shadow-[inset_0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus:ring-1 [&_svg]:h-3.5 [&_svg]:w-3.5",
    isV2
      ? "border border-[#2a2a2a] bg-[#0d0d0d] text-[#E8E2D2] hover:bg-[#141414] focus:ring-[#d4af37]/30 [&_svg]:text-[#d4af37]/80"
      : "border border-[rgba(255,255,255,0.09)] bg-[linear-gradient(180deg,rgba(19,19,21,0.96)_0%,rgba(11,11,13,0.98)_100%)] hover:bg-[linear-gradient(180deg,rgba(25,25,28,0.98)_0%,rgba(12,12,15,0.99)_100%)] focus:ring-[rgba(214,176,106,0.24)] [&_svg]:text-[rgba(227,202,157,0.76)]",
  );
  const selectContentClass = clsx(
    isV2
      ? "border-[#3d3428] bg-[#0d0d0d] text-[#E8E2D2]"
      : "border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(25,22,18,0.98)_0%,rgba(14,12,10,0.99)_100%)] text-[#f1dfbf]",
  );
  const marketDisabled = dexA === "" || dexB === "";

  const renderDexSelector = (
    slot: "a" | "b",
    value: DexSelection,
    excludeDex: DexSelection,
    onChange: (v: DexSelection) => void,
  ) => {
    const connected = value !== "" ? dexConnectionMap[value] : false;
    return (
      <div
        className={clsx(
          "border p-3 max-tablet:p-2.5",
          isV2
            ? "rounded-[10px] border-[#2a2a2a] bg-[#121212]"
            : "rounded-[11px] border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,12,0.84)]",
        )}
      >
        <p
          className={clsx(
            "mb-2 font-['Onest',sans-serif] text-[10px] font-semibold uppercase tracking-[1.2px]",
            isV2 ? "text-[#c9a962]" : "text-[rgba(227,202,157,0.82)]",
          )}
        >
          {slot === "a" ? "Select DEX A" : "Select DEX B"}
        </p>
        <div className="min-w-0">
          <Select
            value={value || undefined}
            onValueChange={(v) => onChange(v as ManagedDexId)}
          >
            <SelectTrigger className={selectTriggerClass}>
              <div className="flex min-w-0 flex-1 items-center">
                <SelectValue
                  placeholder="Select DEX"
                  className="truncate font-['Onest',sans-serif] text-[14px] text-[#ececf3]"
                />
              </div>
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              {(Object.keys(DEX_PROFILES) as ManagedDexId[]).map((id) => (
                <SelectItem
                  key={`${slot}-${id}`}
                  value={id}
                  disabled={excludeDex !== "" && id === excludeDex}
                  className="pl-3 text-[14px] text-[#f1dfbf] focus:bg-[rgba(120,90,40,0.28)] focus:text-[#f6e5c8] data-[state=checked]:bg-[rgba(120,90,40,0.2)] data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <DexConnIndicator connected={dexConnectionMap[id]} />
                    <DexLabel dex={id} />
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2">
          {connected ? (
            <div className="flex flex-col gap-2 max-tablet:items-stretch">
              <div className="flex items-center gap-2 max-tablet:flex-col max-tablet:items-stretch">
                <div className="inline-flex h-[38px] min-w-0 flex-1 items-center justify-between gap-2 rounded-[10px] border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] px-2.5 max-tablet:w-full">
                  <span className="text-[10px] uppercase tracking-[0.8px] text-[#9de7b5]">
                    Balance
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold text-[color:var(--vault-pnl-positive)]">
                    <DexConnIndicator connected />
                    {formatCompactUsd(dexBalanceMap[value])}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (value) onDepositDex(value);
                  }}
                  className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-[10px] border border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(42,34,25,0.98)_0%,rgba(20,16,12,0.99)_100%)] px-3 text-[10px] font-semibold uppercase tracking-[0.7px] text-[#f0ddb9] transition-colors hover:border-[rgba(206,163,95,0.74)] max-tablet:w-full"
                >
                  Deposit
                </button>
              </div>
              <div
                className={clsx(
                  "flex items-center gap-3 border-t px-1 pb-1 pt-2.5 max-tablet:flex-col max-tablet:items-stretch max-tablet:gap-2",
                  isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.06)]",
                )}
              >
                <Wallet
                  className={clsx(
                    "h-3.5 w-3.5 shrink-0",
                    isV2 ? "text-[#888888]" : "text-[#8f90a1]",
                  )}
                  aria-hidden
                />
                <span
                  className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#ececf3]"
                  title={dexWalletMap[value] ?? undefined}
                >
                  {dexWalletMap[value]
                    ? formatWalletAddress(dexWalletMap[value]!)
                    : "Wallet linked"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (value) onChangeWalletDex(value);
                  }}
                  className="shrink-0 rounded-[6px] px-2.5 py-1.5 text-[11px] font-medium text-[#f87171] transition-colors hover:bg-[rgba(248,113,113,0.1)] hover:text-[#fca5a5]"
                >
                  Change wallet
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={value === ""}
              onClick={() => {
                if (value) onConnectDex(value);
              }}
              className={`inline-flex h-[38px] items-center gap-2 rounded-[10px] border px-3 text-[10px] font-semibold uppercase tracking-[0.7px] transition-colors ${
                value === ""
                  ? "cursor-not-allowed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#7f8090]"
                  : "border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(42,34,25,0.98)_0%,rgba(20,16,12,0.99)_100%)] text-[#f0ddb9] hover:border-[rgba(206,163,95,0.74)]"
              }`}
            >
              <DexConnIndicator connected={false} />
              Connect DEX
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 max-tablet:p-3 tablet:p-4",
        isV2
          ? "rounded-[10px] border border-[#2a2418] bg-[#121212]"
          : "rounded-[14px] bg-[linear-gradient(180deg,rgba(14,13,12,0.9)_0%,rgba(10,10,10,0.96)_100%)] ring-1 ring-[rgba(214,176,106,0.22)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-8px_18px_rgba(0,0,0,0.34)]",
      )}
    >
      {!isV2 && (
        <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_16%_0%,rgba(214,176,106,0.08),transparent_58%)]" />
      )}
      {isV2 && (
        <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-[radial-gradient(circle_at_12%_0%,rgba(212,175,55,0.06),transparent_55%)]" />
      )}
      <div className="relative z-[1] mb-3 flex items-baseline justify-between gap-3">
        <p
          className={clsx(
            "font-['Onest',sans-serif] text-[11px] font-semibold uppercase tracking-[1.3px]",
            isV2 ? "text-[#c9a962]" : "text-[rgba(227,202,157,0.82)]",
          )}
        >
          Cross-DEX Setup
        </p>
        <p
          className={clsx(
            "text-right text-[10px] leading-tight",
            isV2 ? "text-[#666666]" : "text-[#7d7e88]",
          )}
        >
          Legs are assigned at execution, not at setup.
        </p>
      </div>
      <div className="relative z-[1] grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {renderDexSelector("a", dexA, dexB, onDexAChange)}
        {renderDexSelector("b", dexB, dexA, onDexBChange)}
      </div>

      {marketDisabled && (
        <p
          className={clsx(
            "relative z-[1] mt-3 font-['Onest',sans-serif] text-[11px] leading-relaxed",
            isV2 ? "text-[#888888]" : "text-[#7d7e88]",
          )}
        >
          Select a DEX on both venues to unlock category and token controls.
        </p>
      )}
      <div className="relative z-[1] mt-4">
        <label
          className={clsx(
            "mb-2 block text-[11px] uppercase tracking-[1.2px]",
            isV2 ? "text-[#888888]" : "text-[#8f90a1]",
          )}
        >
          Market
        </label>
        <div
          className={clsx(
            "inline-flex rounded-[10px] border p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]",
            isV2
              ? "border-[#2a2a2a] bg-[#0a0a0a]"
              : "border-[rgba(255,255,255,0.09)] bg-[rgba(10,10,11,0.94)]",
            marketDisabled ? "opacity-50" : "",
          )}
        >
          {(["themes", "tokens"] as MarketMode[]).map((mode) => {
            const active = market.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                disabled={marketDisabled}
                onClick={() => onModeChange(mode)}
                className={clsx(
                  "h-[26px] rounded-[8px] px-3 text-[11px] font-semibold tracking-[0.3px] transition-all",
                  active
                    ? isV2
                      ? "border border-[#c9a962] bg-[#141414] text-[#c9a962]"
                      : "bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                    : isV2
                      ? "border border-transparent text-[#888888] hover:bg-[#141414] hover:text-[#c4c4c4]"
                      : "text-[#7f8090] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#cfcfd8]",
                )}
              >
                {mode === "themes" ? "Categories" : "Tokens"}
              </button>
            );
          })}
        </div>
        {market.mode === "themes" ? (
          <Popover>
            <PopoverTrigger asChild disabled={marketDisabled}>
              <button
                type="button"
                disabled={marketDisabled}
                className={clsx(
                  "mt-2 flex min-h-[42px] w-full items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-left shadow-[inset_0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus:outline-none focus:ring-1",
                  selectTriggerClass,
                  marketDisabled ? "cursor-not-allowed opacity-50" : "",
                )}
              >
                <span className="min-w-0 flex-1 whitespace-normal break-words font-['Onest',sans-serif] text-[14px] leading-snug text-[#ececf3]">
                  {formatThemesSelection(market.themes)}
                </span>
                <ChevronDown
                  className={clsx(
                    "h-3.5 w-3.5 shrink-0",
                    isV2
                      ? "text-[#d4af37]/80"
                      : "text-[rgba(227,202,157,0.76)]",
                  )}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className={clsx(
                "w-[var(--radix-popover-trigger-width)] p-1.5",
                selectContentClass,
              )}
            >
              <p
                className={clsx(
                  "px-2 pb-1.5 text-[10px] uppercase tracking-[0.8px]",
                  isV2 ? "text-[#888888]" : "text-[#8f90a1]",
                )}
              >
                Select one or more
              </p>
              {THEME_OPTIONS.map((themeOption) => {
                const selected = market.themes.includes(themeOption);
                const checkboxId = `theme-${themeOption}`;
                return (
                  <label
                    key={themeOption}
                    htmlFor={checkboxId}
                    className={clsx(
                      "flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-2 text-[13px] transition-colors",
                      selected
                        ? isV2
                          ? "bg-[#1a1a1a] text-[#E8E2D2]"
                          : "bg-[rgba(120,90,40,0.2)] text-[#f6e5c8]"
                        : isV2
                          ? "text-[#E8E2D2] hover:bg-[#141414]"
                          : "text-[#f1dfbf] hover:bg-[rgba(120,90,40,0.14)]",
                    )}
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={selected}
                      onCheckedChange={() => {
                        const has = market.themes.includes(themeOption);
                        if (has) {
                          onThemesChange(
                            market.themes.filter((x) => x !== themeOption),
                          );
                        } else {
                          onThemesChange([...market.themes, themeOption]);
                        }
                      }}
                      className={clsx(
                        "size-4 rounded-[4px] border",
                        isV2
                          ? "border-[#3d3428] data-[state=checked]:border-[#c9a962] data-[state=checked]:bg-[#c9a962] data-[state=checked]:text-[#0d0d0d]"
                          : "border-[rgba(173,134,73,0.45)] data-[state=checked]:border-[rgba(214,176,106,0.8)] data-[state=checked]:bg-[rgba(214,176,106,0.85)] data-[state=checked]:text-[#1a140c]",
                      )}
                    />
                    <span className="flex-1">{themeOption}</span>
                    {selected && (
                      <Check
                        className={clsx(
                          "h-3.5 w-3.5 shrink-0",
                          isV2
                            ? "text-[#c9a962]"
                            : "text-[rgba(227,202,157,0.9)]",
                        )}
                        aria-hidden
                      />
                    )}
                  </label>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : (
          <Select
            disabled={marketDisabled}
            value={market.token}
            onValueChange={(v) => onTokenChange(v as TokenOption)}
          >
            <SelectTrigger
              className={`mt-2 h-[42px] ${selectTriggerClass} ${marketDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <SelectValue className="truncate font-['Onest',sans-serif] text-[14px] text-[#f5f5f5]" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              {TOKEN_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className={clsx(
                    "pl-3 text-[14px] focus:text-[#f6e5c8] data-[state=checked]:bg-[rgba(120,90,40,0.2)]",
                    isV2
                      ? "text-[#E8E2D2] focus:bg-[#1a1a1a] data-[state=checked]:bg-[#1a1a1a]"
                      : "text-[#f1dfbf] focus:bg-[rgba(120,90,40,0.28)]",
                  )}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

export type DeltaVaultBuilderResult = {
  longDex: ManagedDexId;
  shortDex: ManagedDexId;
  longWallet: string;
  shortWallet: string;
  pair: string;
  longNotional: number;
  shortNotional: number;
  notional: number;
  delta: number;
  estAprPct: number;
  fundingEarnedProjection: number;
  closeRules: {
    stopLossPnlPct: number | null;
    takeProfitWithFundingPct: number | null;
  };
};

type DeltaVaultBuilderProps = {
  onActivate?: (payload: DeltaVaultBuilderResult) => void;
  variant?: BuilderUiVariant;
};

const INITIAL_DEX_CONNECTED: Record<ManagedDexId, boolean> = {
  Hyperliquid: true,
  Nado: false,
  Pacifica: false,
};
const INITIAL_DEX_BALANCES: Record<ManagedDexId, number> = {
  Hyperliquid: 12430,
  Nado: 0,
  Pacifica: 0,
};
const INITIAL_DEX_WALLETS: Record<ManagedDexId, string | null> = {
  Hyperliquid: "0x7a3f8421c9f2e",
  Nado: null,
  Pacifica: null,
};

export function DeltaVaultBuilder({
  onActivate,
  variant = "default",
}: DeltaVaultBuilderProps) {
  const isV2Shell = variant === "v2";
  const [dexA, setDexA] = useState<DexSelection>("");
  const [dexB, setDexB] = useState<DexSelection>("");
  const [market, setMarket] = useState<MarketSelection>({
    mode: "themes",
    themes: [],
    token: "BTC-USDC",
  });
  const [dexConnected, setDexConnected] = useState<
    Record<ManagedDexId, boolean>
  >(() => ({ ...INITIAL_DEX_CONNECTED }));
  const [dexBalances, setDexBalances] = useState<Record<ManagedDexId, number>>(
    () => ({ ...INITIAL_DEX_BALANCES }),
  );
  const [dexWallets, setDexWallets] = useState<
    Record<ManagedDexId, string | null>
  >(() => ({ ...INITIAL_DEX_WALLETS }));
  const [leverage, setLeverage] = useState<LeverageOption>("3x");
  const [participationRate, setParticipationRate] = useState(0);
  const [amount, setAmount] = useState("");
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossPnlPct, setStopLossPnlPct] = useState("10");
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [takeProfitWithFundingPct, setTakeProfitWithFundingPct] =
    useState("10");
  const [isPreparing, setIsPreparing] = useState(false);

  const leverageSelectTriggerClass = clsx(
    "h-[38px] w-full min-w-[108px] max-w-[140px] rounded-[8px] px-3 text-left shadow-[inset_0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus:ring-1 [&_svg]:h-3.5 [&_svg]:w-3.5",
    isV2Shell
      ? "border border-[#2a2a2a] bg-[#0d0d0d] text-[#E8E2D2] hover:bg-[#141414] focus:ring-[#d4af37]/30 [&_svg]:text-[#d4af37]/80"
      : "border border-[rgba(255,255,255,0.09)] bg-[linear-gradient(180deg,rgba(19,19,21,0.96)_0%,rgba(11,11,13,0.98)_100%)] hover:bg-[linear-gradient(180deg,rgba(25,25,28,0.98)_0%,rgba(12,12,15,0.99)_100%)] focus:ring-[rgba(214,176,106,0.24)] [&_svg]:text-[rgba(227,202,157,0.76)]",
  );
  const leverageSelectContentClass = clsx(
    isV2Shell
      ? "border-[#3d3428] bg-[#0d0d0d] text-[#E8E2D2]"
      : "border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(25,22,18,0.98)_0%,rgba(14,12,10,0.99)_100%)] text-[#f1dfbf]",
  );

  /** The user picks two venues; funding — not the pick order — decides which leg is which. */
  const sides = useMemo(() => resolveLegs(dexA, dexB), [dexA, dexB]);
  const longDex: DexSelection = sides?.longDex ?? "";
  const shortDex: DexSelection = sides?.shortDex ?? "";

  const longProfile = DEX_PROFILES[longDex || "Hyperliquid"];
  const shortProfile = DEX_PROFILES[shortDex || "Pacifica"];

  const totalAmount = parseMoney(amount);
  const longN = totalAmount / 2;
  const shortN = totalAmount / 2;
  const delta = useMemo(
    () => Math.abs(longN) - Math.abs(shortN),
    [longN, shortN],
  );
  const notional = useMemo(
    () => Math.abs(longN) + Math.abs(shortN),
    [longN, shortN],
  );
  const hasBothDexSelected = dexA !== "" && dexB !== "";
  const dualValid = sides !== null;

  const deployableMaxUsd = useMemo(() => {
    if (!dualValid || dexA === "" || dexB === "") return MAX_NOTIONAL;
    return Math.min(dexBalances[dexA], dexBalances[dexB]);
  }, [dualValid, dexA, dexB, dexBalances]);

  const vaultMarginTooltip = useMemo(() => {
    if (!hasBothDexSelected || dexA === "" || dexB === "") {
      return "Pick both venues first. After that, you can set how much amount to deploy for this vault. MAX will match the lower of the two venue balances so that each leg can be funded.";
    }
    if (!dualValid) {
      return "Choose two different venues to unlock cross-venue margin and the balance-based cap.";
    }
    const balA = dexBalances[dexA];
    const balB = dexBalances[dexB];
    const max = Math.min(balA, balB);
    const fmt = (n: number) =>
      `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `Deployable margin is capped at the lower of your two venue balances so both legs can be funded.\n\n${dexA}: ${fmt(balA)} · ${dexB}: ${fmt(balB)} → Max deployable: ${fmt(max)}`;
  }, [hasBothDexSelected, dualValid, dexA, dexB, dexBalances]);

  const selectedVenues = [dexA, dexB].filter(
    (id): id is ManagedDexId => id !== "",
  );
  const firstDisconnectedVenue = selectedVenues.find((id) => !dexConnected[id]);
  const allSelectedVenuesConnected =
    selectedVenues.length === 2 && !firstDisconnectedVenue;

  const longRate = longProfile.funding8hPct;
  const shortRate = shortProfile.funding8hPct;
  /**
   * Cross-venue spread (short − long). Non-negative because the short leg is always
   * assigned to the higher-paying venue — see resolveLegs.
   */
  const spreadFunding8h = shortRate - longRate;
  const longFundingIntervalHours =
    longDex !== "" ? DEX_FUNDING_INTERVAL_HOURS[longDex] : 8;
  const shortFundingIntervalHours =
    shortDex !== "" ? DEX_FUNDING_INTERVAL_HOURS[shortDex] : 8;
  const longRatePerInterval = longRate * (longFundingIntervalHours / 8);
  const shortRatePerInterval = shortRate * (shortFundingIntervalHours / 8);
  const epochsPerYear = (365 * 24) / 8;
  const spreadAprGross = spreadFunding8h * epochsPerYear;
  const maxDrawdown30d = -1.8;
  const hedgeIntegrity = Number(
    (100 - Math.min(2.4, Math.abs(delta) / 22)).toFixed(1),
  );
  const feesDragEst = Number(
    (
      parseFloat(longProfile.feeRoundTripPct) +
      parseFloat(shortProfile.feeRoundTripPct)
    ).toFixed(3),
  );
  const avgSlippage = 0.012;
  const fundingVolBucket =
    Math.abs(spreadFunding8h) > 0.008
      ? "High"
      : Math.abs(spreadFunding8h) > 0.004
        ? "Medium"
        : "Low";

  const payoutIntervalHours = Math.max(
    DEX_FUNDING_INTERVAL_HOURS[longDex] ?? 8,
    DEX_FUNDING_INTERVAL_HOURS[shortDex] ?? 8,
  );
  const spreadFundingPerPayoutInterval =
    spreadFunding8h * (payoutIntervalHours / 8);
  const spreadDisplayPct = dualValid ? spreadFundingPerPayoutInterval : 0.024;
  const spreadDisplayHours = dualValid ? payoutIntervalHours : 8;
  const payoutIntervalMs = payoutIntervalHours * 60 * 60 * 1000;
  const secondsToRent = useNextEpochCountdown(payoutIntervalMs);

  const crossDexApr = useMemo(() => {
    const p = participationRate / 100;
    const feeLong = parseFloat(longProfile.feeRoundTripPct) / 10000;
    const feeShort = parseFloat(shortProfile.feeRoundTripPct) / 10000;
    const feeDragApr = (feeLong + feeShort) * epochsPerYear * 0.25;
    const raw = spreadAprGross * p - feeDragApr;
    return Number(Math.max(30.01, Math.max(0, raw)).toFixed(2));
  }, [
    participationRate,
    spreadAprGross,
    longProfile.feeRoundTripPct,
    shortProfile.feeRoundTripPct,
    epochsPerYear,
  ]);

  const fundingProjection = useMemo(() => {
    const ratePer8h = Math.max(0, spreadFunding8h) / 100;
    return notional * ratePer8h * epochsPerYear * (participationRate / 100);
  }, [notional, spreadFunding8h, participationRate, epochsPerYear]);

  useEffect(() => {
    const cap = deployableMaxUsd;
    const num = parseMoney(amount);
    if (cap <= 0) {
      if (num > 0 || participationRate > 0) {
        setAmount("0");
        setParticipationRate(0);
      }
      return;
    }
    if (num > cap) {
      setAmount(cap % 1 === 0 ? cap.toFixed(0) : cap.toFixed(2));
      setParticipationRate(100);
      return;
    }
    const nextPct = Math.round((num / cap) * 100);
    if (nextPct !== participationRate) {
      setParticipationRate(nextPct);
    }
    // Only re-clamp when the deployable ceiling changes (pair/balances), not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally cap-driven
  }, [deployableMaxUsd]);

  useEffect(() => {
    if (!dualValid || deployableMaxUsd <= 0) return;
    if (parseMoney(amount) > 0) return;
    const half = deployableMaxUsd * 0.5;
    setAmount(half % 1 === 0 ? half.toFixed(0) : half.toFixed(2));
    setParticipationRate(50);
    // Seed once when a valid pair exists and margin is still unset; omit `amount` so clearing the field does not re-trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dualValid, deployableMaxUsd]);

  const handleAmountChange = (val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    let numVal = parseFloat(val);
    if (Number.isNaN(numVal)) numVal = 0;
    const cap = deployableMaxUsd;
    if (cap <= 0) {
      setAmount(val === "" ? "" : "0");
      setParticipationRate(0);
      return;
    }
    if (numVal > cap) {
      numVal = cap;
      val = cap % 1 === 0 ? cap.toFixed(0) : cap.toFixed(2);
    }
    setAmount(val);
    const nextPercent =
      val === ""
        ? 0
        : Math.round(Math.min(100, Math.max(0, (numVal / cap) * 100)));
    setParticipationRate(nextPercent);
  };

  const handlePercentChange = (nextPercent: number) => {
    const cap = deployableMaxUsd;
    if (cap <= 0) {
      setParticipationRate(0);
      setAmount("0");
      return;
    }
    setParticipationRate(nextPercent);
    const nextAmount = cap * (nextPercent / 100);
    setAmount(
      nextAmount % 1 === 0 ? nextAmount.toFixed(0) : nextAmount.toFixed(2),
    );
  };

  const handleModeChange = (mode: MarketMode) => {
    setMarket((prev) => ({ ...prev, mode }));
  };

  const handleThemesChange = (themes: ThemeOption[]) => {
    setMarket((prev) => ({ ...prev, mode: "themes", themes }));
  };

  const handleTokenChange = (token: TokenOption) => {
    setMarket((prev) => ({ ...prev, mode: "tokens", token }));
  };

  const sanitizePercentInput = (value: string) => {
    if (value === "") return "";
    if (!/^\d*\.?\d*$/.test(value)) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return Math.min(100, Math.max(0, parsed)).toString();
  };

  const applyRulePreset = (
    preset: number,
    target: "stopLoss" | "takeProfitWithFunding",
  ) => {
    const safe = Math.min(100, Math.max(0, preset)).toString();
    if (target === "stopLoss") setStopLossPnlPct(safe);
    else setTakeProfitWithFundingPct(safe);
  };

  const handleInitialize = () => {
    if (!sides || isPreparing || !allSelectedVenuesConnected) return;
    const { longDex: resolvedLong, shortDex: resolvedShort } = sides;
    const payload: DeltaVaultBuilderResult = {
      longDex: resolvedLong,
      shortDex: resolvedShort,
      longWallet: dexWallets[resolvedLong]!,
      shortWallet: dexWallets[resolvedShort]!,
      pair:
        market.mode === "tokens"
          ? market.token.replace("-", "/")
          : market.themes.length > 0
            ? market.themes.join(", ")
            : "Default",
      longNotional: longN,
      shortNotional: shortN,
      notional,
      delta,
      estAprPct: crossDexApr,
      fundingEarnedProjection: fundingProjection,
      closeRules: {
        stopLossPnlPct: stopLossEnabled ? Number(stopLossPnlPct || 0) : null,
        takeProfitWithFundingPct: takeProfitEnabled
          ? Number(takeProfitWithFundingPct || 0)
          : null,
      },
    };
    setIsPreparing(true);
    window.setTimeout(() => {
      onActivate?.(payload);
      setIsPreparing(false);
    }, PREPARE_MS);
  };

  const handlePrimaryAction = () => {
    if (!dualValid || isPreparing || !hasBothDexSelected) return;
    if (firstDisconnectedVenue) {
      setDexConnected((prev) => ({ ...prev, [firstDisconnectedVenue]: true }));
      return;
    }
    handleInitialize();
  };

  const primaryLabel =
    dualValid && allSelectedVenuesConnected
      ? `Open ${market.mode === "tokens" ? market.token : "BTC/USDC"} vault`
      : "Connect both DEXs to continue";

  const bridgeKey = `${dexA || "none"}-${dexB || "none"}`;
  const marketLabel =
    market.mode === "themes"
      ? formatThemesSelection(market.themes)
      : market.token;
  const spreadSubtitleKey = `${bridgeKey}-${marketLabel}`;
  return (
    <section
      className={clsx(
        "font-['Onest',sans-serif] relative overflow-hidden p-3.5 tablet:p-4",
        isV2Shell
          ? "rounded-[12px] border border-[#2a2418] bg-[#000000] shadow-none max-tablet:rounded-[14px] max-tablet:p-2.5"
          : clsx(
              "rounded-[18px] bg-[linear-gradient(180deg,rgba(13,13,13,0.98)_0%,rgba(8,8,8,0.99)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_16px_44px_rgba(0,0,0,0.38)]",
              "max-tablet:rounded-none max-tablet:bg-transparent max-tablet:p-0 max-tablet:shadow-none",
            ),
      )}
    >
      {!isV2Shell && (
        <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-[rgba(214,176,106,0.2)] max-tablet:hidden" />
      )}
      {isV2Shell && (
        <div className="pointer-events-none absolute inset-0 rounded-[12px] ring-1 ring-[#c9a962]/20" />
      )}
      <AnimatePresence>
        {isPreparing && dexA !== "" && dexB !== "" && (
          <motion.div
            key="vault-opening"
            className="absolute inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <VaultOpeningOverlay
              venueA={dexA}
              venueB={dexB}
              variant={variant}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-[1] grid grid-cols-1 gap-4 max-tablet:gap-3 tablet:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-4 max-tablet:gap-3">
          <DexPairSetupCard
              dexA={dexA}
              dexB={dexB}
              onDexAChange={setDexA}
              onDexBChange={setDexB}
              onConnectDex={(dex) => {
                setDexConnected((prev) => ({ ...prev, [dex]: true }));
                setDexWallets((prev) => ({
                  ...prev,
                  [dex]: prev[dex] ?? createMockWalletAddress(dex),
                }));
                setDexBalances((prev) => ({
                  ...prev,
                  [dex]: prev[dex] > 0 ? prev[dex] : 500,
                }));
              }}
              onDepositDex={(dex) =>
                setDexBalances((prev) => ({ ...prev, [dex]: prev[dex] + 500 }))
              }
              onChangeWalletDex={(dex) => {
                setDexWallets((prev) => ({
                  ...prev,
                  [dex]: createMockWalletAddress(dex),
                }));
              }}
              dexConnectionMap={dexConnected}
              dexBalanceMap={dexBalances}
              dexWalletMap={dexWallets}
              market={market}
              onModeChange={handleModeChange}
              onThemesChange={handleThemesChange}
              onTokenChange={handleTokenChange}
              variant={variant}
            />

          <div
              className={clsx(
                "rounded-[11px] border p-3 max-tablet:p-3",
                isV2Shell
                  ? "border-[#1f1f1f] bg-[#121212]"
                  : "border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
              )}
            >
              <VaultControls
                disabled={!dualValid}
                disabledSliderTooltip="Select both the dex before setting the amount"
                amount={amount}
                percent={participationRate}
                maxAmount={deployableMaxUsd}
                maxSummary={dualValid ? undefined : "—"}
                inputPlaceholder="Select venues"
                infoTooltip={vaultMarginTooltip}
                stretch
                compactInput
                largeSlider
                variant={variant}
                onAmountChange={handleAmountChange}
                onPercentChange={handlePercentChange}
              />
          </div>

          {hasBothDexSelected && !dualValid && (
            <p className="font-mono text-[11px] text-[#f87171]">
              Select two different DEX sources to unlock cross-venue spread.
            </p>
          )}

          <div
            className={clsx(
              "flex flex-row items-center justify-between gap-3 rounded-[11px] border p-3 max-tablet:p-3",
              isV2Shell
                ? "border-[#1f1f1f] bg-[#121212]"
                : "border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
            )}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0">
              <p
                className={clsx(
                  "text-[11px] tracking-[0.6px] uppercase",
                  isV2Shell
                    ? "text-[#c9a962]"
                    : "text-[rgba(227,202,157,0.82)]",
                )}
              >
                Leverage
              </p>
              <p
                className={clsx(
                  "text-[11px]",
                  isV2Shell ? "text-[#6a6a6a]" : "text-[#717182]",
                )}
              >
                {leverageMeta(leverage)?.profile}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Select
                value={leverage}
                onValueChange={(v) => setLeverage(v as LeverageOption)}
              >
                <SelectTrigger
                  className={leverageSelectTriggerClass}
                  aria-label="Leverage multiplier"
                >
                  <SelectValue
                    placeholder="Select"
                    className="font-['Onest',sans-serif] text-[13px] font-semibold"
                  >
                    {leverage}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className={leverageSelectContentClass}>
                  {LEVERAGE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      textValue={option.label}
                      className="py-2.5 pl-3 pr-3 text-[14px] text-[#f1dfbf] focus:bg-[rgba(120,90,40,0.28)] focus:text-[#f6e5c8] data-[state=checked]:bg-[rgba(120,90,40,0.2)]"
                    >
                      <div className="flex w-full min-w-[200px] flex-col gap-0.5">
                        <span className="font-semibold leading-none">
                          {option.label}
                        </span>
                        <span className="text-[11px] leading-snug text-[#8f90a1]">
                          {option.profile}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Leverage details"
                    className={clsx(
                      "inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[8px] border transition-colors",
                      isV2Shell
                        ? "border-[#2a2a2a] bg-[#0d0d0d] text-[#888888] hover:bg-[#141414] hover:text-[#c4c4c4]"
                        : "border-[rgba(255,255,255,0.08)] bg-[#0f1014] text-[#8f90a1] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#d4d4d4]",
                    )}
                  >
                    <CircleAlert className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#f5f5f5]">
                  <div className="max-w-[240px] space-y-1.5">
                    <p className="text-[12px] font-medium text-[#f0ddb9]">
                      {leverage} · {leverageMeta(leverage)?.profile}
                    </p>
                    <p className="text-[11px] leading-relaxed text-[#a8a8b8]">
                      {leverageMeta(leverage)?.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div
            className={clsx(
              "rounded-[11px] border p-3 max-tablet:p-3",
              isV2Shell
                ? "border-[#1f1f1f] bg-[#121212]"
                : "border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
            )}
          >
            <p
              className={clsx(
                "text-[11px] uppercase tracking-[1.1px]",
                isV2Shell ? "text-[#c9a962]" : "text-[rgba(227,202,157,0.82)]",
              )}
            >
              Set PnL
            </p>
            <p
              className={clsx(
                "mt-1 text-[11px]",
                isV2Shell ? "text-[#888888]" : "text-[#7d7e88]",
              )}
            >
              Optional safety/target exits for this vault.
            </p>

            <div className="mt-3 space-y-2.5">
              <div
                className={clsx(
                  "rounded-[10px] border p-2.5",
                  isV2Shell
                    ? "border-[#1f1f1f] bg-[#121212]"
                    : "border-[rgba(255,255,255,0.06)] bg-[rgba(11,11,12,0.72)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#d8d9e3]">
                    Close if PnL drops below
                  </p>
                  <button
                    type="button"
                    onClick={() => setStopLossEnabled((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                      stopLossEnabled
                        ? "border-[rgba(214,176,106,0.58)] bg-[rgba(120,90,40,0.36)]"
                        : "border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)]"
                    }`}
                    aria-pressed={stopLossEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-[#f5f5f5] transition-transform ${
                        stopLossEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={!stopLossEnabled}
                    value={stopLossPnlPct}
                    onChange={(e) => {
                      const sanitized = sanitizePercentInput(e.target.value);
                      if (sanitized !== null) setStopLossPnlPct(sanitized);
                    }}
                    className={`h-[34px] w-[88px] rounded-[9px] border px-2 text-center text-[13px] outline-none ${
                      stopLossEnabled
                        ? "border-[rgba(173,134,73,0.5)] bg-[#0c0a08] text-[#e8d5b5]"
                        : "cursor-not-allowed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#777884]"
                    }`}
                  />
                  <span className="text-[12px] text-[#9c9cac]">%</span>
                  {[5, 10, 15].map((preset) => (
                    <button
                      key={`sl-${preset}`}
                      type="button"
                      disabled={!stopLossEnabled}
                      onClick={() => applyRulePreset(preset, "stopLoss")}
                      className={`h-[28px] rounded-[8px] border px-2.5 text-[11px] transition-colors ${
                        stopLossEnabled
                          ? "border-[rgba(173,134,73,0.4)] text-[#d6c39f] hover:border-[rgba(206,163,95,0.62)]"
                          : "cursor-not-allowed border-[rgba(255,255,255,0.1)] text-[#6f7080]"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={clsx(
                  "rounded-[10px] border p-2.5",
                  isV2Shell
                    ? "border-[#1f1f1f] bg-[#121212]"
                    : "border-[rgba(255,255,255,0.06)] bg-[rgba(11,11,12,0.72)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#d8d9e3]">
                    Close when PnL + funding exceeds
                  </p>
                  <button
                    type="button"
                    onClick={() => setTakeProfitEnabled((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                      takeProfitEnabled
                        ? "border-[rgba(214,176,106,0.58)] bg-[rgba(120,90,40,0.36)]"
                        : "border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)]"
                    }`}
                    aria-pressed={takeProfitEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-[#f5f5f5] transition-transform ${
                        takeProfitEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={!takeProfitEnabled}
                    value={takeProfitWithFundingPct}
                    onChange={(e) => {
                      const sanitized = sanitizePercentInput(e.target.value);
                      if (sanitized !== null)
                        setTakeProfitWithFundingPct(sanitized);
                    }}
                    className={`h-[34px] w-[88px] rounded-[9px] border px-2 text-center text-[13px] outline-none ${
                      takeProfitEnabled
                        ? "border-[rgba(173,134,73,0.5)] bg-[#0c0a08] text-[#e8d5b5]"
                        : "cursor-not-allowed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#777884]"
                    }`}
                  />
                  <span className="text-[12px] text-[#9c9cac]">%</span>
                  {[5, 10, 15].map((preset) => (
                    <button
                      key={`tp-${preset}`}
                      type="button"
                      disabled={!takeProfitEnabled}
                      onClick={() =>
                        applyRulePreset(preset, "takeProfitWithFunding")
                      }
                      className={`h-[28px] rounded-[8px] border px-2.5 text-[11px] transition-colors ${
                        takeProfitEnabled
                          ? "border-[rgba(173,134,73,0.4)] text-[#d6c39f] hover:border-[rgba(206,163,95,0.62)]"
                          : "cursor-not-allowed border-[rgba(255,255,255,0.1)] text-[#6f7080]"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!dualValid || isPreparing}
            onClick={handlePrimaryAction}
            className={clsx(
              "h-[46px] w-full text-[12px] font-semibold uppercase tracking-[0.7px] transition-all max-tablet:h-[44px]",
              isV2Shell
                ? !dualValid || isPreparing
                  ? "cursor-not-allowed rounded-[10px] border border-[#5c4d38] bg-transparent text-[#c9a962] opacity-95"
                  : "rounded-[10px] border border-[#c9a962] bg-gradient-to-b from-[#3a3024] to-[#14110d] text-[#f5ead6] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:brightness-110 active:translate-y-[1px]"
                : "rounded-[11px] border border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(43,34,24,0.98)_0%,rgba(19,15,11,0.99)_100%)] text-[#f0ddb9] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:-translate-y-[1px] hover:border-[rgba(206,163,95,0.74)] hover:bg-[linear-gradient(180deg,rgba(49,39,29,1)_0%,rgba(22,18,13,1)_100%)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] disabled:pointer-events-none disabled:border-[rgba(173,134,73,0.28)] disabled:text-[#b8a78a] disabled:opacity-90",
            )}
          >
            <span className="inline-flex items-center gap-2">
              {firstDisconnectedVenue && <Wallet className="h-3.5 w-3.5" />}
              {primaryLabel}
            </span>
          </button>
        </div>

        <aside
          className={clsx(
            "rounded-[12px] border p-4 max-tablet:order-last max-tablet:p-3",
            isV2Shell
              ? "border-[#1f1f1f] bg-[#0a0a0a]"
              : "rounded-[16px] border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(11,11,12,0.92)_0%,rgba(8,8,8,0.96)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.32)]",
          )}
        >
          <p
            className={clsx(
              "mb-3 font-['Onest',sans-serif] text-[14px] font-semibold uppercase tracking-[1.1px]",
              isV2Shell ? "text-[#c9a962]" : "text-[#e8d5b5]",
            )}
          >
            Vault Details
          </p>
          <div
            className={clsx(
              "mb-4 grid grid-cols-2 gap-0 overflow-hidden rounded-[10px]",
              isV2Shell
                ? "border border-[#1f1f1f] bg-[#050505]"
                : "rounded-[11px] bg-[rgba(8,8,9,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
            )}
          >
            <div
              className={clsx(
                "p-2.5 border-r border-b",
                isV2Shell
                  ? "border-[#1f1f1f]"
                  : "border-[rgba(255,255,255,0.07)]",
              )}
            >
              <VaultMetricLabel
                label="APY"
                description="Estimated yearly return if current conditions continue."
              />
              <p
                className={clsx(
                  "font-mono text-[16px] font-semibold max-tablet:text-[14px]",
                  isV2Shell ? "text-[#d4af37]" : "text-[#e8d5b5]",
                )}
              >
                {crossDexApr.toFixed(1)}% APY
              </p>
            </div>
            <div
              className={clsx(
                "p-2.5 border-b",
                isV2Shell
                  ? "border-[#1f1f1f]"
                  : "border-[rgba(255,255,255,0.07)]",
              )}
            >
              <VaultMetricLabel
                label="Current Spread"
                description="Funding-rate gap between your short side and long side. A bigger positive spread usually means better earning potential."
              />
              <p
                className={`font-mono text-[16px] font-semibold max-tablet:text-[14px] ${spreadDisplayPct >= 0 ? "text-[color:var(--vault-pnl-positive)]" : "text-[color:var(--vault-pnl-negative)]"}`}
              >
                {formatSignedPct(spreadDisplayPct)} / {spreadDisplayHours}h
              </p>
            </div>
            <div
              className={clsx(
                "p-2.5 border-r",
                isV2Shell
                  ? "border-[#1f1f1f]"
                  : "border-[rgba(255,255,255,0.07)]",
              )}
            >
              <VaultMetricLabel
                label="Max Drawdown (30d)"
                description="Biggest drop the strategy saw in the last 30 days."
              />
              <p className="font-mono text-[16px] font-semibold text-[color:var(--vault-pnl-negative)] max-tablet:text-[14px]">
                {maxDrawdown30d.toFixed(1)}%
              </p>
            </div>
            <div className="p-2.5">
              <VaultMetricLabel
                label="Hedge Integrity"
                description="How well long and short positions cancel each other. Closer to 100% is better."
              />
              <p className="font-mono text-[16px] font-semibold text-[#8e9eb0] max-tablet:text-[14px]">
                {hedgeIntegrity.toFixed(1)}%
              </p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={spreadSubtitleKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={clsx(
                "mb-4 text-[11px]",
                isV2Shell ? "text-[#666666]" : "text-[#717182]",
              )}
            >
              Spread model · {dexA || "—"} ⇄ {dexB || "—"} · {marketLabel}
            </motion.p>
          </AnimatePresence>

          <div className="space-y-4">
            <div className="border-b border-[rgba(255,255,255,0.08)] pb-3 font-mono text-[12px]">
              <p className="mb-2 text-[12px] uppercase tracking-[1px] text-[#9c9cac]">
                Current funding details
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Short Leg Funding"
                    description="Funding rate currently applied to your short side."
                    className="text-[13px] text-[#8f90a1]"
                  />
                  <span className="text-[13px] text-[color:var(--vault-leg-short-fg)]">
                    {formatSignedPct(shortRatePerInterval)} /{" "}
                    {shortFundingIntervalHours}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Long Leg Funding"
                    description="Funding rate currently applied to your long side."
                    className="text-[13px] text-[#8f90a1]"
                  />
                  <span className="text-[13px] text-[color:var(--vault-leg-long-fg)]">
                    {formatSignedPct(longRatePerInterval)} /{" "}
                    {longFundingIntervalHours}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Net Capture"
                    description="What the vault actually keeps: the short leg's funding minus the long leg's."
                    className="text-[13px] text-[#8f90a1]"
                  />
                  <span className="text-[13px] text-[#e8d5b5]">
                    {formatSignedPct(spreadFunding8h)} / 8h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Funding Settlement"
                    description="Time left until the next funding settlement."
                    className="text-[13px] text-[#8f90a1]"
                  />
                  <span className="text-[13px] text-[#ccb17f]">
                    {formatHms(secondsToRent)}
                  </span>
                </div>
                <div className="text-[12px] leading-relaxed text-[#717182]">
                  Policy: Pacifica 1h, Hyperliquid 4h, Nado 8h. Payout timer
                  uses the higher interval of the two selected DEXs.
                </div>
              </div>
            </div>

            <div className="border-b border-[rgba(255,255,255,0.08)] pb-3">
              <span className="mb-1 block text-[12px] uppercase tracking-[0.8px] text-[#9c9cac]">
                Costs
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Fees Drag (Est.)"
                    description="Estimated return lost to trading and execution fees."
                    className="text-[#8f90a1] text-[13px]"
                  />
                  <span className="text-[#e8d5b5] text-[13px]">
                    {feesDragEst.toFixed(3)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Avg Slippage"
                    description="Average difference between expected price and actual filled price."
                    className="text-[#8f90a1] text-[13px]"
                  />
                  <span className="text-[#e8d5b5] text-[13px]">
                    {avgSlippage.toFixed(3)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <VaultMetricLabel
                    label="Funding Volatility"
                    description="How unstable funding rates are right now (Low, Medium, or High)."
                    className="text-[#8f90a1] text-[13px]"
                  />
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${fundingVolBucket === "Low" ? "bg-[rgba(100,118,102,0.14)] text-[color:var(--vault-leg-long-fg)]" : fundingVolBucket === "Medium" ? "bg-[rgba(184,149,106,0.14)] text-[#b8956a]" : "bg-[rgba(112,82,80,0.14)] text-[color:var(--vault-pnl-negative)]"}`}
                  >
                    {fundingVolBucket}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
