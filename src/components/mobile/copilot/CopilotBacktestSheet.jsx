import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useAppToast } from "../appToastContext.js";
import {
  ABOUT_STRATEGY,
  CHART_POINTS,
  THESIS_BACKTEST_STATS,
  THESIS_EXIT_TRIGGERS,
  THESIS_JUSTIFICATIONS,
  THESIS_SETUP_DETAILS,
  THESIS_SUMMARY,
  WIN_RATE_BY_RANGE,
} from "../../terminal/AiCopilotThesisModal.tsx";
import {
  COPILOT_DEFAULT_LEVERAGE,
  chipValue,
  formatEntryRange,
  formatPrice,
  ideaLevels,
  priceDecimals,
} from "./copilotIdeaData.js";
import { SidePill, TokenDisc } from "./CopilotIdeaCard.jsx";
import { copyBacktestCard } from "./backtestImage.js";

/* Figma status inks the app token set doesn't name. */
const BRIGHT_GREEN = "text-[#18f2a3]";
const BRIGHT_RED = "text-[#e04444]";
const LABEL_GREY = "text-[#8b8f98]";
const VALUE_INK = "text-[#f4f4f5]";

/**
 * Figma's toggle is 7D / 30D / All. The thesis mock has 1D / 7D / All; it has
 * no 30-day figure, so that one is a local placeholder until the API lands.
 */
const RANGES = [
  { key: "7D", label: "7D", winRate: WIN_RATE_BY_RANGE["7D"] },
  { key: "30D", label: "30D", winRate: "66.4%" },
  { key: "ALL", label: "All", winRate: WIN_RATE_BY_RANGE.ALL },
];

/* ------------------------------------------------------------- chart */

/** Figma "Plot" (1012:5932): 0–80% on a 144px axis, x from 44 to 304. */
const PLOT = { left: 32, right: 316, top: 8, bottom: 152, firstX: 44, lastX: 304, maxPct: 80 };

/** Catmull-Rom → cubic Bézier, the curve Figma's plot is drawn with. */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function WinRateChart({ points }) {
  const gradientId = useId();
  const span = PLOT.bottom - PLOT.top;
  const step = points.length > 1 ? (PLOT.lastX - PLOT.firstX) / (points.length - 1) : 0;
  const pts = points.map((p, i) => ({
    x: PLOT.firstX + i * step,
    y: PLOT.bottom - (Math.min(PLOT.maxPct, Math.max(0, p.v)) / PLOT.maxPct) * span,
    label: p.label,
  }));
  const line = smoothPath(pts);
  const area = pts.length
    ? `${line} L ${pts[pts.length - 1].x} ${PLOT.bottom} L ${pts[0].x} ${PLOT.bottom} Z`
    : "";
  const ticks = [80, 60, 40, 20, 0];

  return (
    <svg
      viewBox="0 0 322 184"
      className="block h-auto w-full overflow-visible"
      role="img"
      aria-label={`Win rate ${pts.map((p, i) => `${p.label} ${points[i].v}%`).join(", ")}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1={PLOT.top} x2="0" y2={PLOT.bottom} gradientUnits="userSpaceOnUse">
          <stop stopColor="#18F2A3" stopOpacity="0.28" />
          <stop offset="1" stopColor="#18F2A3" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((pct) => {
        const y = PLOT.bottom - (pct / PLOT.maxPct) * span;
        return (
          <g key={pct}>
            <line
              x1={PLOT.left}
              x2={PLOT.right}
              y1={y}
              y2={y}
              stroke="#fff"
              strokeOpacity={pct === 0 ? 0.16 : 0.08}
              strokeDasharray={pct === 0 ? undefined : "2 3"}
            />
            <text x="26" y={y} textAnchor="end" dominantBaseline="middle" fill="#6c727c" fontSize="10">
              {pct}%
            </text>
          </g>
        );
      })}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke="#18F2A3" strokeWidth="1.5" strokeLinecap="round" />
      {pts.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#000" stroke="#18F2A3" strokeWidth="1.5" />
      ))}
      {pts.map((p) => (
        <text key={`x-${p.label}`} x={p.x} y="166" textAnchor="middle" dominantBaseline="middle" fill="#6c727c" fontSize="10">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------- parts */

function PriceTile({ label, value, tone }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 self-stretch overflow-hidden rounded-2xl border border-app-line-accent bg-app-bg px-3 pb-3.5 pt-4">
      <p className="whitespace-nowrap text-app-micro font-bold uppercase leading-[13px] tracking-[0.8px] text-ink">
        {label}
      </p>
      <p className={`text-app-body font-semibold leading-[18px] ${tone}`}>{value}</p>
    </div>
  );
}

function ReasonList({ title, items, icon, borderClass }) {
  return (
    <section className={`flex flex-col gap-3 rounded-2xl border bg-app-bg p-4 ${borderClass}`}>
      <h3 className="text-app-caption font-bold leading-[15px] text-ink">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-2">
            <img alt="" src={icon} className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 text-app-caption font-normal leading-[15px] text-ink-muted">
              {text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Label/value row. `strong` values are SemiBold ink; toned values stay Regular. */
function StatRow({ label, value, tone }) {
  return (
    <div className="flex items-start justify-between gap-3 text-app-caption leading-[15px]">
      <dt className={`shrink-0 font-normal ${LABEL_GREY}`}>{label}</dt>
      <dd className={`min-w-0 text-right ${tone ?? `font-semibold ${VALUE_INK}`}`}>{value}</dd>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <section className={`flex flex-col gap-3 rounded-2xl border border-app-line-accent bg-app-bg p-4 ${className}`}>
      {children}
    </section>
  );
}

function RangeToggle({ value, onChange }) {
  const layoutId = useId();
  return (
    <div
      className="flex rounded-full bg-gradient-to-b from-[#0d1016] to-[#090c12] p-1"
      role="radiogroup"
      aria-label="Backtest range"
    >
      {RANGES.map((r) => {
        const active = r.key === value;
        return (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r.key)}
            className="relative flex h-[21px] w-10 items-center justify-center rounded-full"
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full border border-[#9a7536] bg-[#1a1208]"
                transition={{ type: "spring", damping: 30, stiffness: 420 }}
              />
            ) : null}
            <span
              className={`relative text-app-micro font-semibold leading-[13px] ${
                active ? "text-[#f0dfbf]" : "text-[#8f939d]"
              }`}
            >
              {r.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- sheet */

/** Everything the sheet shows for one idea, from the setup + the thesis mock. */
function useBacktest(setup, strategy) {
  return useMemo(() => {
    if (!setup) return null;
    const { price, takeProfit, stopLoss } = ideaLevels(setup);
    const decimals = priceDecimals(price);
    const short = setup.direction === "short";
    const pct = (to) => (price ? Math.abs(((to - price) / price) * 100).toFixed(2) : "0.00");
    return {
      tiles: [
        { label: "Current Price", value: formatPrice(price, decimals), tone: VALUE_INK, color: "#f4f4f5" },
        { label: "Entry Range", value: formatEntryRange(setup) ?? formatPrice(price, decimals), tone: VALUE_INK, color: "#f4f4f5" },
        { label: "Take profit", value: formatPrice(takeProfit, decimals), tone: BRIGHT_GREEN, color: "#18f2a3" },
        { label: "Stop loss", value: formatPrice(stopLoss, decimals), tone: BRIGHT_RED, color: "#e04444" },
      ],
      setupRows: [
        { label: "Strategy type", value: `${THESIS_SETUP_DETAILS.strategyType} ${short ? "short" : "long"}`, tone: "font-semibold text-ink" },
        { label: "Timeframe", value: strategy?.timeframe ?? THESIS_SETUP_DETAILS.timeframe },
        { label: "Leverage", value: `${COPILOT_DEFAULT_LEVERAGE}x Isolated` },
        { label: "Order type", value: THESIS_SETUP_DETAILS.orderType },
        { label: "Take profit", value: `+${pct(takeProfit)}%`, tone: `font-normal ${BRIGHT_GREEN}` },
        { label: "Stop loss", value: `-${pct(stopLoss)}%`, tone: `font-normal ${BRIGHT_RED}` },
        { label: "Projected R:R", value: chipValue(setup, "rr") ?? THESIS_SETUP_DETAILS.projectedRR },
      ],
      winRate: chipValue(setup, "win"),
    };
  }, [setup, strategy]);
}

/**
 * Figma "Copilot / Backtest Modal" (948:3651 open, 948:3359 full content):
 * a full-height sheet with its own header — token, symbol + side, Copy Image
 * and close — over price levels, the thesis, setup details, backtest stats,
 * the win-rate chart and the strategy blurb.
 *
 * Narrative and backtest figures come from the desktop thesis modal's content
 * (`AiCopilotThesisModal.tsx`); price levels come from the idea itself.
 */
export default function CopilotBacktestSheet({ open, onClose, setup, strategy }) {
  const toast = useAppToast();
  const [range, setRange] = useState("7D");
  const [copying, setCopying] = useState(false);
  const data = useBacktest(setup, strategy);
  const rangeWinRate = RANGES.find((r) => r.key === range)?.winRate;
  const first = CHART_POINTS[0]?.label;
  const last = CHART_POINTS[CHART_POINTS.length - 1]?.label;

  const copyImage = async () => {
    if (!setup || !data || copying) return;
    setCopying(true);
    try {
      const result = await copyBacktestCard({
        symbol: setup.symbol,
        side: setup.direction === "short" ? "short" : "long",
        tiles: data.tiles,
        footer: [
          data.winRate ? `Win rate ${data.winRate}` : null,
          chipValue(setup, "rr") ? `R:R ${chipValue(setup, "rr")}` : null,
          strategy?.shortLabel,
        ]
          .filter(Boolean)
          .join("  ·  "),
      });
      if (result === "copied") toast.show({ title: "Image copied", message: `${setup.symbol} backtest card is on your clipboard.` });
    } catch {
      toast.show({ tone: "error", title: "Couldn't copy image", message: "Your browser blocked image copy." });
    } finally {
      setCopying(false);
    }
  };

  return (
    <BottomSheet
      open={open && !!setup}
      onClose={onClose}
      fullHeight
      ariaLabel={setup ? `${setup.symbol} backtest` : "Backtest"}
      className="border-app-line-accent! bg-app-bg!"
      header={({ dragHandleProps, titleId }) => (
        <div className="shrink-0 touch-none select-none bg-app-bg" {...dragHandleProps}>
          <div className="flex justify-center pt-2" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-app-line-strong" />
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-app-line-accent px-4 pb-4 pt-3">
            <div className="flex min-w-0 items-center gap-3">
              {setup ? <TokenDisc setup={setup} size={40} /> : null}
              <div className="flex min-w-0 flex-col items-start gap-1">
                <h2
                  id={titleId}
                  className={`truncate text-[18px] font-bold leading-[21px] tracking-[-0.425px] ${VALUE_INK}`}
                >
                  {setup?.symbol}
                </h2>
                {setup ? <SidePill direction={setup.direction} /> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={copyImage}
                disabled={copying}
                className="app-pressable app-gradient-brand flex h-9 items-center gap-1.5 rounded-lg pl-3 pr-3.5 text-black disabled:opacity-70"
              >
                <span className="flex size-4 items-center justify-center">
                  <AppIcon src={appIcons.copyImage16} size={15.25} />
                </span>
                <span className="whitespace-nowrap text-app-caption font-medium leading-[15px]">
                  Copy Image
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close backtest"
                className="app-pressable flex size-9 items-center justify-center rounded-xl text-ink active:bg-white/[0.06]"
              >
                <AppIcon src={appIcons.close20} size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {data ? (
        <div className="flex flex-col gap-4 px-4 pt-4" data-tour="copilot-thesis-modal">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <PriceTile {...data.tiles[0]} />
              <PriceTile {...data.tiles[1]} />
            </div>
            <div className="flex gap-2">
              <PriceTile {...data.tiles[2]} />
              <PriceTile {...data.tiles[3]} />
            </div>
          </div>

          <section className="flex flex-col gap-2 border-t border-app-line-accent pt-4">
            <h3 className="text-app-label font-bold uppercase leading-[14px] tracking-[1.1px] text-ink">
              Winning thesis
            </h3>
            <p className="text-app-callout font-normal leading-[21px] text-[#d1d5db]">{THESIS_SUMMARY}</p>
          </section>

          <ReasonList
            title="Justification"
            items={THESIS_JUSTIFICATIONS}
            icon={appIcons.checkCircle16}
            borderClass="border-[#0a2917]"
          />
          <ReasonList
            title="Exit triggers"
            items={THESIS_EXIT_TRIGGERS}
            icon={appIcons.xCircle16}
            borderClass="border-[#470f0f]"
          />

          <Card>
            <h3 className="text-app-caption font-bold leading-[15px] text-ink">Setup details</h3>
            <dl className="flex flex-col gap-3">
              {data.setupRows.map((row) => (
                <StatRow key={row.label} {...row} />
              ))}
            </dl>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-app-caption font-bold leading-[15px] text-ink">Backtest</h3>
              <RangeToggle value={range} onChange={setRange} />
            </div>
            <dl className="flex flex-col gap-3">
              <StatRow label="Win rate" value={rangeWinRate} tone={`font-normal ${BRIGHT_GREEN}`} />
              <StatRow
                label="Avg. realized R:R"
                value={THESIS_BACKTEST_STATS.avgRealisedRR}
                tone={`font-normal ${BRIGHT_GREEN}`}
              />
              <StatRow label="Total trades" value={THESIS_BACKTEST_STATS.totalTrades} />
              <StatRow label="Sharpe ratio" value={THESIS_BACKTEST_STATS.sharpe} />
              <StatRow
                label="Expected return per $1,000"
                value={THESIS_BACKTEST_STATS.expectedReturnPer1000}
                tone={`font-normal ${BRIGHT_GREEN}`}
              />
            </dl>
          </Card>

          <Card>
            <div className="flex flex-col gap-0.5 text-app-caption">
              <h3 className="font-bold leading-[17px] text-ink">Win rate by month</h3>
              <p className={`font-normal leading-4 ${LABEL_GREY}`}>
                Backtest · {first} – {last}
              </p>
            </div>
            <WinRateChart points={CHART_POINTS} />
          </Card>

          <section className="flex flex-col gap-2 border-t border-app-line-accent pt-4">
            <h3 className="text-app-caption font-bold uppercase leading-[15px] tracking-[0.6px] text-ink">
              About strategy
            </h3>
            <p className="text-app-caption font-normal leading-[19.5px] text-ink-muted">{ABOUT_STRATEGY}</p>
          </section>
        </div>
      ) : null}
    </BottomSheet>
  );
}
