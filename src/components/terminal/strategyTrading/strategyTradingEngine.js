import {
  SAMPLE_SETUP,
  STRATEGY_MODELS,
  STRATEGY_TYPES,
} from "./strategyTradingMockData.js";

const MARKET_SYMBOL = {
  btc: "BTC",
  eth: "ETH",
  sol: "SOL",
  hype: "HYPE",
  custom: "BTC",
};

const DIRECTION_BY_MODEL = {
  conservative: "Long",
  aggressive: "Long",
  quant: "Long",
  funding: "Neutral",
  sentiment: "Long",
  custom: "Long",
};

function riskLevelFromPrefs(prefs, strategyRisk) {
  if (prefs.riskPreference === "low") return "Low";
  if (prefs.riskPreference === "high") return strategyRisk === "High" ? "High" : "Medium-High";
  return strategyRisk === "High" ? "Medium-High" : "Medium";
}

function confidenceFromModel(modelId, prefs) {
  if (prefs.riskPreference === "low" || modelId === "conservative") return "Medium";
  if (modelId === "aggressive") return "Medium";
  return "Medium";
}

/**
 * Mock structured setup generation from prompt + selections.
 * @param {object} params
 */
export function generateStrategySetup({
  prompt,
  modelId,
  strategyId,
  marketId,
  preferences,
  terminalPlatform,
}) {
  const model = STRATEGY_MODELS.find((m) => m.id === modelId) ?? STRATEGY_MODELS[0];
  const strategy =
    STRATEGY_TYPES.find((s) => s.id === strategyId) ?? STRATEGY_TYPES[0];
  const symbol = MARKET_SYMBOL[marketId] ?? "BTC";
  const dex =
    preferences.preferredDexes?.[0] ??
    (terminalPlatform === "hyperliquid" ? "Hyperliquid" : "Hyperliquid");

  const riskLevel = riskLevelFromPrefs(preferences, strategy.risk);
  const confidence = confidenceFromModel(modelId, preferences);

  const personalizationNotes = [];
  if (preferences.riskPreference === "low") {
    personalizationNotes.push(
      "Since your risk profile is low, Hyprearn suggests waiting for confirmation instead of entering immediately.",
    );
  }
  if (preferences.maxLeverage === "3x") {
    personalizationNotes.push(
      "Suggested leverage stays within your 3x max preference.",
    );
  }
  if (preferences.executionPreference === "explain-only") {
    personalizationNotes.push("This setup is for analysis only — no trade suggestion.");
  }

  const reasoning = [
    ...SAMPLE_SETUP.reasoning.slice(0, 2),
    `Strategy template: ${strategy.name} (${strategy.timeframe}).`,
    `Model lens: ${model.name} — ${model.description}`,
    ...personalizationNotes,
  ];

  if (modelId === "aggressive") {
    reasoning.push(
      "Aggressive model favors earlier entry; risk is highlighted explicitly.",
    );
  }
  if (modelId === "quant") {
    reasoning.push(
      "Quant model maps this to rule-based conditions (RSI, EMA reclaim, volume filter).",
    );
  }
  if (modelId === "funding") {
    reasoning.push(
      "Funding model weighs perp carry and cross-DEX fee differences in the thesis.",
    );
  }

  const title = `${symbol} ${strategy.name} Setup`;
  const direction = DIRECTION_BY_MODEL[modelId] ?? "Long";

  const personalizationNote = buildPersonalizationNote(preferences);

  const strategyLogic = [
    "Enter only if price reclaims the entry zone.",
    "Confirm with RSI recovery from oversold.",
    "Avoid entry if funding spikes or volatility expands.",
    "Invalidate if price closes below the stop zone.",
  ];

  const flowSteps = [
    {
      step: "Market condition",
      detail: `${symbol} near support after a fast selloff.`,
    },
    {
      step: "Entry trigger",
      detail: "RSI recovers + price reclaims entry zone.",
    },
    {
      step: "Risk filter",
      detail: "Skip if funding or volatility spikes.",
    },
    {
      step: "Exit rule",
      detail: `TP at ${SAMPLE_SETUP.takeProfit.replace("BTC", symbol)} or SL at ${SAMPLE_SETUP.stopLoss.replace("67", symbol === "ETH" ? "34" : "67")}.`,
    },
    {
      step: "Execution",
      detail:
        preferences.executionPreference === "manual-approval"
          ? "Manual approval required before any trade"
          : "Decision support only",
    },
  ];

  const whySetup = [
    `${symbol} is approaching local support after a fast selloff.`,
    "Selling momentum is slowing but confirmation is not complete.",
    `${model.name} model requires confirmation before entry.`,
  ];

  const riskConcerns = [
    "Price may continue trending down instead of mean reverting.",
    "Funding spike can make the trade less attractive.",
    "High volatility can invalidate the setup quickly.",
  ];

  return {
    title,
    direction,
    market: `${symbol}-PERP`,
    preferredDex: dex,
    model: model.name,
    strategy: strategy.name,
    timeframe: strategy.timeframe.split(" - ")[0] ?? "15m",
    entryZone: SAMPLE_SETUP.entryZone.replace("BTC", symbol),
    stopLoss: SAMPLE_SETUP.stopLoss.replace("67", symbol === "ETH" ? "34" : "67"),
    takeProfit: SAMPLE_SETUP.takeProfit.replace("69", symbol === "ETH" ? "36" : "69"),
    riskReward: SAMPLE_SETUP.riskReward,
    confidence,
    riskLevel,
    reasoning,
    whySetup,
    strategyLogic,
    flowSteps,
    waitFor: [...SAMPLE_SETUP.waitFor],
    warnings: riskConcerns,
    nextActions: [...SAMPLE_SETUP.nextActions],
    suggestedLeverage: `Max ${preferences.maxLeverage} based on preference`,
    personalizationNote,
    promptEcho: prompt,
    generatedAt: new Date().toISOString(),
  };
}

function buildPersonalizationNote(prefs) {
  const risk =
    prefs.riskPreference === "low"
      ? "low-risk"
      : prefs.riskPreference === "high"
        ? "higher-risk"
        : "balanced";
  const exec =
    prefs.executionPreference === "manual-approval"
      ? "manual approval"
      : prefs.executionPreference === "explain-only"
        ? "explain-only"
        : prefs.executionPreference.replace("-", " ");
  return `Adjusted for your ${risk} profile, max ${prefs.maxLeverage} leverage, and ${exec} preference.`;
}

/**
 * @param {object} setup
 * @param {object} prefs
 */
export function buildAgentFromSetup(setup, prefs, overrides = {}) {
  const id = `agent-${Date.now()}`;
  return {
    id,
    name: overrides.name ?? `${setup.market.split("-")[0]} ${setup.strategy} Watcher`,
    status: "Watching",
    market: setup.market,
    model: setup.model,
    strategy: setup.strategy,
    condition:
      overrides.condition ??
      `Watch ${setup.market} and notify when price enters the entry zone (${setup.entryZone}).`,
    riskRule:
      overrides.riskRule ??
      "Skip if volatility spikes or funding becomes unfavorable.",
    expiry: overrides.expiry ?? "4 hours",
    lastChecked: "Just now",
    memoryRules: [
      prefs.riskPreference === "low"
        ? "Only suggest low-risk trades"
        : "Respect user risk preference",
      "Avoid high volatility",
      `Use max ${prefs.maxLeverage} leverage`,
      "Confirm with volume",
      "Skip if funding is unfavorable",
    ],
    updateLog: [],
    recentlyUpdated: false,
  };
}
