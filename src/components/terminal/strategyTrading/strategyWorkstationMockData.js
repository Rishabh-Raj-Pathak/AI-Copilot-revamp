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

export const MOCK_BACKTEST = {
  totalReturn: "+6.97%",
  totalReturnRaw: 6.97,
  maxDrawdown: "-5.09%",
  winRate: "42.86%",
  winLoss: "3W / 4L",
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
  expectedPayoff: "$99.52",
  outperformance: "-5.21%",
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
    prompt: "BTCUSDT 15m Lower Band Sniper mean reversion",
    modelId: "quant",
    strategyId: "mean-reversion",
    marketId: "btc",
    preferences,
    terminalPlatform: "hyperliquid",
  });
  return {
    ...base,
    title: "BTC Lower Band Sniper",
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
    leverage: "3x",
    fees: "Custom",
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
  };
}

export const DEMO_CHAT_BTC_SNIPER = [
  {
    id: "demo-u1",
    role: "user",
    text: "I want to create a BTCUSDT 15m quantitative strategy based on the Lower Band Sniper strategy.",
  },
  {
    id: "demo-a1",
    role: "assistant",
    text: "Got it. I'll create a draft strategy for BTCUSDT on the 15m timeframe using a lower Bollinger Band + RSI mean reversion setup. Before backtesting, review the configuration.",
    richCards: [{ type: "config", data: STRATEGY_CONFIG_DEFAULT }],
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
    trades: backtestComplete
      ? [
          {
            id: "t1",
            at: "May 18, 14:32",
            market: "BTCUSDT",
            direction: "Long",
            entry: "$76,920",
            exit: "$78,072",
            pnl: "+$1,152",
            reason: "TP zone · RSI recovery",
          },
          {
            id: "t2",
            at: "May 17, 09:15",
            market: "BTCUSDT",
            direction: "Long",
            entry: "$75,840",
            exit: "$75,005",
            pnl: "-$835",
            reason: "Stop loss hit",
          },
          {
            id: "t3",
            at: "May 14, 22:08",
            market: "BTCUSDT",
            direction: "Long",
            entry: "$74,210",
            exit: "$75,890",
            pnl: "+$1,680",
            reason: "BB reclaim + volume confirm",
          },
        ]
      : [],
    logs: [
      { id: `${id}-l1`, message: "Strategy draft created", at: new Date().toISOString() },
      ...(backtestComplete
        ? [{ id: `${id}-l2`, message: "Backtest completed", at: new Date().toISOString() }]
        : []),
      ...(paperActive
        ? [{ id: `${id}-l3`, message: "Paper trading started", at: new Date().toISOString() }]
        : []),
    ],
    chatMessages,
    saved: backtestComplete || paperActive,
  };
}

export const INITIAL_WORKSTATION_STRATEGIES = [
  buildStrategyRecord({
    id: "strat-btc-sniper",
    name: "BTC Lower Band Sniper",
    status: "Draft",
    modelId: "quant",
    strategyId: "mean-reversion",
    marketId: "btc",
    marketLabel: "BTCUSDT · 15m",
    prompt: "BTCUSDT 15m Lower Band Sniper",
    customSetup: buildBtcSniperSetup(DEFAULT_PREFERENCES),
    chatMessages: DEMO_CHAT_BTC_SNIPER,
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
    prompt:
      "I want to create a BTCUSDT 15m quantitative strategy based on the Lower Band Sniper strategy.",
    modelId: "quant",
    strategyId: "mean-reversion",
    marketId: "btc",
  },
  {
    id: "eth-funding",
    title: "ETH funding capture",
    prompt: "Build an ETH funding capture strategy on 1h across preferred DEXes.",
    modelId: "funding",
    strategyId: "funding-capture",
    marketId: "eth",
  },
  {
    id: "sol-breakout",
    title: "SOL breakout",
    prompt: "Build a SOL breakout continuation strategy with volume confirmation on 15m.",
    modelId: "aggressive",
    strategyId: "momentum-breakout",
    marketId: "sol",
  },
  {
    id: "hype-trend",
    title: "HYPE trend follow",
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
