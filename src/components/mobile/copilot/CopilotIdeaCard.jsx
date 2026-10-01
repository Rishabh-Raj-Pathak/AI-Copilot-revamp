import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import {
  GRADIENT_OUTLINE,
  chipValue,
  formatCompactRange,
  formatPrice,
  ideaTokenIcon,
  reviewHorizon,
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
      className={`inline-flex h-[18px] items-center rounded px-1.5 text-app-label font-medium ${
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
          tone === "positive" ? "text-app-positive" : tone === "accent" ? "text-app-accent" : "text-ink"
        }`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

/**
 * Phone trade-idea card (AI Copilot pilot).
 *
 * Reads in the order a trader scans: what (token, symbol, direction) and at
 * what price → why (the AI's one-line thesis) → how good (win rate, R:R) →
 * where and for how long (entry, review horizon) → act.
 *
 * The whole card opens the trade ticket — that is the primary action, now also
 * spelled out as "Open long/short" in the direction's colour. Backtest is the
 * quiet secondary action. Selection keeps the brand-gradient outline from the
 * Figma card so the last-opened idea is findable after the ticket closes.
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
  const review = reviewHorizon(setup);
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
      className={`flex cursor-pointer flex-col gap-3 rounded-xl p-3.5 outline-none transition-[transform,opacity] duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-app-accent/60 ${
        selected ? "" : "border border-app-line-accent-subtle bg-app-bg"
      } ${dimmed ? "opacity-55" : ""}`}
      style={selected ? GRADIENT_OUTLINE : undefined}
    >
      <div className="flex items-center gap-2.5">
        <TokenDisc setup={setup} size={28} />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h3 className="truncate text-app-button font-semibold text-ink">{setup.symbol}</h3>
          <SideTag direction={setup.direction} />
        </div>
        <span className="shrink-0 text-app-callout font-medium text-ink">
          {formatPrice(setup.price)}
        </span>
        <AppIcon src={appIcons.chevronRight16} size={16} className="-mr-0.5 text-ink-subtle" />
      </div>

      <p className="line-clamp-2 text-app-callout text-ink-muted">{setup.title}</p>

      <dl className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] gap-x-4 border-t border-app-line pt-3">
        <Metric label="Win rate" value={win} tone="positive" />
        <Metric label="R:R" value={rr} tone="accent" />
        <Metric label="Entry" value={range} />
        <Metric label="Review" value={review} className="text-right" />
      </dl>

      <div className="flex gap-2">
        <button
          type="button"
          data-tour={backtestTourTarget ? "copilot-view-thesis" : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onBacktest?.(setup);
          }}
          className="app-pressable flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-app-line bg-app-surface text-app-callout font-medium text-ink active:bg-white/[0.05]"
        >
          <AppIcon src={appIcons.backtest16} size={16} className="text-ink-muted" />
          Backtest
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className={`app-pressable flex h-10 flex-1 items-center justify-center rounded-lg border text-app-callout font-medium ${
            short
              ? "border-[#4a1414] bg-app-negative-subtle text-[#f06464]"
              : "border-[#0f3a22] bg-app-positive-subtle text-app-positive"
          }`}
        >
          Open {short ? "short" : "long"}
        </button>
      </div>
    </article>
  );
}
