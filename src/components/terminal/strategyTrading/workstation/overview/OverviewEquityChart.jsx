import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import ScrollFade from "../ScrollFade.jsx";
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
  const theme = useCopilotTheme();
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

  const shellClass = theme.isV2
    ? "rounded-xl border border-white/6 bg-[#141716] p-4"
    : "rounded-xl border border-[#2a2a2a] bg-[#141414] p-4";
  const legendStrategyClass = theme.isV2
    ? "flex items-center gap-1.5 text-[#19E6A3]"
    : "flex items-center gap-1.5 text-[#f2b500]";
  const legendLineClass = theme.isV2 ? "bg-[#19E6A3]" : "bg-[#f2b500]";
  const fillTop = theme.isV2 ? "#19E6A3" : "#f2b500";
  const strokeLine = theme.isV2 ? "#16E6A3" : "#f2b500";

  const chartSvg = (
    <svg
      viewBox={`0 0 ${CHART_W} ${TOP + INNER_H + BOTTOM_PAD}`}
      className="h-[168px] w-full min-w-[280px]"
      aria-label="Equity curve chart"
      role="img"
    >
      <defs>
        <linearGradient id="overview-eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} stopOpacity="0.22" />
          <stop offset="100%" stopColor={fillTop} stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={LEFT_PAD}
            y1={yAt(tick)}
            x2={CHART_W - RIGHT_PAD}
            y2={yAt(tick)}
            stroke={theme.isV2 ? "rgba(255,255,255,0.06)" : "#262626"}
            strokeWidth="0.75"
          />
          <text
            x={LEFT_PAD - 6}
            y={yAt(tick) + 3}
            textAnchor="end"
            className="fill-[rgba(255,255,255,0.36)] text-[9px]"
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
            stroke={strokeLine}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </g>

      <text x={LEFT_PAD} y={bottomY + 16} className="fill-[rgba(255,255,255,0.36)] text-[9px]">
        {startLabel}
      </text>
      <text
        x={CHART_W - RIGHT_PAD}
        y={bottomY + 16}
        textAnchor="end"
        className="fill-[rgba(255,255,255,0.36)] text-[9px]"
      >
        {endLabel}
      </text>
    </svg>
  );

  return (
    <div className={shellClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-medium text-[rgba(255,255,255,0.58)]">
          Equity Curve
        </h4>
        <div className="flex gap-4 text-[10px]">
          <span className={legendStrategyClass}>
            <span
              className={`inline-block h-0.5 w-4 ${legendLineClass}`}
              aria-hidden
            />
            Strategy
          </span>
          <span className="flex items-center gap-1.5 text-[rgba(255,255,255,0.36)]">
            <span
              className="inline-block h-0 w-4 border-t border-dashed border-[rgba(255,255,255,0.36)]"
              aria-hidden
            />
            Buy & Hold
          </span>
        </div>
      </div>

      {theme.isV2 ? (
        <ScrollFade
          axis="x"
          fadeColor="var(--ds-copilot-v2-elevated)"
          className="mt-3 w-full"
        >
          {chartSvg}
        </ScrollFade>
      ) : (
        <div className="relative mt-3 w-full overflow-x-auto">{chartSvg}</div>
      )}
    </div>
  );
}
