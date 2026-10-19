import { useState } from 'react'
import {
  Badge,
  DerivedLine,
  GoldButton,
  GradientButton,
  CategoryGlyph,
  IconChevron,
  IconCheck,
  IconPlus,
  IconSearch,
  IconWallet,
  MoneyInput,
  Panel,
  SelectCard,
  Section,
  Segmented,
  StrategyGlyph,
  VenueGlyph,
  Toggle,
  WarnBlock,
} from '../components/ui/primitives'
import { cx } from '../lib/cx'
import { Slider } from '../components/ui/Slider'
import { CATEGORIES, STRATEGIES, TOKENS, VENUES, type Category } from '../data/mock'
import {
  blockingReason,
  buyingPower,
  estimateVolume,
  getToken,
  getVenue,
  maxLeverage,
  type Config,
} from '../lib/config'
import { price, shortAddress, usd, usdCompact } from '../lib/format'

type Props = {
  config: Config
  setConfig: (c: Config) => void
  onStart: () => void
}

/**
 * Market Making 1 — the original stacked layout, kept alongside the compact
 * one so the two can be compared side by side from the Agents menu.
 * Every section is a full width band in a single column.
 */
export function ConfigureV1({ config, setConfig, onStart }: Props) {
  const patch = (p: Partial<Config>) => setConfig({ ...config, ...p })
  const venue = getVenue(config)
  const token = getToken(config)
  const maxLev = maxLeverage(config)
  const bp = buyingPower(config)
  const estimate = estimateVolume(config)
  const blocked = blockingReason(config)

  return (
    <>
      <Panel className="space-y-3">
        <VenueSetup config={config} patch={patch} />
        <StrategySection config={config} patch={patch} />
        <MarketSection config={config} patch={patch} />

        <Section
          label="Margin"
          tip="The collateral put to work. Times your leverage, this is the buying power used to size quotes and inventory."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start lg:gap-6">
            <MoneyInput
              ariaLabel="Margin in dollars"
              value={config.margin}
              onChange={(v) => patch({ margin: Math.max(0, v) })}
              max={venue?.balance}
              onMax={venue ? () => patch({ margin: Math.floor(venue.balance) }) : undefined}
            />
            <div className="pt-1">
              <Slider
                ariaLabel="Margin"
                min={0}
                max={venue ? Math.max(100, Math.floor(venue.balance)) : 1000}
                step={5}
                value={config.margin}
                onChange={(v) => patch({ margin: v })}
                disabled={!venue}
                ticks={
                  venue
                    ? [0, 0.25, 0.5, 0.75, 1].map((f) => ({
                        value: Math.floor(venue.balance * f),
                        label: usdCompact(venue.balance * f),
                      }))
                    : undefined
                }
              />
            </div>
          </div>
          <div className="mt-4">
            {!venue ? (
              <DerivedLine>margin · select a venue to read your balance</DerivedLine>
            ) : config.balanceState === 'loading' ? (
              <DerivedLine>margin · balance loading from {venue.name}…</DerivedLine>
            ) : config.balanceState === 'ratelimited' ? (
              <DerivedLine>
                margin ·{' '}
                <span className="text-mm-gold-300">
                  balance unavailable, the venue is rate limiting. Retrying…
                </span>
              </DerivedLine>
            ) : (
              <DerivedLine>
                margin · balance {usd(venue.balance)} · × {config.leverage}x ={' '}
                <span className="text-mm-ink-2">{usd(bp)} buying power</span>
              </DerivedLine>
            )}
          </div>
        </Section>

        <LeverageSection config={config} patch={patch} maxLev={maxLev} bp={bp} />
        <CutOffSection config={config} patch={patch} />
        <DurationSection config={config} patch={patch} />
        <ExpectedVolumeSection estimate={estimate} config={config} />
      </Panel>

      <div className="mt-6">
        <GradientButton disabled={Boolean(blocked)} onClick={onStart}>
          Start Market Making
        </GradientButton>
        {blocked ? (
          <p className="mt-2.5 text-center text-[12px] text-mm-ink-5">{blocked}</p>
        ) : (
          <p className="mt-2.5 text-center text-[12px] text-mm-ink-5">
            {config.strategyId && token && venue
              ? `Quotes ${token.symbol} on ${venue.name} at ${config.leverage}x. Runs on HyprEarn infra, not in this browser.`
              : null}
          </p>
        )}
      </div>
    </>
  )
}

/* --------------------------------------------------------- venue setup -- */

function VenueSetup({ config, patch }: { config: Config; patch: (p: Partial<Config>) => void }) {
  const [open, setOpen] = useState(false)
  const venue = getVenue(config)

  return (
    <Section label="Venue Setup">
      <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.012] p-4">
        <div className="mm-micro-muted mb-3">Select DEX</div>

        {/* One control, one job. The venue dropdown fills the shell on its own,
            the Perp / Spot toggle no longer rides along inside it. */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center gap-3 rounded-[12px] border border-white/[0.08] bg-mm-recessed px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
            style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
          >
            {venue ? (
              <>
                <StatusDot status={venue.status} />
                <VenueGlyph id={venue.id} tint={venue.tint} />
                <span className="truncate text-[15px] font-medium text-mm-ink-1">{venue.name}</span>
              </>
            ) : (
              <span className="text-[15px] text-mm-ink-5">Select DEX</span>
            )}
            <IconChevron
              className={cx('ml-auto shrink-0 text-mm-ink-5 transition-transform', open && 'rotate-180')}
            />
          </button>

          {open && (
            <>
              <button
                type="button"
                aria-label="Close venue list"
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute top-full left-0 z-30 mt-1.5 w-full max-w-[360px] overflow-hidden rounded-[14px] border border-[rgba(204,177,127,0.4)] bg-[#15130f] py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
                {VENUES.map((v) => {
                  const active = v.id === config.venueId
                  const offline = v.status === 'offline'
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={offline}
                      onClick={() => {
                        patch({
                          venueId: v.id,
                          connected: false,
                          leverage: Math.min(config.leverage, v.maxLeverage),
                          marginMode: v.supportsIsolated ? config.marginMode : 'cross',
                        })
                        setOpen(false)
                      }}
                      className={cx(
                        'mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left transition-colors',
                        offline
                          ? 'cursor-not-allowed opacity-40'
                          : active
                            ? 'bg-mm-gold-300/15 ring-1 ring-mm-gold-300/40 ring-inset'
                            : 'hover:bg-white/[0.05]',
                      )}
                    >
                      <StatusDot status={v.status} />
                      <VenueGlyph id={v.id} tint={v.tint} />
                      <span className={cx('text-[15px]', active ? 'text-mm-gold-100' : 'text-mm-ink-2')}>
                        {v.name}
                      </span>
                      {offline && <span className="mm-micro-muted ml-auto">Offline</span>}
                      {active && !offline && (
                        <span className="ml-auto text-mm-gold-100">
                          <IconCheck />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Connect */}
        {venue && !config.connected && (
          <div className="mt-3">
            <GoldButton onClick={() => patch({ connected: true })}>
              <span className="inline-flex items-center gap-1.5">
                <IconPlus />
                Connect DEX
              </span>
            </GoldButton>
            <p className="mt-2.5 text-[12px] text-mm-ink-5">
              Non custodial. HyprEarn quotes from your account and never holds your funds.
            </p>
          </div>
        )}

        {/* Connected. Balance sits beside Deposit and Change wallet on one row,
            inside a single component rather than stacked bars. */}
        {venue && config.connected && (
          <div
            className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[12px] px-4 py-3"
            style={{
              border: '1px solid rgba(74,222,128,0.3)',
              backgroundColor: 'rgba(74,222,128,0.07)',
            }}
          >
            <div className="min-w-0">
              <div className="mm-micro-muted" style={{ color: 'rgba(134,239,172,0.8)' }}>
                Balance
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-mm-pos" />
                <span className="mm-num text-[18px] font-semibold text-[#86efac]">{usd(venue.balance)}</span>
              </div>
              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-mm-ink-4">
                <IconWallet className="shrink-0" />
                <span className="mm-mono truncate text-[12px] text-mm-ink-1">{shortAddress(venue.wallet)}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <GoldButton>Deposit</GoldButton>
              <button
                type="button"
                onClick={() => patch({ connected: false })}
                className="text-[13px] font-medium text-[#f07272] transition-opacity hover:opacity-80"
              >
                Change wallet
              </button>
            </div>
          </div>
        )}

        {!venue && (
          <p className="mt-3 text-[12px] leading-[18px] text-mm-ink-5">
            Pick the venue you want to quote on. Market making runs on one venue at a time.
          </p>
        )}
      </div>
    </Section>
  )
}

/** Green when the venue is reachable, grey when it is not */
function StatusDot({ status }: { status: 'live' | 'offline' }) {
  return (
    <span
      className={cx('h-[7px] w-[7px] shrink-0 rounded-full', status === 'live' ? 'bg-mm-pos' : 'bg-mm-ink-6')}
    />
  )
}


/* ------------------------------------------------------------ strategy -- */

function StrategySection({ config, patch }: { config: Config; patch: (p: Partial<Config>) => void }) {
  return (
    <Section
      label="Strategy"
      tip="How aggressively HyprEarn quotes. This drives your fill rate, your turnover and your cost."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {STRATEGIES.map((s) => {
          const active = s.id === config.strategyId
          return (
            <SelectCard key={s.id} active={active} onClick={() => patch({ strategyId: s.id })}>
              <div className="flex items-start gap-3">
                <span className={cx('mt-0.5', active ? 'text-mm-gold-300' : 'text-mm-ink-4')}>
                  <StrategyGlyph id={s.id} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cx(
                        'text-[14px] font-semibold',
                        active ? 'text-mm-gold-100' : 'text-mm-ink-2',
                      )}
                    >
                      {s.name}
                    </span>
                    {s.badge && <Badge>{s.badge}</Badge>}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-[18px] text-mm-ink-5">{s.line}</p>
                </div>
                {active && (
                  <span className="mt-0.5 text-mm-gold-300">
                    <IconCheck />
                  </span>
                )}
              </div>
            </SelectCard>
          )
        })}
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- market -- */

/** "All Tokens" plus every real category, in the order the dropdown shows them. */
const MARKET_FILTERS: (Category | 'All Tokens')[] = ['All Tokens', ...CATEGORIES.map((c) => c.id)]

function MarketSection({ config, patch }: { config: Config; patch: (p: Partial<Config>) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Category | 'All Tokens'>('All Tokens')

  const selected = getToken(config)
  const q = query.trim().toLowerCase()

  const rows = TOKENS.filter((t) => {
    const inFilter = filter === 'All Tokens' || t.category.includes(filter)
    const matches = q === '' || t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    return inFilter && matches
  })
    .slice()
    .sort((a, b) => b.vol24h - a.vol24h)

  // Closing always clears the search so the list opens whole next time
  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <Section
      label="Market"
      tip="Volume decides your cost. Deeper books fill more often and cost less per million traded."
    >
      <div className="relative" onKeyDown={(e) => e.key === 'Escape' && close()}>
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex w-full items-center gap-3 rounded-[12px] border border-white/[0.08] bg-mm-recessed px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
          style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
        >
          <span className="min-w-0 flex-1">
            {selected ? (
              <span className="mm-mono block truncate text-[15px] font-medium text-mm-ink-1">{selected.symbol}</span>
            ) : (
              <span className="text-[15px] text-mm-ink-5">Select market</span>
            )}
          </span>
          {selected && (
            <span className="mm-num shrink-0 text-[13px] text-mm-ink-3">{price(selected.mark)}</span>
          )}
          <IconChevron
            className={cx('shrink-0 text-mm-ink-5 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <>
            <button
              type="button"
              aria-label="Close market list"
              onClick={close}
              className="fixed inset-0 z-20 cursor-default"
            />
            <div className="absolute top-full left-0 z-30 mt-1.5 w-full overflow-hidden rounded-[14px] border border-[rgba(204,177,127,0.4)] bg-[#15130f] shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
              <div className="p-2.5">
                <div
                  className="flex items-center gap-2 rounded-[10px] border border-[rgba(204,177,127,0.4)] bg-mm-recessed px-3 py-2.5"
                  style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
                >
                  <IconSearch className="shrink-0 text-mm-gold-300/80" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tokens..."
                    aria-label="Search tokens"
                    className="w-full bg-transparent text-[14px] text-mm-ink-1 outline-none placeholder:text-mm-ink-5"
                  />
                </div>
              </div>

              {/* Categories filter the list in place. They are no longer a
                  separate step the operator has to walk through first. */}
              <div className="flex flex-wrap gap-1.5 px-2.5 pb-2.5">
                {MARKET_FILTERS.map((f) => {
                  const active = f === filter
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(f)}
                      className={cx(
                        'inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                        active
                          ? 'border-mm-gold-200/70 bg-mm-gold-300/15 text-mm-gold-50'
                          : 'border-white/[0.07] bg-white/[0.035] text-mm-ink-2 hover:bg-white/[0.07]',
                      )}
                    >
                      {f !== 'All Tokens' && <CategoryGlyph id={f} className="h-3.5 w-3.5 shrink-0" />}
                      {f}
                    </button>
                  )
                })}
              </div>

              <div className="max-h-[268px] overflow-y-auto border-t border-white/[0.06] py-1.5">
                {rows.length === 0 ? (
                  <p className="px-4 py-6 text-center text-[13px] text-mm-ink-5">
                    No markets match that search.
                  </p>
                ) : (
                  rows.map((t) => {
                    const active = t.symbol === config.marketSymbol
                    return (
                      <button
                        key={t.symbol}
                        type="button"
                        onClick={() => {
                          patch({
                            marketSymbol: t.symbol,
                            leverage: Math.min(config.leverage, t.maxLeverage),
                          })
                          close()
                        }}
                        className={cx(
                          'mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left transition-colors',
                          active
                            ? 'bg-mm-gold-300/15 ring-1 ring-mm-gold-300/40 ring-inset'
                            : 'hover:bg-white/[0.05]',
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={cx(
                              'mm-mono block text-[14px] font-medium',
                              active ? 'text-mm-gold-100' : 'text-mm-ink-2',
                            )}
                          >
                            {t.symbol}
                          </span>
                          <span className="block truncate text-[11px] text-mm-ink-5">{t.name}</span>
                        </span>
                        <span className="mm-num shrink-0 text-[12px] text-mm-ink-4">
                          {usdCompact(t.vol24h)}
                        </span>
                        <span className="w-3.5 shrink-0 text-mm-gold-100">
                          {active && <IconCheck />}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Max leverage, mark and volume used to be table columns. Keep them
          readable now that the list lives behind a trigger. */}
      {selected && (
        <div className="mt-3">
          <DerivedLine>
            max {selected.maxLeverage}x · mark {price(selected.mark)} · 24h volume{' '}
            {usdCompact(selected.vol24h)}
          </DerivedLine>
        </div>
      )}
    </Section>
  )
}

/* ------------------------------------------------------------ leverage -- */

function LeverageSection({
  config,
  patch,
  maxLev,
  bp,
}: {
  config: Config
  patch: (p: Partial<Config>) => void
  maxLev: number
  bp: number
}) {
  const venue = getVenue(config)
  // Only call a mode unavailable once we know which venue we are talking about
  const isolatedOff = venue !== null && !venue.supportsIsolated

  return (
    <Section label="Leverage" tip="How hard each quote leans, and the margin mode it trades in.">
      <div className="flex items-baseline gap-3">
        <span className="mm-num text-[30px] leading-none font-semibold text-mm-gold-50">
          {config.leverage}
          <span className="text-[18px] text-mm-gold-300">x</span>
        </span>
        <DerivedLine>
          buying power ≈ {usd(bp)} · margin × leverage · max {maxLev}x
        </DerivedLine>
      </div>
      <div className="mt-4">
        <Slider
          ariaLabel="Leverage"
          min={1}
          max={maxLev}
          step={1}
          value={Math.min(config.leverage, maxLev)}
          onChange={(v) => patch({ leverage: v })}
          ticks={[1, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const v = i === 0 ? 1 : Math.round(maxLev * f)
            return { value: v, label: `${v}x` }
          })}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SelectCard active={config.marginMode === 'cross'} onClick={() => patch({ marginMode: 'cross' })}>
          <div className="flex items-center justify-between">
            <span className={cx('text-[14px] font-semibold', config.marginMode === 'cross' ? 'text-mm-gold-100' : 'text-mm-ink-2')}>
              Cross
            </span>
            {config.marginMode === 'cross' && (
              <span className="text-mm-gold-300">
                <IconCheck />
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[12px] leading-[18px] text-mm-ink-5">
            One shared margin pool. Inventory can lean on the whole balance.
          </p>
        </SelectCard>

        <SelectCard
          active={config.marginMode === 'isolated'}
          disabled={isolatedOff}
          onClick={() => patch({ marginMode: 'isolated' })}
        >
          <div className="flex items-center justify-between">
            <span
              className={cx(
                'text-[14px] font-semibold',
                config.marginMode === 'isolated' ? 'text-mm-gold-100' : 'text-mm-ink-2',
              )}
            >
              Isolated
            </span>
            {isolatedOff && <Badge tone="muted">Unavailable</Badge>}
          </div>
          <p className="mt-1.5 text-[12px] leading-[18px] text-mm-ink-5">
            {isolatedOff && venue?.isolatedNote
              ? venue.isolatedNote
              : 'Margin ring fenced per position. Losses cannot reach the rest of your balance.'}
          </p>
        </SelectCard>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- cutoff -- */

function CutOffSection({ config, patch }: { config: Config; patch: (p: Partial<Config>) => void }) {
  return (
    <Section
      label="Cut-off"
      tip="A hard floor. The bot cancels every quote and flattens inventory the moment equity falls this far below where it started."
      right={
        <Toggle
          id="cutoff-toggle"
          label="Stop and flatten on a drawdown"
          checked={config.cutoffOn}
          onChange={(cutoffOn) => patch({ cutoffOn })}
        />
      }
    >
      {config.cutoffOn ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start lg:gap-6">
            <MoneyInput
              ariaLabel="Cut-off in dollars"
              value={config.cutoff}
              onChange={(v) => patch({ cutoff: Math.max(0, v) })}
            />
            <div className="pt-1">
              <Slider
                ariaLabel="Cut-off"
                min={1}
                max={200}
                step={1}
                value={config.cutoff}
                onChange={(v) => patch({ cutoff: v })}
                ticks={[
                  { value: 1, label: '$1' },
                  { value: 50, label: '$50' },
                  { value: 100, label: '$100' },
                  { value: 150, label: '$150' },
                  { value: 200, label: '$200' },
                ]}
              />
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-[18px] text-mm-ink-4">
            Halts and flattens at this drawdown. {usd(config.cutoff, 0)} below start.
          </p>
        </>
      ) : (
        <WarnBlock>
          No drawdown floor is set. Only the inventory cap and a manual pause protect this run.
        </WarnBlock>
      )}
    </Section>
  )
}

/* ------------------------------------------------------------ duration -- */

function DurationSection({ config, patch }: { config: Config; patch: (p: Partial<Config>) => void }) {
  const isHr = config.durationUnit === 'hr'
  const presets = isHr
    ? [
        { value: 1, label: '1h' },
        { value: 6, label: '6h' },
        { value: 24, label: '1d' },
        { value: 72, label: '3d' },
        { value: 168, label: '7d' },
      ]
    : [
        { value: 5, label: '5m' },
        { value: 15, label: '15m' },
        { value: 30, label: '30m' },
        { value: 45, label: '45m' },
        { value: 60, label: '60m' },
      ]

  return (
    <Section
      label="Duration"
      right={
        <div className="flex items-center gap-3">
          <Toggle
            id="duration-toggle"
            label="Stop automatically after a set time"
            checked={config.durationOn}
            onChange={(durationOn) => patch({ durationOn })}
          />
          <Segmented
            size="sm"
            options={[
              { id: 'min', label: 'Min' },
              { id: 'hr', label: 'Hr' },
            ]}
            value={config.durationUnit}
            onChange={(durationUnit) =>
              patch({ durationUnit, durationValue: durationUnit === 'hr' ? 10 : 30 })
            }
          />
        </div>
      }
    >
      {config.durationOn ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start lg:gap-6">
            <MoneyInput
              ariaLabel="Run length"
              prefix=""
              suffix={isHr ? 'hours' : 'minutes'}
              value={config.durationValue}
              onChange={(v) => patch({ durationValue: Math.max(0, v) })}
            />
            <div className="pt-1">
              <Slider
                ariaLabel="Run length"
                min={presets[0].value}
                max={presets[presets.length - 1].value}
                step={1}
                value={config.durationValue}
                onChange={(v) => patch({ durationValue: v })}
                ticks={presets}
              />
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-[18px] text-mm-ink-4">
            Flattens and stops after this. {config.durationValue} {isHr ? 'hours' : 'minutes'}.
          </p>
        </>
      ) : (
        <p className="text-[12px] leading-[18px] text-mm-ink-4">
          No limit. The run continues until you press Pause.
        </p>
      )}
    </Section>
  )
}

/* ----------------------------------------------------- expected volume -- */

function ExpectedVolumeSection({
  estimate,
  config,
}: {
  estimate: ReturnType<typeof estimateVolume>
  config: Config
}) {
  const [open, setOpen] = useState(false)
  const venue = getVenue(config)

  return (
    <Section
      label="Expected Volume"
      tip="A modelled range, not a promise. Actual volume moves with book depth, volatility and how long your quotes rest."
    >
      {!estimate ? (
        <p className="text-[12px] leading-[18px] text-mm-ink-5">
          Set a strategy, a market and your margin to see an estimate.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="mm-num text-[30px] leading-none font-semibold text-mm-gold-50">
              {usdCompact(estimate.low)} to {usdCompact(estimate.high)}
            </span>
            <Badge tone="muted">Estimate</Badge>
          </div>
          <p className="mt-2.5 text-[12px] leading-[18px] text-mm-ink-5">
            {estimate.perDay
              ? 'Per day, while the run stays active.'
              : `Over the ${config.durationValue} ${config.durationUnit === 'hr' ? 'hour' : 'minute'} run.`}{' '}
            {estimate.feeBps < 0
              ? `Estimated rebate ${usd(Math.abs(estimate.estFeesLow))} to ${usd(Math.abs(estimate.estFeesHigh))}.`
              : `Estimated fees ${usd(estimate.estFeesLow)} to ${usd(estimate.estFeesHigh)}.`}
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-mm-gold-300 transition-colors hover:text-mm-gold-100"
          >
            <IconChevron className={cx('transition-transform', open && 'rotate-180')} />
            {open ? 'Hide inputs' : 'Show the inputs behind this'}
          </button>

          {open && (
            <div className="mt-3 space-y-2 rounded-[12px] border border-white/[0.05] bg-white/[0.012] p-4">
              <BreakdownRow label="Buying power" value={usd(estimate.buyingPower)} note="margin × leverage" />
              <BreakdownRow
                label="Turnover rate"
                value={`${estimate.turnoverPerDay.toFixed(1)}× per day`}
                note="strategy rate, adjusted for book spread"
              />
              <BreakdownRow
                label="Venue fee"
                value={`${estimate.feeBps.toFixed(2)} bps`}
                note={venue ? `${venue.name} blended maker and taker` : ''}
              />
              <div className="mm-rule my-1" />
              <p className="text-[11px] leading-[17px] text-mm-ink-5">
                Range is the midpoint plus or minus 20 percent. Every figure here is an estimate.
              </p>
            </div>
          )}
        </>
      )}
    </Section>
  )
}

function BreakdownRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <div className="text-[13px] text-mm-ink-3">{label}</div>
        {note && <div className="text-[11px] text-mm-ink-6">{note}</div>}
      </div>
      <div className="mm-num text-[13px] font-medium text-mm-ink-1">{value}</div>
    </div>
  )
}
