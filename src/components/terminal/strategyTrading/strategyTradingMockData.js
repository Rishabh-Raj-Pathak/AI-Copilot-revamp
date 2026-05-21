/** Mock AI models for Strategy Trading (integration-ready). */
export const STRATEGY_MODELS = [
  {
    id: "conservative",
    name: "Conservative",
    description:
      "Prioritizes lower drawdown, confirmation, and capital protection.",
    bestFor: ["Low-risk setups", "Manual approval", "Cleaner invalidation"],
    riskTone: "Low",
    exampleBehavior:
      "Avoids entering trades when risk/reward is unclear or volatility is too high.",
  },
  {
    id: "aggressive",
    name: "Aggressive",
    description: "Looks for high-momentum, higher-risk opportunities.",
    bestFor: ["Breakouts", "Fast entries", "Momentum trades"],
    riskTone: "High",
    exampleBehavior:
      "Suggests earlier entries but clearly highlights risk.",
  },
  {
    id: "quant",
    name: "Quant",
    description: "Turns ideas into rule-based strategy logic.",
    bestFor: ["Indicators", "Backtest logic", "Systematic entries"],
    riskTone: "Medium",
    exampleBehavior:
      "Converts user prompts into rule-based entry and exit conditions.",
  },
  {
    id: "funding",
    name: "Funding",
    description:
      "Focuses on perp funding, carry, and cross-DEX opportunities.",
    bestFor: ["Funding capture", "DEX comparison", "Carry trades"],
    riskTone: "Medium",
    exampleBehavior:
      "Finds opportunities where funding, fees, and liquidity create an edge.",
  },
  {
    id: "sentiment",
    name: "Sentiment",
    description:
      "Uses narratives, market mood, and social/news momentum.",
    bestFor: ["Narrative trades", "Market mood", "Event-driven moves"],
    riskTone: "Medium",
    exampleBehavior: "Warns when hype is already priced in.",
  },
  {
    id: "custom",
    name: "Custom",
    description: "User-defined behavior using prompts and personal rules.",
    bestFor: ["Personalized strategies", "Unique trading styles"],
    riskTone: "Custom",
    exampleBehavior: "Follows user-created instructions.",
  },
];

/** Mock strategy templates. */
export const STRATEGY_TYPES = [
  {
    id: "mean-reversion",
    name: "Mean Reversion",
    description: "Looks for overextended moves that may reverse.",
    bestMarket: "Ranging markets or pullbacks near support.",
    timeframe: "15m - 4h",
    risk: "Medium",
    example:
      "Long BTC when price is oversold near support and momentum starts recovering.",
  },
  {
    id: "momentum-breakout",
    name: "Momentum Breakout",
    description: "Looks for continuation after price breaks important levels.",
    bestMarket: "High-volume breakout markets.",
    timeframe: "5m - 1h",
    risk: "High",
    example:
      "Long SOL after it breaks resistance with rising volume and open interest.",
  },
  {
    id: "trend-following",
    name: "Trend Following",
    description: "Trades in the direction of the broader trend.",
    bestMarket: "Clean directional markets.",
    timeframe: "1h - 1D",
    risk: "Medium",
    example:
      "Only look for long setups when BTC is above major moving averages.",
  },
  {
    id: "funding-capture",
    name: "Funding Capture",
    description:
      "Uses perp funding and DEX differences to find opportunities.",
    bestMarket: "Perp markets with funding imbalance.",
    timeframe: "1D - 7D",
    risk: "Medium",
    example:
      "Monitor ETH funding across DEXes and identify favorable carry setups.",
  },
  {
    id: "grid",
    name: "Grid Strategy",
    description: "Places repeated buy/sell zones inside a range.",
    bestMarket: "Sideways markets.",
    timeframe: "15m - 4h",
    risk: "Medium",
    example:
      "Trade ETH between a defined range with controlled position sizing.",
  },
  {
    id: "scalping",
    name: "Scalping",
    description: "Short-term setups focused on quick entries and exits.",
    bestMarket: "Liquid fast-moving markets.",
    timeframe: "1m - 15m",
    risk: "High",
    example:
      "Take quick BTC trades when momentum confirms on lower timeframe.",
  },
  {
    id: "swing",
    name: "Swing Strategy",
    description: "Captures larger moves over multiple days.",
    bestMarket: "Higher-timeframe trend setups.",
    timeframe: "4h - 1D",
    risk: "Medium",
    example:
      "Hold an ETH long while higher timeframe trend stays valid.",
  },
  {
    id: "custom",
    name: "Custom Prompt",
    description: "Define strategy behavior in plain English.",
    bestMarket: "Any market.",
    timeframe: "Custom",
    risk: "Custom",
    example:
      "Build a strategy that avoids trading during high volatility and only enters when funding is favorable.",
  },
];

export const MARKET_OPTIONS = [
  { id: "btc", label: "BTC" },
  { id: "eth", label: "ETH" },
  { id: "sol", label: "SOL" },
  { id: "hype", label: "HYPE" },
  { id: "custom", label: "Custom" },
];

export const DEX_OPTIONS = [
  "Hyperliquid",
  "Avantis",
  "Paradex",
  "Pacifica",
  "Nado",
  "Custom",
];

export const DEFAULT_PREFERENCES = {
  riskPreference: "balanced",
  preferredMarkets: ["btc"],
  preferredDexes: ["Hyperliquid"],
  maxLeverage: "3x",
  tradeStyle: "intraday",
  executionPreference: "manual-approval",
  explanationStyle: "detailed",
};

export const QUICK_PROMPTS = [
  "Find low-risk BTC setup",
  "Compare ETH funding",
  "Build breakout strategy",
  "Monitor SOL momentum",
  "Review my risk",
  "Create custom agent",
];

export const EMPTY_STATE_ACTIONS = [
  {
    id: "find-idea",
    title: "Find a trade idea",
    description:
      "Get a structured long/short setup with entry, invalidation, and risk summary.",
    prompt: "Find me a structured trade setup with clear entry and risk.",
  },
  {
    id: "build-strategy",
    title: "Build a strategy",
    description:
      "Turn your trading idea into clear entry and exit rules.",
    prompt: "Build a strategy with clear entry and exit rules.",
  },
  {
    id: "create-agent",
    title: "Create an agent",
    description:
      "Monitor a market condition and notify when it becomes valid.",
    prompt: "Create a watcher for a market condition I describe.",
  },
  {
    id: "compare",
    title: "Compare opportunities",
    description:
      "Compare funding, momentum, or risk across supported DEXes.",
    prompt: "Compare funding and momentum across my preferred DEXes.",
  },
];

export const INITIAL_AGENTS = [
  {
    id: "agent-btc-reversion",
    name: "BTC Mean Reversion Watcher",
    status: "Watching",
    market: "BTC-PERP",
    model: "Conservative",
    strategy: "Mean Reversion",
    condition:
      "Notify when BTC enters the entry zone and RSI starts recovering.",
    riskRule: "Skip if volatility spikes or funding becomes unfavorable.",
    expiry: "4 hours",
    lastChecked: "Just now",
    memoryRules: [
      "Only suggest low-risk trades",
      "Avoid high volatility",
      "Use max 3x leverage",
      "Confirm with volume",
      "Skip if funding is unfavorable",
    ],
    updateLog: [],
  },
];

export const SAMPLE_SETUP = {
  title: "BTC Mean Reversion Setup",
  direction: "Long",
  market: "BTC-PERP",
  preferredDex: "Hyperliquid",
  model: "Conservative",
  strategy: "Mean Reversion",
  timeframe: "15m",
  entryZone: "$67,850 - $68,120",
  stopLoss: "$67,420",
  takeProfit: "$69,250",
  riskReward: "1 : 2.4",
  confidence: "Medium",
  riskLevel: "Low-Medium",
  reasoning: [
    "BTC is approaching a local support zone after a fast selloff.",
    "Momentum is slowing, but confirmation is not complete yet.",
    "Because the selected model is Conservative, entry should wait for reclaim confirmation.",
  ],
  waitFor: [
    "Price reclaim above the entry zone",
    "RSI recovery from oversold level",
    "No sudden funding spike",
  ],
  warnings: [
    "Avoid entry if volatility expands aggressively.",
    "Setup becomes invalid if price closes below stop zone.",
  ],
  nextActions: [
    "Wait for confirmation before entry",
    "Set alerts at entry zone boundaries",
    "Review funding before sizing",
  ],
};
