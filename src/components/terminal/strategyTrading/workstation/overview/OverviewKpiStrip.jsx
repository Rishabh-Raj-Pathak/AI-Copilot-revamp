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

  return (
    <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#262626] p-px">
      <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
        {cells.map((cell) => {
          const color =
            cell.tone === "positive"
              ? "text-[#00f3b6]"
              : cell.tone === "negative"
                ? "text-[#d53d3d]"
                : "text-white";
          return (
            <div key={cell.label} className="bg-[#141414] px-4 py-3.5">
              <p className={theme.metricLabel}>{cell.label}</p>
              <p className={`${theme.metricValue} ${color}`}>{cell.value}</p>
              {cell.sub ? (
                <p className="mt-1 text-[10px] font-medium text-[#757575]">{cell.sub}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
