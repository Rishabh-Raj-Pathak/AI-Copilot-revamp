import { ChartCandlestick, TriangleAlert } from "lucide-react";
import { NOT_APPLICABLE, eventAt } from "../../../delta-neutral/components/PerpBottomPanel.tsx";
import {
  formatDayMonth,
  formatDayTime,
  formatElapsed,
  formatTimeRange,
} from "../../../delta-neutral/utils/format.ts";
import { formatWalletAddress } from "../../../delta-neutral/utils/wallet.ts";
import { CancelButton, Divider, Dn2Button, Dn2Sheet, ExpandButton, GoldBadge, SideBadge, TokenIcon, VenueMark } from "./Dn2Ui.jsx";
import { signedWholeUsd, withMinus } from "./dn2Data.js";
import { CARD, CARD_EDGE, CARD_EDGE_OPEN, CARD_FILL, EYEBROW, HINT, LABEL, TILE } from "./dn2Theme.js";

/**
 * Positions & History as their own Delta Neutral 2 sub-tabs — Figma D1–D4
 * (4476:8). One card per pair, from the same rows the web bottom panel lists;
 * expanding a card lays every desktop column out as Long | Short.
 */

const pnlTone = (n) => (n >= 0 ? "text-[#00d492]" : "text-[#e5484d]");

/** Header shared by pair and history cards: coin, pair (+ category), timing, PnL. */
function PairHeader({ pair, category, timing, pnl, pnlLabel, expanded, onToggle }) {
  return (
    <header className="flex items-center gap-2.5">
      <TokenIcon pair={pair} size={28} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-medium leading-5 text-[#e8d5b5]">{pair}</h3>
          {category ? <GoldBadge>{category}</GoldBadge> : null}
        </div>
        <p className="truncate text-[11px] leading-[14px] text-[#8f90a1]">{timing}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap">
        <p className={`text-right text-[15px] font-semibold leading-5 ${pnlTone(pnl)}`}>{signedWholeUsd(pnl)}</p>
        <p className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]">{pnlLabel}</p>
      </div>
      {onToggle ? (
        <ExpandButton expanded={expanded} onPress={onToggle} label={expanded ? `Collapse ${pair}` : `Expand ${pair}`} />
      ) : null}
    </header>
  );
}

/** Figma "Legs": one line per leg — venue, side, book × leverage, size, PnL. */
function LegLines({ position }) {
  return (
    <>
      {[
        ["long", position.long],
        ["short", position.short],
      ].map(([side, leg]) => (
        <div key={side} className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <VenueMark dex={leg.dex} size={14} />
            <SideBadge side={side} />
            <span className="truncate text-[12px] leading-4 text-[#b0b0be]">
              {leg.instrument} {leg.leverage}×
            </span>
          </div>
          <span className="shrink-0 text-right text-[12px] leading-4 text-[#dcdce8]">{leg.size}</span>
          <span className={`w-11 shrink-0 text-right text-[12px] font-medium leading-4 ${pnlTone(leg.pnlValue)}`}>
            {signedWholeUsd(leg.pnlValue)}
          </span>
        </div>
      ))}
    </>
  );
}

/** Long | Short table — every web column for the pair, `labelWidth` wide labels. */
function SplitTable({ head, rows, labelWidth }) {
  return (
    <div className={`${TILE} flex flex-col gap-[9px] px-3 py-2.5`} role="table">
      <div className="flex items-center gap-2" role="row">
        <span className="shrink-0" style={{ width: labelWidth }} role="columnheader" aria-label="Figure" />
        {head.map((cell) => (
          <span key={cell.key} role="columnheader" className="flex min-w-0 flex-1 items-center justify-end gap-[5px]">
            <VenueMark dex={cell.dex} size={12} />
            <SideBadge side={cell.side}>{cell.label}</SideBadge>
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2" role="row">
          <span
            role="rowheader"
            className="shrink-0 text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]"
            style={{ width: labelWidth }}
          >
            {row.label}
          </span>
          {row.cells.map((cell, i) => (
            <span
              key={i}
              role="cell"
              className={`min-w-0 flex-1 truncate text-right text-[12px] leading-4 ${cell.tone ?? "text-[#dcdce8]"}`}
            >
              {cell.value}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A leg's value; "—" (a spot leg has no funding or liquidation) is muted. */
function legCell(value, tone) {
  if (value === NOT_APPLICABLE) return { value, tone: "text-[#717182]" };
  return { value: withMinus(value), tone };
}

function fundingTone(value) {
  if (value.startsWith("-")) return "text-[#e5484d]";
  if (value.startsWith("+")) return "text-[#00d492]";
  return undefined;
}

function positionTiming(position, now) {
  return `${formatElapsed(now - position.openedAt)} · since ${formatDayTime(position.openedAt)}`;
}

/* ── D1 / D2 Positions ────────────────────────────────────────────────── */

function PairCard({ position, now, expanded, onToggle, onClose, onChart }) {
  const pnl = position.long.pnlValue + position.short.pnlValue;
  const { long, short } = position;
  return (
    <article
      className={`${CARD} ${expanded ? CARD_EDGE_OPEN : CARD_EDGE}`}
      style={CARD_FILL}
      aria-label={`${position.coin} pair`}
    >
      <PairHeader
        pair={position.coin}
        category={position.category}
        timing={positionTiming(position, now)}
        pnl={pnl}
        pnlLabel="P&L"
        expanded={expanded}
        onToggle={onToggle}
      />
      <div className={`${TILE} flex flex-col gap-2 p-2.5`}>
        <LegLines position={position} />
      </div>
      {expanded ? (
        <SplitTable
          labelWidth={92}
          head={[
            { key: "long", dex: long.dex, side: "long" },
            { key: "short", dex: short.dex, side: "short" },
          ]}
          rows={[
            { label: "Wallet", cells: [legCell(formatWalletAddress(long.wallet)), legCell(formatWalletAddress(short.wallet))] },
            { label: "Size", cells: [legCell(long.size), legCell(short.size)] },
            { label: "Position value", cells: [legCell(long.positionValue), legCell(short.positionValue)] },
            { label: "Entry price", cells: [legCell(long.entryPrice), legCell(short.entryPrice)] },
            { label: "Current price", cells: [legCell(long.currentPrice), legCell(short.currentPrice)] },
            { label: "Liq. price", cells: [legCell(long.liqPrice), legCell(short.liqPrice)] },
            { label: "Margin", cells: [legCell(long.margin), legCell(short.margin)] },
            {
              label: "Funding",
              cells: [legCell(long.funding, fundingTone(long.funding)), legCell(short.funding, fundingTone(short.funding))],
            },
            { label: "TP / SL", cells: [legCell(long.tpSl), legCell(short.tpSl)] },
            { label: "Exp. P/L", cells: [legCell(long.expected), legCell(short.expected)] },
          ]}
        />
      ) : null}
      <div className="flex gap-2">
        <Dn2Button className="flex-1" onClick={onClose}>
          Close pair
        </Dn2Button>
        <Dn2Button className="w-[38px] px-0!" aria-label={`${position.coin} chart`} onClick={onChart}>
          <ChartCandlestick size={16} aria-hidden />
        </Dn2Button>
      </div>
    </article>
  );
}

export function Dn2PositionsView({ positions, now, expandedKey, onToggle, onClosePair, onChart, emptyState }) {
  if (!positions.length) return emptyState;
  return (
    <>
      <p className={HINT}>One card per pair · each leg tagged spot or perp, hedged across DEXs</p>
      {positions.map((position) => (
        <PairCard
          key={position.coin}
          position={position}
          now={now}
          expanded={expandedKey === position.coin}
          onToggle={() => onToggle(position.coin)}
          onClose={() => onClosePair(position)}
          onChart={() => onChart(position)}
        />
      ))}
    </>
  );
}

/* ── D3 Close pair (4497:424) ─────────────────────────────────────────── */

/** Phone-only confirm before both legs close at market. */
export function Dn2ClosePairSheet({ open, position, now, onClose, onConfirm }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title="Close pair">
      {position ? (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <div className={`${TILE} flex flex-col gap-2.5 p-3`}>
            <PairHeader
              pair={position.coin}
              category={position.category}
              timing={positionTiming(position, now)}
              pnl={position.long.pnlValue + position.short.pnlValue}
              pnlLabel="P&L"
            />
            <Divider />
            <div className="flex flex-col gap-2">
              <LegLines position={position} />
            </div>
            <div className="flex items-center justify-between gap-3 whitespace-nowrap">
              <span className={LABEL}>Position value</span>
              <span className="text-[12px] leading-4 text-[#dcdce8]">{position.long.positionValue} per leg</span>
            </div>
          </div>
          <p className="flex items-start gap-2 text-[12px] leading-[17px] text-[#8f90a1]">
            <TriangleAlert size={14} className="mt-0.5 shrink-0 text-[#f87171]" aria-hidden />
            Both legs close together at market. Slippage may apply.
          </p>
          <div className="flex flex-col gap-0.5">
            <Dn2Button variant="danger" size="lg" className="w-full" onClick={onConfirm}>
              Close pair
            </Dn2Button>
            <CancelButton onPress={onClose} />
          </div>
        </div>
      ) : null}
    </Dn2Sheet>
  );
}

/* ── D4 History ───────────────────────────────────────────────────────── */

function historyTiming(row, now) {
  const span = row.event === "Close" ? row.closedAt - row.openedAt : (row.closedAt ?? now) - row.openedAt;
  return `${formatElapsed(span)} · ${formatTimeRange(row.openedAt, row.closedAt)}`;
}

function HistoryCard({ row, now, expanded, onToggle }) {
  const pnl = row.long.pnlValue + row.short.pnlValue;
  const { long, short } = row;
  return (
    <article
      className={`${CARD} ${expanded ? CARD_EDGE_OPEN : CARD_EDGE}`}
      style={CARD_FILL}
      aria-label={`${row.coin} ${row.event.toLowerCase()}`}
    >
      <PairHeader
        pair={row.coin}
        category={row.category}
        timing={historyTiming(row, now)}
        pnl={pnl}
        pnlLabel="Net PnL"
        expanded={expanded}
        onToggle={onToggle}
      />
      {expanded ? (
        <SplitTable
          labelWidth={78}
          head={[
            { key: "long", dex: long.dex, side: "long", label: long.action },
            { key: "short", dex: short.dex, side: "short", label: short.action },
          ]}
          rows={[
            { label: "Venue", cells: [legCell(long.dex), legCell(short.dex)] },
            { label: "Type", cells: [legCell(long.instrument), legCell(short.instrument)] },
            { label: "Wallet", cells: [legCell(formatWalletAddress(long.wallet)), legCell(formatWalletAddress(short.wallet))] },
            { label: "Price", cells: [legCell(long.price), legCell(short.price)] },
            { label: "Size", cells: [legCell(long.size), legCell(short.size)] },
            { label: "Trade value", cells: [legCell(long.tradeValue), legCell(short.tradeValue)] },
            { label: "Fee", cells: [legCell(long.fee), legCell(short.fee)] },
          ]}
        />
      ) : null}
    </article>
  );
}

/** Day groups, newest first — the eyebrow is the day the event happened. */
function groupByDay(rows) {
  const sorted = [...rows].sort((a, b) => eventAt(b) - eventAt(a));
  const groups = [];
  for (const row of sorted) {
    const day = formatDayMonth(eventAt(row));
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.rows.push(row);
    else groups.push({ day, rows: [row] });
  }
  return groups;
}

export function Dn2HistoryView({ rows, now, expandedKey, onToggle, emptyState }) {
  if (!rows.length) return emptyState;
  const keyOf = (row) => `${row.coin}-${row.event}-${eventAt(row)}`;
  return (
    <>
      <p className={HINT}>Paired long + short fills per vault action</p>
      {groupByDay(rows).map((group) => (
        <section key={group.day} className="flex flex-col gap-3" aria-label={group.day}>
          <h3 className={EYEBROW}>{group.day}</h3>
          {group.rows.map((row) => (
            <HistoryCard
              key={keyOf(row)}
              row={row}
              now={now}
              expanded={expandedKey === keyOf(row)}
              onToggle={() => onToggle(keyOf(row))}
            />
          ))}
        </section>
      ))}
    </>
  );
}

