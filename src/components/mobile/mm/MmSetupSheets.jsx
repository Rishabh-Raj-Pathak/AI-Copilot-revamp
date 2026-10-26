import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Dn2Sheet } from "../dn2/Dn2Ui.jsx";
import { CHIP, CHIP_ON, FIELD, TILE } from "../dn2/dn2Theme.js";
import { CategoryGlyph, DexLogo } from "../../../market-making/ui.tsx";
import { HIDDEN_CATEGORIES } from "../../../market-making/lib.ts";

/**
 * Production's two dropdowns as phone sheets: the venue list (connection dot,
 * logo, name, tick) and the market picker (search, category filters, tokens
 * by weight).
 */

export function MmVenueSheet({ open, onClose, venues, value, connectedVenues, blockedVenues, onSelect }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title="Select DEX">
      <div className="px-4 pb-2 pt-4">
        <ul className={`${TILE} flex flex-col overflow-hidden`} role="listbox" aria-label="DEX venue">
          {venues.map((v, index) => {
            const selected = v.id === value;
            const note = blockedVenues[v.id];
            const connected = Boolean(connectedVenues[v.id]);
            return (
              <li
                key={v.id}
                className={`${index > 0 ? "border-t border-white/[0.05]" : ""} ${selected ? "bg-[rgba(204,177,127,0.06)]" : ""} ${
                  note ? "opacity-45" : ""
                }`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={Boolean(note)}
                  onClick={() => {
                    onSelect(v.id);
                    onClose();
                  }}
                  className="flex min-h-[52px] w-full min-w-0 items-center gap-2.5 px-3 py-2.5 text-left active:bg-white/[0.04]"
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${connected ? "bg-[#00d492]" : "bg-[#6b7280]"}`}
                    aria-label={connected ? "Connected" : "Not connected"}
                  />
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.05] bg-[#121212]">
                    <DexLogo dex={v.id} className="h-[18px] w-[18px] rounded-full" />
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[14px] font-medium leading-[18px] ${
                      selected ? "text-[#e8d5b5]" : "text-[#dcdce8]"
                    }`}
                  >
                    {v.id}
                  </span>
                  {note ? (
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.4px] text-[#717182]">{note}</span>
                  ) : selected ? (
                    <Check size={18} className="shrink-0 text-[#ccb17f]" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Dn2Sheet>
  );
}

const ALL_TOKENS = "All Tokens";

export function MmMarketSheet({ open, onClose, markets, categories, value, onSelect }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(ALL_TOKENS);
  const filters = [
    ALL_TOKENS,
    ...categories.filter((c) => !HIDDEN_CATEGORIES.includes(c.toLowerCase()) && markets.some((m) => m.categories.includes(c))),
  ];
  const active = filters.includes(filter) ? filter : ALL_TOKENS;
  const q = query.trim().toLowerCase();
  const rows = markets
    .filter((m) => {
      const inFilter = active === ALL_TOKENS || m.categories.includes(active);
      const matches = q === "" || m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
      return inFilter && matches;
    })
    .sort((a, b) => b.sortWeight - a.sortWeight);

  // Each visit starts on the whole list, as production's picker does
  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <Dn2Sheet open={open} onClose={close} title="Select token" fullHeight>
      <div className="flex flex-col gap-3 pt-4">
        <label className={`mx-4 flex h-10 items-center gap-2 px-3 ${FIELD}`}>
          <Search size={16} className="shrink-0 text-[#8f90a1]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tokens…"
            enterKeyHint="search"
            aria-label="Search tokens"
            className="min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-[#f0f0f0] outline-none placeholder:text-[14px] placeholder:text-[#717182]"
          />
        </label>

        <div className="app-no-scrollbar app-edge-fade-x flex gap-1.5 overflow-x-auto px-4" role="group" aria-label="Filter by category">
          {filters.map((f) => {
            const on = f === active;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={`${CHIP} shrink-0 gap-[5px] px-3 ${on ? CHIP_ON : "border-white/[0.08] font-medium text-[#9a9ba8]"}`}
              >
                {f !== ALL_TOKENS ? <CategoryGlyph id={f} className="h-3.5 w-3.5" /> : null}
                {f}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col px-4 pb-2" role="listbox" aria-label="Markets">
          {rows.length === 0 ? (
            <li className="px-2 py-6 text-center text-[12px] text-[#717182]">No tokens found</li>
          ) : (
            rows.map((m) => {
              const selected = m.symbol === value;
              return (
                <li key={m.symbol}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onSelect(m);
                      close();
                    }}
                    className={`flex w-full items-center gap-3 border-b border-white/[0.05] px-2 py-3 text-left transition-colors active:bg-white/[0.04] ${
                      selected ? "rounded-[8px] bg-[rgba(204,177,127,0.06)]" : ""
                    }`}
                  >
                    <span
                      className={`min-w-0 flex-1 truncate py-0.5 text-[14px] font-medium leading-[18px] ${
                        selected ? "text-[#e8d5b5]" : "text-[#dcdce8]"
                      }`}
                    >
                      {m.symbol}
                    </span>
                    {selected ? <Check size={16} className="shrink-0 text-[#ccb17f]" aria-hidden /> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Dn2Sheet>
  );
}

export { DexLogo };
