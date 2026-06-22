import React from "react";
import { X } from "lucide-react";

/** Terminal UI — neutral borders & dividers (reference #584200) */
const fontOnest = "font-['Onest',sans-serif]";
const borderDivider = "border-[#584200]";
const borderPositiveSubtle = "border-[#0a2917]";
const borderNegativeSubtle = "border-[#470f0f]";
function IconJustificationLead() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="#22C55E" />
      <path
        d="M7.5 12.25L10.2 15L16.2 9"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExitLead() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="#B42318" />
      <path
        d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Static copy preserved from HyprEarn backtest export — visual reskin only. */
const ABOUT_STRATEGY =
  "A 15-minute trend-continuation strategy that enters long after a confirmed breakout on rising volume, with momentum, OI growth, and funding all aligned. Entries cluster within a tight range so slippage stays predictable. Exits use a 1×ATR stop on the 1h close and a partial take-profit when 4h RSI cools below 70. Best in trending regimes — it skips ranging tape and reduces size when broader-market signals diverge.";

const METRICS = [
  { label: "Current Price", value: "$0.10979", valueClass: "text-[#F4F4F5]" },
  {
    label: "Entry Range",
    value: "$0.1096–0.1102",
    valueClass: "text-[#F4F4F5]",
  },
  { label: "Take Profit", value: "$0.112692", valueClass: "text-[#18F2A3]" },
  { label: "Stop Loss", value: "$0.104842", valueClass: "text-[#E04444]" },
] as const;

type WinRateRange = "1D" | "7D" | "ALL";

const WIN_RATE_BY_RANGE: Record<WinRateRange, string> = {
  "1D": "72.4%",
  "7D": "68.0%",
  ALL: "65.2%",
};

const WIN_RATE_RANGE_OPTIONS = [
  { key: "1D", label: "1D" },
  { key: "7D", label: "7D" },
  { key: "ALL", label: "All" },
] as const;

const CHART_POINTS = [
  { x: 40, v: 55.0, label: "Dec 19" },
  { x: 180, v: 58.5, label: "Jan 16" },
  { x: 320, v: 62.0, label: "Feb 20" },
  { x: 460, v: 64.0, label: "Mar 27" },
  { x: 560, v: 68.0, label: "Today" },
];

function buildChartPath(
  points: typeof CHART_POINTS,
  innerH: number,
  top: number,
  vmin: number,
  vmax: number,
): string {
  const yAt = (v: number) => top + ((vmax - v) / (vmax - vmin)) * innerH;
  let d = `M ${points[0].x} ${yAt(points[0].v)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${yAt(points[i].v)}`;
  }
  return d;
}

function buildChartAreaPath(
  points: typeof CHART_POINTS,
  innerH: number,
  top: number,
  vmin: number,
  vmax: number,
  bottomY: number,
): string {
  const line = buildChartPath(points, innerH, top, vmin, vmax);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
}

export function HyprEarnBacktestPanel({
  onClose,
  instrumentTitle = "DOGE-USDC",
}: {
  onClose: () => void;
  /** When opened from a vault card, show that market name in the header. */
  instrumentTitle?: string;
}) {
  const [winRateRange, setWinRateRange] = React.useState<WinRateRange>("7D");
  const selectedWinRate = WIN_RATE_BY_RANGE[winRateRange];
  const activeWinRateIndex = WIN_RATE_RANGE_OPTIONS.findIndex(
    (option) => option.key === winRateRange,
  );
  const innerH = 108;
  const top = 28;
  const vmin = 50;
  const vmax = 70;
  const bottomY = top + innerH;
  const linePath = buildChartPath(CHART_POINTS, innerH, top, vmin, vmax);
  const areaPath = buildChartAreaPath(
    CHART_POINTS,
    innerH,
    top,
    vmin,
    vmax,
    bottomY,
  );

  return (
    <div
      className={`flex max-h-[min(92vh,940px)] flex-col overflow-y-auto rounded-[16px] border ${borderDivider} border-solid bg-black text-[#F4F4F5] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${fontOnest}`}
    >
      <header
        className={`flex shrink-0 items-start justify-between gap-4 border-b ${borderDivider} border-solid px-5 pb-4 pt-5`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black ring-1 ring-[#584200]`}
          >
            <span className={`text-sm font-bold text-white ${fontOnest}`}>
              D
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-[17px] font-bold tracking-tight text-[#F4F4F5]">
                {instrumentTitle}
              </h1>
              <span className="shrink-0 rounded-full border border-[rgba(24,242,163,0.45)] bg-black px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#18F2A3]">
                Long
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <span className="text-[12px] text-[#6C727C]">Just now</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#8B8F98] transition-colors hover:bg-white/[0.06] hover:text-[#F4F4F5]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-5 pb-6 pt-4">
        {/* Top metrics — desktop */}
        <div
          className={`hidden overflow-hidden rounded-[16px] border ${borderDivider} border-solid bg-black sm:flex`}
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`flex min-w-0 flex-1 flex-col gap-1 px-4 py-3 ${i > 0 ? `border-l ${borderDivider} border-solid` : ""}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {m.label}
              </span>
              <span
                className={`truncate text-[15px] font-semibold tabular-nums ${m.valueClass}`}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
        {/* Top metrics — mobile */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className={`rounded-[16px] border ${borderDivider} border-solid bg-black px-3 py-2.5`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {m.label}
              </span>
              <div
                className={`mt-0.5 text-[14px] font-semibold tabular-nums ${m.valueClass}`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-[#9CA3AF] sm:text-left">
          <span className="font-semibold text-[#E04444]">SL</span>{" "}
          <span className="tabular-nums text-[#D1D5DB]">$0.1048</span>
          <span className="mx-2 text-[#4B5563]">·</span>
          <span className="font-semibold text-white">Entry</span>{" "}
          <span className="tabular-nums text-[#D1D5DB]">$0.1096–0.1102</span>
          <span className="mx-2 text-[#4B5563]">·</span>
          <span className="font-semibold text-[#18F2A3]">TP</span>{" "}
          <span className="tabular-nums text-[#D1D5DB]">$0.1127</span>
        </p>

        <section className={`border-t ${borderDivider} border-solid pt-4`}>
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
            Winning thesis
          </h2>
          <p className="text-[13px] leading-relaxed text-[#D1D5DB]">
            Strong uptrend with OI growth and positive funding
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className={`rounded-[16px] border ${borderPositiveSubtle} border-solid bg-black px-4 py-3`}
          >
            <h3 className="mb-3 text-[12px] font-bold text-white">
              Justification
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                "24h OI increased 103.25% showing capital inflow",
                "1h MACD histogram positive (+0.00086)",
                "7.5% above 20-EMA with parabolic structure",
                "$1M bid liquidity at 0.25% depth",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2 text-[12px] leading-snug text-[#bfbfbf]"
                >
                  <IconJustificationLead />
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`rounded-[16px] border ${borderNegativeSubtle} border-solid bg-black px-4 py-3`}
          >
            <h3 className="mb-3 text-[12px] font-bold text-white">
              Exit triggers
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                "1h close below 0.105 (1×ATR stop)",
                "4h RSI crosses below 70",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2 text-[12px] leading-snug text-[#bfbfbf]"
                >
                  <IconExitLead />
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className={`rounded-[16px] border ${borderDivider} border-solid bg-black px-4 py-3`}
          >
            <h3 className="mb-3 text-[12px] font-bold text-white">
              Setup details
            </h3>
            <dl className="flex flex-col gap-2.5 text-[12px]">
              <Row
                label="Strategy type"
                value="Trend continuation"
                valueClass="font-semibold text-white"
              />
              <Row label="Timeframe" value="15m" />
              <Row label="Leverage" value="10× Isolated" />
              <Row label="Order type" value="Market" />
              <Row
                label="Take Profit (%)"
                value="+26.43%"
                valueClass="tabular-nums text-[#18F2A3]"
              />
              <Row
                label="Stop Loss (%)"
                value="-45.06%"
                valueClass="tabular-nums text-[#E04444]"
              />
              <Row label="Projected R:R" value="1 : 0.55" />
            </dl>
          </div>
          <div
            className={`rounded-[16px] border ${borderDivider} border-solid bg-black px-4 py-3`}
          >
            <h3 className="mb-3 text-[12px] font-bold text-white">Backtest</h3>
            <dl className="flex flex-col gap-2.5 text-[12px]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="flex items-center gap-2 text-[#8B8F98]">
                  <span className="shrink-0">Win rate</span>
                  <span className="relative inline-grid grid-cols-3 items-center rounded-full bg-[linear-gradient(180deg,#0d1016_0%,#090c12_100%)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.03)]">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/3)] rounded-full border border-[#9a7536] bg-[radial-gradient(90%_120%_at_50%_20%,rgba(87,57,20,0.28)_0%,rgba(20,13,5,0.94)_72%)] shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-transform duration-320 ease-out"
                      style={{
                        transform: `translateX(calc(${activeWinRateIndex} * 100% + ${activeWinRateIndex * 2}px))`,
                      }}
                    />
                    {WIN_RATE_RANGE_OPTIONS.map((option) => {
                      const active = winRateRange === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setWinRateRange(option.key)}
                          aria-label={`Show ${option.label} win rate`}
                          className={`relative z-10 rounded-full border-none px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                            active
                              ? "bg-transparent text-[#f0dfbf]"
                              : "bg-transparent text-[#8f939d] hover:text-[#d4d7df]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </span>
                </dt>
                <div className="flex items-center gap-2">
                  <dd className="min-w-[58px] text-right tabular-nums text-[#18F2A3]">
                    {selectedWinRate}
                  </dd>
                </div>
              </div>
              <Row label="Backtest total trades" value="2,184" />
              <Row
                label="Avg realised R:R"
                value="1 : 0.71"
                valueClass="tabular-nums text-[#18F2A3]"
              />
              <Row
                label="Backtest win rate"
                value="65.2%"
                valueClass="tabular-nums text-[#18F2A3]"
              />
              <Row label="Backtest Sharpe" value="1.62" />
              <Row
                label="Expected Return / $1000"
                value="+$3.42"
                valueClass="tabular-nums text-[#18F2A3]"
              />
            </dl>
          </div>
        </div>

        <div className="bg-black px-0 py-0">
          <div className="mb-3 flex items-start justify-between gap-2 px-1">
            <div>
              <h3 className="text-[13px] font-bold text-white">
                Win rate · Backtest
              </h3>
              <p className="text-[11px] text-[#8B8F98]">
                Win rate vs. timeframe (weeks)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8B8F98]">
                Latest
              </span>
              <div className="text-[13px] font-semibold tabular-nums text-[#18F2A3]">
                {selectedWinRate}
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-hidden rounded-[12px] bg-black">
            <svg
              viewBox="0 0 600 168"
              className="h-[200px] w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="hb-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18F2A3" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#18F2A3" stopOpacity="0" />
                </linearGradient>
                <filter
                  id="hb-glow"
                  x="-15%"
                  y="-15%"
                  width="130%"
                  height="130%"
                >
                  <feGaussianBlur stdDeviation="1" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {[50, 55, 60, 65, 70].map((pct) => {
                const y = top + ((vmax - pct) / (vmax - vmin)) * innerH;
                return (
                  <g key={pct}>
                    <line
                      x1="36"
                      y1={y}
                      x2="580"
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                    <text
                      x="32"
                      y={y + 3}
                      textAnchor="end"
                      fill="#6C727C"
                      style={{ fontSize: 9, fontFamily: "'Onest', sans-serif" }}
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#hb-fill)" />
              <path
                d={linePath}
                fill="none"
                stroke="#18F2A3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#hb-glow)"
              />
              {CHART_POINTS.map((p) => (
                <circle
                  key={p.label}
                  cx={p.x}
                  cy={top + ((vmax - p.v) / (vmax - vmin)) * innerH}
                  r="3.5"
                  fill="#000000"
                  stroke="#18F2A3"
                  strokeWidth="1.5"
                />
              ))}
              {CHART_POINTS.map((p) => (
                <text
                  key={`l-${p.label}`}
                  x={p.x}
                  y="162"
                  textAnchor="middle"
                  fill="#6C727C"
                  style={{ fontSize: 9, fontFamily: "'Onest', sans-serif" }}
                >
                  {p.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        <section className={`border-t ${borderDivider} border-solid pt-4`}>
          <h3 className="mb-2 text-[12px] font-bold text-white">
            About strategy
          </h3>
          <p className="text-[12px] leading-relaxed text-[#bfbfbf]">
            {ABOUT_STRATEGY}
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "font-semibold tabular-nums text-[#F4F4F5]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[#8B8F98]">{label}</dt>
      <dd className={`text-right ${valueClass}`}>{value}</dd>
    </div>
  );
}
