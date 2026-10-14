import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { THEME_ICONS, TOKEN_FILTERS, filterTokens } from "../../../delta-neutral/utils/markets.ts";
import { formatCostPct, formatUsd } from "../../../delta-neutral/utils/format.ts";
import { Dn2Button, Dn2Sheet, VenueDisc } from "./Dn2Ui.jsx";
import { CHIP, CHIP_ON, FIELD, LABEL, TILE } from "./dn2Theme.js";

/* ── DEX picker (Figma B4 4495:2) ─────────────────────────────────────── */

/**
 * The web venue dropdown as a sheet, and only what it lists: each DEX with its
 * connection dot, the picked one ticked. The DEX the other leg holds stays
 * listed but disabled, so the list never reshuffles between the two pickers.
 * Connecting, depositing and changing a wallet happen on the DEX card (web).
 */
export function Dn2VenueSheet({ open, onClose, slotLabel, options, value, other, isConnected, onSelect }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title={slotLabel}>
      <div className="px-4 pt-4">
        <ul className={`${TILE} flex flex-col overflow-hidden`} role="listbox" aria-label={slotLabel}>
          {options.map((dex, index) => {
            const selected = dex === value;
            const blocked = dex === other;
            return (
              <li
                key={dex}
                className={`${index > 0 ? "border-t border-white/[0.05]" : ""} ${
                  selected ? "bg-[rgba(204,177,127,0.06)]" : ""
                } ${blocked ? "opacity-45" : ""}`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={blocked}
                  onClick={() => {
                    onSelect(dex);
                    onClose();
                  }}
                  className="flex w-full min-w-0 items-center gap-2.5 px-3 py-2.5 text-left"
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${isConnected(dex) ? "bg-[#00d492]" : "bg-[#6b7280]"}`}
                    aria-label={isConnected(dex) ? "Connected" : "Not connected"}
                  />
                  <VenueDisc dex={dex} size={32} logo={19} className="border border-white/[0.05]" />
                  <span
                    className={`min-w-0 flex-1 truncate text-[14px] font-medium leading-[18px] ${
                      selected ? "text-[#e8d5b5]" : "text-[#dcdce8]"
                    }`}
                  >
                    {dex}
                  </span>
                  {selected ? <Check size={18} className="shrink-0 text-[#ccb17f]" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Dn2Sheet>
  );
}

/* ── Market picker (Figma B5 4495:264) ────────────────────────────────── */

/**
 * Same catalog, category filters and leg-structure narrowing as the web picker,
 * which opens on Top Picks and lists pair names only.
 */
const FIRST_FILTER = "Top Picks";

export function Dn2MarketSheet({ open, onClose, value, structure, onSelect }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(FIRST_FILTER);
  const results = useMemo(() => filterTokens(query, filter, structure), [query, filter, structure]);

  const close = () => {
    // Each visit starts where the web picker does, not from the last search.
    setQuery("");
    setFilter(FIRST_FILTER);
    onClose();
  };

  return (
    <Dn2Sheet open={open} onClose={close} title="Select market" fullHeight>
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
          {TOKEN_FILTERS.map((option) => {
            const on = filter === option;
            const Icon = THEME_ICONS[option];
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(option)}
                className={`${CHIP} shrink-0 gap-[5px] px-3 ${
                  on ? CHIP_ON : "border-white/[0.08] font-medium text-[#9a9ba8]"
                }`}
              >
                {Icon ? <Icon size={12} aria-hidden /> : null}
                {option}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col px-4" role="listbox" aria-label="Market pairs">
          {results.length === 0 ? (
            <li className="px-2 py-6 text-center text-[12px] text-[#717182]">
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
                    className={`flex w-full items-center gap-3 border-b border-white/[0.05] px-2 py-3.5 text-left transition-colors active:bg-white/[0.04] ${
                      selected ? "rounded-[8px] bg-[rgba(204,177,127,0.06)]" : ""
                    }`}
                  >
                    <span
                      className={`min-w-0 flex-1 truncate text-[14px] font-medium leading-[18px] ${
                        selected ? "text-[#e8d5b5]" : "text-[#dcdce8]"
                      }`}
                    >
                      {token.value}
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

/* ── Cost to open (Figma B6 4496:2) ───────────────────────────────────── */

const COST_HELP =
  "What it costs to get both legs on: the price impact of your size against the book, plus venue taker fees. It adds up like this:";

/** The terms Cost to open adds up from — the web tooltip's rows, no total (it is on the card). */
export function Dn2CostSheet({ open, onClose, summary }) {
  const terms = summary
    ? [
        {
          label: "Spread",
          pct: formatCostPct(summary.long.priceImpactPct + summary.short.priceImpactPct),
          value: formatUsd(summary.costToOpenUsd.priceImpact),
        },
        {
          label: "DEX fees (taker / maker)",
          pct: formatCostPct(summary.long.openFeePct + summary.short.openFeePct),
          value: formatUsd(summary.costToOpenUsd.fees),
        },
        ...(summary.costToOpenUsd.gas > 0
          ? [{ label: "Gas", pct: "", value: formatUsd(summary.costToOpenUsd.gas) }]
          : []),
      ]
    : // Unsized: the same two rows, dashed.
      [
        { label: "Spread", pct: "", value: "—" },
        { label: "DEX fees (taker / maker)", pct: "", value: "—" },
      ];

  return (
    <Dn2Sheet open={open} onClose={onClose} title="Cost to open">
      <div className="flex flex-col gap-4 px-4 pt-4">
        <p className="text-[13px] leading-[18px] text-[#b4b5c2]">{COST_HELP}</p>
        <dl className={`${TILE} flex flex-col gap-2.5 p-3`}>
          {terms.map((term) => (
            <div key={term.label} className="flex items-center justify-between gap-3">
              <dt className={LABEL}>{term.label}</dt>
              <dd className="flex items-center gap-2.5">
                <span className="text-[11px] leading-[14px] text-[#717182]">{term.pct}</span>
                <span className="text-[12px] leading-4 text-[#dcdce8]">{term.value}</span>
              </dd>
            </div>
          ))}
        </dl>
        <Dn2Button size="lg" className="w-full" onClick={onClose}>
          Got it
        </Dn2Button>
      </div>
    </Dn2Sheet>
  );
}

/* ── Plain explainer (Margin / Leverage ⓘ) ────────────────────────────── */

export function Dn2InfoSheet({ open, onClose, title, body }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <p className="whitespace-pre-line text-[13px] leading-[18px] text-[#b4b5c2]">{body}</p>
        <Dn2Button size="lg" className="w-full" onClick={onClose}>
          Got it
        </Dn2Button>
      </div>
    </Dn2Sheet>
  );
}
