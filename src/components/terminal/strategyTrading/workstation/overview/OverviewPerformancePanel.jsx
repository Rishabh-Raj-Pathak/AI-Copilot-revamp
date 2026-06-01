import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import { OverviewStatRow } from "./overviewStatRow.jsx";

function MetricColumn({ children }) {
  return <dl className="min-w-0 flex-1 space-y-0">{children}</dl>;
}

export default function OverviewPerformancePanel({ bt }) {
  const theme = useCopilotTheme();

  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-[rgba(255,255,255,0.42)]">
        Profit
      </p>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 sm:gap-6">
        <MetricColumn>
          <OverviewStatRow
            label="Total Return"
            value={bt.totalReturn}
            valueTone="positive"
          />
          <OverviewStatRow
            label="Outperformance"
            value={bt.outperformance}
            valueTone="negative"
          />
          <OverviewStatRow label="Expected Payoff" value={bt.expectedPayoff} />
        </MetricColumn>
        <MetricColumn>
          <OverviewStatRow
            label="Buy & Hold"
            value={bt.buyAndHold}
            valueTone="positive"
          />
          <OverviewStatRow label="Commission" value={bt.commission ?? "—"} />
        </MetricColumn>
      </div>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-[rgba(255,255,255,0.42)]">
        Risk
      </p>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 sm:gap-6">
        <MetricColumn>
          <OverviewStatRow
            label="Max Drawdown"
            value={bt.maxDrawdown}
            valueTone="negative"
          />
          <OverviewStatRow
            label="Sortino Ratio"
            value={bt.sortinoRatio ?? "—"}
          />
        </MetricColumn>
        <MetricColumn>
          <OverviewStatRow label="Sharpe Ratio" value={bt.sharpeRatio ?? "—"} />
          <OverviewStatRow label="Calmar Ratio" value={bt.calmarRatio ?? "—"} />
        </MetricColumn>
      </div>
    </>
  );

  if (theme.isV3) {
    return (
      <section className="border-b border-white/6 py-5">
        <h4 className="text-sm font-medium tracking-tight text-[rgba(255,255,255,0.9)]">
          Performance
        </h4>
        <div className="mt-4">{content}</div>
      </section>
    );
  }

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 sm:p-5">
      <h4 className="text-xs font-medium text-[#929292]">Performance</h4>
      <div className="mt-4">{content}</div>
    </div>
  );
}
