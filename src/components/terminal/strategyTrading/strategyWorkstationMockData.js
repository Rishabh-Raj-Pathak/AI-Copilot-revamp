import { generateStrategySetup } from "./strategyTradingEngine.js";
import { DEFAULT_PREFERENCES } from "./strategyTradingMockData.js";

export const STRATEGY_STATUSES = [
  "Draft",
  "Backtested",
  "Paper Trading",
  "Watching",
  "Paused",
  "Ready to Deploy",
];

export const SIDEBAR_FILTERS = [
  { id: "all", label: "All" },
  { id: "drafts", label: "Drafts" },
  { id: "agents", label: "Agents" },
  { id: "paper", label: "Paper" },
  { id: "deployed", label: "Deployed" },
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
  "Make it safer",
  "Run backtest",
  "Start paper trade",
  "Add funding filter",
  "Change timeframe",
  "Create watcher",
  "Explain risk",
  "Deploy with manual approval",
];

export const MOCK_BACKTEST = {
  totalReturn: "+6.97%",
  maxDrawdown: "-5.09%",
  winRate: "42.86%",
  profitFactor: "2.35",
  sharpeRatio: "2.42",
  trades: 7,
  insights: [
    "Strict filters reduce trade frequency.",
    "Losses stayed controlled.",
    "Strategy may miss fast reversals without trailing stop.",
    "Consider testing a wider date range before deployment.",
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

function buildStrategyRecord({
  id,
  name,
  status,
  modelId,
  strategyId,
  marketId,
  prompt,
  backtestComplete = false,
  paperActive = false,
  watching = false,
}) {
  const setup = generateStrategySetup({
    prompt,
    modelId,
    strategyId,
    marketId,
    preferences: DEFAULT_PREFERENCES,
    terminalPlatform: "hyperliquid",
  });
  setup.title = name;

  const metrics = backtestComplete
    ? { ...MOCK_BACKTEST, trades: MOCK_BACKTEST.trades, paperPnl: paperActive ? "+$124.50" : "$0.00" }
    : { ...DEFAULT_METRICS };

  return {
    id,
    name,
    status,
    modelId,
    strategyId,
    marketId,
    market: setup.market,
    timeframe: setup.timeframe,
    model: setup.model,
    strategy: setup.strategy,
    lastUpdated: "2h ago",
    setup,
    metrics,
    backtest: {
      status: backtestComplete ? "complete" : "idle",
      results: backtestComplete ? MOCK_BACKTEST : null,
    },
    paperTrading: {
      status: paperActive ? "active" : "idle",
      balance: "$10,000",
      pnl: paperActive ? "+$124.50" : "$0.00",
      mode: "Paper",
      position: paperActive
        ? {
            direction: "Long",
            entry: setup.entryZone,
            size: "0.5 BTC",
            pnl: "+$124.50",
            stopLoss: setup.stopLoss,
            takeProfit: setup.takeProfit,
            status: "Open",
          }
        : null,
      events: paperActive
        ? ["Watching entry zone", "Skipped trade — funding spike"]
        : [],
    },
    trades: backtestComplete
      ? [
          {
            id: "t1",
            at: "May 18, 14:32",
            direction: "Long",
            entry: "$67,920",
            exit: "$68,450",
            pnl: "+$530",
            reason: "RSI recovery + zone reclaim",
          },
          {
            id: "t2",
            at: "May 17, 09:15",
            direction: "Long",
            entry: "$67,100",
            exit: "$66,880",
            pnl: "-$220",
            reason: "Invalidation hit",
          },
        ]
      : [],
    logs: [
      { id: "l1", message: "Strategy initialized", at: new Date().toISOString() },
    ],
    chatMessages: [],
    isAgent: watching,
  };
}

export const INITIAL_WORKSTATION_STRATEGIES = [
  buildStrategyRecord({
    id: "strat-btc-mr",
    name: "BTC Mean Reversion",
    status: "Draft",
    modelId: "conservative",
    strategyId: "mean-reversion",
    marketId: "btc",
    prompt: "Low-risk BTC mean reversion on 15m",
  }),
  buildStrategyRecord({
    id: "strat-eth-funding",
    name: "ETH Funding Capture",
    status: "Paper Trading",
    modelId: "funding",
    strategyId: "funding-capture",
    marketId: "eth",
    prompt: "ETH funding capture across DEXes",
    paperActive: true,
  }),
  buildStrategyRecord({
    id: "strat-sol-breakout",
    name: "SOL Breakout Watcher",
    status: "Watching",
    modelId: "aggressive",
    strategyId: "momentum-breakout",
    marketId: "sol",
    prompt: "SOL momentum breakout with volume",
    watching: true,
  }),
  buildStrategyRecord({
    id: "strat-hype-trend",
    name: "HYPE Trend Follow",
    status: "Backtested",
    modelId: "quant",
    strategyId: "trend-following",
    marketId: "hype",
    prompt: "HYPE trend following on 1h",
    backtestComplete: true,
  }),
];

export const CENTER_TEMPLATES = [
  {
    id: "btc-mean-reversion",
    title: "BTC Mean Reversion",
    prompt: "Build a low-risk BTC mean reversion strategy on 15m.",
    modelId: "conservative",
    strategyId: "mean-reversion",
    marketId: "btc",
  },
  {
    id: "eth-funding",
    title: "ETH Funding Capture",
    prompt: "Build an ETH funding capture strategy across DEXes.",
    modelId: "funding",
    strategyId: "funding-capture",
    marketId: "eth",
  },
  {
    id: "sol-breakout",
    title: "SOL Momentum Breakout",
    prompt: "Build a SOL momentum breakout strategy with volume confirmation.",
    modelId: "aggressive",
    strategyId: "momentum-breakout",
    marketId: "sol",
  },
  {
    id: "multi-dex",
    title: "Multi-DEX Opportunity Scan",
    prompt: "Scan BTC and ETH for funding and liquidity edges across DEXes.",
    modelId: "funding",
    strategyId: "funding-capture",
    marketId: "btc",
  },
];
