import React from "react";
import { X } from "lucide-react";

const fontOnest = "font-['Onest',sans-serif]";
const borderDivider = "border-[#584200]";
const positiveValueClass = "text-[#18F2A3]";
const negativeValueClass = "text-[#E04444]";
const neutralValueClass = "text-[#F4F4F5]";

const BLUECHIP_VAULT_DATA = {
  name: "BlueChip",
  subtitle: "Cortex Alpha · Hyperliquid",
  badge: "Popular",
  updatedAtLabel: "Just now",
  metrics: {
    apr: "20.12%",
    totalVolume: "$146,737",
    activeUsers: "15",
    expectedPerThousand: "+$28.40",
  },
  details: {
    strategy: "BlueChip (Cortex Alpha)",
    dex: "Hyperliquid",
    custodyModel: "Non-custodial",
    allocation: "30%",
    minDeposit: "$0.048 USDC",
    maxDeposit: "$0.160 USDC",
  },
  backtest: {
    apr: "20.12%",
    totalTrades: "2,184",
    backtestApr: "18.75%",
    sharpeRatio: "1.84",
    expectedReturnPerThousand: "+$28.40",
  },
  historicalApr: [
    { date: "Dec 19", apr: 14.1 },
    { date: "Dec 26", apr: 14.6 },
    { date: "Jan 02", apr: 15.1 },
    { date: "Jan 09", apr: 15.4 },
    { date: "Jan 16", apr: 16.0 },
    { date: "Jan 23", apr: 16.5 },
    { date: "Jan 30", apr: 16.9 },
    { date: "Feb 06", apr: 17.6 },
    { date: "Feb 13", apr: 18.1 },
    { date: "Feb 20", apr: 18.5 },
    { date: "Feb 27", apr: 18.8 },
    { date: "Mar 06", apr: 19.2 },
    { date: "Mar 13", apr: 19.5 },
    { date: "Mar 20", apr: 19.7 },
    { date: "Mar 27", apr: 19.9 },
    { date: "Apr 03", apr: 19.8 },
    { date: "Apr 10", apr: 20.12 },
  ],
  about:
    "BlueChip is a fully non-custodial automated vault that focuses on the highest-liquidity perp markets on Hyperliquid. The AI engine sizes positions conservatively, prioritising drawdown protection and steady compounding over peak APR. Users can cancel participation at any time; active trade placements cannot be migrated between vaults.",
} as const;

const SUMMARY_METRICS = [
  { label: "APR", value: BLUECHIP_VAULT_DATA.metrics.apr, semantic: "positive" },
  {
    label: "Total Volume",
    value: BLUECHIP_VAULT_DATA.metrics.totalVolume,
    semantic: "neutral",
  },
  {
    label: "Active Users",
    value: BLUECHIP_VAULT_DATA.metrics.activeUsers,
    semantic: "neutral",
  },
  {
    label: "Expected / $1,000",
    value: BLUECHIP_VAULT_DATA.metrics.expectedPerThousand,
    semantic: "positive",
  },
] as const;

const VAULT_DETAILS_ROWS = [
  { label: "Strategy", value: BLUECHIP_VAULT_DATA.details.strategy },
  { label: "DEX", value: BLUECHIP_VAULT_DATA.details.dex },
  { label: "Custody model", value: BLUECHIP_VAULT_DATA.details.custodyModel },
  { label: "APR", value: BLUECHIP_VAULT_DATA.metrics.apr },
  { label: "Allocation", value: BLUECHIP_VAULT_DATA.details.allocation },
  { label: "Max deposit", value: BLUECHIP_VAULT_DATA.details.maxDeposit },
] as const;

const BACKTEST_ROWS = [
  {
    label: "Backtest total trades",
    value: BLUECHIP_VAULT_DATA.backtest.totalTrades,
    semantic: "neutral",
  },
  {
    label: "Backtest APR",
    value: BLUECHIP_VAULT_DATA.backtest.backtestApr,
    semantic: "positive",
  },
  {
    label: "Sharpe ratio",
    value: BLUECHIP_VAULT_DATA.backtest.sharpeRatio,
    semantic: "neutral",
  },
  {
    label: "Expected return / $1,000",
    value: BLUECHIP_VAULT_DATA.backtest.expectedReturnPerThousand,
    semantic: "positive",
  },
] as const;

const CHART_Y_TICKS = [13, 15, 17, 19, 21, 23] as const;
const CHART_X_TICKS = ["Dec 19", "Jan 16", "Feb 13", "Mar 13", "Apr 10"] as const;

function getChartPath(
  points: readonly { date: string; apr: number }[],
  width: number,
  top: number,
  innerHeight: number,
  minValue: number,
  maxValue: number,
): string {
  if (!points.length) return "";
  const step = width / (points.length - 1);
  const yAt = (value: number) =>
    top + ((maxValue - value) / (maxValue - minValue)) * innerHeight;

  let path = `M ${36} ${yAt(points[0].apr)}`;
  for (let i = 1; i < points.length; i += 1) {
    const x = 36 + step * i;
    const y = yAt(points[i].apr);
    path += ` L ${x} ${y}`;
  }
  return path;
}

export function VaultsStrategyPanel({
  instrumentTitle = "DOGE-USDC",
  onClose,
}: {
  instrumentTitle?: string;
  onClose: () => void;
}) {
  const chartTop = 24;
  const chartInnerHeight = 120;
  const chartMin = 13;
  const chartMax = 23;
  const chartBottomY = chartTop + chartInnerHeight;
  const chartDrawableWidth = 544;
  const chartStep = chartDrawableWidth / (BLUECHIP_VAULT_DATA.historicalApr.length - 1);
  const aprLinePath = getChartPath(
    BLUECHIP_VAULT_DATA.historicalApr,
    chartDrawableWidth,
    chartTop,
    chartInnerHeight,
    chartMin,
    chartMax,
  );
  const areaPath = `${aprLinePath} L ${36 + chartDrawableWidth} ${chartBottomY} L 36 ${chartBottomY} Z`;

  return (
    <div
      className={`flex max-h-[min(92vh,940px)] flex-col overflow-y-auto rounded-[16px] border ${borderDivider} border-solid bg-black text-[#f4f4f5] ${fontOnest}`}
    >
      <header
        className={`flex items-start justify-between gap-3 border-b ${borderDivider} border-solid px-5 pb-4 pt-5`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black ring-1 ring-[#584200]`}
          >
            <span className={`text-sm font-bold text-white ${fontOnest}`}>B</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[17px] font-semibold text-[#f4f4f5]">
                {BLUECHIP_VAULT_DATA.name}
              </h2>
              <span className="shrink-0 rounded-full border border-[rgba(204,177,127,0.35)] bg-[rgba(204,177,127,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#e8d5b5]">
                {BLUECHIP_VAULT_DATA.badge}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[#8b8f98]">
              {BLUECHIP_VAULT_DATA.subtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[12px] text-[#8B8F98]">
            {BLUECHIP_VAULT_DATA.updatedAtLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#8b8f98] transition-colors hover:bg-white/[0.06] hover:text-[#f4f4f5]"
            aria-label="Close vaults strategy"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-5 pb-6 pt-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {SUMMARY_METRICS.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-[16px] border ${borderDivider} border-solid bg-black px-3 py-2.5 sm:px-4 sm:py-3`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {metric.label}
              </p>
              <p
                className={`mt-0.5 truncate text-[14px] font-semibold tabular-nums sm:text-[15px] ${
                  metric.semantic === "positive"
                    ? positiveValueClass
                    : neutralValueClass
                }`}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section
            className={`rounded-[16px] border ${borderDivider} border-solid bg-black px-4 py-3`}
          >
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
              Vault Details
            </h3>
            <dl className="flex flex-col gap-2.5 text-[12px]">
              {VAULT_DETAILS_ROWS.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </section>
          <section
            className={`rounded-[16px] border ${borderDivider} border-solid bg-black px-4 py-3`}
          >
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
              Backtest
            </h3>
            <dl className="flex flex-col gap-2.5 text-[12px]">
              {BACKTEST_ROWS.map((row) => (
                <DetailRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  valueClass={
                    row.semantic === "positive"
                      ? positiveValueClass
                      : row.semantic === "negative"
                        ? negativeValueClass
                        : neutralValueClass
                  }
                />
              ))}
            </dl>
          </section>
        </div>

        <section className="bg-black px-0 py-0">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-[13px] font-bold text-white">APR · Historical</h3>
              <p className="text-[11px] text-[#8B8F98]">Weekly performance over time</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8B8F98]">
                Latest
              </span>
              <div className={`text-[13px] font-semibold tabular-nums ${positiveValueClass}`}>
                {BLUECHIP_VAULT_DATA.metrics.apr}
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-hidden bg-black">
            <svg
              viewBox="0 0 600 172"
              className="h-[210px] w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="vault-apr-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18F2A3" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#18F2A3" stopOpacity="0" />
                </linearGradient>
                <filter
                  id="vault-apr-glow"
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
              {CHART_Y_TICKS.map((tick) => {
                const y =
                  chartTop + ((chartMax - tick) / (chartMax - chartMin)) * chartInnerHeight;
                return (
                  <g key={tick}>
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
                      {tick}%
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#vault-apr-fill)" />
              <path
                d={aprLinePath}
                fill="none"
                stroke="#18F2A3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#vault-apr-glow)"
              />
              {BLUECHIP_VAULT_DATA.historicalApr.map((point, index) => {
                const x = 36 + chartStep * index;
                const y =
                  chartTop +
                  ((chartMax - point.apr) / (chartMax - chartMin)) * chartInnerHeight;
                return (
                  <circle
                    key={point.date}
                    cx={x}
                    cy={y}
                    r={index === BLUECHIP_VAULT_DATA.historicalApr.length - 1 ? 3.8 : 0}
                    fill="#000000"
                    stroke="#18F2A3"
                    strokeWidth="1.5"
                  />
                );
              })}
              {CHART_X_TICKS.map((label) => {
                const idx = BLUECHIP_VAULT_DATA.historicalApr.findIndex(
                  (point) => point.date === label,
                );
                const x = idx === -1 ? 36 : 36 + chartStep * idx;
                return (
                  <text
                    key={label}
                    x={x}
                    y="166"
                    textAnchor="middle"
                    fill="#6C727C"
                    style={{ fontSize: 9, fontFamily: "'Onest', sans-serif" }}
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>
        </section>

        <section className={`border-t ${borderDivider} border-solid pt-4`}>
          <h3 className="mb-2 text-[12px] font-bold text-white">About this vault</h3>
          <p className="text-[12px] leading-relaxed text-[#bfbfbf]">
            {BLUECHIP_VAULT_DATA.about}
          </p>
        </section>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClass = neutralValueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[#8B8F98]">{label}</dt>
      <dd className={`text-right font-semibold tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}
