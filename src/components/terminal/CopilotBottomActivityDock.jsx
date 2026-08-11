import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GREEN = "#269755";
const RED = "#d53d3d";
const GOLD = "#f2b500";
const BADGE_BG = "rgba(62, 46, 0, 0.85)";
const BORDER = "#242424";

const TABS_BASE = [
  { id: "positions", label: "Positions", count: 0 },
  { id: "openOrders", label: "Open Orders", count: 0 },
  { id: "orderHistory", label: "Order History", count: 1903 },
  { id: "tradeHistory", label: "Trade History", count: 76 },
  { id: "balance", label: "Balance", count: 1 },
];

const MOCK_TRADES = [
  {
    time: "02/25/2026 - 06:29:21 PM",
    coin: "HYPE",
    direction: "Close Long",
    price: "27.631",
    size: "0.55 HYPE",
    tradeValue: "15.197 USDC",
    fee: "0.01 USDC",
    closedPnl: "0.34 USDC",
    pnlPositive: true,
  },
  {
    time: "02/25/2026 - 06:12:08 PM",
    coin: "BTC",
    direction: "Open Long",
    price: "86,420.5",
    size: "0.012 BTC",
    tradeValue: "1,037.05 USDC",
    fee: "0.52 USDC",
    closedPnl: "—",
    pnlPositive: null,
  },
  {
    time: "02/25/2026 - 05:44:33 PM",
    coin: "ETH",
    direction: "Close Short",
    price: "2,312.40",
    size: "1.2 ETH",
    tradeValue: "2,774.88 USDC",
    fee: "0.14 USDC",
    closedPnl: "12.90 USDC",
    pnlPositive: true,
  },
  {
    time: "02/25/2026 - 05:01:00 PM",
    coin: "SOL",
    direction: "Open Long",
    price: "142.22",
    size: "8 SOL",
    tradeValue: "1,137.76 USDC",
    fee: "0.57 USDC",
    closedPnl: "—",
    pnlPositive: null,
  },
  {
    time: "02/24/2026 - 11:18:45 PM",
    coin: "HYPE",
    direction: "Close Long",
    price: "26.905",
    size: "2.1 HYPE",
    tradeValue: "56.50 USDC",
    fee: "0.03 USDC",
    closedPnl: "-0.82 USDC",
    pnlPositive: false,
  },
  {
    time: "02/24/2026 - 09:02:11 PM",
    coin: "BTC",
    direction: "Close Short",
    price: "85,100.0",
    size: "0.04 BTC",
    tradeValue: "3,404.00 USDC",
    fee: "1.70 USDC",
    closedPnl: "44.12 USDC",
    pnlPositive: true,
  },
  {
    time: "02/24/2026 - 04:55:30 PM",
    coin: "ETH",
    direction: "Open Short",
    price: "2,298.00",
    size: "0.5 ETH",
    tradeValue: "1,149.00 USDC",
    fee: "0.57 USDC",
    closedPnl: "—",
    pnlPositive: null,
  },
  {
    time: "02/24/2026 - 02:22:09 PM",
    coin: "HYPE",
    direction: "Open Long",
    price: "27.120",
    size: "1.0 HYPE",
    tradeValue: "27.12 USDC",
    fee: "0.01 USDC",
    closedPnl: "—",
    pnlPositive: null,
  },
];

function directionColor(direction) {
  if (direction === "Open Long" || direction === "Close Short") return GREEN;
  if (direction === "Close Long" || direction === "Open Short") return RED;
  return "#e5e5e5";
}

function positionSideColor(side) {
  if (side === "Long") return GREEN;
  if (side === "Short") return RED;
  return "#e5e5e5";
}

function ExternalLinkIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/*
 * Resting cap, and the cap while a setup is selected. Both are caps, not
 * heights — a tab with one row or an empty state still sizes to its content.
 *
 * Budget at an 800px viewport: 65 header + 71 filters leaves 664 for feed +
 * dock. The dock's own chrome (tabs 39 + column header 32) is 71, so 156 shows
 * ~2.5 rows and 128 shows ~1.5 — enough to read as a scrollable table without
 * out-bidding the suggestions feed, which is what the page is for.
 */
const REST_H = 156;
const COMPACT_H = 128;
const MAX_H = 520;
const WHEEL_STEP = 48;

export default function CopilotBottomActivityDock({
  tourDemoPosition = null,
  highlightOpenedPositionRow = false,
  compact = false,
}) {
  const minHeight = compact ? COMPACT_H : REST_H;
  const [activeTab, setActiveTab] = useState("tradeHistory");
  const [panelHeight, setPanelHeight] = useState(REST_H);
  const dockRef = useRef(null);
  const bodyRef = useRef(null);
  const openedPositionRowRef = useRef(null);
  const panelHeightRef = useRef(REST_H);
  const restoreRef = useRef(REST_H);

  const tabs = useMemo(() => {
    return TABS_BASE.map((t) =>
      t.id === "positions"
        ? { ...t, count: tourDemoPosition ? 1 : t.count }
        : t,
    );
  }, [tourDemoPosition]);

  useEffect(() => {
    if (tourDemoPosition) {
      setActiveTab("positions");
    }
  }, [tourDemoPosition]);

  useEffect(() => {
    panelHeightRef.current = panelHeight;
  }, [panelHeight]);

  /*
    Selecting a setup has to actually shrink the dock — this used to be
    `Math.max(minHeight, …)`, which only ever raised, so with the panel at its
    resting cap and the compact floor below it the clamp was a no-op and
    `compact` compacted nothing. Clamp down on the way in; restore the
    pre-compact cap on the way out so a deliberate wheel-resize survives.
  */
  useEffect(() => {
    setPanelHeight((h) => {
      if (compact) {
        restoreRef.current = h;
        return Math.min(h, COMPACT_H);
      }
      return Math.min(MAX_H, Math.max(h, restoreRef.current));
    });
  }, [compact]);

  useEffect(() => {
    if (!highlightOpenedPositionRow) return;
    const row = openedPositionRowRef.current;
    if (!row) return;
    requestAnimationFrame(() => {
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, [highlightOpenedPositionRow, tourDemoPosition]);

  const onWheel = useCallback((e) => {
    const body = bodyRef.current;
    const dy = e.deltaY;
    const h = panelHeightRef.current;

    if (h < MAX_H) {
      if (dy > 0) {
        e.preventDefault();
        setPanelHeight((prev) => Math.min(MAX_H, prev + WHEEL_STEP));
        return;
      }
      if (dy < 0) {
        e.preventDefault();
        setPanelHeight((prev) => Math.max(minHeight, prev - WHEEL_STEP));
        return;
      }
    }

    if (!body) return;
    const { scrollTop, scrollHeight, clientHeight } = body;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const atTop = scrollTop <= 0;

    if (dy > 0 && !atBottom) {
      e.preventDefault();
      body.scrollTop += dy;
      return;
    }
    if (dy < 0 && !atTop) {
      e.preventDefault();
      body.scrollTop += dy;
      return;
    }
    if (dy < 0 && atTop) {
      e.preventDefault();
      setPanelHeight((prev) => Math.max(minHeight, prev - WHEEL_STEP));
    }
  }, [minHeight]);

  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  return (
    /*
      `panelHeight` is a cap, not a height. A tab holding one row (or an empty
      state) sizes to that row instead of leaving a black gap under it, and the
      reclaimed space goes to the suggestions feed above. The vh clamp keeps a
      wheel-expanded dock from eating the feed's share on a short viewport.
    */
    <section
      ref={dockRef}
      data-tour="position-tracking"
      className="flex min-h-0 min-w-0 shrink-0 flex-col border-t border-[#242424] bg-black"
      style={{
        maxHeight: `min(${panelHeight}px, 50vh)`,
        transition: "max-height 0.18s ease-out",
      }}
      aria-label="Activity"
    >
      <div className="flex shrink-0 flex-col border-b border-[#1a1a1a] pt-1 pb-0.5">
        <div className="flex w-full min-w-0 items-end gap-1 overflow-x-auto px-3 pb-0 minimal-scrollbar">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex shrink-0 items-center gap-1.5 px-2 py-2 text-control whitespace-nowrap max-tablet:min-h-10 max-tablet:px-2.5 ${
                  active ? "font-medium text-[#F2B500]" : "text-ink-subtle hover:text-ink-muted"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className="ds-eyebrow rounded px-1.5 py-0.5"
                  style={{
                    backgroundColor: BADGE_BG,
                    color: GOLD,
                    border: "1px solid rgba(242, 181, 0, 0.35)",
                  }}
                >
                  {tab.count.toLocaleString("en-US")}
                </span>
                {active ? (
                  <span
                    className="absolute right-2 bottom-0 left-2 h-px rounded-full"
                    style={{ backgroundColor: GOLD }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* `grow`, not `flex-1`: with the section on auto height a `flex-basis: 0`
          child sizes to nothing instead of to its rows. */}
      <div className="flex min-h-0 min-w-0 grow flex-col overflow-hidden">
        {activeTab === "tradeHistory" ? (
          <>
            <div className="minimal-scrollbar flex min-h-0 min-w-0 grow flex-col overflow-x-auto overflow-y-hidden">
              <div className="flex min-h-0 min-w-[720px] grow flex-col">
                <div
                  className="grid shrink-0 grid-cols-[minmax(9rem,1.1fr)_minmax(3rem,0.5fr)_minmax(5.5rem,0.85fr)_minmax(4rem,0.65fr)_minmax(5rem,0.75fr)_minmax(5.5rem,0.85fr)_minmax(4rem,0.65fr)_minmax(5rem,0.75fr)] ds-eyebrow gap-2 border-b px-3 py-2 text-ink-subtle"
                  style={{ borderColor: BORDER }}
                >
                  <span>Time</span>
                  <span>Coin</span>
                  <span>Direction</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Trade Value</span>
                  <span className="text-right">Fee</span>
                  <span className="text-right">Closed PNL</span>
                </div>
                <div
                  ref={bodyRef}
                  className="minimal-scrollbar min-h-0 grow overflow-y-auto overscroll-y-contain"
                >
                  {MOCK_TRADES.map((row, i) => {
                    const dColor = directionColor(row.direction);
                    const showPnlIcon = row.closedPnl !== "—";
                    return (
                      <div
                        key={`${row.time}-${i}`}
                        className="grid grid-cols-[minmax(9rem,1.1fr)_minmax(3rem,0.5fr)_minmax(5.5rem,0.85fr)_minmax(4rem,0.65fr)_minmax(5rem,0.75fr)_minmax(5.5rem,0.85fr)_minmax(4rem,0.65fr)_minmax(5rem,0.75fr)] gap-2 border-b px-3 py-2 text-data"
                        style={{ borderColor: "#1a1a1a" }}
                      >
                        <span className="text-ink-muted">{row.time}</span>
                        <span className="font-medium" style={{ color: dColor }}>
                          {row.coin}
                        </span>
                        <span className="font-medium" style={{ color: dColor }}>
                          {row.direction}
                        </span>
                        <span className="text-right text-ink">
                          {row.price}
                        </span>
                        <span className="text-right text-ink">
                          {row.size}
                        </span>
                        <span className="text-right text-ink">
                          {row.tradeValue}
                        </span>
                        <span className="text-right text-ink">
                          {row.fee}
                        </span>
                        <span className="flex items-center justify-end gap-1 text-right font-medium">
                          {row.pnlPositive === true ? (
                            <span style={{ color: GREEN }}>{row.closedPnl}</span>
                          ) : row.pnlPositive === false ? (
                            <span style={{ color: RED }}>{row.closedPnl}</span>
                          ) : (
                            <span className="text-ink-subtle">
                              {row.closedPnl}
                            </span>
                          )}
                          {showPnlIcon ? (
                            <button
                              type="button"
                              className="text-ink-subtle hover:text-ink"
                              aria-label="View trade details"
                            >
                              <ExternalLinkIcon className="inline" />
                            </button>
                          ) : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "positions" && tourDemoPosition ? (
          <>
            <div className="minimal-scrollbar flex min-h-0 min-w-0 grow flex-col overflow-x-auto overflow-y-hidden">
              <div className="flex min-h-0 min-w-[560px] grow flex-col">
                <div
                  className="grid shrink-0 grid-cols-[minmax(5rem,0.65fr)_minmax(3rem,0.45fr)_minmax(3.5rem,0.5fr)_minmax(5rem,0.65fr)_minmax(4.5rem,0.6fr)_minmax(4.5rem,0.6fr)_minmax(4.5rem,0.55fr)] ds-eyebrow gap-2 border-b px-3 py-2 text-ink-subtle"
                  style={{ borderColor: BORDER }}
                >
                  <span>Opened</span>
                  <span>Coin</span>
                  <span>Side</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Entry</span>
                  <span className="text-right">Mark</span>
                  <span className="text-right">uPnL</span>
                </div>
                <div
                  ref={bodyRef}
                  data-tour="copilot-positions-body"
                  className="minimal-scrollbar min-h-0 grow overflow-y-auto overscroll-y-contain"
                >
                  <div
                    ref={openedPositionRowRef}
                    data-tour="copilot-demo-position-row"
                    className={`relative grid grid-cols-[minmax(5rem,0.65fr)_minmax(3rem,0.45fr)_minmax(3.5rem,0.5fr)_minmax(5rem,0.65fr)_minmax(4.5rem,0.6fr)_minmax(4.5rem,0.6fr)_minmax(4.5rem,0.55fr)] gap-2 border-b px-3 py-2.5 text-data ${
                      highlightOpenedPositionRow
                        ? "overflow-hidden copilot-position-row-highlight [&>*]:relative [&>*]:z-[1]"
                        : ""
                    }`}
                    style={{ borderColor: "#1a1a1a" }}
                  >
                    <span className="text-ink-muted">
                      {tourDemoPosition.openedAt}
                    </span>
                    <span
                      className="text-ink"
                      style={{ color: positionSideColor(tourDemoPosition.side) }}
                    >
                      {tourDemoPosition.symbol}
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: positionSideColor(tourDemoPosition.side) }}
                    >
                      {tourDemoPosition.side}
                    </span>
                    <span className="text-right text-ink">
                      {tourDemoPosition.sizeLabel}
                    </span>
                    <span className="text-right text-ink">
                      {tourDemoPosition.entry}
                    </span>
                    <span className="text-right text-ink">
                      {tourDemoPosition.mark}
                    </span>
                    <span
                      className="text-right"
                      style={{ color: GREEN }}
                    >
                      {tourDemoPosition.upnl}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 grow items-center justify-center px-4 py-6 text-center text-data text-ink-subtle">
            {tabs.find((t) => t.id === activeTab)?.label} view is a placeholder
            — connect your account data here.
          </div>
        )}
      </div>
    </section>
  );
}
