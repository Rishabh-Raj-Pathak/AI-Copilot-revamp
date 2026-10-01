import { appIcons, appImages } from "../mobileAssets.js";
import {
  TRADE_MARKETS,
  buildCandles,
  getMarket,
} from "../../trade/tradeMockData.js";

/**
 * Phone trade helpers. Market data stays in `trade/tradeMockData.js` (the same
 * module the desktop terminal reads); this file only adds what the phone
 * screens show and the desktop does not — token art, picker categories and
 * 8h funding — plus the formatters the Figma copy needs.
 */

/** Token art already in the repo (Figma "Token / *" — white disc, cover fit). */
const TOKEN_ICONS = {
  BTC: appImages.tokenBtc,
  ETH: appImages.tokenEth,
  SOL: "/copilot-tokens/sol.png",
  SUI: "/copilot-tokens/sui.png",
};

/** @param {string | undefined} symbol */
export function tokenIconFor(symbol) {
  return TOKEN_ICONS[String(symbol ?? "").toUpperCase()] ?? null;
}

/** Figma "Pair Selector Sheet" → Categories (954:4911). */
export const MARKET_CATEGORIES = [
  { id: "all", label: "All Tokens" },
  { id: "bluechip", label: "Bluechip", icon: appIcons.chipBluechip },
  { id: "stocks", label: "Stocks (HIP-3)", icon: appIcons.chipStocks },
  { id: "trending", label: "Trending", icon: appIcons.chipTrending },
  { id: "commodities", label: "Commodities", icon: appIcons.chipCommodities },
];

/** Category tags and 8h funding per market — the trade mock carries neither. */
const MARKET_EXTRAS = {
  BTC: { categories: ["bluechip"], funding8h: 0.01 },
  ETH: { categories: ["bluechip"], funding8h: 0.01 },
  SOL: { categories: ["bluechip", "trending"], funding8h: 0.01 },
  SUI: { categories: ["trending"], funding8h: 0.01 },
};

/** Every trade market with the phone-only extras folded in. */
export const APP_MARKETS = TRADE_MARKETS.map((m) => ({
  ...m,
  iconSrc: tokenIconFor(m.coin),
  categories: MARKET_EXTRAS[m.coin]?.categories ?? [],
  funding8h: MARKET_EXTRAS[m.coin]?.funding8h ?? 0,
}));

/** The `market` prop `TradeTicketSheet` takes, built from a trade market. */
export function ticketMarketFor(coin) {
  const m = getMarket(coin);
  return {
    symbol: m.coin,
    pair: m.symbol,
    price: m.markPx,
    iconSrc: tokenIconFor(m.coin),
    maxLeverage: m.maxLeverage,
    pxDecimals: m.pxDecimals,
  };
}

/* ------------------------------------------------------------- numbers */

export const toNum = (v) => {
  const n = Number.parseFloat(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Price precision for a market the trade mock doesn't list (copilot ideas). */
export function decimalsForPrice(price) {
  const p = Math.abs(Number(price) || 0);
  if (p >= 10000) return 0;
  if (p >= 1000) return 1;
  if (p >= 10) return 2;
  if (p >= 1) return 3;
  return 5;
}

/** `84,344` — grouped, fixed precision. */
export function formatGrouped(n, decimals = 0) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** `84344.0` — the chart's ungrouped style (OHLC, price axis, volume). */
export function formatPlain(n, decimals = 0) {
  return Number(n || 0).toFixed(decimals);
}

/** `$84,344.00` */
export function formatUsd(n, decimals = 2) {
  const v = Number(n || 0);
  return `${v < 0 ? "-" : ""}$${formatGrouped(Math.abs(v), decimals)}`;
}

/* ------------------------------------------------------------- candles */

/**
 * The trade page's deterministic OHLCV series, for any symbol at any price.
 *
 * `buildCandles` already seeds the walk from the symbol, so an unlisted coin
 * still gets its own path; it just ends on the fallback market's mark. Scaling
 * by `price / lastClose` lands the series on the price the caller shows (a
 * copilot idea can quote a different mark than the trade mock).
 */
export function buildAppCandles(symbol, price, timeframe) {
  const listed = TRADE_MARKETS.some((m) => m.coin === symbol);
  const decimals = listed ? getMarket(symbol).pxDecimals : decimalsForPrice(price);
  const { candles, volumes } = buildCandles(symbol, timeframe);
  const last = candles[candles.length - 1]?.close || 1;
  const target = Number(price) > 0 ? Number(price) : last;
  const k = target / last;
  if (Math.abs(k - 1) < 1e-9) return { candles, volumes, decimals };

  const round = (n) => Number((n * k).toFixed(Math.max(decimals, 2)));
  const scaled = candles.map((c) => ({
    time: c.time,
    open: round(c.open),
    high: round(c.high),
    low: round(c.low),
    close: round(c.close),
  }));
  const tail = scaled[scaled.length - 1];
  tail.close = target;
  tail.high = Math.max(tail.high, target);
  tail.low = Math.min(tail.low, target);
  return { candles: scaled, volumes, decimals };
}
