/** Mock candlestick chart with entry / SL / TP / signal markers. */
export default function StrategyChartPanel({ strategy }) {
  const setup = strategy?.setup;
  const symbol = strategy?.market?.split("·")[0]?.trim()?.replace("USDT", "") ?? "BTC";
  const currentPrice = setup?.currentPrice ?? "$77,247";

  const candles = [
    { o: 48, h: 52, l: 45, c: 50 },
    { o: 50, h: 51, l: 42, c: 44 },
    { o: 44, h: 46, l: 38, c: 40 },
    { o: 40, h: 43, l: 36, c: 42 },
    { o: 42, h: 48, l: 41, c: 47 },
    { o: 47, h: 52, l: 46, c: 51 },
    { o: 51, h: 54, l: 49, c: 53 },
    { o: 53, h: 56, l: 50, c: 52 },
    { o: 52, h: 55, l: 48, c: 54 },
    { o: 54, h: 58, l: 53, c: 56 },
  ];

  const volumes = [3, 5, 8, 6, 4, 5, 3, 4, 6, 4];
  const w = 100;
  const h = 48;
  const volH = 10;
  const pad = 4;
  const min = 34;
  const max = 60;
  const range = max - min || 1;
  const barW = (w - pad * 2) / candles.length;

  const y = (v) => pad + ((max - v) / range) * (h - pad * 2);
  const entryY = y(42);
  const slY = y(36);
  const tpY = y(54);

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#242424] px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-white">{symbol}/USDT</span>
          <span className="text-[#757575]">{strategy?.timeframe ?? "15m"}</span>
          <span className="rounded bg-[#121212] px-1.5 py-0.5 text-[10px] text-[#00f3b6]">
            {currentPrice}
          </span>
        </div>
        <div className="flex gap-1">
          {["Indicators", "Signals"].map((c) => (
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
      <div className="relative aspect-[2.2/1] min-h-[11rem] w-full p-3 sm:min-h-[13rem]">
        <svg
          viewBox={`0 0 ${w} ${h + volH}`}
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-label="Strategy price chart mock"
        >
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={pad}
              x2={w - pad}
              y1={pad + pct * (h - pad * 2)}
              y2={pad + pct * (h - pad * 2)}
              stroke="#242424"
              strokeWidth="0.25"
            />
          ))}
          {candles.map((c, i) => {
            const x = pad + i * barW + barW * 0.15;
            const bw = barW * 0.7;
            const openY = y(c.o);
            const closeY = y(c.c);
            const highY = y(c.h);
            const lowY = y(c.l);
            const bullish = c.c >= c.o;
            const color = bullish ? "#00f3b6" : "#d53d3d";
            const bodyTop = Math.min(openY, closeY);
            const bodyH = Math.max(Math.abs(closeY - openY), 0.4);
            return (
              <g key={i}>
                <line x1={x + bw / 2} x2={x + bw / 2} y1={highY} y2={lowY} stroke={color} strokeWidth="0.35" />
                <rect x={x} y={bodyTop} width={bw} height={bodyH} fill={color} opacity="0.85" />
              </g>
            );
          })}
          <line x1={pad} x2={w - pad} y1={entryY} y2={entryY} stroke="#00f3b6" strokeWidth="0.35" strokeDasharray="2 1" />
          <line x1={pad} x2={w - pad} y1={slY} y2={slY} stroke="#d53d3d" strokeWidth="0.35" strokeDasharray="2 1" />
          <line x1={pad} x2={w - pad} y1={tpY} y2={tpY} stroke="#269755" strokeWidth="0.35" strokeDasharray="2 1" />
          <circle cx={pad + barW * 3.5} cy={y(38)} r="1.2" fill="#00f3b6" />
          <text x={pad + barW * 3.5 + 2} y={y(38) + 0.5} fill="#00f3b6" fontSize="2.5">
            Long
          </text>
          <circle cx={pad + barW * 7.5} cy={y(56)} r="1.2" fill="#d53d3d" />
          <text x={pad + barW * 7.5 + 2} y={y(56) + 0.5} fill="#d53d3d" fontSize="2.5">
            Exit
          </text>
          {volumes.map((v, i) => {
            const x = pad + i * barW + barW * 0.2;
            const bw = barW * 0.6;
            const vh = (v / 8) * (volH - 1);
            return (
              <rect
                key={`v-${i}`}
                x={x}
                y={h + volH - vh}
                width={bw}
                height={vh}
                fill="#313131"
                opacity="0.8"
              />
            );
          })}
        </svg>
        <div className="absolute left-3 top-3 flex flex-col gap-0.5 text-[9px]">
          <span className="text-[#269755]">TP</span>
          <span className="text-[#00f3b6]">Entry Zone</span>
          <span className="text-[#d53d3d]">SL</span>
        </div>
        <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 text-[10px]">
          <span className="text-white">
            Current Price: <span className="font-medium text-[#00f3b6]">{currentPrice}</span>
          </span>
          {setup?.entryZone ? (
            <span className="text-[#00f3b6]">Entry Zone: {setup.entryZone}</span>
          ) : null}
          {setup?.stopLoss ? (
            <span className="text-[#d53d3d]">Stop Loss: {setup.stopLoss}</span>
          ) : null}
          {setup?.takeProfit ? (
            <span className="text-[#269755]">Take Profit: {setup.takeProfit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
