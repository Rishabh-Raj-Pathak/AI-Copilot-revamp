import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { DEFAULT_TIMEFRAME, TIMEFRAMES } from "../../trade/tradeMockData.js";
import { buildAppCandles, formatPlain } from "./tradeData.js";

/* Figma "Chart / Candles — BTC 15m" (949:3717) palette. */
const UP = "#269755";
const DOWN = "#d53d3d";
const UP_VOLUME = "rgba(38,151,85,0.35)";
const DOWN_VOLUME = "rgba(213,61,61,0.35)";
const PRICE_LINE = "rgba(38,151,85,0.6)";

/**
 * Per-surface geometry. The Trade page card (954:4571) is taller and carries
 * the change inline with OHLC; the ticket card (947:3362) is shorter, puts the
 * change on its own line and shows one more decimal.
 */
const VARIANTS = {
  page: { chartH: 400, volumeTop: 246, extraDecimals: 0, card: "p-3" },
  ticket: { chartH: 280, volumeTop: 127, extraDecimals: 1, card: "px-2.5 pt-[11px] pb-2.5" },
};

/** Bars on screen at rest — Figma draws ~48; older history pans in from the left. */
const BAR_SPACING = 6.2;

function TimeframeSheet({ open, onClose, value, onChange }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Timeframe">
      <ul className="flex flex-col gap-1 px-4 pt-2" role="listbox" aria-label="Timeframe">
        {TIMEFRAMES.map((t) => {
          const active = t.id === value;
          return (
            <li key={t.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(t.id);
                  onClose();
                }}
                className={`flex h-12 w-full items-center justify-between rounded-xl px-3 text-app-body font-medium leading-5 transition-colors active:bg-white/[0.05] ${
                  active ? "bg-app-accent-faint text-app-accent" : "text-ink"
                }`}
              >
                {t.label}
                {active ? <AppIcon src={appIcons.check12} size={12} /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}

/**
 * Phone candle chart card — the same deterministic OHLCV source and
 * lightweight-charts engine as the desktop `TradeChartPanel`, drawn to the
 * Figma card: timeframe picker (a sheet, not a dropdown), OHLC legend that
 * follows the crosshair, volume legend and a reset control.
 *
 * Touch: horizontal drags pan the chart, vertical drags scroll the page.
 */
export default function AppChartCard({ symbol, price, variant = "page", className = "" }) {
  const v = VARIANTS[variant] ?? VARIANTS.page;
  const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hoverBar, setHoverBar] = useState(null);
  const [hoverVolume, setHoverVolume] = useState(null);

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);

  const { candles, volumes, decimals } = useMemo(
    () => buildAppCandles(symbol, price, timeframe),
    [symbol, price, timeframe],
  );
  const shownDecimals = Math.max(decimals, v.extraDecimals);

  const lastBar = candles[candles.length - 1];
  const lastVolume = volumes[volumes.length - 1]?.value ?? 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#bfbfbf",
        fontSize: 10,
        fontFamily: "inherit",
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#4a4a4a", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#242424" },
        horzLine: { color: "#4a4a4a", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#242424" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.06, bottom: 0.18 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        barSpacing: BAR_SPACING,
        rightOffset: 2,
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: false, axisDoubleClickReset: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineVisible: true,
      priceLineStyle: LineStyle.Solid,
      priceLineWidth: 1,
      priceLineColor: PRICE_LINE,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "app-volume",
      priceLineVisible: false,
      lastValueVisible: false,
    });
    chart.priceScale("app-volume").applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    chart.subscribeCrosshairMove((param) => {
      const bar = param.seriesData?.get(candleSeries);
      const vol = param.seriesData?.get(volumeSeries);
      setHoverBar(bar ?? null);
      setHoverVolume(typeof vol?.value === "number" ? vol.value : null);
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;
    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !candleRef.current || !volumeRef.current) return;
    const tail = candles[candles.length - 1];
    candleRef.current.applyOptions({
      priceFormat: { type: "price", precision: decimals, minMove: 1 / 10 ** decimals },
      priceLineColor: tail && tail.close < tail.open ? "rgba(213,61,61,0.6)" : PRICE_LINE,
    });
    candleRef.current.setData(candles);
    volumeRef.current.setData(
      volumes.map((vol, i) => ({
        time: vol.time,
        value: vol.value,
        color: candles[i] && candles[i].close < candles[i].open ? DOWN_VOLUME : UP_VOLUME,
      })),
    );
    chart.timeScale().applyOptions({ barSpacing: BAR_SPACING });
    chart.timeScale().scrollToRealTime();
    setHoverBar(null);
    setHoverVolume(null);
  }, [candles, volumes, decimals]);

  const resetView = () => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.priceScale("right").applyOptions({ autoScale: true });
    chart.timeScale().applyOptions({ barSpacing: BAR_SPACING });
    chart.timeScale().scrollToRealTime();
  };

  const bar = hoverBar ?? lastBar;
  const volume = hoverVolume ?? lastVolume;
  const delta = bar ? bar.close - bar.open : 0;
  const pct = bar?.open ? (delta / bar.open) * 100 : 0;
  const tone = delta >= 0 ? "text-app-positive" : "text-app-negative";
  const fmt = (n) => formatPlain(n, shownDecimals);
  const sign = delta >= 0 ? "+" : "-";
  const tfLabel = TIMEFRAMES.find((t) => t.id === timeframe)?.label ?? timeframe;

  return (
    <section
      aria-label={`${symbol} price chart`}
      className={`flex w-full flex-col items-start gap-1.5 overflow-hidden rounded-xl border border-app-line-accent-subtle ${v.card} ${className}`}
    >
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Timeframe ${tfLabel}. Change timeframe`}
        className="app-pressable flex items-center gap-2.5 rounded-[10px] px-4 py-3 text-app-body leading-[16.8px] text-ink active:bg-white/[0.05]"
      >
        {tfLabel}
        <AppIcon src={appIcons.caretDown16} size={16} />
      </button>

      {bar ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 whitespace-nowrap text-app-caption leading-[15px]">
          <span className="text-ink-muted">O</span>
          <span className={tone}>{fmt(bar.open)}</span>
          <span className="text-ink-muted">H</span>
          <span className={tone}>{fmt(bar.high)}</span>
          <span className="text-ink-muted">L</span>
          <span className={tone}>{fmt(bar.low)}</span>
          <span className="text-ink-muted">C</span>
          <span className={tone}>{fmt(bar.close)}</span>
          {variant === "page" ? (
            <span className={tone}>
              {fmt(Math.abs(delta))} ( {sign} {Math.abs(pct).toFixed(2)} %)
            </span>
          ) : null}
        </div>
      ) : null}
      {bar && variant !== "page" ? (
        <p className={`whitespace-nowrap text-app-caption leading-[15px] ${tone}`}>
          {sign}
          {fmt(Math.abs(delta))} ({sign}
          {Math.abs(pct).toFixed(2)}%)
        </p>
      ) : null}

      <div className="relative w-full shrink-0 bg-app-bg" style={{ height: v.chartH }}>
        <div ref={containerRef} className="absolute inset-0" />

        <p
          className="pointer-events-none absolute left-0 z-10 flex items-center gap-2 px-2 py-1.5 text-app-caption leading-[15px]"
          style={{ top: v.volumeTop }}
        >
          <span className="text-ink-muted">Volume</span>
          <span className={tone}>{formatPlain(volume, 1)}</span>
        </p>

        <button
          type="button"
          onClick={resetView}
          aria-label="Reset chart view"
          className="absolute bottom-4 right-0.5 z-10 flex h-[22px] w-[30px] items-center justify-center rounded text-ink after:absolute after:-inset-[11px] after:content-[''] active:bg-white/[0.08]"
        >
          <AppIcon src={appIcons.indicators14} size={14} />
        </button>
      </div>

      <TimeframeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={timeframe}
        onChange={setTimeframe}
      />
    </section>
  );
}
