import { OverviewStatRow } from "./overviewStatRow.jsx";

export default function OverviewTradesAnalysis({ bt }) {
  const wins = bt.wins ?? 0;
  const losses = bt.losses ?? 0;
  const total = wins + losses || bt.trades || 1;
  const winPct = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-white/6 bg-[var(--ds-copilot-v2-elevated)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-medium text-[var(--ds-copilot-v2-text-secondary)]">
          Trades Analysis
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--ds-copilot-v2-text-muted)]">
          <span>
            <span className="font-semibold text-white">{bt.trades ?? 0}</span> Trades
          </span>
          <span className="text-[#585858]">·</span>
          <span>
            Win Rate{" "}
            <span className="font-semibold text-white">{bt.winRate}</span>
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
          {wins > 0 ? (
            <div
              className="bg-[var(--ds-copilot-v2-positive)] transition-all"
              style={{ width: `${winPct}%` }}
              title={`${wins} wins`}
            />
          ) : null}
          {losses > 0 ? (
            <div
              className="bg-[var(--ds-copilot-v2-negative)] transition-all"
              style={{ width: `${100 - winPct}%` }}
              title={`${losses} losses`}
            />
          ) : null}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium">
          <span className="flex items-center gap-1.5 text-[var(--ds-copilot-v2-positive)]">
            <span
              className="size-1.5 rounded-full bg-[var(--ds-copilot-v2-positive)]"
              aria-hidden
            />
            {wins}W
          </span>
          <span className="flex items-center gap-1.5 text-[var(--ds-copilot-v2-negative)]">
            <span
              className="size-1.5 rounded-full bg-[var(--ds-copilot-v2-negative)]"
              aria-hidden
            />
            {losses}L
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6">
        <dl>
          <OverviewStatRow
            label="Largest Win"
            value={bt.largestWin}
            valueTone="positive"
          />
          <OverviewStatRow label="Avg Profit" value={bt.avgProfit} valueTone="positive" />
          <OverviewStatRow label="Profit Factor" value={bt.profitFactor} />
        </dl>
        <dl>
          <OverviewStatRow
            label="Largest Loss"
            value={bt.largestLoss}
            valueTone="negative"
          />
          <OverviewStatRow label="Avg Loss" value={bt.avgLoss} valueTone="negative" />
          <OverviewStatRow label="Avg Bars" value={bt.avgBars ?? "—"} />
        </dl>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.04] pt-4">
        <div>
          <p className="text-[10px] text-[var(--ds-copilot-v2-text-muted)]">
            Max Consecutive Wins
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--ds-copilot-v2-positive)]">
            {bt.maxConsecutiveWins ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[var(--ds-copilot-v2-text-muted)]">
            Max Consecutive Losses
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--ds-copilot-v2-negative)]">
            {bt.maxConsecutiveLosses ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
