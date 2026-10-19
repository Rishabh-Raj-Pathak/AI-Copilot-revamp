import { Fragment, useState, type ReactNode } from 'react'
import {
  Badge,
  IconPlus,
  PAGE_SIZE,
  Pager,
  Segmented,
  StrategyGlyph,
  VenueGlyph,
} from './ui/primitives'
import { cx } from '../lib/cx'
import { HISTORY, STRATEGIES, VENUES, type ActiveAgent, type HistoryRun } from '../data/mock'
import { usdCompact, usdSigned } from '../lib/format'

type Filter = 'all' | 'active' | 'completed'

/** One row of the list, whichever side of the divide it comes from. */
type Row =
  | { kind: 'active'; key: string; agent: ActiveAgent }
  | { kind: 'completed'; key: string; run: HistoryRun }

/**
 * Every strategy in one place and paged as one list — live strategies always
 * sort ahead of finished ones, so the first page is the work in flight. The
 * filter narrows to one side when you only care about that half.
 */
export function StrategyList({
  agents,
  onViewStrategy,
  onViewResults,
  onNew,
}: {
  agents: ActiveAgent[]
  onViewStrategy: (a: ActiveAgent) => void
  onViewResults: (r: HistoryRun) => void
  onNew: () => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(0)

  const live = agents.filter((a) => a.status === 'running').length
  const netPnl = agents.reduce((sum, a) => sum + a.pnl, 0)

  // Active first — that ordering is the point, so it is built into the list
  const all: Row[] = [
    ...agents.map((a): Row => ({ kind: 'active', key: a.id, agent: a })),
    ...HISTORY.map((r): Row => ({ kind: 'completed', key: r.id, run: r })),
  ]
  const rows = filter === 'all' ? all : all.filter((r) => r.kind === filter)

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const from = safePage * PAGE_SIZE
  const shown = rows.slice(from, from + PAGE_SIZE)
  // Only label the boundary when both halves are in play
  const dividerAt =
    filter === 'all' ? shown.findIndex((r) => r.kind === 'completed') : -1

  const choose = (f: Filter) => {
    setFilter(f)
    setPage(0)
  }

  return (
    <section className="rounded-[16px] border border-white/[0.05] bg-mm-recessed/70 p-4 sm:p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="mm-micro">Active Strategy</h3>
          <Badge tone={agents.length ? 'gold' : 'muted'}>
            {agents.length ? `${live} of ${agents.length} running` : 'None'}
          </Badge>
          {agents.length > 0 && (
            <span className="text-[12px] text-mm-ink-5">
              net PnL <span className="mm-num text-mm-ink-2">{usdSigned(netPnl)}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-mm-gold-600/45 px-3 py-1.5 text-[12px] font-semibold text-mm-gold-200 transition-colors hover:bg-mm-gold-600/15 hover:text-mm-gold-100"
          style={{ backgroundImage: 'linear-gradient(#1a140b, #0f0e0c)' }}
        >
          <IconPlus />
          New strategy
        </button>
      </header>

      <div className="mb-3">
        <Segmented
          size="sm"
          options={[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
          ]}
          value={filter}
          onChange={choose}
        />
      </div>

      <div className="space-y-2">
        {shown.map((row, i) => (
          <Fragment key={row.key}>
            {i === dividerAt && (
              <div className="flex items-center gap-3 pt-4 pb-1">
                <span className="mm-micro-muted shrink-0">Completed</span>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>
            )}
            {row.kind === 'active' ? (
              <ActiveRow agent={row.agent} onViewStrategy={() => onViewStrategy(row.agent)} />
            ) : (
              <CompletedRow run={row.run} onViewResults={() => onViewResults(row.run)} />
            )}
          </Fragment>
        ))}

        {rows.length === 0 && (
          <p className="px-1 py-3 text-[13px] text-mm-ink-5">
            {filter === 'completed'
              ? 'No completed runs yet.'
              : 'No strategies running yet. Launch one to start quoting.'}
          </p>
        )}
      </div>

      <Pager
        page={safePage}
        pages={pages}
        total={rows.length}
        rangeLabel={`${rows.length === 0 ? 0 : from + 1}–${from + shown.length} of ${rows.length}`}
        onChange={setPage}
      />
    </section>
  )
}

/* ------------------------------------------------------------ live row -- */

function ActiveRow({
  agent,
  onViewStrategy,
}: {
  agent: ActiveAgent
  onViewStrategy: () => void
}) {
  const strategy = STRATEGIES.find((s) => s.id === agent.strategyId)
  const venue = VENUES.find((v) => v.id === agent.venueId)
  const running = agent.status === 'running'

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] px-4 py-3"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0))',
      }}
    >
      <Identity
        glyph={<StrategyGlyph id={agent.strategyId} />}
        glyphTone={running ? 'text-mm-gold-300' : 'text-mm-ink-4'}
        symbol={agent.marketSymbol}
        symbolTone="text-mm-ink-1"
        status={
          <Status
            dot={running ? 'bg-mm-pos' : 'bg-mm-gold-300'}
            tone={running ? 'text-mm-pos' : 'text-mm-gold-300'}
            label={running ? 'Active' : 'Paused'}
          />
        }
        strategyName={strategy?.name}
        venue={venue}
      />

      <Metric label="Volume" value={usdCompact(agent.volume)} />
      <Metric label="PnL" value={usdSigned(agent.pnl)} />
      <Metric label="Runtime" value={agent.runtimeLabel} />

      <button
        type="button"
        onClick={onViewStrategy}
        className="shrink-0 rounded-[10px] border border-mm-gold-600/45 px-3.5 py-2 text-[12px] font-semibold text-mm-gold-200 transition-colors hover:bg-mm-gold-600/15 hover:text-mm-gold-100"
        style={{ backgroundImage: 'linear-gradient(#1a140b, #0f0e0c)' }}
      >
        View Strategy
      </button>
    </div>
  )
}

/* ------------------------------------------------------- completed row -- */

function CompletedRow({ run, onViewResults }: { run: HistoryRun; onViewResults: () => void }) {
  const strategy = STRATEGIES.find((s) => s.name === run.strategy)
  const venue = VENUES.find((v) => v.name === run.venue)

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] px-4 py-3"
      style={{ border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <Identity
        glyph={<StrategyGlyph id={strategy?.id ?? ''} />}
        glyphTone="text-mm-ink-6"
        symbol={run.market}
        symbolTone="text-mm-ink-3"
        status={<Status dot="bg-mm-ink-6" tone="text-mm-ink-5" label="Completed" hollow />}
        strategyName={run.strategy}
        venue={venue}
        muted
      />

      <Metric label="Volume" value={usdCompact(run.volume)} muted />
      <Metric label="PnL" value={usdSigned(run.pnl)} muted />
      <Metric label="Ran for" value={run.durationLabel} muted />

      <button
        type="button"
        onClick={onViewResults}
        className="shrink-0 rounded-[10px] border border-white/[0.09] px-3.5 py-2 text-[12px] font-medium text-mm-ink-3 transition-colors hover:bg-white/[0.04] hover:text-mm-ink-1"
      >
        View Results
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- pieces -- */

function Identity({
  glyph,
  glyphTone,
  symbol,
  symbolTone,
  status,
  strategyName,
  venue,
  muted,
}: {
  glyph: ReactNode
  glyphTone: string
  symbol: string
  symbolTone: string
  status: ReactNode
  strategyName?: string
  venue?: { id: string; name: string; tint: string }
  muted?: boolean
}) {
  return (
    <div className="flex min-w-[180px] flex-1 items-center gap-3">
      <span className={cx('shrink-0', glyphTone)}>{glyph}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={cx('mm-mono text-[14px] font-semibold', symbolTone)}>{symbol}</span>
          {status}
        </div>
        <div className={cx('mt-0.5 flex min-w-0 items-center gap-1.5', muted ? 'text-mm-ink-6' : 'text-mm-ink-5')}>
          <span className="truncate text-[11px]">{strategyName}</span>
          {venue && (
            <>
              <span className="text-mm-ink-6">·</span>
              <VenueGlyph
                id={venue.id}
                tint={muted ? '#63646f' : venue.tint}
                className="h-3 w-3 shrink-0"
              />
              <span className="truncate text-[11px]">{venue.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Status({
  dot,
  tone,
  label,
  hollow,
}: {
  dot: string
  tone: string
  label: string
  hollow?: boolean
}) {
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span
        className={cx(
          'h-[6px] w-[6px] rounded-full',
          hollow ? 'border border-mm-ink-6' : dot,
        )}
      />
      <span className={cx('text-[10px] tracking-[0.06em] uppercase', tone)}>{label}</span>
    </span>
  )
}

function Metric({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-[86px]">
      <div className={cx('mm-micro-muted', muted && 'opacity-70')}>{label}</div>
      <div className={cx('mm-num mt-1 text-[13px]', muted ? 'text-mm-ink-4' : 'text-mm-ink-2')}>{value}</div>
    </div>
  )
}
