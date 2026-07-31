/**
 * Trade page mock data. Shaped like Hyperliquid `/info` payloads so the whole
 * module can be swapped for a real client without touching the components.
 */

export const TIMEFRAMES = [
  { id: "1m", label: "1m", seconds: 60 },
  { id: "5m", label: "5m", seconds: 300 },
  { id: "15m", label: "15m", seconds: 900 },
  { id: "1h", label: "1h", seconds: 3600 },
  { id: "4h", label: "4h", seconds: 14400 },
  { id: "1d", label: "1d", seconds: 86400 },
];

export const DEFAULT_TIMEFRAME = "15m";

/** Letter-avatar tints — mirrors `COIN_AVATAR` in `vaults/VaultsPositionsHistoryTable.jsx`. */
export const COIN_TINT = {
  BTC: "bg-[#f7931a]/25 text-[#ffb347]",
  ETH: "bg-[#627eea]/20 text-[#a5b4fc]",
  SOL: "bg-[#9945ff]/20 text-[#c4a5ff]",
  SUI: "bg-[#4da2ff]/20 text-[#9fcbff]",
};

export const TRADE_MARKETS = [
  {
    coin: "BTC",
    symbol: "BTC-USDC",
    markPx: 62753,
    oraclePx: 62767,
    change24hAbs: 430,
    change24hPct: 0.69,
    volume24h: "$1.77B",
    openInterest: "$2.37B",
    maxLeverage: 40,
    pxDecimals: 0,
    szDecimals: 5,
    szUnit: "BTC",
  },
  {
    coin: "ETH",
    symbol: "ETH-USDC",
    markPx: 2456.8,
    oraclePx: 2457.1,
    change24hAbs: 18.4,
    change24hPct: 0.75,
    volume24h: "$940.2M",
    openInterest: "$1.12B",
    maxLeverage: 25,
    pxDecimals: 1,
    szDecimals: 4,
    szUnit: "ETH",
  },
  {
    coin: "SOL",
    symbol: "SOL-USDC",
    markPx: 142.36,
    oraclePx: 142.41,
    change24hAbs: -1.28,
    change24hPct: -0.89,
    volume24h: "$410.6M",
    openInterest: "$386.4M",
    maxLeverage: 20,
    pxDecimals: 2,
    szDecimals: 2,
    szUnit: "SOL",
  },
  {
    coin: "SUI",
    symbol: "SUI-USDC",
    markPx: 3.184,
    oraclePx: 3.186,
    change24hAbs: 0.041,
    change24hPct: 1.3,
    volume24h: "$88.1M",
    openInterest: "$74.9M",
    maxLeverage: 10,
    pxDecimals: 3,
    szDecimals: 1,
    szUnit: "SUI",
  },
];

export const DEFAULT_COIN = "BTC";

export function getMarket(coin) {
  return TRADE_MARKETS.find((m) => m.coin === coin) ?? TRADE_MARKETS[0];
}

/** Available collateral shown in the order panel's balance card. */
export const AVAILABLE_BALANCE = 0.7727;

/* ---------------------------------------------------------------- candles */

/** mulberry32 — small deterministic PRNG so the chart is identical per reload. */
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic OHLCV series ending at the market's mark price.
 *
 * The time anchor is the current interval bucket, so the chart reads as "live"
 * while the price path itself stays stable across reloads within that bucket.
 *
 * @returns {{candles: Array<{time:number,open:number,high:number,low:number,close:number}>, volumes: Array<{time:number,value:number,color:string}>}}
 */
export function buildCandles(coin, timeframeId, count = 220) {
  const market = getMarket(coin);
  const tf =
    TIMEFRAMES.find((t) => t.id === timeframeId) ??
    TIMEFRAMES.find((t) => t.id === DEFAULT_TIMEFRAME);
  const step = tf.seconds;

  const rand = mulberry32(hashString(`${coin}:${tf.id}`));
  const anchor = Math.floor(Date.now() / 1000 / step) * step;
  const start = anchor - (count - 1) * step;

  // Random walk in "relative" space, then rescaled so the last close == markPx.
  const vol = 0.0042 * Math.sqrt(step / 900);
  const raw = [];
  let price = 1;
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 14) * vol * 0.5;
    const open = price;
    const close = open * (1 + drift + (rand() - 0.5) * vol * 2);
    const wick = vol * (0.4 + rand() * 0.9);
    const high = Math.max(open, close) * (1 + wick * rand());
    const low = Math.min(open, close) * (1 - wick * rand());
    raw.push({ open, high, low, close });
    price = close;
  }

  const scale = market.markPx / raw[raw.length - 1].close;
  const round = (n) =>
    Number(n.toFixed(Math.max(market.pxDecimals, market.markPx > 100 ? 0 : 4)));

  const candles = raw.map((c, i) => ({
    time: start + i * step,
    open: round(c.open * scale),
    high: round(c.high * scale),
    low: round(c.low * scale),
    close: round(c.close * scale),
  }));

  // Force the final close to land exactly on the mark price.
  const last = candles[candles.length - 1];
  last.close = market.markPx;
  last.high = Math.max(last.high, market.markPx);
  last.low = Math.min(last.low, market.markPx);

  const volRand = mulberry32(hashString(`${coin}:${tf.id}:vol`));
  const volumes = candles.map((c) => {
    const body = Math.abs(c.close - c.open) / (c.open || 1);
    const value = Number(((0.4 + volRand() + body * 60) * 25).toFixed(3));
    return {
      time: c.time,
      value,
      color: c.close >= c.open ? "rgba(0,212,146,0.45)" : "rgba(229,72,77,0.45)",
    };
  });

  return { candles, volumes };
}

/* ----------------------------------------------------------------- tables */

export const positionsMock = [
  {
    id: "pos-btc",
    coin: "BTC",
    leverage: "33x",
    direction: "long",
    size: "0.00018 BTC",
    positionValue: "11.29 USDC",
    entryPrice: "$62,654",
    currentPrice: "$62,753",
    pnl: "$0.018",
    roe: "5.09%",
    pnlPositive: true,
    liqPrice: "$61,580.4444",
    margin: "$0.34 (isolated)",
    funding: "-$0.000",
    tp: "$63,055",
    sl: "$62,210",
    expProfit: "$0.072(21.12%)",
    expLoss: "-$0.079(23.18%)",
  },
];

export const openOrdersMock = [
  {
    id: "ord-1",
    time: "2026/07/09 - 11:42:08",
    type: "Take Profit Market",
    coin: "BTC",
    direction: "short",
    size: "0.00018 BTC",
    originalSize: "0.00018 BTC",
    orderValue: "11.35 USDC",
    price: "Market",
    reduceOnly: "Yes",
    triggerConditions: "Mark ≥ $63,055",
    tpsl: "TP",
  },
  {
    id: "ord-2",
    time: "2026/07/09 - 11:42:08",
    type: "Stop Market",
    coin: "BTC",
    direction: "short",
    size: "0.00018 BTC",
    originalSize: "0.00018 BTC",
    orderValue: "11.19 USDC",
    price: "Market",
    reduceOnly: "Yes",
    triggerConditions: "Mark ≤ $62,210",
    tpsl: "SL",
  },
];

export const orderHistoryMock = [
  {
    id: "oh-1",
    time: "2026/07/09 - 11:42:08",
    type: "Market",
    coin: "BTC",
    direction: "long",
    size: "0.00018 BTC",
    filledSize: "0.00018 BTC",
    orderValue: "11.28 USDC",
    price: "$62,654",
    reduceOnly: "No",
    triggerConditions: "—",
    status: "Filled",
    orderId: "0x9a41…c7d2",
  },
  {
    id: "oh-2",
    time: "2026/07/09 - 09:14:51",
    type: "Limit",
    coin: "ETH",
    direction: "short",
    size: "0.0420 ETH",
    filledSize: "0.0000 ETH",
    orderValue: "103.18 USDC",
    price: "$2,457",
    reduceOnly: "No",
    triggerConditions: "—",
    status: "Canceled",
    orderId: "0x51be…10af",
  },
  {
    id: "oh-3",
    time: "2026/07/08 - 22:03:12",
    type: "Stop Market",
    coin: "SOL",
    direction: "short",
    size: "1.24 SOL",
    filledSize: "1.24 SOL",
    orderValue: "176.52 USDC",
    price: "Market",
    reduceOnly: "Yes",
    triggerConditions: "Mark ≤ $141.10",
    status: "Filled",
    orderId: "0x7c30…88e1",
  },
  {
    id: "oh-4",
    time: "2026/07/08 - 17:35:44",
    type: "Limit",
    coin: "BTC",
    direction: "long",
    size: "0.00031 BTC",
    filledSize: "0.00031 BTC",
    orderValue: "19.34 USDC",
    price: "$62,390",
    reduceOnly: "No",
    triggerConditions: "—",
    status: "Filled",
    orderId: "0x2ff8…4b6c",
  },
  {
    id: "oh-5",
    time: "2026/07/08 - 12:08:29",
    type: "Take Profit Market",
    coin: "SUI",
    direction: "short",
    size: "310.0 SUI",
    filledSize: "0.0 SUI",
    orderValue: "987.04 USDC",
    price: "Market",
    reduceOnly: "Yes",
    triggerConditions: "Mark ≥ $3.24",
    status: "Canceled",
    orderId: "0xbd19…5a70",
  },
];

export const tradeHistoryMock = [
  {
    id: "th-1",
    time: "2026/07/09 - 11:42:08",
    coin: "BTC",
    direction: "long",
    price: "$62,654",
    size: "0.00018 BTC",
    tradeValue: "11.28 USDC",
    fee: "$0.0051",
    closedPnl: "$0.000",
    pnlPositive: true,
  },
  {
    id: "th-2",
    time: "2026/07/08 - 22:03:12",
    coin: "SOL",
    direction: "short",
    price: "$141.09",
    size: "1.24 SOL",
    tradeValue: "174.95 USDC",
    fee: "$0.0787",
    closedPnl: "-$1.94",
    pnlPositive: false,
  },
  {
    id: "th-3",
    time: "2026/07/08 - 17:35:44",
    coin: "BTC",
    direction: "long",
    price: "$62,390",
    size: "0.00031 BTC",
    tradeValue: "19.34 USDC",
    fee: "$0.0087",
    closedPnl: "$0.81",
    pnlPositive: true,
  },
  {
    id: "th-4",
    time: "2026/07/07 - 08:51:02",
    coin: "ETH",
    direction: "long",
    price: "$2,438.20",
    size: "0.0420 ETH",
    tradeValue: "102.40 USDC",
    fee: "$0.0461",
    closedPnl: "$0.78",
    pnlPositive: true,
  },
];

export const balanceMock = [
  {
    id: "bal-usdc",
    coin: "USDC",
    totalBalance: "1.1127",
    availableBalance: "0.7727",
    usdcValue: "$1.11",
    pnl: "$0.018",
    roe: "5.09%",
    pnlPositive: true,
    contract: "Perps",
  },
];

/**
 * Badge counts. Positions/Open Orders/Balance are exactly the rows we render;
 * the history tabs are paginated server-side in production, so their badge is
 * the total rather than the length of this page.
 */
export const TAB_COUNTS = {
  positions: positionsMock.length,
  openOrders: openOrdersMock.length,
  orderHistory: 2000,
  tradeHistory: 153,
  balance: balanceMock.length,
};
