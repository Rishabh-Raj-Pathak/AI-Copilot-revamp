import { useState } from "react";
import { Button } from "../../../ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import StrategyFlowStepper from "../StrategyFlowStepper.jsx";
import StrategyLogicCard from "./StrategyLogicCard.jsx";
import BacktestTabV2 from "./overview/BacktestTabV2.jsx";
import OverviewTabV2 from "./overview/OverviewTabV2.jsx";
import ScrollFade from "./ScrollFade.jsx";
import { WORKSPACE_TABS } from "../strategyWorkstationMockData.js";

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
  if (theme?.isV2) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/6 bg-[#141716]">
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
      <div className="px-3 py-10 text-center text-sm text-[#757575]">{message}</div>
    </div>
  );
}

function Metric({ label, value, tone, theme }) {
  const color =
    tone === "positive"
      ? theme.isV2
        ? theme.textPositive
        : "text-[#00f3b6]"
      : tone === "negative"
        ? theme.isV2
          ? theme.textNegative
          : "text-[#d53d3d]"
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
            <stop offset="0%" stopColor="#19E6A3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#19E6A3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eq-line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D7F70B" />
            <stop offset="100%" stopColor="#16E6A3" />
          </linearGradient>
          <filter id="eq-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#19E6A3" floodOpacity="0.35" />
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
        <circle cx="232" cy="11" r="2.4" fill="#19E6A3" />
        <circle cx="232" cy="15" r="2" fill="#7b7b7b" />
      </svg>
      <div className="mt-2.5 flex gap-4 text-[10px]">
        <span className="flex items-center gap-1.5 text-[#19E6A3]">
          <span className="inline-block h-px w-3 bg-[#19E6A3]" aria-hidden />
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

function StatusPanel({ strategy, theme }) {
  return (
    <div className={theme.statusCard}>
      <h4
        className={
          theme.isV2
            ? "text-xs font-medium text-[#929292]"
            : "text-xs font-semibold text-[#bfbfbf]"
        }
      >
        Status
      </h4>
      <p
        className={
          theme.isV2
            ? "mt-2 text-2xl font-bold text-white"
            : "mt-2 text-lg font-bold text-white"
        }
      >
        {strategy.status}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[#757575]">
        Execution: Manual approval · Max leverage{" "}
        {strategy.config?.leverage ?? "3x"}
      </p>
    </div>
  );
}

function AiNotesPanel({ setup, theme }) {
  const innerCard = theme.card;
  return (
    <div className={theme.isV2 ? theme.statusCard : `p-3 ${innerCard}`}>
      <h4
        className={
          theme.isV2
            ? "text-xs font-medium text-[#929292]"
            : "text-xs font-semibold text-[#bfbfbf]"
        }
      >
        AI notes
      </h4>
      <ul className="mt-2 space-y-1.5">
        {(setup?.aiNotes ?? ["Backtest estimates are not guarantees."]).map(
          (n) => (
            <li key={n} className="text-[11px] leading-relaxed text-[#929292]">
              · {n}
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function ExecutionNestedTabs({ strategy, pos, theme, tabContentClass }) {
  const [executionTab, setExecutionTab] = useState("positions");
  const nestedContentClass = theme.isV2 ? "mt-3" : "mt-3 space-y-3";

  return (
    <Tabs value={executionTab} onValueChange={setExecutionTab} className="mt-4">
      {theme.isV2 ? (
        <ScrollFade axis="x" fadeColor="var(--ds-copilot-v2-elevated)">
          <TabsList className={`${theme.tabsList} flex-wrap`}>
            {EXECUTION_SUBTABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className={theme.tabsTrigger}>
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
                  <td className="px-3 py-2 text-[#00f3b6]">{pos.pnl}</td>
                  <td className="px-3 py-2">{pos.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#757575]">No open paper or live positions.</p>
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

function PaperTradingSummary({ strategy, pos, innerCard, theme }) {
  return (
    <div className="space-y-3">
      <p className="text-xs">
        Status:{" "}
        <span className={`font-medium ${theme.textMint}`}>Paper Trading Active</span>
      </p>
      {pos ? (
        <div className={`p-3 ${theme.isV2 ? "rounded-lg border border-white/[0.05] bg-[#101312]" : innerCard}`}>
          <p className="text-xs font-semibold text-white">
            {pos.market} {pos.side}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {[
              ["Entry", pos.entry],
              ["Current", pos.current],
              ["PnL", pos.pnl],
              ["Stop loss", pos.stopLoss],
              ["Take profit", pos.takeProfit],
              ["Time in trade", pos.timeInTrade],
              ["Status", pos.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-[#757575]">{k}</dt>
                <dd
                  className={
                            k === "PnL" && String(v).startsWith("+")
                              ? `font-medium ${theme.textPositive}`
                              : theme.isV2
                                ? theme.textSecondary
                                : "text-[#bfbfbf]"
                  }
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      <ul className="space-y-0.5 text-[11px] text-[#757575]">
        {strategy.paperTrading.events?.map((e) => (
          <li key={e}>· {e}</li>
        ))}
      </ul>
    </div>
  );
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

  const tabContentClass = theme.isV2 ? "mt-0 p-4 sm:p-5" : "mt-3 space-y-3";

  return (
    <div className={theme.isV2 ? "" : "mt-4"}>
      {!theme.isV2 ? (
        <MetricsGrid strategy={strategy} theme={theme} />
      ) : null}

      <Tabs value={resolvedTab} onValueChange={onTabChange} className={theme.isV2 ? "" : "mt-4"}>
        {theme.isV2 ? (
          <ScrollFade axis="x" fadeColor="var(--ds-copilot-v2-bg)">
            <TabsList className={theme.tabsList}>
              {tabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className={theme.tabsTrigger}>
                  {t.label}
                  {t.id === "paper" && isPaperActive ? (
                    <span className="ml-1 inline-block size-1.5 rounded-full bg-[var(--ds-copilot-v2-mint)]" />
                  ) : null}
                  {t.id === "deployed" && isDeployed ? (
                    <span className="ml-1 inline-block size-1.5 rounded-full bg-[#19E6A3]" />
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollFade>
        ) : (
          <TabsList className={theme.tabsList}>
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className={theme.tabsTrigger}>
                {t.label}
                {t.id === "paper" && isPaperActive ? (
                  <span className="ml-1 inline-block size-1.5 rounded-full bg-[#00f3b6]" />
                ) : null}
                {t.id === "deployed" && isDeployed ? (
                  <span className="ml-1 inline-block size-1.5 rounded-full bg-[#19E6A3]" />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <div className={theme.isV2 ? theme.tabsContentWrap : undefined}>
          <TabsContent value="overview" className={tabContentClass}>
            {theme.isV2 ? (
              <OverviewTabV2
                strategy={strategy}
                setup={setup}
                statusPanel={<StatusPanel strategy={strategy} theme={theme} />}
                aiNotesPanel={<AiNotesPanel setup={setup} theme={theme} />}
              />
            ) : (
              <>
                {setup?.flowSteps ? (
                  <StrategyFlowStepper steps={setup.flowSteps} />
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  <StatusPanel strategy={strategy} theme={theme} />
                  <AiNotesPanel setup={setup} theme={theme} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="backtest" className={tabContentClass}>
            {theme.isV2 ? (
              <BacktestTabV2
                strategy={strategy}
                bt={bt}
                backtestLoading={backtestLoading}
                onRunBacktest={onRunBacktest}
                onGoOverview={() => onTabChange("overview")}
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
                    <Metric label="Profit Factor" value={bt.profitFactor} theme={theme} />
                    <Metric label="Sharpe" value={bt.sharpeRatio} theme={theme} />
                  </div>
                  <EquityCurveMock theme={theme} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className={`p-3 text-xs ${innerCard}`}>
                      <p className="font-medium text-[#bfbfbf]">Returns</p>
                      <p className="mt-1 text-[#929292]">
                        Buy & Hold:{" "}
                        <span className="text-[#00f3b6]">{bt.buyAndHold}</span>
                      </p>
                      <p className="text-[#929292]">
                        Outperformance:{" "}
                        <span className="text-[#d53d3d]">{bt.outperformance}</span>
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
            ) : (
              <p className="text-xs text-[#757575]">
                Run a backtest to preview historical performance estimates.
              </p>
            )}
          </TabsContent>

          <TabsContent value="paper" className={tabContentClass}>
            {!isPaperActive ? (
              <>
                <p className="text-xs leading-relaxed text-[#929292]">
                  Simulate this strategy using market-like data without risking real
                  capital. Manual approval is required before any live deployment.
                </p>
                <button
                  type="button"
                  className={theme.primaryActionBtn}
                  onClick={onStartPaper}
                >
                  Start Paper Trading
                </button>
              </>
            ) : (
              <div className="space-y-1">
                <PaperTradingSummary
                  strategy={strategy}
                  pos={pos}
                  innerCard={innerCard}
                  theme={theme}
                />
                {theme.isV2 ? (
                  <ExecutionNestedTabs strategy={strategy} pos={pos} theme={theme} />
                ) : null}
              </div>
            )}
          </TabsContent>

          {theme.isV2 ? (
            <TabsContent value="deployed" className={tabContentClass}>
              {!isDeployed ? (
                <>
                  <p className="text-xs leading-relaxed text-[#929292]">
                    Deploy this strategy after completing the manual review. Execution
                    tables (positions, orders, history, balance) appear here once
                    deployed.
                  </p>
                  <p className="mt-2 text-[11px] text-[#757575]">
                    Use the Deploy button in the header and confirm manual review to
                    activate live monitoring.
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs">
                    Status:{" "}
                    <span className="font-medium text-[#19E6A3]">Deployed</span>
                  </p>
                  <p className="text-[11px] text-[#757575]">
                    Live execution monitoring — manual approval remains required for
                    each trade.
                  </p>
                  <ExecutionNestedTabs strategy={strategy} pos={pos} theme={theme} />
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
                      <td className="px-3 py-2 text-[#00f3b6]">{pos.pnl}</td>
                      <td className="px-3 py-2">{pos.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#757575]">No open paper or live positions.</p>
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
              columns={["Coin", "Total balance", "Available balance", "USDC Value"]}
              message="No balance data."
            />
          </TabsContent>
          </>
          ) : null}

          <TabsContent value="trades" className={tabContentClass}>
            {theme.isV2 ? (
              <p className="text-xs text-[#757575]">Use Trade History tab in Strategy Copilot v2.</p>
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
                          className={`px-3 py-2 ${String(t.pnl).startsWith("+") ? "text-[#00f3b6]" : "text-[#d53d3d]"}`}
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
              <p className="text-xs text-[#757575]">No trades yet — run a backtest first.</p>
            )}
          </TabsContent>

          <TabsContent value="logs" className={tabContentClass}>
            {theme.isV2 ? (
              <p className="text-xs text-[#757575]">Use Order History/Trade History in Strategy Copilot v2.</p>
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
