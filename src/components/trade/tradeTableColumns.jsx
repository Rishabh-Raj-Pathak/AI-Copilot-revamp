/**
 * Column definitions for the five bottom-panel tabs.
 * `render` returns a cell node; `accent` marks the column shown as the row title
 * on mobile cards.
 */
import { CoinCell, Direction, Pnl, Status } from "./tradeCells.jsx";
import {
  balanceMock,
  openOrdersMock,
  orderHistoryMock,
  positionsMock,
  tradeHistoryMock,
} from "./tradeMockData.js";

const positionsColumns = [
  {
    key: "coin",
    label: "Coin",
    accent: true,
    render: (r) => <CoinCell coin={r.coin} leverage={r.leverage} />,
  },
  { key: "size", label: "Size", render: (r) => r.size },
  { key: "positionValue", label: "Position Value", render: (r) => r.positionValue },
  { key: "entryPrice", label: "Entry Price", render: (r) => r.entryPrice },
  { key: "currentPrice", label: "Current Price", render: (r) => r.currentPrice },
  {
    key: "pnl",
    label: "PNL (ROE%)",
    render: (r) => (
      <Pnl positive={r.pnlPositive}>
        {r.pnl} ({r.roe})
      </Pnl>
    ),
  },
  { key: "liqPrice", label: "Liq. Price", render: (r) => r.liqPrice },
  { key: "margin", label: "Margin", render: (r) => r.margin },
  {
    key: "funding",
    label: "Funding",
    render: (r) => <span className="text-[#e5484d]">{r.funding}</span>,
  },
  {
    key: "tpsl",
    label: "TP/SL",
    render: (r) => (
      <span>
        {r.tp} <span className="text-[#bfbfbf]">/</span> {r.sl}
      </span>
    ),
  },
  {
    key: "exp",
    label: "Exp. Profit(%) / Exp. Loss(%)",
    render: (r) => (
      <span className="whitespace-nowrap">
        <span className="text-[#00d492]">{r.expProfit}</span>
        <span className="text-[#bfbfbf]"> / </span>
        <span className="text-[#e5484d]">{r.expLoss}</span>
      </span>
    ),
  },
];

const openOrdersColumns = [
  { key: "time", label: "Time", accent: true, render: (r) => r.time },
  { key: "type", label: "Type", render: (r) => r.type },
  { key: "coin", label: "Coin", render: (r) => <CoinCell coin={r.coin} /> },
  {
    key: "direction",
    label: "Direction",
    render: (r) => <Direction value={r.direction} />,
  },
  { key: "size", label: "Size", render: (r) => r.size },
  { key: "originalSize", label: "Original Size", render: (r) => r.originalSize },
  { key: "orderValue", label: "Order Value", render: (r) => r.orderValue },
  { key: "price", label: "Price", render: (r) => r.price },
  { key: "reduceOnly", label: "Reduce Only", render: (r) => r.reduceOnly },
  {
    key: "triggerConditions",
    label: "Trigger Conditions",
    render: (r) => r.triggerConditions,
  },
  { key: "tpsl", label: "TP/SL", render: (r) => r.tpsl },
];

const orderHistoryColumns = [
  { key: "time", label: "Time", accent: true, render: (r) => r.time },
  { key: "type", label: "Type", render: (r) => r.type },
  { key: "coin", label: "Coin", render: (r) => <CoinCell coin={r.coin} /> },
  {
    key: "direction",
    label: "Direction",
    render: (r) => <Direction value={r.direction} />,
  },
  { key: "size", label: "Size", render: (r) => r.size },
  { key: "filledSize", label: "Filled Size", render: (r) => r.filledSize },
  { key: "orderValue", label: "Order Value", render: (r) => r.orderValue },
  { key: "price", label: "Price", render: (r) => r.price },
  { key: "reduceOnly", label: "Reduce Only", render: (r) => r.reduceOnly },
  {
    key: "triggerConditions",
    label: "Trigger Conditions",
    render: (r) => r.triggerConditions,
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <Status value={r.status} />,
  },
  { key: "orderId", label: "Order ID", render: (r) => r.orderId },
];

const tradeHistoryColumns = [
  { key: "time", label: "Time", accent: true, render: (r) => r.time },
  { key: "coin", label: "Coin", render: (r) => <CoinCell coin={r.coin} /> },
  {
    key: "direction",
    label: "Direction",
    render: (r) => <Direction value={r.direction} />,
  },
  { key: "price", label: "Price", render: (r) => r.price },
  { key: "size", label: "Size", render: (r) => r.size },
  { key: "tradeValue", label: "Trade Value", render: (r) => r.tradeValue },
  { key: "fee", label: "Fee", render: (r) => r.fee },
  {
    key: "closedPnl",
    label: "Closed PNL",
    render: (r) => <Pnl positive={r.pnlPositive}>{r.closedPnl}</Pnl>,
  },
];

const balanceColumns = [
  {
    key: "coin",
    label: "Coin",
    accent: true,
    render: (r) => (
      <span className="font-semibold text-white">{r.coin}</span>
    ),
  },
  { key: "totalBalance", label: "Total Balance", render: (r) => r.totalBalance },
  {
    key: "availableBalance",
    label: "Available Balance",
    render: (r) => r.availableBalance,
  },
  { key: "usdcValue", label: "USDC Value", render: (r) => r.usdcValue },
  {
    key: "pnl",
    label: "PNL (ROE %)",
    render: (r) => (
      <Pnl positive={r.pnlPositive}>
        {r.pnl} ({r.roe})
      </Pnl>
    ),
  },
  { key: "contract", label: "Contract", render: (r) => r.contract },
];

export const TRADE_TABS = [
  {
    id: "positions",
    label: "Positions",
    rows: positionsMock,
    columns: positionsColumns,
    empty: "No open positions.",
  },
  {
    id: "openOrders",
    label: "Open Orders",
    rows: openOrdersMock,
    columns: openOrdersColumns,
    empty: "No open orders.",
  },
  {
    id: "orderHistory",
    label: "Order History",
    rows: orderHistoryMock,
    columns: orderHistoryColumns,
    empty: "No orders yet.",
  },
  {
    id: "tradeHistory",
    label: "Trade History",
    rows: tradeHistoryMock,
    columns: tradeHistoryColumns,
    empty: "No trades yet.",
  },
  {
    id: "balance",
    label: "Balance",
    rows: balanceMock,
    columns: balanceColumns,
    empty: "No balances.",
  },
];
