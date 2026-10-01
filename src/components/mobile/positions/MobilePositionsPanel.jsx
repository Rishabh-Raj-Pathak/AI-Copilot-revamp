import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { GroupHeader, InfoNote, SummaryStat } from "./PositionsUi.jsx";
import { BalanceCard, HistoryRow, OrderCard, PositionCard, TradeRow } from "./PositionsCards.jsx";
import { CancelAllSheet, ClosePositionSheet, EditTpSlSheet } from "./PositionsSheets.jsx";
import {
  ORDER_HISTORY_TOTAL,
  TRADE_HISTORY_TOTAL,
  USDC_TOTAL_BALANCE,
  balanceMock,
  openOrdersMock,
  orderHistoryMock,
  positionsMock,
  tradeHistoryMock,
} from "./positionsMockData.js";
import {
  formatPrice,
  formatSignedUsd,
  formatSizeUnit,
  formatUsd,
  groupByDay,
  pnlTone,
  roundSize,
} from "./positionsFormat.js";
import { makeOrderId, positionPnl } from "./positionsMath.js";

/**
 * Phone "Positions & Orders" panel — Figma "07 Positions & Orders (new)"
 * (1103:24086) when connected, "Positions Panel" (938:1278) when not.
 *
 *   <MobilePositionsPanel walletConnected={bool} source="copilot" | "trade" />
 *
 * Optional: `onPlaceOrder()` for the empty states' "Place an order" (defaults
 * to opening the Trade tab), `className` for the outer section.
 *
 * The tab strip is `position: sticky; top: 0`, so it pins inside whatever page
 * scroll container mounts the panel. Closing, cancelling and TP/SL edits are
 * local state: a close also writes the fill into Trade / Order History and
 * moves the Balance tab's USDC numbers, so every tab stays consistent.
 */

const TABS = [
  { id: "positions", label: "Positions" },
  { id: "openOrders", label: "Open Orders" },
  { id: "orderHistory", label: "Order History" },
  { id: "tradeHistory", label: "Trade History" },
  { id: "balance", label: "Balance" },
];

const EASE = [0.32, 0.72, 0, 1];

/* -------------------------------------------------------------- tab strip */

/** Shows the left / right fade only while there is more strip that way. */
function useEdgeFades(stripRef, contentRef) {
  const [fades, setFades] = useState({ left: false, right: false });
  const update = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setFades((f) => (f.left === left && f.right === right ? f : { left, right }));
  }, [stripRef]);
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(update);
    if (stripRef.current) ro.observe(stripRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [stripRef, contentRef, update]);
  return [fades, update];
}

/**
 * Figma "Positions Tab" set (938:1277). Compact (40px / 13px, only the active
 * count is gold) when connected; Default (48px / 14px, gold counts) for the
 * disconnected panel. The underline slides between tabs.
 */
function PositionsTabs({ compact, active, counts, onSelect, barRef }) {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const stripRef = useRef(null);
  const contentRef = useRef(null);
  const [fades, updateFades] = useEdgeFades(stripRef, contentRef);

  const select = (id, el) => {
    // Centre the chosen tab in the strip (the browser clamps at either end),
    // which is where the Order / Trade History frames show it.
    const strip = stripRef.current;
    if (strip && el) {
      strip.scrollTo({
        left: el.offsetLeft + el.offsetWidth / 2 - strip.clientWidth / 2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
    onSelect(id);
  };

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-10 border-b border-app-line-accent-subtle bg-app-bg"
    >
      <motion.div
        ref={stripRef}
        layoutScroll
        onScroll={updateFades}
        className="app-no-scrollbar overflow-x-auto overscroll-x-contain"
      >
        <div
          ref={contentRef}
          role="tablist"
          aria-label="Positions and orders"
          className={`relative flex w-max px-4 ${compact ? "gap-5" : "gap-6"}`}
        >
          {TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={(e) => select(tab.id, e.currentTarget)}
                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap ${
                  compact ? "h-10" : "h-12"
                }`}
              >
                <span
                  className={
                    compact
                      ? `text-app-callout leading-4 ${selected ? "font-medium text-ink" : "text-ink-muted"}`
                      : `text-app-body leading-[16.8px] ${selected ? "font-bold text-ink" : "text-ink-muted"}`
                  }
                >
                  {tab.label}
                </span>
                <span
                  className={
                    compact
                      ? `flex min-w-[22px] items-center justify-center rounded px-[5px] py-px text-app-label font-medium ${
                          selected
                            ? "bg-app-line-accent-subtle text-app-accent"
                            : "bg-app-subtle text-ink-subtle"
                        }`
                      : "flex min-w-[22px] items-center justify-center rounded border border-app-line-accent bg-app-line-accent-subtle px-1.5 py-px text-app-body font-medium leading-5 text-ink-muted"
                  }
                >
                  {counts[tab.id]}
                </span>
                {selected ? (
                  <motion.span
                    layoutId={`${uid}-underline`}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 36, stiffness: 420 }}
                    className={`absolute inset-x-0 bottom-0 bg-ink ${compact ? "h-0.5" : "h-[3px]"}`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </motion.div>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-l from-transparent to-black transition-opacity duration-150 ${
          fades.left ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-black transition-opacity duration-150 ${
          fades.right ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

/* ----------------------------------------------------------------- pieces */

/** Wraps a removable card so it collapses out (and back in on Undo). */
function ListItem({ children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.26, ease: EASE }}
      className="overflow-hidden pt-3"
    >
      {children}
    </motion.div>
  );
}

/** Figma "Open Orders / Empty" (1103:24296). */
function EmptyState({ icon, title, body, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 pb-4 pt-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-app-line bg-app-subtle text-ink-muted">
        <AppIcon src={icon} size={20} />
      </span>
      <p className="text-app-button font-medium text-ink">{title}</p>
      <p className="w-full text-app-callout text-ink-subtle">{body}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="app-pressable mt-4 flex h-10 items-center justify-center rounded-[10px] border border-app-line bg-app-subtle px-5 text-app-body font-medium leading-[18px] text-ink active:bg-white/[0.06]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

/** Open Orders says "Long"; history rows say "Open Long" (Figma 1103:24319). */
const historyDirection = (direction) =>
  direction.startsWith("Close") ? direction : `Open ${direction}`;

const canceledRow = (order, id) => ({
  id,
  time: new Date(),
  coin: order.coin,
  direction: historyDirection(order.direction),
  type: order.type,
  price: order.price ?? null,
  size: order.size,
  filledSize: order.filledSize ?? 0,
  reduceOnly: order.reduceOnly,
  triggerCondition: order.triggerPx != null ? `Mark ${order.triggerOp} ${formatUsd(order.triggerPx)}` : null,
  status: "Canceled",
  orderId: order.orderId,
});

let localId = 0;
const nextId = (prefix) => `${prefix}-${Date.now()}-${(localId += 1)}`;

/* ------------------------------------------------------------------ panel */

export default function MobilePositionsPanel({
  walletConnected,
  source = "copilot",
  onPlaceOrder,
  className = "",
}) {
  const app = useMobileApp();
  const toast = useAppToast();
  const connected = walletConnected ?? app.walletConnected;

  const [tab, setTab] = useState("positions");
  const [positions, setPositions] = useState(positionsMock);
  const [orders, setOrders] = useState(openOrdersMock);
  const [orderHistory, setOrderHistory] = useState(orderHistoryMock);
  const [orderHistoryTotal, setOrderHistoryTotal] = useState(ORDER_HISTORY_TOTAL);
  const [trades, setTrades] = useState(tradeHistoryMock);
  const [tradeTotal, setTradeTotal] = useState(TRADE_HISTORY_TOTAL);
  /** Net USDC change from closes this session (realized PnL − fees). */
  const [realizedNet, setRealizedNet] = useState(0);
  const [expanded, setExpanded] = useState({});
  /** Open sheet + the data it was opened with (kept while it animates out). */
  const [sheet, setSheet] = useState({ kind: null, position: null, orders: [], session: 0 });
  const [connectOpen, setConnectOpen] = useState(false);

  const rootRef = useRef(null);
  const barRef = useRef(null);

  /* ------------------------------------------------------- derived values */

  const marginUsed = positions.reduce((sum, p) => sum + p.margin, 0);
  const unrealized = positions.reduce((sum, p) => sum + positionPnl(p), 0);
  const usdcTotal = USDC_TOTAL_BALANCE + realizedNet;
  const balances = [
    {
      id: "bal-usdc",
      coin: "USDC",
      totalBalance: usdcTotal,
      availableBalance: usdcTotal - marginUsed,
      usdcValue: usdcTotal,
      pnl: null,
      roe: null,
      contract: "Perps",
    },
    ...balanceMock,
  ];
  const totalValue = balances.reduce((sum, b) => sum + b.usdcValue, 0);

  const counts = connected
    ? {
        positions: positions.length,
        openOrders: orders.length,
        orderHistory: orderHistoryTotal,
        tradeHistory: tradeTotal,
        balance: balances.length,
      }
    : { positions: 0, openOrders: 0, orderHistory: 0, tradeHistory: 0, balance: 0 };

  /* -------------------------------------------------------------- actions */

  const selectTab = (id) => {
    if (id === tab) return;
    // If the strip is pinned, start the new list at its top instead of
    // leaving the reader mid-way down a different list.
    const root = rootRef.current;
    const bar = barRef.current;
    if (root && bar && root.getBoundingClientRect().top < bar.getBoundingClientRect().top - 1) {
      root.scrollIntoView({ block: "start" });
    }
    setTab(id);
  };

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const closeSheet = () => setSheet((s) => ({ ...s, kind: null }));
  const openSheet = (kind, extra) =>
    setSheet((s) => ({ ...s, ...extra, kind, session: s.session + 1 }));

  const placeOrder = onPlaceOrder ?? (() => app.navigate("trade"));

  const pushOrderHistory = (row) => {
    setOrderHistory((prev) => [row, ...prev]);
    setOrderHistoryTotal((n) => n + 1);
  };

  const confirmClose = ({ position, amount, orderType, closePx, realizedPnl, fee, fraction }) => {
    closeSheet();
    const { coin } = position;
    const closeDirection = position.direction === "long" ? "Close Long" : "Close Short";
    const now = new Date();

    if (orderType === "limit") {
      const order = {
        id: nextId("ord"),
        coin,
        direction: closeDirection,
        type: "Limit",
        price: closePx,
        size: amount,
        filledSize: 0,
        reduceOnly: true,
        tif: "GTC",
        placedAt: now,
        orderId: makeOrderId(),
      };
      setOrders((prev) => [order, ...prev]);
      pushOrderHistory({ ...canceledRow(order, nextId("oh")), status: "Open", time: now });
      toast.show({
        title: "Limit close placed",
        message: `${formatSizeUnit(amount, coin)} at ${formatUsd(closePx)} · in Open orders`,
      });
      return;
    }

    const full = amount >= position.size - 1e-9;
    setPositions((prev) =>
      full
        ? prev.filter((p) => p.id !== position.id)
        : prev.map((p) =>
            p.id === position.id
              ? {
                  ...p,
                  size: roundSize(p.size - amount, coin),
                  margin: p.margin * (1 - fraction),
                  funding: p.funding * (1 - fraction),
                }
              : p,
          ),
    );
    setRealizedNet((v) => v + realizedPnl - fee);
    setTrades((prev) => [
      {
        id: nextId("th"),
        time: now,
        coin,
        direction: closeDirection,
        price: closePx,
        size: amount,
        fee,
        closedPnl: realizedPnl,
      },
      ...prev,
    ]);
    setTradeTotal((n) => n + 1);
    pushOrderHistory({
      id: nextId("oh"),
      time: now,
      coin,
      direction: closeDirection,
      type: "Market",
      price: closePx,
      size: amount,
      filledSize: amount,
      reduceOnly: true,
      triggerCondition: null,
      status: "Filled",
      orderId: makeOrderId(),
    });
    toast.show({
      title: full ? `${coin} position closed` : `${coin} position reduced`,
      message: `Realized PnL ${formatSignedUsd(realizedPnl)}`,
    });
  };

  const saveTpSl = ({ position, tp, sl }) => {
    closeSheet();
    setPositions((prev) => prev.map((p) => (p.id === position.id ? { ...p, tp, sl } : p)));
    toast.show({
      title: "TP/SL updated",
      message: `${position.coin} · TP ${tp != null ? formatUsd(tp) : "—"} · SL ${
        sl != null ? formatUsd(sl) : "—"
      }`,
    });
  };

  // Single cancel acts at once and offers Undo (handoff "Rules").
  const cancelOrder = (order) => {
    const index = orders.findIndex((o) => o.id === order.id);
    const historyId = nextId("oh");
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    pushOrderHistory(canceledRow(order, historyId));
    toast.show({
      title: "Order cancelled",
      message: `${order.coin} ${order.direction} ${order.type} · ${formatSizeUnit(order.size, order.coin)}`,
      action: {
        label: "Undo",
        onPress: () => {
          setOrders((prev) => {
            if (prev.some((o) => o.id === order.id)) return prev;
            const next = [...prev];
            next.splice(Math.min(Math.max(index, 0), next.length), 0, order);
            return next;
          });
          setOrderHistory((prev) => prev.filter((r) => r.id !== historyId));
          setOrderHistoryTotal((n) => n - 1);
        },
      },
    });
  };

  const confirmCancelAll = () => {
    const cancelled = sheet.orders;
    closeSheet();
    setOrders((prev) => prev.filter((o) => !cancelled.some((c) => c.id === o.id)));
    setOrderHistory((prev) => [...cancelled.map((o) => canceledRow(o, nextId("oh"))), ...prev]);
    setOrderHistoryTotal((n) => n + cancelled.length);
    toast.show({
      title: `${cancelled.length} ${cancelled.length === 1 ? "order" : "orders"} cancelled`,
      message: "Your positions are still open.",
    });
  };

  const copyText = (text) => {
    // Older webviews (and unfocused documents) reject the async API; fall
    // back to the selection-based copy before reporting a failure.
    const legacyCopy = () => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand?.("copy");
      area.remove();
      if (!ok) throw new Error("Copy failed");
    };
    if (!navigator.clipboard?.writeText) return Promise.resolve().then(legacyCopy);
    return navigator.clipboard.writeText(text).catch(legacyCopy);
  };

  const copyOrderId = (orderId) => {
    copyText(orderId).then(
      () => toast.show({ title: "Order ID copied", message: orderId }),
      () => toast.show({ tone: "error", title: "Couldn’t copy", message: orderId }),
    );
  };

  const shareTrade = (row) => {
    const value = formatUsd(row.price * row.size);
    const pnl = row.closedPnl != null ? ` · Closed PnL ${formatSignedUsd(row.closedPnl)}` : "";
    const text = `${row.coin} ${row.direction} · ${formatSizeUnit(row.size, row.coin)} @ ${formatPrice(
      row.price,
    )} · ${value}${pnl} — traded on HyprEarn`;
    if (typeof navigator.share === "function") {
      navigator.share({ title: "My HyprEarn trade", text }).catch(() => {});
      return;
    }
    copyText(text).then(
      () => toast.show({ title: "Trade copied", message: "Paste it anywhere to share." }),
      () => toast.show({ tone: "error", title: "Couldn’t share this trade" }),
    );
  };

  /* --------------------------------------------------------------- render */

  const renderTab = () => {
    if (tab === "positions") {
      return (
        <div className="px-4 pb-4">
          <div className="flex gap-6 pt-3">
            <SummaryStat
              label="Unrealized PnL"
              value={formatSignedUsd(unrealized)}
              valueClass={pnlTone(unrealized)}
            />
            <SummaryStat label="Margin used" value={formatUsd(marginUsed)} />
          </div>
          <AnimatePresence initial={false}>
            {positions.map((p) => (
              <ListItem key={p.id}>
                <PositionCard
                  position={p}
                  expanded={Boolean(expanded[`pos:${p.id}`])}
                  onToggle={() => toggle(`pos:${p.id}`)}
                  onEditTpSl={() => openSheet("tpsl", { position: p })}
                  onClose={() => openSheet("close", { position: p })}
                />
              </ListItem>
            ))}
          </AnimatePresence>
          {positions.length === 0 ? (
            <EmptyState
              icon={appIcons.navTrade}
              title="No open positions"
              body="Positions you open from Copilot or Trade will show up here."
              actionLabel="Place an order"
              onAction={placeOrder}
            />
          ) : null}
        </div>
      );
    }

    if (tab === "openOrders") {
      if (orders.length === 0) {
        return (
          <div className="px-4">
            <EmptyState
              icon={appIcons.timer20}
              title="No open orders"
              body="Limit, take-profit and stop-loss orders you place will show up here."
              actionLabel="Place an order"
              onAction={placeOrder}
            />
          </div>
        );
      }
      return (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between pt-3">
            <SummaryStat label="Open orders" value={orders.length} />
            <button
              type="button"
              onClick={() => openSheet("cancelAll", { orders })}
              className="app-pressable relative flex h-7 items-center justify-center rounded-lg text-app-callout font-medium text-app-negative after:absolute after:-inset-2 after:content-['']"
            >
              Cancel all
            </button>
          </div>
          <AnimatePresence initial={false}>
            {orders.map((o) => (
              <ListItem key={o.id}>
                <OrderCard
                  order={o}
                  expanded={Boolean(expanded[`ord:${o.id}`])}
                  onToggle={() => toggle(`ord:${o.id}`)}
                  onCancel={() => cancelOrder(o)}
                  onCopyId={copyOrderId}
                />
              </ListItem>
            ))}
          </AnimatePresence>
        </div>
      );
    }

    if (tab === "orderHistory" || tab === "tradeHistory") {
      const isOrders = tab === "orderHistory";
      const groups = groupByDay(isOrders ? orderHistory : trades);
      return (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {groups.map((group, i) => (
            <div key={group.key} className={`flex flex-col gap-2 ${i === 0 ? "pt-4" : "pt-1"}`}>
              <GroupHeader>{group.label}</GroupHeader>
              {group.rows.map((row) =>
                isOrders ? (
                  <HistoryRow
                    key={row.id}
                    row={row}
                    expanded={Boolean(expanded[`oh:${row.id}`])}
                    onToggle={() => toggle(`oh:${row.id}`)}
                    onCopyId={copyOrderId}
                  />
                ) : (
                  <TradeRow
                    key={row.id}
                    row={row}
                    expanded={Boolean(expanded[`th:${row.id}`])}
                    onToggle={() => toggle(`th:${row.id}`)}
                    onShare={() => shareTrade(row)}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex gap-6 pt-3">
          <SummaryStat label="Total value" value={formatUsd(totalValue)} />
          <SummaryStat label="Available USDC" value={formatUsd(balances[0].availableBalance)} />
        </div>
        {balances.map((b) => (
          <BalanceCard key={b.id} balance={b} />
        ))}
        <InfoNote>
          Available is what you can trade or withdraw. USDC locked as margin in open positions is not
          included.
        </InfoNote>
      </div>
    );
  };

  return (
    <section
      ref={rootRef}
      data-source={source}
      aria-label="Positions and orders"
      className={`border-t border-app-line-accent-subtle bg-app-bg ${className}`}
    >
      <PositionsTabs
        compact={connected}
        active={tab}
        counts={counts}
        onSelect={selectTab}
        barRef={barRef}
      />

      {connected ? (
        <motion.div
          key={tab}
          role="tabpanel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          {renderTab()}
        </motion.div>
      ) : (
        <div className="px-4 py-4">
          {/* Figma "Positions Panel" 938:1278 — tap to start the connect flow. */}
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="app-pressable flex h-12 w-full items-center justify-center rounded-xl border border-app-line px-4 text-app-body leading-[16.8px] text-ink-muted active:bg-white/[0.03]"
          >
            Connect your wallet to view positions
          </button>
        </div>
      )}

      <ClosePositionSheet
        open={sheet.kind === "close"}
        position={sheet.position}
        sessionKey={sheet.session}
        onClose={closeSheet}
        onConfirm={confirmClose}
      />
      <EditTpSlSheet
        open={sheet.kind === "tpsl"}
        position={sheet.position}
        sessionKey={sheet.session}
        onClose={closeSheet}
        onSave={saveTpSl}
      />
      <CancelAllSheet
        open={sheet.kind === "cancelAll"}
        orders={sheet.orders}
        onClose={closeSheet}
        onConfirm={confirmCancelAll}
      />
      <ConnectNetworkSheet
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onSelect={() => {
          setConnectOpen(false);
          app.connectWallet();
        }}
      />
    </section>
  );
}
