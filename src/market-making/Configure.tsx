import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import {
  Badge,
  CardSection,
  CategoryGlyph,
  ChoiceToggle,
  ConnectionDot,
  DexLogo,
  Frame,
  GoldButton,
  GradientButton,
  IconCheck,
  IconChevron,
  IconSearch,
  IconWallet,
  MoneyField,
  PICKER,
  PICKER_MENU,
  PICKER_ROW,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Spinner,
  StrategyGlyph,
  Toggle,
  type Tick,
} from './ui'
import {
  EYEBROW_MUTED,
  HIDDEN_CATEGORIES,
  MONO,
  STRATEGY_LINE,
  buyingPower,
  cn,
  cutoffCeiling,
  effectiveCutoff,
  floorCents,
  maxLeverage,
  minMargin,
  roundCents,
  strategyAllowed,
  usd,
  usdCompact,
  usdFine,
  type AgentRow,
  type Config,
  type Market,
  type Overview,
  type Strategy,
  type Venue,
} from './lib'
import type { VenueAccount } from './useVenueAccount'

/*
 * Production's Configure screen (`tV` and the sections under it in the
 * Market Making chunk), section for section.
 */

type Patch = (p: Partial<Config>) => void

export function Configure({
  config,
  onConfigChange,
  overview,
  dex,
  editing,
  isSubmitting,
  submitError,
  onSubmit,
  onCancelEdit,
  marginTouched,
}: {
  config: Config
  onConfigChange: (c: Config) => void
  overview: Overview
  dex: VenueAccount
  editing: AgentRow | null
  isSubmitting: boolean
  submitError: string | null
  onSubmit: () => void
  onCancelEdit: () => void
  marginTouched: RefObject<boolean>
}) {
  const locked = editing !== null
  const patch: Patch = (p) => onConfigChange({ ...config, ...p })
  const venue = overview.venues.find((v) => v.id === config.venueId) ?? null
  const markets = useMemo(
    () => overview.markets.filter((m) => m.venueId === config.venueId),
    [overview.markets, config.venueId],
  )
  const market = markets.find((m) => m.symbol === config.marketSymbol) ?? null
  const strategy = overview.strategies.find((s) => s.id === config.strategyId) ?? null
  const maxLev = maxLeverage(market)
  const estimate = estimateVolume(config, strategy)

  useConfigAutofill({ config, onConfigChange, overview, dex, locked, marginTouched, venue, market })

  const status = venue ? dex.status : 'select-dex'
  const needsConnect = status === 'connect-wallet' || status === 'connect-dex'
  const blocked = blockingReason(config, {
    venue,
    market,
    isConnected: dex.isConnected,
    balance: dex.balance,
    isBalanceLoading: dex.isBalanceLoading,
  })

  let label = 'Select a DEX'
  if (status === 'connect-wallet') label = 'Connect Wallet'
  else if (status === 'connect-dex') label = `Connect ${config.venueId} wallet`
  else if (status === 'ready') label = editing ? 'Save changes' : 'Activate Agent'

  const disabled = status === 'select-dex' || (needsConnect ? dex.isConnecting : !!blocked || isSubmitting)
  const showBlocked = blocked !== null && !needsConnect
  const busy = status === 'ready' && isSubmitting

  return (
    <div>
      {editing && <EditingBanner agent={editing} onCancel={onCancelEdit} />}

      <Frame light="long" className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-2">
          <VenueSetup config={config} venues={overview.venues} markets={overview.markets} dex={dex} locked={locked} onChange={patch} />
          <Lockable locked={locked}>
            <MarketSection config={config} markets={markets} categories={overview.categories} venue={venue} onChange={patch} />
          </Lockable>
        </div>

        <Lockable locked={locked}>
          <StrategySection config={config} strategies={overview.strategies} market={market} onChange={patch} />
        </Lockable>

        <div className="grid gap-3 lg:grid-cols-2">
          <MarginSection
            config={config}
            venue={venue}
            market={market}
            dex={dex}
            onChange={(p) => {
              if (p.margin !== undefined) marginTouched.current = true
              patch(p)
            }}
          />
          <LeverageSection config={config} maxLev={maxLev} modeLocked={locked} onChange={patch} />
        </div>

        <ExpectedVolumeSection estimate={estimate} config={config} />

        <div className="grid gap-3 lg:grid-cols-2">
          <CutOffSection config={config} onChange={patch} />
          <DurationSection config={config} onChange={patch} />
        </div>
      </Frame>

      <div className="mt-6">
        <GradientButton
          disabled={disabled}
          aria-busy={busy || undefined}
          onClick={() => {
            if (needsConnect) {
              dex.connect()
              return
            }
            if (status === 'ready' && !blocked && !isSubmitting) onSubmit()
          }}
        >
          {busy ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner className="h-4 w-4" />
              {editing ? 'Saving…' : 'Activating…'}
            </span>
          ) : (
            label
          )}
        </GradientButton>
        {submitError && (
          <p role="alert" className="mt-2.5 text-center text-[12px] text-[#e9a5a7]">
            {submitError}
          </p>
        )}
        {showBlocked ? (
          <p aria-live="polite" className="mt-2.5 text-center text-[12px] text-[#717182]">
            {blocked}
          </p>
        ) : (
          venue &&
          market &&
          config.strategyId && (
            <p className="mt-2.5 text-center text-[12px] text-[#717182]">
              Quotes {market.symbol} on {venue.id} at {config.leverage}x. Runs on HyprEarn infra, not in this browser.
            </p>
          )
        )}
      </div>
    </div>
  )
}

/**
 * Production's two form effects: fill in what the operator has not picked
 * (the first strategy, Arcus, BTC), and start the margin at 30 percent of the
 * balance once per venue until it is touched. Shared with the phone form.
 */
export function useConfigAutofill({
  config,
  onConfigChange,
  overview,
  dex,
  locked,
  marginTouched,
  venue,
  market,
}: {
  config: Config
  onConfigChange: (c: Config) => void
  overview: Overview
  dex: VenueAccount
  locked: boolean
  marginTouched: RefObject<boolean>
  venue: Venue | null
  market: Market | null
}) {
  // Fill in what the operator has not picked: the first strategy, Arcus, BTC
  useEffect(() => {
    const next = withDefaults(config, overview, { keepStrategy: locked })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) onConfigChange(next)
  }, [config, overview, locked, onConfigChange])

  // Start the margin at 30 percent of the balance, once per venue, until it is touched
  const autoMargin = useRef<{ venueId: string; value: number } | null>(null)
  useEffect(() => {
    if (locked || marginTouched.current || !venue || !market) return
    const ours = autoMargin.current !== null && config.margin === autoMargin.current.value
    if (!dex.isConnected) {
      if (ours) {
        autoMargin.current = null
        onConfigChange({ ...config, margin: 0 })
      }
      return
    }
    if (dex.isBalanceLoading || !(dex.balance > 0) || autoMargin.current?.venueId === venue.id) return
    if (config.margin !== 0 && !ours) return
    const all = floorCents(dex.balance)
    const share = roundCents(dex.balance * 0.3)
    const min = minMargin(market)
    const value = Math.min(all, min <= all ? Math.max(share, min) : share)
    if (value > 0) {
      autoMargin.current = { venueId: venue.id, value }
      onConfigChange({ ...config, margin: value })
    }
  }, [locked, marginTouched, venue, market, config, dex.isConnected, dex.isBalanceLoading, dex.balance, onConfigChange])

}

/** While editing, venue, market and strategy are fixed. */
function Lockable({ locked, children }: { locked: boolean; children: ReactNode }) {
  return (
    <fieldset disabled={locked} className={cn('m-0 min-w-0 border-0 p-0', locked && 'opacity-60')}>
      {children}
    </fieldset>
  )
}

export function withDefaults(c: Config, o: Overview, { keepStrategy }: { keepStrategy: boolean }) {
  let next = c
  if (next.strategyId === null && o.strategies[0]) next = { ...next, strategyId: o.strategies[0].id }
  if (next.venueId === null) {
    const venue = o.venues.find((v) => v.id === 'Arcus') ?? o.venues[0] ?? null
    if (venue) next = { ...next, venueId: venue.id }
  }
  if (next.venueId !== null && next.marketSymbol === null) {
    const here = o.markets.filter((m) => m.venueId === next.venueId)
    const pick =
      here.find((m) => m.symbol.toUpperCase().split(/[-/_]/)[0] === 'BTC') ??
      [...here].sort((a, b) => b.sortWeight - a.sortWeight)[0] ??
      null
    if (pick) next = { ...next, marketSymbol: pick.symbol, leverage: Math.max(1, Math.min(next.leverage, maxLeverage(pick))) }
  }
  if (!keepStrategy && next.venueId !== null && next.marketSymbol !== null) {
    const m = o.markets.find((x) => x.venueId === next.venueId && x.symbol === next.marketSymbol)
    if (m && (next.strategyId === null || !strategyAllowed(m, next.strategyId))) {
      const s = o.strategies.find((x) => strategyAllowed(m, x.id))
      if (s && s.id !== next.strategyId) next = { ...next, strategyId: s.id }
    }
  }
  return next === c ? null : next
}

export function estimateVolume(c: Config, s: Strategy | null) {
  if (!s || c.margin <= 0) return null
  const bp = buyingPower(c)
  const hours = c.durationOn ? (c.durationUnit === 'hr' ? c.durationValue : c.durationValue / 60) : 24
  const mid = s.avgVolumePerUsdPerHour * bp * hours
  if (!Number.isFinite(mid) || mid <= 0) return null
  return {
    low: mid * 0.8,
    high: mid * 1.2,
    perDay: !c.durationOn,
    ratePerUsdPerHour: s.avgVolumePerUsdPerHour,
    margin: c.margin,
    leverage: c.leverage,
    buyingPower: bp,
  }
}

export function blockingReason(
  c: Config,
  t: { venue: Venue | null; market: Market | null; isConnected: boolean; balance: number; isBalanceLoading: boolean },
) {
  if (!t.venue || !c.venueId) return 'Select a venue to continue.'
  if (!t.isConnected) return 'Connect your venue account to continue.'
  if (!c.strategyId) return 'Pick an agent to continue.'
  if (!c.marketSymbol || !t.market) return 'Pick a market to continue.'
  if (!strategyAllowed(t.market, c.strategyId)) return `${t.market.symbol} does not support this strategy on ${c.venueId}. Pick another.`
  if (!Number.isFinite(c.margin) || !(c.margin > 0)) return 'Set the margin you want to deploy.'
  const min = minMargin(t.market)
  if (c.margin < min) return `Minimum margin for ${t.market.symbol} is ${usdFine(min)}.`
  if (t.isBalanceLoading) return `Loading your ${c.venueId} balance.`
  if (c.margin > t.balance) return `Margin is above your ${c.venueId} balance of ${usdFine(t.balance)}.`
  if (!Number.isInteger(c.leverage) || c.leverage < 1) return 'Leverage must be a whole number.'
  const max = maxLeverage(t.market)
  if (c.leverage > max) return `Maximum leverage for ${t.market.symbol} is ${max}x.`
  if (c.cutoffOn) {
    const cut = effectiveCutoff(c)
    if (!Number.isFinite(cut) || cut <= 0) return 'Set a cut-off amount, or switch the cut-off off.'
    if (cut >= c.margin) return 'Cut-off must be below your margin.'
  }
  if (c.durationOn && !(Number.isFinite(c.durationValue) && c.durationValue >= 1))
    return 'Set a run length of at least 1, or switch the timer off.'
  return null
}

function EditingBanner({ agent, onCancel }: { agent: AgentRow; onCancel: () => void }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border border-[rgba(204,177,127,0.35)] bg-[rgba(204,177,127,0.06)] px-4 py-3">
      <span className="text-[13px] text-[#f0ddb9]">
        Editing <span className={cn(MONO, 'font-semibold tabular-nums')}>{agent.marketSymbol}</span> on {agent.venueId}
      </span>
      <span className="text-[12px] text-[#717182]">
        Only margin, leverage, cut-off and duration can change. Changes apply when you save.{' '}
        {agent.status === 'running' ? 'The agent keeps running meanwhile.' : 'It stays paused until you resume it.'}
      </span>
      <button
        type="button"
        onClick={onCancel}
        className="ml-auto shrink-0 text-[12px] font-medium text-[#8f90a1] transition-colors hover:text-[#f5f5f5]"
      >
        Cancel
      </button>
    </div>
  )
}

/** A figure worked out from the inputs above it. */
function Derived({ children }: { children: ReactNode }) {
  return <p className={cn('text-[12px] tabular-nums leading-[18px] text-[#717182]', MONO)}>{children}</p>
}

/* -------------------------------------------------------------- venue -- */

function VenueSetup({
  config,
  venues,
  markets,
  dex,
  locked,
  onChange,
}: {
  config: Config
  venues: Venue[]
  markets: Market[]
  dex: VenueAccount
  locked: boolean
  onChange: Patch
}) {
  const [open, setOpen] = useState(false)
  const venue = venues.find((v) => v.id === config.venueId) ?? null
  const blockedNote = venue ? dex.blockedVenues[venue.id] : undefined
  const connectDisabled = !venue || dex.isConnecting || !!blockedNote

  const pick = (id: string) => {
    const v = venues.find((x) => x.id === id)
    if (!v) return
    const same = markets.find((m) => m.venueId === v.id && m.symbol === config.marketSymbol) ?? null
    onChange({
      venueId: v.id,
      marketSymbol: same?.symbol ?? null,
      leverage: Math.max(1, Math.min(config.leverage, maxLeverage(same))),
    })
    setOpen(false)
  }

  return (
    <CardSection label="Venue Setup">
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" disabled={locked} aria-label="DEX venue" className={PICKER}>
              {venue ? (
                <>
                  <ConnectionDot connected={!!dex.connectedVenues[venue.id]} />
                  <DexLogo dex={venue.id} className="h-[18px] w-[18px] shrink-0 rounded-full" />
                  <span className="truncate text-[15px] font-medium text-[#f5f5f5]">{venue.id}</span>
                </>
              ) : (
                <span className="text-[15px] text-[#717182]">Select DEX</span>
              )}
              <IconChevron className={cn('ml-auto shrink-0 text-[#717182] transition-transform', open && 'rotate-180')} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={6} className={cn(PICKER_MENU, 'py-1.5')}>
            {venues.map((v) => {
              const active = v.id === config.venueId
              const note = dex.blockedVenues[v.id]
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!!note}
                  aria-pressed={active}
                  onClick={() => pick(v.id)}
                  className={cn(
                    PICKER_ROW,
                    note
                      ? 'cursor-not-allowed opacity-40'
                      : active
                        ? 'bg-[rgba(204,177,127,0.15)] ring-1 ring-inset ring-[rgba(204,177,127,0.4)]'
                        : 'hover:bg-white/[0.05]',
                  )}
                >
                  <ConnectionDot connected={!!dex.connectedVenues[v.id]} />
                  <DexLogo dex={v.id} className="h-[18px] w-[18px] shrink-0 rounded-full" />
                  <span className={cn('text-[15px]', active ? 'text-[#f0ddb9]' : 'text-[#d4d4d8]')}>{v.id}</span>
                  {note && (
                    <span className="ml-auto text-[11px] font-medium uppercase leading-4 tracking-[0.09em] text-[#717182]">
                      {note}
                    </span>
                  )}
                  {active && !note && (
                    <span className="ml-auto text-[#f0ddb9]">
                      <IconCheck />
                    </span>
                  )}
                </button>
              )
            })}
          </PopoverContent>
        </Popover>

        {venue && !dex.isConnected && (
          <div className="mt-3">
            <GoldButton disabled={connectDisabled} onClick={dex.connect} className="h-[38px] px-3 py-0 text-[10px]">
              {dex.isConnecting ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#717182]" />
              )}
              {blockedNote ?? 'Connect DEX'}
            </GoldButton>
          </div>
        )}

        {venue && dex.isConnected && (
          <div className="mt-3">
            <div className="flex items-stretch gap-3">
              <div
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-[12px] border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.09)] px-4 py-3"
                aria-live="polite"
              >
                <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.09em] text-[rgba(134,239,172,0.8)]">
                  Balance
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#4ade80]" />
                  {dex.isBalanceLoading ? (
                    <Spinner label="Loading balance" className="h-4 w-4" />
                  ) : (
                    <span className="truncate text-[16px] font-semibold tabular-nums text-[#86efac]">{usdFine(dex.balance)}</span>
                  )}
                </span>
              </div>
              <GoldButton onClick={dex.deposit} className="shrink-0 rounded-[12px] px-5 py-0 text-[12px]">
                Deposit
              </GoldButton>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <div className="flex min-w-0 items-center gap-2 text-[#8f90a1]">
                <IconWallet className="shrink-0" />
                <span className={cn('truncate text-[13px] tabular-nums text-[#f5f5f5]', MONO)} title={dex.walletAddress ?? ''}>
                  {dex.walletAddress ? `${dex.walletAddress.slice(0, 6)}…${dex.walletAddress.slice(-4)}` : ''}
                </span>
              </div>
              {!locked && (
                <button
                  type="button"
                  onClick={dex.changeWallet}
                  disabled={dex.isConnecting}
                  className="shrink-0 text-[13px] font-medium text-[#f07272] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Change wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </CardSection>
  )
}

/* ------------------------------------------------------------- market -- */

const ALL_TOKENS = 'All Tokens'

function MarketSection({
  config,
  markets,
  categories,
  venue,
  onChange,
}: {
  config: Config
  markets: Market[]
  categories: string[]
  venue: Venue | null
  onChange: Patch
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(ALL_TOKENS)

  const selected = markets.find((m) => m.symbol === config.marketSymbol) ?? null
  const q = query.trim().toLowerCase()
  const filters = [
    ALL_TOKENS,
    ...categories.filter((c) => !HIDDEN_CATEGORIES.includes(c.toLowerCase()) && markets.some((m) => m.categories.includes(c))),
  ]
  const active = filters.includes(filter) ? filter : ALL_TOKENS
  const rows = markets
    .filter((m) => {
      const inFilter = active === ALL_TOKENS || m.categories.includes(active)
      const matches = q === '' || m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      return inFilter && matches
    })
    .sort((a, b) => b.sortWeight - a.sortWeight)

  const setOpenAndClear = (v: boolean) => {
    setOpen(v)
    if (!v) setQuery('')
  }
  const pick = (m: Market) => {
    onChange({ marketSymbol: m.symbol, leverage: Math.max(1, Math.min(config.leverage, maxLeverage(m))) })
    setOpenAndClear(false)
  }

  return (
    <CardSection
      label="Market"
      tip="Volume decides your cost. Deeper books fill more often and cost less per million traded."
    >
      <Popover open={open} onOpenChange={setOpenAndClear}>
        <PopoverTrigger asChild>
          <button type="button" disabled={!venue} aria-label="Market token" className={PICKER}>
            <span className="min-w-0 flex-1">
              {selected ? (
                <span className={cn('block truncate text-[15px] font-medium tabular-nums text-[#f5f5f5]', MONO)}>
                  {selected.symbol}
                </span>
              ) : (
                <span className="text-[15px] text-[#717182]">Select Token</span>
              )}
            </span>
            <IconChevron className={cn('shrink-0 text-[#717182] transition-transform', open && 'rotate-180')} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className={PICKER_MENU}>
          <div className="p-2.5">
            <div className="flex items-center gap-2 rounded-[10px] border border-[rgba(204,177,127,0.4)] bg-[#0c0a08] px-3 py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]">
              <IconSearch className="shrink-0 text-[rgba(204,177,127,0.8)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tokens..."
                aria-label="Search tokens"
                className="w-full bg-transparent text-[14px] text-[#f5f5f5] outline-none placeholder:text-[#717182]"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 px-2.5 pb-2.5">
            {filters.map((f) => {
              const on = f === active
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                    on
                      ? 'border-[rgba(232,213,181,0.7)] bg-[rgba(204,177,127,0.15)] text-[#f5ead6]'
                      : 'border-white/[0.07] bg-white/[0.035] text-[#d4d4d8] hover:bg-white/[0.07]',
                  )}
                >
                  {f !== ALL_TOKENS && <CategoryGlyph id={f} className="h-3.5 w-3.5 shrink-0" />}
                  {f}
                </button>
              )
            })}
          </div>
          <div className="max-h-[268px] overflow-y-auto border-t border-white/[0.06] py-1.5">
            {rows.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-[#717182]">No tokens found</p>
            ) : (
              rows.map((m) => {
                const on = m.symbol === config.marketSymbol
                return (
                  <button
                    key={m.symbol}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(m)}
                    className={cn(
                      PICKER_ROW,
                      on ? 'bg-[rgba(204,177,127,0.15)] ring-1 ring-inset ring-[rgba(204,177,127,0.4)]' : 'hover:bg-white/[0.05]',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block text-[14px] font-medium tabular-nums',
                          MONO,
                          on ? 'text-[#f0ddb9]' : 'text-[#d4d4d8]',
                        )}
                      >
                        {m.symbol}
                      </span>
                    </span>
                    <span className="w-3.5 shrink-0 text-[#f0ddb9]">{on && <IconCheck />}</span>
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="mt-2.5 grid grid-cols-2 overflow-hidden rounded-[12px] border border-white/[0.05] bg-white/[0.012]">
        <MicroStat label="Min margin" value={selected ? usdFine(minMargin(selected)) : '—'} />
        <MicroStat label="Max lev" value={selected ? `${maxLeverage(selected)}x` : '—'} />
      </div>
    </CardSection>
  )
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-white/[0.05] px-3 py-2 [&:not(:first-child)]:border-l">
      <div className={cn(EYEBROW_MUTED, 'truncate')}>{label}</div>
      <div className="mt-1 truncate text-[13px] tabular-nums text-[#d4d4d8]">{value}</div>
    </div>
  )
}

/* ----------------------------------------------------------- strategy -- */

function StrategySection({
  config,
  strategies,
  market,
  onChange,
}: {
  config: Config
  strategies: Strategy[]
  market: Market | null
  onChange: Patch
}) {
  return (
    <CardSection label="Strategy" tip="How HyprEarn quotes. This drives your fill rate, your turnover and your cost.">
      <div
        className={cn(
          'grid gap-3',
          strategies.length === 1
            ? 'grid-cols-1'
            : strategies.length === 2
              ? 'sm:grid-cols-2'
              : strategies.length >= 4
                ? 'sm:grid-cols-2 xl:grid-cols-4'
                : 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {strategies.map((s) => {
          const allowed = strategyAllowed(market, s.id)
          const active = s.id === config.strategyId
          return (
            <StrategyCard
              key={s.id}
              active={active}
              disabled={!allowed}
              title={allowed ? undefined : `${market?.symbol} does not support this strategy on ${config.venueId}`}
              onClick={() => onChange({ strategyId: s.id })}
            >
              <div className="flex items-start gap-3">
                <span className={cn('mt-0.5 transition-colors', active ? 'text-[#ccb17f]' : 'text-[#8f90a1] group-hover:text-[#ccb17f]')}>
                  <StrategyGlyph id={s.id} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-[14px] font-semibold transition-colors',
                        active ? 'text-[#f0ddb9]' : 'text-[#d4d4d8] group-hover:text-[#f5f5f5]',
                      )}
                    >
                      {s.name}
                    </span>
                    {s.badge && <Badge tone={active ? 'gold' : 'muted'}>{s.badge}</Badge>}
                  </div>
                  <p className={cn('mt-1.5 text-[12px] leading-[18px]', active ? 'text-[#bfbfbf]' : 'text-[#8f90a1]')}>
                    {STRATEGY_LINE[s.id] ?? 'Quotes both sides of the book and manages inventory.'}
                  </p>
                </div>
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center text-[#ccb17f]">
                  {active ? (
                    <IconCheck />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-white/25 transition-colors group-hover:border-[#ccb17f]" />
                  )}
                </span>
              </div>
            </StrategyCard>
          )
        })}
      </div>
    </CardSection>
  )
}

function StrategyCard({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  title?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group w-full rounded-[14px] border p-4 text-left outline-none transition-colors',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        active
          ? 'border-[rgba(214,176,106,0.62)] focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.4)]'
          : 'border-white/[0.1] bg-[linear-gradient(180deg,rgba(26,25,23,0.98)_0%,rgba(13,12,11,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.24)]',
        !active &&
          !disabled &&
          'hover:border-[rgba(214,176,106,0.4)] hover:bg-[linear-gradient(180deg,rgba(32,30,28,0.98)_0%,rgba(16,15,14,0.98)_100%)]',
      )}
      style={
        active
          ? {
              backgroundImage: 'linear-gradient(180deg, rgba(73,56,31,0.92) 0%, rgba(35,28,19,0.95) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
            }
          : undefined
      }
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------- margin -- */

const QUARTERS = [0, 0.25, 0.5, 0.75, 1]

function MarginSection({
  config,
  venue,
  market,
  dex,
  onChange,
}: {
  config: Config
  venue: Venue | null
  market: Market | null
  dex: VenueAccount
  onChange: Patch
}) {
  const min = minMargin(market)
  const max = floorCents(dex.balance)
  const ticks: Tick[] = QUARTERS.map((f) => {
    const v = f === 1 ? max : Math.floor(max * f)
    return {
      value: v,
      label:
        v >= 1e6
          ? `$${Math.floor(v / 1e5) / 10}M`
          : v >= 1e3
            ? `$${Math.floor(v / 100) / 10}K`
            : Number.isInteger(v)
              ? `$${v}`
              : usdFine(v),
    }
  })
  const note = venue
    ? dex.isConnected
      ? dex.isBalanceLoading
        ? `balance loading from ${venue.id}…`
        : null
      : `connect your ${venue.id} account to read your balance`
    : 'select a venue to read your balance'

  return (
    <CardSection
      label="Margin"
      tip="The more margin your agent has, the bigger each order and the faster your volume grows."
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-start">
        <MoneyField
          ariaLabel="Margin in dollars"
          value={config.margin}
          onChange={(v) => onChange({ margin: Math.max(0, v) })}
          max={max}
          onMax={() => onChange({ margin: max })}
        />
        <div className="pt-1">
          <Slider
            ariaLabel="Margin"
            min={0}
            max={max}
            step={1}
            value={config.margin}
            onChange={(v) => onChange({ margin: v })}
            ticks={ticks}
            format={(v) => usdFine(v)}
          />
        </div>
      </div>
      <div className="mt-3">
        <Derived>
          {note ?? (
            <>
              min {usdFine(min)} · balance {usdFine(dex.balance)} · × {config.leverage}x ={' '}
              <span className="text-[#d4d4d8]">{usdFine(buyingPower(config))} buying power</span>
            </>
          )}
        </Derived>
      </div>
    </CardSection>
  )
}

/* ----------------------------------------------------------- leverage -- */

function LeverageSection({
  config,
  maxLev,
  modeLocked,
  onChange,
}: {
  config: Config
  maxLev: number
  modeLocked: boolean
  onChange: Patch
}) {
  const lev = Math.max(1, Math.min(config.leverage, maxLev))
  const top = Math.max(1, Math.floor(maxLev))
  return (
    <CardSection
      label="Leverage"
      tip="How hard each quote leans. Cross shares one margin pool across inventory; isolated ring fences margin per position so losses cannot reach the rest of your balance."
      right={
        <ChoiceToggle
          size="sm"
          ariaLabel="Margin mode"
          options={[
            { id: 'cross', label: 'Cross', disabled: modeLocked },
            { id: 'isolated', label: 'Isolated', disabled: modeLocked },
          ]}
          value={config.marginMode}
          onChange={(marginMode) => onChange({ marginMode })}
        />
      }
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[26px] font-semibold tabular-nums leading-none text-[#f5ead6]">
          {lev}
          <span className="text-[16px] text-[#ccb17f]">x</span>
        </span>
        <Derived>
          buying power ≈ {usdFine(buyingPower(config))} · max {maxLev}x
        </Derived>
      </div>
      <div className="mt-3">
        <Slider
          ariaLabel="Leverage"
          min={1}
          max={Math.max(1, maxLev)}
          step={1}
          value={lev}
          onChange={(v) => onChange({ leverage: v })}
          ticks={Array.from(new Set(QUARTERS.map((f) => Math.round(1 + (top - 1) * f)))).map((v) => ({ value: v, label: `${v}x` }))}
          format={(v) => `${v}x`}
        />
      </div>
    </CardSection>
  )
}

/* ---------------------------------------------------- expected volume -- */

function ExpectedVolumeSection({ estimate, config }: { estimate: ReturnType<typeof estimateVolume>; config: Config }) {
  const [open, setOpen] = useState(false)
  return (
    <CardSection
      label="Expected Volume"
      tip="A modelled range, not a promise. Actual volume moves with book depth, volatility and how long your quotes rest."
    >
      {estimate ? (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[26px] font-semibold tabular-nums leading-none text-[#f5ead6]">
              {usdCompact(estimate.low)} to {usdCompact(estimate.high)}
            </span>
            <Badge tone="muted">Estimate</Badge>
            <p className="w-full text-[12px] leading-[18px] text-[#717182] sm:w-auto sm:min-w-0 sm:flex-1">
              {estimate.perDay
                ? 'Per day, while the run stays active.'
                : `Over the ${config.durationValue} ${config.durationUnit === 'hr' ? 'hour' : 'minute'} run.`}
            </p>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="expected-volume-inputs"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#ccb17f] transition-colors hover:text-[#f0ddb9]"
            >
              <IconChevron className={cn('transition-transform', open && 'rotate-180')} />
              {open ? 'Hide inputs' : 'Show inputs'}
            </button>
          </div>
          {open && (
            <div
              id="expected-volume-inputs"
              className="mt-3 space-y-2 rounded-[12px] border border-white/[0.05] bg-white/[0.012] p-4"
            >
              <BreakdownRow label="Margin" value={usdFine(estimate.margin)} note="what you deploy" />
              <BreakdownRow label="Leverage" value={`${estimate.leverage}x`} note="your setting" />
              <BreakdownRow label="Buying power" value={usdFine(estimate.buyingPower)} note="margin × leverage" />
              <BreakdownRow
                label="Volume rate"
                value={`${usdFine(estimate.ratePerUsdPerHour)} per hour`}
                note="traded for each $1 of buying power"
              />
              <div className="my-1 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.1),transparent)]" />
              <p className="text-[11px] leading-[17px] text-[#717182]">
                Range is the midpoint plus or minus 20 percent. Every figure here is an estimate.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-[12px] leading-[18px] text-[#717182]">Set a strategy, a market and your margin to see an estimate.</p>
      )}
    </CardSection>
  )
}

function BreakdownRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[13px] text-[#bfbfbf]">{label}</div>
        {note && <div className="text-[11px] text-[#63646f]">{note}</div>}
      </div>
      <div className="shrink-0 whitespace-nowrap text-right text-[13px] font-medium tabular-nums text-[#f5f5f5]">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------ cut-off -- */

function CutOffSection({ config, onChange }: { config: Config; onChange: Patch }) {
  const ceiling = cutoffCeiling(config.margin)
  const cut = effectiveCutoff(config)
  return (
    <CardSection
      label="Cut-off"
      tip="A hard floor. The agent cancels every quote and flattens inventory the moment equity falls this far below where it started."
      right={
        <Toggle id="cutoff-toggle" label="Stop on drawdown" checked={config.cutoffOn} onChange={(cutoffOn) => onChange({ cutoffOn })} />
      }
    >
      {config.cutoffOn ? (
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-start">
            <MoneyField
              ariaLabel="Cut-off in dollars"
              value={cut}
              max={ceiling}
              onChange={(v) => onChange({ cutoff: Math.max(0, v) })}
            />
            <div className="pt-1">
              <Slider
                ariaLabel="Cut-off"
                min={1}
                max={ceiling}
                step={1}
                value={cut}
                onChange={(v) => onChange({ cutoff: v })}
                ticks={Array.from(new Set(QUARTERS.map((f) => Math.round(1 + (ceiling - 1) * f)))).map((v) => ({
                  value: v,
                  label: `$${v}`,
                }))}
                format={(v) => usd(v, 0)}
              />
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-[18px] text-[#8f90a1]">Halts and flattens {usd(cut, 0)} below start.</p>
        </>
      ) : (
        <p className="text-[12px] leading-[18px] text-[#8f90a1]">No custom floor added.</p>
      )}
    </CardSection>
  )
}

/* ----------------------------------------------------------- duration -- */

const DURATION_TICKS: Record<'hr' | 'min', Tick[]> = {
  hr: [
    { value: 1, label: '1h' },
    { value: 24, label: '1d' },
    { value: 72, label: '3d' },
    { value: 120, label: '5d' },
    { value: 168, label: '7d' },
  ],
  min: [
    { value: 5, label: '5m' },
    { value: 15, label: '15m' },
    { value: 30, label: '30m' },
    { value: 45, label: '45m' },
    { value: 60, label: '60m' },
  ],
}
const UNIT_WORD = { hr: 'hours', min: 'minutes' }
const UNIT_DEFAULT = { hr: 10, min: 30 }

function DurationSection({ config, onChange }: { config: Config; onChange: Patch }) {
  const unit = config.durationUnit
  const ticks = DURATION_TICKS[unit]
  return (
    <CardSection
      label="Duration"
      right={
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <Toggle
            id="duration-toggle"
            label="Stop after a set time"
            checked={config.durationOn}
            onChange={(durationOn) => onChange({ durationOn })}
          />
          <ChoiceToggle
            size="sm"
            ariaLabel="Duration unit"
            options={[
              { id: 'min', label: 'Min' },
              { id: 'hr', label: 'Hr' },
            ]}
            value={unit}
            onChange={(u) => {
              if (u !== unit) onChange({ durationUnit: u, durationValue: UNIT_DEFAULT[u] })
            }}
          />
        </div>
      }
    >
      {config.durationOn ? (
        <>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-start">
            <MoneyField
              ariaLabel="Run length"
              prefix=""
              suffix={UNIT_WORD[unit]}
              value={config.durationValue}
              onChange={(v) => onChange({ durationValue: Math.max(0, v) })}
            />
            <div className="pt-1">
              <Slider
                ariaLabel="Run length"
                min={ticks[0].value}
                max={ticks[ticks.length - 1].value}
                step={1}
                value={config.durationValue}
                onChange={(v) => onChange({ durationValue: v })}
                ticks={ticks}
                format={(v) => `${v} ${UNIT_WORD[unit]}`}
              />
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-[18px] text-[#8f90a1]">
            Flattens and stops after {config.durationValue} {UNIT_WORD[unit]}.
          </p>
        </>
      ) : (
        <p className="text-[12px] leading-[18px] text-[#8f90a1]">No limit. The run continues until you press Pause.</p>
      )}
    </CardSection>
  )
}
