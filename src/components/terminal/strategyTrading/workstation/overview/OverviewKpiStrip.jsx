import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";

export default function OverviewKpiStrip({ bt }) {
  const theme = useCopilotTheme();
  const cells = [
    {
      label: "Total Return",
      value: bt.totalReturn,
      sub: `${bt.trades ?? 0} Trades`,
      tone: "positive",
    },
    {
      label: "Max Drawdown",
      value: bt.maxDrawdown,
      sub: null,
      tone: "negative",
    },
    {
      label: "Win Rate",
      value: bt.winRate,
      sub: bt.winLoss,
      tone: null,
    },
    {
      label: "Profit Factor",
      value: bt.profitFactor,
      sub: null,
      tone: null,
    },
    {
      label: "Sharpe Ratio",
      value: bt.sharpeRatio,
      sub: null,
      tone: null,
    },
  ];

  if (theme.isV3) {
    return (
      <div className={theme.metricCard}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-white/[0.06]">
          {cells.map((cell, idx) => {
            const color =
              cell.tone === "positive"
                ? theme.textPositive
                : cell.tone === "negative"
                  ? theme.textNegative
                  : theme.textPrimary;
            return (
              <div
                key={cell.label}
                className={`${theme.metricCell} ${
                  idx > 0 && idx % 2 === 1
                    ? "border-l border-white/[0.06] lg:border-l-0"
                    : ""
                } ${idx >= 2 ? "border-t border-white/[0.06] lg:border-t-0" : ""}`}
              >
                <p className={theme.metricLabel}>{cell.label}</p>
                <p className={`${theme.metricValue} ${color}`}>{cell.value}</p>
                {cell.sub ? (
                  <p className={`mt-1 text-xs ${theme.textMuted}`}>
                    {cell.sub}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#242424] bg-[#0f0f0f]">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {cells.map((cell, idx) => {
          const color =
            cell.tone === "positive"
              ? theme.textPositive
              : cell.tone === "negative"
                ? theme.textNegative
                : "text-[rgba(255,255,255,0.92)]";
          return (
            <div
              key={cell.label}
              className={`px-4 py-3.5 ${
                idx % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#131313]"
              } ${idx > 0 ? "border-l border-white/4.5" : ""}`}
            >
              <p className={theme.metricLabel}>{cell.label}</p>
              <p className={`${theme.metricValue} ${color}`}>{cell.value}</p>
              {cell.sub ? (
                <p className="mt-1 text-[10px] font-medium text-[#757575]">
                  {cell.sub}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
