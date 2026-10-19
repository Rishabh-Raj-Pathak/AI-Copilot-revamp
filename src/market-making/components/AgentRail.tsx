import { useState } from 'react'
import { Badge, IconPlus, PAGE_SIZE, Pager, StrategyGlyph, VenueGlyph } from './ui/primitives'
import { cx } from '../lib/cx'
import { STRATEGIES, VENUES, type ActiveAgent } from '../data/mock'
import { usdCompact, usdSigned } from '../lib/format'

/**
 * The live agents, as horizontal rows. Glanceable only — every action on an
 * agent lives behind View Strategy, on its own dashboard.
 */
export function AgentRail({
  agents,
  onViewStrategy,
  onNew,
}: {
  agents: ActiveAgent[]
  onViewStrategy: (a: ActiveAgent) => void
  onNew: () => void
}) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(agents.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const from = safePage * PAGE_SIZE
  const shown = agents.slice(from, from + PAGE_SIZE)

  const live = agents.filter((a) => a.status === 'running').length
  const netPnl = agents.reduce((sum, a) => sum + a.pnl, 0)

  return (
    <section className="rounded-[16px] border border-white/[0.05] bg-mm-recessed/70 p-4 sm:p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="mm-micro">Active Strategy</h3>
          <Badge tone={agents.length ? 'gold' : 'muted'}>
            {agents.length ? `${live} of ${agents.length} running` : 'None'}
          </Badge>
        </div>
        {agents.length > 0 && (
          <span className="text-[12px] text-mm-ink-5">
            net PnL{' '}
            <span className="mm-num text-mm-ink-2">{usdSigned(netPnl)}</span>
          </span>
        )}
      </header>

      <div className="space-y-2">
        {shown.map((a) => (
          <AgentRow key={a.id} agent={a} onViewStrategy={() => onViewStrategy(a)} />
        ))}

        {agents.length === 0 && (
          <p className="px-1 py-3 text-[13px] text-mm-ink-5">
            No strategies running yet. Configure one to get started.
          </p>
        )}

        <Pager
          page={safePage}
          pages={pages}
          total={agents.length}
          rangeLabel={`${agents.length === 0 ? 0 : from + 1}–${from + shown.length} of ${agents.length}`}
          onChange={setPage}
        />

        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/[0.12] py-3 text-mm-ink-5 transition-colors hover:border-mm-gold-600/50 hover:bg-white/[0.02] hover:text-mm-gold-200"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
            <IconPlus />
          </span>
          <span className="text-[13px] font-medium">New strategy</span>
        </button>
      </div>
    </section>
  )
}

function AgentRow({ agent, onViewStrategy }: { agent: ActiveAgent; onViewStrategy: () => void }) {
  const strategy = STRATEGIES.find((s) => s.id === agent.strategyId)
  const venue = VENUES.find((v) => v.id === agent.venueId)
  const running = agent.status === 'running'

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] px-4 py-3 transition-all"
      style={{
        border: '1px solid rgba(255,255,255,0.06)',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0))',
      }}
    >
      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <span className={cx('shrink-0', running ? 'text-mm-gold-300' : 'text-mm-ink-4')}>
          <StrategyGlyph id={agent.strategyId} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="mm-mono text-[14px] font-semibold text-mm-ink-1">{agent.marketSymbol}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                className={cx('h-[6px] w-[6px] rounded-full', running ? 'bg-mm-pos' : 'bg-mm-gold-300')}
              />
              <span
                className={cx(
                  'text-[10px] tracking-[0.06em] uppercase',
                  running ? 'text-mm-pos' : 'text-mm-gold-300',
                )}
              >
                {running ? 'Active' : 'Paused'}
              </span>
            </span>
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-mm-ink-5">
            <span className="truncate text-[11px]">{strategy?.name}</span>
            {venue && (
              <>
                <span className="text-mm-ink-6">·</span>
                <VenueGlyph id={venue.id} tint={venue.tint} className="h-3 w-3 shrink-0" />
                <span className="truncate text-[11px]">{venue.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Three numbers, nothing more */}
      <RowMetric label="Volume" value={usdCompact(agent.volume)} />
      <RowMetric label="PnL" value={usdSigned(agent.pnl)} />
      <RowMetric label="Runtime" value={agent.runtimeLabel} />

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

function RowMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[86px]">
      <div className="mm-micro-muted">{label}</div>
      <div className="mm-num mt-1 text-[13px] text-mm-ink-2">{value}</div>
    </div>
  )
}
