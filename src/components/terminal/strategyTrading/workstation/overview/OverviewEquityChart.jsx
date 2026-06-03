import { useId } from "react";
import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import {
  COPILOT_V2_POSITIVE,
} from "../../strategyCopilotUi.js";
import {
  buildSeriesAreaPath,
  buildSmoothSeriesPath,
  buildYTicks,
  computeValueBounds,
  formatChartDate,
  formatEquityTick,
} from "./equityChartUtils.js";

const CHART_W = 1000;
const INNER_H = 132;
const TOP = 14;
const LEFT_PAD = 52;
const RIGHT_PAD = 16;
const BOTTOM_PAD = 30;
const STRATEGY_GREEN = COPILOT_V2_POSITIVE;
const BUY_HOLD_STROKE = "rgba(255, 255, 255, 0.32)";

export default function OverviewEquityChart({ bt, range }) {
  const theme = useCopilotTheme();
  const uid = useId().replace(/:/g, "");
  const fillGradId = `overview-eq-fill-${uid}`;
  const lineGradId = `overview-eq-line-${uid}`;
  const glowId = `overview-eq-glow-${uid}`;

  const strategyPts = bt?.equityCurve?.strategy ?? [];
  const buyHoldPts = bt?.equityCurve?.buyAndHold ?? [];
  const { vmin, vmax } = computeValueBounds(strategyPts, buyHoldPts);
  const chartH = TOP + INNER_H + BOTTOM_PAD;
  const bottomY = TOP + INNER_H;
  const plotW = CHART_W - LEFT_PAD - RIGHT_PAD;
  const yTicks = buildYTicks(vmin, vmax, 5);

  const strategyLine = buildSmoothSeriesPath(
    strategyPts,
    plotW,
    INNER_H,
    TOP,
    vmin,
    vmax,
    4,
  );
  const buyHoldLine = buildSmoothSeriesPath(
    buyHoldPts,
    plotW,
    INNER_H,
    TOP,
    vmin,
    vmax,
    4,
  );
  const strategyArea = buildSeriesAreaPath(
    strategyPts,
    plotW,
    INNER_H,
    TOP,
    vmin,
    vmax,
    bottomY,
    4,
    true,
  );

  const padX = 4;
  const lastStrategy = strategyPts[strategyPts.length - 1];
  const lastStrategyY =
    lastStrategy != null
      ? TOP + ((vmax - lastStrategy.value) / (vmax - vmin)) * INNER_H
      : null;
  const lastStrategyX =
    strategyPts.length > 1 ? plotW - padX : padX;

  const startLabel =
    formatChartDate(strategyPts[0]?.date) ||
    formatChartDate(range?.rangeStart) ||
    "";
  const endLabel =
    formatChartDate(strategyPts[strategyPts.length - 1]?.date) ||
    formatChartDate(range?.rangeEnd) ||
    "";

  const yAt = (v) => TOP + ((vmax - v) / (vmax - vmin)) * INNER_H;

  const strokeLine = theme.isV2 ? STRATEGY_GREEN : "#f2b500";
  const fillTop = theme.isV2 ? STRATEGY_GREEN : "#f2b500";

  const shellClass = theme.isV3
    ? "w-full border-b border-white/6 py-5"
    : theme.isV2
      ? "w-full rounded-xl border border-[#242424] bg-[#0f0f0f] p-4"
      : "w-full rounded-xl border border-[#2a2a2a] bg-[#141414] p-4";

  const axisLabelClass =
    theme.isV3
      ? "fill-[rgba(255,255,255,0.45)] text-[10px]"
      : "fill-[rgba(255,255,255,0.4)] text-[10px]";

  return (
    <div className={shellClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className={theme.overviewPanelTitle}>
          Equity Curve
        </h4>
        <div className="flex flex-wrap gap-3 text-[10px]">
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 ${
              theme.isV2 ? theme.textPositive : "text-[#f2b500]"
            }`}
          >
            <span
              className="inline-block h-0.5 w-5 rounded-full"
              style={{ background: strokeLine }}
              aria-hidden
            />
            Strategy
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 ${
              theme.isV3 ? theme.textMuted : "text-[rgba(255,255,255,0.45)]"
            }`}
          >
            <span
              className="inline-block h-0 w-5 border-t border-dashed border-current opacity-80"
              aria-hidden
            />
            Buy & Hold
          </span>
        </div>
      </div>

      <div className="relative mt-3 w-full min-w-0">
        <svg
          viewBox={`0 0 ${CHART_W} ${chartH}`}
          className="block h-[200px] w-full max-w-none"
          preserveAspectRatio="none"
          aria-label="Equity curve chart"
          role="img"
        >
          <defs>
            <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillTop} stopOpacity="0.28" />
              <stop offset="55%" stopColor={fillTop} stopOpacity="0.08" />
              <stop offset="100%" stopColor={fillTop} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={fillTop} stopOpacity="0.85" />
              <stop offset="100%" stopColor={fillTop} stopOpacity="1" />
            </linearGradient>
            <filter id={glowId} x="-8%" y="-8%" width="116%" height="116%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id={`${uid}-plot`}>
              <rect
                x={LEFT_PAD}
                y={TOP}
                width={plotW}
                height={INNER_H}
                rx="4"
              />
            </clipPath>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={LEFT_PAD}
                y1={yAt(tick)}
                x2={CHART_W - RIGHT_PAD}
                y2={yAt(tick)}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                strokeDasharray={tick === yTicks[0] || tick === yTicks[yTicks.length - 1] ? "0" : "4 6"}
              />
              <text
                x={LEFT_PAD - 8}
                y={yAt(tick) + 3.5}
                textAnchor="end"
                className={axisLabelClass}
              >
                {formatEquityTick(tick)}
              </text>
            </g>
          ))}

          <g clipPath={`url(#${uid}-plot)`} transform={`translate(${LEFT_PAD}, 0)`}>
            {strategyArea ? (
              <path d={strategyArea} fill={`url(#${fillGradId})`} />
            ) : null}
            {buyHoldLine ? (
              <path
                d={buyHoldLine}
                fill="none"
                stroke={BUY_HOLD_STROKE}
                strokeWidth="1.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
                opacity="0.9"
              />
            ) : null}
            {strategyLine ? (
              <path
                d={strategyLine}
                fill="none"
                stroke={`url(#${lineGradId})`}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
              />
            ) : null}
            {lastStrategyY != null ? (
              <g>
                <circle
                  cx={lastStrategyX}
                  cy={lastStrategyY}
                  r="5"
                  fill={strokeLine}
                  opacity="0.2"
                />
                <circle
                  cx={lastStrategyX}
                  cy={lastStrategyY}
                  r="2.75"
                  fill={strokeLine}
                  stroke="#0f0f0f"
                  strokeWidth="1.25"
                />
              </g>
            ) : null}
          </g>

          <line
            x1={LEFT_PAD}
            y1={bottomY}
            x2={CHART_W - RIGHT_PAD}
            y2={bottomY}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          <text x={LEFT_PAD} y={bottomY + 18} className={axisLabelClass}>
            {startLabel}
          </text>
          <text
            x={CHART_W - RIGHT_PAD}
            y={bottomY + 18}
            textAnchor="end"
            className={axisLabelClass}
          >
            {endLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
