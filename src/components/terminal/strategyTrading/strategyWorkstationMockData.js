import { generateStrategySetup } from "./strategyTradingEngine.js";
import { DEFAULT_PREFERENCES } from "./strategyTradingMockData.js";

export const STRATEGY_STATUSES = [
  "Draft",
  "Backtested",
  "Paper Trading",
  "Ready",
  "Paused",
];

export const SIDEBAR_FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "backtested", label: "Backtested" },
  { id: "paper", label: "Paper" },
  { id: "ready", label: "Ready" },
];

export const WORKSPACE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "backtest", label: "Backtest" },
  { id: "paper", label: "Paper Trading" },
  { id: "positions", label: "Positions" },
  { id: "trades", label: "Trades" },
  { id: "logs", label: "Logs" },
];

export const CHAT_QUICK_ACTIONS = [
  "Build BTC mean reversion",
  "Make this safer",
  "Run backtest",
  "Start paper trading",
  "Explain strategy",
  "Review risk",
];

/** Frontend-only LLM picker (Strategy Copilot chat). */
export const CHAT_LLM_MODELS = [
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    tag: "Reasoning",
  },
  {
    id: "qwen",
    name: "Qwen",
    provider: "Alibaba",
    tag: "Fast",
  },
];

export const DEFAULT_CHAT_LLM_MODEL_ID = "deepseek";

export const MOCK_EQUITY_CURVE = {
  strategy: [
    { date: "2026-03-26", value: 10000 },
    { date: "2026-04-02", value: 10080 },
    { date: "2026-04-09", value: 9980 },
    { date: "2026-04-16", value: 10120 },
    { date: "2026-04-23", value: 10040 },
    { date: "2026-04-30", value: 10280 },
    { date: "2026-05-07", value: 10420 },
    { date: "2026-05-14", value: 10360 },
    { date: "2026-05-21", value: 10697 },
  ],
  buyAndHold: [
    { date: "2026-03-26", value: 10000 },
    { date: "2026-04-02", value: 9850 },
    { date: "2026-04-09", value: 9720 },
    { date: "2026-04-16", value: 10100 },
    { date: "2026-04-23", value: 10850 },
    { date: "2026-04-30", value: 11200 },
    { date: "2026-05-07", value: 11580 },
    { date: "2026-05-14", value: 11320 },
    { date: "2026-05-21", value: 11218 },
  ],
};

export const MOCK_BACKTEST = {
  totalReturn: "+6.97%",
  totalReturnRaw: 6.97,
  maxDrawdown: "-5.09%",
  winRate: "42.86%",
  winLoss: "3W / 4L",
  wins: 3,
  losses: 4,
  profitFactor: "2.35",
  sharpeRatio: "2.42",
  sortinoRatio: "2.30",
  calmarRatio: "8.25",
  buyAndHold: "+12.18%",
  trades: 7,
  largestWin: "+8.00%",
  largestLoss: "-2.50%",
  avgProfit: "+8.00%",
  avgLoss: "-2.50%",
  avgBars: "25.67",
  expectedPayoff: "$99.52",
  outperformance: "-5.21%",
  commission: "$23.99",
  maxConsecutiveWins: 1,
  maxConsecutiveLosses: 3,
  equityCurve: MOCK_EQUITY_CURVE,
  insights: [
    "Strict RSI + BB filters reduced trade frequency to 7 round trips.",
    "Losses stayed controlled relative to max drawdown.",
    "Strategy underperformed buy & hold in this bull window — review regime filters.",
    "Consider paper trading before any manual deployment review.",
  ],
};

export const DEFAULT_METRICS = {
  totalReturn: "—",
  maxDrawdown: "—",
  winRate: "—",
  profitFactor: "—",
  sharpeRatio: "—",
  trades: 0,
  paperPnl: "$0.00",
};

export const STRATEGY_CONFIG_DEFAULT = {
  bbLength: 30,
  rsiThreshold: 25,
  stopLoss: "2.5%",
  takeProfit: "8%",
  leverage: "3x",
  execution: "Manual approval",
};

export const PAPER_POSITION_BTC = {
  market: "BTCUSDT",
  side: "Long",
  entry: "$76,928",
  current: "$77,247",
  pnl: "+0.41%",
  stopLoss: "$75,005",
  takeProfit: "$83,082",
  timeInTrade: "42m",
  size: "0.12 BTC",
  status: "Monitoring",
};

const BTC_SNIPER_LOGIC = {
  description:
    "Precision dip-buying for BTC that fires when price wicks below the Bollinger lower band, RSI drops below 25, and price reclaims support without aggressive volatility expansion.",
  entryRules: [
    "Price wicks below Bollinger lower band (length 30)",
    "RSI drops below 25 (stricter oversold)",
    "Candle closes back above support zone",
    "Volume does not expand aggressively against entry",
  ],
  exitRules: [
    "Take profit at +8%",
    "Stop loss at -2.5%",
    "Exit early if RSI overheats or funding spikes",
  ],
  riskRules: [
    "Max leverage: 3x",
    "Manual approval required",
    "Skip trade during high volatility expansion",
  ],
};

function buildBtcSniperSetup(preferences) {
  const base = generateStrategySetup({
    prompt: "BTCUSDT 15m Bollinger mean reversion",
    modelId: "quant",
    strategyId: "mean-reversion",
    marketId: "btc",
    preferences,
    terminalPlatform: "hyperliquid",
  });
  return {
    ...base,
    title: "BTC Mean Reversion",
    market: "BTCUSDT",
    timeframe: "15m",
    model: "Quant",
    strategy: "Mean Reversion",
    strategyLogic: [
      ...BTC_SNIPER_LOGIC.entryRules.map((r) => `Entry: ${r}`),
      ...BTC_SNIPER_LOGIC.exitRules.map((r) => `Exit: ${r}`),
      ...BTC_SNIPER_LOGIC.riskRules.map((r) => `Risk: ${r}`),
    ],
    entryRules: BTC_SNIPER_LOGIC.entryRules,
    exitRules: BTC_SNIPER_LOGIC.exitRules,
    riskRules: BTC_SNIPER_LOGIC.riskRules,
    description: BTC_SNIPER_LOGIC.description,
    entryZone: "$76,850 – $77,100",
    stopLoss: "$75,005",
    takeProfit: "$83,082",
    currentPrice: "$77,247",
    dateRange: "Mar 22 – May 21, 2026",
    rangeStart: "2026-03-22",
    rangeEnd: "2026-05-21",
    leverage: "3x",
    config: { ...STRATEGY_CONFIG_DEFAULT },
    flowSteps: [
      { step: "Market", detail: "BTCUSDT 15m — mean reversion dip-buy" },
      { step: "Entry", detail: "BB lower wick + RSI < 25 + reclaim" },
      { step: "Risk", detail: "3x max · manual approval · vol filter" },
      { step: "Exit", detail: "TP +8% · SL -2.5% · funding/RSI exit" },
    ],
    aiNotes: [
      "Backtest estimate only — not a guarantee of future performance.",
      "Paper trading uses market-like simulation without real capital.",
    ],
    personalizationNote:
      "Adjusted for your balanced profile, max 3x leverage, and manual approval preference.",
  };
}

export const CHAT_EMPTY_EXAMPLES = [
  "Build a BTC 15m mean reversion strategy.",
  "Create an ETH funding capture setup.",
  "Make a safer SOL breakout strategy.",
  "Run a backtest on BTC Mean Reversion.",
];

/** Static phrase bank for client-side prompt autocomplete (prototype). */
export const PROMPT_SUGGESTIONS = [
  ...CHAT_EMPTY_EXAMPLES,
  "BTCUSDT 15m mean reversion with RSI oversold",
  "BTC Bollinger lower-band mean reversion entry",
  "ETH funding capture on 1h across preferred DEXes",
  "SOL momentum breakout with volume confirmation",
  "HYPE trend-following with rule-based entries on 1h",
  "RSI below 25 with BB lower wick reclaim",
  "Max leverage 3x with manual approval",
  "Paper trade before deployment review",
  "Run backtest estimate on this setup",
  "Make this strategy safer with tighter stops",
  "Bollinger Bands mean reversion",
  "Funding rate arbitrage",
  "Volume and open interest confirmation",
  "15m timeframe quantitative strategy",
  "Clear invalidation below support",
];

/**
 * @param {string} query
 * @param {number} [limit]
 * @returns {string[]}
 */
export function getPromptSuggestions(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const seen = new Set();
  const out = [];
  for (const phrase of PROMPT_SUGGESTIONS) {
    if (!phrase.toLowerCase().includes(q)) continue;
    const key = phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(phrase);
    if (out.length >= limit) break;
  }
  return out;
}

/** Draft-state chat shown in v2 mockup (user prompt + AI config only). */
export const DEMO_CHAT_BTC_SNIPER_DRAFT = [
  {
    id: "demo-u1",
    role: "user",
    text: "I want to create a BTCUSDT 15m quantitative mean reversion strategy using Bollinger lower-band and RSI filters.",
  },
  {
    id: "demo-a1",
    role: "assistant",
    text: "Got it. I created a draft strategy for BTCUSDT on the 15m timeframe using a lower Bollinger Band + RSI mean reversion setup. Before backtesting, here are the recommended configuration settings.",
    richCards: [{ type: "config", data: STRATEGY_CONFIG_DEFAULT }],
  },
];

export const DEMO_CHAT_BTC_SNIPER = [
  ...DEMO_CHAT_BTC_SNIPER_DRAFT,
  {
    id: "demo-u2",
    role: "user",
    text: "Run backtest on this.",
  },
  {
    id: "demo-a2",
    role: "assistant",
    text: "Backtest complete. The strategy returned +6.97% with -5.09% max drawdown, 42.86% win rate, 2.35 profit factor, and 2.42 Sharpe ratio.",
    richCards: [{ type: "backtest", data: MOCK_BACKTEST }],
  },
  {
    id: "demo-u3",
    role: "user",
    text: "Start paper trading.",
  },
  {
    id: "demo-a3",
    role: "assistant",
    text: "Paper trading simulation is ready. This will simulate the strategy using market-like data without risking real capital. Manual approval will still be required before any real deployment.",
    richCards: [
      {
        type: "paper-setup",
        data: {
          Market: "BTCUSDT",
          Timeframe: "15m",
          Mode: "Simulation",
          Risk: "Balanced",
          Execution: "Manual approval",
        },
      },
    ],
  },
];

const BTC_SNIPER_LOGS = [
  { id: "log-1", ago: "12m ago", message: "Strategy draft created" },
  { id: "log-2", ago: "10m ago", message: "RSI threshold set to 25" },
  { id: "log-3", ago: "8m ago", message: "Risk profile applied: Balanced" },
  { id: "log-4", ago: "6m ago", message: "Backtest completed" },
  { id: "log-5", ago: "4m ago", message: "Paper trading simulation available" },
];

const BTC_SNIPER_TRADES = [
  {
    id: "t-paper-1",
    at: "May 21",
    market: "BTCUSDT",
    direction: "Long",
    entry: "$76,928",
    exit: "$77,247",
    pnl: "+0.41%",
    reason: "Lower band reclaim",
  },
  {
    id: "t-bt-1",
    at: "May 18",
    market: "BTCUSDT",
    direction: "Long",
    entry: "$77,120",
    exit: "$75,005",
    pnl: "-2.50%",
    reason: "Stop loss hit",
  },
  {
    id: "t-bt-2",
    at: "May 15",
    market: "BTCUSDT",
    direction: "Long",
    entry: "$76,240",
    exit: "$82,339",
    pnl: "+8.00%",
    reason: "Take profit hit",
  },
];

function buildStrategyRecord({
  id,
  name,
  status,
  modelId,
  strategyId,
  marketId,
  prompt,
  marketLabel,
  performancePreview,
  backtestComplete = false,
  paperActive = false,
  ready = false,
  customSetup,
  chatMessages = [],
}) {
  const preferences = {
    ...DEFAULT_PREFERENCES,
    preferredDexes: ["Hyperliquid", "Avantis", "Paradex"],
  };
  const setup =
    customSetup ??
    generateStrategySetup({
      prompt,
      modelId,
      strategyId,
      marketId,
      preferences,
      terminalPlatform: "hyperliquid",
    });
  setup.title = name;

  const metrics = backtestComplete
    ? {
        ...MOCK_BACKTEST,
        trades: MOCK_BACKTEST.trades,
        paperPnl: paperActive ? "+0.41%" : "$0.00",
      }
    : { ...DEFAULT_METRICS };

  if (performancePreview && !backtestComplete) {
    metrics.totalReturn = performancePreview;
  }

  let resolvedStatus = status;
  if (ready) resolvedStatus = "Ready";
  else if (paperActive) resolvedStatus = "Paper Trading";
  else if (backtestComplete && status === "Draft") resolvedStatus = "Backtested";

  return {
    id,
    name,
    status: resolvedStatus,
    modelId,
    strategyId,
    marketId,
    market: marketLabel ?? setup.market,
    timeframe: setup.timeframe,
    model: setup.model,
    strategy: setup.strategy,
    strategyType: setup.strategy,
    lastUpdated: id === "strat-btc-sniper" ? "12m ago" : "2h ago",
    performancePreview: performancePreview ?? null,
    setup,
    metrics,
    config: setup.config ?? { ...STRATEGY_CONFIG_DEFAULT },
    backtest: {
      status: backtestComplete ? "complete" : "idle",
      results: backtestComplete ? MOCK_BACKTEST : null,
    },
    paperTrading: {
      status: paperActive ? "active" : "idle",
      balance: "$10,000",
      pnl: paperActive ? "+0.41%" : "$0.00",
      mode: "Paper simulation",
      position: paperActive ? PAPER_POSITION_BTC : null,
      events: paperActive
        ? [
            "Paper trading simulation started",
            "Long BTCUSDT — monitoring SL/TP",
            "Manual approval required before live deployment",
          ]
        : [],
    },
    logs:
      id === "strat-btc-sniper"
        ? BTC_SNIPER_LOGS.map((l) => ({ ...l, at: l.ago }))
        : [
            { id: `${id}-l1`, message: "Strategy draft created", at: "Just now" },
            ...(backtestComplete
              ? [{ id: `${id}-l2`, message: "Backtest completed", at: "Recently" }]
              : []),
            ...(paperActive
              ? [{ id: `${id}-l3`, message: "Paper trading started", at: "Recently" }]
              : []),
          ],
    trades:
      id === "strat-btc-sniper"
        ? BTC_SNIPER_TRADES
        : backtestComplete
          ? [
              {
                id: "t1",
                at: "May 18, 14:32",
                market: marketLabel?.split("·")[0]?.trim() ?? "—",
                direction: "Long",
                entry: "$76,920",
                exit: "$78,072",
                pnl: "+$1,152",
                reason: "TP zone · RSI recovery",
              },
            ]
          : [],
    chatMessages,
    saved: backtestComplete || paperActive,
  };
}

export const INITIAL_WORKSTATION_STRATEGIES = [
  buildStrategyRecord({
    id: "strat-btc-sniper",
    name: "BTC Mean Reversion",
    status: "Draft",
    modelId: "quant",
    strategyId: "mean-reversion",
    marketId: "btc",
    marketLabel: "BTCUSDT · 15m",
    prompt: "BTCUSDT 15m mean reversion",
    customSetup: buildBtcSniperSetup(DEFAULT_PREFERENCES),
    chatMessages: DEMO_CHAT_BTC_SNIPER_DRAFT,
  }),
  buildStrategyRecord({
    id: "strat-eth-funding",
    name: "ETH Funding Capture",
    status: "Backtested",
    modelId: "funding",
    strategyId: "funding-capture",
    marketId: "eth",
    marketLabel: "ETHUSDT · 1h",
    performancePreview: "+4.8%",
    prompt: "ETH funding capture across DEXes",
    backtestComplete: true,
  }),
  buildStrategyRecord({
    id: "strat-sol-breakout",
    name: "SOL Breakout Continuation",
    status: "Paper Trading",
    modelId: "aggressive",
    strategyId: "momentum-breakout",
    marketId: "sol",
    marketLabel: "SOLUSDT · 15m",
    performancePreview: "+1.2%",
    prompt: "SOL momentum breakout with volume",
    backtestComplete: true,
    paperActive: true,
  }),
  buildStrategyRecord({
    id: "strat-hype-trend",
    name: "HYPE Trend Follow",
    status: "Ready",
    modelId: "quant",
    strategyId: "trend-following",
    marketId: "hype",
    marketLabel: "HYPEUSDT · 1h",
    performancePreview: "Sharpe 2.1",
    prompt: "HYPE trend following on 1h",
    backtestComplete: true,
    ready: true,
  }),
];

export const CENTER_TEMPLATES = [
  {
    id: "btc-mean-reversion",
    title: "BTC 15m mean reversion",
    cardTitle: "BTC Mean Reversion",
    strategyKind: "Mean Reversion",
    asset: "BTC",
    timeframe: "15m",
    risk: "Medium Risk",
    cardAsset: "BTC-USDC",
    cardTimeframe: "15m - 1h",
    cardSetupType: "Mean Reversion",
    cardRiskProfile: "Moderate",
    illustration: "candles",
    description: "Find bounce setups near support with clear invalidation.",
    tags: ["Quant", "BTC", "15m", "Medium Risk"],
    prompt:
      "I want to create a BTCUSDT 15m quantitative mean reversion strategy using Bollinger lower-band and RSI filters.",
    modelId: "quant",
    strategyId: "mean-reversion",
    marketId: "btc",
  },
  {
    id: "eth-funding",
    title: "ETH funding capture",
    cardTitle: "ETH Funding Capture",
    strategyKind: "Funding",
    asset: "ETH",
    timeframe: "1h",
    risk: "Medium Risk",
    cardAsset: "ETH-USDC",
    cardTimeframe: "1h - 4h",
    cardSetupType: "Funding Arbitrage",
    cardRiskProfile: "Low",
    illustration: "flow",
    description: "Monitor funding differences and identify carry opportunities.",
    tags: ["Funding", "ETH", "1h", "Medium Risk"],
    prompt: "Build an ETH funding capture strategy on 1h across preferred DEXes.",
    modelId: "funding",
    strategyId: "funding-capture",
    marketId: "eth",
  },
  {
    id: "sol-breakout",
    title: "SOL breakout",
    cardTitle: "SOL Breakout Continuation",
    strategyKind: "Momentum",
    asset: "SOL",
    timeframe: "15m",
    risk: "High Risk",
    cardAsset: "SOL-USDC",
    cardTimeframe: "15m - 1h",
    cardSetupType: "Breakout",
    cardRiskProfile: "Moderate - High",
    illustration: "line",
    description: "Watch for breakout confirmation with volume and open interest.",
    tags: ["Aggressive", "SOL", "15m", "High Risk"],
    prompt: "Build a SOL breakout continuation strategy with volume confirmation on 15m.",
    modelId: "aggressive",
    strategyId: "momentum-breakout",
    marketId: "sol",
  },
  {
    id: "hype-trend",
    title: "HYPE trend follow",
    cardTitle: "HYPE Trend Follow",
    strategyKind: "Trend Following",
    asset: "HYPE",
    timeframe: "1h",
    risk: "Medium Risk",
    cardAsset: "HYPE-USD",
    cardTimeframe: "1h - 4h",
    cardSetupType: "Trend Following",
    cardRiskProfile: "Moderate",
    illustration: "anchor",
    description: "Follow higher-timeframe trend with rule-based entries.",
    tags: ["Quant", "HYPE", "1h", "Medium Risk"],
    prompt: "Build a HYPE trend-following strategy on 1h with rule-based entries.",
    modelId: "quant",
    strategyId: "trend-following",
    marketId: "hype",
  },
];

export const STARTER_STRATEGIES = [
  { id: "starter-btc-mr", title: "BTC Mean Reversion", market: "BTCUSDT · 15m" },
  { id: "starter-eth-funding", title: "ETH Funding Capture", market: "ETHUSDT · 1h" },
  { id: "starter-sol-breakout", title: "SOL Breakout Strategy", market: "SOLUSDT · 15m" },
  { id: "starter-hype-trend", title: "HYPE Trend Following", market: "HYPEUSDT · 1h" },
];
