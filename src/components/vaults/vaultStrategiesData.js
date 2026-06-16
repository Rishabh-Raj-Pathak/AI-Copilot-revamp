/** Strategy catalog — each vault picks a subset via `strategyIds`. */
export const VAULT_STRATEGY_CATALOG = {
  "mean-reversion": {
    id: "mean-reversion",
    name: "Mean Reversion",
    shortLabel: "Mean Rev",
    description:
      "Buys dips and sells rips when price stretches too far from fair value, then snaps back.",
    risk: "Medium",
    timeframe: "15m – 4h",
    bestFor: "Ranging markets and pullbacks near support.",
  },
  "trend-following": {
    id: "trend-following",
    name: "Trend Following",
    shortLabel: "Trend",
    description:
      "Rides established direction — only enters when momentum and structure align with the trend.",
    risk: "Medium",
    timeframe: "1h – 1D",
    bestFor: "Clean directional markets with higher highs or lower lows.",
  },
  "funding-capture": {
    id: "funding-capture",
    name: "Funding Capture",
    shortLabel: "Funding",
    description:
      "Harvests positive funding and carry when perp rates favor holding the position.",
    risk: "Low",
    timeframe: "4h – 7D",
    bestFor: "Perp markets with persistent funding imbalance.",
  },
  "momentum-breakout": {
    id: "momentum-breakout",
    name: "Momentum Breakout",
    shortLabel: "Breakout",
    description:
      "Enters when price clears key levels with volume — targets continuation, not reversal.",
    risk: "High",
    timeframe: "5m – 1h",
    bestFor: "High-volume breakout and expansion phases.",
  },
  "grid": {
    id: "grid",
    name: "Grid",
    shortLabel: "Grid",
    description:
      "Layers buy and sell orders inside a defined range to profit from sideways chop.",
    risk: "Medium",
    timeframe: "15m – 4h",
    bestFor: "Sideways, bounded price action.",
  },
  "scalping": {
    id: "scalping",
    name: "Scalping",
    shortLabel: "Scalp",
    description:
      "Short-hold trades on liquid pairs — small edges, tight stops, high turnover.",
    risk: "High",
    timeframe: "1m – 15m",
    bestFor: "Deep liquidity and fast-moving tape.",
  },
  "conservative-dca": {
    id: "conservative-dca",
    name: "Conservative DCA",
    shortLabel: "DCA",
    description:
      "Steady accumulation on schedule with risk caps — prioritizes capital preservation.",
    risk: "Low",
    timeframe: "1D – 1W",
    bestFor: "Long-horizon blue-chip exposure with low turnover.",
  },
  "delta-neutral": {
    id: "delta-neutral",
    name: "Delta Neutral",
    shortLabel: "Delta N",
    description:
      "Hedges directional exposure to earn basis, funding, or fees with minimal net delta.",
    risk: "Low",
    timeframe: "4h – 3D",
    bestFor: "Carry and basis trades across spot and perp.",
  },
};

const STRATEGY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const VAULT_STRATEGY_SETS = {
  bluechip: [
    "conservative-dca",
    "mean-reversion",
    "trend-following",
    "funding-capture",
  ],
  hip3: ["momentum-breakout", "funding-capture", "scalping", "grid"],
  trending: [
    "momentum-breakout",
    "scalping",
    "mean-reversion",
    "trend-following",
  ],
  balanced: [
    "mean-reversion",
    "trend-following",
    "funding-capture",
    "grid",
  ],
  conservative: [
    "conservative-dca",
    "funding-capture",
    "delta-neutral",
    "mean-reversion",
  ],
};

export function resolveVaultStrategies(vault) {
  const setKey = vault.strategySet ?? "balanced";
  const ids = vault.strategyIds ?? VAULT_STRATEGY_SETS[setKey] ?? VAULT_STRATEGY_SETS.balanced;
  return ids
    .map((id, index) => {
      const strategy = VAULT_STRATEGY_CATALOG[id];
      if (!strategy) return null;
      const letter = STRATEGY_LETTERS[index] ?? String(index + 1);
      return {
        ...strategy,
        name: `Strategy ${letter}`,
        shortLabel: `Strategy ${letter}`,
      };
    })
    .filter(Boolean);
}

export function getStrategyById(id) {
  return VAULT_STRATEGY_CATALOG[id] ?? null;
}
