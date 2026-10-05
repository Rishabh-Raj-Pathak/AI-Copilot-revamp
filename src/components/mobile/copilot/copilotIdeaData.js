import { appIcons } from "../mobileAssets.js";
import { tokenIconFor } from "../trade/tradeData.js";

/**
 * Phone read-outs of a copilot setup (`terminal/copilotSetups.js`).
 *
 * The setup mock carries copy-ready chip strings ("Winning %: 68%",
 * "R/R: 1:1.2", "Range: $77259 - $77646"). The Figma trade-idea card and
 * backtest sheet word the same values differently ("Win rate 68%",
 * "R:R 1:1.2", "Range $77,259.00 – $77,646.00"), so this module parses the
 * values out once and every phone surface formats from here.
 */

/** DetailsPanel's leverage ceiling and seed — the desktop ticket's defaults. */
export const COPILOT_MAX_LEVERAGE = 40;
export const COPILOT_DEFAULT_LEVERAGE = 10;

/**
 * Figma "Category chips" (937:1163 / 1178 / 1188 / 1200). Ids and labels are
 * the copilot's own filter set (`MarketFiltersBar`); the glyphs are Figma's.
 * Trade[XYZ] lists commodities and indices, so it takes the Commodities chip art.
 */
export const COPILOT_CATEGORY_CHIPS = [
  { id: "bluechip", label: "Bluechip", icon: appIcons.chipBluechip },
  { id: "hip3", label: "Stocks (HIP-3)", icon: appIcons.chipStocks },
  { id: "trending", label: "Trending", icon: appIcons.chipTrending },
  { id: "tradexyz", label: "Trade[XYZ]", icon: appIcons.chipCommodities },
];

/** `68%` from `Winning %: 68%` — the text after the first colon. */
export function chipValue(setup, kind) {
  const chip = setup?.chips?.find((c) => c.kind === kind);
  if (!chip) return null;
  const [, rest] = chip.label.split(/:(.+)/);
  return (rest ?? chip.label).trim();
}

const toNumber = (v) => {
  const n = Number.parseFloat(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Decimals that keep a quote readable: cents above $1, four places below. */
export function priceDecimals(price) {
  const p = Math.abs(Number(price) || 0);
  if (p >= 1) return 2;
  if (p >= 0.01) return 4;
  return 6;
}

/** `$84,209.00` · `$0.1131` */
export function formatPrice(value, decimals = priceDecimals(value)) {
  const n = Number(value) || 0;
  return `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** `[77259, 77646]` from the range chip, or `null`. */
export function entryRange(setup) {
  const raw = chipValue(setup, "range");
  if (!raw) return null;
  const nums = raw.match(/-?\d[\d,]*\.?\d*/g)?.map(toNumber) ?? [];
  return nums.length >= 2 ? [nums[0], nums[1]] : null;
}

/** `$77,259.00 – $77,646.00` (Figma uses an en dash between the bounds). */
export function formatEntryRange(setup) {
  const range = entryRange(setup);
  if (!range) return null;
  const decimals = priceDecimals(Number(setup.price));
  return `${formatPrice(range[0], decimals)} – ${formatPrice(range[1], decimals)}`;
}

/**
 * Entry range sized for a metric cell: `0.1129–0.1134`, `2,641–2,650`,
 * `83,468–83,984`. The `$` and the cents above $1,000 are dropped — the cell
 * label says "Entry" and the full figure is one tap away in the ticket.
 */
export function formatCompactRange(setup) {
  const range = entryRange(setup);
  if (!range) return null;
  const price = Math.abs(Number(setup.price) || range[0]);
  const decimals = price >= 1000 ? 0 : priceDecimals(price);
  const fmt = (n) =>
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${fmt(range[0])}–${fmt(range[1])}`;
}

/** `6h` from the "Review: 6h" chip — how long the setup is meant to be held. */
export function reviewHorizon(setup) {
  return chipValue(setup, "review");
}

/**
 * Entry, take-profit and stop-loss for an idea. The 4% / 2% offsets are the
 * seeds DetailsPanel puts in its TP/SL fields, mirrored for longs (DetailsPanel
 * seeds the short side for both directions).
 */
export function ideaLevels(setup) {
  const price = Number(setup?.price) || 0;
  const short = setup?.direction === "short";
  const round = (v) => Math.round(v * 10000) / 10000;
  return {
    price,
    takeProfit: round(price * (short ? 0.96 : 1.04)),
    stopLoss: round(price * (short ? 1.02 : 0.98)),
  };
}

/** Token art for the white disc: the shared phone set, then the setup's own icon. */
export function ideaTokenIcon(setup) {
  return tokenIconFor(setup?.symbol) ?? setup?.tokenIcon ?? null;
}

/** The `market` prop `TradeTicketSheet` takes, for a copilot idea. */
export function ideaTicketMarket(setup) {
  return {
    symbol: setup.symbol,
    pair: `${setup.symbol}-USDC`,
    price: Number(setup.price) || 0,
    iconSrc: ideaTokenIcon(setup),
    maxLeverage: COPILOT_MAX_LEVERAGE,
    pxDecimals: priceDecimals(Number(setup.price)),
  };
}

/**
 * The `defaults` prop `TradeTicketSheet` takes. Margin seeds at 10% of the
 * setup's balance, as DetailsPanel does — only once a wallet is connected.
 */
export function ideaTicketDefaults(setup, { walletConnected } = {}) {
  const { price, takeProfit, stopLoss } = ideaLevels(setup);
  const balance = toNumber(setup.balance);
  return {
    side: setup.direction === "short" ? "short" : "long",
    leverage: COPILOT_DEFAULT_LEVERAGE,
    entry: price,
    takeProfit,
    stopLoss,
    margin: walletConnected ? Math.round(balance * 0.1 * 100) / 100 : undefined,
    marginMode: "isolated",
    orderType: "market",
    riskReward: chipValue(setup, "rr") ?? undefined,
    winRate: chipValue(setup, "win") ?? setup.additional?.winning,
  };
}

/** The balance the ticket shows: the setup's, once connected. */
export function ideaTicketBalance(setup, walletConnected) {
  return walletConnected ? toNumber(setup.balance) : undefined;
}

/** `+4.03%` — signed percent move from entry. */
export function formatMovePct(from, to) {
  if (!from) return "—";
  const pct = ((to - from) / from) * 100;
  return `${pct >= 0 ? "+" : "-"}${Math.abs(pct).toFixed(2)}%`;
}

/** `10:28` */
export function formatClock(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
