import { Button } from "../../../ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs.jsx";
import { WORKSPACE_TABS } from "../strategyWorkstationMockData.js";
import StrategyFlowStepper from "../StrategyFlowStepper.jsx";

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-[#242424] bg-[#121212] px-2.5 py-2">
      <p className="text-[10px] text-[#757575]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">{value}</p>
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

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        <Metric label="Total Return" value={m.totalReturn ?? "—"} />
        <Metric label="Max Drawdown" value={m.maxDrawdown ?? "—"} />
        <Metric label="Win Rate" value={m.winRate ?? "—"} />
        <Metric label="Profit Factor" value={m.profitFactor ?? "—"} />
        <Metric label="Sharpe" value={m.sharpeRatio ?? "—"} />
        <Metric label="Trades" value={m.trades ?? 0} />
        <Metric label="Paper PnL" value={m.paperPnl ?? "$0"} />
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
        <TabsList className="minimal-scrollbar !flex w-full flex-nowrap gap-1 overflow-x-auto border-[#242424] bg-black p-1">
          {WORKSPACE_TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="!shrink-0 !text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-3">
          {setup?.flowSteps ? (
            <StrategyFlowStepper steps={setup.flowSteps} />
          ) : null}
          <div className="mt-3 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
            <h4 className="text-xs font-semibold text-[#bfbfbf]">Strategy logic</h4>
            <ul className="mt-2 space-y-1">
              {(setup?.strategyLogic ?? []).map((r) => (
                <li key={r} className="text-xs text-[#929292]">
                  · {r}
                </li>
              ))}
            </ul>
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
          {strategy?.backtest?.status === "complete" ? (
            <>
              <div className="grid gap-2 sm:grid-cols-3">
                <Metric label="Return" value={strategy.backtest.results.totalReturn} />
                <Metric label="Drawdown" value={strategy.backtest.results.maxDrawdown} />
                <Metric label="Win Rate" value={strategy.backtest.results.winRate} />
              </div>
              <div className="h-24 rounded-lg border border-[#242424] bg-[#121212] p-3">
                <p className="text-[10px] text-[#757575]">Equity curve (mock)</p>
                <svg viewBox="0 0 200 40" className="mt-2 h-12 w-full" aria-hidden>
                  <path
                    d="M0,35 L30,28 L60,32 L90,18 L120,22 L150,10 L180,14 L200,8"
                    fill="none"
                    stroke="#f2b500"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <ul className="space-y-1 text-xs text-[#929292]">
                {strategy.backtest.results.insights?.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-[#757575]">
              Run a backtest to preview historical performance.
            </p>
          )}
        </TabsContent>

        <TabsContent value="paper" className="mt-3 space-y-3">
          <Button
            size="sm"
            variant="default"
            onClick={onStartPaper}
            disabled={strategy?.paperTrading?.status === "active"}
          >
            Start Paper Trading
          </Button>
          {strategy?.paperTrading?.status === "active" ? (
            <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 text-xs">
              <p className="text-[#929292]">
                Status: <span className="text-[#00f3b6]">Active</span> · Mode: Paper
              </p>
              <p className="mt-1">Balance: {strategy.paperTrading.balance}</p>
              <p>Paper PnL: {strategy.paperTrading.pnl}</p>
              <ul className="mt-2 space-y-0.5 text-[#757575]">
                {strategy.paperTrading.events?.map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-[#757575]">Paper trading not started.</p>
          )}
        </TabsContent>

        <TabsContent value="positions" className="mt-3">
          {strategy?.paperTrading?.position || setup ? (
            <div className="rounded-lg border border-[#242424] p-3 text-xs">
              <p>Direction: {setup?.direction ?? "—"}</p>
              <p className="mt-1">Entry: {setup?.entryZone ?? "—"}</p>
              <p>Stop: {setup?.stopLoss ?? "—"}</p>
              <p>Target: {setup?.takeProfit ?? "—"}</p>
              <p className="mt-2 text-[#757575]">Waiting for entry confirmation</p>
            </div>
          ) : (
            <p className="text-xs text-[#757575]">No open position.</p>
          )}
        </TabsContent>

        <TabsContent value="trades" className="mt-3">
          {strategy?.trades?.length ? (
            <div className="overflow-x-auto rounded-lg border border-[#242424]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#242424] text-[#757575]">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Dir</th>
                    <th className="px-3 py-2">Entry</th>
                    <th className="px-3 py-2">Exit</th>
                    <th className="px-3 py-2">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {strategy.trades.map((t) => (
                    <tr key={t.id} className="border-b border-[#242424]/60">
                      <td className="px-3 py-2 text-[#929292]">{t.at}</td>
                      <td className="px-3 py-2">{t.direction}</td>
                      <td className="px-3 py-2">{t.entry}</td>
                      <td className="px-3 py-2">{t.exit}</td>
                      <td className="px-3 py-2">{t.pnl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#757575]">No trades yet.</p>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-3">
          <ul className="space-y-1.5">
            {strategy?.logs?.map((l) => (
              <li key={l.id} className="text-xs text-[#929292]">
                · {l.message}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
