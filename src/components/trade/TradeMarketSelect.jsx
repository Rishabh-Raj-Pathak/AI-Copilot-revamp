import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { COIN_TINT, TRADE_MARKETS } from "./tradeMockData.js";

export function CoinAvatar({ coin, className = "size-6 text-[10px]" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${className} ${
        COIN_TINT[coin] ?? "bg-white/10 text-white/80"
      }`}
      aria-hidden
    >
      {coin.slice(0, 1)}
    </span>
  );
}

/** Market pair picker. Click-outside + Escape handling mirrors `VaultsNavDropdown`. */
export default function TradeMarketSelect({ coin, onCoinChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = TRADE_MARKETS.find((m) => m.coin === coin) ?? TRADE_MARKETS[0];

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      const el = ref.current;
      if (el && !el.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#242424] bg-black px-3 py-2 text-left transition-colors hover:border-[#3a3a3a]"
      >
        <CoinAvatar coin={active.coin} />
        <span className="whitespace-nowrap text-base font-semibold text-white">
          {active.symbol}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-[#bfbfbf] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select market"
          className="absolute top-[calc(100%+6px)] left-0 z-40 w-64 overflow-hidden rounded-lg border border-[#242424] bg-black py-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]"
        >
          {TRADE_MARKETS.map((m) => {
            const selected = m.coin === coin;
            const up = m.change24hPct >= 0;
            return (
              <button
                key={m.coin}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onCoinChange?.(m.coin);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  selected ? "bg-[#3e2e00]" : "hover:bg-white/5"
                }`}
              >
                <CoinAvatar coin={m.coin} />
                <span
                  className={`flex-1 text-sm ${selected ? "font-semibold text-[#f2b500]" : "text-white"}`}
                >
                  {m.symbol}
                </span>
                <span
                  className={`text-xs tabular-nums ${up ? "text-[#00d492]" : "text-[#e5484d]"}`}
                >
                  {up ? "+" : ""}
                  {m.change24hPct.toFixed(2)}%
                </span>
                {selected ? (
                  <Check className="size-3.5 shrink-0 text-[#f2b500]" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
