import { ArrowDown, ArrowUp } from "lucide-react";
import TradeMarketSelect from "./TradeMarketSelect.jsx";
import { getMarket } from "./tradeMockData.js";

function formatPx(value, decimals) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function StatCell({ label, children }) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-1 border-l border-[#242424] px-4 py-2 first:border-l-0 max-tablet:border-l-0 max-tablet:px-0">
      <span className="truncate text-xs text-[#787878]">{label}</span>
      <span className="truncate text-sm font-medium text-white tabular-nums">
        {children}
      </span>
    </div>
  );
}

/** Top strip: pair selector + Mark / Oracle / 24h Change / 24h Volume / Open Interest. */
export default function TradeMarketBar({ coin, onCoinChange }) {
  const m = getMarket(coin);
  const up = m.change24hPct >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;

  return (
    <div className="flex shrink-0 flex-wrap items-stretch gap-3 px-4 py-3 max-tablet:gap-2 sm:gap-4 sm:px-5">
      <TradeMarketSelect coin={coin} onCoinChange={onCoinChange} />

      <div className="minimal-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto rounded-[10px] border border-[#242424] bg-[#121212] max-tablet:grid max-tablet:grid-cols-2 max-tablet:gap-x-4 max-tablet:gap-y-2 max-tablet:overflow-visible max-tablet:p-3">
        <StatCell label="Mark">{formatPx(m.markPx, m.pxDecimals)}</StatCell>
        <StatCell label="Oracle">{formatPx(m.oraclePx, m.pxDecimals)}</StatCell>
        <StatCell label="24h Change">
          <span className={up ? "text-[#00d492]" : "text-[#e5484d]"}>
            {formatPx(Math.abs(m.change24hAbs), m.pxDecimals)} /{" "}
            {Math.abs(m.change24hPct).toFixed(2)}%
            <Arrow className="ml-1 inline size-3.5 align-[-2px]" aria-hidden />
          </span>
        </StatCell>
        <StatCell label="24h Volume">{m.volume24h}</StatCell>
        <StatCell label="Open Interest">{m.openInterest}</StatCell>
      </div>
    </div>
  );
}
