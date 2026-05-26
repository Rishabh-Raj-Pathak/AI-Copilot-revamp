import {
  buildSeriesAreaPath,
  buildSeriesPath,
  buildYTicks,
  computeValueBounds,
  formatChartDate,
  formatEquityTick,
} from "./equityChartUtils.js";

const CHART_W = 400;
const INNER_H = 120;
const TOP = 12;
const LEFT_PAD = 44;
const RIGHT_PAD = 12;
const BOTTOM_PAD = 28;

export default function OverviewEquityChart({ bt, range }) {
  const strategyPts = bt?.equityCurve?.strategy ?? [];
  const buyHoldPts = bt?.equityCurve?.buyAndHold ?? [];
  const { vmin, vmax } = computeValueBounds(strategyPts, buyHoldPts);
  const bottomY = TOP + INNER_H;
  const plotW = CHART_W - LEFT_PAD - RIGHT_PAD;
  const yTicks = buildYTicks(vmin, vmax, 5);

  const strategyLine = buildSeriesPath(strategyPts, plotW, INNER_H, TOP, vmin, vmax);
  const buyHoldLine = buildSeriesPath(buyHoldPts, plotW, INNER_H, TOP, vmin, vmax);
  const strategyArea = buildSeriesAreaPath(
    strategyPts,
    plotW,
    INNER_H,
    TOP,
    vmin,
    vmax,
    bottomY,
  );

  const startLabel =
    formatChartDate(strategyPts[0]?.date) ||
    formatChartDate(range?.rangeStart) ||
    "";
  const endLabel =
    formatChartDate(strategyPts[strategyPts.length - 1]?.date) ||
    formatChartDate(range?.rangeEnd) ||
    "";

  const yAt = (v) => TOP + ((vmax - v) / (vmax - vmin)) * INNER_H;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-medium text-[#929292]">Equity Curve</h4>
        <div className="flex gap-4 text-[10px]">
          <span className="flex items-center gap-1.5 text-[#f2b500]">
            <span className="inline-block h-0.5 w-4 bg-[#f2b500]" aria-hidden />
            Strategy
          </span>
          <span className="flex items-center gap-1.5 text-[#757575]">
            <span
              className="inline-block h-0 w-4 border-t border-dashed border-[#757575]"
              aria-hidden
            />
            Buy & Hold
          </span>
        </div>
      </div>

      <div className="relative mt-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_W} ${TOP + INNER_H + BOTTOM_PAD}`}
          className="h-[168px] w-full min-w-[280px]"
          aria-label="Equity curve chart"
          role="img"
        >
          <defs>
            <linearGradient id="overview-eq-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2b500" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f2b500" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={LEFT_PAD}
                y1={yAt(tick)}
                x2={CHART_W - RIGHT_PAD}
                y2={yAt(tick)}
                stroke="#262626"
                strokeWidth="0.75"
              />
              <text
                x={LEFT_PAD - 6}
                y={yAt(tick) + 3}
                textAnchor="end"
                className="fill-[#585858] text-[9px]"
              >
                {formatEquityTick(tick)}
              </text>
            </g>
          ))}

          <g transform={`translate(${LEFT_PAD}, 0)`}>
            {strategyArea ? (
              <path d={strategyArea} fill="url(#overview-eq-fill)" />
            ) : null}
            {buyHoldLine ? (
              <path
                d={buyHoldLine}
                fill="none"
                stroke="#6a6a6a"
                strokeWidth="1.25"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
            ) : null}
            {strategyLine ? (
              <path
                d={strategyLine}
                fill="none"
                stroke="#f2b500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>

          <text x={LEFT_PAD} y={bottomY + 16} className="fill-[#585858] text-[9px]">
            {startLabel}
          </text>
          <text
            x={CHART_W - RIGHT_PAD}
            y={bottomY + 16}
            textAnchor="end"
            className="fill-[#585858] text-[9px]"
          >
            {endLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
