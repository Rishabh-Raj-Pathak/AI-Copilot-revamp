import { Check } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";

const PRESET_OPTIONS = [
  ["recommended", "Use Recommended"],
  ["safer", "Make Safer"],
  ["aggressive", "More Aggressive"],
  ["custom", "Custom"],
];

const CONFIG_PRESET_BTN =
  "inline-flex h-8 items-center justify-center rounded-lg border border-white/12 bg-[#1a1a1c] px-3.5 text-[12px] font-medium leading-none text-[#b8b8b8] transition-colors duration-150 hover:border-white hover:bg-white hover:text-[#0c0c0e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] active:scale-[0.98]";

function ConfigCard({ data, onPreset }) {
  const theme = useCopilotTheme();
  const rows = [
    ["BB Length", data.bbLength],
    ["RSI Oversold Threshold", data.rsiThreshold],
    ["Stop Loss", data.stopLoss],
    ["Take Profit", data.takeProfit],
    ["Leverage", data.leverage],
    ["Execution", data.execution],
  ];

  const shell = theme.isV2
    ? "mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111]/90"
    : `mt-3 p-3.5 ${theme.cardInner}`;

  return (
    <div className={shell}>
      {theme.isV2 ? (
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#f4f4f4]">
            Strategy Configuration
          </p>
          <span className="text-[10px] font-medium tracking-wide text-[#6b6b6b] uppercase">
            Suggested
          </span>
        </div>
      ) : (
        <p className="text-[11px] font-semibold text-white">
          Strategy Configuration
        </p>
      )}
      <dl className={theme.isV2 ? "space-y-0 px-4 py-1" : "mt-2.5 space-y-1.5"}>
        {rows.map(([label, value], idx) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 py-2.5 text-[12px] ${
              theme.isV2 && idx < rows.length - 1
                ? "border-b border-white/[0.05]"
                : ""
            }`}
          >
            <dt className="text-[#8a8a8a]">{label}</dt>
            <dd className="text-right font-medium tabular-nums text-[#f4f4f4]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {onPreset ? (
        <div
          className={
            theme.isV2
              ? "flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3.5"
              : "mt-3 flex flex-wrap gap-1.5"
          }
        >
          {PRESET_OPTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => id !== "custom" && onPreset(id)}
              className={
                theme.isV2
                  ? CONFIG_PRESET_BTN
                  : "rounded-md border border-[#242424] px-2.5 py-1 text-[10px] text-[#929292] hover:border-[#454545] hover:text-white"
              }
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function richCardShell(theme, className = "") {
  return theme.isV2
    ? `mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111]/90 ${className}`
    : `mt-2 rounded-lg border border-[#242424] bg-[#121212] p-3 ${className}`;
}

function BacktestCard({ data, onViewBacktest, onStartPaper, onOptimize }) {
  const theme = useCopilotTheme();
  const cells = [
    ["Total Return", data.totalReturn, "text-[#00f3b6]"],
    ["Max Drawdown", data.maxDrawdown, "text-[#d53d3d]"],
    ["Win Rate", data.winRate, "text-[#f4f4f4]"],
    ["Sharpe", data.sharpeRatio, "text-[#f4f4f4]"],
    ["Trades", String(data.trades), "text-[#f4f4f4]"],
    ["Profit Factor", data.profitFactor, "text-[#f4f4f4]"],
  ];

  const btnOutline = theme.isV2
    ? "!h-8 !rounded-full !border-white/10 !bg-[#1a1a1a] !text-[11px] hover:!bg-[#222]"
    : "!h-7 !text-[10px]";
  const btnPrimary = theme.isV2
    ? "!h-8 !rounded-full !text-[11px]"
    : "!h-7 !text-[10px]";

  return (
    <div className={richCardShell(theme)}>
      <div
        className={
          theme.isV2
            ? "flex items-center gap-2 border-b border-white/[0.06] px-4 py-3"
            : ""
        }
      >
        <Check
          className={`size-3.5 ${theme.isV2 ? "text-[#00f3b6]" : "text-[#00f3b6]"}`}
          aria-hidden
        />
        <p
          className={
            theme.isV2
              ? "text-[12px] font-semibold text-[#00f3b6]"
              : "text-[11px] font-semibold text-[#00f3b6]"
          }
        >
          Backtest complete
        </p>
      </div>
      <div
        className={
          theme.isV2
            ? "grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3"
            : "mt-2 grid grid-cols-2 gap-2"
        }
      >
        {cells.map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[10px] text-[#8a8a8a]">{label}</p>
            <p className={`mt-0.5 text-xs font-semibold tabular-nums ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <div
        className={
          theme.isV2
            ? "flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3"
            : "mt-2.5 flex flex-wrap gap-1"
        }
      >
        {onViewBacktest ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={btnOutline}
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
            className={btnOutline}
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
            className={btnPrimary}
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
  const theme = useCopilotTheme();
  return (
    <div className={richCardShell(theme)}>
      <p
        className={
          theme.isV2
            ? "border-b border-white/[0.06] px-4 py-3 text-[12px] font-semibold text-[#f4f4f4]"
            : "text-[11px] font-semibold text-white"
        }
      >
        Paper Trading Setup
      </p>
      <dl className={theme.isV2 ? "space-y-0 px-4 py-1" : "mt-2 space-y-1"}>
        {Object.entries(data).map(([k, v], idx, arr) => (
          <div
            key={k}
            className={`flex justify-between gap-2 py-2.5 ${
              theme.isV2 && idx < arr.length - 1
                ? "border-b border-white/[0.05] text-[12px]"
                : "text-[10px]"
            }`}
          >
            <dt className="text-[#8a8a8a]">{k}</dt>
            <dd className="font-medium text-[#f4f4f4]">{v}</dd>
          </div>
        ))}
      </dl>
      <div
        className={
          theme.isV2
            ? "flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3"
            : "mt-2.5 flex flex-wrap gap-1"
        }
      >
        {onStartPaper ? (
          <Button
            type="button"
            size="sm"
            variant="default"
            className={
              theme.isV2
                ? "!h-8 !rounded-full !text-[11px]"
                : "!h-7 !text-[10px]"
            }
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
            className={
              theme.isV2
                ? "!h-8 !rounded-full !border-white/10 !text-[11px]"
                : "!h-7 !text-[10px]"
            }
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
  const theme = useCopilotTheme();
  return (
    <div className={richCardShell(theme)}>
      <p
        className={
          theme.isV2
            ? "border-b border-white/[0.06] px-4 py-3 text-[12px] font-semibold text-[#00f3b6]"
            : "text-[11px] font-semibold text-[#00f3b6]"
        }
      >
        Paper trading active
      </p>
      <dl className={theme.isV2 ? "space-y-0 px-4 py-1" : "mt-2 space-y-1"}>
        {Object.entries(data).map(([k, v], idx, arr) => (
          <div
            key={k}
            className={`flex justify-between gap-2 py-2.5 ${
              theme.isV2 && idx < arr.length - 1
                ? "border-b border-white/[0.05] text-[12px]"
                : "text-[10px]"
            }`}
          >
            <dt className="capitalize text-[#8a8a8a]">{k}</dt>
            <dd className="font-medium text-[#f4f4f4]">{v}</dd>
          </div>
        ))}
      </dl>
      <div
        className={
          theme.isV2
            ? "flex flex-wrap gap-2 border-t border-white/[0.06] px-4 py-3"
            : "mt-2.5 flex flex-wrap gap-1"
        }
      >
        {onViewPosition ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={
              theme.isV2
                ? "!h-8 !rounded-full !border-white/10 !text-[11px]"
                : "!h-7 !text-[10px]"
            }
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
            className={
              theme.isV2
                ? "!h-8 !rounded-full !text-[11px]"
                : "!h-7 !text-[10px]"
            }
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
