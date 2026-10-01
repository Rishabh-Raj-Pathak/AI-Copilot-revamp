import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import {
  GRADIENT_OUTLINE,
  chipValue,
  formatEntryRange,
  ideaTokenIcon,
} from "./copilotIdeaData.js";

/** Figma "Signal Pill" (937:1158) — tone picks the fill/ink pair. */
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
 * Figma "Trade Idea" card (939:1308; selected state 941:1463).
 *
 * The whole card and its chevron open the trade ticket; Backtest opens the
 * backtest sheet. Selection is the gradient outline only — fill and type never
 * change, so the list doesn't reflow when the ticket closes.
 */
export default function CopilotIdeaCard({
  setup,
  selected = false,
  onOpen,
  onBacktest,
  backtestTourTarget = false,
}) {
  const win = chipValue(setup, "win");
  const rr = chipValue(setup, "rr");
  const range = formatEntryRange(setup);
  const open = () => onOpen?.(setup.id);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${setup.title}. Open trade ticket`}
      aria-current={selected ? "true" : undefined}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={`flex cursor-pointer flex-col gap-4 rounded-2xl p-4 outline-none transition-transform duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-app-accent/60 ${
        selected ? "" : "border border-app-line-accent-subtle bg-app-bg"
      }`}
      style={selected ? GRADIENT_OUTLINE : undefined}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <TokenDisc setup={setup} />
          <h3 className="min-w-0 flex-1 text-app-headline font-bold leading-6 tracking-[0.2px] text-ink">
            {setup.title}
          </h3>
          <button
            type="button"
            aria-label={`Open ${setup.symbol} chart and trade ticket`}
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="app-pressable -my-2.5 -mx-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink active:bg-white/[0.06]"
          >
            <AppIcon src={appIcons.chevronRight24} size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <SidePill direction={setup.direction} />
            {win ? <SignalPill tone="positive">Win rate {win}</SignalPill> : null}
            {rr ? <SignalPill tone="warning">R:R {rr}</SignalPill> : null}
          </div>
          {range ? (
            <div className="flex min-w-0">
              <SignalPill tone="neutral" className="max-w-full truncate">
                Range {range}
              </SignalPill>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        data-tour={backtestTourTarget ? "copilot-view-thesis" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onBacktest?.(setup);
        }}
        className="app-pressable flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-ink"
        style={GRADIENT_OUTLINE}
      >
        <AppIcon src={appIcons.backtest16} size={16} />
        <span className="text-app-body font-semibold leading-[18px]">Backtest</span>
      </button>
    </article>
  );
}
