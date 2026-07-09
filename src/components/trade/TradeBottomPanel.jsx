import { useState } from "react";
import TradeDataTable from "./TradeDataTable.jsx";
import { TRADE_TABS } from "./tradeTableColumns.jsx";
import { TAB_COUNTS } from "./tradeMockData.js";

export default function TradeBottomPanel() {
  const [activeId, setActiveId] = useState(TRADE_TABS[0].id);
  const active = TRADE_TABS.find((t) => t.id === activeId) ?? TRADE_TABS[0];

  return (
    <section
      className="flex min-h-0 shrink-0 flex-col bg-black max-tablet:min-h-[16rem] tablet:h-[16rem]"
      aria-label="Positions and orders"
    >
      <div
        role="tablist"
        aria-label="Trade tables"
        className="minimal-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[#242424] px-2 sm:gap-2 sm:px-3"
      >
        {TRADE_TABS.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`trade-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`trade-panel-${t.id}`}
              onClick={() => setActiveId(t.id)}
              className={`flex shrink-0 items-center gap-2 border-b-[3px] px-2 py-3 text-sm transition-colors sm:px-3 ${
                selected
                  ? "border-[#f2b500] font-semibold text-white"
                  : "border-transparent text-[#bfbfbf] hover:text-white"
              }`}
            >
              {t.label}
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] tabular-nums ${
                  selected
                    ? "bg-[#3e2e00] text-[#f2b500]"
                    : "bg-[#1a1a1a] text-[#787878]"
                }`}
              >
                {TAB_COUNTS[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`trade-panel-${active.id}`}
        aria-labelledby={`trade-tab-${active.id}`}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TradeDataTable
          columns={active.columns}
          rows={active.rows}
          empty={active.empty}
        />
      </div>
    </section>
  );
}
