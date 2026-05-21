import { generateStrategySetup, buildAgentFromSetup } from "./strategyTradingEngine.js";
import { MOCK_BACKTEST } from "./strategyWorkstationMockData.js";
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
    lastUpdated: "Just now",
    setup,
    metrics: {
      totalReturn: "—",
      maxDrawdown: "—",
      winRate: "—",
      profitFactor: "—",
      sharpeRatio: "—",
      trades: 0,
      paperPnl: "$0.00",
    },
    backtest: { status: "idle", results: null },
    paperTrading: {
      status: "idle",
      balance: "$10,000",
      pnl: "$0.00",
      mode: "Paper",
      position: null,
      events: [],
    },
    trades: [],
    logs: [{ id: `l-${Date.now()}`, message: "Strategy draft created from prompt", at: new Date().toISOString() }],
    chatMessages: [],
    isAgent: false,
  };
}

export function applyBacktest(strategy) {
  return {
    ...strategy,
    status: strategy.status === "Watching" ? "Watching" : "Backtested",
    lastUpdated: "Just now",
    metrics: {
      totalReturn: MOCK_BACKTEST.totalReturn,
      maxDrawdown: MOCK_BACKTEST.maxDrawdown,
      winRate: MOCK_BACKTEST.winRate,
      profitFactor: MOCK_BACKTEST.profitFactor,
      sharpeRatio: MOCK_BACKTEST.sharpeRatio,
      trades: MOCK_BACKTEST.trades,
      paperPnl: strategy.paperTrading?.pnl ?? "$0.00",
    },
    backtest: { status: "complete", results: MOCK_BACKTEST },
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Backtest completed",
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
  };
}

export function applyPaperTrading(strategy) {
  const setup = strategy.setup;
  return {
    ...strategy,
    status: "Paper Trading",
    lastUpdated: "Just now",
    paperTrading: {
      status: "active",
      balance: "$10,000",
      pnl: "+$0.00",
      mode: "Paper",
      position: null,
      events: ["Watching entry conditions"],
    },
    logs: [
      {
        id: `l-${Date.now()}`,
        message: "Paper trading started",
        at: new Date().toISOString(),
      },
      ...strategy.logs,
    ],
  };
}

export function applySaferRules(strategy) {
  const setup = {
    ...strategy.setup,
    strategyLogic: [
      ...(strategy.setup.strategyLogic ?? []),
      "Skip trades when volatility expands or funding is unfavorable.",
    ],
    warnings: [
      ...(strategy.setup.warnings ?? []),
      "Tighter filters may reduce trade frequency.",
    ],
  };
  return {
    ...strategy,
    setup,
    lastUpdated: "Just now",
    logs: [
      { id: `l-${Date.now()}`, message: "Risk filters tightened", at: new Date().toISOString() },
      ...strategy.logs,
    ],
  };
}

export function buildChatResponse(action, strategy) {
  const map = {
    "Run backtest": {
      text: `Backtest complete. The strategy returned ${MOCK_BACKTEST.totalReturn} with ${MOCK_BACKTEST.maxDrawdown} max drawdown across ${MOCK_BACKTEST.trades} trades.`,
      cards: ["Backtest complete", "Review metrics in workspace"],
    },
    "Start paper trade": {
      text: "Paper trading started. I will monitor entry conditions and log simulated trades.",
      cards: ["Paper trading active", "Watching entry zone"],
    },
    "Make it safer": {
      text: "I updated the strategy. It will now skip setups when funding is too high or volatility expands aggressively.",
      cards: ["Risk filters updated"],
    },
    "Create watcher": {
      text: `Watcher ready for ${strategy?.market ?? "market"}. Configure monitoring in the agent modal.`,
      cards: ["Create watcher"],
    },
    "Deploy with manual approval": {
      text: "Open the deployment review to confirm execution mode and risk settings before going live.",
      cards: ["Review deployment"],
    },
    default: {
      text: `Updated ${strategy?.name ?? "strategy"} based on your request.`,
      cards: [],
    },
  };
  return map[action] ?? map.default;
}

export function strategyFromAgent(agent, preferences) {
  return {
    id: agent.id,
    name: agent.name,
    status: agent.status === "Watching" ? "Watching" : agent.status,
    market: agent.market,
    timeframe: "15m",
    model: agent.model,
    strategy: agent.strategy,
    modelId: "conservative",
    strategyId: "mean-reversion",
    marketId: "btc",
    lastUpdated: agent.lastChecked ?? "Just now",
    setup: null,
    isAgent: true,
    agent,
  };
}

export { buildAgentFromSetup, generateStrategySetup, STRATEGY_MODELS, STRATEGY_TYPES };
