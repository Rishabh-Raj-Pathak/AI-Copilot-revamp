import { Play } from "lucide-react";
import { Button } from "../../../../ui/button.jsx";
import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";

export default function BacktestTabV2({
  strategy,
  bt,
  backtestLoading,
  onRunBacktest,
  onGoOverview,
}) {
  const theme = useCopilotTheme();
  const complete = strategy?.backtest?.status === "complete" && bt;
  const trades = strategy?.trades ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="default"
          className={theme.optimizeBtn}
          loading={backtestLoading}
          onClick={onRunBacktest}
          disabled={backtestLoading}
        >
          <Play className="size-3.5 shrink-0 text-black" aria-hidden />
          {complete ? "Re-run Backtest" : "Run Backtest"}
        </Button>
        {complete && onGoOverview ? (
          <button
            type="button"
            onClick={onGoOverview}
            className="text-xs font-medium text-[#f2b500] transition-colors hover:text-[#ffd633]"
          >
            View full analytics in Overview →
          </button>
        ) : null}
      </div>

      {complete ? (
        <p className="text-xs leading-relaxed text-[#757575]">
          Performance summary, equity curve, and trade analysis are available on the
          Overview tab.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-[#757575]">
          Run a backtest to preview historical performance estimates for this strategy.
        </p>
      )}

      {complete && trades.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#262626]">
          <p className="border-b border-[#262626] px-4 py-2.5 text-xs font-medium text-[#929292]">
            Backtest trades
          </p>
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
      ) : null}
    </div>
  );
}
