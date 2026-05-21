import { Button } from "../../../ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs.jsx";
import { WORKSPACE_TABS } from "../strategyWorkstationMockData.js";
import StrategyFlowStepper from "../StrategyFlowStepper.jsx";

function Metric({ label, value, tone }) {
  const color =
    tone === "positive"
      ? "text-[#00f3b6]"
      : tone === "negative"
        ? "text-[#d53d3d]"
        : "text-white";
  return (
    <div className="rounded-md border border-[#242424] bg-[#121212] px-2.5 py-2">
      <p className="text-[10px] text-[#757575]">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function EquityCurveMock() {
  return (
    <div className="rounded-lg border border-[#242424] bg-[#121212] p-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[#757575]">Equity curve</span>
        <span className="text-[#585858]">vs Buy & Hold</span>
      </div>
      <svg viewBox="0 0 240 48" className="mt-2 h-16 w-full" aria-hidden>
        <path
          d="M0,40 L24,34 L48,36 L72,28 L96,30 L120,18 L144,22 L168,12 L192,16 L216,8 L240,10"
          fill="none"
          stroke="#f2b500"
          strokeWidth="1.5"
        />
        <path
          d="M0,38 L40,36 L80,32 L120,28 L160,24 L200,20 L240,16"
          fill="none"
          stroke="#585858"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      </svg>
      <div className="mt-1 flex gap-3 text-[10px]">
        <span className="text-[#f2b500]">Strategy</span>
        <span className="text-[#585858]">Buy & Hold</span>
      </div>
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
  const setup = strategy?.setup;
  const m = strategy?.metrics ?? {};
  const bt = strategy?.backtest?.results;
  const pos = strategy?.paperTrading?.position;

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Metric
          label="Total Return"
          value={m.totalReturn ?? "—"}
          tone={m.totalReturn?.startsWith("+") ? "positive" : undefined}
        />
        <Metric
          label="Max Drawdown"
          value={m.maxDrawdown ?? "—"}
          tone={m.maxDrawdown?.startsWith("-") ? "negative" : undefined}
        />
        <Metric label="Win Rate" value={m.winRate ?? "—"} />
        <Metric label="Profit Factor" value={m.profitFactor ?? "—"} />
        <Metric label="Sharpe" value={m.sharpeRatio ?? "—"} />
        <Metric label="Trades" value={String(m.trades ?? 0)} />
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
        <TabsList className="minimal-scrollbar !flex w-full flex-nowrap gap-1 overflow-x-auto border-[#242424] bg-black p-1">
          {WORKSPACE_TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="!shrink-0 !text-xs">
              {t.label}
              {t.id === "paper" && strategy?.paperTrading?.status === "active" ? (
                <span className="ml-1 inline-block size-1.5 rounded-full bg-[#00f3b6]" />
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-3 space-y-3">
          {setup?.flowSteps ? <StrategyFlowStepper steps={setup.flowSteps} /> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
              <h4 className="text-xs font-semibold text-[#bfbfbf]">Status</h4>
              <p className="mt-1 text-sm text-white">{strategy.status}</p>
              <p className="mt-2 text-[11px] text-[#757575]">
                Execution: Manual approval · Max leverage {strategy.config?.leverage ?? "3x"}
              </p>
            </div>
            <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
              <h4 className="text-xs font-semibold text-[#bfbfbf]">AI notes</h4>
              <ul className="mt-2 space-y-1">
                {(setup?.aiNotes ?? ["Backtest estimates are not guarantees."]).map((n) => (
                  <li key={n} className="text-[11px] text-[#929292]">
                    · {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backtest" className="mt-3 space-y-3">
          <Button
            size="sm"
            variant="default"
            loading={backtestLoading}
            onClick={onRunBacktest}
            disabled={strategy?.backtest?.status === "complete"}
          >
            Run Backtest
          </Button>
          {strategy?.backtest?.status === "complete" && bt ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <Metric label="Total Return" value={bt.totalReturn} tone="positive" />
                <Metric label="Max Drawdown" value={bt.maxDrawdown} tone="negative" />
                <Metric label="Win Rate" value={bt.winRate} />
                <Metric label="Profit Factor" value={bt.profitFactor} />
                <Metric label="Sharpe" value={bt.sharpeRatio} />
              </div>
              <EquityCurveMock />
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 text-xs">
                  <p className="font-medium text-[#bfbfbf]">Returns</p>
                  <p className="mt-1 text-[#929292]">
                    Buy & Hold: <span className="text-[#00f3b6]">{bt.buyAndHold}</span>
                  </p>
                  <p className="text-[#929292]">
                    Outperformance: <span className="text-[#d53d3d]">{bt.outperformance}</span>
                  </p>
                  <p className="text-[#929292]">Expected payoff: {bt.expectedPayoff}</p>
                </div>
                <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 text-xs">
                  <p className="font-medium text-[#bfbfbf]">Trade analysis</p>
                  <p className="mt-1 text-[#929292]">Best: {bt.largestWin}</p>
                  <p className="text-[#929292]">Worst: {bt.largestLoss}</p>
                  <p className="text-[#929292]">
                    Avg win / loss: {bt.avgProfit} / {bt.avgLoss}
                  </p>
                  <p className="text-[#929292]">{bt.winLoss}</p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-[#929292]">
                {bt.insights?.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-[#757575]">
              Run a backtest to preview historical performance estimates.
            </p>
          )}
        </TabsContent>

        <TabsContent value="paper" className="mt-3 space-y-3">
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
                <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
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

        <TabsContent value="positions" className="mt-3">
          {pos ? (
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

        <TabsContent value="trades" className="mt-3">
          {strategy?.trades?.length ? (
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

        <TabsContent value="logs" className="mt-3">
          <ul className="space-y-1.5 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
            {strategy?.logs?.map((l) => (
              <li key={l.id} className="text-xs text-[#929292]">
                <span className="text-[#585858]">{l.at ?? l.ago} · </span>
                {l.message}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
