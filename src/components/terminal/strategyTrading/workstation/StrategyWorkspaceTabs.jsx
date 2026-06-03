import { useState } from "react";
import { Button } from "../../../ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import StrategyFlowStepper from "../StrategyFlowStepper.jsx";
import StrategyLogicCard from "./StrategyLogicCard.jsx";
import BacktestTabV2 from "./overview/BacktestTabV2.jsx";
import OverviewTabV2 from "./overview/OverviewTabV2.jsx";
import ScrollFade from "./ScrollFade.jsx";
import {
  CopilotTabLead,
  V3TabLead,
  V3TabSection,
  V3TabShell,
  v3BodyText,
  v3SectionTitle,
} from "./V3TabLayout.jsx";
import {
  DEFAULT_PAPER_STATS,
  WORKSPACE_TABS,
} from "../strategyWorkstationMockData.js";

const WORKSPACE_TABS_V2 = [
  { id: "overview", label: "Overview" },
  { id: "backtest", label: "Backtest" },
  { id: "paper", label: "Paper Trading" },
  { id: "deployed", label: "Deployed" },
];

const EXECUTION_SUBTABS = [
  { id: "positions", label: "Positions" },
  { id: "open-orders", label: "Open Orders" },
  { id: "order-history", label: "Order History" },
  { id: "trade-history", label: "Trade History" },
  { id: "balance", label: "Balance" },
];

function EmptySectionTable({ columns, message, subtitle, theme }) {
  if (theme?.isV3) {
    return (
      <div className={theme.tableShell}>
        <ScrollFade
          axis="x"
          fadeColor="var(--ds-copilot-v2-bg)"
          className="border-b border-white/[0.06]"
        >
          <table className="w-full min-w-max text-left text-xs">
            <thead className="text-[rgba(255,255,255,0.48)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-3 py-2.5 font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </ScrollFade>
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <p className="text-sm text-[rgba(255,255,255,0.58)]">{message}</p>
          {subtitle ? (
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[rgba(255,255,255,0.45)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (theme?.isV2) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#242424] bg-[#0f0f0f]">
        <ScrollFade
          axis="x"
          fadeColor="var(--ds-copilot-v2-elevated)"
          className="border-b border-white/[0.04]"
        >
          <table className="w-full min-w-max text-left text-xs">
            <thead className="text-[rgba(255,255,255,0.36)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-3 py-2 font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </ScrollFade>
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <p className="text-sm text-[rgba(255,255,255,0.58)]">{message}</p>
          {subtitle ? (
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[rgba(255,255,255,0.36)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#242424]">
      <table className="w-full min-w-max text-left text-xs">
        <thead className="border-b border-[#242424] text-[#a1a1a1]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-3 py-2 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <div className="px-3 py-10 text-center text-sm text-[#757575]">
        {message}
      </div>
    </div>
  );
}

function Metric({ label, value, tone, theme }) {
  const color =
    tone === "positive"
      ? theme.isV2
        ? theme.textPositive
        : "text-[#269755]"
      : tone === "negative"
        ? theme.isV2
          ? theme.textNegative
          : "text-[#D53D3D]"
        : theme.isV2
          ? theme.textPrimary
          : "text-white";
  return (
    <div className={theme.metricCard}>
      <p className={theme.metricLabel}>{label}</p>
      <p className={`${theme.metricValue} ${color}`}>{value}</p>
    </div>
  );
}

function MetricsGrid({ strategy, theme, compact }) {
  const m = strategy?.metrics ?? {};
  const cells = [
    {
      label: "Total Return",
      value: m.totalReturn ?? "—",
      tone: m.totalReturn?.startsWith("+") ? "positive" : undefined,
    },
    {
      label: "Max Drawdown",
      value: m.maxDrawdown ?? "—",
      tone: m.maxDrawdown?.startsWith("-") ? "negative" : undefined,
    },
    { label: "Win Rate", value: m.winRate ?? "—" },
    { label: "Profit Factor", value: m.profitFactor ?? "—" },
    { label: "Sharpe", value: m.sharpeRatio ?? "—" },
    { label: "Trades", value: String(m.trades ?? 0) },
  ];

  if (theme.isV3 && compact) {
    return (
      <div className={theme.metricCard}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-white/[0.06]">
          {cells.map((cell, i) => {
            const color =
              cell.tone === "positive"
                ? theme.textPositive
                : cell.tone === "negative"
                  ? theme.textNegative
                  : theme.textPrimary;
            return (
              <div
                key={cell.label}
                className={`${theme.metricCell} ${
                  i > 0 && i % 2 === 1
                    ? "border-l border-white/[0.06] lg:border-l-0"
                    : ""
                } ${i >= 2 ? "border-t border-white/[0.06] lg:border-t-0" : ""}`}
              >
                <p className={theme.metricLabel}>{cell.label}</p>
                <p className={`${theme.metricValue} ${color}`}>{cell.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (theme.isV2 && compact) {
    return (
      <div className={theme.metricCard}>
        <div className="grid grid-cols-3">
          {cells.map((cell, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const color =
              cell.tone === "positive"
                ? theme.textPositive
                : cell.tone === "negative"
                  ? theme.textNegative
                  : theme.textPrimary;
            return (
              <div
                key={cell.label}
                className={`${theme.metricCell} ${
                  col < 2 ? "border-r" : ""
                } ${row === 0 ? "border-b" : ""}`}
              >
                <p className={theme.metricLabel}>{cell.label}</p>
                <p className={`${theme.metricValue} ${color}`}>{cell.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
          : "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
      }
    >
      {cells.map((cell) => (
        <Metric
          key={cell.label}
          label={cell.label}
          value={cell.value}
          tone={cell.tone}
          theme={theme}
        />
      ))}
    </div>
  );
}

function EquityCurveMock({ theme, compact }) {
  const pad = compact ? "p-4" : "p-3";
  const chartH = compact ? "h-20" : "h-16";
  return (
    <div className={`${pad} ${theme.cardInner}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[#929292]">Equity curve</span>
        <span className="text-[10px] text-[#585858]">vs Buy & Hold</span>
      </div>
      <svg viewBox="0 0 240 56" className={`mt-3 w-full ${chartH}`} aria-hidden>
        <defs>
          <linearGradient id="eq-fill-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F3B6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00F3B6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eq-line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F2B500" />
            <stop offset="100%" stopColor="#00F3B6" />
          </linearGradient>
          <filter id="eq-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="1.5"
              floodColor="#00F3B6"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        <g stroke="#2e2e2e" strokeWidth="0.75">
          <line x1="0" y1="10" x2="240" y2="10" />
          <line x1="0" y1="22" x2="240" y2="22" />
          <line x1="0" y1="34" x2="240" y2="34" />
          <line x1="0" y1="46" x2="240" y2="46" />
        </g>

        <path
          d="M8 43 Q24 39 34 36 Q44 34 54 35 Q66 36 74 33 Q84 30 96 27 Q108 24 118 25 Q130 26 140 20 Q150 15 160 17 Q172 20 180 14 Q190 9 202 12 Q214 15 232 11 L232 54 L8 54 Z"
          fill="url(#eq-fill-gradient)"
        />
        <path
          d="M8 43 Q24 39 34 36 Q44 34 54 35 Q66 36 74 33 Q84 30 96 27 Q108 24 118 25 Q130 26 140 20 Q150 15 160 17 Q172 20 180 14 Q190 9 202 12 Q214 15 232 11"
          fill="none"
          stroke="url(#eq-line-gradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#eq-glow)"
        />
        <path
          d="M8 42 Q36 36 64 34 Q92 31 120 27 Q148 23 176 20 Q204 17 232 15"
          fill="none"
          stroke="#6a6a6a"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <circle cx="232" cy="11" r="2.4" fill="#00F3B6" />
        <circle cx="232" cy="15" r="2" fill="#7b7b7b" />
      </svg>
      <div className="mt-2.5 flex gap-4 text-[10px]">
        <span className="flex items-center gap-1.5 text-[#00F3B6]">
          <span className="inline-block h-px w-3 bg-[#00F3B6]" aria-hidden />
          Strategy
        </span>
        <span className="flex items-center gap-1.5 text-[#585858]">
          <span
            className="inline-block h-px w-3 border-t border-dashed border-[#585858]"
            aria-hidden
          />
          Buy & Hold
        </span>
      </div>
    </div>
  );
}

function ExecutionNestedTabs({
  strategy,
  pos,
  theme,
  tabContentClass,
  nestedInV3 = false,
}) {
  const [executionTab, setExecutionTab] = useState("positions");
  const nestedContentClass = theme.isV2 ? "mt-3" : "mt-3 space-y-3";

  return (
    <Tabs
      value={executionTab}
      onValueChange={setExecutionTab}
      className={nestedInV3 ? "" : "mt-4"}
    >
      {theme.isV2 ? (
        <ScrollFade
          axis="x"
          fadeColor={
            nestedInV3
              ? "var(--ds-copilot-v2-bg)"
              : "var(--ds-copilot-v2-elevated)"
          }
          className={nestedInV3 ? "border-b border-white/6" : undefined}
        >
          <TabsList className={`${theme.tabsList} flex-wrap`}>
            {EXECUTION_SUBTABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className={theme.tabsTrigger}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollFade>
      ) : (
        <TabsList className={`${theme.tabsList} flex-wrap`}>
          {EXECUTION_SUBTABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className={theme.tabsTrigger}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}

      <TabsContent value="positions" className={nestedContentClass}>
        {theme.isV2 ? (
          <EmptySectionTable
            columns={[
              "Coin",
              "Size",
              "Position Value",
              "Entry Price",
              "Current Price",
              "PNL (ROE%)",
              "Liq. Price",
              "Margin",
              "Funding",
              "TP/SL",
              "Exp. Profit(%) / Exp. Loss(%)",
              "Action",
            ]}
            message="No open positions yet."
            subtitle={
              strategy?.paperTrading?.status === "active"
                ? "Paper trading is active. Simulated positions will appear here once the strategy enters a trade."
                : undefined
            }
            theme={theme}
          />
        ) : pos ? (
          <div className="overflow-x-auto rounded-lg border border-[#242424]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#242424] text-[#757575]">
                <tr>
                  <th className="px-3 py-2">Market</th>
                  <th className="px-3 py-2">Side</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">Entry</th>
                  <th className="px-3 py-2">Current</th>
                  <th className="px-3 py-2">PnL</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2">{pos.market}</td>
                  <td className="px-3 py-2">{pos.side}</td>
                  <td className="px-3 py-2">{pos.size ?? "—"}</td>
                  <td className="px-3 py-2">{pos.entry}</td>
                  <td className="px-3 py-2">{pos.current}</td>
                  <td className="px-3 py-2 text-[#269755]">{pos.pnl}</td>
                  <td className="px-3 py-2">{pos.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#757575]">
            No open paper or live positions.
          </p>
        )}
      </TabsContent>

      <TabsContent value="open-orders" className={nestedContentClass}>
        <EmptySectionTable
          columns={[
            "Time",
            "Type",
            "Coin",
            "Direction",
            "Original Size",
            "Filled Size",
            "Order Value",
            "Price",
            "Trigger Conditions",
            "Action",
          ]}
          message="No open orders."
          theme={theme}
        />
      </TabsContent>

      <TabsContent value="order-history" className={nestedContentClass}>
        <EmptySectionTable
          columns={[
            "Time",
            "Type",
            "Coin",
            "Direction",
            "Original Size",
            "Filled Size",
            "Order Value",
            "Price",
            "Trigger Conditions",
          ]}
          message="No order history."
          theme={theme}
        />
      </TabsContent>

      <TabsContent value="trade-history" className={nestedContentClass}>
        <EmptySectionTable
          columns={[
            "Time",
            "Coin",
            "Direction",
            "Price",
            "Size",
            "Trade Value",
            "Fee",
            "Closed PNL",
          ]}
          message="No trade history."
          theme={theme}
        />
      </TabsContent>

      <TabsContent value="balance" className={nestedContentClass}>
        <EmptySectionTable
          columns={["Coin", "Total balance", "Available balance", "USDC Value"]}
          message="No balance data."
          theme={theme}
        />
      </TabsContent>
    </Tabs>
  );
}

function getPaperMarketSymbol(strategy) {
  const raw = (strategy?.market ?? "").trim();
  return raw.split(" · ")[0]?.trim() || raw;
}

function resolvePaperTradingStats(strategy) {
  const stats = strategy?.paperTrading?.stats;
  if (stats) return stats;
  const m = strategy?.metrics ?? {};
  return {
    totalReturn: m.totalReturn ?? DEFAULT_PAPER_STATS.totalReturn,
    maxDrawdown: m.maxDrawdown ?? DEFAULT_PAPER_STATS.maxDrawdown,
    totalTrades: m.trades ?? DEFAULT_PAPER_STATS.totalTrades,
    winRate: m.winRate ?? DEFAULT_PAPER_STATS.winRate,
    profitFactor: m.profitFactor ?? DEFAULT_PAPER_STATS.profitFactor,
    funding: DEFAULT_PAPER_STATS.funding,
    runningTime: DEFAULT_PAPER_STATS.runningTime,
  };
}

const PAPER_SUMMARY_METRICS = [
  { key: "totalReturn", label: "Total Return" },
  { key: "maxDrawdown", label: "Max Drawdown" },
  { key: "totalTrades", label: "Total Trades" },
  { key: "winRate", label: "Win Rate" },
  { key: "profitFactor", label: "Profit Factor" },
  { key: "funding", label: "Funding" },
  { key: "runningTime", label: "Running Time" },
];

function PaperTradingPerformanceSummary({ strategy, theme, innerCard }) {
  const setup = strategy?.setup;
  const stats = resolvePaperTradingStats(strategy);
  const leverage = strategy?.config?.leverage ?? setup?.leverage ?? "—";
  const marketSymbol = getPaperMarketSymbol(strategy);
  const timeframe = strategy?.timeframe ?? setup?.timeframe ?? "";
  const configMeta = [marketSymbol, timeframe, leverage].filter(Boolean).join(" · ");
  const versionLabel =
    strategy?.paperTrading?.versionLabel ?? "Running V1";

  const headerRow = (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-snug">
      <span className={theme.textMuted}>{strategy?.name}</span>
      {configMeta ? (
        <>
          <span className={theme.textMuted} aria-hidden>
            ·
          </span>
          <span className={`font-medium ${theme.textPrimary}`}>{configMeta}</span>
        </>
      ) : null}
      <span className={theme.textMuted} aria-hidden>
        ·
      </span>
      <span className={`text-[11px] font-semibold uppercase tracking-wide ${theme.textPositive}`}>
        ACTIVE
      </span>
      <span className={theme.textMuted} aria-hidden>
        ·
      </span>
      <span className={theme.textMuted}>{versionLabel}</span>
    </div>
  );

  const metricsRow = (
    <div
      className={`mt-3 border-t pt-3 ${
        theme.isV2 ? "border-white/[0.06]" : "border-[#242424]"
      }`}
    >
      <div className="ds-scrollbar-hidden -mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max gap-6 sm:gap-8">
          {PAPER_SUMMARY_METRICS.map(({ key, label }) => (
            <div key={key} className="min-w-[4.5rem] shrink-0">
              <p className={theme.metricLabel}>{label}</p>
              <p
                className={`mt-1 text-sm font-semibold tabular-nums tracking-tight ${theme.textPrimary}`}
              >
                {stats[key] ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const shellClass = theme.isV2
    ? "rounded-lg border border-[#242424] bg-[#0f0f0f] p-3 sm:p-4"
    : `p-3 ${innerCard}`;

  return (
    <div className={shellClass}>
      {headerRow}
      {metricsRow}
    </div>
  );
}

function PaperTradingSummary({ strategy, innerCard, theme, embedded = false }) {
  const summary = (
    <PaperTradingPerformanceSummary
      strategy={strategy}
      theme={theme}
      innerCard={innerCard}
    />
  );

  if (theme.isV3) {
    return embedded ? (
      <V3TabSection divider={false}>{summary}</V3TabSection>
    ) : (
      <V3TabShell>
        <V3TabSection divider={false}>{summary}</V3TabSection>
      </V3TabShell>
    );
  }

  return summary;
}

export default function StrategyWorkspaceTabs({
  strategy,
  activeTab,
  onTabChange,
  onRunBacktest,
  onStartPaper,
  backtestLoading,
}) {
  const theme = useCopilotTheme();
  const setup = strategy?.setup;
  const bt = strategy?.backtest?.results;
  const pos = strategy?.paperTrading?.position;
  const innerCard = theme.card;
  const tabs = theme.isV2 ? WORKSPACE_TABS_V2 : WORKSPACE_TABS;
  const isV2TabValid = tabs.some((t) => t.id === activeTab);
  const resolvedTab = theme.isV2 && !isV2TabValid ? "overview" : activeTab;
  const isPaperActive = strategy?.paperTrading?.status === "active";
  const isDeployed = strategy?.deployment?.status === "active";

  const tabContentClass = theme.isV3
    ? `mt-0 ${theme.overviewPanel}`
    : theme.isV2
      ? "mt-0 pt-0"
      : "mt-3 space-y-3";

  return (
    <div className={theme.isV2 ? "" : "mt-4"}>
      {!theme.isV2 ? <MetricsGrid strategy={strategy} theme={theme} /> : null}

      <Tabs
        value={resolvedTab}
        onValueChange={onTabChange}
        className={theme.isV2 ? "" : "mt-4"}
      >
        {theme.isV2 ? (
          <ScrollFade
            axis="x"
            fadeColor="var(--ds-copilot-v2-bg)"
            className={theme.isV3 ? "px-4 sm:px-5" : undefined}
          >
            <TabsList className={theme.tabsList}>
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className={theme.tabsTrigger}
                >
                  {t.label}
                  {t.id === "paper" && isPaperActive ? (
                    <span
                      className={`ml-1 inline-block size-1.5 rounded-full ${theme.activeDot}`}
                    />
                  ) : null}
                  {t.id === "deployed" && isDeployed ? (
                    <span
                      className={`ml-1 inline-block size-1.5 rounded-full ${theme.activeDot}`}
                    />
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollFade>
        ) : (
          <TabsList className={theme.tabsList}>
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className={theme.tabsTrigger}
              >
                {t.label}
                {t.id === "paper" && isPaperActive ? (
                  <span
                    className={`ml-1 inline-block size-1.5 rounded-full ${theme.activeDot}`}
                  />
                ) : null}
                {t.id === "deployed" && isDeployed ? (
                  <span
                    className={`ml-1 inline-block size-1.5 rounded-full ${theme.activeDot}`}
                  />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <div className={theme.isV2 ? theme.tabsContentWrap : undefined}>
          <TabsContent value="overview" className={tabContentClass}>
            {theme.isV2 ? (
              <OverviewTabV2 setup={setup} />
            ) : setup?.flowSteps ? (
              <StrategyFlowStepper steps={setup.flowSteps} />
            ) : null}
          </TabsContent>

          <TabsContent value="backtest" className={tabContentClass}>
            {theme.isV2 ? (
              <BacktestTabV2
                strategy={strategy}
                setup={setup}
                bt={bt}
                backtestLoading={backtestLoading}
                onRunBacktest={onRunBacktest}
              />
            ) : strategy?.backtest?.status !== "complete" || !bt ? (
              <div className="mb-3">
                <Button
                  size="sm"
                  variant="default"
                  loading={backtestLoading}
                  onClick={onRunBacktest}
                  disabled={backtestLoading}
                >
                  Run Backtest
                </Button>
              </div>
            ) : null}
            {!theme.isV2 && strategy?.backtest?.status === "complete" && bt ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  <Metric
                    label="Total Return"
                    value={bt.totalReturn}
                    tone="positive"
                    theme={theme}
                  />
                  <Metric
                    label="Max Drawdown"
                    value={bt.maxDrawdown}
                    tone="negative"
                    theme={theme}
                  />
                  <Metric label="Win Rate" value={bt.winRate} theme={theme} />
                  <Metric
                    label="Profit Factor"
                    value={bt.profitFactor}
                    theme={theme}
                  />
                  <Metric label="Sharpe" value={bt.sharpeRatio} theme={theme} />
                </div>
                <EquityCurveMock theme={theme} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className={`p-3 text-xs ${innerCard}`}>
                    <p className="font-medium text-[#bfbfbf]">Returns</p>
                    <p className="mt-1 text-[#929292]">
                      Buy & Hold:{" "}
                      <span className="text-[#269755]">{bt.buyAndHold}</span>
                    </p>
                    <p className="text-[#929292]">
                      Outperformance:{" "}
                      <span className="text-[#D53D3D]">
                        {bt.outperformance}
                      </span>
                    </p>
                    <p className="text-[#929292]">
                      Expected payoff: {bt.expectedPayoff}
                    </p>
                  </div>
                  <div className={`p-3 text-xs ${innerCard}`}>
                    <p className="font-medium text-[#bfbfbf]">Trade analysis</p>
                    <p className="mt-1 text-[#929292]">Best: {bt.largestWin}</p>
                    <p className="text-[#929292]">Worst: {bt.largestLoss}</p>
                    <p className="text-[#929292]">
                      Avg win / loss: {bt.avgProfit} / {bt.avgLoss}
                    </p>
                    <p className="text-[#929292]">{bt.winLoss}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-xs text-[#929292]">
                  {bt.insights?.map((i) => (
                    <li key={i}>· {i}</li>
                  ))}
                </ul>
              </div>
            ) : !theme.isV2 ? (
              <p className="text-xs text-[#757575]">
                Run a backtest to preview historical performance estimates.
              </p>
            ) : null}
          </TabsContent>

          <TabsContent value="paper" className={tabContentClass}>
            {!isPaperActive ? (
              theme.isV3 ? (
                <V3TabShell>
                  <CopilotTabLead
                    isV3
                    title="Paper trading"
                    description="Simulate this strategy using market-like data without risking real capital. Manual approval is required before any live deployment."
                    actions={
                      <button
                        type="button"
                        className={theme.primaryActionBtn}
                        onClick={onStartPaper}
                      >
                        Start Paper Trading
                      </button>
                    }
                  />
                </V3TabShell>
              ) : (
                <CopilotTabLead
                  isV3={false}
                  title="Paper trading"
                  description="Simulate this strategy using market-like data without risking real capital. Manual approval is required before any live deployment."
                  actions={
                    <button
                      type="button"
                      className={theme.primaryActionBtn}
                      onClick={onStartPaper}
                    >
                      Start Paper Trading
                    </button>
                  }
                />
              )
            ) : theme.isV3 ? (
              <V3TabShell>
                <PaperTradingSummary
                  strategy={strategy}
                  innerCard={innerCard}
                  theme={theme}
                  embedded
                />
                <ExecutionNestedTabs
                  strategy={strategy}
                  pos={pos}
                  theme={theme}
                  nestedInV3
                />
              </V3TabShell>
            ) : (
              <div className="space-y-1">
                <PaperTradingSummary
                  strategy={strategy}
                  innerCard={innerCard}
                  theme={theme}
                />
                {theme.isV2 ? (
                  <ExecutionNestedTabs
                    strategy={strategy}
                    pos={pos}
                    theme={theme}
                  />
                ) : null}
              </div>
            )}
          </TabsContent>

          {theme.isV2 ? (
            <TabsContent value="deployed" className={tabContentClass}>
              {!isDeployed ? (
                theme.isV3 ? (
                  <V3TabShell>
                    <V3TabLead>
                      <h4 className={v3SectionTitle}>Deployed</h4>
                      <p className={`mt-2 max-w-xl ${v3BodyText}`}>
                        Deploy this strategy after completing the manual review.
                        Execution tables (positions, orders, history, balance)
                        appear here once deployed.
                      </p>
                      <p className={`mt-3 ${v3BodyText}`}>
                        Use the Deploy button in the header and confirm manual
                        review to activate live monitoring.
                      </p>
                    </V3TabLead>
                  </V3TabShell>
                ) : (
                  <>
                    <p className="text-xs leading-relaxed text-[#929292]">
                      Deploy this strategy after completing the manual review.
                      Execution tables (positions, orders, history, balance)
                      appear here once deployed.
                    </p>
                    <p className="mt-2 text-[11px] text-[#757575]">
                      Use the Deploy button in the header and confirm manual
                      review to activate live monitoring.
                    </p>
                  </>
                )
              ) : theme.isV3 ? (
                <V3TabShell>
                  <V3TabSection>
                    <h4 className={v3SectionTitle}>Deployed</h4>
                    <p className={`mt-2 ${v3BodyText}`}>
                      Status:{" "}
                      <span className={`font-medium ${theme.textPositive}`}>
                        Deployed
                      </span>
                    </p>
                    <p className={`mt-2 ${v3BodyText}`}>
                      Live execution monitoring — manual approval remains
                      required for each trade.
                    </p>
                  </V3TabSection>
                  <ExecutionNestedTabs
                    strategy={strategy}
                    pos={pos}
                    theme={theme}
                    nestedInV3
                  />
                </V3TabShell>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs">
                    Status:{" "}
                    <span className="font-medium text-[#00F3B6]">Deployed</span>
                  </p>
                  <p className="text-[11px] text-[#757575]">
                    Live execution monitoring — manual approval remains required
                    for each trade.
                  </p>
                  <ExecutionNestedTabs
                    strategy={strategy}
                    pos={pos}
                    theme={theme}
                  />
                </div>
              )}
            </TabsContent>
          ) : null}

          {!theme.isV2 ? (
            <>
              <TabsContent value="positions" className={tabContentClass}>
                {theme.isV2 ? (
                  <EmptySectionTable
                    columns={[
                      "Coin",
                      "Size",
                      "Position Value",
                      "Entry Price",
                      "Current Price",
                      "PNL (ROE%)",
                      "Liq. Price",
                      "Margin",
                      "Funding",
                      "TP/SL",
                      "Exp. Profit(%) / Exp. Loss(%)",
                      "Action",
                    ]}
                    message="No open positions yet."
                  />
                ) : pos ? (
                  <div className="overflow-x-auto rounded-lg border border-[#242424]">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#242424] text-[#757575]">
                        <tr>
                          <th className="px-3 py-2">Market</th>
                          <th className="px-3 py-2">Side</th>
                          <th className="px-3 py-2">Size</th>
                          <th className="px-3 py-2">Entry</th>
                          <th className="px-3 py-2">Current</th>
                          <th className="px-3 py-2">PnL</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2">{pos.market}</td>
                          <td className="px-3 py-2">{pos.side}</td>
                          <td className="px-3 py-2">{pos.size ?? "—"}</td>
                          <td className="px-3 py-2">{pos.entry}</td>
                          <td className="px-3 py-2">{pos.current}</td>
                          <td className="px-3 py-2 text-[#269755]">
                            {pos.pnl}
                          </td>
                          <td className="px-3 py-2">{pos.status}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-[#757575]">
                    No open paper or live positions.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="open-orders" className={tabContentClass}>
                <EmptySectionTable
                  columns={[
                    "Time",
                    "Type",
                    "Coin",
                    "Direction",
                    "Original Size",
                    "Filled Size",
                    "Order Value",
                    "Price",
                    "Trigger Conditions",
                    "Action",
                  ]}
                  message="No open orders."
                />
              </TabsContent>

              <TabsContent value="order-history" className={tabContentClass}>
                <EmptySectionTable
                  columns={[
                    "Time",
                    "Type",
                    "Coin",
                    "Direction",
                    "Original Size",
                    "Filled Size",
                    "Order Value",
                    "Price",
                    "Trigger Conditions",
                  ]}
                  message="No order history."
                />
              </TabsContent>

              <TabsContent value="trade-history" className={tabContentClass}>
                <EmptySectionTable
                  columns={[
                    "Time",
                    "Coin",
                    "Direction",
                    "Price",
                    "Size",
                    "Trade Value",
                    "Fee",
                    "Closed PNL",
                  ]}
                  message="No trade history."
                />
              </TabsContent>

              <TabsContent value="balance" className={tabContentClass}>
                <EmptySectionTable
                  columns={[
                    "Coin",
                    "Total balance",
                    "Available balance",
                    "USDC Value",
                  ]}
                  message="No balance data."
                />
              </TabsContent>
            </>
          ) : null}

          <TabsContent value="trades" className={tabContentClass}>
            {theme.isV2 ? (
              <p className="text-xs text-[#757575]">
                Use Trade History tab in Strategy Copilot v2.
              </p>
            ) : strategy?.trades?.length ? (
              <div className="overflow-x-auto rounded-lg border border-[#242424]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#242424] text-[#757575]">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Market</th>
                      <th className="px-3 py-2">Side</th>
                      <th className="px-3 py-2">Entry</th>
                      <th className="px-3 py-2">Exit</th>
                      <th className="px-3 py-2">PnL</th>
                      <th className="px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.trades.map((t) => (
                      <tr key={t.id} className="border-b border-[#242424]/60">
                        <td className="px-3 py-2 text-[#929292]">{t.at}</td>
                        <td className="px-3 py-2">{t.market ?? "—"}</td>
                        <td className="px-3 py-2">{t.direction}</td>
                        <td className="px-3 py-2">{t.entry}</td>
                        <td className="px-3 py-2">{t.exit}</td>
                        <td
                          className={`px-3 py-2 ${String(t.pnl).startsWith("+") ? "text-[#269755]" : "text-[#D53D3D]"}`}
                        >
                          {t.pnl}
                        </td>
                        <td className="px-3 py-2 text-[#757575]">{t.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#757575]">
                No trades yet — run a backtest first.
              </p>
            )}
          </TabsContent>

          <TabsContent value="logs" className={tabContentClass}>
            {theme.isV2 ? (
              <p className="text-xs text-[#757575]">
                Use Order History/Trade History in Strategy Copilot v2.
              </p>
            ) : (
              <ul className={`space-y-1.5 p-3 ${innerCard}`}>
                {strategy?.logs?.map((l) => (
                  <li key={l.id} className="text-xs text-[#929292]">
                    <span className="text-[#585858]">{l.at ?? l.ago} · </span>
                    {l.message}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
