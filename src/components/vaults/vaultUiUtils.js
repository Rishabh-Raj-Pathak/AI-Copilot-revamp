/** Figma `4421:6300` — performance / fee readout scales with slider (mock curve). */
export const DEFAULT_MAX_USDC = 10_000;

export function feePctFromShare(sharePct) {
  const v = 0.01 + (sharePct / 100) * 0.24;
  return `${v.toFixed(2)}%`;
}

/** Default ~0.05% at rest (matches design). */
export const DEFAULT_SHARE_PCT = 16.67;

export function clampAmountStr(raw, max = DEFAULT_MAX_USDC) {
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return "0";
  return String(Math.min(Math.round(n * 100) / 100, max));
}

/** Parses trailing number from labels like `MAX: 10,000`. */
export function parseMaxUsdcFromLabel(maxLabel) {
  const m = String(maxLabel ?? "").match(/([\d,]+)\s*$/);
  if (!m) return DEFAULT_MAX_USDC;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : DEFAULT_MAX_USDC;
}

export function formatUsdcAmountDisplay(amountStr) {
  const n = Number(String(amountStr ?? "").replace(/,/g, ""));
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
