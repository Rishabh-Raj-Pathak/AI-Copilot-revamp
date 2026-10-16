import { formatSignedUsd, formatSizeUnit, formatUsd } from "../positions/positionsFormat.js";

/**
 * Shapes the web Positions / History rows (`vaultsPositionsHistoryMock`, all
 * display strings) for the phone Alpha Agents tabs. The Close position and
 * Edit TP/SL sheets are the Positions & Orders ones (Figma 1103:24131), which
 * work on numbers, so each row becomes the numeric position they expect.
 */

/** "$83,915" / "+$0.08" / "-$298.64" → number (null when absent). */
function parseUsd(text) {
  const n = Number.parseFloat(String(text ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function toAgentPosition(row) {
  return {
    id: row.id,
    coin: row.symbol,
    venue: row.venue,
    direction: row.direction,
    leverage: row.leverage,
    marginMode: row.marginMode === "cross" ? "Cross" : "Isolated",
    size: Number.parseFloat(row.sizeLabel),
    entryPrice: parseUsd(row.entryPrice),
    currentPrice: parseUsd(row.currPrice),
    liqPrice: parseUsd(row.liqPrice),
    margin: parseUsd(row.margin),
    funding: parseUsd(row.funding) ?? 0,
    tp: parseUsd(row.tp),
    sl: parseUsd(row.sl),
  };
}

const pad = (n) => String(n).padStart(2, "0");

/** "Oct 16, 14:32" — the History rows' time format. */
function tradeTime(date) {
  const day = date.toLocaleString("en-US", { month: "short", day: "numeric" });
  return `${day}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** A market close lands in History as a row in the web table's shape. */
export function historyRowFromClose({ position, amount, closePx, realizedPnl }, now = new Date()) {
  return {
    id: `h-${position.id}-${now.getTime()}`,
    venue: position.venue,
    time: tradeTime(now),
    symbol: position.coin,
    side: position.direction,
    size: formatSizeUnit(amount, position.coin),
    entry: formatUsd(position.entryPrice),
    exit: formatUsd(closePx),
    pnl: formatSignedUsd(realizedPnl),
    pnlPositive: realizedPnl >= 0,
    status: "Closed",
  };
}
