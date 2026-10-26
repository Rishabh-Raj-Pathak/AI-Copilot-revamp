import { useMemo, useState } from "react";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { CancelButton, DataRow, Divider, Dn2Button, Dn2Sheet, InfoButton, SideBadge } from "../dn2/Dn2Ui.jsx";
import { CARD, CARD_EDGE, CARD_FILL, EYEBROW, HERO_EDGE, HERO_FILL, TILE } from "../dn2/dn2Theme.js";
import { runSeries, statusLine } from "../../../market-making/Dashboard.tsx";
import {
  ago,
  dayTime,
  fullStamp,
  pct,
  price,
  runtime,
  stopLabel,
  strategyName,
  usd,
  usdCompact,
  usdFine,
  usdFineSigned,
} from "../../../market-making/lib.ts";
import { useNow } from "../../../market-making/useVenueAccount.ts";
import {
  AgentMeta,
  Counter,
  InfoSheet,
  MmPage,
  StatTile,
  StatusChip,
  StatusPill,
  StrategyDisc,
  VolumeChart,
} from "./MmUi.jsx";

/**
 * One agent, pushed over the list — production's agent detail (or a finished
 * run's results) as a phone page:
 *
 *   identity       symbol, status, strategy · venue, starting equity, guards
 *   figures        Volume generated · Fees spent · Realised PnL · CPM (2 × 2)
 *   status         what it is doing now, leverage → quoted volume
 *   positions      one tile per open position (the web table's columns)
 *   activity       the latest five, "All activity" opens the rest in a sheet
 *   volume         the cumulative chart; a finger scrubs it
 *
 * A live agent pins production's Manage Agent actions (Edit, Pause / Resume,
 * Deactivate) in a footer; Pause and Deactivate confirm in a sheet first, as
 * production's dialogs do, and Deactivate ends on a receipt.
 */

const PILL_FOR_PHASE = {
  starting: "Starting",
  running: "Active",
  offline: "Offline",
  pausing: "Pausing",
  paused: "Paused",
  stopping: "Stopping",
  stopped: "Ended",
};

const CPM_TIP =
  "Cost per $1M of volume traded. Lower is better, and a negative figure means the run earned more than it cost. CPM only compares meaningfully within one venue.";
const EVENT_DOT = { fill: "bg-[#00d492]", guard: "bg-[#e5484d]", system: "bg-[#63646f]" };
const PREVIEW = 5;
const tone = (v) => (v > 0 ? "text-[#00d492]" : v < 0 ? "text-[#e5484d]" : "text-[#f0ddb9]");

function relative(at, now) {
  const s = Math.max(1, Math.floor((now - at.getTime()) / 1000));
  if (s < 60) return ago(s, "sec");
  const m = Math.floor(s / 60);
  if (m < 60) return ago(m, "min");
  const h = Math.floor(m / 60);
  if (h < 24) return ago(h, "hour");
  const d = Math.floor(h / 24);
  return d <= 2 ? ago(d, "day") : fullStamp(at);
}

function EventRow({ event, now }) {
  return (
    <li className="flex gap-2.5">
      <span className={`mt-[6px] size-1.5 shrink-0 rounded-full ${EVENT_DOT[event.kind]}`} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[13px] leading-[18px] text-[#d4d4d8]">{event.text}</p>
        <p className="font-[ui-monospace,SF_Mono,Menlo,Consolas,monospace] text-[10px] leading-[14px] text-[#717182]" title={fullStamp(event.at)}>
          {relative(event.at, now)}
        </p>
      </div>
    </li>
  );
}

function Section({ label, right = null, tip, onTip, children }) {
  return (
    <section className={`${CARD} ${CARD_EDGE}`} style={CARD_FILL} aria-label={label}>
      <div className="flex min-h-6 items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className={EYEBROW}>{label}</h2>
          {tip ? <InfoButton label={`About ${label}`} onPress={onTip} /> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Chip({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.07] bg-white/[0.02] px-2 py-1">
      <span className="text-[10px] font-medium uppercase leading-[13px] tracking-[0.4px] text-[#717182]">{label}</span>
      <span className="text-[11px] font-medium leading-[14px] text-[#d4d4d8]">{value}</span>
    </span>
  );
}

/** The agent a sheet acts on: disc, symbol, strategy · venue; `aside` for a status. */
function AgentSummaryTile({ agent, aside = null }) {
  return (
    <div className={`${TILE} flex items-center gap-2.5 px-3 py-2.5`}>
      <StrategyDisc id={agent.strategyId} live={agent.phase === "running"} size={28} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[14px] font-medium leading-[18px] text-[#e8d5b5]">{agent.marketSymbol}</p>
        <AgentMeta agent={agent} />
      </div>
      {aside}
    </div>
  );
}

export default function MmAgentPage({ open, onClose, detail, pending, onEdit, onToggleRun, onDeactivate }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [cpmTip, setCpmTip] = useState(false);
  const [confirm, setConfirm] = useState({ kind: null, open: false, done: false });
  const s = detail?.strategy;
  const live = Boolean(s) && s.phase !== "stopped";
  const now = useNow(open);
  const series = useMemo(
    () => (!detail ? [] : live ? detail.volumeSeries : runSeries(detail.strategy, detail.activity)),
    [detail, live],
  );

  if (!detail) return <MmPage open={open} onClose={onClose} title="Agent" />;

  const running = s.status === "running";
  const busy = pending !== null || s.phase === "stopping" || s.phase === "pausing";
  const reason = stopLabel(s.stopReason);
  const closeConfirm = () => setConfirm((c) => ({ ...c, open: false }));

  const footer = live ? (
    <div className="flex items-center gap-2">
      <Dn2Button size="lg" className="flex-1 px-3" disabled={busy} onClick={onEdit}>
        Edit
      </Dn2Button>
      <Dn2Button
        variant="primary"
        size="lg"
        className="flex-1 px-3"
        disabled={busy}
        onClick={() => (running ? setConfirm({ kind: "pause", open: true, done: false }) : onToggleRun())}
      >
        {pending === "resume" ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : null}
        {running ? "Pause" : pending === "resume" ? "Resuming…" : "Resume"}
      </Dn2Button>
      <Dn2Button
        variant="danger"
        size="lg"
        className="flex-1 px-3"
        disabled={busy}
        onClick={() => setConfirm({ kind: "deactivate", open: true, done: false })}
      >
        Deactivate
      </Dn2Button>
    </div>
  ) : null;

  return (
    <>
      <MmPage
        open={open}
        onClose={onClose}
        title={live ? s.marketSymbol : "Run results"}
        label={`${s.marketSymbol} on ${s.venueId}`}
        footer={footer}
      >
        {/* Identity */}
        <section className={`${CARD} ${HERO_EDGE}`} style={HERO_FILL} aria-label={live ? "Agent" : "Run"}>
          <div className="flex items-center gap-3">
            <StrategyDisc id={s.strategyId} live={s.phase === "running"} size={36} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="shrink-0 text-[16px] font-medium leading-5 text-[#e8d5b5]">{s.marketSymbol}</p>
                <StatusChip agent={s} />
              </div>
              <AgentMeta agent={s} />
            </div>
          </div>
          <Divider />
          {live ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.5px] text-[#8f90a1]">
                  Starting equity · managed
                </p>
                <p className="text-[24px] font-semibold leading-[30px] text-[#f5ead6]">
                  {usdFine(s.margin).split(".")[0]}
                  <span className="text-[16px] text-[#ccb17f]">.{usdFine(s.margin).split(".")[1]}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip label="Cut-off" value={s.cutoff > 0 ? `${usd(s.cutoff, 0)} below start` : "Default"} />
                <Chip
                  label="Auto stop"
                  value={
                    s.durationOn
                      ? detail.remainingSeconds !== null
                        ? runtime(detail.remainingSeconds)
                        : `${s.durationValue}${s.durationUnit === "hr" ? "h" : "m"}`
                      : "Off"
                  }
                />
                <Chip label="Buying power" value={usd(detail.buyingPower, 0)} />
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-3 gap-3">
              <Counter label="Started" value={dayTime(s.activatedAt ?? s.createdAt)} />
              <Counter label="Ended" value={dayTime(s.deactivatedAt)} />
              <Counter label="Ran for" value={s.runtimeLabel} />
            </dl>
          )}
        </section>

        {/* Figures */}
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Volume generated"
            value={usdCompact(s.volume)}
            sub={live ? `Maker ${usdCompact(detail.makerVolume)}` : "Across the whole run"}
          />
          <StatTile label="Fees spent" value={usdFine(s.fees)} sub={`${s.fills} fills`} />
          <StatTile
            label="Realised PnL"
            value={usdFineSigned(s.pnl)}
            tone={tone(s.pnl)}
            sub={`Spread ${usdFineSigned(detail.spreadPnl)} · Fees ${usdFine(s.fees)}`}
          />
          <StatTile
            label="CPM"
            value={s.cpm === null ? "—" : `$${s.cpm.toFixed(2)}`}
            tone={s.cpm !== null && s.cpm <= 0 ? "text-[#00d492]" : undefined}
            sub={s.cpm === null ? "Needs $10k of volume" : `${detail.roundTrips} round trips`}
            aside={<InfoButton quiet label="About CPM" onPress={() => setCpmTip(true)} />}
          />
        </div>

        {/* Status */}
        <Section label="Strategy status" right={<StatusPill status={PILL_FOR_PHASE[s.phase]} />}>
          <p className="text-[13px] leading-[19px] text-[#d4d4d8]">
            {live
              ? statusLine(s)
              : `${reason ? `${reason}. ` : ""}Quotes were cancelled and inventory flattened, so nothing is open against ${s.marketSymbol}.`}
          </p>
          {detail.lastError && live ? <p className="text-[12px] leading-[17px] text-[#e9a5a7]">Error: {detail.lastError}</p> : null}
          <Divider />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {live ? (
              <>
                <Counter label="Leverage" value={`${s.leverage}x`} />
                <Counter label="Max inventory" value={detail.maxInventory === null ? "—" : usd(detail.maxInventory, 0)} />
                <Counter label="Maker share" value={s.makerShare === null ? "—" : pct(100 * s.makerShare, 0)} />
                <Counter label="Round trips" value={String(detail.roundTrips)} />
                <Counter label="Fills" value={String(s.fills)} />
                <Counter label="Quoted volume" value={usdCompact(detail.quotedVolume)} />
              </>
            ) : (
              <>
                <Counter label="Strategy" value={strategyName(s)} />
                <Counter label="Venue" value={s.venueId} />
                <Counter label="Margin" value={usd(s.margin, 0)} />
                <Counter label="Leverage" value={`${s.leverage}x`} />
                <Counter label="Maker share" value={s.makerShare === null ? "—" : pct(100 * s.makerShare, 0)} />
                <Counter label="Fills" value={String(s.fills)} />
              </>
            )}
          </dl>
        </Section>

        {/* Positions (live agents only, as on web) */}
        {live ? (
          <Section
            label="Open positions"
            right={
              <span className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]">
                {detail.positions.length > 0 ? `${detail.positions.length} open` : "None open"}
              </span>
            }
          >
            {detail.positions.length === 0 ? (
              <p className="py-2 text-[12px] leading-[17px] text-[#8f90a1]">
                Nothing open. Positions appear once quoting starts and a resting order fills.
              </p>
            ) : (
              detail.positions.map((p) => (
                <div key={p.instrument} className={`${TILE} flex flex-col gap-2.5 px-3 py-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-medium leading-[18px] text-[#e8d5b5]">{p.instrument}</p>
                    <SideBadge side={p.side === "Long" ? "long" : "short"} />
                  </div>
                  <dl className="flex flex-col gap-2">
                    <DataRow
                      label="Size"
                      value={p.size.toLocaleString("en-US", {
                        maximumFractionDigits: Math.abs(p.size) >= 1e3 ? 2 : Math.abs(p.size) >= 1 ? 4 : 6,
                      })}
                    />
                    <DataRow label="Value" value={p.notional === null ? "—" : usdFine(p.notional)} />
                    <DataRow label="Mark" value={p.mark === null ? "—" : price(p.mark)} />
                  </dl>
                </div>
              ))
            )}
          </Section>
        ) : null}

        {/* Activity */}
        <Section label="Activity" right={<StatusPill status={PILL_FOR_PHASE[s.phase]} />}>
          {detail.activity.length === 0 ? (
            <p className="py-2 text-[12px] leading-[17px] text-[#8f90a1]">
              {live ? "No activity yet. Fills and status changes print here once the run starts." : "No activity to show."}
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {detail.activity.slice(0, PREVIEW).map((e) => (
                  <EventRow key={e.id} event={e} now={now} />
                ))}
              </ul>
              {detail.activity.length > PREVIEW ? (
                <Dn2Button size="sm" className="w-full" onClick={() => setActivityOpen(true)}>
                  All activity · {detail.activity.length}
                </Dn2Button>
              ) : null}
            </>
          )}
        </Section>

        {/* Volume */}
        <Section label={live ? (s.phase === "running" ? "Volume · last hour · live" : "Volume · last hour") : "Volume · whole run"}>
          {series.length >= 2 ? (
            <>
              <VolumeChart points={series} />
              <p className="text-[10px] leading-[13px] text-[#717182]">
                {live ? "Cumulative volume at each 5 minute mark" : "Cumulative volume from the fills, start to finish"}
              </p>
            </>
          ) : (
            <p className="py-2 text-[12px] leading-[17px] text-[#8f90a1]">
              {live
                ? "No volume in the last hour. Traded volume plots here once the agent starts filling."
                : "No volume was traded in this run."}
            </p>
          )}
        </Section>
      </MmPage>

      <Dn2Sheet open={activityOpen} onClose={() => setActivityOpen(false)} title="Activity" fullHeight>
        <ul className="flex flex-col gap-3.5 px-4 pb-6 pt-4">
          {detail.activity.map((e) => (
            <EventRow key={e.id} event={e} now={now} />
          ))}
        </ul>
      </Dn2Sheet>

      <InfoSheet open={cpmTip} onClose={() => setCpmTip(false)} title="CPM" body={CPM_TIP} />

      <Dn2Sheet
        open={confirm.open}
        onClose={busy ? () => {} : closeConfirm}
        title={confirm.done ? "Agent deactivated" : confirm.kind === "pause" ? "Pause this agent?" : "Deactivate this agent?"}
      >
        {confirm.done ? (
          <div className="flex flex-col gap-4 px-4 pt-4">
            <div className="flex flex-col items-center gap-3 pt-1 text-center" role="status">
              <span className="flex size-12 items-center justify-center rounded-full border border-[rgba(0,212,146,0.35)] bg-[rgba(0,212,146,0.1)] text-[#00d492]">
                <Check size={22} strokeWidth={2.5} aria-hidden />
              </span>
              <p className="max-w-[300px] text-[13px] leading-[18px] text-[#b4b5c2]">
                Quoting on {s.marketSymbol} has stopped and inventory was flattened. The run is in your completed agents.
              </p>
            </div>
            <AgentSummaryTile
              agent={s}
              aside={
                <span className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase leading-[13px] tracking-[0.4px] text-[#8f90a1]">
                  Completed
                </span>
              }
            />
            <Dn2Button
              size="lg"
              className="w-full"
              onClick={() => {
                closeConfirm();
                onClose();
              }}
            >
              Done
            </Dn2Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 pt-4">
            <AgentSummaryTile agent={s} />
            <p className="flex items-start gap-2 text-[12px] leading-[17px] text-[#8f90a1]">
              <TriangleAlert
                size={14}
                className={`mt-0.5 shrink-0 ${confirm.kind === "pause" ? "text-[#ccb17f]" : "text-[#f87171]"}`}
                aria-hidden
              />
              {confirm.kind === "pause"
                ? "Your agent will stop placing new orders and close any open positions."
                : `Deactivating stops quoting on ${s.marketSymbol} and flattens inventory. This cannot be undone, and the run moves to your completed agents.`}
            </p>
            <div className="flex flex-col gap-0.5">
              <Dn2Button
                variant={confirm.kind === "pause" ? "primary" : "danger"}
                size="lg"
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  if (confirm.kind === "pause") {
                    await onToggleRun();
                    closeConfirm();
                  } else {
                    await onDeactivate();
                    setConfirm((c) => ({ ...c, done: true }));
                  }
                }}
              >
                {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : null}
                {confirm.kind === "pause"
                  ? pending === "pause"
                    ? "Pausing…"
                    : "Pause agent"
                  : pending === "deactivate"
                    ? "Deactivating…"
                    : "Deactivate agent"}
              </Dn2Button>
              <CancelButton onPress={closeConfirm} />
            </div>
          </div>
        )}
      </Dn2Sheet>
    </>
  );
}
