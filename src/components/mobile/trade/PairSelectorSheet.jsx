import { useMemo, useState } from "react";
import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { APP_MARKETS, MARKET_CATEGORIES, formatGrouped } from "./tradeData.js";

/* Column widths from the Figma table (954:4932) — it scrolls sideways. */
const COLUMNS = [
  { id: "pair", label: "Token/Pair", width: "w-[228px]" },
  { id: "price", label: "Current Price", width: "w-[114px]" },
  { id: "change", label: "24hr Change", width: "w-[152px]", sortable: true },
  { id: "funding", label: "8hr Funding", width: "w-[114px]", sortable: true },
  { id: "volume", label: "24hr Volume", width: "w-[143px]", sortable: true },
  { id: "oi", label: "Open Interest", width: "w-[143px]", sortable: true },
];

/** `$1.77B` → 1.77e9, so the abbreviated mock strings still sort. */
function parseCompactUsd(s) {
  const m = /([\d.,]+)\s*([KMB])?/i.exec(String(s ?? ""));
  if (!m) return 0;
  const n = Number.parseFloat(m[1].replace(/,/g, ""));
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[m[2]?.toUpperCase()] ?? 1;
  return n * mult;
}

const SORT_VALUE = {
  change: (m) => m.change24hPct,
  funding: (m) => m.funding8h,
  volume: (m) => parseCompactUsd(m.volume24h),
  oi: (m) => parseCompactUsd(m.openInterest),
};

function CategoryChip({ category, active, onPress }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onPress}
      className={`app-pressable flex min-h-[23px] items-center gap-1 rounded border border-app-line px-[7px] py-0.5 text-app-body font-medium leading-[16.8px] ${
        active ? "bg-app-accent-subtle text-app-accent" : "bg-app-bg text-ink"
      }`}
    >
      {category.icon ? <AppIcon src={category.icon} size={13} /> : null}
      {category.label}
    </button>
  );
}

/** Body of the sheet — remounted per open so search and chips start fresh. */
function PairSelectorBody({ coin, onSelect }) {
  const current = APP_MARKETS.find((m) => m.coin === coin);
  const [query, setQuery] = useState("");
  // Figma opens on Bluechip; fall back to All when the live pair isn't in it.
  const [category, setCategory] = useState(
    current && !current.categories.includes("bluechip") ? "all" : "bluechip",
  );
  const [sort, setSort] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = APP_MARKETS.filter(
      (m) =>
        (category === "all" || m.categories.includes(category)) &&
        (!q || m.coin.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q)),
    );
    if (!sort) return list;
    const value = SORT_VALUE[sort.id];
    return [...list].sort((a, b) => (value(a) - value(b)) * sort.dir);
  }, [query, category, sort]);

  const toggleSort = (id) =>
    setSort((s) => (s?.id !== id ? { id, dir: -1 } : s.dir === -1 ? { id, dir: 1 } : null));

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2.5 rounded-[10px] border border-app-line-strong px-[13px] py-[11px] transition-colors focus-within:border-app-line-accent">
          <AppIcon src={appIcons.search19} size={19} className="text-ink" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search markets"
            autoComplete="off"
            autoCapitalize="characters"
            enterKeyHint="search"
            className="h-5 min-w-0 flex-1 bg-transparent text-app-headline leading-5 text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
      </div>

      <div
        role="radiogroup"
        aria-label="Category"
        className="mt-3 flex flex-wrap gap-2 border-b border-app-line px-4"
      >
        {MARKET_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            category={c}
            active={c.id === category}
            onPress={() => setCategory(c.id)}
          />
        ))}
      </div>

      <div className="app-no-scrollbar mt-3 overflow-x-auto overscroll-x-contain">
        <div className="w-max min-w-full" role="listbox" aria-label="Markets">
          <div className="flex items-center border-b border-app-line bg-app-subtle pl-4 pr-4">
            {COLUMNS.map((col) =>
              col.sortable ? (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleSort(col.id)}
                  aria-label={`Sort by ${col.label}`}
                  className={`flex h-[43px] shrink-0 items-center gap-1 text-left text-app-body font-medium leading-[17px] ${col.width} ${
                    sort?.id === col.id ? "text-app-accent" : "text-ink"
                  }`}
                >
                  {col.label}
                  <AppIcon
                    src={appIcons.sort13}
                    size={13}
                    className={sort?.id === col.id && sort.dir === 1 ? "rotate-180" : ""}
                  />
                </button>
              ) : (
                <span
                  key={col.id}
                  className={`flex h-[43px] shrink-0 items-center text-app-body font-medium leading-[17px] text-ink ${col.width}`}
                >
                  {col.label}
                </span>
              ),
            )}
          </div>

          {rows.map((m) => {
            const up = m.change24hPct >= 0;
            const selected = m.coin === coin;
            return (
              <button
                key={m.coin}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(m.coin)}
                className="flex w-full items-center border-b border-app-line pl-4 pr-4 text-left text-app-body leading-[17px] tracking-[0.14px] transition-colors active:bg-white/[0.04]"
              >
                <span className={`flex h-[41px] shrink-0 items-center gap-1.5 ${COLUMNS[0].width}`}>
                  {m.iconSrc ? (
                    <img alt="" src={m.iconSrc} className="size-[23px] shrink-0 rounded-full bg-white object-cover" />
                  ) : null}
                  <span className="whitespace-nowrap text-ink">
                    {m.coin} - {m.symbol.split("-")[1] ?? "USDC"}
                  </span>
                  <span className="rounded border border-app-positive bg-app-positive-subtle px-1 py-0.5 text-app-caption leading-4 text-app-positive">
                    {m.maxLeverage} x
                  </span>
                </span>
                <span className={`shrink-0 whitespace-nowrap text-ink ${COLUMNS[1].width}`}>
                  {formatGrouped(m.markPx, m.pxDecimals)}
                </span>
                <span
                  className={`shrink-0 whitespace-nowrap ${COLUMNS[2].width} ${
                    up ? "text-app-positive" : "text-[#f44f2a]"
                  }`}
                >
                  {up ? "+" : "-"}
                  {formatGrouped(Math.abs(m.change24hAbs), m.pxDecimals)} / {up ? "+" : "-"}
                  {Math.abs(m.change24hPct).toFixed(2)}%
                </span>
                <span className={`shrink-0 whitespace-nowrap text-ink ${COLUMNS[3].width}`}>
                  {m.funding8h.toFixed(4)}%
                </span>
                <span className={`shrink-0 whitespace-nowrap text-ink ${COLUMNS[4].width}`}>
                  {m.volume24h}
                </span>
                <span className={`shrink-0 whitespace-nowrap text-ink ${COLUMNS[5].width}`}>
                  {m.openInterest}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-app-body text-ink-faint">
          No markets match{query.trim() ? ` “${query.trim()}”` : " this category"}.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Figma "Trade / Pair Selector — Open" (954:4803) → "Pair Selector Sheet"
 * (954:4904): search, category chips and a sideways-scrolling market table.
 * Tapping a row selects the market and closes the sheet.
 */
export default function PairSelectorSheet({ open, onClose, coin, onSelect }) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select market"
      className="h-[min(667px,calc(100dvh-env(safe-area-inset-top)-2.5rem))] proportional-nums"
    >
      <PairSelectorBody
        coin={coin}
        onSelect={(next) => {
          onSelect?.(next);
          onClose?.();
        }}
      />
    </BottomSheet>
  );
}
