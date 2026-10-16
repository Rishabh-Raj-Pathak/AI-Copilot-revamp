import { Dn2Button, ExpandButton, SideBadge, TokenIcon } from "../dn2/Dn2Ui.jsx";
import { withMinus } from "../dn2/dn2Data.js";
import { CARD, CARD_EDGE, CARD_EDGE_OPEN, CARD_FILL, TILE } from "../dn2/dn2Theme.js";

/**
 * Alpha Agents Positions and History sub-tabs — Figma "02 Agents - Alpha
 * Agents" C1–C3 / D1–D2 (DoY28sP7SwidihlLGoGrEa, 1220:38293). The same cards
 * as Delta Neutral 2's sub-tabs: a collapsed card names the trade, expanding
 * adds a Details tile with the rest of the web's columns. Rows are the web
 * Positions / History table's (`vaultsPositionsHistoryMock`). No pagination:
 * the list scrolls.
 */

const VENUE_NAMES = { hyperliquid: "Hyperliquid", paradex: "Paradex", nado: "Nado" };
const venueName = (id) => VENUE_NAMES[id] ?? id;

const PANEL_NOTE = "text-[10px] leading-[14px] text-[#8d8e99]";
const HAIRLINE = "h-px w-full shrink-0 bg-white/[0.06]";
const GREEN = "text-[#00d492]";
const RED = "text-[#e5484d]";
const toneOf = (positive) => (positive ? GREEN : RED);

function LeverageTag({ leverage }) {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-[rgba(196,168,112,0.16)] bg-[rgba(196,168,112,0.07)] px-[7px] py-0.5 text-[9px] font-semibold leading-3 tracking-[0.4px] text-[rgba(196,168,112,0.85)]">
      {leverage}×
    </span>
  );
}

/** Coin, symbol + tags, a sub line, the P&L with its label, and the expand circle. */
function CardHeader({ symbol, tags, subline, value, valueTone, label, labelTone = "text-[#717182]", expanded, onToggle }) {
  return (
    <header className="flex items-center gap-2.5">
      <TokenIcon pair={symbol} size={28} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-medium leading-5 text-[#e8d5b5]">{symbol}</h3>
          {tags}
        </div>
        <p className="truncate text-[11px] leading-[14px] text-[#8f90a1]">{subline}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap">
        <p className={`text-right text-[15px] font-semibold leading-5 ${valueTone}`}>{value}</p>
        <p className={`text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] ${labelTone}`}>{label}</p>
      </div>
      <ExpandButton expanded={expanded} onPress={onToggle} label={expanded ? `Collapse ${symbol}` : `Expand ${symbol}`} />
    </header>
  );
}

/** Figma "Position" tile: three figures side by side. */
function FigureTile({ items }) {
  return (
    <dl className={`${TILE} flex gap-2 p-2.5`}>
      {items.map(([label, value]) => (
        <div key={label} className="flex min-w-0 flex-1 flex-col gap-0.5">
          <dt className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]">{label}</dt>
          <dd className="truncate text-[12px] leading-4 text-[#dcdce8]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Figma "Details": sentence-case rows in hairline-split groups, one value column. */
function DetailsTile({ groups, label }) {
  return (
    <div className={`${TILE} flex flex-col gap-2 p-3`} role="table" aria-label={label}>
      {groups.map((rows, gi) => (
        <div key={gi} className="flex flex-col gap-2" role="rowgroup">
          {gi > 0 ? <span className={HAIRLINE} aria-hidden /> : null}
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3" role="row">
              <span role="rowheader" className="truncate text-[12px] leading-4 text-[#8f90a1]">
                {row.label}
              </span>
              <span role="cell" className={`shrink-0 text-right text-[12px] leading-4 ${row.tone ?? "text-[#dcdce8]"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Positions ────────────────────────────────────────────────────────── */

function PositionCard({ row, expanded, onToggle }) {
  const mode = row.marginMode === "cross" ? "Cross" : "Isolated";
  return (
    <article
      className={`${CARD} ${expanded ? CARD_EDGE_OPEN : CARD_EDGE}`}
      style={CARD_FILL}
      aria-label={`${row.symbol} position`}
    >
      <CardHeader
        symbol={row.symbol}
        tags={
          <>
            <SideBadge side={row.direction} />
            <LeverageTag leverage={row.leverage} />
          </>
        }
        subline={`${venueName(row.venue)} · ${mode}`}
        value={withMinus(row.pnlUsd)}
        valueTone={toneOf(row.pnlPositive)}
        label={withMinus(row.pnlPct)}
        expanded={expanded}
        onToggle={onToggle}
      />
      <FigureTile
        items={[
          ["Size", row.sizeLabel],
          ["Entry", row.entryPrice],
          ["Current", row.currPrice],
        ]}
      />
      {expanded ? (
        <DetailsTile
          label={`${row.symbol} position details`}
          groups={[
            [
              { label: "Position value", value: row.posValue },
              { label: "Margin", value: `${row.margin} · ${mode}` },
            ],
            [
              { label: "Liq. price", value: row.liqPrice },
              { label: "Funding", value: withMinus(row.funding), tone: toneOf(row.fundingPositive) },
            ],
            [
              { label: "TP", value: row.tp, tone: GREEN },
              { label: "SL", value: row.sl, tone: RED },
            ],
            [
              { label: "Exp. profit", value: `${row.expProfit} ${row.expProfitPct}` },
              { label: "Exp. loss", value: `${withMinus(row.expLoss)} ${row.expLossPct}` },
            ],
          ]}
        />
      ) : null}
      {/* The web position card's two actions; like the web they are not wired yet. */}
      <div className="flex gap-3">
        <Dn2Button className="flex-1">Edit</Dn2Button>
        <Dn2Button variant="danger" className="px-5">
          Close
        </Dn2Button>
      </div>
    </article>
  );
}

export function AgentPositionsView({ rows, expandedKey, onToggle, emptyState }) {
  if (!rows.length) return emptyState;
  return (
    <>
      <p className={PANEL_NOTE}>Positions opened by your active agents.</p>
      {rows.map((row) => (
        <PositionCard key={row.id} row={row} expanded={expandedKey === row.id} onToggle={() => onToggle(row.id)} />
      ))}
    </>
  );
}

/* ── History ──────────────────────────────────────────────────────────── */

function HistoryCard({ row, expanded, onToggle }) {
  return (
    <article
      className={`${CARD} ${expanded ? CARD_EDGE_OPEN : CARD_EDGE}`}
      style={CARD_FILL}
      aria-label={`${row.symbol} ${row.status.toLowerCase()} trade`}
    >
      <CardHeader
        symbol={row.symbol}
        tags={<SideBadge side={row.side} />}
        subline={`${row.time} · ${venueName(row.venue)}`}
        value={withMinus(row.pnl)}
        valueTone={toneOf(row.pnlPositive)}
        label={row.status}
        labelTone={row.status === "Liquidated" ? RED : undefined}
        expanded={expanded}
        onToggle={onToggle}
      />
      {expanded ? (
        <DetailsTile
          label={`${row.symbol} trade details`}
          groups={[
            [
              { label: "Size", value: row.size },
              { label: "Entry", value: row.entry },
              { label: "Exit", value: row.exit },
            ],
          ]}
        />
      ) : null}
    </article>
  );
}

export function AgentHistoryView({ rows, expandedKey, onToggle, emptyState }) {
  if (!rows.length) return emptyState;
  return (
    <>
      <p className={PANEL_NOTE}>Closed trades from your agents, newest first.</p>
      {rows.map((row) => (
        <HistoryCard key={row.id} row={row} expanded={expandedKey === row.id} onToggle={() => onToggle(row.id)} />
      ))}
    </>
  );
}
