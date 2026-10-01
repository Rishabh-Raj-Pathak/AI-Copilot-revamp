import { useMemo, useState } from "react";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { TOKEN_FILTERS, filterTokens } from "../../../delta-neutral/utils/markets.ts";

/**
 * Market pair picker for the Delta Neutral "Tokens" mode — the phone sheet in
 * place of the desktop TokenPicker popover. Same catalog, same category
 * filters, same leg-structure narrowing.
 */
export default function DnTokenSheet({ open, onClose, value, structure, onSelect }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Top Picks");
  const results = useMemo(
    () => filterTokens(query, filter, structure),
    [query, filter, structure],
  );

  const close = () => {
    // Each visit starts from the default view rather than the last search.
    setQuery("");
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={close} title="Select market" fullHeight>
      <div className="flex flex-col gap-3 pt-3">
        <div className="px-4">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#080808] px-3">
            <AppIcon src={appIcons.search19} size={16} className="text-[#7d7e88]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tokens"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-[#f0f0f0] outline-none placeholder:text-[#6e6f7a]"
            />
          </label>
        </div>

        <div className="app-no-scrollbar app-edge-fade-x flex gap-1.5 overflow-x-auto px-4">
          {TOKEN_FILTERS.map((option) => {
            const active = filter === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option)}
                className={`app-pressable h-9 shrink-0 rounded-lg border px-3 text-app-caption font-medium transition-colors ${
                  active
                    ? "border-[rgba(214,177,107,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9]"
                    : "border-white/[0.08] text-[#9a9ba8]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col gap-1 border-t border-white/[0.07] px-4 pt-2" role="listbox" aria-label="Market pairs">
          {results.length === 0 ? (
            <li className="px-2 py-6 text-center text-app-caption text-[#7d7e88]">
              {query.trim() === ""
                ? `No ${filter === "All Tokens" ? "" : `${filter} `}markets support ${structure}.`
                : `No ${structure} markets match “${query}”.`}
            </li>
          ) : (
            results.map((token) => {
              const selected = token.value === value;
              return (
                <li key={token.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onSelect(token.value);
                      close();
                    }}
                    className={`flex h-12 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-app-body font-medium transition-colors active:bg-white/[0.05] ${
                      selected ? "bg-[rgba(120,90,40,0.22)] text-[#f6e5c8]" : "text-[#d8d9e3]"
                    }`}
                  >
                    <span className="truncate">{token.value}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-app-label uppercase tracking-[0.5px] text-ink-faint">
                        {token.instruments.join(" · ")}
                      </span>
                      {selected ? (
                        <AppIcon src={appIcons.check12} size={12} className="text-[#f0ddb9]" />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </BottomSheet>
  );
}
