import { useState } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { historyTableMock, positionsTableMock } from "../../vaults/vaultsPositionsHistoryMock.js";
import { AgentVenueMark } from "./AgentVenueSheet.jsx";

const PAGE_SIZE = 5;

const TABS = [
  { id: "positions", label: "Positions", empty: "Open positions will appear here" },
  { id: "history", label: "History", empty: "Closed trades will appear here" },
];

function SideTag({ side, leverage }) {
  const long = side === "long";
  return (
    <span
      className={`rounded px-1.5 py-px text-[10px] uppercase leading-[15px] tracking-[0.3px] ${
        long
          ? "border border-[rgba(0,212,146,0.16)] bg-[rgba(0,212,146,0.07)] text-[rgba(0,212,146,0.85)]"
          : "border border-[rgba(229,72,77,0.16)] bg-[rgba(229,72,77,0.07)] text-[rgba(229,72,77,0.85)]"
      }`}
    >
      {long ? "Long" : "Short"}
      {leverage ? ` ${leverage}×` : ""}
    </span>
  );
}

function Row({ venue, symbol, side, leverage, detail, value, sub, positive }) {
  return (
    <li className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-b-0">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-app-raised">
        <AgentVenueMark id={venue} size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-app-body font-medium text-[#e8d5b5]">{symbol}</span>
          <SideTag side={side} leverage={leverage} />
        </div>
        <span className="truncate text-app-label text-[#717182]">{detail}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`text-app-body font-medium ${positive ? "text-[#00d492]" : "text-[#e5484d]"}`}>
          {value}
        </span>
        <span className="text-app-label text-[#717182]">{sub}</span>
      </div>
    </li>
  );
}

function PageButton({ label, icon, onPress, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className="app-pressable relative flex size-8 items-center justify-center rounded-md bg-app-subtle text-ink after:absolute after:-inset-1.5 disabled:opacity-50"
    >
      <AppIcon src={icon} size={12} />
    </button>
  );
}

/**
 * Figma "Agent Positions" (953:4374): Positions / History tabs with a gold
 * underline, the empty state and the pager.
 *
 * Rows only exist behind a connected wallet; disconnected, both tabs show
 * their empty line as in Figma. `venueId` narrows the rows to the venue the
 * carousels are filtered on.
 */
export default function MobileAgentPositions({ venueId = "all" }) {
  const app = useMobileApp();
  const [tab, setTab] = useState("positions");
  const [page, setPage] = useState(0);

  const source = tab === "positions" ? positionsTableMock : historyTableMock;
  const rows = !app.walletConnected
    ? []
    : venueId === "all"
      ? source
      : source.filter((row) => row.venue === venueId);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <section
      className="flex flex-col rounded-2xl border border-[#1e1b18] bg-[#080808] p-4"
      aria-label="Agent positions and history"
    >
      <div role="tablist" className="flex gap-[19px] border-b border-white/[0.05]">
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(item.id);
                setPage(0);
              }}
              className={`relative px-5 pb-[13px] pt-[11px] text-[14px] font-medium uppercase leading-[22px] tracking-[0.15px] transition-colors ${
                active ? "text-[#e0d5c2]" : "text-[#4a4a5c]"
              }`}
            >
              {item.label}
              {active ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[linear-gradient(90deg,#785a28_0%,#ccb17f_100%)]"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex h-[164px] items-center justify-center">
          <p className="text-[14px] leading-5 text-[#717182]">{activeTab.empty}</p>
        </div>
      ) : (
        <ul className="flex flex-col py-1">
          {tab === "positions"
            ? visible.map((row) => (
                <Row
                  key={row.id}
                  venue={row.venue}
                  symbol={row.symbol}
                  side={row.direction}
                  leverage={row.leverage}
                  detail={`${row.sizeLabel} · Entry ${row.entryPrice}`}
                  value={row.pnlUsd}
                  sub={row.pnlPct}
                  positive={row.pnlPositive}
                />
              ))
            : visible.map((row) => (
                <Row
                  key={row.id}
                  venue={row.venue}
                  symbol={row.symbol}
                  side={row.side}
                  detail={`${row.time} · ${row.size}`}
                  value={row.pnl}
                  sub={row.status}
                  positive={row.pnlPositive}
                />
              ))}
        </ul>
      )}

      <div className="flex items-center justify-end gap-2">
        <PageButton
          label="Previous page"
          icon={appIcons.chevronLeft16}
          disabled={current === 0}
          onPress={() => setPage(current - 1)}
        />
        <span
          className="flex size-8 items-center justify-center rounded-md bg-[#2f2b1d] text-[14px] font-medium leading-5 text-ink"
          aria-label={`Page ${current + 1} of ${pageCount}`}
        >
          {current + 1}
        </span>
        <PageButton
          label="Next page"
          icon={appIcons.chevronRight16}
          disabled={current >= pageCount - 1}
          onPress={() => setPage(current + 1)}
        />
      </div>
    </section>
  );
}
