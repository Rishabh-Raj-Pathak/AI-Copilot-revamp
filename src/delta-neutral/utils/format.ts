/*
 * Shared number formatting for the delta-neutral surfaces.
 *
 * These lived privately inside DeltaVaultBuilder. The Position Summary needs the same
 * ones, and a second copy is how two views of one quantity end up disagreeing — which
 * had already happened once: the same spread rendered at 4dp in the sidebar and 6dp in
 * the metric strip on the same card.
 */

/** Whole dollars — for sizing readouts, not settlement. */
export function formatCapital(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/** Cents. For costs, where rounding to the dollar would show most of them as $0. */
export function formatUsd(n: number): string {
  if (n !== 0 && Math.abs(n) < 0.01) return n > 0 ? "<$0.01" : ">-$0.01";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

/** Signed dollars — for income, where the sign is the point. */
export function formatSignedUsd(n: number): string {
  if (n !== 0 && Math.abs(n) < 0.01) return n > 0 ? "+<$0.01" : "-<$0.01";
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function formatHms(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

export function formatSignedPct(value: number, digits = 4) {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded >= 0 ? "+" : "";
  return `${sign}${rounded.toFixed(digits)}%`;
}

/**
 * Annualised funding, signed from the vault's point of view. Kept at 2dp because it is
 * read against the headline APR, not against the 4dp per-interval rates.
 */
export function formatApr(value: number) {
  const rounded = Number(value.toFixed(2));
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(2)}%`;
}

/** Unsigned rate, for the headline. */
export function formatPct(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`;
}

/**
 * A cost as a share of notional. These land in the hundredths of a percent, so 2dp
 * would render every one of them as "0.00%".
 */
export function formatCostPct(value: number) {
  if (value !== 0 && Math.abs(value) < 0.001) return "<0.001%";
  return `${value.toFixed(3)}%`;
}

export function formatCompactUsd(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Payback time, in whichever unit keeps it readable. A carry position that pays back
 * in 40 minutes and one that takes three weeks are both normal, and "0.03 days" reads
 * as neither.
 */
export function formatDuration(days: number | null): string {
  if (days === null || !Number.isFinite(days)) return "—";
  const minutes = days * 24 * 60;
  if (minutes < 60) return `~${Math.max(1, Math.round(minutes))}m`;
  if (days < 1) return `~${Math.round(minutes / 60)}h`;
  if (days < 30) return `~${days.toFixed(1)}d`;
  if (days < 365) return `~${(days / 30).toFixed(1)}mo`;
  return `~${(days / 365).toFixed(1)}y`;
}

function splitSpan(ms: number) {
  const total = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 1000)) : 0;
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad2 = (n: number) => n.toString().padStart(2, "0");

/**
 * How long a trade has been, or was, on — to its two largest units, down to the
 * minute. Not the same job as `formatDuration`, which estimates a payback period and
 * rounds it to one "~" unit; this states a measured span, so it is never approximate.
 */
export function formatElapsed(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  const { d, h, m } = splitSpan(ms);
  if (d > 0) return h ? `${d}d ${h}h` : `${d}d`;
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  return m > 0 ? `${m}m` : "<1m";
}

/** The same span as an ISO 8601 duration, for a `<time dateTime>` attribute. */
export function formatIsoDuration(ms: number): string {
  const { d, h, m, s } = splitSpan(ms);
  const time = `${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
  if (!d && !time) return "PT0S";
  return `P${d ? `${d}D` : ""}${time ? `T${time}` : ""}`;
}

/** Local 24-hour clock time: "19:42:11", or "19:42" without seconds. */
export function formatClock(ts: number, withSeconds = true): string {
  const t = new Date(ts);
  const hm = `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
  return withSeconds ? `${hm}:${pad2(t.getSeconds())}` : hm;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Local calendar day: "28 Sep". */
export function formatDayMonth(ts: number): string {
  const t = new Date(ts);
  return `${t.getDate()} ${MONTHS[t.getMonth()]}`;
}

/** "28 Sep 17:26" */
export function formatDayTime(ts: number): string {
  return `${formatDayMonth(ts)} ${formatClock(ts, false)}`;
}

/**
 * When a trade ran: "27 Sep 23:17 → 28 Sep 19:42". The second date is dropped when
 * both ends fall on the same day, and a trade with no end yet runs "→ Now".
 */
export function formatTimeRange(from: number, to?: number): string {
  const start = formatDayTime(from);
  if (to === undefined) return `${start} → Now`;
  const sameDay = new Date(from).toDateString() === new Date(to).toDateString();
  return `${start} → ${sameDay ? formatClock(to, false) : formatDayTime(to)}`;
}

/** Digits 0-9 as Unicode subscripts, indexed by value. */
const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

function toSubscript(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUBSCRIPT_DIGITS[Number(d)])
    .join("");
}

/**
 * A percent at a fixed number of significant figures, collapsing a long run of
 * leading zeros into a subscript count: 0.00000961% renders as 0.0₆961%.
 *
 * This is what makes a cross-venue spread readable at all. The predecessor stated
 * it with `toFixed(6)`, which is how "0.000005" and "0.014000" ended up side by
 * side in the same strip -- one of them all zeros, the other all padding, and
 * neither scannable. Significant figures follow the number wherever it lands, and
 * the subscript keeps the column narrow when it lands very small.
 *
 * Collapsing starts at three leading zeros. Below that the plain decimal is still
 * shorter than the subscript form.
 */
export function formatCompactPct(value: number, sigDigits = 4): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0%";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const exponent = Math.floor(Math.log10(abs));
  // Zeros sitting between the decimal point and the first significant digit.
  const leadingZeros = -exponent - 1;

  if (leadingZeros >= 3) {
    const digits =
      abs
        .toExponential(sigDigits - 1)
        .split("e")[0]
        .replace(".", "")
        .replace(/0+$/, "") || "0";
    return `${sign}0.0${toSubscript(leadingZeros)}${digits}%`;
  }

  // Enough places to carry `sigDigits` of them, then trimmed so an exact value
  // like 0.0247 is not padded out to 0.02470.
  const decimals = Math.min(8, Math.max(2, sigDigits - 1 - exponent));
  return `${sign}${Number(abs.toFixed(decimals))}%`;
}

/** Signed variant, for a spread whose direction is the point. */
export function formatSignedCompactPct(value: number, sigDigits = 4): string {
  const body = formatCompactPct(value, sigDigits);
  return value > 0 ? `+${body}` : body;
}
