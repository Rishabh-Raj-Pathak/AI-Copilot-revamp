import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Clock, OctagonX, Pause, TrendingDown, TriangleAlert } from "lucide-react";
import AppNavBar from "../AppNavBar.jsx";
import { useHistoryBack } from "../appHistory.js";
import { Dn2Sheet, TokenIcon } from "../dn2/Dn2Ui.jsx";
import { CARD, CARD_EDGE, CARD_FILL, LABEL, TILE } from "../dn2/dn2Theme.js";
import { DexLogo } from "../../../market-making/ui.tsx";
import { niceScale } from "../../../market-making/Dashboard.tsx";
import {
  PHASE_LABEL,
  liveSeconds,
  runtime,
  stopLabel,
  strategyName,
  usdCompact,
  usdFineSigned,
} from "../../../market-making/lib.ts";
import { useNow } from "../../../market-making/useVenueAccount.ts";

/**
 * Shared Market Making phone pieces. They sit on the Delta Neutral 2 vault
 * theme (`dn2Theme.js`, `Dn2Ui.jsx`) so the three Agents tabs read as one
 * product; the fields, copy and states are production Market Making's.
 */

/* ── Pushed page ──────────────────────────────────────────────────────── */

/**
 * Toasts float above the tab bar; a pushed page hides the tab bar behind a
 * pinned footer, so while one is open they clear the footer instead.
 */
function useToastClearsFooter(footerRef, active) {
  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!active || !footer || typeof ResizeObserver === "undefined") return undefined;
    const root = document.documentElement;
    const sync = () => root.style.setProperty("--app-toast-bottom", `${footer.offsetHeight + 12}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(footer);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--app-toast-bottom");
    };
  }, [footerRef, active]);
}

/**
 * A screen pushed over the Agents tab, the way Delta Neutral 2's "Set up
 * vault" is: slides in from the right over the header and tab bar, back
 * chevron (and hardware / swipe back) pops it, optional pinned footer.
 */
export function MmPage({ open, onClose, title, label, footer = null, children }) {
  const reduceMotion = useReducedMotion();
  const footerRef = useRef(null);
  useHistoryBack(open, onClose);
  useToastClearsFooter(footerRef, open && Boolean(footer));
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mm-page"
          role="dialog"
          aria-modal="true"
          aria-label={label ?? title}
          className="fixed inset-0 z-[60] flex flex-col bg-black text-white proportional-nums tablet:hidden"
          initial={{ x: reduceMotion ? 0 : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: reduceMotion ? 0 : "100%" }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 34, stiffness: 340, mass: 0.9 }}
        >
          <AppNavBar title={title} onBack={onClose} />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <div className="flex flex-col gap-3 px-5 pb-6 pt-4 max-[374px]:px-4">{children}</div>
          </div>
          {footer ? (
            <footer
              ref={footerRef}
              className="shrink-0 border-t border-white/[0.06] bg-black px-5 pb-[var(--app-safe-bottom)] pt-3 max-[374px]:px-4"
            >
              {footer}
            </footer>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/* ── Marks ────────────────────────────────────────────────────────────── */

/**
 * Coin art for the markets Delta Neutral has none for: Hyperliquid's own
 * coin icons (app.hyperliquid.xyz/coins), vendored to public/market-making/tokens.
 */
const MARKET_ICONS = new Set(["XRP", "DOGE", "FARTCOIN", "GOLD", "TSLA", "NVDA", "EUR"]);

/** A market's coin: the app's art for BTC / ETH / SOL / HYPE, vendored art for the rest. */
export function MarketIcon({ symbol, size = 32 }) {
  const coin = String(symbol ?? "").toUpperCase();
  if (!MARKET_ICONS.has(coin)) return <TokenIcon pair={coin} size={size} />;
  return (
    <img
      alt=""
      src={`/market-making/tokens/${coin}.svg`}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

/** "Volume · [logo] Hyperliquid". */
export function AgentMeta({ agent, className = "" }) {
  return (
    <p className={`flex min-w-0 items-center gap-1.5 text-[11px] leading-[14px] text-[#8f90a1] ${className}`}>
      <span className="truncate">{strategyName(agent)}</span>
      <span className="text-[#63646f]" aria-hidden>
        ·
      </span>
      <DexLogo dex={agent.venueId} className="h-3 w-3" />
      <span className="truncate">{agent.venueId}</span>
    </p>
  );
}

/* ── Status ───────────────────────────────────────────────────────────── */

const PHASE_TEXT = {
  starting: "text-[#ccb17f]",
  running: "text-[#00d492]",
  offline: "text-[#e5484d]",
  pausing: "text-[#ccb17f]",
  paused: "text-[#ccb17f]",
  stopping: "text-[#ccb17f]",
  stopped: "text-[#8f90a1]",
};
const PHASE_DOT = {
  starting: "bg-[#ccb17f]",
  running: "bg-[#00d492]",
  offline: "bg-[#e5484d]",
  pausing: "bg-[#ccb17f]",
  paused: "bg-[#ccb17f]",
  stopping: "bg-[#ccb17f]",
  stopped: "bg-[#63646f]",
};
const REASON_ICON = {
  user: OctagonX,
  requested: OctagonX,
  duration: Clock,
  "market-hours": Clock,
  drawdown: TrendingDown,
  "stop-loss": TrendingDown,
  "over-budget": TrendingDown,
  fatal: TriangleAlert,
  crash_loop: TriangleAlert,
};
const USER_STOPS = ["user", "requested"];

/** Production's row status, as a pill: Active, Paused, Cut-off reached, Time limit reached… */
export function StatusChip({ agent }) {
  const reason = stopLabel(agent.stopReason);
  let Icon = null;
  let label = PHASE_LABEL[agent.phase];
  if (agent.phase === "paused") {
    if (agent.stopReason && reason && !USER_STOPS.includes(agent.stopReason)) {
      Icon = REASON_ICON[agent.stopReason] ?? Pause;
      label = reason;
    } else Icon = Pause;
  } else if (agent.phase === "stopped") {
    Icon = (agent.stopReason && REASON_ICON[agent.stopReason]) || Check;
    if (reason) label = reason;
  }
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-[7px] py-0.5 text-[10px] font-medium leading-[13px] ${PHASE_TEXT[agent.phase]}`}
    >
      {Icon ? (
        <Icon size={10} strokeWidth={2.25} aria-hidden />
      ) : (
        <span className="relative size-[5px] shrink-0" aria-hidden>
          {agent.phase === "running" ? (
            <span className={`absolute inset-0 animate-ping rounded-full ${PHASE_DOT.running}`} />
          ) : null}
          <span className={`absolute inset-0 rounded-full ${PHASE_DOT[agent.phase]}`} />
        </span>
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}

const PILL = {
  Active: ["bg-[#00d492]", "text-[#00d492]"],
  Starting: ["bg-[#ccb17f]", "text-[#e8d5b5]"],
  Offline: ["bg-[#e5484d]", "text-[#e5484d]"],
  Pausing: ["bg-[#ccb17f]", "text-[#e8d5b5]"],
  Stopping: ["bg-[#ccb17f]", "text-[#e8d5b5]"],
  Paused: ["bg-[#ccb17f]", "text-[#e8d5b5]"],
  Ended: ["bg-[#e5484d]", "text-[#e5484d]"],
};

/** Production's status pill on Strategy status and Activity. */
export function StatusPill({ status }) {
  const [dot, text] = PILL[status];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.07] bg-[#121212] px-2.5 py-1">
      <span className={`relative size-1.5 rounded-full ${dot}`} aria-hidden>
        {status === "Active" ? <span className={`absolute inset-0 animate-ping rounded-full ${dot}`} /> : null}
      </span>
      <span className={`text-[10px] font-semibold uppercase leading-[13px] tracking-[0.6px] ${text}`}>{status}</span>
    </span>
  );
}

/* ── Agent card ───────────────────────────────────────────────────────── */

function Figure({ label, value, tone = "text-[#dcdce8]" }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className={LABEL}>{label}</dt>
      <dd className={`truncate text-[13px] font-medium leading-4 ${tone}`}>{value}</dd>
    </div>
  );
}

const pnlTone = (v) => (v > 0 ? "text-[#00d492]" : v < 0 ? "text-[#e5484d]" : "text-[#dcdce8]");

/**
 * One agent in the list: production's row (symbol, status, strategy · venue,
 * Volume / PnL / Runtime), as a tappable card. The whole card opens it, the
 * way a list row does in a native app; the chevron says so.
 */
export function AgentCard({ agent, onOpen }) {
  const live = agent.phase !== "stopped";
  const running = agent.phase === "running";
  const now = useNow(running);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${agent.marketSymbol} on ${agent.venueId}, ${live ? "open agent" : "view results"}`}
      className={`${CARD} ${CARD_EDGE} app-pressable w-full text-left active:border-[rgba(214,177,107,0.45)]`}
      style={CARD_FILL}
    >
      <div className="flex w-full items-center gap-3">
        <MarketIcon symbol={agent.marketSymbol} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="shrink-0 text-[15px] font-medium leading-5 text-[#e8d5b5]">{agent.marketSymbol}</p>
            <StatusChip agent={agent} />
          </div>
          <AgentMeta agent={agent} />
        </div>
        <ChevronRight size={18} className="shrink-0 text-[#717182]" aria-hidden />
      </div>
      <dl className={`${TILE} grid w-full grid-cols-3 gap-3 px-3 py-2.5`}>
        <Figure label="Volume" value={usdCompact(agent.volume)} />
        <Figure label="PnL" value={usdFineSigned(agent.pnl)} tone={pnlTone(agent.pnl)} />
        <Figure label={live ? "Runtime" : "Ran for"} value={live ? runtime(liveSeconds(agent, now)) : agent.runtimeLabel} />
      </dl>
    </button>
  );
}

/* ── Stats ────────────────────────────────────────────────────────────── */

/** A row of headline figures in one card, split by hairlines (Total Volume / Avg CPM / Active Agents). */
export function StatStrip({ items }) {
  return (
    <dl className={`${CARD} ${CARD_EDGE} grid! grid-cols-[1.06fr_0.98fr_1.16fr] gap-0! px-0! py-3`} style={CARD_FILL}>
      {items.map((item, i) => (
        <div key={item.label} className={`flex min-w-0 flex-col gap-1 ${i === 0 ? "pl-3.5 pr-2" : i === items.length - 1 ? "pl-2.5 pr-3" : "px-2"} ${i > 0 ? "border-l border-white/[0.06]" : ""}`}>
          <dt className={`${LABEL} flex items-center gap-1 whitespace-nowrap max-[374px]:whitespace-normal max-[374px]:text-[10px] max-[374px]:leading-[13px]`}>
            {item.label}
            {item.aside}
          </dt>
          <dd className="truncate text-[16px] font-medium leading-5 text-[#f0ddb9]">{item.value}</dd>
          <dd className="text-[10px] leading-[13px] text-[#717182]">{item.sub}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One headline figure in a 2-up grid (agent detail, run results). */
export function StatTile({ label, value, sub, tone, aside = null }) {
  return (
    <div className={`${TILE} flex min-w-0 flex-col gap-1 px-3 py-2.5`}>
      <p className={`${LABEL} flex items-center gap-1.5`}>
        <span className="truncate">{label}</span>
        {aside}
      </p>
      <p className={`truncate text-[16px] font-medium leading-5 ${tone ?? "text-[#f0ddb9]"}`}>{value}</p>
      <p className="truncate text-[10px] leading-[13px] text-[#717182]">{sub}</p>
    </div>
  );
}

/** Label over value, for the counter grids. */
export function Counter({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className={LABEL}>{label}</dt>
      <dd className="truncate text-[14px] font-medium leading-[18px] text-[#dcdce8]">{value}</dd>
    </div>
  );
}

/* ── Controls ─────────────────────────────────────────────────────────── */

/** iOS-style switch in the vault colours (production's Toggle, 44px hit area). */
export function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-[44px] shrink-0 rounded-full border transition-colors after:absolute after:-inset-2 disabled:opacity-40 ${
        checked ? "border-[rgba(204,177,127,0.5)] bg-[rgba(204,177,127,0.3)]" : "border-white/[0.08] bg-white/[0.08]"
      }`}
    >
      <span
        className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all ${
          checked ? "left-[20px] bg-[linear-gradient(to_bottom,#f2ddb5,#ba8f52)]" : "left-[2px] bg-[linear-gradient(to_bottom,#6a6a6a,#444)]"
        }`}
      />
    </button>
  );
}

/** A simple text sheet for an ⓘ. */
export function InfoSheet({ open, onClose, title, body }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title={title}>
      <p className="px-4 pb-6 pt-4 text-[13px] leading-[19px] text-[#b4b5c2]">{body}</p>
    </Dn2Sheet>
  );
}

/* ── Volume chart ─────────────────────────────────────────────────────── */

const W = 600;
const H = 150;

/**
 * Production's cumulative volume chart, sized for a phone: 180px plot, y
 * labels on the left, and a finger (or pointer) scrubs it — the readout sits
 * in the card head while you drag, like a native stocks chart.
 */
export function VolumeChart({ points }) {
  const [hover, setHover] = useState(null);
  const plot = useRef(null);
  const gradient = useId();
  const has = points.length >= 2 && Math.max(...points.map((p) => p.v)) > 0;
  const { hi, ticks } = useMemo(() => niceScale(has ? Math.max(...points.map((p) => p.v)) : 1), [points, has]);
  const t0 = has ? points[0].t : 0;
  const t1 = has ? points[points.length - 1].t : 1;
  const long = t1 - t0 > 86_400_000;
  const x = (t) => ((t - t0) / (t1 - t0 || 1)) * 100;
  const y = (v) => (1 - v / hi) * 100;
  const line = has ? points.map((p, i) => `${i ? "L" : "M"}${(x(p.t) / 100) * W},${(y(p.v) / 100) * H}`).join(" ") : "";
  const area = has ? `${line} L${W},${H} L0,${H} Z` : "";
  const shown = hover !== null ? points[hover] : has ? points[points.length - 1] : null;
  const stamp = (t) =>
    long
      ? new Date(t).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const scrub = (clientX) => {
    const r = plot.current?.getBoundingClientRect();
    if (!r || !has) return;
    const t = t0 + ((clientX - r.left) / r.width) * (t1 - t0);
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(p.t - t) < Math.abs(points[best].t - t)) best = i;
    });
    setHover(best);
  };

  if (!has) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[16px] font-medium leading-5 text-[#f0ddb9]">{usdCompact(shown?.v ?? 0)}</p>
        <p className="text-[11px] leading-[14px] text-[#717182]">{hover !== null ? stamp(shown.t) : "Total"}</p>
      </div>
      <div className="relative h-[180px]">
        <div className="absolute bottom-[20px] left-0 top-0 w-[44px]">
          {ticks.map((v) => (
            <span
              key={v}
              className="absolute right-1.5 -translate-y-1/2 text-[10px] leading-3 text-[#63646f]"
              style={{ top: `${y(v)}%` }}
            >
              {usdCompact(v)}
            </span>
          ))}
        </div>
        <div
          ref={plot}
          className="absolute bottom-[20px] left-[44px] right-1 top-0 touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            scrub(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.pointerType === "mouse" || e.buttons) scrub(e.clientX);
          }}
          onPointerUp={() => setHover(null)}
          onPointerCancel={() => setHover(null)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
        >
          {ticks.map((v) => (
            <div key={v} className="pointer-events-none absolute inset-x-0 h-px bg-white/[0.05]" style={{ top: `${y(v)}%` }} />
          ))}
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d6b06a" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#d6b06a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradient})`} />
            <path
              d={line}
              fill="none"
              stroke="#d6b06a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {shown ? (
            <>
              {hover !== null ? (
                <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-white/20" style={{ left: `${x(shown.t)}%` }} />
              ) : null}
              <div
                className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b06a] shadow-[0_0_0_3px_rgba(214,176,106,0.22)]"
                style={{ left: `${x(shown.t)}%`, top: `${y(shown.v)}%` }}
              />
            </>
          ) : null}
        </div>
        <div className="absolute bottom-0 left-[44px] right-1 flex h-4 justify-between">
          <span className="text-[10px] leading-3 text-[#63646f]">{stamp(t0)}</span>
          <span className="text-[10px] leading-3 text-[#63646f]">{stamp(t1)}</span>
        </div>
      </div>
    </div>
  );
}
