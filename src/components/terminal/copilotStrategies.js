/** AI Copilot strategy lens — named catalog (3 lenses). */
const COPILOT_STRATEGY_CATALOG = {
  "momentum-based": {
    id: "momentum-based",
    name: "Momentum Based",
    shortLabel: "Momentum Based",
    description:
      "Continuation on accelerating price and volume in the direction of the move.",
    risk: "High",
    timeframe: "5m – 1h",
    bestFor: "High-volume expansion and directional continuation.",
  },
  "high-conviction": {
    id: "high-conviction",
    name: "High Conviction (Default)",
    shortLabel: "High Conviction",
    description:
      "Strict risk filters, only top-conviction setups make the list.",
    risk: "Medium",
    timeframe: "15m – 4h",
    bestFor: "Filtered setups with strong signal quality.",
    isDefault: true,
  },
  "v3-risk-engine": {
    id: "v3-risk-engine",
    name: "V3 prompt with risk engine",
    shortLabel: "V3 prompt with risk engine",
    description: "V3 prompt with risk engine.",
    risk: "Medium",
    timeframe: "1h – 1D",
    bestFor: "Prompt-driven setups with automated risk controls.",
  },
};

const COPILOT_STRATEGY_IDS = [
  "momentum-based",
  "high-conviction",
  "v3-risk-engine",
];

/** Inline segment slots before the "+N more" overflow control. */
export const COPILOT_STRATEGY_VISIBLE_LIMIT = 4;

/** Fewer inline slots on mobile — keeps touch targets and the details control on-screen. */
export const COPILOT_STRATEGY_MOBILE_VISIBLE_LIMIT = 3;

export const DEFAULT_COPILOT_STRATEGY_ID = "high-conviction";

export const COPILOT_STRATEGIES = COPILOT_STRATEGY_IDS.map(
  (id) => COPILOT_STRATEGY_CATALOG[id],
).filter(Boolean);

export function getCopilotStrategyById(id) {
  return COPILOT_STRATEGY_CATALOG[id] ?? null;
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
