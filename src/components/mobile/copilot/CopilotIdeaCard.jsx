import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import {
  chipValue,
  formatCompactRange,
  formatPrice,
  ideaTokenIcon,
} from "./copilotIdeaData.js";

/** Figma "Signal Pill" (937:1158) — tone picks the fill/ink pair. Used by the backtest sheet. */
const PILL_TONES = {
  positive: "bg-app-positive-subtle text-app-positive",
  negative: "bg-app-negative-subtle text-app-negative",
  warning: "bg-app-subtle text-app-accent",
  neutral: "bg-app-subtle text-ink",
};

export function SignalPill({ tone = "positive", children, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1 text-app-caption font-semibold leading-4 ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Long is green, Short is red on #260808 (Figma 941:2357). */
export function SidePill({ direction, className = "" }) {
  const short = direction === "short";
  return (
    <SignalPill tone={short ? "negative" : "positive"} className={className}>
      {short ? "Short" : "Long"}
    </SignalPill>
  );
}

/** Figma "Token / *": the coin on a white disc. */
export function TokenDisc({ setup, size = 24 }) {
  const src = ideaTokenIcon(setup);
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img alt="" src={src} className="size-full object-cover" draggable={false} />
      ) : (
        <span className="text-app-caption font-semibold text-black">{setup?.symbol?.[0]}</span>
      )}
    </span>
  );
}

/**
 * Compact direction tag beside the symbol (18px, 11/500 — the positions panel's
 * tag spec). Short text is lifted to #f06464 so 11–13px red on the #260808 tint
 * clears 4.5:1; the token red (#d53d3d) measures ~4.0:1 there.
 */
function SideTag({ direction }) {
  const short = direction === "short";
  return (
    <span
      className={`inline-flex h-[18px] items-center rounded-[5px] px-1.5 text-app-label font-medium ${
        short ? "bg-app-negative-subtle text-[#f06464]" : "bg-app-positive-subtle text-app-positive"
      }`}
    >
      {short ? "Short" : "Long"}
    </span>
  );
}

/** Label over value. The value carries the emphasis; the label stays quiet. */
function Metric({ label, value, tone = "default", className = "" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <dt className="text-app-label text-ink-subtle">{label}</dt>
      <dd
        className={`truncate text-app-callout font-medium ${
          tone === "positive" ? "text-app-positive" : "text-ink"
        }`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

/** Live price closing the metrics row: right-aligned, one step larger, quieter label. */
function PriceMetric({ value }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <dt className="text-app-label text-ink-faint">Current Price</dt>
      <dd className="text-app-body font-medium leading-[18px] text-ink">{value}</dd>
    </div>
  );
}

/**
 * Phone strategy card (AI Copilot — Figma 1209:7070).
 *
 * Reads in the order a trader scans: what (token, symbol, direction) → why
 * (the AI's one-line thesis) → how good (win rate, R:R) → where (entry range
 * against the current price).
 *
 * Outline only: no fill, one #2e2200 hairline shared by every card, so colour
 * is left to win rate and direction. The whole card opens the trade ticket
 * (the chevron says so); Backtest is the card's one button. No highlight on
 * the selected idea — the ticket sheet already shows which one is open.
 */
export default function CopilotIdeaCard({
  setup,
  selected = false,
  dimmed = false,
  onOpen,
  onBacktest,
  backtestTourTarget = false,
}) {
  const short = setup.direction === "short";
  const win = chipValue(setup, "win");
  const rr = chipValue(setup, "rr");
  const range = formatCompactRange(setup);
  const open = () => onOpen?.(setup.id);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${setup.symbol} ${short ? "short" : "long"} at ${formatPrice(setup.price)}. ${setup.title}. Open trade ticket`}
      aria-current={selected ? "true" : undefined}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={`flex cursor-pointer flex-col gap-3 rounded-[16px] border border-app-line-accent-subtle p-3.5 outline-none transition-[transform,opacity,background-color] duration-150 active:scale-[0.99] active:bg-white/[0.02] focus-visible:ring-2 focus-visible:ring-white/40 ${
        dimmed ? "opacity-55" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <TokenDisc setup={setup} size={32} />
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <h3 className="truncate text-app-button font-semibold text-ink">{setup.symbol}</h3>
          <SideTag direction={setup.direction} />
        </div>
        <AppIcon src={appIcons.chevronRight16} size={16} className="text-ink-subtle" />
      </div>

      <p className="line-clamp-2 text-app-callout text-ink-muted">{setup.title}</p>

      <dl className="flex items-start gap-4 max-[374px]:gap-2">
        <Metric label="Win rate" value={win} tone="positive" className="shrink-0" />
        <Metric label="R:R" value={rr} className="shrink-0" />
        <Metric label="Entry" value={range} className="flex-1" />
        <PriceMetric value={formatPrice(setup.price)} />
      </dl>

      <button
        type="button"
        data-tour={backtestTourTarget ? "copilot-view-thesis" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onBacktest?.(setup);
        }}
        className="app-pressable flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full bg-app-control text-app-callout font-medium text-ink active:bg-white/[0.1]"
      >
        <AppIcon src={appIcons.backtest16} size={14} />
        Backtest
      </button>
    </article>
  );
}
