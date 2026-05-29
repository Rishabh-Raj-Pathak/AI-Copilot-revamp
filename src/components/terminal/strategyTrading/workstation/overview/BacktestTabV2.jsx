import { Play } from "lucide-react";
import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import ScrollFade from "../ScrollFade.jsx";

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
        {complete && onGoOverview ? (
          <button
            type="button"
            onClick={onGoOverview}
            className="text-xs font-medium text-[#19E6A3] transition-colors hover:text-[#4ef0c4]"
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
        <div className="overflow-hidden rounded-xl border border-[#262626]">
          <p className="border-b border-[#262626] px-4 py-2.5 text-xs font-medium text-[#929292]">
            Backtest trades
          </p>
          <ScrollFade
            axis="x"
            fadeColor="var(--ds-copilot-v2-elevated)"
          >
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
      ) : null}
    </div>
  );
}
