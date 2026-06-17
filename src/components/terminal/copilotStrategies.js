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

export const DEFAULT_COPILOT_STRATEGY_ID = "mean-reversion";

function withCopilotLetterLabel(strategy, index) {
  const letter = STRATEGY_LETTERS[index] ?? String(index + 1);
  const label = `Strategy ${letter}`;
  return {
    ...strategy,
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
export function resolveCopilotSegmentStrategies(strategies, selectedId) {
  const limit = COPILOT_STRATEGY_VISIBLE_LIMIT;
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
