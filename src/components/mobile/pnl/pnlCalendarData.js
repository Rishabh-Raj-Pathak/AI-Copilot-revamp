/**
 * Phone PnL Calendar data (Figma section "09 PnL Calendar", 1330:6979).
 *
 * `getPnlCalendar({ month, year })` resolves to the web endpoint's shape, so
 * the screen can switch to the real call unchanged:
 *
 *   { totalPnl, totalClosedPnl, profitableDays: "4/20", calendar: [{ date, pnl }] }
 *
 * `calendar[day - 1].pnl` is that day's PnL; 0 means no trades. `month` is
 * 1–12. The prototype has no backend, so the months are fixed:
 *
 * - Oct 2026 — Figma "Current Month" (1340:6979)
 * - Sep 2026 — Figma "No Trades" (1340:7448)
 * - Jul 2026 — Figma "Month View — July 2026" (1340:7192), the live web values
 * - every other month since the first trade (Nov 2024) — seeded sample data,
 *   so the year switch has 2024, 2025 and 2026 to move between
 */

/** History starts at the first month with trades (Figma notes "Choosing a month"). */
const FIRST_TRADE_MONTH = { year: 2024, month: 11 };
/** Used when the first trade month is unknown or after today. */
const FALLBACK_MONTHS = 12;

const FIXED = {
  "2026-10": {
    totalPnl: 1592.34,
    totalClosedPnl: 1459.2,
    profitableDays: "6/8",
    days: { 1: 84.3, 2: -126.2, 4: 212.8, 5: 1180.6, 6: -342.3, 7: 96.4, 8: 311.7, 9: 41.9 },
  },
  "2026-09": { totalPnl: null, totalClosedPnl: null, profitableDays: null, days: {} },
  "2026-07": {
    totalPnl: -1.9,
    totalClosedPnl: -0.74,
    profitableDays: "4/20",
    days: {
      3: 0.09, 4: -0.07, 5: -0.3, 6: -0.3, 7: -0.38, 8: -0.14, 9: -0.23, 10: -0.11,
      11: 0.02, 12: -0.13, 13: -0.11, 17: -0.01, 18: -0.05, 19: -0.05, 20: -0.01,
      21: 0.04, 22: -0.01, 23: 0.03, 28: -0.01, 29: -0.19,
    },
  },
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const monthKey = ({ year, month }) => `${year}-${String(month).padStart(2, "0")}`;

/** Uses the selected year — web's grid uses the current one, which mislays past years. */
export const daysInMonth = ({ year, month }) => new Date(year, month, 0).getDate();
export const firstWeekday = ({ year, month }) => new Date(year, month - 1, 1).getDay();

export const monthName = ({ month }) => MONTH_LONG[month - 1];

/** Month chip label. The year chip beside the months carries the year. */
export const monthShort = ({ month }) => MONTH_SHORT[month - 1];

/** Oldest → newest, ending at today's month. No future months. */
export function pnlMonths(today) {
  const end = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const index = ({ year, month }) => year * 12 + month - 1;
  let start = index(FIRST_TRADE_MONTH);
  if (start > index(end)) start = index(end) - (FALLBACK_MONTHS - 1);
  const months = [];
  for (let i = start; i <= index(end); i += 1) {
    months.push({ year: Math.floor(i / 12), month: (i % 12) + 1 });
  }
  return months;
}

const round2 = (n) => Math.round(n * 100) / 100;
const isoDate = (year, month, day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** Deterministic PRNG so a sample month reads the same on every visit. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleDays(target, lastDay) {
  const rand = mulberry32(target.year * 100 + target.month);
  const days = {};
  for (let day = 1; day <= lastDay; day += 1) {
    if (rand() > 0.68) continue;
    const size = rand() < 0.1 ? 600 + rand() * 900 : 4 + rand() * 280;
    days[day] = round2((rand() < 0.58 ? 1 : -1) * size);
  }
  return days;
}

function buildMonth(target, today) {
  const key = monthKey(target);
  const length = daysInMonth(target);
  const isCurrent = key === monthKey({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const lastDay = isCurrent ? today.getDate() : length;
  const fixed = FIXED[key];
  const days = fixed?.days ?? sampleDays(target, lastDay);

  const calendar = Array.from({ length }, (_, i) => ({
    date: isoDate(target.year, target.month, i + 1),
    pnl: i + 1 <= lastDay ? (days[i + 1] ?? 0) : 0,
  }));

  if (fixed) {
    const { totalPnl, totalClosedPnl, profitableDays } = fixed;
    return { totalPnl, totalClosedPnl, profitableDays, calendar };
  }

  const traded = calendar.filter((d) => d.pnl);
  if (!traded.length) return { totalPnl: null, totalClosedPnl: null, profitableDays: null, calendar };
  const closed = round2(traded.reduce((sum, d) => sum + d.pnl, 0));
  const unrealized = round2((mulberry32(target.year * 7 + target.month)() - 0.4) * 160);
  return {
    totalPnl: round2(closed + unrealized),
    totalClosedPnl: closed,
    profitableDays: `${traded.filter((d) => d.pnl > 0).length}/${traded.length}`,
    calendar,
  };
}

const requests = new Map();

/** Mock of the web's `getPnlCalendar`. First load of a month takes a beat; repeats are instant. */
export function getPnlCalendar({ month, year }) {
  const key = monthKey({ year, month });
  if (!requests.has(key)) {
    const data = buildMonth({ year, month }, new Date());
    requests.set(key, new Promise((resolve) => setTimeout(() => resolve(data), 700)));
  }
  return requests.get(key);
}

/* ── Formatting (Figma notes "Colours & format") ───────────────────────── */

export const EMPTY = "–";
const MINUS = "−";

const money = (abs, digits) =>
  abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Total / Closed PnL: "+$1,592.34", "−$1.90". */
export function formatSignedUsd(value) {
  if (value == null) return EMPTY;
  const sign = value > 0 ? "+" : value < 0 ? MINUS : "";
  return `${sign}$${money(Math.abs(value), 2)}`;
}

/** One side of Profit / Loss: "$1,927.70", "−$468.50". */
export function formatUsd(value) {
  return `${value < 0 ? MINUS : ""}$${money(Math.abs(value), 2)}`;
}

/** Day cell: under $10 two decimals, $10–$999 whole dollars, $1K+ one-decimal K. */
export function formatCellPnl(value) {
  const sign = value > 0 ? "+" : MINUS;
  const abs = Math.abs(value);
  if (abs < 9.995) return `${sign}$${abs.toFixed(2)}`;
  if (Math.round(abs) < 1000) return `${sign}$${Math.round(abs)}`;
  if (abs < 999_950) return `${sign}$${(abs / 1000).toFixed(1)}K`;
  return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
}

/** Profit / Loss = sum of positive / negative calendar[].pnl, as web does. */
export function profitAndLoss(calendar) {
  let profit = 0;
  let loss = 0;
  for (const { pnl } of calendar) {
    if (pnl > 0) profit += pnl;
    else if (pnl < 0) loss += pnl;
  }
  return { profit: round2(profit), loss: round2(loss) };
}
