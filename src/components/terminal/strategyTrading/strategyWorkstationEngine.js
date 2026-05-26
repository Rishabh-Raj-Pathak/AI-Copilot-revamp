import { generateStrategySetup } from "./strategyTradingEngine.js";
import {
  MOCK_BACKTEST,
  PAPER_POSITION_BTC,
  STRATEGY_CONFIG_DEFAULT,
} from "./strategyWorkstationMockData.js";
import { STRATEGY_MODELS, STRATEGY_TYPES } from "./strategyTradingMockData.js";

export function createDraftStrategy({
  prompt,
  modelId,
  strategyId,
  marketId,
  preferences,
  terminalPlatform,
  name,
}) {
  const setup = generateStrategySetup({
    prompt,
    modelId,
    strategyId,
    marketId,
    preferences,
    terminalPlatform,
  });
  const strategyName =
    name ?? setup.title.replace(" Setup", "") ?? "New Strategy";

  return {
    id: `strat-${Date.now()}`,
    name: strategyName,
    status: "Draft",
    modelId,
    strategyId,
    marketId,
    market: setup.market,
    timeframe: setup.timeframe,
    model: setup.model,
    strategy: setup.strategy,
    strategyType: setup.strategy,
    lastUpdated: "Just now",
    performancePreview: null,
    setup,
    config: { ...STRATEGY_CONFIG_DEFAULT },
    metrics: { ...DEFAULT_METRICS },
    backtest: { status: "idle", results: null },
    paperTrading: {
      status: "idle",
      balance: "$10,000",
      pnl: "$0.00",
      mode: "Paper simulation",
      position: null,
      events: [],
    },
    trades: [],
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Strategy draft created from prompt",
        at: new Date().toISOString(),
      },
    ],
    chatMessages: [],
    saved: false,
  };
}

const DEFAULT_METRICS = {
  totalReturn: "—",
  maxDrawdown: "—",
  winRate: "—",
  profitFactor: "—",
  sharpeRatio: "—",
  trades: 0,
  paperPnl: "$0.00",
};

export function applyOptimization(strategy) {
  const config = {
    ...(strategy.config ?? STRATEGY_CONFIG_DEFAULT),
    bbLength: 28,
    rsiThreshold: 24,
    stopLoss: "2.5%",
    takeProfit: "7%",
    leverage: strategy.config?.leverage ?? "3x",
    execution: "Manual approval",
  };
  const withConfig = {
    ...strategy,
    config,
    setup: strategy.setup
      ? {
          ...strategy.setup,
          config,
          personalizationNote:
            "Optimized via grid search — tuned Bollinger length, RSI threshold, and risk exits.",
        }
      : strategy.setup,
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Strategy optimization completed",
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
  };
  return applyBacktest(withConfig);
}

export const OPTIMIZE_CHAT_PROGRESS = [
  "Starting optimization across your current market, timeframe, and date range…",
  "Testing parameter combinations: Bollinger length, RSI threshold, stop/take levels…",
  "Evaluating candidates against historical data (24 combinations)…",
  "Best candidate found — applying tuned configuration and running backtest estimate…",
];

export function applyBacktest(strategy) {
  const canBeReady =
    strategy.paperTrading?.status === "active" || strategy.status === "Paper Trading";
  return {
    ...strategy,
    status: canBeReady ? "Ready" : "Backtested",
    lastUpdated: "Just now",
    performancePreview: MOCK_BACKTEST.totalReturn,
    metrics: {
      ...MOCK_BACKTEST,
      paperPnl: strategy.paperTrading?.pnl ?? "$0.00",
    },
    backtest: { status: "complete", results: MOCK_BACKTEST },
    trades:
      strategy.id === "strat-btc-sniper" || strategy.name?.includes("BTC Mean Reversion")
        ? [
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
          ]
        : strategy.trades?.length
          ? strategy.trades
          : [
              {
                id: "t1",
                at: "May 18, 14:32",
                market: strategy.market?.split("·")[0]?.trim() ?? "—",
                direction: "Long",
                entry: "$76,920",
                exit: "$78,072",
                pnl: "+$1,152",
                reason: "TP zone · RSI recovery",
              },
            ],
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Backtest completed",
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
    saved: true,
  };
}

export function applyPaperTrading(strategy) {
  const position =
    strategy.market?.includes("BTC") || strategy.name?.includes("BTC")
      ? PAPER_POSITION_BTC
      : {
          market: strategy.market?.split("·")[0]?.trim() ?? "—",
          side: "Long",
          entry: strategy.setup?.entryZone ?? "—",
          current: "—",
          pnl: "+0.00%",
          stopLoss: strategy.setup?.stopLoss ?? "—",
          takeProfit: strategy.setup?.takeProfit ?? "—",
          timeInTrade: "—",
          size: "—",
          status: "Monitoring",
        };

  return {
    ...strategy,
    status: strategy.backtest?.status === "complete" ? "Ready" : "Paper Trading",
    lastUpdated: "Just now",
    performancePreview: position.pnl,
    paperTrading: {
      status: "active",
      balance: "$10,000",
      pnl: position.pnl,
      mode: "Paper simulation",
      position,
      events: [
        "Paper trading simulation started",
        `Monitoring ${position.market} ${position.side}`,
        "Manual approval required before live deployment",
      ],
    },
    metrics: {
      ...strategy.metrics,
      paperPnl: position.pnl,
    },
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Paper trading started",
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
    saved: true,
  };
}

export function applySaferRules(strategy) {
  const config = {
    ...(strategy.config ?? STRATEGY_CONFIG_DEFAULT),
    rsiThreshold: 22,
    stopLoss: "2.0%",
    takeProfit: "6%",
    leverage: "2x",
    execution: "Manual approval",
  };
  const setup = {
    ...strategy.setup,
    leverage: "2x",
    config,
    riskRules: [
      ...(strategy.setup?.riskRules ?? []),
      "Tighter max drawdown guard — skip marginal setups.",
      "Wider confirmation required before entry.",
    ],
    warnings: [
      ...(strategy.setup?.warnings ?? []),
      "Safer preset may reduce trade frequency.",
    ],
    personalizationNote:
      "Adjusted for safer execution: 2x leverage cap, tighter RSI, and stricter confirmation. Manual approval remains required.",
  };
  return {
    ...strategy,
    setup,
    config,
    lastUpdated: "Just now",
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Risk settings updated (safer preset)",
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
  };
}

export function applyConfigPreset(strategy, preset) {
  const presets = {
    recommended: { ...STRATEGY_CONFIG_DEFAULT },
    safer: {
      bbLength: 34,
      rsiThreshold: 22,
      stopLoss: "2.0%",
      takeProfit: "6%",
      leverage: "2x",
      execution: "Manual approval",
    },
    aggressive: {
      bbLength: 20,
      rsiThreshold: 28,
      stopLoss: "3.0%",
      takeProfit: "10%",
      leverage: "5x",
      execution: "Manual approval",
    },
  };
  const config = presets[preset] ?? strategy.config;
  return {
    ...strategy,
    config,
    lastUpdated: "Just now",
    logs: [
      {
        id: `l-${Date.now()}`,
        message: `Configuration updated (${preset})`,
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
  };
}

export function buildChatResponse(action, strategy) {
  const bt = MOCK_BACKTEST;
  const map = {
    "Run backtest": {
      text: `Backtest complete. The strategy returned ${bt.totalReturn} with ${bt.maxDrawdown} max drawdown, ${bt.winRate} win rate, and ${bt.profitFactor} profit factor across ${bt.trades} trades.`,
      richCards: [{ type: "backtest", data: bt }],
    },
    "Optimize strategy": {
      text: `Optimization complete. I tuned Bollinger length, RSI threshold, and risk exits — the backtest estimate now shows ${bt.totalReturn} return with ${bt.maxDrawdown} max drawdown, ${bt.winRate} win rate, and ${bt.sharpeRatio} Sharpe.`,
      richCards: [
        { type: "config", data: strategy?.config ?? STRATEGY_CONFIG_DEFAULT },
        { type: "backtest", data: bt },
      ],
    },
    "Start paper trading": {
      text: "Paper trading simulation started. I'll track this strategy using market-like data. Manual approval is still required before any real deployment.",
      richCards: [
        {
          type: "paper",
          data: {
            Status: "Active",
            Market: strategy?.market?.split("·")[0]?.trim() ?? "BTCUSDT",
            Timeframe: strategy?.timeframe ?? "15m",
            Mode: "Paper simulation",
            Risk: "Balanced",
            Execution: "Manual approval",
          },
        },
      ],
    },
    "Make this safer": {
      text: "I tightened risk settings: lower leverage (2x), stricter RSI threshold, and wider confirmation. Manual approval remains on — this is decision support, not auto-execution.",
      richCards: [
        {
          type: "config",
          data: {
            bbLength: 34,
            rsiThreshold: 22,
            stopLoss: "2.0%",
            takeProfit: "6%",
            leverage: "2x",
            execution: "Manual approval",
          },
        },
      ],
    },
    "Make it safer": {
      text: "I tightened risk settings: lower leverage (2x), stricter RSI threshold, and wider confirmation. Manual approval remains on.",
      richCards: [
        {
          type: "config",
          data: {
            bbLength: 34,
            rsiThreshold: 22,
            stopLoss: "2.0%",
            takeProfit: "6%",
            leverage: "2x",
            execution: "Manual approval",
          },
        },
      ],
    },
    "Explain strategy": {
      text: strategy?.setup?.description
        ? strategy.setup.description
        : `This ${strategy?.strategy ?? "strategy"} uses ${strategy?.model ?? "Quant"} rules on ${strategy?.market ?? "your market"}. Review entry, exit, and risk tabs in the workspace.`,
      richCards: [],
    },
    "Review risk": {
      text: "Open Review Deployment to confirm risk rules, backtest estimates, and paper status. Auto-execution is disabled in this prototype.",
      richCards: [],
    },
    "Review deployment": {
      text: "Use Review Deployment to walk through strategy summary, backtest estimates, and required confirmations before any manual action.",
      richCards: [],
    },
    default: {
      text: `Updated ${strategy?.name ?? "strategy"} based on your request.`,
      richCards: [],
    },
  };
  return map[action] ?? map.default;
}

export { generateStrategySetup, STRATEGY_MODELS, STRATEGY_TYPES };
