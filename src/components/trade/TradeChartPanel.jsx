import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import { ChevronDown, Crosshair } from "lucide-react";
import {
  DEFAULT_TIMEFRAME,
  TIMEFRAMES,
  buildCandles,
  getMarket,
} from "./tradeMockData.js";

const UP = "#00d492";
const DOWN = "#e5484d";

function TimeframeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      const el = ref.current;
      if (el && !el.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-white transition-colors hover:bg-white/5"
      >
        {value}
        <ChevronDown
          className={`size-3.5 text-[#bfbfbf] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Timeframe"
          className="absolute top-[calc(100%+4px)] left-0 z-40 w-24 overflow-hidden rounded-lg border border-[#242424] bg-black py-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]"
        >
          {TIMEFRAMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={t.id === value}
              onClick={() => {
                onChange(t.id);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm ${
                t.id === value
                  ? "bg-[#3e2e00] font-semibold text-[#f2b500]"
                  : "text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** `O 62768 H 62794 L 62708 C 62762 -6 (-0.01%)` — tracks the crosshair. */
function OhlcLegend({ bar, decimals }) {
  if (!bar) return null;
  const fmt = (n) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  const delta = bar.close - bar.open;
  const pct = bar.open ? (delta / bar.open) * 100 : 0;
  const tone = delta >= 0 ? "text-[#00d492]" : "text-[#e5484d]";

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums sm:text-[13px]">
      <span className="text-[#787878]">
        O <span className={tone}>{fmt(bar.open)}</span>
      </span>
      <span className="text-[#787878]">
        H <span className={tone}>{fmt(bar.high)}</span>
      </span>
      <span className="text-[#787878]">
        L <span className={tone}>{fmt(bar.low)}</span>
      </span>
      <span className="text-[#787878]">
        C <span className={tone}>{fmt(bar.close)}</span>
      </span>
      <span className={tone}>
        {delta >= 0 ? "" : "-"}
        {fmt(Math.abs(delta))} ({pct >= 0 ? "+" : ""}
        {pct.toFixed(2)}%)
      </span>
    </div>
  );
}

export default function TradeChartPanel({ coin }) {
  const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME);
  const [hoverBar, setHoverBar] = useState(null);
  const [hoverVolume, setHoverVolume] = useState(null);

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const market = getMarket(coin);
  const { candles, volumes } = useMemo(
    () => buildCandles(coin, timeframe),
    [coin, timeframe],
  );

  const lastBar = candles[candles.length - 1];
  const lastVolume = volumes[volumes.length - 1]?.value ?? 0;

  // Create the chart once; series data is pushed by the effect below.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#787878",
        fontFamily: "inherit",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#161616" },
        horzLines: { color: "#161616" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#4a4a4a", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#242424" },
        horzLine: { color: "#4a4a4a", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#242424" },
      },
      rightPriceScale: {
        borderColor: "#242424",
        scaleMargins: { top: 0.08, bottom: 0.24 },
      },
      timeScale: {
        borderColor: "#242424",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineVisible: true,
      priceLineStyle: LineStyle.Dashed,
      priceLineColor: "#787878",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "trade-volume",
      priceLineVisible: false,
      lastValueVisible: false,
    });
    chart
      .priceScale("trade-volume")
      .applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    chart.subscribeCrosshairMove((param) => {
      const bar = param.seriesData?.get(candleSeries);
      const vol = param.seriesData?.get(volumeSeries);
      setHoverBar(bar ?? null);
      setHoverVolume(typeof vol?.value === "number" ? vol.value : null);
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Feed data whenever coin / timeframe changes.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    candleSeriesRef.current.applyOptions({
      priceFormat: {
        type: "price",
        precision: market.pxDecimals,
        minMove: 1 / 10 ** market.pxDecimals,
      },
    });
    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volumes);
    chart.timeScale().fitContent();
    setHoverBar(null);
    setHoverVolume(null);
  }, [candles, volumes, market.pxDecimals]);

  const shownBar = hoverBar ?? lastBar;
  const shownVolume = hoverVolume ?? lastVolume;

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col border-y border-[#242424] bg-black"
      aria-label={`${market.symbol} price chart`}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
        <TimeframeSelect value={timeframe} onChange={setTimeframe} />
        <OhlcLegend bar={shownBar} decimals={market.pxDecimals} />
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="absolute inset-0" />

        <span className="pointer-events-none absolute bottom-[22%] left-3 z-10 text-xs tabular-nums text-[#787878]">
          Volume{" "}
          <span className="text-[#00d492]">
            {shownVolume.toLocaleString("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}
          </span>
        </span>

        <button
          type="button"
          onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
          className="absolute right-[68px] bottom-1 z-10 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#787878] transition-colors hover:bg-white/5 hover:text-white"
        >
          <Crosshair className="size-3" aria-hidden />
          auto
        </button>
      </div>
    </section>
  );
}
