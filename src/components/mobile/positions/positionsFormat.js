/**
 * Number / date formatting for the phone Positions & Orders panel.
 *
 * Figma "Notes · Positions & Orders" (1103:24370): the app uses `$` for every
 * value (the web mixes "USDC" and "$"), except asset amounts on Balance.
 * Negative numbers use a true minus sign (U+2212), as in the frames.
 */

const MINUS = "−";

/** Display decimals per coin size. BTC keeps 3 so a 0.01 order reads "0.010". */
const SIZE_DECIMALS = {
  BTC: { min: 3, max: 5 },
  ETH: { min: 0, max: 4 },
  SOL: { min: 0, max: 2 },
  AVAX: { min: 0, max: 2 },
  SP500: { min: 0, max: 3 },
  HYPE: { min: 2, max: 2 },
  USDC: { min: 2, max: 2 },
};

function decimalsFor(coin) {
  return SIZE_DECIMALS[coin] ?? { min: 0, max: 4 };
}

function grouped(value, min, max) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
}

/** "$2,041.39" — always two decimals. */
export function formatUsd(value) {
  const abs = Math.abs(value);
  const text = `$${grouped(abs, 2, 2)}`;
  return value < 0 && abs >= 0.005 ? `${MINUS}${text}` : text;
}

/** "+$114.96" / "−$239.04" — PnL, funding and other signed amounts. */
export function formatSignedUsd(value) {
  if (Math.abs(value) < 0.005) return "$0.00";
  return `${value > 0 ? "+" : MINUS}$${grouped(Math.abs(value), 2, 2)}`;
}

/** Fee: never shows "$0.00" for a real, sub-cent fee. */
export function formatFee(value) {
  if (value > 0 && value < 0.01) return "<$0.01";
  return formatUsd(value);
}

/** "+20.21%" / "−25.14%". */
export function formatSignedPct(value) {
  if (Math.abs(value) < 0.005) return "0.00%";
  return `${value > 0 ? "+" : MINUS}${grouped(Math.abs(value), 2, 2)}%`;
}

/** Bare price, as the history rows show it: "83,468.00". */
export function formatPrice(value) {
  return grouped(value, 2, 2);
}

/** Asset amount without the unit: "1.8", "0.010", "12". */
export function formatSize(value, coin) {
  if (value === 0) return "0"; // "0 filled", "0 / 0.010 BTC"
  const { min, max } = decimalsFor(coin);
  return grouped(value, min, max);
}

/** Asset amount with the unit: "1.8 ETH". */
export function formatSizeUnit(value, coin) {
  return `${formatSize(value, coin)} ${coin}`;
}

/** Plain-text amount for an input (no grouping commas): "1.8", "0.45". */
export function sizeInputValue(value, coin) {
  const { max } = decimalsFor(coin);
  const factor = 10 ** max;
  return String(Math.round(value * factor) / factor);
}

/** Round a size down to what the venue accepts for the coin. */
export function roundSize(value, coin) {
  const { max } = decimalsFor(coin);
  const factor = 10 ** max;
  return Math.floor(value * factor + 1e-9) / factor;
}

/**
 * Tag tone for a web "Direction" value. Opening or adding long is green,
 * opening short is red; closing flips it (Close Long sells, Close Short buys).
 */
export function directionTone(direction) {
  const d = direction.toLowerCase();
  if (d.includes("close")) return d.includes("long") ? "negative" : "positive";
  return d.includes("long") ? "positive" : "negative";
}

/** Order-history status → Signal Pill tone (History Row 1068:5648). */
export function statusTone(status) {
  if (status === "Filled" || status === "Triggered") return "positive";
  if (status === "Open") return "warning";
  if (status === "Rejected") return "negative";
  return "neutral";
}

/** Tone for a signed value: Tailwind text class. */
export function pnlTone(value, neutral = "text-ink") {
  if (value == null || Math.abs(value) < 0.005) return neutral;
  return value > 0 ? "text-app-positive" : "text-app-negative";
}

/* ------------------------------------------------------------------ dates */

const pad = (n) => String(n).padStart(2, "0");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayDiff(date, now = new Date()) {
  return Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
}

/** "14:02". */
export function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "Sep 28, 2026 · 14:02:18" — the expanded Date / time and Placed rows. */
export function formatDateTime(date) {
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${day} · ${formatClock(date)}:${pad(date.getSeconds())}`;
}

/** "Today, 11:45" / "Yesterday, 22:14" / "Sep 26, 16:20" — the Opened row. */
export function formatRelativeTime(date) {
  const diff = dayDiff(date);
  if (diff === 0) return `Today, ${formatClock(date)}`;
  if (diff === 1) return `Yesterday, ${formatClock(date)}`;
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day}, ${formatClock(date)}`;
}

/** Day-group header: "Today", "Yesterday", "Sat, Sep 26" (CSS uppercases it). */
export function formatDayGroup(date) {
  const diff = dayDiff(date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Group rows (already sorted newest first) into `[{ key, label, rows }]` by day. */
export function groupByDay(rows) {
  const groups = [];
  for (const row of rows) {
    const key = startOfDay(row.time).toISOString();
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: formatDayGroup(row.time), rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  }
  return groups;
}
