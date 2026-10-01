/**
 * Derived numbers for the phone Positions & Orders panel.
 *
 * Handoff note "Check before shipping" (Figma 1103:24370): est. close price,
 * fee and "You'll receive" must come from the venue API in production — these
 * are the client-side stand-ins the prototype shows until that is wired.
 */
import { MAKER_FEE, TAKER_FEE } from "./positionsMockData.js";

const sideSign = (position) => (position.direction === "long" ? 1 : -1);

/** Unrealized PnL at the current price. */
export function positionPnl(position) {
  return (position.currentPrice - position.entryPrice) * position.size * sideSign(position);
}

/** Notional at the current price. */
export function positionValue(position) {
  return position.currentPrice * position.size;
}

/** PnL if TP / SL fill (relative to entry), or null when unset. */
export function expectedPnl(position) {
  const at = (px) =>
    px == null ? null : (px - position.entryPrice) * position.size * sideSign(position);
  return { profit: at(position.tp), loss: at(position.sl) };
}

/** Order notional: limit price × size, or trigger × size for TP / SL. */
export function orderValue(order) {
  return (order.triggerPx ?? order.price) * order.size;
}

/**
 * Close estimate for `amount` of a position at `closePx`.
 * You'll receive = released margin + realized PnL − fee.
 */
export function closeEstimate(position, amount, closePx, orderType) {
  const fraction = position.size > 0 ? amount / position.size : 0;
  const notional = amount * closePx;
  const realizedPnl = (closePx - position.entryPrice) * amount * sideSign(position);
  const fee = notional * (orderType === "limit" ? MAKER_FEE : TAKER_FEE);
  const receive = position.margin * fraction + realizedPnl - fee;
  return { fraction, notional, realizedPnl, fee, receive };
}

/** ROE % of a PnL against the position's margin. */
export function roePct(position, pnl) {
  return position.margin > 0 ? (pnl / position.margin) * 100 : 0;
}

/** 11-digit order id for orders created in this session. */
export function makeOrderId() {
  return String(48_220_000_000 + Math.floor(Math.random() * 9_999_999));
}
