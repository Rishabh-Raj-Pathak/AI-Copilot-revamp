import { Activity, Hexagon, Layers, Pencil, X, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { dexTabs } from "./vaultsMockData.js";
import { historyTableMock, positionsTableMock } from "./vaultsPositionsHistoryMock.js";

const DEX_ICONS = {
  all: Layers,
  hyperliquid: Activity,
  paradex: Hexagon,
  nado: Zap,
};

const ACTIVE_TAB_GRADIENT =
  "linear-gradient(180deg, #1a140b 0%, #18130b 16.67%, #16120b 33.33%, #14110c 50%, #13100c 66.67%, #110f0c 83.33%, #0f0e0c 100%)";

const COIN_AVATAR = {
  BTC: "bg-[#f7931a]/25 text-[#ffb347]",
  SOL: "bg-[#9945ff]/20 text-[#c4a5ff]",
  ETH: "bg-[#627eea]/20 text-[#a5b4fc]",
};

/**
 * Figma `4421:6680` `HistoryTable` — Positions / History tabs, venue pill track,
 * and wide positions grid (BTC / SOL / ETH sample rows).
 */
export default function VaultsPositionsHistoryTable() {
  const [mainTab, setMainTab] = useState("positions");
  const [venueId, setVenueId] = useState("all");

  const filteredPositions = useMemo(() => {
    if (venueId === "all") return positionsTableMock;
    return positionsTableMock.filter((p) => p.venue === venueId);
  }, [venueId]);

  const filteredHistory = useMemo(() => {
    if (venueId === "all") return historyTableMock;
    return historyTableMock.filter((h) => h.venue === venueId);
  }, [venueId]);

  const venueLabel = (id) => dexTabs.find((t) => t.id === id)?.label ?? id;

  return (
    <section
      className="vaults-root w-full max-w-[1150px]"
      aria-label="Positions and trade history"
    >
      <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[#050505] px-6 pb-6 pt-8 sm:px-8">
        <div className="border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setMainTab("positions")}
              className={`relative pb-2.5 text-[15px] font-medium tracking-[0.15px] transition-colors ${
                mainTab === "positions"
                  ? "text-[#e0d5c2]"
                  : "text-[#4a4a5c] hover:text-[#717182]"
              }`}
            >
              Positions
              {mainTab === "positions" ? (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#785a28] to-[#ccb17f]"
                  aria-hidden
                />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setMainTab("history")}
              className={`relative pb-2.5 text-[15px] font-medium tracking-[0.15px] transition-colors ${
                mainTab === "history"
                  ? "text-[#e0d5c2]"
                  : "text-[#4a4a5c] hover:text-[#717182]"
              }`}
            >
              History
              {mainTab === "history" ? (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#785a28] to-[#ccb17f]"
                  aria-hidden
                />
              ) : null}
            </button>
          </div>
        </div>

        <div className="mt-8 flex min-w-0 max-w-full overflow-x-auto pb-0.5 [scrollbar-width:thin]">
          <div
            className="inline-flex h-[49px] shrink-0 items-center gap-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#121212] p-1"
            role="tablist"
            aria-label="Venue filters for positions table"
          >
            {dexTabs.map((tab) => {
              const Icon = DEX_ICONS[tab.id] ?? Layers;
              const active = tab.id === venueId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setVenueId(tab.id)}
                  className={`relative inline-flex h-[41px] shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-medium uppercase leading-[21px] tracking-[0.35px] transition-colors ${
                    active
                      ? "border-[#785a28] text-[#e8d5b5] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]"
                      : "border-transparent text-[#717182] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] hover:text-[#e8d5b5]/80"
                  }`}
                  style={active ? { backgroundImage: ACTIVE_TAB_GRADIENT } : undefined}
                >
                  <Icon
                    className={`size-4 shrink-0 ${active ? "text-[#e8d5b5]" : "text-[#717182]"}`}
                    aria-hidden
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {mainTab === "positions" ? (
          <div className="mt-8 min-w-0">
            <div className="vaults-minimal-scrollbar vaults-positions-history-scroll overflow-x-auto">
              <div className="min-w-[1080px]" role="table" aria-label="Open positions">
                <div
                  className="vaults-positions-header-grid px-4 text-[10px] font-medium uppercase leading-[14px] tracking-[0.65px] text-[#3e3e52]"
                  role="row"
                >
                  <span role="columnheader">Coin</span>
                  <span role="columnheader">Size</span>
                  <span role="columnheader">Pos. Value</span>
                  <span role="columnheader">Entry Price</span>
                  <span role="columnheader">Curr. Price</span>
                  <span role="columnheader">PNL (ROE%)</span>
                  <span role="columnheader">Liq. Price</span>
                  <span role="columnheader">Margin</span>
                  <span role="columnheader">Funding</span>
                  <span role="columnheader">TP / SL</span>
                  <span role="columnheader">Exp. P / L</span>
                  <span role="columnheader" className="text-right">
                    Action
                  </span>
                </div>
                <div
                  className="mt-3 h-px w-full bg-[length:100%_100%]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, rgba(0,0,0,0) 100%)",
                  }}
                  aria-hidden
                />

                <ul className="mt-3 flex flex-col gap-2" role="presentation">
                  {filteredPositions.map((row) => (
                    <li key={row.id} role="row">
                      <div className="relative overflow-hidden rounded-[13px] border border-[rgba(255,255,255,0.05)] bg-gradient-to-b from-[#111116] to-[#0c0c10] shadow-[0_2px_3px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.25)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                        <div className="vaults-positions-row-grid items-center px-4 py-5">
                          <div className="flex flex-col gap-1.5 border-r border-[rgba(255,255,255,0.05)] pr-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`flex size-3 shrink-0 items-center justify-center rounded-full text-[7px] font-semibold ${COIN_AVATAR[row.symbol] ?? "bg-white/10 text-white/80"}`}
                                aria-hidden
                              >
                                {row.symbol.slice(0, 1)}
                              </span>
                              <span className="text-[13px] font-medium tracking-[0.1px] text-[#e8d5b5]">
                                {row.symbol}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span
                                className={`rounded px-[7px] py-0.5 text-[10px] leading-[15px] tracking-[0.3px] ${
                                  row.direction === "long"
                                    ? "border border-[rgba(0,212,146,0.16)] bg-[rgba(0,212,146,0.07)] text-[rgba(0,212,146,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                                    : "border border-[rgba(229,72,77,0.16)] bg-[rgba(229,72,77,0.07)] text-[rgba(229,72,77,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                                }`}
                              >
                                {row.direction === "long" ? "Long" : "Short"}
                              </span>
                              <span className="rounded border border-[rgba(196,168,112,0.16)] bg-[rgba(196,168,112,0.07)] px-[7px] py-0.5 text-[10px] leading-[15px] tracking-[0.2px] text-[rgba(196,168,112,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                                {row.leverage}×
                              </span>
                            </div>
                          </div>

                          <div className="border-r border-[rgba(255,255,255,0.05)] pr-2 text-[12px] leading-[18px] text-[#7a7a8c]">
                            {row.sizeLabel}
                          </div>
                          <div className="border-r border-[rgba(255,255,255,0.05)] pr-2 text-[12px] font-medium leading-[18px] text-[#b0b0be]">
                            {row.posValue}
                          </div>
                          <div className="border-r border-[rgba(255,255,255,0.05)] pr-2 text-[12px] leading-[18px] text-[#7a7a8c]">
                            {row.entryPrice}
                          </div>
                          <div className="border-r border-[rgba(255,255,255,0.05)] pr-2 text-[12px] font-medium leading-[18px] text-[#dcdce8]">
                            {row.currPrice}
                          </div>

                          <div
                            className={`vaults-pnl-cell relative flex flex-col gap-0.5 rounded-lg border-r border-[rgba(255,255,255,0.05)] py-0.5 pl-2.5 pr-2 ${
                              row.pnlPositive ? "vaults-pnl-cell-positive" : "vaults-pnl-cell-negative"
                            }`}
                          >
                            <span
                              className={`absolute left-0 top-1/2 h-[21px] w-0.5 -translate-y-1/2 rounded-full ${
                                row.pnlPositive ? "bg-[rgba(0,212,146,0.4)]" : "bg-[rgba(229,72,77,0.4)]"
                              }`}
                              aria-hidden
                            />
                            <span
                              className={`text-[13px] font-medium leading-[18px] ${
                                row.pnlPositive ? "text-[#00d492]" : "text-[#e5484d]"
                              }`}
                            >
                              {row.pnlUsd}
                            </span>
                            <span
                              className={`text-[11px] leading-[16.5px] opacity-80 ${
                                row.pnlPositive ? "text-[#00d492]" : "text-[#e5484d]"
                              }`}
                            >
                              {row.pnlPct}
                            </span>
                          </div>

                          <div className="border-r border-[rgba(255,255,255,0.05)] pr-2 text-[12px] leading-[18px] text-[#7a7a8c]">
                            {row.liqPrice}
                          </div>
                          <div className="flex flex-col gap-1 border-r border-[rgba(255,255,255,0.05)] pr-2">
                            <span className="text-[12px] font-medium leading-[18px] text-[#b0b0be]">
                              {row.margin}
                            </span>
                            {row.marginMode === "isolated" ? (
                              <span className="w-fit rounded border border-[rgba(120,100,64,0.14)] bg-[rgba(120,100,64,0.07)] px-1.5 py-0.5 text-[9px] uppercase leading-[13px] tracking-[0.4px] text-[rgba(120,100,64,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                                Isolated
                              </span>
                            ) : null}
                          </div>
                          <div
                            className={`border-r border-[rgba(255,255,255,0.05)] pr-2 text-[12px] font-medium leading-[18px] ${
                              row.fundingPositive ? "text-[#00d492]" : "text-[#e5484d]"
                            }`}
                          >
                            {row.funding}
                          </div>

                          <div className="flex flex-col gap-1 border-r border-[rgba(255,255,255,0.05)] pr-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[8.5px] uppercase leading-[12.75px] tracking-[0.5px] text-[#3e3e52]">
                                TP
                              </span>
                              <span className="text-[11px] font-medium leading-[16.5px] text-[rgba(0,212,146,0.75)]">
                                {row.tp}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8.5px] uppercase leading-[12.75px] tracking-[0.5px] text-[#3e3e52]">
                                SL
                              </span>
                              <span className="text-[11px] font-medium leading-[16.5px] text-[rgba(229,72,77,0.75)]">
                                {row.sl}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 border-r border-[rgba(255,255,255,0.05)] pr-2">
                            <div className="flex flex-wrap items-baseline gap-1 text-[11px] leading-[16.5px] text-[rgba(0,212,146,0.72)]">
                              <span>{row.expProfit}</span>
                              <span className="opacity-60">{row.expProfitPct}</span>
                            </div>
                            <div className="flex flex-wrap items-baseline gap-1 text-[11px] leading-[16.5px] text-[rgba(229,72,77,0.72)]">
                              <span>{row.expLoss}</span>
                              <span className="opacity-60">{row.expLossPct}</span>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="flex size-8 items-center justify-center rounded-lg border border-[rgba(47,158,133,0.38)] text-[rgba(47,158,133,0.95)] transition-colors hover:bg-[rgba(47,158,133,0.08)]"
                              aria-label={`Edit ${row.symbol} position`}
                            >
                              <Pencil className="size-[13px]" strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              className="flex size-8 items-center justify-center rounded-lg border border-[rgba(229,72,77,0.38)] text-[rgba(229,72,77,0.95)] transition-colors hover:bg-[rgba(229,72,77,0.08)]"
                              aria-label={`Close ${row.symbol} position`}
                            >
                              <X className="size-[13px]" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {filteredPositions.length === 0 ? (
                  <p className="mt-6 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0c0c0c] px-4 py-6 text-center text-sm text-[#717182]">
                    No open positions for this venue.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 min-w-0">
            <div className="vaults-minimal-scrollbar vaults-positions-history-scroll overflow-x-auto">
              <div className="min-w-[720px]" role="table" aria-label="Trade history">
                <div
                  className="vaults-history-header-grid px-4 text-[10px] font-medium uppercase leading-[14px] tracking-[0.65px] text-[#3e3e52]"
                  role="row"
                >
                  <span role="columnheader">Time</span>
                  <span role="columnheader">Coin</span>
                  <span role="columnheader">Side</span>
                  <span role="columnheader">Size</span>
                  <span role="columnheader">Entry</span>
                  <span role="columnheader">Exit</span>
                  <span role="columnheader">PNL</span>
                  <span role="columnheader">Venue</span>
                  <span role="columnheader">Status</span>
                </div>
                <div
                  className="mt-3 h-px w-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, rgba(0,0,0,0) 100%)",
                  }}
                  aria-hidden
                />
                <ul className="mt-3 flex flex-col gap-2" role="presentation">
                  {filteredHistory.map((row) => (
                    <li key={row.id} role="row">
                      <div className="vaults-history-row-grid relative items-center rounded-[13px] border border-[rgba(255,255,255,0.05)] bg-gradient-to-b from-[#111116] to-[#0c0c10] px-4 py-4 text-[12px] shadow-[0_2px_3px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.25)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                        <span className="text-[#7a7a8c]">{row.time}</span>
                        <span className="font-medium text-[#e8d5b5]">{row.symbol}</span>
                        <span
                          className={
                            row.side === "long"
                              ? "text-[rgba(0,212,146,0.85)]"
                              : "text-[rgba(229,72,77,0.85)]"
                          }
                        >
                          {row.side === "long" ? "Long" : "Short"}
                        </span>
                        <span className="text-[#7a7a8c]">{row.size}</span>
                        <span className="text-[#b0b0be]">{row.entry}</span>
                        <span className="text-[#dcdce8]">{row.exit}</span>
                        <span
                          className={`font-medium ${
                            row.pnlPositive ? "text-[#00d492]" : "text-[#e5484d]"
                          }`}
                        >
                          {row.pnl}
                        </span>
                        <span className="uppercase tracking-[0.35px] text-[#717182]">
                          {venueLabel(row.venue)}
                        </span>
                        <span className="text-[#b0b0be]">{row.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {filteredHistory.length === 0 ? (
                  <p className="mt-6 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0c0c0c] px-4 py-6 text-center text-sm text-[#717182]">
                    No history for this venue.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
