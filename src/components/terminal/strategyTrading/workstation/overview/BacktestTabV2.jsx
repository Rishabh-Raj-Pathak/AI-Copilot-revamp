import { Play } from "lucide-react";
import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import ScrollFade from "../ScrollFade.jsx";
import {
  CopilotTabLead,
  V3TabSection,
  V3TabShell,
} from "../V3TabLayout.jsx";
import OverviewBacktestInsights from "./OverviewBacktestInsights.jsx";
import OverviewEquityChart from "./OverviewEquityChart.jsx";
import OverviewKpiStrip from "./OverviewKpiStrip.jsx";
import OverviewPerformancePanel from "./OverviewPerformancePanel.jsx";
import OverviewTradesAnalysis from "./OverviewTradesAnalysis.jsx";

function BacktestResultsSections({ bt, setup }) {
  return (
    <>
      <OverviewKpiStrip bt={bt} />
      <OverviewEquityChart bt={bt} range={setup} />
      <OverviewPerformancePanel bt={bt} />
      <OverviewTradesAnalysis bt={bt} />
      <OverviewBacktestInsights insights={bt.insights} />
    </>
  );
}

export default function BacktestTabV2({
  strategy,
  setup,
  bt,
  backtestLoading,
  onRunBacktest,
}) {
  const theme = useCopilotTheme();
  const complete = strategy?.backtest?.status === "complete" && bt;
  const trades = strategy?.trades ?? [];

  const description = complete
    ? "Historical performance estimate for this strategy configuration."
    : "Run a backtest to preview historical performance estimates for this strategy.";

  const actions = (
    <button
      type="button"
      className={theme.primaryActionBtn}
      onClick={onRunBacktest}
      disabled={backtestLoading}
      aria-busy={backtestLoading}
    >
      {backtestLoading ? (
        <span
          className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-[#030504]/30 border-t-[#030504]"
          aria-hidden
        />
      ) : (
        <Play className="size-3.5 shrink-0" aria-hidden />
      )}
      {complete ? "Re-run Backtest" : "Run Backtest"}
    </button>
  );

  const resultsSections = complete ? (
    <BacktestResultsSections bt={bt} setup={setup} />
  ) : null;

  const tradesTable =
    complete && trades.length > 0 ? (
      theme.isV3 ? (
        <V3TabSection divider={false}>
          <p className="mb-3 text-sm font-medium tracking-tight text-[rgba(255,255,255,0.9)]">
            Backtest trades
          </p>
          <div className={theme.tableShell}>
            <ScrollFade
              axis="x"
              fadeColor="var(--ds-copilot-v2-bg)"
              className="border-b border-white/6"
            >
              <table className="w-full text-left text-xs">
                <thead className="text-[rgba(255,255,255,0.48)]">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                      Date
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                      Side
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                      Entry
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                      Exit
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                      PnL
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                      Reason
                    </th>
                  </tr>
                </thead>
              </table>
            </ScrollFade>
            <ScrollFade axis="x" fadeColor="var(--ds-copilot-v2-bg)">
              <table className="w-full text-left text-xs">
                <tbody>
                  {trades.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/[0.05] last:border-0"
                    >
                      <td className="px-3 py-2.5 text-[rgba(255,255,255,0.48)]">
                        {t.at}
                      </td>
                      <td className="px-3 py-2.5 text-[rgba(255,255,255,0.78)]">
                        {t.direction}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-[rgba(255,255,255,0.78)]">
                        {t.entry}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-[rgba(255,255,255,0.78)]">
                        {t.exit}
                      </td>
                      <td
                        className={`px-3 py-2.5 tabular-nums font-medium ${String(t.pnl).startsWith("+") ? theme.textPositive : theme.textNegative}`}
                      >
                        {t.pnl}
                      </td>
                      <td className="px-3 py-2.5 text-[rgba(255,255,255,0.48)]">
                        {t.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollFade>
          </div>
        </V3TabSection>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#262626]">
          <p className="border-b border-[#262626] px-4 py-2.5 text-xs font-medium text-[#929292]">
            Backtest trades
          </p>
          <ScrollFade axis="x" fadeColor="var(--ds-copilot-v2-elevated)">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#262626] text-[#757575]">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Side</th>
                  <th className="px-3 py-2">Entry</th>
                  <th className="px-3 py-2">Exit</th>
                  <th className="px-3 py-2">PnL</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-[#262626]/60">
                    <td className="px-3 py-2 text-[#929292]">{t.at}</td>
                    <td className="px-3 py-2">{t.direction}</td>
                    <td className="px-3 py-2">{t.entry}</td>
                    <td className="px-3 py-2">{t.exit}</td>
                    <td
                      className={`px-3 py-2 ${String(t.pnl).startsWith("+") ? "text-[var(--ds-copilot-v2-positive)]" : "text-[var(--ds-copilot-v2-negative)]"}`}
                    >
                      {t.pnl}
                    </td>
                    <td className="px-3 py-2 text-[#757575]">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollFade>
        </div>
      )
    ) : null;

  if (theme.isV3) {
    return (
      <V3TabShell>
        <CopilotTabLead
          isV3
          title="Backtest"
          description={description}
          actions={actions}
        />
        {resultsSections}
        {tradesTable}
      </V3TabShell>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CopilotTabLead
        isV3={false}
        title="Backtest"
        description={description}
        actions={actions}
      />
      {resultsSections}
      {tradesTable}
    </div>
  );
}
