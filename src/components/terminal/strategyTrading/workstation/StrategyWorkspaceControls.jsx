import { Play, Sparkles } from "lucide-react";
import { Button } from "../../../ui/button.jsx";

export default function StrategyWorkspaceControls({
  strategy,
  onRunBacktest,
  onStartPaper,
  backtestLoading,
}) {
  const setup = strategy?.setup;
  const market = setup?.market ?? strategy?.market ?? "BTCUSDT";
  const timeframe = setup?.timeframe ?? strategy?.timeframe ?? "15m";
  const dateRange = setup?.dateRange ?? "Mar 22 – May 21, 2026";
  const leverage = setup?.leverage ?? strategy?.config?.leverage ?? "3x";
  const fees = setup?.fees ?? "Custom";

  const chips = [
    { label: "Market", value: market.split("·")[0]?.trim() ?? market },
    { label: "Timeframe", value: timeframe },
    { label: "Range", value: dateRange },
    { label: "Leverage", value: leverage },
    { label: "Fees", value: fees },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#242424] bg-[#0a0a0a] px-3 py-2">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            className="rounded-md border border-[#242424] bg-black px-2 py-1 text-left hover:border-[#454545]"
          >
            <span className="block text-[9px] uppercase tracking-wide text-[#585858]">
              {c.label}
            </span>
            <span className="text-[11px] font-medium text-[#bfbfbf]">{c.value}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1 !text-xs"
          onClick={onRunBacktest}
          loading={backtestLoading}
          disabled={strategy?.backtest?.status === "complete"}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Optimize
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="gap-1 !text-xs"
          onClick={onRunBacktest}
          loading={backtestLoading}
          disabled={strategy?.backtest?.status === "complete"}
        >
          <Play className="size-3.5" aria-hidden />
          Run Backtest
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="!text-xs"
          onClick={onStartPaper}
          disabled={strategy?.paperTrading?.status === "active"}
        >
          Start Paper Trading
        </Button>
      </div>
    </div>
  );
}
