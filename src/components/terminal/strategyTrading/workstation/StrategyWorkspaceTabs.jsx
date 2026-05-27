import { Button } from "../../../ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import StrategyFlowStepper from "../StrategyFlowStepper.jsx";
import StrategyLogicCard from "./StrategyLogicCard.jsx";
import BacktestTabV2 from "./overview/BacktestTabV2.jsx";
import OverviewTabV2 from "./overview/OverviewTabV2.jsx";
import { WORKSPACE_TABS } from "../strategyWorkstationMockData.js";

const WORKSPACE_TABS_V2 = [
  { id: "overview", label: "Overview" },
  { id: "backtest", label: "Backtest" },
  { id: "paper", label: "Paper Trading" },
  { id: "positions", label: "Positions" },
  { id: "open-orders", label: "Open Orders" },
  { id: "order-history", label: "Order History" },
  { id: "trade-history", label: "Trade History" },
  { id: "balance", label: "Balance" },
];

function EmptySectionTable({ columns, message }) {
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
      ? "text-[#00f3b6]"
      : tone === "negative"
        ? "text-[#d53d3d]"
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
                ? "text-[#00f3b6]"
                : cell.tone === "negative"
                  ? "text-[#d53d3d]"
                  : "text-white";
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
            <stop offset="0%" stopColor="#f2b500" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#f2b500" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eq-line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f4c31f" />
            <stop offset="100%" stopColor="#f2b500" />
          </linearGradient>
          <filter id="eq-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f2b500" floodOpacity="0.45" />
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
        <circle cx="232" cy="11" r="2.4" fill="#f2b500" />
        <circle cx="232" cy="15" r="2" fill="#7b7b7b" />
      </svg>
      <div className="mt-2.5 flex gap-4 text-[10px]">
        <span className="flex items-center gap-1.5 text-[#f2b500]">
          <span className="inline-block h-px w-3 bg-[#f2b500]" aria-hidden />
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

  const tabContentClass = theme.isV2 ? "mt-0 p-4 sm:p-5" : "mt-3 space-y-3";

  return (
    <div className={theme.isV2 ? "" : "mt-4"}>
      {!theme.isV2 ? (
        <MetricsGrid strategy={strategy} theme={theme} />
      ) : null}

      <Tabs value={resolvedTab} onValueChange={onTabChange} className={theme.isV2 ? "" : "mt-4"}>
        <TabsList className={theme.tabsList}>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className={theme.tabsTrigger}>
              {t.label}
              {t.id === "paper" && strategy?.paperTrading?.status === "active" ? (
                <span className="ml-1 inline-block size-1.5 rounded-full bg-[#00f3b6]" />
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

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
            {strategy?.paperTrading?.status !== "active" ? (
              <>
                <p className="text-xs leading-relaxed text-[#929292]">
                  Simulate this strategy using market-like data without risking real
                  capital. Manual approval is required before any live deployment.
                </p>
                <Button size="sm" variant="default" onClick={onStartPaper}>
                  Start Paper Trading
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs">
                  Status:{" "}
                  <span className="font-medium text-[#00f3b6]">Paper Trading Active</span>
                </p>
                {pos ? (
                  <div className={`p-3 ${innerCard}`}>
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
                                ? "font-medium text-[#00f3b6]"
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
            )}
          </TabsContent>

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
