import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
} from 'lightweight-charts'

const UP = '#00d492'
const DOWN = '#e5484d'

const CANDLE_COUNT = 120
const STEP_SECONDS = 900 // 15m buckets, same default as the Trade chart

/** mulberry32 — deterministic PRNG so a setup's chart is stable across renders. */
function mulberry32(seed) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Copilot setups price anything from $86k to $0.11 — pick decimals per magnitude. */
function decimalsFor(price) {
  if (price >= 1000) return 1
  if (price >= 100) return 2
  if (price >= 1) return 3
  if (price >= 0.01) return 5
  return 6
}

/**
 * Deterministic OHLCV series ending exactly on the setup's quoted price.
 * Mirrors `buildCandles` in the Trade page's mock data; kept local so the
 * copilot feed does not depend on the Trade market list (setups quote symbols
 * — ARB, WLD, HYPE — that have no entry there).
 */
function buildSetupCandles(symbol, price, direction) {
  const rand = mulberry32(hashString(`${symbol}:${price}`))
  const anchor = Math.floor(Date.now() / 1000 / STEP_SECONDS) * STEP_SECONDS
  const start = anchor - (CANDLE_COUNT - 1) * STEP_SECONDS

  /* The setup's own bias shows in the path: a short reads as stretched into the
     entry, a long as basing under it. */
  const bias = direction === 'short' ? 1 : -1
  const vol = 0.0052
  const raw = []
  let walk = 1
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const drift = (Math.sin(i / 12) * 0.5 + (i / CANDLE_COUNT) * bias * 0.6) * vol
    const open = walk
    const close = open * (1 + drift + (rand() - 0.5) * vol * 2)
    const wick = vol * (0.4 + rand() * 0.9)
    const high = Math.max(open, close) * (1 + wick * rand())
    const low = Math.min(open, close) * (1 - wick * rand())
    raw.push({ open, high, low, close })
    walk = close
  }

  const decimals = decimalsFor(price)
  const scale = price / raw[raw.length - 1].close
  const round = (n) => Number((n * scale).toFixed(decimals))

  const candles = raw.map((c, i) => ({
    time: start + i * STEP_SECONDS,
    open: round(c.open),
    high: round(c.high),
    low: round(c.low),
    close: round(c.close),
  }))

  const last = candles[candles.length - 1]
  last.close = price
  last.high = Math.max(last.high, price)
  last.low = Math.min(last.low, price)

  const volRand = mulberry32(hashString(`${symbol}:${price}:vol`))
  const volumes = candles.map((c) => {
    const body = Math.abs(c.close - c.open) / (c.open || 1)
    return {
      time: c.time,
      value: Number(((0.4 + volRand() + body * 60) * 25).toFixed(3)),
      color: c.close >= c.open ? 'rgba(0,212,146,0.45)' : 'rgba(229,72,77,0.45)',
    }
  })

  return { candles, volumes, decimals }
}

/**
 * Live candlestick chart for an expanded setup — same engine, palette and
 * volume overlay as the Trade page chart (`TradeChartPanel`), sized for the
 * card. Mounted after `delayMs` once `active` so it does not initialise on the
 * same frame as the expand click.
 */
export default function SuggestionPriceChart({ setup, active, delayMs = 3 }) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)

  const symbol = setup?.symbol ?? ''
  const price = Number(setup?.price) || 0
  const direction = setup?.direction

  const { candles, volumes, decimals } = useMemo(
    () => buildSetupCandles(symbol, price, direction),
    [symbol, price, direction],
  )

  useEffect(() => {
    if (!active) {
      setMounted(false)
      return undefined
    }
    const id = window.setTimeout(() => setMounted(true), delayMs)
    return () => {
      window.clearTimeout(id)
      setMounted(false)
    }
  }, [active, delayMs])

  useEffect(() => {
    const el = containerRef.current
    if (!mounted || !el) return undefined

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#787878',
        fontFamily: 'inherit',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: '#141414' },
        horzLines: { color: '#141414' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#4a4a4a',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#242424',
        },
        horzLine: {
          color: '#4a4a4a',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#242424',
        },
      },
      rightPriceScale: {
        borderColor: '#1f1f1f',
        scaleMargins: { top: 0.1, bottom: 0.26 },
      },
      timeScale: {
        borderColor: '#1f1f1f',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 2,
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: false },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineVisible: true,
      priceLineStyle: LineStyle.Dashed,
      priceLineColor: '#787878',
      priceFormat: {
        type: 'price',
        precision: decimals,
        minMove: 1 / 10 ** decimals,
      },
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'copilot-volume',
      priceLineVisible: false,
      lastValueVisible: false,
    })
    chart
      .priceScale('copilot-volume')
      .applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } })

    candleSeries.setData(candles)
    volumeSeries.setData(volumes)
    chart.timeScale().fitContent()

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    return () => {
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [mounted, candles, volumes, decimals])

  if (!active) return null

  return (
    /* Swallows the click so panning the chart never toggles the card's
       selection — the card itself is the button. */
    <div
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="mt-3 flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-[#1f1f1f] bg-[#080808] p-2"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-0.5 pb-1.5">
        <span className="ds-eyebrow text-ink-subtle">
          {symbol} · 15m
        </span>
        <span className="text-micro text-ink-muted">
          Last{' '}
          <span className="text-ink">
            {price.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </span>
        </span>
      </div>
      {/* No fixed height: fixed values were either too short to carry 120
          candles plus the volume overlay (168px collapsed the bodies to a
          band) or too tall for a laptop. The card is one screen of feed, so
          the chart just takes the rest of it — down to the activity dock. The
          floor is the old size, for a viewport too short to give it away. */}
      <div className="min-h-56 w-full flex-1 overflow-hidden rounded-md border border-[#1a1a1a]">
        {mounted ? (
          <div ref={containerRef} className="size-full" />
        ) : (
          <div className="size-full bg-[#0d0d0d]" aria-hidden />
        )}
      </div>
    </div>
  )
}
