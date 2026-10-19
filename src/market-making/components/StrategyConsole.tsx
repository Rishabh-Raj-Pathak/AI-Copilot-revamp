import { useState } from 'react'
import { Badge, IconChevron, IconPlus, Segmented, StrategyGlyph, VenueGlyph } from './ui/primitives'
import { cx } from '../lib/cx'
import { STRATEGIES, TOKENS, VENUES, type ActiveAgent } from '../data/mock'
import { pct, usd, usdCompact, usdSigned } from '../lib/format'

type StatusFilter = 'all' | 'running' | 'paused'
type SortKey = 'recent' | 'volume' | 'pnl'

/**
 * Market Making 2 — the strategy console. One row per live strategy, opened in
 * place rather than on its own page, so several can be compared without losing
 * the list. Everything done to a running strategy lives inside its row.
 */
export function StrategyConsole({
  agents,
  onLaunch,
  onEdit,
  onToggleRun,
  onStop,
}: {
  agents: ActiveAgent[]
  onLaunch: () => void
  onEdit: (a: ActiveAgent) => void
  onToggleRun: (a: ActiveAgent) => void
  onStop: (a: ActiveAgent) => void
}) {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [openId, setOpenId] = useState<string | null>(null)

  const running = agents.filter((a) => a.status === 'running').length
  const totals = agents.reduce(
    (acc, a) => ({
      volume: acc.volume + a.volume,
      pnl: acc.pnl + a.pnl,
      fees: acc.fees + a.fees,
    }),
    { volume: 0, pnl: 0, fees: 0 },
  )

  const rows = agents
    .filter((a) => status === 'all' || a.status === status)
    .slice()
    .sort((a, b) => {
      if (sort === 'volume') return b.volume - a.volume
      if (sort === 'pnl') return b.pnl - a.pnl
      return 0
    })

  return (
    <section className="rounded-[16px] border border-white/[0.05] bg-mm-recessed/70 p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-2.5">
          <h3 className="mm-micro">Strategies</h3>
          <Badge tone={agents.length ? 'gold' : 'muted'}>
            {agents.length ? `${running} of ${agents.length} running` : 'None'}
          </Badge>
        </div>
        {agents.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <Total label="Volume" value={usdCompact(totals.volume)} />
            <Total label="PnL" value={usdSigned(totals.pnl)} />
            <Total label="Fees" value={usd(totals.fees)} />
          </div>
        )}
      </header>

      {agents.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Segmented
            size="sm"
            options={[
              { id: 'all', label: 'All' },
              { id: 'running', label: 'Running' },
              { id: 'paused', label: 'Paused' },
            ]}
            value={status}
            onChange={setStatus}
          />
          <div className="flex items-center gap-2.5">
            <span className="mm-micro-muted">Sort</span>
            <Segmented
              size="sm"
              options={[
                { id: 'recent', label: 'Recent' },
                { id: 'volume', label: 'Volume' },
                { id: 'pnl', label: 'PnL' },
              ]}
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((a) => (
          <StrategyRow
            key={a.id}
            agent={a}
            open={openId === a.id}
            onToggleOpen={() => setOpenId(openId === a.id ? null : a.id)}
            onEdit={() => onEdit(a)}
            onToggleRun={() => onToggleRun(a)}
            onStop={() => onStop(a)}
          />
        ))}

        {agents.length === 0 && (
          <p className="px-1 py-3 text-[13px] text-mm-ink-5">
            No strategies running yet. Launch one to start quoting.
          </p>
        )}

        {agents.length > 0 && rows.length === 0 && (
          <p className="px-1 py-3 text-[13px] text-mm-ink-5">No {status} strategies right now.</p>
        )}

        <button
          type="button"
          onClick={onLaunch}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/[0.12] py-3 text-mm-ink-5 transition-colors hover:border-mm-gold-600/50 hover:bg-white/[0.02] hover:text-mm-gold-200"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
            <IconPlus />
          </span>
          <span className="text-[13px] font-medium">Launch strategy</span>
        </button>
      </div>
    </section>
  )
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[12px] text-mm-ink-5">
      {label} <span className="mm-num text-mm-ink-2">{value}</span>
    </span>
  )
}

/* ----------------------------------------------------------------- row -- */

function StrategyRow({
  agent,
  open,
  onToggleOpen,
  onEdit,
  onToggleRun,
  onStop,
}: {
  agent: ActiveAgent
  open: boolean
  onToggleOpen: () => void
  onEdit: () => void
  onToggleRun: () => void
  onStop: () => void
}) {
  const [confirmStop, setConfirmStop] = useState(false)
  const strategy = STRATEGIES.find((s) => s.id === agent.strategyId)
  const venue = VENUES.find((v) => v.id === agent.venueId)
  const token = TOKENS.find((t) => t.symbol === agent.marketSymbol)
  const live = agent.status === 'running'
  const notional = agent.margin * agent.leverage
  const costPerM = agent.volume > 0 ? agent.fees / (agent.volume / 1_000_000) : null
  // Spread taken in, before the venue's fees come out of it
  const captured = agent.pnl + agent.fees

  return (
    <div
      className="rounded-[14px] transition-all"
      style={
        open
          ? {
              border: '1px solid rgba(204,177,127,0.42)',
              backgroundImage: 'linear-gradient(to bottom, #1a140b, #0f0e0c)',
            }
          : {
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0))',
            }
      }
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 px-4 py-3.5">
        <div className="flex min-w-[200px] flex-1 items-center gap-3">
          <span className={cx('shrink-0', live ? 'text-mm-gold-300' : 'text-mm-ink-4')}>
            <StrategyGlyph id={agent.strategyId} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mm-mono text-[14px] font-semibold text-mm-ink-1">
                {agent.marketSymbol}
              </span>
              <span className="mm-num rounded-[6px] border border-white/[0.08] px-1.5 py-px text-[10px] text-mm-ink-4">
                {agent.leverage}x
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span
                  className={cx('h-[6px] w-[6px] rounded-full', live ? 'bg-mm-pos' : 'bg-mm-gold-300')}
                />
                <span
                  className={cx(
                    'text-[10px] tracking-[0.06em] uppercase',
                    live ? 'text-mm-pos' : 'text-mm-gold-300',
                  )}
                >
                  {live ? 'Running' : 'Paused'}
                </span>
              </span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-mm-ink-5">
              <span className="truncate text-[11px]">{strategy?.name}</span>
              {venue && (
                <>
                  <span className="text-mm-ink-6">·</span>
                  <VenueGlyph id={venue.id} tint={venue.tint} className="h-3 w-3 shrink-0" />
                  <span className="truncate text-[11px]">{venue.name}</span>
                </>
              )}
              <span className="text-mm-ink-6">·</span>
              <span className="mm-mono shrink-0 text-[11px]">{agent.runtimeLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Cell label="Volume" value={usdCompact(agent.volume)} />
          <Cell label="PnL" value={usdSigned(agent.pnl)} />
          <Cell label="Fees" value={usd(agent.fees)} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleRun}
            className="rounded-[10px] border border-white/[0.09] px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] text-mm-gold-200 uppercase transition-colors hover:bg-mm-gold-600/15"
            style={{ backgroundImage: 'linear-gradient(to bottom, #1a140b, #0f0e0c)' }}
          >
            {live ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            aria-expanded={open}
            aria-label={open ? 'Hide details' : 'Show details'}
            className="rounded-[10px] border border-white/[0.09] p-2 text-mm-ink-4 transition-colors hover:bg-white/[0.05] hover:text-mm-ink-2"
          >
            <IconChevron className={cx('transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-5">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* What the run has earned, stated the way the rest of the app
                states its numbers: as the equation behind them. */}
            <div>
              <div className="mm-micro-muted mb-3">Capture</div>
              <div className="mm-num text-[26px] leading-none font-semibold text-mm-gold-50">
                {usdSigned(agent.pnl)}
              </div>
              <p className="mm-mono mt-2.5 text-[11px] leading-[18px] text-mm-ink-5">
                spread <span className="text-mm-ink-2">{usd(captured)}</span> − fees{' '}
                <span className="text-mm-ink-2">{usd(agent.fees)}</span>
              </p>
              <p className="mm-mono mt-1 text-[11px] leading-[18px] text-mm-ink-5">
                {costPerM === null ? '—' : usd(costPerM)} per $1M traded ·{' '}
                {usdSigned(agent.unrealizedPnl)} still open
              </p>
            </div>

            {/* How much room is left before something stops the run */}
            <div>
              <div className="mm-micro-muted mb-3">Headroom</div>
              <Gauge
                label="Drawdown"
                caption={`${usd(agent.safetyBuffer)} of ${usd(agent.maxLoss)} left`}
                fill={agent.maxLoss > 0 ? agent.safetyBuffer / agent.maxLoss : 0}
              />
              <Gauge
                label="Volume target"
                caption={
                  agent.targetVolume
                    ? `${usdCompact(agent.volume)} of ${usdCompact(agent.targetVolume)}`
                    : 'runs until you stop it'
                }
                fill={agent.targetVolume ? Math.min(1, agent.volume / agent.targetVolume) : 0}
                muted={!agent.targetVolume}
              />
            </div>
          </div>

          {/* The setup, as one line of facts rather than a column of rows */}
          <p className="mm-mono mt-6 text-[11px] leading-[20px] text-mm-ink-5">
            {usd(agent.margin)} capital · {agent.leverage}x · {usd(notional)} notional ·{' '}
            {agent.marginMode} margin · {token ? `${token.spreadBps.toFixed(2)} bps` : '—'} ·{' '}
            {pct(agent.makerShare * 100, 0)} maker ·{' '}
            {Math.abs(agent.inventoryPct)}% of {agent.inventoryCapPct}% cap · last fill{' '}
            {agent.lastTradeLabel}
          </p>

          {confirmStop ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-mm-neg/25 bg-mm-neg/[0.06] px-3.5 py-3">
              <span className="text-[12px] leading-[18px] text-mm-ink-3">
                Stopping cancels every quote and flattens inventory. This cannot be undone.
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={onStop}
                  className="rounded-[10px] border border-mm-neg/40 bg-mm-neg/10 px-3 py-1.5 text-[12px] font-semibold text-mm-neg transition-colors hover:bg-mm-neg/20"
                >
                  Stop strategy
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStop(false)}
                  className="text-[12px] font-medium text-mm-ink-5 transition-colors hover:text-mm-ink-2"
                >
                  Cancel
                </button>
              </span>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-4">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-[10px] border border-white/[0.09] px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] text-mm-gold-200 uppercase transition-colors hover:bg-mm-gold-600/15"
                style={{ backgroundImage: 'linear-gradient(to bottom, #1a140b, #0f0e0c)' }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmStop(true)}
                className="ml-auto text-[11px] font-medium tracking-[0.06em] text-mm-ink-5 uppercase transition-colors hover:text-mm-neg"
              >
                Stop
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- pieces -- */

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[88px]">
      <div className="mm-micro-muted">{label}</div>
      <div className="mm-num mt-1.5 text-[13px] text-mm-ink-2">{value}</div>
    </div>
  )
}

/** A thin meter for the two limits that can halt a run. */
function Gauge({
  label,
  caption,
  fill,
  muted,
}: {
  label: string
  caption: string
  fill: number
  muted?: boolean
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] text-mm-ink-5">{label}</span>
        <span className="mm-mono text-[11px] text-mm-ink-3">{caption}</span>
      </div>
      <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(1, fill)) * 100}%`,
            backgroundColor: muted ? 'rgba(255,255,255,0.12)' : '#d6b06a',
          }}
        />
      </div>
    </div>
  )
}
