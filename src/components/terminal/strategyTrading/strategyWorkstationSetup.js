import { MARKET_OPTIONS } from "./strategyTradingMockData.js";

export const WORKSTATION_TIMEFRAMES = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1D",
];

export const WORKSTATION_LEVERAGE_OPTIONS = [
  "1x",
  "2x",
  "3x",
  "5x",
  "10x",
  "15x",
  "20x",
  "25x",
];

const MARKET_SYMBOLS = {
  btc: "BTCUSDT",
  eth: "ETHUSDT",
  sol: "SOLUSDT",
  hype: "HYPEUSDT",
  custom: "CUSTOM",
};

function toIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultRangeDates() {
  const end = new Date(2026, 4, 21);
  const start = new Date(2026, 2, 22);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export function resolveMarketId(strategy) {
  if (strategy?.marketId && MARKET_OPTIONS.some((m) => m.id === strategy.marketId)) {
    return strategy.marketId;
  }
  const raw = (
    strategy?.setup?.market ??
    strategy?.market ??
    ""
  ).toUpperCase();
  if (raw.includes("ETH")) return "eth";
  if (raw.includes("SOL")) return "sol";
  if (raw.includes("HYPE")) return "hype";
  if (raw.includes("BTC")) return "btc";
  return "btc";
}

export function marketSymbolFromId(marketId) {
  return MARKET_SYMBOLS[marketId] ?? MARKET_SYMBOLS.btc;
}

export function formatMarketLabel(marketId, timeframe) {
  const sym = marketSymbolFromId(marketId);
  return `${sym} · ${timeframe}`;
}

/** DD-MM-YYYY for workstation range chips (v2 mockup). */
export function formatRangeShort(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

export function formatDateRangeDisplay(start, end) {
  if (!start || !end) return "Mar 22 – May 21, 2026";
  const fmt = (iso) => {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export function resolveRangeDates(setup) {
  if (setup?.rangeStart && setup?.rangeEnd) {
    return { start: setup.rangeStart, end: setup.rangeEnd };
  }
  return defaultRangeDates();
}

export function parseLeverageValue(value) {
  if (value == null || value === "") return 3;
  const n = parseInt(String(value).replace(/x$/i, "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 125) : 3;
}

export function formatLeverageValue(n) {
  return `${parseLeverageValue(n)}x`;
}

function refreshMarketFlowStep(flowSteps, market, timeframe) {
  if (!flowSteps?.length) return flowSteps;
  const tail = flowSteps[0]?.detail?.includes("—")
    ? flowSteps[0].detail.split("—").slice(1).join("—").trim()
    : "strategy setup";
  return flowSteps.map((step, i) =>
    i === 0 ? { ...step, detail: `${market} ${timeframe} — ${tail}` } : step,
  );
}

export function applyWorkstationSetupChange(strategy, patch) {
  const setup = { ...(strategy.setup ?? {}) };
  let marketId = resolveMarketId(strategy);
  let timeframe = setup.timeframe ?? strategy.timeframe ?? "15m";
  let market = strategy.market ?? formatMarketLabel(marketId, timeframe);
  const config = { ...(strategy.config ?? {}) };

  if (patch.marketId !== undefined) {
    marketId = patch.marketId;
    setup.market = marketSymbolFromId(marketId);
    market = formatMarketLabel(marketId, timeframe);
  }

  if (patch.timeframe !== undefined) {
    timeframe = patch.timeframe;
    setup.timeframe = patch.timeframe;
    market = formatMarketLabel(marketId, timeframe);
  }

  if (patch.rangeStart !== undefined || patch.rangeEnd !== undefined) {
    const current = resolveRangeDates(setup);
    setup.rangeStart = patch.rangeStart ?? current.start;
    setup.rangeEnd = patch.rangeEnd ?? current.end;
    setup.dateRange = formatDateRangeDisplay(setup.rangeStart, setup.rangeEnd);
  }

  if (patch.leverage !== undefined) {
    const lev = formatLeverageValue(patch.leverage);
    setup.leverage = lev;
    config.leverage = lev;
  }

  setup.flowSteps = refreshMarketFlowStep(
    setup.flowSteps,
    setup.market,
    timeframe,
  );

  return {
    ...strategy,
    marketId,
    market,
    timeframe,
    setup,
    config,
  };
}
