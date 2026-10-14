import { useEffect, useState } from "react";
import { DEX_FUNDING_INTERVAL_HOURS, DEX_PROFILES } from "../../../delta-neutral/utils/legs.ts";
import { EPOCHS_PER_YEAR } from "../../../delta-neutral/utils/positionSummary.ts";
import { formatApr, formatSignedPct } from "../../../delta-neutral/utils/format.ts";
import { TOKEN_CATALOG, marketProfileFor } from "../../../delta-neutral/utils/markets.ts";
import { TRADE_MARKETS } from "../../trade/tradeMockData.js";
import { decimalsForPrice, formatUsd } from "../trade/tradeData.js";
import { appImages } from "../mobileAssets.js";
import { DN_VENUE_LOGOS } from "../agents/agentsTheme.js";

/**
 * Data helpers for the Delta Neutral 2 phone screens. Every figure comes from
 * the same sources the web DN page reads (venue profiles, the market catalog,
 * the trade chart feed); this file only shapes them for the phone copy.
 */

/** U+2212, the minus Figma sets in front of negative money and rates. */
export const MINUS = "−";

/** "-$32" → "−$32", "+6.8% / -3.4%" → "+6.8% / −3.4%". */
export function withMinus(text) {
  return String(text ?? "").replace(/-(?=[\d$<])/g, MINUS);
}

/** "+$16" / "−$32" — whole dollars, sign first. */
export function signedWholeUsd(n) {
  const v = Math.round(Number(n) || 0);
  return `${v < 0 ? MINUS : "+"}$${Math.abs(v).toLocaleString("en-US")}`;
}

/** "+$21.40" / "−$88.30" — cents, sign first. */
export function signedUsd(n) {
  const v = Number(n) || 0;
  return `${v < 0 ? MINUS : "+"}$${Math.abs(v).toFixed(2)}`;
}

/** "$20,499" */
export function wholeUsd(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
}

/** "$262.9K", "$0" — the vault card's volume figures. */
export function compactUsd(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

/* ── Venues ───────────────────────────────────────────────────────────── */

export function venueLogo(dex) {
  return DN_VENUE_LOGOS[dex] ?? null;
}

/**
 * One venue's own funding — the rate at its settlement interval and the same
 * rate annualised. The web builder's "venue readout", for any venue.
 */
export function venueFunding(dex) {
  const profile = DEX_PROFILES[dex];
  if (!profile) return { funding: "—", apr: 0, aprLabel: "—" };
  const intervalHours = DEX_FUNDING_INTERVAL_HOURS[dex];
  const apr = profile.funding8hPct * EPOCHS_PER_YEAR;
  return {
    funding: `${formatSignedPct(profile.funding8hPct * (intervalHours / 8))} / ${intervalHours}h`,
    apr,
    aprLabel: formatApr(apr),
  };
}

/* ── Markets ──────────────────────────────────────────────────────────── */

/** "BTC-USDC" / "BTC/USDC" → "BTC". */
export function coinOf(pair) {
  return String(pair ?? "").split(/[-/]/)[0].toUpperCase();
}

const TOKEN_DISCS = {
  BTC: appImages.tokenBtc,
  ETH: appImages.tokenEthDisc,
  SOL: appImages.tokenSolDisc,
};

/** Full-colour coin for a pair, or null (callers draw a letter disc). */
export function tokenIconFor(pair) {
  return TOKEN_DISCS[coinOf(pair)] ?? null;
}

/**
 * The price the phone quotes for a pair. The chart feed (the Copilot trade
 * chart's market data) wins where it lists the coin, so the builder, the chart
 * sheet and its candles agree; other pairs fall back to the market profile.
 */
export function tokenPrice(token) {
  const coin = coinOf(token);
  const listed = TRADE_MARKETS.find((m) => m.coin === coin);
  return listed ? listed.markPx : marketProfileFor(token).markPriceUsd;
}

/** "$84,344.00" */
export function formatTokenPrice(price) {
  return formatUsd(price, Math.max(2, decimalsForPrice(price)));
}

/** "Top Picks · Meme" — the categories a pair belongs to. */
export function tokenThemes(token) {
  return TOKEN_CATALOG.find((t) => t.value === token)?.themes ?? [];
}

/* ── Vaults ───────────────────────────────────────────────────────────── */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * The vault card's Margin figure — the share of capital in use. The same
 * derivation the web card prints as "Margin", so the two never disagree.
 */
export function capitalUsedPct(hedgeHealth) {
  return clamp(35 + (100 - hedgeHealth) * 0.7, 18, 90);
}

export const DEFAULT_VAULT_LEVERAGE = 3;

export function vaultLeverage(vault) {
  return vault.leverage ?? DEFAULT_VAULT_LEVERAGE;
}

export function vaultMarginUsd(vault) {
  return vault.marginUsd ?? Math.round(vault.notional / vaultLeverage(vault));
}

/** A slider ceiling that always contains the current margin (web card's rule). */
export function marginCeilingFor(marginUsd) {
  return Math.max(10000, Math.ceil((marginUsd * 2) / 1000) * 1000);
}

/**
 * Where a vault's PnL comes from, as lines that add up to the total.
 *
 * Funding and the two legs are the vault's own figures. Fees, slippage and
 * rebalancing are estimated from its size with the builder's cost model (each
 * venue's taker fee, a mid-liquidity book), so the breakdown reconciles with
 * the Net PnL it sits under.
 */
export function vaultPnlBreakdown(vault) {
  const legNotional = vault.notional / 2;
  const longFee = DEX_PROFILES[vault.longAccount]?.perpTakerFeePct ?? 0.02;
  const shortFee = DEX_PROFILES[vault.shortAccount]?.perpTakerFeePct ?? 0.02;
  const fees = -(legNotional * (longFee + shortFee)) / 100;
  const impactPct = (100 * (legNotional / 1_000_000)) / 100;
  const slippage = -((legNotional * impactPct) / 100) * 2;
  const rebalance = -vault.notional * ((100 - vault.hedgeHealth) / 100) * 0.0005;
  const lines = [
    { label: "Funding income", value: vault.fundingEarned },
    { label: "Long leg PnL", value: vault.longPnl },
    { label: "Short leg PnL", value: vault.shortPnl },
    { label: "Fees", value: fees },
    { label: "Slippage", value: slippage },
    { label: "Rebalance PnL", value: rebalance },
  ];
  const net = lines.reduce((sum, line) => sum + line.value, 0);
  const netDeltaPct = (100 - vault.hedgeHealth) / 70;
  return { lines, net, netDeltaPct };
}

/* ── Clocks ───────────────────────────────────────────────────────────── */

/** Re-renders every `intervalMs` with the current time. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

const FUNDING_EPOCH_MS = 8 * 60 * 60 * 1000;

/** "7:42:53" to the next 8h funding epoch — the web vault card's countdown. */
export function payoutCountdown(now) {
  const next = Math.ceil(now / FUNDING_EPOCH_MS) * FUNDING_EPOCH_MS;
  const total = Math.max(0, Math.floor((next - now) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
