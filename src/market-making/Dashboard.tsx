import { Fragment, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Badge,
  Card,
  CardSection,
  ChoiceToggle,
  ConfirmDialog,
  Counter,
  DexLogo,
  Frame,
  GoldButton,
  GradientButton,
  Hairline,
  IconBack,
  IconCheck,
  IconChevron,
  IconClock,
  IconDrawdown,
  IconPause,
  IconPlus,
  IconStop,
  IconWarning,
  PILL_FOR_PHASE,
  QUIET_BUTTON,
  StatTile,
  StatusPill,
  StrategyGlyph,
} from './ui'
import {
  EYEBROW,
  EYEBROW_MUTED,
  MONO,
  PHASE_LABEL,
  PHASE_TONE,
  RUN_BUCKETS,
  ago,
  cn,
  dayTime,
  fullStamp,
  liveSeconds,
  pct,
  price,
  runtime,
  stopLabel,
  strategyName,
  usd,
  usdCompact,
  usdFine,
  usdFineSigned,
  type ActivityEvent,
  type AgentDetail,
  type AgentRow,
  type Phase,
  type Position,
} from './lib'
import type { Pending, Totals } from './useMarketMaking'
import { useNow } from './useVenueAccount'

/*
 * Production's Market Making dashboard: the totals and agent list, one
 * agent's detail, a finished run's results, and the signed-out panel.
 */

export type DashboardView = { kind: 'list' } | { kind: 'strategy'; id: string } | { kind: 'run'; id: string }

export function Dashboard({
  view,
  onViewChange,
  active,
  completed,
  totals,
  detailFor,
  pending,
  onNewStrategy,
  onEditStrategy,
  onToggleRun,
  onDeactivate,
}: {
  view: DashboardView
  onViewChange: (v: DashboardView) => void
  active: AgentRow[]
  completed: AgentRow[]
  totals: Totals
  detailFor: (id: string) => AgentDetail | null
  pending: Pending
  onNewStrategy: () => void
  onEditStrategy: (a: AgentRow) => void
  onToggleRun: (a: AgentRow) => Promise<void>
  onDeactivate: (a: AgentRow) => Promise<void>
}) {
  const back = () => onViewChange({ kind: 'list' })
  const paused = active.filter((a) => a.status === 'paused').length
  const firstTime = active.length === 0 && completed.length === 0

  return (
    <>
      <div hidden={view.kind !== 'list'}>
        {!firstTime && <Totals totals={totals} pausedCount={paused} />}
        <AgentList
          active={active}
          completed={completed}
          totals={totals}
          firstTime={firstTime}
          onNewStrategy={onNewStrategy}
          onViewStrategy={(a) => onViewChange({ kind: 'strategy', id: a.id })}
          onViewResults={(a) => onViewChange({ kind: 'run', id: a.id })}
        />
      </div>
      {view.kind === 'strategy' && (
        <AgentView
          key={view.id}
          detail={detailFor(view.id)}
          pending={pending}
          onBack={back}
          onEdit={onEditStrategy}
          onToggleRun={onToggleRun}
          onDeactivate={async (a) => {
            await onDeactivate(a)
            back()
          }}
        />
      )}
      {view.kind === 'run' && <RunView key={view.id} detail={detailFor(view.id)} onBack={back} />}
    </>
  )
}

/* ------------------------------------------------------------ totals -- */

function Totals({ totals, pausedCount }: { totals: Totals; pausedCount: number }) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatTile title="Total Volume" value={usdCompact(totals.volume)} subtext="Volume generated" />
      <StatTile
        title="Avg CPM"
        value={totals.cpm !== null ? `$${totals.cpm.toFixed(2)}` : '—'}
        subtext="Execution cost"
        tip="Average cost per $1M of volume across all of your runs. Shows a dash until you pass $10k of volume."
      />
      <StatTile
        title="Active Agents"
        value={String(totals.activeCount + pausedCount)}
        subtext={`${totals.activeCount} running · ${pausedCount} paused`}
      />
    </div>
  )
}

/* -------------------------------------------------------------- list -- */

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
] as const
type Filter = (typeof FILTERS)[number]['id']
const PAGE = 10

function AgentList({
  active,
  completed,
  totals,
  firstTime,
  onNewStrategy,
  onViewStrategy,
  onViewResults,
}: {
  active: AgentRow[]
  completed: AgentRow[]
  totals: Totals
  firstTime: boolean
  onNewStrategy: () => void
  onViewStrategy: (a: AgentRow) => void
  onViewResults: (a: AgentRow) => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(0)

  if (firstTime) {
    return (
      <Frame light="long">
        <section className="mx-auto flex max-w-[420px] flex-col items-center px-3 py-12 text-center sm:py-20">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(50,40,28,0.98)_0%,rgba(27,22,16,0.99)_100%)] text-[#ccb17f]">
            <StrategyGlyph id="adaptive" className="h-5 w-5" />
          </span>
          <p className="mt-5 text-[14px] leading-[21px] text-[#8f90a1]">No agents running yet. Launch one to start quoting.</p>
          <div className="mt-7 w-full max-w-[240px]">
            <GradientButton onClick={onNewStrategy}>
              <span className="inline-flex items-center justify-center gap-2">
                <IconPlus />
                New Agent
              </span>
            </GradientButton>
          </div>
        </section>
      </Frame>
    )
  }

  const showActive = filter !== 'completed'
  const showCompleted = filter !== 'active'
  const running = active.filter((a) => a.status === 'running').length
  const rows = [...(showActive ? active : []), ...(showCompleted ? completed : [])]
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const current = Math.min(page, pages - 1)
  const start = current * PAGE
  const shown = rows.slice(start, start + PAGE)
  const isActive = (a: AgentRow) => active.includes(a)

  return (
    <Frame light="long">
      <section className="sm:p-1">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className={EYEBROW}>Agents</h3>
            <Badge tone={active.length > 0 ? 'gold' : 'muted'}>
              {active.length > 0 ? `${running} of ${active.length} running` : 'None'}
            </Badge>
            <span className="text-[12px] text-[#717182]">
              Net PnL <span className="tabular-nums text-[#d4d4d8]">{usdFineSigned(totals.realizedPnl)}</span>
            </span>
          </div>
          <GoldButton onClick={onNewStrategy} className="h-[36px] shrink-0 px-3 py-0">
            <IconPlus />
            New Agent
          </GoldButton>
        </header>

        <div className="mb-3">
          <ChoiceToggle
            size="sm"
            ariaLabel="Filter agents"
            options={[...FILTERS]}
            value={filter}
            onChange={(f) => {
              setFilter(f)
              setPage(0)
            }}
          />
        </div>

        <div className="space-y-2">
          {shown.map((a, i) => (
            <Fragment key={a.id}>
              {(i === 0 || isActive(shown[i - 1]) !== isActive(a)) && (
                <div className={cn('flex items-center gap-3 px-1 pb-1', i === 0 ? 'pt-0' : 'pt-4')}>
                  <span className={cn(EYEBROW_MUTED, 'shrink-0')}>
                    {isActive(a) ? 'Active' : 'Completed'}{' '}
                    <span className="tabular-nums text-[#8f90a1]">{isActive(a) ? active.length : completed.length}</span>
                  </span>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>
              )}
              {isActive(a) ? (
                <ActiveRow agent={a} onView={() => onViewStrategy(a)} />
              ) : (
                <CompletedRow run={a} onView={() => onViewResults(a)} />
              )}
            </Fragment>
          ))}
          {rows.length === 0 && (
            <p className="px-1 py-3 text-[13px] text-[#717182]">
              {filter === 'completed' ? 'No completed runs yet.' : 'No agents running yet. Launch one to start quoting.'}
            </p>
          )}
        </div>

        {rows.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            <span className={EYEBROW_MUTED}>
              {start + 1}–{start + shown.length} of {rows.length}
            </span>
            <div className="flex items-center gap-2">
              <PageStep label="Previous page" back disabled={current <= 0} onClick={() => setPage(Math.max(0, current - 1))} />
              <span className="text-[11px] tabular-nums text-[#8f90a1]">
                {current + 1} / {pages}
              </span>
              <PageStep label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} />
            </div>
          </div>
        )}
      </section>
    </Frame>
  )
}

function PageStep({ label, disabled, onClick, back }: { label: string; disabled: boolean; onClick: () => void; back?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-[8px] border border-white/[0.09] p-1.5 transition-colors',
        disabled ? 'cursor-not-allowed text-[#63646f] opacity-40' : 'text-[#bfbfbf] hover:bg-white/[0.05] hover:text-[#f5f5f5]',
      )}
    >
      <IconChevron className={back ? 'rotate-90' : '-rotate-90'} />
    </button>
  )
}

const ROW_ACTION = 'h-[36px] shrink-0 rounded-[10px] px-3.5 text-[11px]'

function RowCard({ children }: { children: ReactNode }) {
  return <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">{children}</Card>
}

function RowName({
  glyph,
  glyphTone,
  symbol,
  status,
  strategy,
  venueId,
}: {
  glyph: ReactNode
  glyphTone: string
  symbol: string
  status: ReactNode
  strategy: string
  venueId: string
}) {
  return (
    <div className="flex min-w-[180px] flex-1 items-center gap-3">
      <span className={cn('w-4 shrink-0', glyphTone)}>{glyph}</span>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={cn('text-[15px] font-semibold tabular-nums text-[#f5f5f5]', MONO)}>{symbol}</span>
          {status}
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] text-[#717182]">
          <span className="truncate">{strategy}</span>
          <span className="text-[#63646f]">·</span>
          <VenueName venueId={venueId} />
        </div>
      </div>
    </div>
  )
}

function VenueName({ venueId, plain }: { venueId: string; plain?: boolean }) {
  if (plain) return <span>{venueId}</span>
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <DexLogo dex={venueId} className="h-3 w-3 shrink-0" />
      <span className="truncate">{venueId}</span>
    </span>
  )
}

const REASON_ICON: Record<string, ReactNode> = {
  user: <IconStop className="h-3 w-3" />,
  requested: <IconStop className="h-3 w-3" />,
  duration: <IconClock className="h-3 w-3" />,
  'market-hours': <IconClock className="h-3 w-3" />,
  drawdown: <IconDrawdown className="h-3 w-3" />,
  'stop-loss': <IconDrawdown className="h-3 w-3" />,
  'over-budget': <IconDrawdown className="h-3 w-3" />,
  fatal: <IconWarning className="h-3 w-3" />,
  crash_loop: <IconWarning className="h-3 w-3" />,
}
const USER_STOPS = ['user', 'requested']

/** The small status chip beside a row's symbol. */
function RowStatus({ agent }: { agent: AgentRow }) {
  const { icon, label } = rowStatus(agent)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-[3px] text-[11px] font-medium leading-none',
        PHASE_TONE[agent.phase].text,
      )}
    >
      {icon}
      {label}
    </span>
  )
}

function rowStatus(a: AgentRow): { icon: ReactNode; label: string } {
  const reason = stopLabel(a.stopReason)
  switch (a.phase) {
    case 'running':
      return {
        icon: (
          <span className="relative h-[6px] w-[6px]">
            <span className={cn('absolute inset-0 animate-ping rounded-full', PHASE_TONE.running.dot)} />
            <span className={cn('absolute inset-0 rounded-full', PHASE_TONE.running.dot)} />
          </span>
        ),
        label: PHASE_LABEL.running,
      }
    case 'paused':
      return a.stopReason && reason && !USER_STOPS.includes(a.stopReason)
        ? { icon: REASON_ICON[a.stopReason] ?? <IconPause className="h-3 w-3" />, label: reason }
        : { icon: <IconPause className="h-3 w-3" />, label: PHASE_LABEL.paused }
    case 'stopped':
      return a.stopReason && reason
        ? { icon: REASON_ICON[a.stopReason] ?? <IconCheck className="h-3 w-3" />, label: reason }
        : { icon: <IconCheck className="h-3 w-3" />, label: PHASE_LABEL.stopped }
    default:
      return { icon: <span className={cn('h-[6px] w-[6px] rounded-full', PHASE_TONE[a.phase].dot)} />, label: PHASE_LABEL[a.phase] }
  }
}

function RowFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[86px]">
      <div className={EYEBROW_MUTED}>{label}</div>
      <div className="mt-1 text-[13px] tabular-nums text-[#d4d4d8]">{value}</div>
    </div>
  )
}

function ActiveRow({ agent, onView }: { agent: AgentRow; onView: () => void }) {
  const running = agent.phase === 'running'
  const now = useNow(running)
  return (
    <RowCard>
      <RowName
        glyph={<StrategyGlyph id={agent.strategyId} />}
        glyphTone={running ? 'text-[#ccb17f]' : 'text-[#8f90a1]'}
        symbol={agent.marketSymbol}
        status={<RowStatus agent={agent} />}
        strategy={strategyName(agent)}
        venueId={agent.venueId}
      />
      <RowFigure label="Volume" value={usdCompact(agent.volume)} />
      <RowFigure label="PnL" value={usdFineSigned(agent.pnl)} />
      <RowFigure label="Runtime" value={runtime(liveSeconds(agent, now))} />
      <GoldButton onClick={onView} className={cn(ROW_ACTION, 'py-0')}>
        View Agent
      </GoldButton>
    </RowCard>
  )
}

function CompletedRow({ run, onView }: { run: AgentRow; onView: () => void }) {
  return (
    <RowCard>
      <RowName
        glyph={<StrategyGlyph id={run.strategyId} />}
        glyphTone="text-[#717182]"
        symbol={run.marketSymbol}
        status={<RowStatus agent={run} />}
        strategy={strategyName(run)}
        venueId={run.venueId}
      />
      <RowFigure label="Volume" value={usdCompact(run.volume)} />
      <RowFigure label="PnL" value={usdFineSigned(run.pnl)} />
      <RowFigure label="Ran for" value={run.runtimeLabel} />
      <button type="button" onClick={onView} className={cn(QUIET_BUTTON, ROW_ACTION)}>
        View Results
      </button>
    </RowCard>
  )
}

/* ------------------------------------------------------------ detail -- */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(29,27,25,0.98)_0%,rgba(21,20,19,0.98)_100%)] px-4 text-[13px] font-medium text-[#d4d4d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors hover:bg-[linear-gradient(180deg,rgba(34,32,30,0.98)_0%,rgba(24,23,22,0.98)_100%)] hover:text-[#f5f5f5] focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.24)] active:translate-y-px"
    >
      <IconBack />
      Back to Agents
    </button>
  )
}

/** The four headline figures over an agent or a run. */
function DetailTiles({ detail, volumeSubtext }: { detail: AgentDetail; volumeSubtext?: string }) {
  const s = detail.strategy
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile title="Volume Generated" value={usdCompact(s.volume)} subtext={volumeSubtext ?? `Maker ${usdCompact(detail.makerVolume)}`} />
      <StatTile title="Fees Spent" value={usdFine(s.fees)} subtext={`${s.fills} fills`} />
      <StatTile
        title="Realised PnL"
        value={usdFineSigned(s.pnl)}
        subtext={`Spread ${usdFineSigned(detail.spreadPnl)} · Fees ${usdFine(s.fees)}`}
      />
      <StatTile
        title="CPM"
        value={s.cpm === null ? '—' : `$${s.cpm.toFixed(2)}`}
        tone={s.cpm !== null && s.cpm <= 0 ? 'pos' : 'cream'}
        subtext={s.cpm === null ? 'Needs $10k of volume' : `${detail.roundTrips} round trips`}
        tip="Cost per $1M of volume traded. Lower is better, and a negative figure means the run earned more than it cost. CPM only compares meaningfully within one venue."
      />
    </div>
  )
}

function AgentView({
  detail,
  pending,
  onBack,
  onEdit,
  onToggleRun,
  onDeactivate,
}: {
  detail: AgentDetail | null
  pending: Pending
  onBack: () => void
  onEdit: (a: AgentRow) => void
  onToggleRun: (a: AgentRow) => Promise<void>
  onDeactivate: (a: AgentRow) => Promise<void>
}) {
  const live = detail !== null && detail.strategy.phase !== 'stopped'
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <BackButton onClick={onBack} />
      </div>
      {detail && (
        <>
          <DetailTiles detail={detail} />
          <Frame className="space-y-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <EquityCard detail={detail} />
              <StatusCard detail={detail} />
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <PositionsCard positions={detail.positions} />
              <ActivityCard events={detail.activity} phase={detail.strategy.phase} />
            </div>
            <VolumeChart points={detail.volumeSeries} live={detail.strategy.phase === 'running'} />
          </Frame>
          {live && (
            <ManageAgent
              agent={detail.strategy}
              pending={pending}
              onEdit={() => onEdit(detail.strategy)}
              onToggleRun={() => onToggleRun(detail.strategy)}
              onDeactivate={() => onDeactivate(detail.strategy)}
            />
          )}
        </>
      )}
    </>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.07] bg-white/[0.02] px-2 py-1">
      <span className={EYEBROW_MUTED}>{label}</span>
      <span className="text-[12px] font-medium tabular-nums text-[#d4d4d8]">{value}</span>
    </span>
  )
}

function EquityCard({ detail }: { detail: AgentDetail }) {
  const s = detail.strategy
  const [whole, cents] = usdFine(s.margin).split('.')
  return (
    <CardSection label="Starting equity · managed">
      <div className="text-[40px] font-semibold tabular-nums leading-none text-[#f5ead6]">
        {whole}
        <span className="text-[24px] text-[#ccb17f]">.{cents}</span>
      </div>
      <div className={cn('mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] tabular-nums text-[#717182]', MONO)}>
        <span>{strategyName(s)}</span>
        <span>·</span>
        <VenueName venueId={s.venueId} plain />
        <span>·</span>
        <span>{s.marketSymbol}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip label="Cut-off" value={s.cutoff > 0 ? `${usd(s.cutoff, 0)} below start` : 'Default'} />
        <Chip
          label="Auto stop"
          value={
            s.durationOn
              ? s.phase !== 'stopped' && detail.remainingSeconds !== null
                ? runtime(detail.remainingSeconds)
                : `${s.durationValue}${s.durationUnit === 'hr' ? 'h' : 'm'}`
              : 'Off'
          }
        />
        <Chip label="Buying power" value={usd(detail.buyingPower, 0)} />
      </div>
    </CardSection>
  )
}

export function statusLine(s: AgentRow) {
  const m = s.marketSymbol
  switch (s.phase) {
    case 'starting':
      return `Starting up. Quoting on ${m} begins as soon as the agent picks this run up, usually within a minute.`
    case 'running':
      return `Quoting both sides of ${m}, requoting on each book move.`
    case 'offline':
      return `The agent is not reporting in, so quotes on ${m} may be out of date. It reconnects by itself.`
    case 'pausing':
      return `Pausing. Waiting for the agent to confirm your ${m} position is flat.`
    case 'paused':
      return `Paused on ${m}. Resume to start quoting again.`
    case 'stopping':
      return `Stopping. Waiting for the agent to confirm your ${m} position is flat.`
    case 'stopped': {
      const reason = stopLabel(s.stopReason)
      return `Finished${reason ? `. ${reason}` : ''}. Quotes were cancelled and nothing is open against ${m}.`
    }
  }
}

function StatusCard({ detail }: { detail: AgentDetail }) {
  const s = detail.strategy
  return (
    <CardSection label="Strategy status" right={<StatusPill status={PILL_FOR_PHASE[s.phase]} />}>
      <p className="text-[14px] leading-[21px] text-[#d4d4d8]">{statusLine(s)}</p>
      {detail.lastError && s.phase !== 'stopped' && (
        <p className="mt-2 text-[12px] leading-[18px] text-[#e9a5a7]">Error: {detail.lastError}</p>
      )}
      <Hairline />
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Counter label="Leverage" value={`${s.leverage}x`} />
        <Counter label="Max inventory" value={detail.maxInventory === null ? '—' : usd(detail.maxInventory, 0)} />
        <Counter label="Maker share" value={s.makerShare === null ? '—' : pct(100 * s.makerShare, 0)} />
        <Counter label="Round trips" value={String(detail.roundTrips)} />
        <Counter label="Fills" value={String(s.fills)} />
        <Counter label="Quoted volume" value={usdCompact(detail.quotedVolume)} />
      </div>
    </CardSection>
  )
}

function Th({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return <th className={cn(EYEBROW_MUTED, 'px-2 pb-2', align === 'right' ? 'text-right' : 'text-left')}>{children}</th>
}

function Td({ children, align = 'left', className }: { children: ReactNode; align?: 'left' | 'right'; className?: string }) {
  return (
    <td className={cn('px-2 py-3 text-[13px] tabular-nums text-[#bfbfbf]', align === 'right' ? 'text-right' : 'text-left', className)}>
      {children}
    </td>
  )
}

function PositionsCard({ positions }: { positions: Position[] }) {
  const stale = positions.some((p) => p.stale)
  return (
    <CardSection
      label="Open positions"
      right={
        <span className={EYEBROW_MUTED}>
          {positions.length > 0 ? (stale ? 'Last known' : `${positions.length} open`) : 'None open'}
        </span>
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[380px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <Th>Instrument</Th>
              <Th>Side</Th>
              <Th align="right">Size</Th>
              <Th align="right">Value</Th>
              <Th align="right">Mark</Th>
            </tr>
          </thead>
          <tbody>
            {positions.length > 0 ? (
              positions.map((p) => (
                <tr key={p.instrument} className="border-b border-white/[0.04] last:border-0">
                  <Td className={cn(MONO, 'text-[#f5f5f5]')}>{p.instrument}</Td>
                  <Td className={p.side === 'Long' ? 'text-[#4ade80]' : 'text-[#e5484d]'}>{p.side}</Td>
                  <Td align="right">
                    {p.size.toLocaleString('en-US', {
                      maximumFractionDigits: Math.abs(p.size) >= 1e3 ? 2 : Math.abs(p.size) >= 1 ? 4 : 6,
                    })}
                  </Td>
                  <Td align="right">{p.notional === null ? '—' : usdFine(p.notional)}</Td>
                  <Td align="right">{p.mark === null ? '—' : price(p.mark)}</Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-2 py-10 text-center text-[13px] text-[#717182]">
                  Nothing open. Positions appear once quoting starts and a resting order fills.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {stale && (
        <p className="mt-2 text-[11px] leading-[17px] text-[#717182]">The agent is offline, so this position may have changed.</p>
      )}
    </CardSection>
  )
}

const EVENT_DOT = { fill: 'bg-[#4ade80]', guard: 'bg-[#e5484d]', system: 'bg-[#63646f]' }

function EventTime({ at }: { at: Date }) {
  const now = useNow(Date.now() - at.getTime() < 3_600_000)
  const stamp = fullStamp(at)
  return (
    <p title={stamp} className={cn('mt-0.5 w-fit text-[11px] tabular-nums text-[#717182]', MONO)}>
      {relative(at, now) ?? stamp}
    </p>
  )
}

function relative(at: Date, now: number) {
  const s = Math.max(1, Math.floor((now - at.getTime()) / 1000))
  if (s < 60) return ago(s, 'sec')
  const m = Math.floor(s / 60)
  if (m < 60) return ago(m, 'min')
  const h = Math.floor(m / 60)
  if (h < 24) return ago(h, 'hour')
  const d = Math.floor(h / 24)
  return d <= 2 ? ago(d, 'day') : null
}

function ActivityCard({ events, phase, tall }: { events: ActivityEvent[]; phase: Phase; tall?: boolean }) {
  return (
    <CardSection label="Activity" right={<StatusPill status={PILL_FOR_PHASE[phase]} />}>
      <div className={cn('overflow-y-auto pr-1 scrollbar-hide', tall ? 'max-h-[420px] space-y-4' : 'max-h-[248px] space-y-3.5')}>
        {events.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[#717182]">
            {phase === 'stopped'
              ? 'No activity to show.'
              : 'No activity yet. Fills and status changes print here once the run starts.'}
          </p>
        ) : (
          events.map((e) => (
            <div key={e.id} className="flex gap-3">
              <span className={cn('mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full', EVENT_DOT[e.kind])} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-[20px] text-[#d4d4d8]">{e.text}</p>
                <EventTime at={e.at} />
              </div>
            </div>
          ))
        )}
      </div>
    </CardSection>
  )
}

/* ------------------------------------------------------------- chart -- */

const TIME_STEPS = [1, 5, 15, 30, 60, 120, 180, 360, 720]
const W = 600
const H = 150
const clock = (t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const tickLabel = (t: number, long: boolean) =>
  long ? `${new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${clock(t)}` : clock(t)

export function niceScale(max: number) {
  const raw = Math.max(max, 1) / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag
  const hi = Math.max(Math.ceil(max / step) * step, step)
  const ticks: number[] = []
  for (let v = 0; v <= hi + step / 2; v += step) ticks.push(v)
  return { hi, ticks }
}

function VolumeChart({
  points,
  live,
  scope = 'hour',
  status = 'ready',
}: {
  points: { t: number; v: number }[]
  live?: boolean
  scope?: 'hour' | 'run'
  status?: 'ready' | 'loading' | 'unavailable'
}) {
  const [hover, setHover] = useState<number | null>(null)
  const plot = useRef<HTMLDivElement>(null)
  const gradient = useId()
  const values = points.map((p) => p.v)
  const has = points.length >= 2 && Math.max(...values) > 0
  const { hi, ticks } = niceScale(has ? Math.max(...values) : 1)
  const t0 = has ? points[0].t : 0
  const t1 = has ? points[points.length - 1].t : 1
  const timeTicks = useMemo(() => {
    if (!has) return []
    const minutes = (t1 - t0) / 60_000
    const step = (TIME_STEPS.find((m) => minutes / m <= 5) ?? 1440) * 60_000
    const out: number[] = []
    for (let t = Math.ceil(t0 / step) * step; t <= t1; t += step) out.push(t)
    return out
  }, [has, t0, t1])
  const long = t1 - t0 > 86_400_000
  const x = (t: number) => ((t - t0) / (t1 - t0 || 1)) * 100
  const xi = (i: number) => x(points[i].t)
  const y = (v: number) => (1 - v / hi) * 100
  const line = has ? points.map((p, i) => `${i ? 'L' : 'M'}${(x(p.t) / 100) * W},${(y(p.v) / 100) * H}`).join(' ') : ''
  const area = has ? `${line} L${W},${H} L0,${H} Z` : ''
  const hovered = hover !== null && has ? points[hover] : null
  const last = has ? points[points.length - 1] : null

  return (
    <CardSection
      label={scope === 'run' ? 'Volume traded · whole run' : live ? 'Volume traded · last hour · live' : 'Volume traded · last hour'}
      right={<span className="text-[13px] tabular-nums text-[#bfbfbf]">{has ? `${usdCompact(last?.v ?? 0)} total` : '—'}</span>}
    >
      {has ? (
        <>
          <div className="relative h-[240px] lg:h-[320px]">
            <div className="absolute bottom-[22px] left-0 top-0 w-[52px]">
              {ticks.map((v) => (
                <span
                  key={v}
                  className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-[#63646f]"
                  style={{ top: `${y(v)}%` }}
                >
                  {usdCompact(v)}
                </span>
              ))}
            </div>
            <div
              ref={plot}
              className="absolute bottom-[22px] left-[52px] right-0 top-0 cursor-crosshair"
              onMouseMove={(e) => {
                const r = plot.current?.getBoundingClientRect()
                if (!r) return
                const t = t0 + ((e.clientX - r.left) / r.width) * (t1 - t0)
                let best = 0
                points.forEach((p, i) => {
                  if (Math.abs(p.t - t) < Math.abs(points[best].t - t)) best = i
                })
                setHover(best)
              }}
              onMouseLeave={() => setHover(null)}
            >
              {ticks.map((v) => (
                <div key={v} className="pointer-events-none absolute inset-x-0 h-px bg-white/[0.05]" style={{ top: `${y(v)}%` }} />
              ))}
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d6b06a" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#d6b06a" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill={`url(#${gradient})`} />
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
              {last && (
                <div
                  className="pointer-events-none absolute left-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b06a] shadow-[0_0_0_3px_rgba(214,176,106,0.22)]"
                  style={{ top: `${y(last.v)}%` }}
                />
              )}
              {hovered && hover !== null && (
                <>
                  <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-white/15" style={{ left: `${xi(hover)}%` }} />
                  <div
                    className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b06a]"
                    style={{ left: `${xi(hover)}%`, top: `${y(hovered.v)}%` }}
                  />
                  <div
                    className={cn(
                      'pointer-events-none absolute whitespace-nowrap rounded-[8px] border border-white/10 bg-[#242424] px-2.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.6)]',
                      xi(hover) < 8 ? '' : xi(hover) > 92 ? '-translate-x-full' : '-translate-x-1/2',
                    )}
                    style={{ left: `${xi(hover)}%`, bottom: `calc(${100 - y(hovered.v)}% + 10px)` }}
                  >
                    <div className="text-[12px] tabular-nums text-[#f5f5f5]">{usdCompact(hovered.v)}</div>
                    <div className={cn('text-[10px] tabular-nums text-[#717182]', MONO)}>
                      {long
                        ? fullStamp(new Date(hovered.t))
                        : new Date(hovered.t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="absolute bottom-0 left-[52px] right-0 h-[18px]">
              {timeTicks.map((t) => {
                const at = x(t)
                return (
                  <span
                    key={t}
                    className={cn(
                      'absolute text-[10px] tabular-nums text-[#63646f]',
                      MONO,
                      at < 5 ? '' : at > 95 ? '-translate-x-full' : '-translate-x-1/2',
                    )}
                    style={{ left: `${at}%` }}
                  >
                    {tickLabel(t, long)}
                  </span>
                )
              })}
            </div>
          </div>
          <div className={cn(EYEBROW_MUTED, 'mt-1')}>
            {scope === 'run' ? 'Cumulative volume from the fills, start to finish' : 'Cumulative volume at each 5 minute mark'}
          </div>
        </>
      ) : (
        <p className="text-[13px] text-[#717182]">
          {status === 'loading'
            ? 'Building the chart from this run’s fills…'
            : status === 'unavailable'
              ? 'Not every fill could be loaded, so this run is not charted.'
              : scope === 'run'
                ? 'No volume was traded in this run.'
                : 'No volume in the last hour. Traded volume plots here once the agent starts filling.'}
        </p>
      )}
    </CardSection>
  )
}

/* ------------------------------------------------------------ manage -- */

const MANAGE_BUTTON = 'h-[38px] px-4 py-0'

function ManageAgent({
  agent,
  pending,
  onEdit,
  onToggleRun,
  onDeactivate,
}: {
  agent: AgentRow
  pending: Pending
  onEdit: () => void
  onToggleRun: () => Promise<void>
  onDeactivate: () => Promise<void>
}) {
  const [confirm, setConfirm] = useState<'pause' | 'deactivate' | null>(null)
  const running = agent.status === 'running'
  const busy = pending !== null || agent.phase === 'stopping' || agent.phase === 'pausing'
  const toggleLabel = running
    ? pending === 'pause'
      ? 'Pausing…'
      : 'Pause'
    : agent.phase === 'pausing'
      ? 'Pausing…'
      : pending === 'resume'
        ? 'Resuming…'
        : 'Resume'
  const go = async () => {
    await (confirm === 'pause' ? onToggleRun() : onDeactivate())
    setConfirm(null)
  }

  return (
    <Frame className="mt-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:px-1">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[#f0ddb9]">Manage Agent</div>
          <p className="mt-1 text-[12px] leading-[18px] text-[#717182]">
            {running
              ? `Quoting ${agent.marketSymbol} now. Pause holds inventory flat without closing the run.`
              : `Paused on ${agent.marketSymbol}. Resume to start quoting again.`}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          <GoldButton onClick={onEdit} disabled={busy} className={MANAGE_BUTTON}>
            Edit
          </GoldButton>
          <GoldButton
            onClick={() => {
              if (running) {
                setConfirm('pause')
                return
              }
              void onToggleRun()
            }}
            disabled={busy}
            className={MANAGE_BUTTON}
          >
            {toggleLabel}
          </GoldButton>
          <button
            type="button"
            onClick={() => setConfirm('deactivate')}
            disabled={busy}
            className="h-[38px] rounded-[10px] px-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-[#717182] transition-colors hover:text-[#e5484d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#717182]"
          >
            Deactivate
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !busy && !open && setConfirm(null)}
        title={confirm === 'pause' ? 'Pause this agent?' : 'Deactivate this agent?'}
        description={
          confirm === 'pause'
            ? 'Your agent will stop placing new orders and close any open positions.'
            : `Deactivating stops quoting on ${agent.marketSymbol} and flattens inventory. This cannot be undone, and the run moves to your completed agents.`
        }
      >
        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => setConfirm(null)}
            disabled={busy}
            className="text-[12px] font-medium text-[#717182] transition-colors hover:text-[#d4d4d8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          {confirm === 'pause' ? (
            <GoldButton onClick={go} disabled={busy} className={MANAGE_BUTTON}>
              {pending === 'pause' ? 'Pausing…' : 'Pause'}
            </GoldButton>
          ) : (
            <button
              type="button"
              onClick={go}
              disabled={busy}
              className="rounded-[10px] border border-[rgba(229,72,77,0.4)] bg-[rgba(229,72,77,0.1)] px-3.5 py-2 text-[12px] font-semibold text-[#e5484d] transition-colors hover:bg-[rgba(229,72,77,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending === 'deactivate' ? 'Deactivating…' : 'Deactivate'}
            </button>
          )}
        </div>
      </ConfirmDialog>
    </Frame>
  )
}

/* --------------------------------------------------------------- run -- */

/** Cumulative traded volume across a finished run, bucketed from its fills. */
export function runSeries(run: AgentRow, activity: ActivityEvent[]) {
  const fills = activity
    .filter((e) => e.fill !== undefined)
    .map((e) => ({ t: e.at.getTime(), notional: e.fill?.notional ?? 0 }))
    .filter((f) => Number.isFinite(f.t) && Number.isFinite(f.notional))
    .sort((a, b) => a.t - b.t)
  if (fills.length === 0) return []
  const startAt = Date.parse(run.activatedAt ?? run.createdAt)
  const endAt = run.deactivatedAt ? Date.parse(run.deactivatedAt) : NaN
  const from = Math.min(Number.isFinite(startAt) ? startAt : fills[0].t, fills[0].t)
  const to = Math.max(Number.isFinite(endAt) ? endAt : 0, fills[fills.length - 1].t, from + 1000)
  const span = to - from
  const bucket = RUN_BUCKETS.find((s) => span / (1000 * s) <= 60) ?? RUN_BUCKETS[RUN_BUCKETS.length - 1]
  const steps = Math.max(2, Math.ceil(span / (1000 * bucket)))
  const each = span / steps
  const out: { t: number; v: number }[] = []
  let total = 0
  let i = 0
  for (let s = 0; s <= steps; s += 1) {
    const t = s === steps ? to : from + s * each
    while (i < fills.length && fills[i].t <= t) {
      total += fills[i].notional
      i += 1
    }
    out.push({ t, v: total })
  }
  return out
}

function RunView({ detail, onBack }: { detail: AgentDetail | null; onBack: () => void }) {
  const series = useMemo(() => (detail ? runSeries(detail.strategy, detail.activity) : []), [detail])
  if (!detail) {
    return (
      <div>
        <BackButton onClick={onBack} />
      </div>
    )
  }
  const s = detail.strategy
  const reason = stopLabel(s.stopReason)
  return (
    <>
      <div>
        <BackButton onClick={onBack} />
      </div>
      <DetailTiles detail={detail} volumeSubtext="Across the whole run" />
      <Frame className="space-y-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <CardSection label="Run details">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Counter label="Strategy" value={strategyName(s)} />
              <Counter label="Venue" value={s.venueId} />
              <Counter label="Market" value={s.marketSymbol} />
            </div>
            <Hairline />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Counter label="Started" value={dayTime(s.activatedAt ?? s.createdAt)} />
              <Counter label="Ended" value={dayTime(s.deactivatedAt)} />
              <Counter label="Ran for" value={s.runtimeLabel} />
            </div>
          </CardSection>
          <CardSection label="Strategy status" right={<StatusPill status="Ended" />}>
            <p className="text-[14px] leading-[21px] text-[#d4d4d8]">
              {reason ? `${reason}. ` : ''}Quotes were cancelled and inventory flattened, so nothing is open against {s.marketSymbol}.
            </p>
            <Hairline />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <Counter label="Margin" value={usd(s.margin, 0)} />
              <Counter label="Leverage" value={`${s.leverage}x`} />
              <Counter label="Maker share" value={s.makerShare === null ? '—' : pct(100 * s.makerShare, 0)} />
              <Counter label="Fills" value={String(s.fills)} />
            </div>
          </CardSection>
        </div>
        <ActivityCard events={detail.activity} phase={s.phase} tall />
        <VolumeChart points={series} scope="run" />
      </Frame>
    </>
  )
}

/* ------------------------------------------------------------- login -- */

export function SignedOut({ onLogin }: { onLogin: () => void }) {
  return (
    <Frame light="long">
      <section className="mx-auto flex max-w-[420px] flex-col items-center px-3 py-12 text-center sm:py-20">
        <h3 className="text-[20px] font-semibold leading-[28px] text-[#f5f5f5]">Log in to view your agents</h3>
        <p className="mt-2 text-[14px] leading-[21px] text-[#8f90a1]">
          Connect your wallet to see your running agents, their results and the details of each run.
        </p>
        <div className="mt-7 w-full max-w-[240px]">
          <GradientButton onClick={onLogin}>Log in</GradientButton>
        </div>
      </section>
    </Frame>
  )
}
