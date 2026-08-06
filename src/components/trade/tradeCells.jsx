/** Leaf cell renderers shared by the Trade bottom-panel column definitions. */
import { CoinAvatar } from "./TradeMarketSelect.jsx";

export function Pnl({ positive, children }) {
  return (
    <span className={positive ? "text-[#00d492]" : "text-[#e5484d]"}>
      {children}
    </span>
  );
}

export function Direction({ value }) {
  const long = value === "long";
  return (
    <span
      className={`rounded px-[7px] py-0.5 text-[11px] ${
        long
          ? "border border-[rgba(0,212,146,0.16)] bg-[rgba(0,212,146,0.07)] text-[rgba(0,212,146,0.85)]"
          : "border border-[rgba(229,72,77,0.16)] bg-[rgba(229,72,77,0.07)] text-[rgba(229,72,77,0.85)]"
      }`}
    >
      {long ? "Long" : "Short"}
    </span>
  );
}

export function CoinCell({ coin, leverage }) {
  return (
    <span className="flex items-center gap-2">
      <CoinAvatar coin={coin} className="size-5 text-[9px]" />
      <span className="font-semibold text-[#00d492]">
        {coin}
        {leverage ? (
          <span className="ml-1 font-normal text-[#00d492]">{leverage}</span>
        ) : null}
      </span>
    </span>
  );
}

export function Status({ value }) {
  return (
    <span className={value === "Filled" ? "text-[#00d492]" : "text-[#bfbfbf]"}>
      {value}
    </span>
  );
}
