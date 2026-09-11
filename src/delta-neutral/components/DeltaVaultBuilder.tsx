import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Cookie, Wallet } from "lucide-react";
import { VaultControls } from "./VaultControls";
import { LeverageControl } from "./LeverageControl";
import { TokenPicker } from "./TokenPicker";
import { VaultOpeningOverlay } from "./VaultOpeningOverlay";
import { VariationalOnboardingModal } from "./VariationalOnboardingModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { DexLabel } from "./DexLogo";
import { VaultMetricLabel } from "./VaultMetricLabel";
import {
  MarketMetricsPanel,
  PositionSummaryStrip,
  type MarketMetric,
} from "./PositionSummaryStrip";
import {
  THEME_CATALOG,
  filterTokens,
  legStructureFor,
  marketProfileFor,
  tokenSupportsStructure,
  type InstrumentType,
  type LegStructure,
  type ThemeOption,
  type TokenOption,
} from "../utils/markets";
import { formatWalletAddress } from "../utils/wallet";
import {
  DEX_FUNDING_INTERVAL_HOURS,
  DEX_PROFILES,
  maxFundingSpread8h,
  resolveCashAndCarryLegs,
  resolveLegs,
  type DexSelection,
  type ManagedDexId,
} from "../utils/legs";
import {
  buildPositionSummary,
  EPOCHS_PER_YEAR,
  type PositionSummary,
} from "../utils/positionSummary";
import {
  formatApr,
  formatCompactPct,
  formatCompactUsd,
  formatCostPct,
  formatHms,
  formatPct,
  formatSignedPct,
  formatUsd,
} from "../utils/format";

const PREPARE_MS = 5000;

export type { ManagedDexId };
type MarketMode = "themes" | "tokens";

type MarketSelection = {
  mode: MarketMode;
  themes: ThemeOption[];
  token: TokenOption;
};

const MAX_NOTIONAL = 10000;

function parseMoney(s: string): number {
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Whole dollars — the margin readout is for sizing, not for settlement. */

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



/**
 * Annualised funding, signed from the vault's point of view. Kept at 2dp because it is
 * read against the headline APY, not against the 4dp per-interval rates.
 */


function formatThemesSelection(themes: ThemeOption[]): string {
  if (themes.length === 0) return "Select categories";
  return themes.join(", ");
}

function createMockWalletAddress(dex: ManagedDexId) {
  const seed: Record<ManagedDexId, string> = {
    Hyperliquid: "0x7a3f84",
    Nado: "0x92bc18",
    Pacifica: "0x4d5e09",
    Variational: "0x6b1fa7",
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

/**
 * One selected venue's funding, stated as the venue's own rate. Legs are assigned at
 * execution, not at setup, so nothing here is framed as earned or paid.
 */
type VenueReadout = {
  dex: ManagedDexId;
  /** Funding at the venue's own settlement interval, e.g. "+0.0035% / 1h". */
  funding: string;
  /** The same rate annualised, so venues on different clocks compare on one basis. */
  apr: number;
};

/** The market's three headline figures, preformatted. */
type StrategyMetrics = {
  /** Preformatted — the strip renders it, the summary owns the arithmetic. */
  apy: string;
  apyPositive: boolean;
  /** Live cross-venue funding spread, %/8h. */
  currentSpread: string;
  spreadPositive: boolean;
  /** The lookback ceiling the live spread is read against. */
  maxFundingSpread: string;
};

const POSITIVE = "text-[#4ade80]";
/*
  Not --vault-pnl-positive/negative. Those two tokens are muted (#9eada2 / #a88884) so
  that a table of many P&L cells does not strobe; three metrics in one readout is not
  that table, and half of them at full saturation next to half at a quarter of it reads
  as two different kinds of number.
*/
const NEGATIVE = "text-[#f87171]";

/**
 * The market's three figures, as one list for both shapes.
 *
 * The rate on offer, the spread it is earned from, and the ceiling that spread is read
 * against. A spread means little without the band it has been moving in.
 *
 * All three are stated at significant figures rather than at a fixed 6dp (see
 * formatCompactPct). The predecessor padded every one to six decimal places, which is
 * how "0.000005" and "0.014000" ended up in the same row — one all zeros, the other all
 * padding, neither scannable.
 *
 * One list because the two layouts now render these in different places — a 48px strip
 * under the token selector in one, a card in the right column in the other — and two
 * copies of the labels is how the same figure ends up called two things.
 */
function marketMetrics(metrics: StrategyMetrics): MarketMetric[] {
  return [
    {
      label: "APY",
      description:
        "The return on the cash you actually post, annualised at the current funding spread and net of every cost. It moves with the spread, so it is a rate on offer now rather than a rate you are promised.",
      value: metrics.apy,
      tone: metrics.apyPositive ? POSITIVE : NEGATIVE,
    },
    {
      label: "Current Spread",
      description:
        "The funding the two legs pull apart by right now, per 8h — what the position is paid before entry costs. On a spot/perp pair only one leg quotes funding, so the perp's own rate is the whole capture.",
      value: metrics.currentSpread,
      tone: metrics.spreadPositive ? POSITIVE : NEGATIVE,
    },
    {
      label: "Max Funding Spread",
      description:
        "The widest those two rates pulled apart at any point in the venues' lookback window, per 8h — the ceiling the live spread above is read against.",
      value: metrics.maxFundingSpread,
      tone: NEGATIVE,
    },
  ];
}

/**
 * The strip's escape hatch. Opens on hover for mouse users (cheap to peek at) and pins
 * on click so the numbers can be read without holding the pointer still — the panel
 * carries a live countdown and per-venue figures, which is more than a tooltip should own.
 */
function StrategyBreakdownPanel({
  contextLabel,
  venues,
  netCapture,
  hedgeIntegrity,
  fundingSettlement,
  className,
}: {
  contextLabel: string;
  venues: VenueReadout[];
  netCapture: string;
  hedgeIntegrity: string;
  fundingSettlement: string;
  /** Lets the card layout hand it the footer's full width, as Details gets. */
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };
  useEffect(() => clearTimers, []);

  // Touch has no hover state; taps fall through to the click handler instead.
  const isMouse = (e: React.PointerEvent) => e.pointerType === "mouse";

  const handleEnter = (e: React.PointerEvent) => {
    if (!isMouse(e)) return;
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open || openTimer.current !== null) return;
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, 120);
  };

  const handleLeave = (e: React.PointerEvent) => {
    if (!isMouse(e)) return;
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (pinned || closeTimer.current !== null) return;
    // Long enough to cross the gap between the trigger and the panel.
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, 180);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Esc or an outside click dismisses for good, pin included.
        if (!next) {
          clearTimers();
          setPinned(false);
        }
        setOpen(next);
      }}
    >
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="More info — funding and APR for each venue"
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
          onClick={() => {
            clearTimers();
            const nextPinned = !pinned;
            setPinned(nextPinned);
            setOpen(nextPinned);
          }}
          className={clsx(
            "flex h-full shrink-0 items-center gap-1.5 border-l border-[rgba(255,255,255,0.07)] px-3 text-[10px] font-medium uppercase leading-[12px] tracking-[0.45px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-[#c9a962]",
            open
              ? "bg-[rgba(214,176,106,0.12)] text-[#e2c68b]"
              : "text-[#9f875c] hover:bg-[rgba(214,176,106,0.08)] hover:text-[#e2c68b]",
            className,
          )}
        >
          More Info
          <ChevronDown
            className={clsx(
              "h-3 w-3 shrink-0 transition-transform duration-150",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        sideOffset={8}
        // A hover peek must not steal focus; a pinned open should land inside.
        onOpenAutoFocus={(e) => {
          if (!pinned) e.preventDefault();
        }}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        className="z-[130] w-[300px] border border-[rgba(146,111,56,0.55)] bg-[#090909] p-3 text-[#f5f5f5]"
      >
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.9px] text-[#c9a962]">
            Strategy details
          </p>
          <p className="truncate font-mono text-[10px] text-[#7d7e88]">
            {contextLabel}
          </p>
        </div>
        <div className="mt-2.5 space-y-2">
          {venues.map((venue) => (
            <div
              key={venue.dex}
              className="rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-2.5"
            >
              <DexLabel
                dex={venue.dex}
                className="text-[12px] text-[#ececf3]"
              />
              <dl className="mt-2 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#8b8b98]">Funding</dt>
                  <dd className="text-[#ececf3]">{venue.funding}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#8b8b98]">APY</dt>
                  <dd className="text-[#ececf3]">{formatApr(venue.apr)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <dl className="mt-2.5 space-y-2 border-t border-[rgba(255,255,255,0.08)] pt-2.5 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9c9cac]">Net Capture</dt>
            <dd className="text-right text-[#e8d5b5]">{netCapture}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9c9cac]">Hedge Integrity</dt>
            <dd className="text-[#9babc0]">{hedgeIntegrity}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#9c9cac]">Funding Settlement</dt>
            <dd className="text-[#ccb17f]">{fundingSettlement}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/**
 * A wrapper that is only a box when it needs to be.
 *
 * The two summary placements group the same blocks differently -- one wants the
 * controls in a left column, the other wants Margin and Leverage in a grid of their
 * own -- and the alternative to this is the whole control stack written out twice,
 * where the copy that is not being looked at quietly rots.
 */
function MaybeBox({
  when,
  className,
  children,
}: {
  when: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return when ? <div className={className}>{children}</div> : <>{children}</>;
}

/** Both legs move together, so the multiplier is a range rather than a set of presets. */
const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 50;
/*
 * Three, not ten. Leverage multiplies the headline rate, so a high default is how an
 * honest spread gets presented as a triple-digit APR — and on a hedged position it is
 * the one dial that also multiplies liquidation risk on both legs at once.
 */
const DEFAULT_LEVERAGE = 3;

/** Read out beside the slider so the number carries its risk framing with it. */
function leverageProfile(value: number) {
  if (value <= 3) return "Conservative";
  if (value <= 10) return "Balanced";
  if (value <= 25) return "Higher yield";
  return "Aggressive";
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
  /** The instrument each leg trades. Derived structure arrives alongside it. */
  legA: InstrumentType;
  legB: InstrumentType;
  structure: LegStructure;
  onLegInstrumentChange: (slot: "a" | "b", instrument: InstrumentType) => void;
  market: MarketSelection;
  onModeChange: (mode: MarketMode) => void;
  onThemesChange: (themes: ThemeOption[]) => void;
  onTokenChange: (token: TokenOption) => void;
  strategyMetrics: StrategyMetrics & {
    /** In the order the user picked them — DEX A, then DEX B. */
    venues: VenueReadout[];
    netCapture: string;
    hedgeIntegrity: string;
    fundingSettlement: string;
  };
  /** Per-leg entry cost, keyed by venue. Absent until both venues resolve. */
  legSlippage?: Partial<
    Record<ManagedDexId, { side: "long" | "short"; pct: number; usd: number }>
  >;
  /**
   * What the current settings add up to. Rendered as a strip under the market row —
   * the position's economics belong next to the market they belong to, the same
   * argument that put APY and Current Spread there.
   *
   * Only when `showSummaryStrip` says so: the other layout keeps the summary as a
   * card in its own column, and rendering it in both places would state the same
   * three figures twice on one screen.
   */
  summary: PositionSummary | null;
  showSummaryStrip?: boolean;
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
  legA,
  legB,
  structure,
  onLegInstrumentChange,
  market,
  onModeChange,
  onThemesChange,
  onTokenChange,
  strategyMetrics,
  legSlippage,
  summary,
  showSummaryStrip = false,
  variant = "default",
}: DexPairSetupCardProps) {
  const isV2 = variant === "v2";
  /**
   * The venue trigger inside the fused DEX field. It gives up its own border, fill
   * and radius so the wrapper can own them — otherwise the row reads as two boxes
   * jammed together rather than one control.
   *
   * `h-full!` is not decoration: the shared Select carries `data-[size=default]:h-9`,
   * an attribute selector that outranks any plain height utility, so the trigger
   * would sit 36px tall inside a 40px field and leave a dead strip under it.
   */
  const fusedSelectTriggerClass = clsx(
    "h-full! w-full rounded-none border-0 bg-transparent px-3 text-left shadow-none transition-colors focus:ring-0 focus-visible:ring-0 [&_svg]:h-3.5 [&_svg]:w-3.5",
    isV2
      ? "text-[#E8E2D2] hover:bg-[rgba(255,255,255,0.02)] [&_svg]:text-[#d4af37]/80"
      : "hover:bg-[rgba(255,255,255,0.025)] [&_svg]:text-[rgba(227,202,157,0.76)]",
  );
  /**
   * Both rows of a DEX card split at this same offset, which is what makes the
   * card read as aligned. Pulled out so the two can never drift apart.
   */
  const dexFieldAsideClass = "w-[116px] shrink-0 border-l max-tablet:w-[104px]";
  const selectContentClass = clsx(
    isV2
      ? "border-[#3d3428] bg-[#0d0d0d] text-[#E8E2D2]"
      : "border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(25,22,18,0.98)_0%,rgba(14,12,10,0.99)_100%)] text-[#f1dfbf]",
  );
  const marketDisabled = dexA === "" || dexB === "";
  /*
   * Whether the market's own figures sit beside the token selector.
   *
   * Only in the strip layout, and for the same reason the position summary is a strip
   * there: one column, so a readout belongs under the thing it describes. The column
   * layout moved them to the right column instead, where the readouts live -- so the
   * row is the selector alone and the selector takes all of it, exactly as it does
   * before any venues are picked.
   */
  const metricsInRow = showSummaryStrip;
  const renderDexSelector = (
    slot: "a" | "b",
    value: DexSelection,
    excludeDex: DexSelection,
    onChange: (v: DexSelection) => void,
  ) => {
    const connected = value !== "" ? dexConnectionMap[value] : false;
    const instrument = slot === "a" ? legA : legB;
    const otherInstrument = slot === "a" ? legB : legA;
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
        {/* Primary field — venue and the book it trades on are one decision, so
            they are one 40px control split by a rule, not two boxes with a gap
            between them. This row is the tallest thing in the card because it is
            the only thing in the card the user actually has to decide. */}
        <div
          className={clsx(
            // No focus-within accent: the field keeps the same border whether or
            // not the venue select inside it holds focus.
            "flex h-10 items-stretch overflow-hidden rounded-[10px] border shadow-[inset_0_2px_6px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
            isV2
              ? "border-[#2a2a2a] bg-[#0d0d0d]"
              : "border-[rgba(255,255,255,0.1)] bg-[linear-gradient(180deg,rgba(19,19,21,0.96)_0%,rgba(11,11,13,0.98)_100%)]",
          )}
        >
          <div className="min-w-0 flex-1">
            <Select
              value={value || undefined}
              onValueChange={(v) => onChange(v as ManagedDexId)}
            >
              <SelectTrigger className={fusedSelectTriggerClass}>
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
          <div
            role="group"
            aria-label={`Instrument for DEX ${slot.toUpperCase()}`}
            // A flat well holding two rounded keys, mirroring the Active Vaults
            // filter group exactly: same padding and gap, and — critically — no
            // inset shadow. An inset shadow here casts a dark band over the top
            // ~7px of the well, which sits right on the selected key's top border
            // and reads as the border being cropped. Flat keeps it crisp.
            className={clsx(
              // p-1 (not p-1.5): the well shares the 40px field, so the tighter
              // inset lets each key stand ~30px tall — matching the height of the
              // Active Vaults filter tabs it borrows its look from, instead of a
              // shrunken 26px chip floating in the field.
              "flex items-stretch gap-1 p-1",
              dexFieldAsideClass,
              isV2
                ? "border-[#232323] bg-[#0d0d0d]"
                : "border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.78)]",
            )}
          >
            {(["Perp", "Spot"] as InstrumentType[]).map((option) => {
              const active = instrument === option;
              // A vault needs one leg short to hedge the other, and you cannot
              // short spot — so the second spot is refused rather than silently
              // rewriting the leg the user set first.
              const blocked = option === "Spot" && otherInstrument === "Spot";
              return (
                <button
                  key={option}
                  type="button"
                  disabled={blocked}
                  aria-pressed={active}
                  title={
                    blocked
                      ? "One leg must be a perp — both legs cannot trade spot."
                      : undefined
                  }
                  onClick={() => onLegInstrumentChange(slot, option)}
                  // The primary control in this card. It reuses the exact
                  // recipe of the Active Vaults "All" filter tab — same gold
                  // border, gradient fill, radius, type and ink — so the two
                  // controls read as one family. The inactive segment stays
                  // borderless so only one key at a time looks pressable.
                  className={clsx(
                    "flex-1 cursor-pointer rounded-[9px] border border-transparent px-1 text-[10px] font-semibold uppercase tracking-[0.85px] transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                    active
                      ? "border-[rgba(214,176,106,0.42)] bg-[linear-gradient(180deg,rgba(54,42,28,0.96)_0%,rgba(22,18,13,0.98)_100%)] text-[#f0ddb9]"
                      : "text-[#9394a1] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#d9dae4]",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary field — a readout, not a control, so it is shorter and flat
            where the field above is recessed. It splits at the same offset, which
            is what lines the two rows up. Deposit is a quiet inline action here:
            as a filled gold button it competed with the instrument toggle directly
            above it, and it is nowhere near the most important thing on screen. */}
        <div
          className={clsx(
            "mt-1.5 flex h-8 items-stretch overflow-hidden rounded-[8px] border",
            isV2
              ? "border-[#242424] bg-[#0f0f0f]"
              : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.022)]",
          )}
        >
          {connected ? (
            <>
              {/* Green accent is scoped to the balance cell — it stops at the
                  divider so the Deposit action stays neutral. #4ade80 is the same
                  green the APY metric in this card already uses. */}
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 bg-[rgba(74,222,128,0.08)] px-2.5">
                <span className="shrink-0 text-[10px] uppercase tracking-[0.8px] text-[#9de7b5]">
                  Balance
                </span>
                <span className="truncate font-mono text-[12px] font-medium text-[#4ade80]">
                  {formatCompactUsd(dexBalanceMap[value])}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (value) onDepositDex(value);
                }}
                className={clsx(
                  "cursor-pointer text-[10px] font-semibold uppercase tracking-[0.85px] transition-colors",
                  dexFieldAsideClass,
                  isV2
                    ? "border-[#242424] text-[#b99a5e] hover:bg-[rgba(212,175,55,0.07)] hover:text-[#d8bd83]"
                    : "border-[rgba(255,255,255,0.07)] text-[#c2ab80] hover:bg-[rgba(214,176,106,0.08)] hover:text-[#f0ddb9]",
                )}
              >
                Deposit
              </button>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5">
                <DexConnIndicator connected={false} />
                <span
                  className={clsx(
                    "truncate text-[11px]",
                    isV2 ? "text-[#7c7c7c]" : "text-[#82838f]",
                  )}
                >
                  {value === "" ? "No venue selected" : "Not connected"}
                </span>
              </div>
              <button
                type="button"
                disabled={value === ""}
                onClick={() => {
                  if (value) onConnectDex(value);
                }}
                className={clsx(
                  "text-[10px] font-semibold uppercase tracking-[0.85px] transition-colors",
                  dexFieldAsideClass,
                  isV2 ? "border-[#242424]" : "border-[rgba(255,255,255,0.07)]",
                  value === ""
                    ? "cursor-not-allowed text-[#5f606c]"
                    : isV2
                      ? "cursor-pointer text-[#b99a5e] hover:bg-[rgba(212,175,55,0.07)] hover:text-[#d8bd83]"
                      : "cursor-pointer text-[#c2ab80] hover:bg-[rgba(214,176,106,0.08)] hover:text-[#f0ddb9]",
                )}
              >
                Connect
              </button>
            </>
          )}
        </div>

        {/*
          Which side this venue takes, and what it costs to get on there.

          It belongs on the venue row rather than in a separate execution panel: this
          is where the venue is chosen, so it is where the consequence of choosing it
          should appear. Sides are not a control — funding assigns them (see
          resolveLegs) — so this is a readout, and the totals roll up into Price
          impact in the Position Summary, where they add up against the fees rather
          than floating free of them.
        */}
        {value !== "" && legSlippage?.[value] && (
          <div
            className={clsx(
              "mt-2.5 flex items-center justify-between gap-2 border-t pt-2.5",
              isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.06)]",
            )}
          >
            <span
              className={clsx(
                "rounded-[5px] px-1.5 py-0.5 ds-eyebrow",
                legSlippage[value]!.side === "long"
                  ? "bg-[rgba(100,118,102,0.16)] text-[color:var(--vault-leg-long-fg)]"
                  : "bg-[rgba(112,82,80,0.18)] text-[color:var(--vault-pnl-negative)]",
              )}
            >
              {legSlippage[value]!.side === "long" ? "Long" : "Short"}
              <span className="ml-1 text-[#82838f]">{instrument}</span>
            </span>
            <span className="flex items-baseline gap-2 tabular-nums">
              <span className="text-meta text-[#63646f]">Est. slippage</span>
              <span className="text-micro tabular-nums text-[#b4b5c2]">
                {formatCostPct(legSlippage[value]!.pct)}
              </span>
              <span className="text-micro tabular-nums text-[#82838f]">
                {formatUsd(legSlippage[value]!.usd)}
              </span>
            </span>
          </div>
        )}

        {connected && (
          <div
            className={clsx(
              "mt-2.5 flex items-center gap-2.5 border-t pt-2.5",
              isV2 ? "border-[#1f1f1f]" : "border-[rgba(255,255,255,0.06)]",
            )}
          >
            <Wallet
              className={clsx(
                "h-3.5 w-3.5 shrink-0",
                isV2 ? "text-[#7c7c7c]" : "text-[#82838f]",
              )}
              aria-hidden
            />
            <span
              className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#b9bac6]"
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
              className="shrink-0 cursor-pointer rounded-[6px] px-1.5 py-1 text-[11px] font-medium text-[#e06a6a] transition-colors hover:bg-[rgba(248,113,113,0.1)] hover:text-[#fca5a5]"
            >
              Change wallet
            </button>
          </div>
        )}
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
      {/* Structure is no longer picked here — it is the sum of the two per-leg
          instrument toggles above, so this panel lost its header band. It still
          reads the resolved structure, which is what filters the token list. */}
      <div
        className={clsx(
          "relative z-[1] mt-4 overflow-hidden rounded-[12px] border",
          isV2
            ? "border-[#2a2a2a] bg-[#0b0b0b]"
            : "border-[rgba(255,255,255,0.08)] bg-[rgba(12,12,14,0.6)]",
        )}
      >
        <div className="p-3">
          <label
            className={clsx(
              "mb-2 block text-[11px] uppercase tracking-[1.2px]",
              isV2 ? "text-[#888888]" : "text-[#8f90a1]",
            )}
          >
            Market
          </label>
          {/* Row 1 — the child switcher. Offered identically under both structures. */}
          <div
            className={clsx(
              // Deliberately smaller than the tab strip above it: a subordinate
              // control inside the panel, not a second set of tabs.
              //
              // `items-center` matters: without it the chips fall back to
              // flex-start, so any rounding in the track's height lands entirely
              // on the bottom gap and the chip reads as sitting low.
              "inline-flex h-[32px] items-center rounded-[8px] border p-[3px]",
              isV2
                ? "border-[#232323] bg-[#0a0a0a]"
                : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]",
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
                    // 24px, not 26: the track is 32 tall with a 1px border and 3px
                    // of padding, so 24 is all the room there is. At 26 the chip
                    // overflowed its own track.
                    "h-[24px] cursor-pointer rounded-[6px] border px-3 text-[12px] font-medium tracking-[0.2px] transition-colors disabled:cursor-not-allowed",
                    // Subordinate switcher: a flat gold tint, no rim and no
                    // gradient. The gradient's dark bottom stop was reading as a
                    // shadow edge under the chip, which is exactly the weight this
                    // control should not carry — depth belongs to the instrument
                    // toggle. The border stays in the class list as transparent so
                    // both states keep the same box.
                    active
                      ? isV2
                        ? "border-transparent bg-[rgba(201,169,98,0.14)] text-[#d5bd8b]"
                        : "border-transparent bg-[rgba(214,176,106,0.16)] text-[#e8d5b5]"
                      : isV2
                        ? "border-transparent text-[#888888] hover:text-[#c4c4c4]"
                        : "border-transparent text-[#7f8090] hover:text-[#cfcfd8]",
                  )}
                >
                  {mode === "themes" ? "Categories" : "Tokens"}
                </button>
              );
            })}
          </div>

          {/* Row 2 — the market selector, sized to its label, beside its live metrics. */}
          <div className="mt-2 flex flex-col gap-2 min-[1100px]:flex-row min-[1100px]:items-stretch">
            {market.mode === "tokens" && (
              <TokenPicker
                disabled={marketDisabled}
                value={market.token}
                onChange={onTokenChange}
                structure={structure}
                variant={variant}
                // Sized to hold the longest pair alongside the leg-structure label, so
                // the metric strip beside it takes the rest of the row. With no strip to
                // sit next to, it spans the row.
                className={
                  marketDisabled || !metricsInRow
                    ? "w-full"
                    : "shrink-0 min-[1100px]:w-[240px]"
                }
              />
            )}

            {metricsInRow && market.mode === "tokens" && !marketDisabled && (
              /*
                The market's three figures beside the selector they belong to. The list
                and the labels come from `marketMetrics`; only the arrangement is here.

                The settlement clock moved into Strategy details, beside the per-venue
                funding intervals that set it.
              */
              <div className="grid h-[48px] min-w-0 flex-1 grid-cols-[repeat(3,minmax(0,1fr))_auto] overflow-hidden rounded-[10px] border border-[rgba(214,176,106,0.16)] bg-[#080808] min-[1100px]:max-w-[720px]">
                {marketMetrics(strategyMetrics).map((metric, index) => (
                  <div
                    key={metric.label}
                    className={clsx(
                      "flex min-w-0 flex-col justify-center gap-1 px-2.5",
                      index > 0 &&
                        "border-l border-[rgba(255,255,255,0.07)]",
                    )}
                  >
                    <p
                      className="min-w-0 truncate text-[10px] font-medium uppercase leading-[12px] tracking-[0.45px] text-[#9b9cad]"
                      title={metric.label}
                    >
                      {metric.label}
                    </p>
                    <p
                      className={clsx(
                        "min-w-0 truncate font-mono text-[15px] font-semibold leading-[18px]",
                        metric.tone,
                      )}
                    >
                      {metric.value}
                    </p>
                  </div>
                ))}
                <StrategyBreakdownPanel
                  contextLabel={market.token}
                  venues={strategyMetrics.venues}
                  netCapture={strategyMetrics.netCapture}
                  hedgeIntegrity={strategyMetrics.hedgeIntegrity}
                  fundingSettlement={strategyMetrics.fundingSettlement}
                />
              </div>
            )}

            {market.mode === "themes" && (
              <div
                role="group"
                aria-label="Market categories. Select one or more."
                className={clsx(
                  "grid w-full grid-cols-2 gap-1 rounded-[10px] border p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] min-[560px]:grid-cols-3",
                  isV2
                    ? "border-[#2a2a2a] bg-[#0a0a0a]"
                    : "border-[rgba(255,255,255,0.09)] bg-[rgba(10,10,11,0.94)]",
                  marketDisabled ? "opacity-50" : "",
                )}
              >
                {THEME_CATALOG.map(({ value: themeOption, description, icon: ThemeIcon }) => {
                  const selected = market.themes.includes(themeOption);
                  return (
                    <Tooltip key={themeOption} delayDuration={180}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          disabled={marketDisabled}
                          aria-pressed={selected}
                          onClick={() => {
                            if (selected) {
                              onThemesChange(
                                market.themes.filter((x) => x !== themeOption),
                              );
                            } else {
                              onThemesChange([...market.themes, themeOption]);
                            }
                          }}
                          className={clsx(
                            "min-h-[40px] min-w-0 rounded-[8px] border px-2.5 py-2 font-['Onest',sans-serif] text-[12px] font-semibold leading-tight tracking-[0.2px] transition-all focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1",
                            selected
                              ? isV2
                                ? "border-[#c9a962] bg-[#141414] text-[#c9a962] focus-visible:outline-[#c9a962]"
                                : "border-[rgba(214,176,106,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] focus-visible:outline-[#d6b06a]"
                              : isV2
                                ? "border-transparent text-[#888888] hover:border-[#3d3428] hover:bg-[#141414] hover:text-[#c4c4c4] focus-visible:outline-[#c9a962]"
                                : "border-transparent text-[#9a9ba8] hover:border-[rgba(214,176,106,0.22)] hover:bg-[rgba(120,90,40,0.14)] hover:text-[#f1dfbf] focus-visible:outline-[#d6b06a]",
                            marketDisabled && "cursor-not-allowed",
                          )}
                        >
                          <span className="flex min-w-0 items-center justify-center gap-1.5">
                            {selected ? (
                              <Check
                                className="h-3 w-3 shrink-0"
                                strokeWidth={2.5}
                                aria-hidden
                              />
                            ) : (
                              <ThemeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            )}
                            <span className="truncate">{themeOption}</span>
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        sideOffset={6}
                        className="z-[130] max-w-[240px] border border-[rgba(146,111,56,0.45)] bg-[#0a0a0a] text-[#e8d5b5]"
                      >
                        <p className="mb-0.5 font-semibold text-[#f0ddb9]">
                          {themeOption}
                        </p>
                        <p className="leading-relaxed text-[#a8a8b8]">
                          {description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>

          {/*
            Row 3 — what the position itself comes to, directly under the market it is
            taken in and the rates it is taken at. Same 48px readout as the strip above
            so the two stack as one block: market economics, then position economics.

            Tokens only, and only once both venues resolve, which is the same gate the
            metric strip sits behind. Categories select a basket rather than a position
            — there is no pair, no resolved legs and no cost to open to state — so the
            row is absent there rather than present and empty.
          */}
          {showSummaryStrip && market.mode === "tokens" && !marketDisabled && (
            <PositionSummaryStrip summary={summary} className="mt-2" />
          )}
        </div>
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
};

type DeltaVaultBuilderProps = {
  onActivate?: (payload: DeltaVaultBuilderResult) => void;
  variant?: BuilderUiVariant;
  /**
   * Where the position summary goes, and with it the whole shape of the builder.
   *
   * "panel" is the original: two columns at 1180px, controls stacked on the left and
   * a tall summary card with the CTA under it on the right.
   *
   * "market-strip" folds the summary into a 48px readout under the market row, which
   * lets the builder collapse to one column and pair Margin with Leverage.
   *
   * A prop rather than a swap because the two Delta Neutral versions are separate
   * surfaces on the same component: v1 opts in, v2 keeps what it shipped with. It is
   * deliberately not keyed off `variant` — that one drives the v2 palette, and the
   * layout and the palette are not the same decision.
   */
  summaryPlacement?: "panel" | "market-strip";
};

// Both default venues start connected so the builder opens on a vault that can
// actually be funded, rather than one leg short.
const INITIAL_DEX_CONNECTED: Record<ManagedDexId, boolean> = {
  Hyperliquid: true,
  Nado: false,
  Pacifica: true,
  Variational: false,
};
const INITIAL_DEX_BALANCES: Record<ManagedDexId, number> = {
  Hyperliquid: 12430,
  Nado: 0,
  Pacifica: 9820,
  Variational: 0,
};
const INITIAL_DEX_WALLETS: Record<ManagedDexId, string | null> = {
  Hyperliquid: "0x7a3f8421c9f2e",
  Nado: null,
  Pacifica: "0x4d5e09b3a7c14",
  Variational: null,
};

/** Venues that connect via a cookie/session export instead of the mock wallet-connect. */
const requiresCookieAuth = (dex: ManagedDexId): boolean =>
  dex === "Variational";

export function DeltaVaultBuilder({
  onActivate,
  variant = "default",
  summaryPlacement = "panel",
}: DeltaVaultBuilderProps) {
  const isV2Shell = variant === "v2";
  const summaryInStrip = summaryPlacement === "market-strip";
  // Opens on a working Perp <> Perp pair rather than an empty form, so the metrics
  // strip and the picker have something to show on first paint.
  const [dexA, setDexA] = useState<DexSelection>("Hyperliquid");
  const [dexB, setDexB] = useState<DexSelection>("Pacifica");
  // The book each venue trades. Structure is read off this pair rather than being
  // stored beside it, so the two can never drift out of agreement.
  const [legA, setLegA] = useState<InstrumentType>("Perp");
  const [legB, setLegB] = useState<InstrumentType>("Perp");
  const structure = legStructureFor(legA, legB);
  const [market, setMarket] = useState<MarketSelection>({
    mode: "tokens",
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
  const [leverage, setLeverage] = useState<number>(DEFAULT_LEVERAGE);
  const [participationRate, setParticipationRate] = useState(0);
  const [amount, setAmount] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [variationalModalOpen, setVariationalModalOpen] = useState(false);
  const [pendingActivate, setPendingActivate] = useState(false);
  // True when the modal was opened from the main Activate button (flow into opening
  // the vault on success); false when opened from a per-DEX Connect (just authenticate).
  const [activateAfterConnect, setActivateAfterConnect] = useState(false);

  /** The user picks two venues; funding — not the pick order — decides which leg is which. */
  const sides = useMemo(() => resolveLegs(dexA, dexB), [dexA, dexB]);
  const longDex: DexSelection = sides?.longDex ?? "";
  const shortDex: DexSelection = sides?.shortDex ?? "";

  /*
   * `DEX_PROFILES[longDex || "Hyperliquid"]` used to stand here, substituting a
   * default venue's economics whenever the user had picked nothing — which quoted a
   * live spread and APY for an empty form. Nothing needs it now: the spread comes
   * from the resolved legs and the summary from buildPositionSummary, and both are
   * absent until two real venues are chosen.
   */

  const totalAmount = parseMoney(amount);
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

  /**
   * Cross-venue spread (short − long), %/8h. Read off the resolved legs rather than
   * recomputed from two venue profiles: resolveLegs already assigns the short to the
   * higher-paying venue, so taking it from there cannot disagree with the sides the
   * rest of the card shows. Zero until both venues resolve — the fallback profiles
   * above name venues for the selects, they are not a rate to quote on an empty form.
   */
  const spreadFunding8h = sides?.spread8h ?? 0;
  /**
   * The ceiling the live spread above is read against, %/8h — the widest the two
   * legs' funding pulled apart across the venue profiles' own lookback series. Zero
   * until both venues resolve, on the same reasoning as the spread itself.
   */
  const maxSpreadFunding8h = useMemo(
    () => (sides ? maxFundingSpread8h(sides) : 0),
    [sides],
  );
  const epochsPerYear = EPOCHS_PER_YEAR;
  /*
   * Everything else that used to live here -- maxDrawdown30d, feesDragEst,
   * avgSlippage, fundingVolBucket, crossDexApr, fundingProjection -- is gone.
   *
   * They were not measurements: the drawdown was the literal -1.8 and slippage the
   * constant 0.012, on a label that promised the difference between expected and
   * filled price. The APR had a Math.max(30.01, ...) floor that no venue pair could
   * clear, so the headline never moved.
   *
   * maxFundingSpread and hedgeIntegrity are back on the strip, but not as they were:
   * the ceiling is now measured off the venues' own funding series rather than being
   * the live spread times 2.57, and hedge integrity is read off the summary's
   * netDeltaUsd instead of |N| - |N|, so it can report a hedge that is not exact and
   * says "–" before there is a position to hedge.
   *
   * The rest now comes from buildPositionSummary, which is pure, tested, and
   * branches on the leg structure -- a spot leg earns no funding, funds its own
   * notional and cannot be liquidated, none of which the old maths expressed.
   */

  /**
   * Settlement cadence belongs to the venue, not to the leg it was handed. Legs flip
   * whenever funding crosses (see resolveLegs) but the payout schedule doesn't, so this
   * reads the two picked venues — which also keeps it right before the legs resolve.
   * The slower venue governs: the pair isn't settled until both sides have paid.
   */
  const payoutIntervalHours = Math.max(
    dexA !== "" ? DEX_FUNDING_INTERVAL_HOURS[dexA] : 8,
    dexB !== "" ? DEX_FUNDING_INTERVAL_HOURS[dexB] : 8,
  );
  const payoutIntervalMs = payoutIntervalHours * 60 * 60 * 1000;
  const secondsToRent = useNextEpochCountdown(payoutIntervalMs);

  /**
   * Read straight off the two picked venues, in pick order. Deliberately not derived
   * from `sides` — which venue ends up long or short is decided at execution, so the
   * breakdown states each venue's own funding and leaves the roles out of it.
   */
  const venueReadouts = useMemo(
    () =>
      [dexA, dexB]
        .filter((id): id is ManagedDexId => id !== "")
        .map((dex) => {
          const rate8h = DEX_PROFILES[dex].funding8hPct;
          const intervalHours = DEX_FUNDING_INTERVAL_HOURS[dex];
          return {
            dex,
            funding: `${formatSignedPct(rate8h * (intervalHours / 8))} / ${intervalHours}h`,
            apr: rate8h * epochsPerYear,
          };
        }),
    [dexA, dexB, epochsPerYear],
  );

  /**
   * The whole Position Summary, in one pure call. Branches on the leg structure, so a
   * cash-and-carry reports one funding leg, a fully-funded spot side and a single
   * liquidation price rather than borrowing the perp-perp shape.
   *
   * Deliberately not memoised on a fallback venue: until both venues resolve this is
   * null and the panel renders an em-dash. The predecessor defaulted to Hyperliquid's
   * profile and quoted a live APY for an empty form.
   */
  const summary = useMemo(() => {
    if (!sides || longDex === "" || shortDex === "") return null;
    const isCashAndCarry = structure === "Spot <> Perp";
    const spotVenue = isCashAndCarry
      ? legA === "Spot"
        ? (dexA as ManagedDexId)
        : (dexB as ManagedDexId)
      : null;
    const legs =
      isCashAndCarry && spotVenue
        ? resolveCashAndCarryLegs(
            spotVenue,
            spotVenue === dexA ? (dexB as ManagedDexId) : (dexA as ManagedDexId),
          )
        : sides;
    if (!legs) return null;
    return buildPositionSummary({
      structure,
      legs,
      spotVenue,
      marginUsd: totalAmount,
      leverage,
      market: marketProfileFor(market.token),
    });
  }, [
    sides,
    longDex,
    shortDex,
    structure,
    legA,
    dexA,
    dexB,
    totalAmount,
    leverage,
    market.token,
  ]);

  /**
   * How much of the gross exposure actually cancels: 100% is a hedge with no residual
   * direction left in it. Read off the summary's own netDeltaUsd, so a structure that
   * cannot match its legs exactly reports that rather than the flat 100.0% its
   * predecessor returned for every input.
   *
   * "–" until there is a sized position. A hedge quality on an empty form describes
   * nothing, which is the state the strip opens in.
   */
  const hedgeIntegrityLabel = useMemo(() => {
    if (!summary?.valid || summary.grossExposureUsd <= 0) return "–";
    const residualShare =
      Math.abs(summary.netDeltaUsd) / summary.grossExposureUsd;
    return `${(100 * (1 - residualShare)).toFixed(1)}%`;
  }, [summary]);

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

  const handleLegInstrumentChange = (
    slot: "a" | "b",
    instrument: InstrumentType,
  ) => {
    const nextA = slot === "a" ? instrument : legA;
    const nextB = slot === "b" ? instrument : legB;
    // Spot on both legs is refused at the button, so this only ever sees a legal
    // pair; no correction of the other leg is needed here.
    if (slot === "a") setLegA(instrument);
    else setLegB(instrument);

    // Flipping a leg to spot narrows the market list to pairs with a spot book, and
    // a perp-only selection (stocks, commodities, FX) would otherwise be left
    // selected but absent from the picker.
    const nextStructure = legStructureFor(nextA, nextB);
    setMarket((prev) => {
      if (tokenSupportsStructure(prev.token, nextStructure)) return prev;
      const fallback = filterTokens("", "All Tokens", nextStructure)[0];
      return fallback ? { ...prev, token: fallback.value } : prev;
    });
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
      estAprPct: summary?.netAprOnCapitalPct ?? 0,
      fundingEarnedProjection: summary?.incomeUsd.annual ?? 0,
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
      // Cookie-auth venues (Variational) authenticate through the onboarding modal
      // rather than the instant mock-connect the other venues use.
      if (requiresCookieAuth(firstDisconnectedVenue)) {
        setActivateAfterConnect(true);
        setVariationalModalOpen(true);
        return;
      }
      // Mirror the per-card mock-connect so a connected leg always has a wallet + balance.
      const venue = firstDisconnectedVenue;
      setDexConnected((prev) => ({ ...prev, [venue]: true }));
      setDexWallets((prev) => ({
        ...prev,
        [venue]: prev[venue] ?? createMockWalletAddress(venue),
      }));
      setDexBalances((prev) => ({
        ...prev,
        [venue]: prev[venue] > 0 ? prev[venue] : 500,
      }));
      return;
    }
    handleInitialize();
  };

  /**
   * Cookies read + accepted → Variational is authenticated. Mirror the mock-connect
   * (wallet + seed balance) so the leg is deployable. If the paired venue was already
   * connected, flow straight into opening the vault.
   */
  const handleVariationalConnected = (wallet?: string) => {
    const nextWallet = wallet ?? createMockWalletAddress("Variational");
    const otherVenue = selectedVenues.find((id) => id !== "Variational");
    const otherReady = !!otherVenue && dexConnected[otherVenue];
    setDexConnected((prev) => ({ ...prev, Variational: true }));
    setDexWallets((prev) => ({
      ...prev,
      Variational: prev.Variational ?? nextWallet,
    }));
    setDexBalances((prev) => ({
      ...prev,
      Variational: prev.Variational > 0 ? prev.Variational : 500,
    }));
    setVariationalModalOpen(false);
    if (activateAfterConnect && otherReady) setPendingActivate(true);
    setActivateAfterConnect(false);
  };

  // Deferred activation: fires once Variational's connection is committed to state
  // (handleInitialize reads the connected/wallet maps, which update asynchronously).
  useEffect(() => {
    if (!pendingActivate) return;
    if (allSelectedVenuesConnected && !isPreparing) {
      setPendingActivate(false);
      handleInitialize();
    }
  }, [pendingActivate, allSelectedVenuesConnected, isPreparing]);

  const primaryLabel =
    dualValid && allSelectedVenuesConnected
      ? `Open ${market.mode === "tokens" ? market.token : "BTC/USDC"} vault`
      : firstDisconnectedVenue && requiresCookieAuth(firstDisconnectedVenue)
        ? `Activate ${firstDisconnectedVenue}`
        : firstDisconnectedVenue
          ? `Connect ${firstDisconnectedVenue} wallet`
          : "Connect both DEXs to continue";

  /*
   * Rendered in different places by the two layouts -- between the two control cards
   * where they are stacked, under the pair where they sit side by side -- so it is
   * written once here rather than twice in the tree.
   */
  const dualSourceWarning =
    hasBothDexSelected && !dualValid ? (
      <p className="font-mono text-[11px] text-[#f87171]">
        Select two different DEX sources to unlock cross-venue spread.
      </p>
    ) : null;

  const bridgeKey = `${dexA || "none"}-${dexB || "none"}`;
  const marketLabel =
    market.mode === "themes"
      ? formatThemesSelection(market.themes)
      : market.token;
  const spreadSubtitleKey = `${bridgeKey}-${marketLabel}`;

  /*
    The market's figures, built once. The setup card renders them as a strip in the
    v1 layout and the right column renders them as a card in v2, and the two must be
    the same numbers -- they are the same market.
  */
  const strategyMetrics = {
    /*
      Gated on `valid`, not just on `summary` being present. With venues picked but no
      amount entered the summary still computes, and rendering that as "0.00%" quotes a
      rate the user was never offered — the same fabrication as the old fallback-venue
      APY, one step further along.
    */
    apy: summary?.valid ? `${formatPct(summary.netAprOnCapitalPct)} APY` : "—",
    apyPositive: (summary?.valid && summary.netAprOnCapitalPct > 0) ?? false,
    /*
      The spread and its ceiling come off the resolved legs, not off the summary: they
      are venue economics, so they stand before an amount is entered — unlike the APY
      above, which is a return on capital the user has not yet posted.
    */
    currentSpread: sides ? formatCompactPct(spreadFunding8h) : "—",
    spreadPositive: spreadFunding8h >= 0,
    maxFundingSpread: sides ? formatCompactPct(maxSpreadFunding8h) : "—",
    venues: venueReadouts,
    netCapture: `${formatSignedPct(spreadFunding8h)} / 8h`,
    hedgeIntegrity: hedgeIntegrityLabel,
    fundingSettlement: formatHms(secondsToRent),
  };


  /*
    The CTA is built once and placed by the layout, not written twice: the two
    shapes disagree only about which box it belongs to, and a second copy of a
    button this stateful is a second copy to keep in step.
  */
  const primaryCta = (
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
        {firstDisconnectedVenue &&
          (requiresCookieAuth(firstDisconnectedVenue) ? (
            <Cookie className="h-3.5 w-3.5" />
          ) : (
            <Wallet className="h-3.5 w-3.5" />
          ))}
        {primaryLabel}
      </span>
    </button>
  );

  return (
    <section
      className={clsx(
        /*
          850px is the right measure for a single column of controls, and the only
          reason to go past it is the two-column split: at 850 the split left 422px
          for the left half, which squeezes the two venue cards it holds side by side
          and makes that column taller than the summary beside it -- the opposite of
          the point. So the wider cap applies at exactly the breakpoint where the
          split happens, and only in the layout that splits. 1180 also sits inside
          the page's own max-w-[1280px] main, so nothing else has to move.

          The strip layout keeps 850 at every width. It is one column, and a single
          column of controls does not get better by being stretched to 1116px -- it
          gets a 15px figure adrift in a third of a metre of dark card, and a form
          whose label and its input are a screen apart.
        */
        "font-['Onest',sans-serif] relative mx-auto w-full max-w-[850px] overflow-hidden p-3.5 tablet:p-4",
        !summaryInStrip && "min-[1180px]:max-w-[1180px]",
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
      {/* Portalled to the body: this section is `overflow-hidden` and sits under
          transformed ancestors, either of which would trap a fixed child inside the card. */}
      {createPortal(
        <AnimatePresence>
          {isPreparing && dexA !== "" && dexB !== "" && (
            <motion.div
              key="vault-opening"
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* The page recedes behind the vault while it opens. */}
              <div
                className="ds-scrim absolute inset-0"
                aria-hidden
              />
              <motion.div
                className="relative z-[201] w-full max-w-[520px]"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <VaultOpeningOverlay
                  venueA={dexA}
                  venueB={dexB}
                  variant={variant}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <VariationalOnboardingModal
        open={variationalModalOpen}
        onOpenChange={setVariationalModalOpen}
        onConnected={handleVariationalConnected}
        pairedDex={selectedVenues.find((id) => id !== "Variational")}
      />

      {/*
        Two shapes, one set of blocks. `summaryPlacement` picks between them.

        "panel" — the original, and what Delta Neutral v2 still ships: two columns at
        1180px, what you set on the left, what it gets you on the right. Stacked, the
        column ran past a laptop viewport, so the numbers that justify the trade sat
        below the fold from the controls that change them; side by side, every input
        and its consequence are visible together. 1180px, not the 834px `tablet` step,
        because the left column alone holds two venue cards abreast.

        "market-strip" — v1. With the summary folded into a 48px readout under the
        market row, the split stops buying anything: the figures are already beside
        the token they describe and a short scroll from every control. So it collapses
        to one column, in the order the decision is made — pick the venues and the
        market, see what a position in it comes to, size it, go — and Margin and
        Leverage pair up, since two small controls of the same kind cost a whole row
        of height stacked and read no better for it.

        `items-start` in the split layout keeps each column its own height; without it
        the shorter one stretches and its bottom card grows a dead gap.
      */}
      <div className="relative z-[1] flex flex-col gap-4 max-tablet:gap-3">
        <MaybeBox
          when={!summaryInStrip}
          className="grid grid-cols-1 items-start gap-4 max-tablet:gap-3 min-[1180px]:grid-cols-[minmax(0,1fr)_380px]"
        >
          <MaybeBox
            when={!summaryInStrip}
            className="flex flex-col gap-4 max-tablet:gap-3"
          >
        <DexPairSetupCard
          dexA={dexA}
          dexB={dexB}
          onDexAChange={setDexA}
          onDexBChange={setDexB}
          onConnectDex={(dex) => {
            // Variational connects via the cookie onboarding modal, not the instant
            // mock-connect. Opened from the leg's Connect button → authenticate only.
            if (requiresCookieAuth(dex)) {
              setActivateAfterConnect(false);
              setVariationalModalOpen(true);
              return;
            }
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
          legA={legA}
          legB={legB}
          structure={structure}
          onLegInstrumentChange={handleLegInstrumentChange}
          market={market}
          onModeChange={handleModeChange}
          onThemesChange={handleThemesChange}
          onTokenChange={handleTokenChange}
          strategyMetrics={strategyMetrics}
          legSlippage={
            summary
              ? {
                  [summary.long.venue]: {
                    side: "long" as const,
                    pct: summary.long.priceImpactPct,
                    usd: summary.long.priceImpactUsd,
                  },
                  [summary.short.venue]: {
                    side: "short" as const,
                    pct: summary.short.priceImpactPct,
                    usd: summary.short.priceImpactUsd,
                  },
                }
              : undefined
          }
          summary={summary}
          showSummaryStrip={summaryInStrip}
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
              label="Margin"
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

          {dualSourceWarning}

          <div
            className={clsx(
              "rounded-[11px] border p-3 max-tablet:p-3",
              isV2Shell
                ? "border-[#1f1f1f] bg-[#121212]"
                : "border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-6px_18px_rgba(0,0,0,0.3)]",
            )}
          >
            <LeverageControl
              value={leverage}
              min={MIN_LEVERAGE}
              max={MAX_LEVERAGE}
              disabled={!dualValid}
              disabledSliderTooltip="Select both the dex before setting leverage"
              variant={variant}
              infoTooltip={
                `${leverage}x · ${leverageProfile(leverage)}

` +
                (structure === "Spot <> Perp"
                  ? "Sets the position size of both legs. The perp posts your margin against it; the spot has to hold that size in coin. "
                  : "Multiplies both legs equally, so the hedge stays delta-neutral. ") +
                "Higher leverage captures more funding but liquidates on a smaller adverse move."
              }
              onChange={setLeverage}
            />

          </div>
          </MaybeBox>

          {/*
            The same component the strip layout renders, asked for its column shape.
            v2 keeps its left/right split, and the figures it states are now the ones
            v1 states -- three, with everything they were derived from behind Details
            -- rather than the older card that also printed the cost-terms table
            inline. One component, one field set, so the two versions cannot drift into
            quoting different things.
          */}
          {!summaryInStrip && (
            <div className="flex flex-col gap-4 max-tablet:gap-3">
              {/*
                The market's rates, above the position they produce.

                They used to sit in the left column, in a 48px strip beside the token
                selector -- three readouts in among the controls, on a row whose other
                half was an input. The split layout already draws that line down the
                middle: the left column is what you set, the right is what it gets you.
                So the figures move to the side they belong on, and the column reads in
                the order the arithmetic runs -- what the market pays, then what a
                position in it comes to.

                Same gate as the strip it replaces: a token pair with both venues
                resolved. Categories are a basket, not a position, and before both
                venues resolve there is no spread to quote -- absent rather than
                present and empty, on both counts.
              */}
              {market.mode === "tokens" && dualValid && (
                <MarketMetricsPanel
                  variant={variant}
                  metrics={marketMetrics(strategyMetrics)}
                  footer={
                    <StrategyBreakdownPanel
                      contextLabel={market.token}
                      venues={strategyMetrics.venues}
                      netCapture={strategyMetrics.netCapture}
                      hedgeIntegrity={strategyMetrics.hedgeIntegrity}
                      fundingSettlement={strategyMetrics.fundingSettlement}
                      className="w-full justify-center border-l-0"
                    />
                  }
                />
              )}
              <PositionSummaryStrip
                summary={summary}
                layout="panel"
                variant={variant}
              />
            </div>
          )}
        </MaybeBox>

        {/*
          The CTA is last in both shapes -- the step that acts on everything above
          it, in the order the decision is made.

          In the split layout it used to be as wide as the card, which ran it 380px
          on under the summary panel, past the last control it acts on and ending on
          an edge nothing else in the form shares. Re-running the grid template for
          this one row drops it into the first column, so it lines up with the Margin
          and Leverage cards directly above it -- and is exact rather than a width
          computed against the 380px by hand.

          A wrapper rather than a second copy inside the control column: below 1180px
          the grid collapses and the CTA has to stay after the summary, which is where
          the DOM already puts it. In the strip layout there is no second column and
          the template never applies, so the button is simply full width.
        */}
        <MaybeBox
          when={!summaryInStrip}
          className="grid grid-cols-1 gap-4 max-tablet:gap-3 min-[1180px]:grid-cols-[minmax(0,1fr)_380px]"
        >
          {primaryCta}
        </MaybeBox>
      </div>
    </section>
  );
}
