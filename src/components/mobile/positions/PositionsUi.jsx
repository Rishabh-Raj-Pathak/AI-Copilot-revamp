import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { TOKEN_ICONS, TOKEN_PARTS } from "./positionsMockData.js";

/**
 * Building blocks shared by every card in Figma "07 Positions & Orders"
 * (1103:24086). One spec for all of them, per the handoff notes (1103:24370):
 * 12px card inset on every edge, tags 18px / radius 4 / 11px medium, metric
 * labels sentence case 11px #8F8F8F, weights 400/500 only.
 */

/* ------------------------------------------------------------------ token */

/**
 * Coin logo on a white disc (Figma "Token / ETH" 935:1112 at 20px).
 * USDC and HYPE are layered components in Figma (base + ring / mark, drawn at
 * 24px); they're scaled into the same 20px slot as every other token.
 */
export function TokenIcon({ coin, size = 20 }) {
  const parts = TOKEN_PARTS[coin];
  if (parts) {
    return (
      <span className="relative block shrink-0" style={{ width: size, height: size }} aria-hidden>
        <span
          className="absolute left-0 top-0 block size-6 origin-top-left"
          style={{ transform: `scale(${size / 24})` }}
        >
          <img alt="" src={parts.base} className="absolute inset-0 size-6" />
          {parts.ring ? (
            <>
              <img alt="" src={parts.ring} className="absolute left-[2.9px] top-[2.9px] size-[18.2px]" />
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold leading-none text-ink">
                $
              </span>
            </>
          ) : null}
          {parts.mark ? (
            <img alt="" src={parts.mark} className="absolute left-[4.5px] top-[4.5px] size-[15px] object-contain" />
          ) : null}
        </span>
      </span>
    );
  }
  return (
    <span
      className="block shrink-0 overflow-hidden rounded-full bg-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {TOKEN_ICONS[coin] ? (
        <img alt="" src={TOKEN_ICONS[coin]} className="size-full object-cover" />
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------- tags */

const TAG_TONE = {
  positive: "bg-app-positive-subtle text-app-positive",
  negative: "bg-app-negative-subtle text-app-negative",
  neutral: "bg-app-subtle text-ink-muted",
  warning: "bg-app-subtle text-app-accent",
};

/** Figma "Signal Pill" Size=Small (937:1158): 18px, radius 4, 11/500. */
export function Tag({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded px-1.5 py-0.5 text-app-label font-medium ${TAG_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/** Figma "Source Tag" (1064:5580): who opened the position. Stroke sits inside the 18px. */
export function SourceTag({ source }) {
  const copilot = source === "copilot";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded border px-1.5 py-px text-app-label font-medium ${
        copilot
          ? "border-app-line-accent bg-app-accent-faint text-app-accent"
          : "border-app-line-strong text-ink-muted"
      }`}
    >
      {copilot ? "Copilot" : "Manual"}
    </span>
  );
}

/* ------------------------------------------------------------------- card */

/** Card surface shared by Position / Order / History / Trade / Balance cards. */
export function Card({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-app-line bg-app-surface ${className}`}>
      {children}
    </div>
  );
}

/** Figma "Expand Button": 24×24, #121212, radius 6, 16px chevron in muted ink. */
export function ExpandIndicator({ expanded }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-app-subtle text-ink-muted">
      <AppIcon src={expanded ? appIcons.chevronUp16 : appIcons.chevronDown16} size={16} />
    </span>
  );
}

/** Metric cell: label 11 / value 13 medium / optional sub 11. */
export function Metric({ label, value, sub, valueClass = "text-ink", subClass = "text-ink-subtle" }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 whitespace-nowrap">
      <span className="text-app-label tracking-[0.04em] text-ink-subtle">{label}</span>
      <span className={`truncate text-app-callout font-medium ${valueClass}`}>{value}</span>
      {sub != null ? <span className={`text-app-label ${subClass}`}>{sub}</span> : null}
    </div>
  );
}

/** Three equal metric columns below a card header. */
export function MetricsRow({ children }) {
  return <div className="flex items-start gap-3 px-3 pb-3 pt-2">{children}</div>;
}

/** Summary stat above a list: label 11 / value 16 medium. */
export function SummaryStat({ label, value, valueClass = "text-ink" }) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5 whitespace-nowrap">
      <span className="text-app-label tracking-[0.04em] text-ink-subtle">{label}</span>
      <span className={`text-app-headline font-medium leading-5 ${valueClass}`}>{value}</span>
    </div>
  );
}

/** The black "Details Box" an expanded card reveals. */
export function DetailsBox({ children }) {
  return (
    <div className="px-3 pb-3">
      <div className="flex flex-col gap-2 rounded-lg border border-app-line bg-app-bg px-3 py-2.5">
        {children}
      </div>
    </div>
  );
}

/** Label / value row inside a details or estimate box (12px). */
export function DetailRow({ label, children, valueClass = "text-ink", labelClass = "text-ink-subtle" }) {
  return (
    <div className="flex items-center justify-between gap-3 whitespace-nowrap text-app-caption">
      <span className={labelClass}>{label}</span>
      <span className={`flex min-w-0 items-center gap-2 font-medium ${valueClass}`}>{children}</span>
    </div>
  );
}

/** 32px card action (Edit TP/SL, Close, Cancel order, Share trade). */
export function CardAction({ tone = "default", onClick, icon, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`app-pressable flex h-8 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-app-subtle px-3 text-app-callout font-medium leading-4 active:bg-white/[0.06] ${
        tone === "danger" ? "text-app-negative" : "text-ink"
      }`}
    >
      {icon ? <AppIcon src={icon} size={14} /> : null}
      {children}
    </button>
  );
}

/** Bottom actions row, 8px gap, 12px inset. */
export function CardActions({ children }) {
  return <div className="flex items-start gap-2 px-3 pb-3">{children}</div>;
}

/** Height-animated reveal for an expanded card body. */
export function Collapse({ open, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="collapse"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Info footnote: 14px icon in a 16px slot + 12px subtle copy. */
export function InfoNote({ children }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex h-4 w-3.5 shrink-0 items-center justify-center text-ink-faint">
        <AppIcon src={appIcons.info14} size={14} />
      </span>
      <p className="min-w-0 flex-1 text-app-caption text-ink-subtle">{children}</p>
    </div>
  );
}

/** Day-group header ("TODAY", "YESTERDAY", "SAT, SEP 26"). */
export function GroupHeader({ children }) {
  return (
    <p className="whitespace-nowrap text-app-label font-medium uppercase tracking-[0.04em] text-ink-faint">
      {children}
    </p>
  );
}
