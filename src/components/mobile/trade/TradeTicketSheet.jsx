import { useId, useMemo, useState } from "react";
import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { AVAILABLE_BALANCE } from "../../trade/tradeMockData.js";
import { openSetupShare, setupShareText } from "../../../lib/share.js";
import AppChartCard from "./AppChartCard.jsx";
import {
  AppAmountField,
  AppCheckbox,
  AppCollapseToggle,
  AppRangeSlider,
  AppSegmented,
  AppUnderlineTabs,
} from "./AppTradeFields.jsx";
import { decimalsForPrice, formatGrouped, formatUsd, toNum, tokenIconFor } from "./tradeData.js";

const SIDES = [
  { value: "long", label: "Buy / Long" },
  { value: "short", label: "Sell / Short" },
];
const MARGIN_MODES = [
  { value: "cross", label: "Cross" },
  { value: "isolated", label: "Isolated" },
];
const ORDER_TYPES = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
];

/* "Buy / Long" active fill is Figma's #0e381f; short mirrors the desktop ticket. */
const SIDE_FILL = { long: "bg-[#0e381f]", short: "bg-[#5f1414]" };

/** Trim a computed number for an input: no trailing zeros, no exponent. */
const draft = (n, decimals = 4) => {
  if (!Number.isFinite(n) || n === 0) return "";
  return String(Number(n.toFixed(decimals)));
};

/** `$ 0` / `$ 1.24` — the Gain % / Loss % hint (Figma "$ 0"). */
const hintUsd = (n) => (n > 0 ? `$ ${formatGrouped(n, 2)}` : "$ 0");

/** Figma "Grab Handle" + "Market" (994:16792, 1013:5943). It is the drag zone. */
function TicketHeader({ market, priceDecimals, dragHandleProps, titleId, onShare, onClose }) {
  const icon = market.iconSrc ?? tokenIconFor(market.symbol);
  return (
    <div className="flex shrink-0 touch-none select-none flex-col bg-app-bg" {...dragHandleProps}>
      <div className="flex justify-center pb-1 pt-2" aria-hidden>
        <div className="h-1 w-10 rounded-full bg-app-line-strong" />
      </div>
      <div className="flex flex-col gap-1 px-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon ? (
              <img alt="" src={icon} className="size-6 shrink-0 rounded-full bg-white object-cover" />
            ) : null}
            <h2 id={titleId} className="truncate text-lg font-bold leading-[23px] text-ink">
              {market.pair ?? market.symbol}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onShare}
              className="app-pressable flex h-9 items-center gap-1 rounded-lg border border-app-line-strong bg-app-bg px-3 text-app-caption font-medium text-ink"
            >
              <AppIcon src={appIcons.share14} size={14} />
              Share
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="app-pressable flex size-9 items-center justify-center rounded-xl text-ink active:bg-white/[0.06]"
            >
              <AppIcon src={appIcons.close20} size={20} />
            </button>
          </div>
        </div>
        <p className="flex items-center gap-1.5 whitespace-nowrap text-app-headline">
          <span className="text-ink-faint">Current price</span>
          <span className="font-semibold text-ink">{formatUsd(market.price, Math.max(2, priceDecimals))}</span>
        </p>
      </div>
    </div>
  );
}

/** One "Order Summary" row (947:3462): muted term, gold value. */
function SummaryRow({ term, value }) {
  return (
    <div className="flex items-start justify-between gap-3 whitespace-nowrap">
      <dt className="text-ink-muted">{term}</dt>
      <dd className="font-semibold text-app-accent">{value}</dd>
    </div>
  );
}

/**
 * The ticket body. Mounted fresh on every open (the sheet unmounts its
 * children when closed), so state seeds from `defaults` each time.
 */
function TicketBody({ market, defaults, priceDecimals, balance, walletConnected, onCancel, onConnect, onSubmit }) {
  const maxLeverage = Math.max(1, Math.round(market.maxLeverage ?? 40));
  const markPx = Number(market.price) || 0;
  const tpslId = useId();
  const infoId = useId();

  const [side, setSide] = useState(defaults?.side === "short" ? "short" : "long");
  const [marginMode, setMarginMode] = useState(defaults?.marginMode === "cross" ? "cross" : "isolated");
  const [orderType, setOrderType] = useState(defaults?.orderType === "limit" ? "limit" : "market");
  const [limitPrice, setLimitPrice] = useState(draft(Number(defaults?.entry) || markPx, priceDecimals));
  const [leverage, setLeverage] = useState(() =>
    Math.min(maxLeverage, Math.max(1, Math.round(Number(defaults?.leverage) || Math.min(10, maxLeverage)))),
  );
  const [margin, setMargin] = useState(draft(Number(defaults?.margin) || 0, 2));
  const [size, setSize] = useState(draft((Number(defaults?.margin) || 0) * leverage, 2));
  const [tpslOpen, setTpslOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const [tpPrice, setTpPrice] = useState(draft(Number(defaults?.takeProfit) || 0, priceDecimals));
  const [slPrice, setSlPrice] = useState(draft(Number(defaults?.stopLoss) || 0, priceDecimals));
  const [earlyExit, setEarlyExit] = useState(Boolean(defaults?.earlyExit));

  /* A market order fills at the mark; `defaults.entry` seeds the limit price. */
  const entry = orderType === "limit" ? toNum(limitPrice) || markPx : markPx;
  const dir = side === "long" ? 1 : -1;
  const marginNum = toNum(margin);
  const sizeNum = toNum(size);
  const balancePct = balance > 0 ? Math.min(100, (marginNum / balance) * 100) : 0;

  /*
   * Gain/Loss % are ROE, the perp-DEX convention: price move × leverage. The
   * price field is the source of truth; typing a % back-solves the price.
   */
  const roeFor = (px) => (px > 0 && entry > 0 ? ((px - entry) / entry) * dir * leverage * 100 : 0);
  const priceFor = (roe) => (entry > 0 ? entry * (1 + (dir * roe) / 100 / leverage) : 0);
  const tpNum = toNum(tpPrice);
  const slNum = toNum(slPrice);
  const gainPct = tpNum > 0 ? Math.max(0, roeFor(tpNum)) : 0;
  const lossPct = slNum > 0 ? Math.max(0, -roeFor(slNum)) : 0;
  const [gainDraft, setGainDraft] = useState(null);
  const [lossDraft, setLossDraft] = useState(null);

  const summary = useMemo(() => {
    const liq =
      sizeNum > 0 && entry > 0
        ? formatUsd(entry * (1 - dir / Math.max(leverage, 1)), Math.max(2, priceDecimals))
        : "N/A";
    const assetSize = entry > 0 ? sizeNum / entry : 0;
    const reward = tpNum > 0 ? Math.abs(tpNum - entry) : 0;
    const risk = slNum > 0 ? Math.abs(entry - slNum) : 0;
    return {
      liq,
      asset: `${assetSize ? Number(assetSize.toFixed(5)) : 0} ${market.symbol}`,
      rr: defaults?.riskReward ?? (reward > 0 && risk > 0 ? `1:${(reward / risk).toFixed(2)}` : "N/A"),
      winRate: defaults?.winRate ?? "N/A",
    };
  }, [sizeNum, entry, dir, leverage, priceDecimals, tpNum, slNum, market.symbol, defaults?.riskReward, defaults?.winRate]);

  const onMarginChange = (v) => {
    setMargin(v);
    setSize(draft(toNum(v) * leverage, 2));
  };
  const onSizeChange = (v) => {
    setSize(v);
    setMargin(draft(toNum(v) / Math.max(leverage, 1), 2));
  };
  const onBalancePct = (pct) => {
    const next = (balance * pct) / 100;
    setMargin(draft(next, 2));
    setSize(draft(next * leverage, 2));
  };
  const onLeverage = (next) => {
    setLeverage(next);
    setSize(draft(marginNum * next, 2));
    setGainDraft(null);
    setLossDraft(null);
  };
  const onSide = (next) => {
    setSide(next);
    setGainDraft(null);
    setLossDraft(null);
  };

  const canSubmit = marginNum > 0;
  const submit = () => {
    if (!canSubmit) return;
    onSubmit?.({
      symbol: market.symbol,
      pair: market.pair ?? market.symbol,
      side,
      marginMode,
      orderType,
      entry,
      limitPrice: orderType === "limit" ? toNum(limitPrice) : null,
      margin: marginNum,
      size: sizeNum,
      leverage,
      takeProfit: tpNum || null,
      stopLoss: slNum || null,
      gainPct,
      lossPct,
      earlyExit,
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Copilot tour step 4 ("review the setup") highlights the form. */}
        <div className="flex flex-col gap-6 px-4 pb-4 pt-6" data-tour="copilot-trade-setup">
          {/* Chart Section (947:3361) */}
          <div className="border-b border-app-line-accent-subtle pb-4">
            <AppChartCard symbol={market.symbol} price={markPx} variant="ticket" />
          </div>

          {/* Order Setup (1013:5944) */}
          <div className="flex flex-col gap-3">
            <AppSegmented
              ariaLabel="Side"
              options={SIDES}
              value={side}
              onChange={onSide}
              activeClass={(v) => SIDE_FILL[v]}
            />
            <AppSegmented
              ariaLabel="Margin mode"
              options={MARGIN_MODES}
              value={marginMode}
              onChange={setMarginMode}
            />
            <AppUnderlineTabs
              ariaLabel="Order type"
              options={ORDER_TYPES}
              value={orderType}
              onChange={setOrderType}
            />
          </div>

          {/* Amount (1013:5946) */}
          <div className="flex flex-col gap-3">
            <div
              className="flex items-center justify-between gap-3 whitespace-nowrap rounded-lg border border-app-accent px-4 py-3 text-app-body leading-5"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.85)), linear-gradient(90deg, #f2b500, #00f3b6)",
              }}
            >
              <span className="text-ink-muted">Available balance</span>
              <span className="text-ink">{formatGrouped(balance, 2)} USDC</span>
            </div>
            {orderType === "limit" ? (
              <AppAmountField
                label="Limit price"
                value={limitPrice}
                onChange={setLimitPrice}
                placeholder={formatGrouped(markPx, priceDecimals).replace(/,/g, "")}
              />
            ) : null}
            <AppAmountField label="Margin" value={margin} onChange={onMarginChange} />
            <AppAmountField label="Size" value={size} onChange={onSizeChange} />
            <AppRangeSlider
              ariaLabel="Percent of available balance"
              value={Math.round(balancePct)}
              min={0}
              max={100}
              onChange={onBalancePct}
              valueLabel={`${Math.round(balancePct)}%`}
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between whitespace-nowrap text-app-caption text-ink-muted">
                <span>Leverage</span>
                <span>Max: {maxLeverage}x</span>
              </div>
              <AppRangeSlider
                ariaLabel="Leverage"
                value={leverage}
                min={1}
                max={maxLeverage}
                onChange={onLeverage}
                valueLabel={`${leverage}x`}
              />
            </div>
          </div>

          {/* TP / SL (1013:5947) */}
          <div className="flex flex-col gap-3">
            <AppCollapseToggle
              title="Take profit / Stop loss"
              open={tpslOpen}
              controls={tpslId}
              onToggle={() => setTpslOpen((o) => !o)}
            />
            {tpslOpen ? (
              <div id={tpslId} className="flex flex-col gap-3">
                <AppAmountField
                  label="TP price"
                  value={tpPrice}
                  onChange={(v) => {
                    setTpPrice(v);
                    setGainDraft(null);
                  }}
                />
                <AppAmountField
                  label="Gain %"
                  icon={appIcons.percent20}
                  placeholder="0"
                  hint={hintUsd((marginNum * gainPct) / 100)}
                  hintTone="gain"
                  value={gainDraft ?? draft(gainPct, 2)}
                  onChange={(v) => {
                    setGainDraft(v);
                    setTpPrice(draft(priceFor(toNum(v)), priceDecimals));
                  }}
                  onBlur={() => setGainDraft(null)}
                />
                <AppCheckbox
                  checked={earlyExit}
                  onChange={setEarlyExit}
                  label="Early exit optimization"
                />
                <AppAmountField
                  label="SL price"
                  value={slPrice}
                  onChange={(v) => {
                    setSlPrice(v);
                    setLossDraft(null);
                  }}
                />
                <AppAmountField
                  label="Loss %"
                  icon={appIcons.percent20}
                  placeholder="0"
                  hint={hintUsd((marginNum * lossPct) / 100)}
                  hintTone="loss"
                  value={lossDraft ?? draft(lossPct, 2)}
                  onChange={(v) => {
                    setLossDraft(v);
                    setSlPrice(draft(priceFor(-toNum(v)), priceDecimals));
                  }}
                  onBlur={() => setLossDraft(null)}
                />
              </div>
            ) : null}
          </div>

          {/* Additional Info (1013:5948) */}
          <div className="flex flex-col gap-3">
            <AppCollapseToggle
              title="Additional info"
              open={infoOpen}
              controls={infoId}
              onToggle={() => setInfoOpen((o) => !o)}
            />
            {infoOpen ? (
              <dl
                id={infoId}
                className="flex flex-col gap-2.5 rounded-xl border border-app-line-accent-subtle p-4 text-app-body leading-5"
              >
                <SummaryRow term="Liquidation price" value={summary.liq} />
                <SummaryRow term="Asset size" value={summary.asset} />
                <SummaryRow term="R:R" value={summary.rr} />
                <SummaryRow term="Win rate" value={summary.winRate} />
              </dl>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer (947:3475) */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-app-accent-subtle bg-app-bg px-4 pb-[var(--app-safe-bottom)] pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="app-pressable flex h-11 w-full items-center justify-center rounded-lg border border-app-line-strong bg-app-bg text-app-headline font-medium leading-5 text-ink"
        >
          Cancel
        </button>
        {walletConnected ? (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            data-tour="trade-open-cta"
            className={`app-pressable flex h-11 w-full items-center justify-center rounded-lg text-app-headline font-medium leading-5 disabled:pointer-events-none ${
              !canSubmit
                ? "bg-app-subtle text-ink-faint"
                : side === "long"
                  ? "bg-app-positive text-ink"
                  : "bg-app-negative text-ink"
            }`}
          >
            {side === "long" ? "Buy / Long" : "Sell / Short"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            data-tour="trade-open-cta"
            className="app-pressable flex h-11 w-full items-center justify-center rounded-lg bg-app-positive text-app-headline font-medium leading-5 text-ink"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Figma "Copilot / Trade Ticket — Full Content" (947:3345), shown open in
 * "Copilot / Trade Ticket — Open" (948:3519). A full-height bottom sheet the
 * Trade page's "Open Position" and the copilot trade-idea cards both open.
 *
 * API (keep stable):
 *   <TradeTicketSheet
 *     open onClose
 *     market={{ symbol: "BTC", pair: "BTC-USDC", price: 84344, iconSrc, maxLeverage, pxDecimals? }}
 *     defaults={{ side: "long" | "short", leverage, entry, takeProfit, stopLoss,
 *                 margin?, marginMode?, orderType?, riskReward?, winRate? }}
 *     walletConnected onConnect onSubmit(order)
 *     balance?   // available USDC; defaults to the trade mock's balance once connected
 *     onShare?   // defaults to the native share sheet, then the X composer
 *   />
 *
 * - `walletConnected` / `onConnect` fall back to the shell context; with no
 *   `onConnect` the ticket opens the kit's network picker itself.
 * - `onSubmit(order)` receives `{ symbol, pair, side, marginMode, orderType,
 *   entry, limitPrice, margin, size, leverage, takeProfit, stopLoss, gainPct,
 *   lossPct, earlyExit }`. The sheet does not close itself — the caller closes
 *   it and confirms with `useAppToast()`.
 * - Fields reseed from `defaults` every time the sheet opens.
 */
export default function TradeTicketSheet({
  open,
  onClose,
  market,
  defaults,
  walletConnected,
  onConnect,
  onSubmit,
  balance,
  onShare,
}) {
  const app = useMobileApp();
  const [connectOpen, setConnectOpen] = useState(false);
  // A new key per open: reopening mid-exit-animation must not revive old drafts.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((s) => s + 1);
  }
  const connected = walletConnected ?? app.walletConnected;
  const m = market ?? { symbol: "BTC", pair: "BTC-USDC", price: 0, maxLeverage: 40 };
  const priceDecimals = m.pxDecimals ?? decimalsForPrice(m.price);
  const available = balance ?? (connected ? AVAILABLE_BALANCE : 0);

  const connect = () => {
    if (onConnect) onConnect();
    else setConnectOpen(true);
  };

  const share = async () => {
    if (onShare) {
      onShare();
      return;
    }
    const text = setupShareText({ coin: m.symbol });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: m.pair ?? m.symbol, text, url: "https://app.hyprearn.com" });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    openSetupShare({ coin: m.symbol });
  };

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        fullHeight
        className="border-app-line-accent-subtle! bg-app-bg! proportional-nums"
        bodyClassName="flex flex-col pb-0!"
        header={({ dragHandleProps, titleId }) => (
          <TicketHeader
            market={m}
            priceDecimals={priceDecimals}
            dragHandleProps={dragHandleProps}
            titleId={titleId}
            onShare={share}
            onClose={onClose}
          />
        )}
      >
        <TicketBody
          key={session}
          market={m}
          defaults={defaults}
          priceDecimals={priceDecimals}
          balance={available}
          walletConnected={connected}
          onCancel={onClose}
          onConnect={connect}
          onSubmit={onSubmit}
        />
      </BottomSheet>
      <ConnectNetworkSheet
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onSelect={() => {
          setConnectOpen(false);
          app.connectWallet();
        }}
      />
    </>
  );
}
