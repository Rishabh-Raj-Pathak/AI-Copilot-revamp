import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { THEME_ICONS, TOKEN_FILTERS, filterTokens } from "../../../delta-neutral/utils/markets.ts";
import { formatCompactUsd, formatCostPct, formatUsd } from "../../../delta-neutral/utils/format.ts";
import { formatWalletAddress } from "../../../delta-neutral/utils/wallet.ts";
import { Divider, Dn2Button, Dn2Sheet, VenueDisc } from "./Dn2Ui.jsx";
import { CHIP, CHIP_ON, FIELD, FIELD_LABEL, HINT, LABEL, TILE } from "./dn2Theme.js";

/* ── Venue picker (Figma B4 4495:2) ───────────────────────────────────── */

/**
 * One leg's venue. The venue the other leg holds stays listed but disabled,
 * so the list never reshuffles between the two pickers. Each venue keeps its
 * own wallet: connect, deposit and change it here.
 */
export function Dn2VenueSheet({
  open,
  onClose,
  slotLabel,
  otherSlotLabel,
  options,
  value,
  other,
  isConnected,
  needsSession,
  balances,
  wallets,
  onSelect,
  onConnect,
  onDeposit,
  onChangeWallet,
}) {
  const selectedConnected = value && isConnected(value);

  return (
    <Dn2Sheet open={open} onClose={onClose} title={slotLabel}>
      <div className="flex flex-col gap-3.5 px-4 pt-4">
        <ul className={`${TILE} flex flex-col overflow-hidden`} role="listbox" aria-label={slotLabel}>
          {options.map((dex, index) => {
            const selected = dex === value;
            const blocked = dex === other;
            const connected = isConnected(dex);
            const wallet = wallets[dex];
            const sub = blocked
              ? `In use as ${otherSlotLabel}`
              : connected
                ? `${formatCompactUsd(balances[dex] ?? 0)} available${wallet ? ` · ${formatWalletAddress(wallet)}` : ""}`
                : needsSession(dex)
                  ? "Signs in with a browser session"
                  : "Not connected";
            return (
              <li
                key={dex}
                className={`flex items-center gap-3 p-3 ${index > 0 ? "border-t border-white/[0.05]" : ""} ${
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
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <VenueDisc dex={dex} size={36} logo={22} className="border border-white/[0.05]" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={`truncate text-[14px] font-medium leading-[18px] ${
                        selected ? "text-[#e8d5b5]" : "text-[#dcdce8]"
                      }`}
                    >
                      {dex}
                    </span>
                    <span className="truncate text-[12px] leading-4 text-[#717182]">{sub}</span>
                  </span>
                </button>
                {blocked ? null : !connected ? (
                  <Dn2Button variant="small" size="sm" onClick={() => onConnect(dex)}>
                    {needsSession(dex) ? "Set up" : "Connect DEX"}
                  </Dn2Button>
                ) : selected ? (
                  <Check size={18} className="shrink-0 text-[#ccb17f]" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ul>

        {selectedConnected ? (
          <>
            <p className={FIELD_LABEL}>{value} wallet</p>
            <div className="flex gap-2">
              <Dn2Button className="flex-1" onClick={() => onDeposit(value)}>
                <Plus size={14} aria-hidden />
                Deposit
              </Dn2Button>
              <Dn2Button variant="danger" className="flex-1" onClick={() => onChangeWallet(value)}>
                Change wallet
              </Dn2Button>
            </div>
          </>
        ) : null}
        <p className={HINT}>
          Each venue keeps its own wallet. Both venues must be connected and funded before the vault can open.
        </p>
      </div>
    </Dn2Sheet>
  );
}

/* ── Market picker (Figma B5 4495:264) ────────────────────────────────── */

/** Same catalog, category filters and leg-structure narrowing as the web picker. */
export function Dn2MarketSheet({ open, onClose, value, structure, onSelect }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All Tokens");
  const results = useMemo(() => filterTokens(query, filter, structure), [query, filter, structure]);

  const close = () => {
    // Each visit starts from the full list rather than the last search.
    setQuery("");
    setFilter("All Tokens");
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
                {Icon && !on ? <Icon size={12} aria-hidden /> : null}
                {option === "All Tokens" ? "All tokens" : option}
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
                    className={`flex w-full items-center gap-3 border-b border-white/[0.05] px-2 py-3 text-left transition-colors active:bg-white/[0.04] ${
                      selected ? "rounded-[8px] bg-[rgba(204,177,127,0.06)]" : ""
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className={`truncate text-[14px] font-medium leading-[18px] ${
                          selected ? "text-[#e8d5b5]" : "text-[#dcdce8]"
                        }`}
                      >
                        {token.value}
                      </span>
                      <span className="truncate text-[11px] leading-[14px] text-[#717182]">
                        {token.themes.join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-[6px] border border-white/[0.08] bg-white/[0.04] px-[7px] py-[3px] text-[10px] font-semibold uppercase leading-3 tracking-[0.5px] text-[#9394a1]">
                      {token.instruments.join(" · ")}
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

/* ── Cost to open (Figma B7 4496:2) ───────────────────────────────────── */

const COST_HELP =
  "What it costs to get both legs on: the price impact of your size against the book, plus venue taker fees. It adds up like this:";

/** The terms Cost to open adds up from — the web summary's breakdown. */
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
    : [];
  const pctOfNotional =
    summary && summary.notionalUsd > 0 ? (summary.costToOpenUsd.total / summary.notionalUsd) * 100 : 0;

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
          <Divider />
          <div className="flex items-center justify-between gap-3">
            <dt className={`${LABEL} text-[#e8d5b5]!`}>Cost to open</dt>
            <dd className="flex items-center gap-2.5">
              <span className="text-[11px] leading-[14px] text-[#717182]">
                {summary ? `${formatCostPct(pctOfNotional)} of notional` : ""}
              </span>
              <span className="text-[14px] font-medium leading-4 text-[#e8d5b5]">
                {summary ? formatUsd(summary.costToOpenUsd.total) : "—"}
              </span>
            </dd>
          </div>
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
