import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import {
  COPILOT_V2_MINT,
  COPILOT_V2_NEGATIVE,
  COPILOT_V2_POSITIVE,
} from "../strategyCopilotUi.js";

/** Mock candlestick chart — minimal trading-terminal style. */

function parsePair(market, fallback = "BTC") {
  const raw = market?.split("·")[0]?.trim() ?? "";
  if (/USDT|USDC|PERP/i.test(raw)) return raw.replace(/-PERP/i, "").replace(/\s/g, "");
  const base = raw.replace(/-PERP/i, "").split(/[\s/]/)[0] || fallback;
  return `${base}USDT`;
}

/** Deterministic mock OHLC series from strategy id for visual variety. */
function buildCandles(seed = 1, count = 28) {
  const candles = [];
  let price = 50 + (seed % 7);
  for (let i = 0; i < count; i++) {
    const drift = Math.sin((i + seed) * 0.45) * 1.2 + (i > count * 0.6 ? 0.4 : -0.1);
    const o = price;
    const c = price + drift + (Math.cos(i * 0.7 + seed) > 0 ? 0.6 : -0.8);
    const h = Math.max(o, c) + 0.8 + (i % 5) * 0.15;
    const l = Math.min(o, c) - 0.9 - (i % 4) * 0.1;
    candles.push({ o, h, l, c });
    price = c;
  }
  return candles;
}

function buildVolumes(candles) {
  return candles.map((c, i) => 2 + Math.abs(c.c - c.o) * 3 + (i % 3));
}

export default function StrategyChartPanel({ strategy, embedded = false }) {
  const theme = useCopilotTheme();
  const setup = strategy?.setup;
  const pair = parsePair(strategy?.market, "BTC");
  const timeframe = strategy?.timeframe ?? "15m";
  const currentPrice = setup?.currentPrice ?? "$77,247";

  const seed = strategy?.id?.length ?? 3;
  const candles = buildCandles(seed, 28);
  const volumes = buildVolumes(candles);

  const plotMin = Math.min(...candles.map((c) => c.l)) - 1;
  const plotMax = Math.max(...candles.map((c) => c.h)) + 1;
  const range = plotMax - plotMin || 1;

  const w = 320;
  const priceAxisW = 36;
  const plotW = w - priceAxisW - 8;
  const h = 72;
  const volH = 10;
  const padT = 6;
  const padB = 4;
  const plotH = h - volH - padT - padB;
  const padL = 4;

  const y = (v) => padT + ((plotMax - v) / range) * plotH;
  const barW = plotW / candles.length;
  const bodyW = Math.max(barW * 0.55, 1.2);

  const entryVal = plotMin + range * 0.38;
  const slVal = plotMin + range * 0.22;
  const tpVal = plotMin + range * 0.78;
  const entryY = y(entryVal);
  const slY = y(slVal);
  const tpY = y(tpVal);

  const priceLow = 75800;
  const priceHigh = 78200;
  const priceAt = (v) =>
    Math.round(priceLow + ((plotMax - v) / range) * (priceHigh - priceLow));
  const axisTicks = 5;
  const tickValues = Array.from({ length: axisTicks }, (_, i) => {
    const v = plotMax - (range * i) / (axisTicks - 1);
    return priceAt(v);
  });
  const formatTick = (n) => `$${(n / 1000).toFixed(1)}k`;

  const entryZone = setup?.entryZone ?? "$76,850 – $77,100";
  const stopLoss = setup?.stopLoss ?? "$75,005";
  const takeProfit = setup?.takeProfit ?? "$83,082";

  const shellClass = embedded ? "" : `overflow-hidden ${theme.card}`;
  const isV2Chart = theme.isV2 || embedded;

  return (
    <div className={shellClass}>
      <div
        className={`flex items-center justify-between px-3 py-2.5 ${isV2Chart ? "border-b border-white/[0.04]" : "border-b border-[#242424] py-1.5"}`}
      >
        <div className="flex items-center gap-2 text-xs">
          <span
            className={
              theme.isV2
                ? "text-sm font-semibold text-[rgba(255,255,255,0.92)]"
                : "font-semibold text-white"
            }
          >
            {pair}
          </span>
          <span
            className={
              theme.isV2
                ? "text-[11px] text-[rgba(255,255,255,0.36)]"
                : "text-[#585858]"
            }
          >
            {timeframe}
          </span>
        </div>
        <span
          className={`tabular-nums ${
            theme.isV2
              ? "rounded-lg bg-[#19D98B]/10 px-2.5 py-1 text-xs font-semibold text-[#19D98B]"
              : "rounded-md bg-[#121212] px-2 py-0.5 text-[11px] font-medium text-[#00f3b6]"
          }`}
        >
          {currentPrice}
        </span>
      </div>

      <div
        className={
          isV2Chart
            ? "bg-[#101312] px-2 pt-2 pb-1"
            : "bg-[#070707] px-2 pt-2 pb-1"
        }
      >
        <div
          className={`relative w-full ${theme.isV2 ? "min-h-[12rem] sm:min-h-[14rem]" : "min-h-[10rem] sm:min-h-[11rem]"}`}
        >
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-label={`${pair} price chart`}
          >
            {Array.from({ length: 4 }, (_, i) => {
              const gy = padT + ((i + 1) / 5) * plotH;
              return (
                <line
                  key={`grid-${i}`}
                  x1={padL}
                  x2={padL + plotW}
                  y1={gy}
                  y2={gy}
                  stroke="#1a1a1a"
                  strokeWidth="0.5"
                />
              );
            })}

            {candles.map((c, i) => {
              const cx = padL + i * barW + barW / 2;
              const x = cx - bodyW / 2;
              const openY = y(c.o);
              const closeY = y(c.c);
              const highY = y(c.h);
              const lowY = y(c.l);
              const bullish = c.c >= c.o;
              const color = bullish
                ? theme.isV2
                  ? "#19D98B"
                  : "#00f3b6"
                : theme.isV2
                  ? "#EF4444"
                  : "#d53d3d";
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(Math.abs(closeY - openY), 0.6);
              return (
                <g key={i} opacity={bullish ? 0.82 : 0.75}>
                  <line
                    x1={cx}
                    x2={cx}
                    y1={highY}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="0.5"
                  />
                  <rect
                    x={x}
                    y={bodyTop}
                    width={bodyW}
                    height={bodyHeight}
                    fill={color}
                    rx="0.15"
                  />
                </g>
              );
            })}

            <line
              x1={padL}
              x2={padL + plotW}
              y1={entryY}
              y2={entryY}
              stroke={theme.isV2 ? COPILOT_V2_MINT : "#00f3b6"}
              strokeWidth="0.5"
              strokeDasharray="3 2"
              opacity="0.7"
            />
            <line
              x1={padL}
              x2={padL + plotW}
              y1={slY}
              y2={slY}
              stroke="#d53d3d"
              strokeWidth="0.5"
              strokeDasharray="3 2"
              opacity="0.7"
            />
            <line
              x1={padL}
              x2={padL + plotW}
              y1={tpY}
              y2={tpY}
              stroke="#269755"
              strokeWidth="0.5"
              strokeDasharray="3 2"
              opacity="0.7"
            />

            <circle
              cx={padL + barW * 8}
              cy={y(candles[8]?.l ?? entryVal)}
              r="1.5"
              fill={theme.isV2 ? COPILOT_V2_MINT : "#00f3b6"}
              opacity="0.9"
            />
            <circle
              cx={padL + barW * 22}
              cy={y(candles[22]?.h ?? tpVal)}
              r="1.5"
              fill={theme.isV2 ? COPILOT_V2_NEGATIVE : "#d53d3d"}
              opacity="0.9"
            />

            {[
              {
                y: entryY,
                label: "Entry",
                fill: theme.isV2 ? COPILOT_V2_MINT : "#00f3b6",
              },
              {
                y: slY,
                label: "SL",
                fill: theme.isV2 ? COPILOT_V2_NEGATIVE : "#d53d3d",
              },
              {
                y: tpY,
                label: "TP",
                fill: theme.isV2 ? COPILOT_V2_POSITIVE : "#269755",
              },
            ].map(({ y: ly, label, fill }) => (
              <g key={label}>
                <rect
                  x={padL + plotW + 2}
                  y={ly - 3}
                  width={priceAxisW - 4}
                  height="6"
                  fill="#0a0a0a"
                  opacity="0.85"
                />
                <text
                  x={padL + plotW + 4}
                  y={ly + 1}
                  fill={fill}
                  fontSize="5"
                  fontFamily="system-ui, sans-serif"
                >
                  {label}
                </text>
              </g>
            ))}

            {tickValues.map((tick, i) => {
              const ty = padT + (i / (axisTicks - 1)) * plotH;
              const label = formatTick(tick);
              return (
                <text
                  key={tick}
                  x={padL + plotW + 6}
                  y={ty + 2}
                  fill="#585858"
                  fontSize="5"
                  fontFamily="system-ui, sans-serif"
                  textAnchor="start"
                >
                  {label}
                </text>
              );
            })}

            {volumes.map((v, i) => {
              const x = padL + i * barW + barW * 0.2;
              const bw = barW * 0.6;
              const vh = (v / 10) * (volH - 1);
              const bullish = candles[i].c >= candles[i].o;
              return (
                <rect
                  key={`v-${i}`}
                  x={x}
                  y={h - vh}
                  width={bw}
                  height={vh}
                  fill={
                    bullish
                      ? theme.isV2
                        ? COPILOT_V2_POSITIVE
                        : "#00f3b6"
                      : theme.isV2
                        ? COPILOT_V2_NEGATIVE
                        : "#d53d3d"
                  }
                  opacity="0.12"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-[10px] ${
          theme.isV2 || embedded
            ? "border-t border-white/[0.04] bg-transparent"
            : "border-t border-[#242424]"
        }`}
      >
        <span>
          <span className={theme.isV2 ? theme.textMuted : "text-[#585858]"}>
            Entry{" "}
          </span>
          <span className={theme.isV2 ? theme.textMint : "text-[#00f3b6]"}>
            {entryZone}
          </span>
        </span>
        <span
          className={theme.isV2 ? "text-white/10" : "text-[#3a3a3a]"}
          aria-hidden
        >
          |
        </span>
        <span>
          <span className={theme.isV2 ? theme.textMuted : "text-[#585858]"}>
            SL{" "}
          </span>
          <span className={theme.isV2 ? theme.textNegative : "text-[#d53d3d]"}>
            {stopLoss}
          </span>
        </span>
        <span
          className={theme.isV2 ? "text-white/10" : "text-[#3a3a3a]"}
          aria-hidden
        >
          |
        </span>
        <span>
          <span className={theme.isV2 ? theme.textMuted : "text-[#585858]"}>
            TP{" "}
          </span>
          <span
            className={theme.isV2 ? theme.textPositive : "text-[#269755]"}
          >
            {takeProfit}
          </span>
        </span>
      </div>
    </div>
  );
}
