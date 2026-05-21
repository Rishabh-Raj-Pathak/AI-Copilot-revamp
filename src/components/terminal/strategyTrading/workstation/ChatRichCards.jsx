import { Check, Copy } from "lucide-react";
import { Button } from "../../../ui/button.jsx";

function ConfigCard({ data, onPreset }) {
  const rows = [
    ["BB Length", data.bbLength],
    ["RSI Oversold Threshold", data.rsiThreshold],
    ["Stop Loss", data.stopLoss],
    ["Take Profit", data.takeProfit],
    ["Leverage", data.leverage],
    ["Execution", data.execution],
  ];
  return (
    <div className="mt-2 rounded-lg border border-[#242424] bg-[#121212] p-3">
      <p className="text-[11px] font-semibold text-white">Strategy Configuration</p>
      <dl className="mt-2 space-y-1">
        {rows.map(([q, a]) => (
          <div key={q} className="flex justify-between gap-2 text-[10px]">
            <dt className="text-[#757575]">{q}</dt>
            <dd className="font-medium text-[#bfbfbf]">{a}</dd>
          </div>
        ))}
      </dl>
      {onPreset ? (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {[
            ["recommended", "Use Recommended"],
            ["safer", "Make Safer"],
            ["aggressive", "More Aggressive"],
            ["custom", "Custom"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => id !== "custom" && onPreset(id)}
              className="rounded-md border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292] hover:border-[#454545] hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BacktestCard({ data, onViewBacktest, onStartPaper, onOptimize }) {
  const cells = [
    ["Total Return", data.totalReturn, "text-[#00f3b6]"],
    ["Max Drawdown", data.maxDrawdown, "text-[#d53d3d]"],
    ["Win Rate", data.winRate, "text-white"],
    ["Sharpe", data.sharpeRatio, "text-white"],
    ["Trades", String(data.trades), "text-white"],
    ["Profit Factor", data.profitFactor, "text-white"],
  ];
  return (
    <div className="mt-2 rounded-lg border border-[#242424] bg-[#121212] p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00f3b6]">
        <Check className="size-3.5" aria-hidden />
        Backtest complete
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {cells.map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[10px] text-[#757575]">{label}</p>
            <p className={`text-xs font-semibold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {onViewBacktest ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="!h-7 !text-[10px]"
            onClick={onViewBacktest}
          >
            View Backtest
          </Button>
        ) : null}
        {onOptimize ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="!h-7 !text-[10px]"
            onClick={onOptimize}
          >
            Optimize
          </Button>
        ) : null}
        {onStartPaper ? (
          <Button
            type="button"
            size="sm"
            variant="default"
            className="!h-7 !text-[10px]"
            onClick={onStartPaper}
          >
            Start Paper Trading
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PaperSetupCard({ data, onStartPaper, onReview }) {
  return (
    <div className="mt-2 rounded-lg border border-[#242424] bg-[#121212] p-3">
      <p className="text-[11px] font-semibold text-white">Paper Trading Setup</p>
      <dl className="mt-2 space-y-1">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 text-[10px]">
            <dt className="text-[#757575]">{k}</dt>
            <dd className="text-[#bfbfbf]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {onStartPaper ? (
          <Button
            type="button"
            size="sm"
            variant="default"
            className="!h-7 !text-[10px]"
            onClick={onStartPaper}
          >
            Start Simulation
          </Button>
        ) : null}
        {onReview ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="!h-7 !text-[10px]"
            onClick={onReview}
          >
            Review Deployment
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PaperCard({ data, onViewPosition, onReview }) {
  return (
    <div className="mt-2 rounded-lg border border-[#242424] bg-[#121212] p-3">
      <p className="text-[11px] font-semibold text-[#00f3b6]">Paper trading active</p>
      <dl className="mt-2 space-y-1">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 text-[10px]">
            <dt className="capitalize text-[#757575]">{k}</dt>
            <dd className="text-[#bfbfbf]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {onViewPosition ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="!h-7 !text-[10px]"
            onClick={onViewPosition}
          >
            View Paper Position
          </Button>
        ) : null}
        {onReview ? (
          <Button
            type="button"
            size="sm"
            variant="default"
            className="!h-7 !text-[10px]"
            onClick={onReview}
          >
            Review Deployment
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function ChatRichCards({
  cards,
  onPreset,
  onViewBacktest,
  onStartPaper,
  onReview,
  onViewPaper,
  onOptimize,
}) {
  if (!cards?.length) return null;
  return (
    <div className="space-y-0">
      {cards.map((card, i) => {
        if (card.type === "config") {
          return <ConfigCard key={i} data={card.data} onPreset={onPreset} />;
        }
        if (card.type === "backtest") {
          return (
            <BacktestCard
              key={i}
              data={card.data}
              onViewBacktest={onViewBacktest}
              onStartPaper={onStartPaper}
              onOptimize={onOptimize}
            />
          );
        }
        if (card.type === "paper-setup") {
          return (
            <PaperSetupCard
              key={i}
              data={card.data}
              onStartPaper={onStartPaper}
              onReview={onReview}
            />
          );
        }
        if (card.type === "paper") {
          return (
            <PaperCard
              key={i}
              data={card.data}
              onViewPosition={onViewPaper}
              onReview={onReview}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
