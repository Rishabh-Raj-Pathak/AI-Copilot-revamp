import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Badge,
  GhostButton,
  PAGE_SIZE,
  Pager,
  GoldButton,
  GradientButton,
  IconArrowLeft,
  Panel,
  RiskChip,
  StatCard,
  StatusPill,
  type Status,
} from '../components/ui/primitives'
import { cx } from '../lib/cx'
import { AgentRail } from '../components/AgentRail'
import { StrategyList } from '../components/StrategyList'
import {
  HISTORY,
  OPEN_POSITIONS,
  SEED_ACTIVITY,
  type ActiveAgent,
  type ActivityEvent,
  type HistoryRun,
  type ActivityKind,
} from '../data/mock'
import { buyingPower, getStrategy, getToken, getVenue, type Config } from '../lib/config'
import { clockTime, duration, pct, price, usd, usdCompact, usdSigned } from '../lib/format'

type Props = {
  config: Config
  running: boolean
  onToggleRun: () => void
  onBackToConfigure: () => void
  /** Passed by Market Making 3: the dashboard becomes the agents home. */
  agents?: ActiveAgent[] | null
  /** Set when one agent is open, which turns this into strategy details. */
  agent?: ActiveAgent | null
  /** Set when a finished run is open. Renders the same layout, statically. */
  run?: HistoryRun | null
  onViewResults?: (r: HistoryRun) => void
  /**
   * 'combined' puts live and finished strategies in one component;
   * 'split' keeps the active rail and the history table separate.
   */
  listStyle?: 'combined' | 'split'
  onViewStrategy?: (a: ActiveAgent) => void
  onNewAgent?: () => void
  onEditAgent?: () => void
  onDeactivateAgent?: () => void
}

type Live = {
  volume: number
  fees: number
  pnl: number
  fills: number
  cycles: number
  elapsed: number
}

const IDLE: Live = { volume: 0, fees: 0, pnl: 0, fills: 0, cycles: 0, elapsed: 0 }

export function Dashboard({
  config,
  running,
  onToggleRun,
  onBackToConfigure,
  agents = null,
  agent = null,
  run = null,
  onViewStrategy,
  onViewResults,
  listStyle = 'split',
  onNewAgent,
  onEditAgent,
  onDeactivateAgent,
}: Props) {
  const venue = getVenue(config)
  const strategy = getStrategy(config)
  const token = getToken(config)
  const [live, setLive] = useState<Live>(IDLE)
  /** Rolling samples of traded volume, newest last. Feeds the volume chart. */
  const [series, setSeries] = useState<{ t: number; v: number }[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const seeded = useRef(false)
  /** Mirrors live so the interval can compute the next tick without nesting updaters. */
  const liveRef = useRef<Live>(IDLE)
  const seq = useRef(0)

  // A modest tick so the running state reads as live rather than a static mock.
  // The ref guard seeds the session once, so the interval is not torn down and
  // rebuilt every time an event lands.
  useEffect(() => {
    if (!running) return
    if (!seeded.current) {
      seeded.current = true
      setActivity(
        SEED_ACTIVITY.map((e, i) => ({
          id: `seed-${i}`,
          kind: e.kind,
          text: e.text,
          at: new Date(Date.now() - e.agoSec * 1000),
        })),
      )
      const seed: Live = { volume: 214_800, fees: 24.6, pnl: 11.42, fills: 148, cycles: 74, elapsed: 412 }
      liveRef.current = seed
      setLive(seed)
      // Backfill the window so the chart opens with a real span rather than
      // a single point, and the axes have something to label.
      const now = Date.now()
      const SPAN = 4 * 60_000
      setSeries(
        Array.from({ length: 30 }, (_, i) => {
          const f = i / 29
          return { t: now - SPAN + f * SPAN, v: Math.round(seed.volume * (0.2 + 0.8 * f)) }
        }),
      )
    }
    const id = setInterval(() => {
      const l = liveRef.current
      const next: Live = {
        volume: l.volume + 1400 + Math.random() * 2600,
        fees: l.fees + 0.14 + Math.random() * 0.2,
        pnl: l.pnl + (Math.random() - 0.42) * 0.9,
        fills: l.fills + (Math.random() > 0.45 ? 1 : 0),
        cycles: l.cycles + (Math.random() > 0.7 ? 1 : 0),
        elapsed: l.elapsed + 2,
      }
      liveRef.current = next
      setLive(next)
      setSeries((prev) => [...prev, { t: Date.now(), v: next.volume }].slice(-120))
      if (Math.random() > 0.55) {
        seq.current += 1
        setActivity((a) => [makeEvent(seq.current, token?.symbol ?? 'BTC', token?.mark ?? 91_240), ...a].slice(0, 24))
      }
    }, 2000)
    return () => clearInterval(id)
  }, [running, token])

  const status: Status = running ? 'Active' : 'Standby'
  const cpm = live.volume > 0 ? live.fees / (live.volume / 1_000_000) : 0
  const equity = (venue?.balance ?? 0) + live.pnl

  if (run) {
    return <CompletedRun run={run} onBack={onBackToConfigure} />
  }

  // Market Making 3 with no agent open: the dashboard is the agents home,
  // showing what is live plus what has already run.
  if (agents && !agent) {
    return (
      <>
        {listStyle === 'combined' ? (
          <StrategyList
            agents={agents}
            onViewStrategy={(a) => onViewStrategy?.(a)}
            onViewResults={(r) => onViewResults?.(r)}
            onNew={() => onNewAgent?.()}
          />
        ) : (
          <>
            <AgentRail
              agents={agents}
              onViewStrategy={(a) => onViewStrategy?.(a)}
              onNew={() => onNewAgent?.()}
            />
            <div className="mt-3">
              <StrategyHistory />
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <>
      {agent && (
        <div className="mb-4">
          <GhostButton onClick={onBackToConfigure} className="w-auto">
            <span className="inline-flex items-center gap-2">
              <IconArrowLeft />
              Back to strategies
            </span>
          </GhostButton>
        </div>
      )}

      {/* Stat row */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Volume Generated"
          value={running ? usdCompact(live.volume) : '—'}
          descriptor={`All time ${usdCompact(5_994_000 + live.volume)}`}
        />
        <StatCard
          label="Fees Spent"
          value={running ? usd(live.fees) : '—'}
          descriptor={`All time ${usd(763.2 + live.fees)}`}
        />
        <StatCard
          label="CPM"
          tip="Cost per $1M of volume traded. Lower is better, and a negative figure means the run earned more than it cost. CPM only compares meaningfully within one venue."
          value={running ? `$${cpm.toFixed(2)}` : '—'}
          tone={running ? (cpm <= 0 ? 'pos' : 'cream') : 'cream'}
          descriptor={`${live.cycles} round trips this session`}
        />
        <StatCard
          label="Realised PnL"
          value={running ? usdSigned(live.pnl) : '$0.00'}
          descriptor={
            running
              ? `Spread ${usdSigned(live.pnl + live.fees)} · fees ${usd(live.fees)}`
              : 'Spread and fees breakdown'
          }
        />
      </div>

      {/* Account and status */}
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel>
          <div className="mm-micro-muted">Account equity · managed</div>
          <div className="mm-num mt-3 text-[40px] leading-none font-semibold text-mm-gold-50">
            {usd(equity).split('.')[0]}
            <span className="text-[24px] text-mm-gold-300">.{usd(equity).split('.')[1]}</span>
          </div>
          <div className="mm-mono mt-3 text-[12px] text-mm-ink-5">
            {strategy?.name.toLowerCase() ?? 'market making'} · {venue?.name ?? 'no venue'} ·{' '}
            {token?.symbol ?? 'no market'}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <RiskChip
              label="Cut-off"
              value={config.cutoffOn ? `${usd(config.cutoff, 0)} below start` : 'Off'}
            />
            <RiskChip
              label="Auto stop"
              value={
                config.durationOn
                  ? running
                    ? duration(config.durationValue * (config.durationUnit === 'hr' ? 3600 : 60) - live.elapsed)
                    : `${config.durationValue}${config.durationUnit === 'hr' ? 'h' : 'm'}`
                  : 'Off'
              }
            />
            <RiskChip label="Buying power" value={usd(buyingPower(config), 0)} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div className="mm-micro-muted">Strategy status</div>
            <StatusPill status={status} />
          </div>
          <p className="mt-4 text-[14px] leading-[21px] text-mm-ink-2">
            {running
              ? `Quoting both sides of ${token?.symbol ?? 'the book'}. Inventory inside the cap, requoting on each book move.`
              : 'Press Start. HyprEarn begins quoting both sides of the book on your venue.'}
          </p>
          <div className="mm-rule my-4" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <Counter label="Leverage" value={`${config.leverage}x`} />
            <Counter label="Quote size" value={usd((buyingPower(config) * (strategy?.quoteSizePct ?? 10)) / 100, 0)} />
            <Counter label="Max inventory" value={usd(buyingPower(config) * 0.35, 0)} />
            <Counter label="Cycles" value={running ? String(live.cycles) : '—'} />
            <Counter label="Fills" value={running ? String(live.fills) : '—'} />
            <Counter label="Quoted volume" value={running ? usdCompact(live.volume) : '—'} />
          </div>
        </Panel>
      </div>

      {/* Positions and activity */}
      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <div className="mm-micro-muted">Open positions</div>
            <span className="mm-micro-muted">{running ? '1 open' : 'None open'}</span>
          </div>
          <div className="mt-4 -mx-1 overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <Th>Instrument</Th>
                  <Th>Side</Th>
                  <Th align="right">Size</Th>
                  <Th align="right">Entry</Th>
                  <Th align="right">Mark</Th>
                  <Th align="right">PnL</Th>
                </tr>
              </thead>
              <tbody>
                {running ? (
                  OPEN_POSITIONS.map((p) => (
                    <tr key={p.instrument} className="border-b border-white/[0.03] last:border-0">
                      <Td className="mm-mono text-mm-ink-1">{p.instrument}</Td>
                      <Td className={p.side === 'Long' ? 'text-mm-pos' : 'text-mm-neg'}>{p.side}</Td>
                      <Td align="right">{p.size}</Td>
                      <Td align="right">{price(p.entry)}</Td>
                      <Td align="right">{price(p.mark)}</Td>
                      <Td align="right">
                        {usdSigned(p.pnl)}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-2 py-10 text-center text-[13px] text-mm-ink-5">
                      Nothing open. Positions appear once quoting starts and a resting order fills.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <div className="mm-micro-muted">Activity</div>
            <StatusPill status={status} />
          </div>
          <div className="mm-no-scrollbar mt-4 max-h-[248px] space-y-3 overflow-y-auto pr-1">
            {activity.length === 0 || !running ? (
              <p className="py-10 text-center text-[13px] text-mm-ink-5">
                No activity yet. Fills, funding and guard triggers print here once the run starts.
              </p>
            ) : (
              activity.map((e) => (
                <div key={e.id} className="flex gap-2.5">
                  <span className={cx('mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full', kindDot(e.kind))} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] leading-[18px] text-mm-ink-3">{e.text}</p>
                    <p className="mm-mono mt-0.5 text-[10px] text-mm-ink-6">{clockTime(e.at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mb-4">
        <VolumeChart points={series} running={running} fills={live.fills} />
      </div>

      {!agent && <StrategyHistory />}

      {agent ? (
        <AgentActions
          agent={agent}
          running={running}
          onEdit={onEditAgent}
          onToggleRun={onToggleRun}
          onDeactivate={onDeactivateAgent}
        />
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <GradientButton onClick={onToggleRun} className="sm:flex-1">
            {running ? 'Pause' : 'Start'}
          </GradientButton>
          <GhostButton onClick={onBackToConfigure} className="sm:w-[200px]">
            <span className="inline-flex items-center gap-2">
              <IconArrowLeft />
              Configure
            </span>
          </GhostButton>
        </div>
      )}
    </>
  )
}

/* -------------------------------------------------------- volume chart -- */

/** Volume gridlines step up once the run is large enough to need them. */
function volumeTicks(min: number, max: number) {
  let step = max >= 1_000_000 ? 500_000 : 50_000
  // Keep the gridlines readable however long the run gets
  while ((Math.ceil(max / step) * step - Math.floor(min / step) * step) / step > 6) step *= 2
  const lo = Math.floor(min / step) * step
  const hi = Math.max(Math.ceil(max / step) * step, lo + step)
  const ticks: number[] = []
  for (let v = lo; v <= hi + 1; v += step) ticks.push(v)
  return { lo, hi, ticks }
}

/** 1 minute up to a 5 minute window, then 5, then 30 once past an hour. */
function timeTicks(t0: number, t1: number) {
  const spanMin = (t1 - t0) / 60_000
  const stepMs = (spanMin >= 60 ? 30 : spanMin >= 5 ? 5 : 1) * 60_000
  const ticks: number[] = []
  for (let t = Math.ceil(t0 / stepMs) * stepMs; t <= t1; t += stepMs) ticks.push(t)
  return ticks
}

const hhmm = (t: number) =>
  new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

/**
 * Traded volume over the session. One series, so no legend: the title names it.
 * The SVG carries only the line and its fill; everything positioned against the
 * data — axes, gridlines, marker, tooltip — is HTML, so nothing distorts when
 * the viewBox stretches to the container.
 */
function VolumeChart({
  points,
  running,
  fills,
  settled,
}: {
  points: { t: number; v: number }[]
  running: boolean
  fills: number
  /** A finished run: the shape is real, the wall clock behind it is not. */
  settled?: boolean
}) {
  const [hover, setHover] = useState<number | null>(null)
  const wrap = useRef<HTMLDivElement>(null)

  const W = 600
  const H = 150

  const enough = points.length >= 2
  const values = points.map((p) => p.v)
  const { lo, hi, ticks: yTicks } = volumeTicks(
    enough ? Math.min(...values) : 0,
    enough ? Math.max(...values) : 1,
  )
  const t0 = enough ? points[0].t : 0
  const t1 = enough ? points[points.length - 1].t : 1
  const xTicks = enough && !settled ? timeTicks(t0, t1) : []

  const xPct = (i: number) => (i / (points.length - 1)) * 100
  const yPct = (v: number) => (1 - (v - lo) / (hi - lo)) * 100
  const yAt = (v: number) => (yPct(v) / 100) * H

  const line = enough
    ? points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1)) * W},${yAt(p.v)}`).join(' ')
    : ''
  const area = enough ? `${line} L${W},${H} L0,${H} Z` : ''
  const at = hover !== null && enough ? points[hover] : null
  const last = enough ? points[points.length - 1] : null

  return (
    <Panel>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="mm-micro-muted">{settled ? 'Volume traded' : 'Volume traded · live'}</div>
        <span className="mm-num text-[13px] text-mm-ink-3">
          {enough ? usdCompact(points[points.length - 1].v) : '—'}
        </span>
      </div>

      {enough ? (
        <>
          <div className="relative mt-4 h-[186px]">
            {/* Volume axis */}
            <div className="absolute top-0 bottom-[22px] left-0 w-[52px]">
              {yTicks.map((v) => (
                <span
                  key={v}
                  className="mm-num absolute right-2 -translate-y-1/2 text-[10px] text-mm-ink-6"
                  style={{ top: `${yPct(v)}%` }}
                >
                  {usdCompact(v)}
                </span>
              ))}
            </div>

            {/* Plot */}
            <div
              ref={wrap}
              className="absolute top-0 right-0 bottom-[22px] left-[52px] cursor-crosshair"
              onMouseMove={(e) => {
                const r = wrap.current?.getBoundingClientRect()
                if (!r) return
                const ratio = (e.clientX - r.left) / r.width
                const i = Math.round(ratio * (points.length - 1))
                setHover(Math.max(0, Math.min(points.length - 1, i)))
              }}
              onMouseLeave={() => setHover(null)}
            >
              {yTicks.map((v) => (
                <div
                  key={v}
                  className="pointer-events-none absolute inset-x-0 h-px bg-white/[0.05]"
                  style={{ top: `${yPct(v)}%` }}
                />
              ))}

              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden
              >
                <defs>
                  <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d6b06a" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#d6b06a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#volFill)" />
                <path
                  d={line}
                  fill="none"
                  stroke="#d6b06a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Leading point */}
              {last && (
                <div
                  className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: '100%',
                    top: `${yPct(last.v)}%`,
                    backgroundColor: '#d6b06a',
                    boxShadow: '0 0 0 3px rgba(214,176,106,0.22)',
                  }}
                />
              )}

              {at && hover !== null && (
                <>
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/15"
                    style={{ left: `${xPct(hover)}%` }}
                  />
                  <div
                    className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${xPct(hover)}%`,
                      top: `${yPct(at.v)}%`,
                      backgroundColor: '#d6b06a',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -top-1 -translate-x-1/2 rounded-[8px] border border-white/10 bg-mm-elevated px-2.5 py-1.5 whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                    style={{ left: `${xPct(hover)}%` }}
                  >
                    <div className="mm-num text-[12px] text-mm-ink-1">{usdCompact(at.v)}</div>
                    {!settled && (
                      <div className="mm-mono text-[10px] text-mm-ink-5">{clockTime(new Date(at.t))}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Time axis */}
            <div className="absolute right-0 bottom-0 left-[52px] h-[18px]">
              {xTicks.map((t) => (
                <span
                  key={t}
                  className="mm-mono absolute -translate-x-1/2 text-[10px] text-mm-ink-6"
                  style={{ left: `${((t - t0) / (t1 - t0 || 1)) * 100}%` }}
                >
                  {hhmm(t)}
                </span>
              ))}
            </div>
          </div>

          <div className="mm-micro-muted mt-1">
            {fills} fills · {settled ? 'over the run' : 'since launch'}
          </div>
        </>
      ) : (
        <p className="mt-4 text-[13px] text-mm-ink-5">
          {running
            ? 'Charting volume. The line appears once a couple of ticks have landed.'
            : 'No volume yet. Start the run and traded volume plots here.'}
        </p>
      )}
    </Panel>
  )
}

/* --------------------------------------------------------- completed -- */

/**
 * A finished run in the same layout as a live strategy, but every figure comes
 * from the record rather than the ticker: this is what the run ended at, not
 * what it is doing now. Nothing here can be paused or edited.
 */
function CompletedRun({ run, onBack }: { run: HistoryRun; onBack: () => void }) {
  const cpm = run.volume > 0 ? run.fees / (run.volume / 1_000_000) : 0
  const captured = run.pnl + run.fees
  // A settled curve rising to the volume the run finished on
  const shape = Array.from({ length: 28 }, (_, i) => {
    const f = i / 27
    return { t: i, v: run.volume * (0.04 + 0.96 * Math.pow(f, 0.85)) }
  })

  return (
    <>
      <div className="mb-4">
        <GhostButton onClick={onBack} className="w-auto">
          <span className="inline-flex items-center gap-2">
            <IconArrowLeft />
            Back to strategies
          </span>
        </GhostButton>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Volume Generated"
          value={usdCompact(run.volume)}
          descriptor={`Over ${run.durationLabel}`}
        />
        <StatCard label="Fees Spent" value={usd(run.fees)} descriptor="Net of maker rebates" />
        <StatCard
          label="CPM"
          tip="Cost per $1M of volume traded. Lower is better, and a negative figure means the run earned more than it cost."
          value={`$${cpm.toFixed(2)}`}
          descriptor={`${run.fills} fills over the run`}
        />
        <StatCard
          label="Realised PnL"
          value={usdSigned(run.pnl)}
          descriptor={`Spread ${usdSigned(captured)} · fees ${usd(run.fees)}`}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel>
          <div className="mm-micro-muted">Final result</div>
          <div className="mm-num mt-3 text-[40px] leading-none font-semibold text-mm-gold-50">
            {usdSigned(run.pnl).split('.')[0]}
            <span className="text-[24px] text-mm-gold-300">.{usdSigned(run.pnl).split('.')[1]}</span>
          </div>
          <div className="mm-mono mt-3 text-[12px] text-mm-ink-5">
            {run.strategy.toLowerCase()} · {run.venue} · {run.market}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <RiskChip label="Window" value={`${run.start} → ${run.durationLabel}`} />
            <RiskChip label="Leverage" value={`${run.leverage}x`} />
            <RiskChip label="Quote size" value={usd(run.quoteSize, 0)} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div className="mm-micro-muted">Strategy status</div>
            <StatusPill status="Ended" />
          </div>
          <p className="mt-4 text-[14px] leading-[21px] text-mm-ink-2">
            Finished after {run.durationLabel}. Quotes were cancelled and inventory flattened, so
            nothing is open against {run.market}.
          </p>
          <div className="mm-rule my-4" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <Counter label="Leverage" value={`${run.leverage}x`} />
            <Counter label="Quote size" value={usd(run.quoteSize, 0)} />
            <Counter label="Maker share" value={pct(run.makerShare * 100, 0)} />
            <Counter label="Fills" value={String(run.fills)} />
            <Counter label="Volume" value={usdCompact(run.volume)} />
            <Counter label="Fees" value={usd(run.fees)} />
          </div>
        </Panel>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <div className="mm-micro-muted">Open positions</div>
            <span className="mm-micro-muted">None open</span>
          </div>
          <p className="mt-6 text-center text-[13px] text-mm-ink-5">
            Inventory was flattened when the run ended.
          </p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div className="mm-micro-muted">Fills · sample</div>
            <Badge tone="muted">Final</Badge>
          </div>
          <div className="mt-4 -mx-1 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <Th>Time</Th>
                  <Th>Side</Th>
                  <Th align="right">Size</Th>
                  <Th align="right">Price</Th>
                  <Th align="right">Fee</Th>
                </tr>
              </thead>
              <tbody>
                {run.sampleFills.map((f, i) => (
                  <tr key={i} className="border-b border-white/[0.03] last:border-0">
                    <Td className="mm-mono text-[11px]">{f.at}</Td>
                    <Td>{f.side}</Td>
                    <Td align="right">{f.size}</Td>
                    <Td align="right">{price(f.price)}</Td>
                    <Td align="right">{usdSigned(f.fee)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mb-4">
        <VolumeChart points={shape} running={false} fills={run.fills} settled />
      </div>
    </>
  )
}

/* ------------------------------------------------------ agent actions -- */

/**
 * Every control for the open strategy, in one card. Carries the same border,
 * gradient and soft glow as a selected strategy option, so it reads as part of
 * the same family rather than as a pair of loud buttons.
 */
function AgentActions({
  agent,
  running,
  onEdit,
  onToggleRun,
  onDeactivate,
}: {
  agent: ActiveAgent
  running: boolean
  onEdit?: () => void
  onToggleRun: () => void
  onDeactivate?: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className="mt-6 rounded-[14px] p-4 transition-all sm:p-5"
      style={{
        border: '1px solid rgba(204,177,127,0.55)',
        backgroundImage: 'linear-gradient(to bottom, #1a140b, #0f0e0c)',
        boxShadow: '0 0 15px -5px rgba(204,177,127,0.35)',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-mm-gold-100">Manage strategy</div>
          <p className="mt-1 text-[12px] leading-[18px] text-mm-ink-5">
            {running
              ? `Quoting ${agent.marketSymbol} now. Pause holds inventory flat without closing the run.`
              : `Paused on ${agent.marketSymbol}. Resume to start quoting again.`}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          <GoldButton onClick={onEdit}>Edit</GoldButton>
          <GoldButton onClick={onToggleRun}>{running ? 'Pause' : 'Resume'}</GoldButton>
          <button
            type="button"
            onClick={() => setConfirming((v) => !v)}
            className="rounded-[10px] px-3 py-2 text-[11px] font-medium tracking-[0.06em] text-mm-ink-5 uppercase transition-colors hover:text-mm-neg"
          >
            Deactivate
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-mm-neg/25 bg-mm-neg/[0.06] px-3.5 py-3">
          <span className="text-[12px] leading-[18px] text-mm-ink-3">
            Deactivating stops quoting and flattens inventory. This cannot be undone.
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onDeactivate}
              className="rounded-[10px] border border-mm-neg/40 bg-mm-neg/10 px-3 py-1.5 text-[12px] font-semibold text-mm-neg transition-colors hover:bg-mm-neg/20"
            >
              Deactivate
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-[12px] font-medium text-mm-ink-5 transition-colors hover:text-mm-ink-2"
            >
              Cancel
            </button>
          </span>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- history -- */

function StrategyHistory() {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(HISTORY.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const from = safePage * PAGE_SIZE
  const shown = HISTORY.slice(from, from + PAGE_SIZE)

  return (
    <Panel>
      <div className="mm-micro-muted mb-4">Strategy history</div>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <Th>Strategy</Th>
              <Th>Market</Th>
              <Th>Venue</Th>
              <Th align="right">Lev</Th>
              <Th align="right">Quote</Th>
              <Th>Window</Th>
              <Th align="right">Volume</Th>
              <Th align="right">Fees</Th>
              <Th align="right">PnL</Th>
              <Th align="right">Maker</Th>
              <Th align="right">Fills</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-b border-white/[0.03] last:border-0">
                <Td className="text-mm-ink-1">{r.strategy}</Td>
                <Td className="mm-mono text-mm-ink-1">{r.market}</Td>
                <Td>{r.venue}</Td>
                <Td align="right">{r.leverage}x</Td>
                <Td align="right">{usd(r.quoteSize, 0)}</Td>
                <Td>
                  <span className="mm-mono text-[11px] text-mm-ink-5">
                    {r.start} → {r.durationLabel}
                  </span>
                </Td>
                <Td align="right">{usdCompact(r.volume)}</Td>
                <Td align="right">{usd(r.fees)}</Td>
                <Td align="right">
                  {usdSigned(r.pnl)}
                </Td>
                <Td align="right">{pct(r.makerShare * 100, 0)}</Td>
                <Td align="right">{r.fills}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager
        page={safePage}
        pages={pages}
        total={HISTORY.length}
        rangeLabel={`${HISTORY.length === 0 ? 0 : from + 1}–${from + shown.length} of ${HISTORY.length}`}
        onChange={setPage}
      />
    </Panel>
  )
}

function Counter({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mm-micro-muted">{label}</div>
      <div className="mm-num mt-1 text-[15px] font-medium text-mm-ink-1">{value}</div>
    </div>
  )
}

function Th({ children, align = 'left' }: { children?: ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={cx('mm-micro-muted px-2 pb-2 font-medium', align === 'right' ? 'text-right' : 'text-left')}>
      {children}
    </th>
  )
}

function Td({
  children,
  align = 'left',
  className,
}: {
  children?: ReactNode
  align?: 'left' | 'right'
  className?: string
}) {
  return (
    <td
      className={cx(
        'mm-num px-2 py-3 text-[13px] text-mm-ink-3',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  )
}

function kindDot(k: ActivityKind): string {
  if (k === 'fill') return 'bg-mm-pos'
  if (k === 'guard') return 'bg-mm-neg'
  if (k === 'funding') return 'bg-mm-gold-300'
  if (k === 'quote') return 'bg-mm-ink-4'
  return 'bg-mm-ink-6'
}

function makeEvent(n: number, symbol: string, mark: number): ActivityEvent {
  const r = Math.random()
  const px = (mark * (1 + (Math.random() - 0.5) * 0.0008)).toFixed(1)
  if (r > 0.72) {
    return {
      id: `e-${n}`,
      kind: 'quote',
      text: `Requoted both sides. Spread held at ${(1.6 + Math.random()).toFixed(1)} bps.`,
      at: new Date(),
    }
  }
  const side = Math.random() > 0.5 ? 'buy' : 'sell'
  return {
    id: `e-${n}`,
    kind: 'fill',
    text: `Filled ${side} ${(0.011 + Math.random() * 0.004).toFixed(4)} ${symbol} at $${px} as maker. Fee $0.1${Math.floor(Math.random() * 9)}.`,
    at: new Date(),
  }
}
