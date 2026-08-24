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
