import { appIcons } from "../mobileAssets.js";
import AppIcon from "../AppIcon.jsx";
import {
  Card,
  CardAction,
  CardActions,
  Collapse,
  DetailRow,
  DetailsBox,
  ExpandIndicator,
  Metric,
  MetricsRow,
  SourceTag,
  Tag,
  TokenIcon,
} from "./PositionsUi.jsx";
import {
  directionTone,
  formatClock,
  formatDateTime,
  formatFee,
  formatPrice,
  formatRelativeTime,
  formatSignedPct,
  formatSignedUsd,
  formatSize,
  formatSizeUnit,
  formatUsd,
  pnlTone,
  statusTone,
} from "./positionsFormat.js";
import { positionPnl, positionValue, expectedPnl, orderValue } from "./positionsMath.js";

/**
 * Card header: the whole row is the expand control (handoff note: "tapping the
 * header also expands"), with the 24px arrow top-right.
 */
function CardHeader({ expanded, onToggle, className, children }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`flex w-full items-center gap-2 px-3 text-left active:bg-white/[0.02] ${className}`}
    >
      {children}
      <ExpandIndicator expanded={expanded} />
    </button>
  );
}

/* --------------------------------------------------------- Position Card */

/** Figma "Position Card" (1066:5642) — collapsed 152px, expanded 370px. */
export function PositionCard({ position, expanded, onToggle, onEditTpSl, onClose }) {
  const { coin, direction, leverage, source, marginMode } = position;
  const pnl = positionPnl(position);
  const roe = (pnl / position.margin) * 100;
  const tone = pnlTone(pnl);
  const exp = expectedPnl(position);
  const hasTpSl = position.tp != null || position.sl != null;

  return (
    <Card>
      <CardHeader expanded={expanded} onToggle={onToggle} className="pt-3">
        <TokenIcon coin={coin} />
        <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="text-app-body font-medium leading-[18px] text-ink">{coin}</span>
          <Tag tone={direction === "long" ? "positive" : "negative"}>
            {direction === "long" ? "Long" : "Short"}
          </Tag>
          <Tag>{leverage}x</Tag>
          <SourceTag source={source} />
        </span>
      </CardHeader>

      <MetricsRow>
        <Metric label="Margin" value={formatUsd(position.margin)} sub={marginMode} />
        <Metric
          label="PnL (ROE %)"
          value={formatSignedUsd(pnl)}
          valueClass={tone}
          sub={formatSignedPct(roe)}
          subClass={pnlTone(pnl, "text-ink-subtle")}
        />
        <Metric label="Liq. price" value={formatUsd(position.liqPrice)} />
      </MetricsRow>

      <Collapse open={expanded}>
        <DetailsBox>
          <DetailRow label="Entry price">{formatUsd(position.entryPrice)}</DetailRow>
          <DetailRow label="Current price">{formatUsd(position.currentPrice)}</DetailRow>
          <DetailRow label="Size">{formatSizeUnit(position.size, coin)}</DetailRow>
          <DetailRow label="Position value">{formatUsd(positionValue(position))}</DetailRow>
          <DetailRow label="Funding" valueClass={pnlTone(position.funding)}>
            {formatSignedUsd(position.funding)}
          </DetailRow>
          <DetailRow label="TP / SL">
            <span className="text-ink-muted">
              {position.tp != null ? formatUsd(position.tp) : "—"} /{" "}
              {position.sl != null ? formatUsd(position.sl) : "—"}
            </span>
            <button
              type="button"
              onClick={onEditTpSl}
              className="app-pressable -m-2 p-2 text-app-caption font-medium text-app-accent"
            >
              {hasTpSl ? "Edit" : "Add"}
            </button>
          </DetailRow>
          <DetailRow label="Exp. profit / loss">
            <span className="flex items-center gap-1">
              <span className="text-app-positive">
                {exp.profit != null ? formatSignedUsd(exp.profit) : "—"}
              </span>
              <span className="font-normal text-ink-faint">/</span>
              <span className="text-app-negative">
                {exp.loss != null ? formatSignedUsd(exp.loss) : "—"}
              </span>
            </span>
          </DetailRow>
          <DetailRow label="Opened">{formatRelativeTime(position.openedAt)}</DetailRow>
        </DetailsBox>
      </Collapse>

      <CardActions>
        <CardAction onClick={onEditTpSl}>Edit TP/SL</CardAction>
        <CardAction tone="danger" onClick={onClose}>
          Close
        </CardAction>
      </CardActions>
    </Card>
  );
}

/* ------------------------------------------------------------ Order Card */

/** Figma "Order Card" (1082:6860) — resting limit or TP/SL trigger order. */
export function OrderCard({ order, expanded, onToggle, onCancel, onCopyId }) {
  const { coin } = order;
  const trigger = order.triggerPx != null;
  const value = orderValue(order);

  return (
    <Card>
      <CardHeader expanded={expanded} onToggle={onToggle} className="pt-3">
        <TokenIcon coin={coin} />
        <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="text-app-body font-medium leading-[18px] text-ink">{coin}</span>
          <Tag tone={directionTone(order.direction)}>{order.direction}</Tag>
          <Tag>{order.type}</Tag>
        </span>
      </CardHeader>

      <MetricsRow>
        <Metric
          label={trigger ? "Trigger" : "Price"}
          value={trigger ? `${order.triggerOp} ${formatUsd(order.triggerPx)}` : formatUsd(order.price)}
          sub={trigger ? "Market" : order.tif}
        />
        <Metric
          label="Size"
          value={formatSizeUnit(order.size, coin)}
          sub={order.reduceOnly ? "Reduce only" : `${formatSize(order.filledSize, coin)} filled`}
        />
        <Metric label="Value" value={trigger ? `≈ ${formatUsd(value)}` : formatUsd(value)} />
      </MetricsRow>

      <Collapse open={expanded}>
        <DetailsBox>
          <DetailRow label="Placed">{formatDateTime(order.placedAt)}</DetailRow>
          <DetailRow label="Filled size">
            {formatSize(order.filledSize, coin)} / {formatSizeUnit(order.size, coin)}
          </DetailRow>
          <DetailRow label="Trigger condition">
            {trigger ? `Mark ${order.triggerOp} ${formatUsd(order.triggerPx)}` : "—"}
          </DetailRow>
          <DetailRow label="Reduce only">{order.reduceOnly ? "Yes" : "No"}</DetailRow>
          <OrderIdRow orderId={order.orderId} onCopy={onCopyId} />
        </DetailsBox>
      </Collapse>

      <CardActions>
        <CardAction tone="danger" onClick={onCancel}>
          Cancel order
        </CardAction>
      </CardActions>
    </Card>
  );
}

/** "Order ID 48213377061 ⧉" — mono id, copy glyph doubles as the button. */
function OrderIdRow({ orderId, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 whitespace-nowrap text-app-caption">
      <span className="text-ink-subtle">Order ID</span>
      <button
        type="button"
        onClick={() => onCopy?.(orderId)}
        aria-label={`Copy order ID ${orderId}`}
        className="app-pressable -my-1.5 -mr-1.5 flex items-center gap-1.5 rounded-md py-1.5 pr-1.5 text-app-caption"
      >
        <span className="font-app-mono text-ink">{orderId}</span>
        <AppIcon src={appIcons.copy16} size={16} className="text-ink-subtle" />
      </button>
    </div>
  );
}

/* ----------------------------------------------- History Row / Trade Row */

/** Compact row header shared by Order History and Trade History (~62px). */
function RowHeader({ row, sub, meta, expanded, onToggle }) {
  return (
    <CardHeader expanded={expanded} onToggle={onToggle} className="py-3">
      <TokenIcon coin={row.coin} />
      <span className="flex min-h-9 min-w-0 flex-1 flex-col justify-center gap-px whitespace-nowrap">
        <span className="flex items-baseline gap-1.5 font-medium leading-[18px]">
          <span className="text-app-body leading-[18px] text-ink">{row.coin}</span>
          <span
            className={`text-app-caption leading-[18px] ${
              directionTone(row.direction) === "positive" ? "text-app-positive" : "text-app-negative"
            }`}
          >
            {row.direction}
          </span>
        </span>
        <span className="truncate text-app-caption text-ink-subtle">{sub}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap">{meta}</span>
    </CardHeader>
  );
}

/** Figma "History Row" (1068:5648) — one order in Order History. */
export function HistoryRow({ row, expanded, onToggle, onCopyId }) {
  const price = row.price != null ? formatPrice(row.price) : "Market";
  return (
    <Card>
      <RowHeader
        row={row}
        expanded={expanded}
        onToggle={onToggle}
        sub={`${row.type} · ${formatSize(row.size, row.coin)} @ ${price}`}
        meta={
          <>
            <Tag tone={statusTone(row.status)}>{row.status}</Tag>
            <span className="text-app-label text-ink-faint">{formatClock(row.time)}</span>
          </>
        }
      />
      <Collapse open={expanded}>
        <DetailsBox>
          <DetailRow label="Date / time">{formatDateTime(row.time)}</DetailRow>
          <DetailRow label="Price">{price}</DetailRow>
          <DetailRow label="Size / Filled size">
            {formatSize(row.size, row.coin)} / {formatSizeUnit(row.filledSize, row.coin)}
          </DetailRow>
          <DetailRow label="Order value">
            {row.price != null ? formatUsd(row.price * row.size) : "—"}
          </DetailRow>
          <DetailRow label="Trigger condition">{row.triggerCondition ?? "—"}</DetailRow>
          <DetailRow label="Reduce only">{row.reduceOnly ? "Yes" : "No"}</DetailRow>
          <OrderIdRow orderId={row.orderId} onCopy={onCopyId} />
        </DetailsBox>
      </Collapse>
    </Card>
  );
}

/** Figma "Trade Row" (1083:6873) — one fill in Trade History. */
export function TradeRow({ row, expanded, onToggle, onShare }) {
  const value = row.price * row.size;
  return (
    <Card>
      <RowHeader
        row={row}
        expanded={expanded}
        onToggle={onToggle}
        sub={`${formatSize(row.size, row.coin)} @ ${formatPrice(row.price)}`}
        meta={
          <>
            <span className="text-app-callout font-medium text-ink">{formatUsd(value)}</span>
            <span className="text-app-label text-ink-faint">{formatClock(row.time)}</span>
          </>
        }
      />
      <Collapse open={expanded}>
        <DetailsBox>
          <DetailRow label="Date / time">{formatDateTime(row.time)}</DetailRow>
          <DetailRow label="Price">{formatPrice(row.price)}</DetailRow>
          <DetailRow label="Size">{formatSizeUnit(row.size, row.coin)}</DetailRow>
          <DetailRow label="Trade value">{formatUsd(value)}</DetailRow>
          <DetailRow label="Fee">{formatFee(row.fee)}</DetailRow>
          <DetailRow label="Closed PnL" valueClass={pnlTone(row.closedPnl)}>
            {row.closedPnl != null ? formatSignedUsd(row.closedPnl) : "—"}
          </DetailRow>
        </DetailsBox>
        {/* Share lives inside the expanded row only — never beside the arrow. */}
        <CardActions>
          <CardAction icon={appIcons.share14} onClick={onShare}>
            Share trade
          </CardAction>
        </CardActions>
      </Collapse>
    </Card>
  );
}

/* ---------------------------------------------------------- Balance Card */

/**
 * Figma "Balance Card" (1083:6876): one asset, no expand — every field shows.
 * Asset amounts carry the coin as their unit instead of `$`.
 */
export function BalanceCard({ balance }) {
  const { coin } = balance;
  const hasPnl = balance.pnl != null;
  const amount = (n) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <Card>
      <div className="flex items-center gap-2 px-3 pt-3">
        <TokenIcon coin={coin} />
        <span className="min-w-0 flex-1 text-app-body font-medium leading-[18px] text-ink">{coin}</span>
        <span className="flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap">
          <span className="text-app-label tracking-[0.04em] text-ink-subtle">USDC value</span>
          <span className="text-app-body font-medium leading-[18px] text-ink">
            {formatUsd(balance.usdcValue)}
          </span>
        </span>
      </div>
      <MetricsRow>
        <Metric label="Total" value={amount(balance.totalBalance)} sub={coin} />
        <Metric label="Available" value={amount(balance.availableBalance)} sub={coin} />
        <Metric
          label="PnL (ROE %)"
          value={hasPnl ? formatSignedUsd(balance.pnl) : "—"}
          valueClass={hasPnl ? pnlTone(balance.pnl) : "text-ink-subtle"}
          sub={hasPnl ? formatSignedPct(balance.roe) : "—"}
          subClass={hasPnl ? pnlTone(balance.pnl, "text-ink-subtle") : "text-ink-subtle"}
        />
      </MetricsRow>
    </Card>
  );
}
