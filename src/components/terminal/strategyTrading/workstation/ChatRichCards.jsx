import { Check } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { COPILOT_V2_GRADIENT_CTA } from "../strategyCopilotUi.js";

const PRESET_OPTIONS = [
  ["recommended", "Use Recommended"],
  ["safer", "Make Safer"],
  ["aggressive", "More Aggressive"],
  ["custom", "Custom"],
];

const RICH_CARD_V2_BTN_BASE =
  "!h-8 !rounded-[var(--ds-terminal-connect-wallet-radius)] !text-[11px]";
const RICH_CARD_V2_BTN_LEGACY = "!h-7 !rounded-md !text-[10px]";
const RICH_CARD_V2_BTN_OUTLINE = `${RICH_CARD_V2_BTN_BASE} !border-white/10 !bg-[#181818] !text-[#cfcfcf] hover:!border-white/18 hover:!bg-[#212121]`;
const RICH_CARD_V2_BTN_OPTIMIZE = `${RICH_CARD_V2_BTN_BASE} !border-[#00F3B6]/16 !bg-[rgba(255,255,255,0.04)] !text-[rgba(255,255,255,0.88)] hover:!border-[#00F3B6]/28`;
const RICH_CARD_V2_BTN_GRADIENT = `${RICH_CARD_V2_BTN_BASE} !border-0 !font-medium !shadow-none !text-[var(--ds-copilot-v2-gradient-fg)] hover:!text-[var(--ds-copilot-v2-gradient-fg)] ${COPILOT_V2_GRADIENT_CTA}`;

const CONFIG_PRESET_BTN =
  "inline-flex h-8 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1c] px-3.5 text-[12px] font-medium leading-none text-[#b8b8b8] transition-colors duration-150 hover:border-white/20 hover:bg-[#242424] hover:text-[#ececec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] active:scale-[0.98]";

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
    ? theme.richCardShell
    : `mt-3 p-3.5 ${theme.cardInner}`;

  return (
    <div className={shell}>
      {theme.isV2 ? (
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
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
                ? "border-b border-white/4.5"
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
              ? "flex flex-wrap gap-2 border-t border-white/5 px-4 py-3.5"
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
    ? `${theme.richCardShell} ${className}`
    : `mt-2 rounded-lg border border-[#242424] bg-[#0f0f0f] p-3 ${className}`;
}

function BacktestCard({ data, onViewBacktest, onStartPaper, onOptimize }) {
  const theme = useCopilotTheme();
  const cells = [
    ["Total Return", data.totalReturn, "text-[var(--ds-copilot-v2-positive)]"],
    ["Max Drawdown", data.maxDrawdown, "text-[var(--ds-copilot-v2-negative)]"],
    ["Win Rate", data.winRate, "text-[#f4f4f4]"],
    ["Sharpe", data.sharpeRatio, "text-[#f4f4f4]"],
    ["Trades", String(data.trades), "text-[#f4f4f4]"],
    ["Profit Factor", data.profitFactor, "text-[#f4f4f4]"],
  ];

  const btnOutline = theme.isV2
    ? RICH_CARD_V2_BTN_OUTLINE
    : RICH_CARD_V2_BTN_LEGACY;
  const btnOptimize = theme.isV2
    ? RICH_CARD_V2_BTN_OPTIMIZE
    : RICH_CARD_V2_BTN_LEGACY;
  const btnPrimary = theme.isV2
    ? RICH_CARD_V2_BTN_GRADIENT
    : RICH_CARD_V2_BTN_LEGACY;

  return (
    <div className={richCardShell(theme)}>
      <div
        className={
          theme.isV2
            ? "flex items-center gap-2 border-b border-white/5 px-4 py-2.5"
            : ""
        }
      >
        <Check
          className={`size-3.5 ${theme.isV2 ? theme.textMint : "text-[#00f3b6]"}`}
          aria-hidden
        />
        <p
          className={
            theme.isV2
              ? "text-[12px] font-semibold text-[#d9fbe9]"
              : "text-[11px] font-semibold text-[#00f3b6]"
          }
        >
          Backtest complete
        </p>
      </div>
      <div
        className={
          theme.isV2
            ? "grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-2.5"
            : "mt-2 grid grid-cols-2 gap-2"
        }
      >
        {cells.map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[10px] text-[#8a8a8a]">{label}</p>
            <p
              className={`mt-0.5 text-[12px] font-semibold tabular-nums ${color}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <div
        className={
          theme.isV2
            ? "flex flex-wrap gap-2 border-t border-white/5 px-4 py-2.5"
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
            className={btnOptimize}
            onClick={onOptimize}
          >
            Optimize
          </Button>
        ) : null}
        {onStartPaper ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
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
  const btnOutline = theme.isV2
    ? RICH_CARD_V2_BTN_OUTLINE
    : RICH_CARD_V2_BTN_LEGACY;
  const btnGradient = theme.isV2
    ? RICH_CARD_V2_BTN_GRADIENT
    : RICH_CARD_V2_BTN_LEGACY;
  return (
    <div className={richCardShell(theme)}>
      <p
        className={
          theme.isV2
            ? "border-b border-white/5 px-4 py-3 text-[12px] font-semibold text-[#f4f4f4]"
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
                ? "border-b border-white/4.5 text-[12px]"
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
            ? "flex flex-wrap gap-2 border-t border-white/5 px-4 py-3"
            : "mt-2.5 flex flex-wrap gap-1"
        }
      >
        {onStartPaper ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={btnOutline}
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
            className={btnGradient}
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
  const btnOutline = theme.isV2
    ? RICH_CARD_V2_BTN_OUTLINE
    : RICH_CARD_V2_BTN_LEGACY;
  const btnGradient = theme.isV2
    ? RICH_CARD_V2_BTN_GRADIENT
    : RICH_CARD_V2_BTN_LEGACY;
  return (
    <div className={richCardShell(theme)}>
      <p
        className={
          theme.isV2
            ? "border-b border-white/5 px-4 py-3 text-[12px] font-semibold text-[#00F3B6]"
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
                ? "border-b border-white/4.5 text-[12px]"
                : "text-[10px]"
            }`}
          >
            <dt
              className={`capitalize ${theme.isV2 ? theme.textMuted : "text-[#8a8a8a]"}`}
            >
              {k}
            </dt>
            <dd
              className={`font-medium ${theme.isV2 ? theme.textPrimary : "text-[#f4f4f4]"}`}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <div
        className={
          theme.isV2
            ? "flex flex-wrap gap-2 border-t border-white/5 px-4 py-3"
            : "mt-2.5 flex flex-wrap gap-1"
        }
      >
        {onViewPosition ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={btnOutline}
            onClick={onViewPosition}
          >
            View Paper Position
          </Button>
        ) : null}
        {onReview ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={btnGradient}
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
