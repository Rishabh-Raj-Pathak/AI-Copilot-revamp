import { useState } from "react";
import AppIcon from "../AppIcon.jsx";
import AppTopBar from "../AppTopBar.jsx";
import { appIcons } from "../mobileAssets.js";
import { useAppToast } from "../appToastContext.js";
import MobilePositionsPanel from "../positions/MobilePositionsPanel.jsx";
import { getMarket } from "../../trade/tradeMockData.js";
import AppChartCard from "./AppChartCard.jsx";
import PairSelectorSheet from "./PairSelectorSheet.jsx";
import TradeTicketSheet from "./TradeTicketSheet.jsx";
import { formatGrouped, ticketMarketFor, tokenIconFor } from "./tradeData.js";

/** One "Market Stats" row (954:4549): faint label, semibold value. */
function StatRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 whitespace-nowrap">
      <dt className="text-app-caption leading-[14.4px] text-ink-faint">{label}</dt>
      <dd className="flex items-center gap-1 text-right text-app-body font-semibold leading-[16.8px] text-ink">
        {children}
      </dd>
    </div>
  );
}

/**
 * Phone Trade — Figma "Trade / BTC-USDC — Full Page" (954:4521).
 *
 * Pair selector card → Pair Selector sheet, market stats, chart card, the
 * brand "Open Position" CTA (opens the shared trade ticket) and the positions
 * panel. Market data is the desktop terminal's (`trade/tradeMockData.js`), and
 * the coin is the page's own state, so switching pair here is the same switch
 * the desktop market bar makes.
 */
export default function MobileTradePage({
  coin,
  onCoinChange,
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onTerminalPlatformChange,
  onShareSetup,
}) {
  const toast = useAppToast();
  const [sheet, setSheet] = useState(null);
  const close = () => setSheet(null);

  const m = getMarket(coin);
  const icon = tokenIconFor(m.coin);
  const up = m.change24hPct >= 0;
  const sign = up ? "+" : "-";
  const quote = m.symbol.split("-")[1] ?? "USDC";

  const handleSubmit = (order) => {
    close();
    toast.show({
      tone: "success",
      title: "Order placed",
      message: `${order.pair} ${order.side === "long" ? "Long" : "Short"} · ${order.leverage}x · $${formatGrouped(order.margin, 2)} margin`,
      action: onShareSetup ? { label: "Share", onPress: onShareSetup } : undefined,
    });
  };

  return (
    // Figma sets figures proportional; the trading scale on <body> would make them tabular.
    <div className="flex h-dvh min-h-0 flex-col bg-app-bg text-ink proportional-nums">
      <AppTopBar
        onTerminalPlatformChange={onTerminalPlatformChange}
        onWalletConnected={onWalletConnected}
        onWalletDisconnect={onWalletDisconnect}
        onOpenProfile={onOpenProfile}
      />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-col gap-4 p-4">
          {/* Pair Selector (954:4541) */}
          <button
            type="button"
            onClick={() => setSheet("pair")}
            aria-haspopup="dialog"
            aria-label={`Market ${m.coin} - ${quote}. Change market`}
            className="app-pressable flex w-full items-center gap-2 rounded-lg border border-app-line bg-app-bg p-3 text-left active:bg-white/[0.03]"
          >
            {icon ? (
              <img alt="" src={icon} className="size-5 shrink-0 rounded-full bg-white object-cover" />
            ) : null}
            <span className="min-w-0 flex-1 truncate text-app-headline font-medium leading-[19.2px] text-ink">
              {m.coin} - {quote}
            </span>
            <AppIcon src={appIcons.chevronDown20} size={20} className="text-ink" />
          </button>

          {/* Market Stats (954:4547) */}
          <dl className="flex flex-col gap-3 rounded-lg bg-app-subtle p-4">
            <StatRow label="Mark">{formatGrouped(m.markPx, m.pxDecimals)}</StatRow>
            <StatRow label="Oracle">{formatGrouped(m.oraclePx, m.pxDecimals)}</StatRow>
            <StatRow label="24h Change">
              <span className={up ? "text-app-positive" : "text-[#f44f2a]"}>
                {sign}
                {formatGrouped(Math.abs(m.change24hAbs), m.pxDecimals)} / {sign}
                {Math.abs(m.change24hPct).toFixed(2)}%
              </span>
              <AppIcon
                src={appIcons.arrowDown16}
                size={16}
                className={up ? "rotate-180 text-app-positive" : "text-[#f44f2a]"}
              />
            </StatRow>
            <StatRow label="24h Volume">{m.volume24h}</StatRow>
            <StatRow label="Open Interest">{m.openInterest}</StatRow>
          </dl>

          {/* Chart Card (954:4571) */}
          <AppChartCard symbol={m.coin} price={m.markPx} variant="page" />

          {/* Open Position (954:4754) */}
          <button
            type="button"
            onClick={() => setSheet("ticket")}
            aria-haspopup="dialog"
            className="app-pressable app-gradient-brand flex h-11 w-full items-center justify-center rounded-lg text-app-headline font-medium leading-5 text-black"
          >
            Open Position
          </button>
        </div>

        <MobilePositionsPanel walletConnected={walletConnected} source="trade" />
      </main>

      <PairSelectorSheet
        open={sheet === "pair"}
        onClose={close}
        coin={coin}
        onSelect={onCoinChange}
      />
      <TradeTicketSheet
        open={sheet === "ticket"}
        onClose={close}
        market={ticketMarketFor(coin)}
        // The desktop order panel opens at 33x (capped by the market max).
        defaults={{ side: "long", leverage: Math.min(33, m.maxLeverage) }}
        walletConnected={walletConnected}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
