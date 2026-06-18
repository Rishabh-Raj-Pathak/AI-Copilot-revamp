import { VAULT_STRATEGY_CATALOG } from "../vaults/vaultStrategiesData.js";

const STRATEGY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** AI Copilot strategy lens — ordered catalog; first four show inline, rest in "+N more". */
const COPILOT_STRATEGY_IDS = [
  "mean-reversion",
  "momentum-breakout",
  "trend-following",
  "funding-capture",
  "grid",
  "scalping",
  "delta-neutral",
];

/** Inline segment slots before the "+N more" overflow control. */
export const COPILOT_STRATEGY_VISIBLE_LIMIT = 4;

/** Fewer inline slots on mobile — keeps touch targets and the details control on-screen. */
export const COPILOT_STRATEGY_MOBILE_VISIBLE_LIMIT = 3;

export const DEFAULT_COPILOT_STRATEGY_ID = "mean-reversion";

/** Copilot-facing copy — dummy placeholder text per strategy lens. */
const COPILOT_STRATEGY_COPY = {
  "mean-reversion": {
    tagline: "Fade stretched moves, catch the snap-back.",
    description:
      "Scans perp markets for prices that have moved too far from fair value. When momentum cools, Copilot surfaces mean-reversion setups with defined entry, stop, and target levels.",
    bestFor: "Ranging markets, post-spike pullbacks, and calm funding.",
  },
  "momentum-breakout": {
    tagline: "Trade the break when volume confirms.",
    description:
      "Looks for clean breaks above resistance or below support with rising volume and open interest. Setups target continuation moves rather than quick fades.",
    bestFor: "High-volume expansion phases and key level breaks.",
  },
  "trend-following": {
    tagline: "Ride the move when structure aligns.",
    description:
      "Filters for assets in clear uptrends or downtrends, then suggests entries on pullbacks that respect higher lows or lower highs. Stops sit behind recent structure.",
    bestFor: "Directional markets with clean swing structure.",
  },
  "funding-capture": {
    tagline: "Earn carry when funding pays you to hold.",
    description:
      "Finds perp pairs where funding rates favor holding the suggested side. Positions are sized for carry income with tight risk controls around basis shifts.",
    bestFor: "Persistent positive or negative funding regimes.",
  },
  grid: {
    tagline: "Profit from sideways chop inside a range.",
    description:
      "Maps a bounded price band and layers staggered entries to capture oscillation. Works when volatility is moderate and price keeps revisiting the same zone.",
    bestFor: "Sideways, range-bound sessions on liquid pairs.",
  },
  scalping: {
    tagline: "Quick in-and-out edges on liquid tape.",
    description:
      "Targets short-hold opportunities on BTC, ETH, and top alts when spread is tight and book depth is strong. Emphasizes fast execution and tight stop discipline.",
    bestFor: "Fast markets with deep liquidity and tight spreads.",
  },
  "delta-neutral": {
    tagline: "Hedge direction, keep the carry.",
    description:
      "Pairs spot and perp legs to minimize net delta while harvesting basis, funding, or fee rebates. Suited when you want market exposure without picking direction.",
    bestFor: "Basis trades and low-volatility carry environments.",
  },
};

function withCopilotLetterLabel(strategy, index) {
  const letter = STRATEGY_LETTERS[index] ?? String(index + 1);
  const label = `Strategy ${letter}`;
  const copy = COPILOT_STRATEGY_COPY[strategy.id] ?? {};
  return {
    ...strategy,
    ...copy,
    letter,
    catalogName: strategy.name,
    name: label,
    shortLabel: label,
  };
}

export const COPILOT_STRATEGIES = COPILOT_STRATEGY_IDS.map((id, index) => {
  const base = VAULT_STRATEGY_CATALOG[id];
  return base ? withCopilotLetterLabel(base, index) : null;
}).filter(Boolean);

export function getCopilotStrategyById(id) {
  const index = COPILOT_STRATEGY_IDS.indexOf(id);
  const base = VAULT_STRATEGY_CATALOG[id];
  if (!base) return null;
  if (index < 0) return base;
  return withCopilotLetterLabel(base, index);
}

/**
 * Which strategies appear as inline segments vs overflow menu.
 * Keeps the selected strategy visible when it lives past the visible limit.
 */
export function resolveCopilotSegmentStrategies(
  strategies,
  selectedId,
  limit = COPILOT_STRATEGY_VISIBLE_LIMIT,
) {
  if (!strategies?.length || strategies.length <= limit) {
    return { visible: strategies ?? [], overflow: [] };
  }

  const selectedIndex = strategies.findIndex((s) => s.id === selectedId);
  const primary = strategies.slice(0, limit);

  if (selectedIndex < 0 || selectedIndex < limit) {
    return {
      visible: primary,
      overflow: strategies.slice(limit),
    };
  }

  const selected = strategies[selectedIndex];
  const visible = [...strategies.slice(0, limit - 1), selected];
  const visibleIds = new Set(visible.map((s) => s.id));
  const overflow = strategies.filter((s) => !visibleIds.has(s.id));

  return { visible, overflow };
}

const STRATEGY_DETAILS_INTRO_KEY = "hyper-earn.copilot.strategyDetailsIntro";

export function getInitialCopilotStrategyDetailsOpen() {
  try {
    return sessionStorage.getItem(STRATEGY_DETAILS_INTRO_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markCopilotStrategyDetailsIntroSeen() {
  try {
    sessionStorage.setItem(STRATEGY_DETAILS_INTRO_KEY, "1");
  } catch {
    /* ignore */
  }
}
