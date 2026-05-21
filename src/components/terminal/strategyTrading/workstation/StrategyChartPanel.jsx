/** Mock price chart with entry / SL / TP levels. */
export default function StrategyChartPanel({ strategy }) {
  const setup = strategy?.setup;
  const symbol = strategy?.market?.split("-")[0] ?? "BTC";

  const pricePoints = [42, 38, 35, 40, 48, 52, 49, 55, 58, 54];
  const w = 100;
  const h = 56;
  const pad = 4;
  const min = Math.min(...pricePoints);
  const max = Math.max(...pricePoints);
  const range = max - min || 1;

  const coords = pricePoints.map((v, i) => {
    const x = pad + (i / (pricePoints.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const linePath = `M ${coords.join(" L ")}`;

  const entryY = 28;
  const slY = 42;
  const tpY = 14;

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#242424] px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-white">{symbol}-PERP</span>
          <span className="text-[#757575]">{strategy?.timeframe ?? "15m"}</span>
        </div>
        <div className="flex gap-1">
          {["Market", "Timeframe", "Indicators", "Range"].map((c) => (
            <button
              key={c}
              type="button"
              className="rounded border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292] hover:text-white"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="relative aspect-[2.4/1] min-h-[12rem] w-full p-3 sm:min-h-[14rem]">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2b500" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f2b500" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={pad}
              x2={w - pad}
              y1={pad + pct * (h - pad * 2)}
              y2={pad + pct * (h - pad * 2)}
              stroke="#242424"
              strokeWidth="0.3"
            />
          ))}
          <path d={`${linePath} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`} fill="url(#chartFill)" />
          <path d={linePath} fill="none" stroke="#f2b500" strokeWidth="0.8" />
          <line x1={pad} x2={w - pad} y1={entryY} y2={entryY} stroke="#00f3b6" strokeWidth="0.4" strokeDasharray="2 1" />
          <line x1={pad} x2={w - pad} y1={slY} y2={slY} stroke="#d53d3d" strokeWidth="0.4" strokeDasharray="2 1" />
          <line x1={pad} x2={w - pad} y1={tpY} y2={tpY} stroke="#269755" strokeWidth="0.4" strokeDasharray="2 1" />
        </svg>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[10px]">
          {setup?.entryZone ? (
            <span className="text-[#00f3b6]">Entry {setup.entryZone}</span>
          ) : null}
          {setup?.stopLoss ? (
            <span className="text-[#d53d3d]">SL {setup.stopLoss}</span>
          ) : null}
          {setup?.takeProfit ? (
            <span className="text-[#269755]">TP {setup.takeProfit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
