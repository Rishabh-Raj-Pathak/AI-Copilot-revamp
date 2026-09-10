import {
  Binoculars,
  Contrast,
  Gem,
  Globe,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ThemeOption =
  | "Top Picks"
  | "Bluechip"
  | "Stocks"
  | "Commodities"
  | "Meme"
  | "FX";

/**
 * Categories carry no live funding/APY readout the way a token pair does, so each one
 * is described instead — the description is what the user picks on. The icon is the
 * same mark used on the category chips and inside the token picker's filter row, so a
 * category reads the same in both places.
 */
export const THEME_CATALOG: {
  value: ThemeOption;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "Top Picks",
    description: "Best traded tokens globally, based on funding rate and APY.",
    icon: Trophy,
  },
  {
    value: "Bluechip",
    description:
      "Large, established tokens with the highest market cap and liquidity.",
    icon: Gem,
  },
  {
    value: "Stocks",
    description:
      "Perpetual markets tracking real-world stock prices, like NVDA and TSLA.",
    icon: Binoculars,
  },
  {
    value: "Commodities",
    description: "Tokenized real-world commodities like gold, oil, and silver.",
    icon: Contrast,
  },
  {
    value: "Meme",
    description: "High-volatility tokens driven by community and social trends.",
    icon: Zap,
  },
  {
    value: "FX",
    description: "Tokenized foreign exchange pairs, like USD, EUR, and JPY.",
    icon: Globe,
  },
];

export const THEME_ICONS: Record<ThemeOption, LucideIcon> = THEME_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.value] = entry.icon;
    return acc;
  },
  {} as Record<ThemeOption, LucideIcon>,
);

export type TokenOption = string;

/**
 * Which books a pair actually trades on. Synthetic markets — stocks, commodities and
 * FX — only exist as perpetuals, so a pair carries its instrument types rather than
 * being listed twice.
 */
export type InstrumentType = "Spot" | "Perp";

/**
 * How the vault's two legs pair up. Perp <> Perp arbs funding between two perp
 * venues; Spot <> Perp is the classic cash-and-carry, so it only works on a pair
 * that actually has a spot book behind it.
 */
export type LegStructure = "Perp <> Perp" | "Spot <> Perp";

export const LEG_STRUCTURES: LegStructure[] = ["Perp <> Perp", "Spot <> Perp"];

/**
 * The structure is not picked directly — it falls out of the instrument chosen on
 * each leg. Spot on either side makes it cash-and-carry; two perps make it a funding
 * arb. Spot on both sides is not a delta-neutral vault at all (nothing is short, so
 * there is no funding to collect and no hedge), which is why the leg toggles refuse
 * that combination rather than this function having a third case to return.
 */
export function legStructureFor(
  a: InstrumentType,
  b: InstrumentType,
): LegStructure {
  return a === "Spot" || b === "Spot" ? "Spot <> Perp" : "Perp <> Perp";
}

function supportsStructure(
  instruments: InstrumentType[],
  structure: LegStructure,
) {
  return structure === "Spot <> Perp"
    ? instruments.includes("Spot") && instruments.includes("Perp")
    : instruments.includes("Perp");
}

/**
 * Every tradable pair, tagged with the categories it belongs to and the instrument
 * types it trades as. The token picker's instrument toggle and filter chips read
 * straight off these tags, so a pair only has to be listed once.
 */
export const TOKEN_CATALOG: {
  value: TokenOption;
  themes: ThemeOption[];
  instruments: InstrumentType[];
}[] = [
  { value: "ARB-USDC", themes: ["Top Picks"], instruments: ["Spot", "Perp"] },
  { value: "ZK-USDC", themes: ["Top Picks"], instruments: ["Spot", "Perp"] },
  { value: "KPEPE-USDC", themes: ["Top Picks", "Meme"], instruments: ["Perp"] },
  { value: "NVDA-USDC", themes: ["Top Picks", "Stocks"], instruments: ["Perp"] },
  {
    value: "NATGAS-USDC",
    themes: ["Top Picks", "Commodities"],
    instruments: ["Perp"],
  },
  { value: "BTC-USDC", themes: ["Bluechip"], instruments: ["Spot", "Perp"] },
  { value: "ETH-USDC", themes: ["Bluechip"], instruments: ["Spot", "Perp"] },
  { value: "SOL-USDC", themes: ["Bluechip"], instruments: ["Spot", "Perp"] },
  {
    value: "HYPE-USDC",
    themes: ["Top Picks", "Bluechip"],
    instruments: ["Spot", "Perp"],
  },
  { value: "BNB-USDC", themes: ["Bluechip"], instruments: ["Spot", "Perp"] },
  { value: "XRP-USDC", themes: ["Bluechip"], instruments: ["Spot", "Perp"] },
  { value: "TSLA-USDC", themes: ["Stocks"], instruments: ["Perp"] },
  { value: "AAPL-USDC", themes: ["Stocks"], instruments: ["Perp"] },
  { value: "MSTR-USDC", themes: ["Stocks"], instruments: ["Perp"] },
  { value: "XAU-USDC", themes: ["Commodities"], instruments: ["Perp"] },
  { value: "XAG-USDC", themes: ["Commodities"], instruments: ["Perp"] },
  { value: "WTI-USDC", themes: ["Commodities"], instruments: ["Perp"] },
  { value: "DOGE-USDC", themes: ["Meme"], instruments: ["Spot", "Perp"] },
  { value: "WIF-USDC", themes: ["Meme"], instruments: ["Spot", "Perp"] },
  { value: "BONK-USDC", themes: ["Meme"], instruments: ["Spot", "Perp"] },
  { value: "EUR-USDC", themes: ["FX"], instruments: ["Perp"] },
  { value: "JPY-USDC", themes: ["FX"], instruments: ["Perp"] },
  { value: "GBP-USDC", themes: ["FX"], instruments: ["Perp"] },
];

export const TOKEN_OPTIONS: TokenOption[] = TOKEN_CATALOG.map((t) => t.value);

/** Filter row inside the token picker — "All Tokens" plus every category. */
export type TokenFilter = "All Tokens" | ThemeOption;

export const TOKEN_FILTERS: TokenFilter[] = [
  "All Tokens",
  ...THEME_CATALOG.map((t) => t.value),
];

/**
 * Whether a pair can still be traded under a structure. Flipping a leg to spot can
 * strand a perp-only selection (stocks, commodities, FX), so the caller checks this
 * before keeping the current token.
 */
export function tokenSupportsStructure(
  token: TokenOption,
  structure: LegStructure,
): boolean {
  const entry = TOKEN_CATALOG.find((t) => t.value === token);
  return entry ? supportsStructure(entry.instruments, structure) : false;
}

export function filterTokens(
  query: string,
  filter: TokenFilter,
  structure?: LegStructure,
) {
  const q = query.trim().toUpperCase();
  return TOKEN_CATALOG.filter((token) => {
    if (structure && !supportsStructure(token.instruments, structure)) return false;
    if (filter !== "All Tokens" && !token.themes.includes(filter)) return false;
    if (q !== "" && !token.value.toUpperCase().includes(q)) return false;
    return true;
  });
}

/**
 * Asset-level economics — the half of the cost model that belongs to the market
 * rather than the venue.
 *
 * Depth and yield are properties of the book and the coin, not of the exchange:
 * WIF is thin everywhere and ETH pays staking wherever you hold it. Keeping them
 * here rather than on `DexProfile` avoids a venue x pair table, which is 92 rows
 * of invented numbers to maintain. If per-venue depth is ever needed, multiply
 * these by a venue depth factor rather than duplicating the table.
 */
export type MarketProfile = {
  token: TokenOption;
  /** Reference price, used to turn a liquidation distance into a liquidation price. */
  markPriceUsd: number;
  /**
   * (perp − spot) / spot at entry, percent. A cash-and-carry entered at a premium
   * banks this once when the two converge; it is not a rate and is never annualised
   * into the APR. Zero on perp-only markets, which have no spot to be a basis against.
   */
  basisPct: number;
  /** Staking or lending yield on the held coin. Only earned on a Spot <> Perp long leg. */
  spotYieldAprPct: number;
  /**
   * Linear depth model: `impactPct = bpsPerMillion * (notionalUsd / 1e6) / 100`.
   *
   * One parameter rather than a full curve. It buys the property that actually
   * matters — impact grows with size, so break-even moves when the user changes the
   * amount — and swaps for a real book walk behind an unchanged signature.
   */
  perpImpactBpsPerMillion: number;
  /** `null` on a perp-only market. */
  spotImpactBpsPerMillion: number | null;
};

const MARKET_PROFILES: Record<string, Omit<MarketProfile, "token">> = {
  "BTC-USDC": { markPriceUsd: 108000, basisPct: 0.04, spotYieldAprPct: 0, perpImpactBpsPerMillion: 18, spotImpactBpsPerMillion: 26 },
  "ETH-USDC": { markPriceUsd: 3900, basisPct: 0.05, spotYieldAprPct: 2.8, perpImpactBpsPerMillion: 22, spotImpactBpsPerMillion: 32 },
  "SOL-USDC": { markPriceUsd: 185, basisPct: 0.06, spotYieldAprPct: 6.2, perpImpactBpsPerMillion: 34, spotImpactBpsPerMillion: 48 },
  "HYPE-USDC": { markPriceUsd: 38, basisPct: 0.09, spotYieldAprPct: 2.1, perpImpactBpsPerMillion: 55, spotImpactBpsPerMillion: 80 },
  "BNB-USDC": { markPriceUsd: 940, basisPct: 0.03, spotYieldAprPct: 0.8, perpImpactBpsPerMillion: 40, spotImpactBpsPerMillion: 60 },
  "XRP-USDC": { markPriceUsd: 2.4, basisPct: 0.05, spotYieldAprPct: 0, perpImpactBpsPerMillion: 45, spotImpactBpsPerMillion: 70 },
  "ARB-USDC": { markPriceUsd: 0.42, basisPct: 0.08, spotYieldAprPct: 0, perpImpactBpsPerMillion: 90, spotImpactBpsPerMillion: 140 },
  "ZK-USDC": { markPriceUsd: 0.06, basisPct: 0.11, spotYieldAprPct: 0, perpImpactBpsPerMillion: 130, spotImpactBpsPerMillion: 210 },
  "DOGE-USDC": { markPriceUsd: 0.19, basisPct: 0.07, spotYieldAprPct: 0, perpImpactBpsPerMillion: 60, spotImpactBpsPerMillion: 95 },
  "WIF-USDC": { markPriceUsd: 0.85, basisPct: 0.12, spotYieldAprPct: 0, perpImpactBpsPerMillion: 150, spotImpactBpsPerMillion: 240 },
  "BONK-USDC": { markPriceUsd: 0.000019, basisPct: 0.14, spotYieldAprPct: 0, perpImpactBpsPerMillion: 170, spotImpactBpsPerMillion: 260 },

  /* Perp-only from here — no spot book, so no basis, no spot yield, no spot depth. */
  "KPEPE-USDC": { markPriceUsd: 0.0105, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 145, spotImpactBpsPerMillion: null },
  "NVDA-USDC": { markPriceUsd: 178, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 70, spotImpactBpsPerMillion: null },
  "TSLA-USDC": { markPriceUsd: 415, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 85, spotImpactBpsPerMillion: null },
  "AAPL-USDC": { markPriceUsd: 245, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 75, spotImpactBpsPerMillion: null },
  "MSTR-USDC": { markPriceUsd: 330, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 120, spotImpactBpsPerMillion: null },
  "XAU-USDC": { markPriceUsd: 2650, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 45, spotImpactBpsPerMillion: null },
  "XAG-USDC": { markPriceUsd: 31, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 90, spotImpactBpsPerMillion: null },
  "WTI-USDC": { markPriceUsd: 71, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 110, spotImpactBpsPerMillion: null },
  "NATGAS-USDC": { markPriceUsd: 3.1, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 160, spotImpactBpsPerMillion: null },
  "EUR-USDC": { markPriceUsd: 1.08, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 25, spotImpactBpsPerMillion: null },
  "JPY-USDC": { markPriceUsd: 0.0065, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 30, spotImpactBpsPerMillion: null },
  "GBP-USDC": { markPriceUsd: 1.27, basisPct: 0, spotYieldAprPct: 0, perpImpactBpsPerMillion: 35, spotImpactBpsPerMillion: null },
};

/*
 * A mid-liquidity alt. Deliberately not the best case: an unlisted pair should not
 * quote a tighter book than the majors that are listed.
 */
const FALLBACK_MARKET: Omit<MarketProfile, "token"> = {
  markPriceUsd: 1,
  basisPct: 0.05,
  spotYieldAprPct: 0,
  perpImpactBpsPerMillion: 100,
  spotImpactBpsPerMillion: 150,
};

export function marketProfileFor(token: TokenOption): MarketProfile {
  return { token, ...(MARKET_PROFILES[token] ?? FALLBACK_MARKET) };
}
