/**
 * Mock data for the phone Positions & Orders panel.
 *
 * Values come from Figma "07 Positions & Orders (new)" (1103:24086) and are
 * internally consistent: PnL = (current − entry) × size, margin = entry
 * notional ÷ leverage, the Balance tab's available USDC = total − margin used.
 * Field names follow the desktop tables (`trade/tradeTableColumns.jsx`) so the
 * module can be swapped for the venue API without touching the components.
 *
 * Timestamps are relative to "now" so the day groups read Today / Yesterday
 * like the frames do.
 */
import { appImages } from "../mobileAssets.js";

/** `daysAgo` days before today at "HH:MM:SS". */
function at(daysAgo, clock) {
  const [h, m, s] = clock.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, s, 0);
  return d;
}

/** Hyperliquid perps fees: taker on market closes, maker on resting limits. */
export const TAKER_FEE = 0.00035;
export const MAKER_FEE = 0.0001;

/** Token art. BTC/ETH reuse the kit's logos; the rest are Figma exports. */
export const TOKEN_ICONS = {
  BTC: appImages.tokenBtc,
  ETH: appImages.tokenEth,
  SOL: "/mobile/positions/token-sol.png",
  AVAX: "/mobile/positions/token-avax.png",
  SP500: "/mobile/positions/token-sp500.png",
};

/** Composite tokens (Figma "Token / USDC" 1081:6801, "Token / HYPE" 1081:6806). */
export const TOKEN_PARTS = {
  USDC: {
    base: "/mobile/positions/token-usdc-base.svg",
    ring: "/mobile/positions/token-usdc-ring.svg",
  },
  HYPE: {
    base: "/mobile/positions/token-hype-base.svg",
    mark: "/mobile/positions/token-hype-mark.png",
  },
};

/* -------------------------------------------------------------- positions */

export const positionsMock = [
  {
    id: "pos-eth",
    coin: "ETH",
    direction: "long",
    leverage: 5,
    source: "manual",
    marginMode: "Isolated",
    size: 1.8,
    entryPrice: 2641.2,
    currentPrice: 2508.4,
    liqPrice: 2126.3,
    margin: 950.83,
    funding: -1.12,
    tp: null,
    sl: null,
    openedAt: at(0, "11:45:07"),
  },
  {
    id: "pos-sol",
    coin: "SOL",
    direction: "long",
    leverage: 3,
    source: "copilot",
    marginMode: "Isolated",
    size: 12,
    entryPrice: 142.22,
    currentPrice: 151.8,
    liqPrice: 97.4,
    margin: 568.88,
    funding: -0.86,
    tp: null,
    sl: 132,
    openedAt: at(2, "16:20:31"),
  },
  {
    id: "pos-btc",
    coin: "BTC",
    direction: "short",
    leverage: 4,
    source: "manual",
    marginMode: "Isolated",
    size: 0.025,
    entryPrice: 83468,
    currentPrice: 84120.4,
    liqPrice: 103480,
    margin: 521.68,
    funding: 0.31,
    tp: null,
    sl: null,
    openedAt: at(0, "14:02:18"),
  },
  {
    id: "pos-avax",
    coin: "AVAX",
    direction: "short",
    leverage: 5,
    source: "copilot",
    marginMode: "Isolated",
    size: 60,
    entryPrice: 10.42,
    currentPrice: 10.27,
    liqPrice: 12.45,
    margin: 125.04,
    funding: 0.08,
    tp: 9.6,
    sl: 11.1,
    openedAt: at(1, "09:12:44"),
  },
  {
    id: "pos-sp500",
    coin: "SP500",
    direction: "long",
    leverage: 10,
    source: "manual",
    marginMode: "Cross",
    size: 0.12,
    entryPrice: 6604.2,
    currentPrice: 6618.5,
    liqPrice: 5976.8,
    margin: 79.25,
    funding: -0.04,
    tp: 6800,
    sl: null,
    openedAt: at(0, "09:10:02"),
  },
];

/**
 * Show the populated lists (Figma section 07) even before a wallet connects,
 * so the panel previews with data. Set to `false` to restore the
 * "Connect your wallet to view positions" state (Figma 938:1278).
 */
export const SHOW_MOCK_WHEN_DISCONNECTED = true;

/* ------------------------------------------------------------ open orders */

/**
 * `direction` is the web's Direction column. Trigger orders (TP / SL) carry
 * `triggerPx` + `triggerOp` and execute at market; resting limits carry `price`.
 */
export const openOrdersMock = [
  {
    id: "ord-btc-limit",
    coin: "BTC",
    direction: "Long",
    type: "Limit",
    price: 82900,
    size: 0.01,
    filledSize: 0,
    reduceOnly: false,
    tif: "GTC",
    placedAt: at(0, "10:24:51"),
    orderId: "48205511874",
  },
  {
    id: "ord-eth-tp",
    coin: "ETH",
    direction: "Close Long",
    type: "Take Profit",
    triggerPx: 2780,
    triggerOp: "≥",
    size: 1.8,
    filledSize: 0,
    reduceOnly: true,
    placedAt: at(0, "11:46:12"),
    orderId: "48209921107",
  },
  {
    id: "ord-sol-sl",
    coin: "SOL",
    direction: "Close Long",
    type: "Stop Loss",
    triggerPx: 132,
    triggerOp: "≤",
    size: 12,
    filledSize: 0,
    reduceOnly: true,
    placedAt: at(2, "16:21:02"),
    orderId: "48170031985",
  },
  {
    id: "ord-avax-limit",
    coin: "AVAX",
    direction: "Short",
    type: "Limit",
    price: 24.5,
    size: 40,
    filledSize: 0,
    reduceOnly: false,
    tif: "GTC",
    placedAt: at(1, "18:32:55"),
    orderId: "48185530218",
  },
  {
    id: "ord-eth-limit",
    coin: "ETH",
    direction: "Long",
    type: "Limit",
    price: 2420,
    size: 0.5,
    filledSize: 0,
    reduceOnly: false,
    tif: "GTC",
    placedAt: at(1, "09:12:40"),
    orderId: "48179904416",
  },
  {
    id: "ord-sol-limit",
    coin: "SOL",
    direction: "Long",
    type: "Limit",
    price: 135,
    size: 8,
    filledSize: 0,
    reduceOnly: false,
    tif: "GTC",
    placedAt: at(1, "07:58:03"),
    orderId: "48178310652",
  },
  {
    id: "ord-btc-short-limit",
    coin: "BTC",
    direction: "Short",
    type: "Limit",
    price: 86500,
    size: 0.01,
    filledSize: 0,
    reduceOnly: false,
    tif: "GTC",
    placedAt: at(0, "08:41:27"),
    orderId: "48199874230",
  },
];

/* ---------------------------------------------------------- order history */

/** Newest first. `price` is the limit / average fill price; null = market trigger. */
export const orderHistoryMock = [
  {
    id: "oh-btc-open-short",
    time: at(0, "14:02:18"),
    coin: "BTC",
    direction: "Open Short",
    type: "Market",
    price: 83468,
    size: 0.025,
    filledSize: 0.025,
    reduceOnly: false,
    triggerCondition: null,
    status: "Filled",
    orderId: "48213377061",
  },
  {
    id: "oh-eth-open-long",
    time: at(0, "11:45:07"),
    coin: "ETH",
    direction: "Open Long",
    type: "Limit",
    price: 2641.2,
    size: 1.8,
    filledSize: 1.8,
    reduceOnly: false,
    triggerCondition: null,
    status: "Filled",
    orderId: "48209915532",
  },
  {
    id: "oh-sp500-close-long",
    time: at(0, "09:10:44"),
    coin: "SP500",
    direction: "Close Long",
    type: "Market",
    price: 6618.5,
    size: 0.002,
    filledSize: 0.002,
    reduceOnly: true,
    triggerCondition: null,
    status: "Filled",
    orderId: "48201174420",
  },
  {
    id: "oh-sol-open-long-cancel",
    time: at(1, "22:14:09"),
    coin: "SOL",
    direction: "Open Long",
    type: "Limit",
    price: 138,
    size: 5,
    filledSize: 0,
    reduceOnly: false,
    triggerCondition: null,
    status: "Canceled",
    orderId: "48188420917",
  },
  {
    id: "oh-eth-close-short",
    time: at(1, "13:27:36"),
    coin: "ETH",
    direction: "Close Short",
    type: "Take Profit",
    price: 2580.1,
    size: 0.5,
    filledSize: 0.5,
    reduceOnly: true,
    triggerCondition: "Mark ≤ $2,580.00",
    status: "Filled",
    orderId: "48183062259",
  },
  {
    id: "oh-sol-open-long",
    time: at(2, "16:20:31"),
    coin: "SOL",
    direction: "Open Long",
    type: "Market",
    price: 142.22,
    size: 12,
    filledSize: 12,
    reduceOnly: false,
    triggerCondition: null,
    status: "Filled",
    orderId: "48170023344",
  },
  {
    id: "oh-sp500-open-long",
    time: at(2, "10:05:12"),
    coin: "SP500",
    direction: "Open Long",
    type: "Limit",
    price: 6402,
    size: 0.002,
    filledSize: 0.002,
    reduceOnly: false,
    triggerCondition: null,
    status: "Filled",
    orderId: "48164518873",
  },
  {
    id: "oh-eth-open-short",
    time: at(3, "08:12:50"),
    coin: "ETH",
    direction: "Open Short",
    type: "Market",
    price: 2642.9,
    size: 0.5,
    filledSize: 0.5,
    reduceOnly: false,
    triggerCondition: null,
    status: "Filled",
    orderId: "48151129904",
  },
];

/** Server-side total (the history tabs are paginated; the badge shows this). */
export const ORDER_HISTORY_TOTAL = 20;

/* ---------------------------------------------------------- trade history */

/** Newest first. `closedPnl` null = an opening fill. */
export const tradeHistoryMock = [
  {
    id: "th-btc-open-short",
    time: at(0, "14:02:18"),
    coin: "BTC",
    direction: "Open Short",
    price: 83468,
    size: 0.025,
    fee: 0.94,
    closedPnl: null,
  },
  {
    id: "th-eth-open-long",
    time: at(0, "11:45:07"),
    coin: "ETH",
    direction: "Open Long",
    price: 2641.2,
    size: 1.8,
    fee: 0.48,
    closedPnl: null,
  },
  {
    id: "th-sp500-close-long",
    time: at(0, "09:10:44"),
    coin: "SP500",
    direction: "Close Long",
    price: 6618.5,
    size: 0.002,
    fee: 0.0046,
    closedPnl: 0.43,
  },
  {
    id: "th-eth-close-short",
    time: at(1, "13:27:36"),
    coin: "ETH",
    direction: "Close Short",
    price: 2580.1,
    size: 0.5,
    fee: 0.45,
    closedPnl: 31.4,
  },
  {
    id: "th-sol-open-long",
    time: at(2, "16:20:31"),
    coin: "SOL",
    direction: "Open Long",
    price: 142.22,
    size: 12,
    fee: 0.6,
    closedPnl: null,
  },
  {
    id: "th-sp500-open-long",
    time: at(2, "10:05:12"),
    coin: "SP500",
    direction: "Open Long",
    price: 6402,
    size: 0.002,
    fee: 0.0013,
    closedPnl: null,
  },
  {
    id: "th-eth-open-short",
    time: at(3, "08:12:50"),
    coin: "ETH",
    direction: "Open Short",
    price: 2642.9,
    size: 0.5,
    fee: 0.46,
    closedPnl: null,
  },
];

export const TRADE_HISTORY_TOTAL = 36;

/* ---------------------------------------------------------------- balance */

/**
 * USDC `totalBalance` here is the account before any close in this session;
 * the panel adds realized PnL and fees to it, and derives available as
 * total − margin used, so closing a position moves both numbers.
 */
export const USDC_TOTAL_BALANCE = 4210.55;

export const balanceMock = [
  {
    id: "bal-hype",
    coin: "HYPE",
    totalBalance: 12.4,
    availableBalance: 12.4,
    usdcValue: 487.32,
    pnl: 18.62,
    roe: 3.97,
    contract: "Spot",
  },
];
