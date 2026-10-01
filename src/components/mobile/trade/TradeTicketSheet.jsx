import BottomSheet from "../BottomSheet.jsx";

/**
 * Placeholder — replaced by the Figma "Copilot / Trade Ticket" build.
 *
 * API (keep stable — Copilot cards and Trade "Open Position" both open it):
 *   <TradeTicketSheet
 *     open onClose
 *     market={{ symbol: "BTC", pair: "BTC-USDC", price: 84344, iconSrc, maxLeverage }}
 *     defaults={{ side: "long" | "short", leverage, entry, takeProfit, stopLoss }}
 *     walletConnected onConnect onSubmit(order)
 *   />
 */
export default function TradeTicketSheet({ open, onClose, market }) {
  return <BottomSheet open={open} onClose={onClose} title={market?.pair ?? "Trade"} />;
}
