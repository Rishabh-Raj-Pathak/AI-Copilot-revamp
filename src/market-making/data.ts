import {
  price,
  usdFine,
  type ActivityEvent,
  type AgentDetail,
  type AgentRow,
  type Market,
  type Overview,
  type Phase,
  type StopReason,
} from './lib'

/*
 * Mock data in the shapes production's API mappers produce (the overview
 * from /web/trade/mm/config, rows from /user-dashboard, a detail from
 * /user-dashboard/strategy/:id). Nothing here calls out.
 */

/** Venues the agent quotes on. Production opens on Arcus when it is listed. */
const VENUES = ['Arcus', 'Hyperliquid', 'Decibel', 'zkLighter', 'Lighter@Robinhood', 'Pacifica']

type Listing = [symbol: string, name: string, categories: string[], minMargin: number, maxLeverage: number, sortWeight: number]

const LISTINGS: Listing[] = [
  ['BTC', 'Bitcoin', ['Top Picks', 'Bluechip'], 25, 40, 100],
  ['ETH', 'Ethereum', ['Top Picks', 'Bluechip'], 25, 25, 95],
  ['SOL', 'Solana', ['Top Picks', 'Bluechip'], 20, 20, 90],
  ['HYPE', 'Hyperliquid', ['Top Picks'], 20, 10, 85],
  ['XRP', 'XRP', ['Bluechip'], 15, 20, 70],
  ['DOGE', 'Dogecoin', ['Meme'], 10, 10, 60],
  ['FARTCOIN', 'Fartcoin', ['Meme'], 10, 5, 40],
  ['GOLD', 'Gold', ['Commodities'], 20, 10, 50],
  ['TSLA', 'Tesla', ['Stocks'], 20, 10, 55],
  ['NVDA', 'Nvidia', ['Stocks'], 20, 10, 54],
  ['EUR', 'Euro', ['FX'], 20, 20, 30],
]

/** Which listings each venue carries. Stocks, gold and FX are not everywhere. */
const CARRIED: Record<string, string[]> = {
  Arcus: ['BTC', 'ETH', 'SOL', 'HYPE', 'XRP', 'DOGE', 'GOLD', 'TSLA', 'NVDA', 'EUR'],
  Hyperliquid: ['BTC', 'ETH', 'SOL', 'HYPE', 'XRP', 'DOGE', 'FARTCOIN', 'GOLD', 'TSLA', 'NVDA'],
  Decibel: ['BTC', 'ETH', 'SOL', 'XRP'],
  zkLighter: ['BTC', 'ETH', 'SOL', 'HYPE', 'DOGE', 'FARTCOIN'],
  'Lighter@Robinhood': ['TSLA', 'NVDA', 'GOLD', 'BTC'],
  Pacifica: ['BTC', 'ETH', 'SOL', 'HYPE', 'FARTCOIN'],
}

const MARKETS: Market[] = VENUES.flatMap((venueId) =>
  LISTINGS.filter(([symbol]) => CARRIED[venueId].includes(symbol)).map(
    ([symbol, name, categories, minMargin, maxLeverage, sortWeight]) => ({
      venueId,
      symbol,
      name,
      categories,
      minMargin,
      maxLeverage,
      sortWeight,
      // Thin books take the dynamic strategy only
      allowedStrategies: symbol === 'FARTCOIN' ? ['dynamic'] : null,
    }),
  ),
)

export const OVERVIEW: Overview = {
  venues: VENUES.map((id) => ({ id })),
  markets: MARKETS,
  categories: ['default', 'Top Picks', 'Bluechip', 'Stocks', 'Commodities', 'Meme', 'FX'],
  strategies: [
    { id: 'dynamic', name: 'Dynamic', badge: 'Recommended', avgVolumePerUsdPerHour: 2.4 },
    { id: 'volume', name: 'Volume', badge: 'Higher turnover', avgVolumePerUsdPerHour: 5.8 },
  ],
}

/** Each venue account, as the connect flow finds it. */
export const VENUE_ACCOUNTS: Record<string, { wallet: string; balance: number; onboarded: boolean }> = {
  Arcus: { wallet: '0x3cc4a1f0b27e9d415c6a8b2e0f7d93c1a5e4d768', balance: 2480.35, onboarded: true },
  Hyperliquid: { wallet: '0x7a3f9c21d4e8b05f6a1c3e7b9d2f4a6c8e0b9f2e', balance: 1250, onboarded: true },
  Decibel: { wallet: '0x92bc4e1a7f3d5b8c0e2a6f9d1b4c7e3a5f8dd7f1', balance: 640.12, onboarded: false },
  zkLighter: { wallet: '0x4d5e8a2c6f1b9e3d7a0c5f2b8e4d1a9c6f3e7c14', balance: 315.5, onboarded: false },
  'Lighter@Robinhood': { wallet: '0x4d5e8a2c6f1b9e3d7a0c5f2b8e4d1a9c6f3ec3a6', balance: 512.8, onboarded: false },
  Pacifica: { wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', balance: 980, onboarded: false },
}

/* ------------------------------------------------------------ agents -- */

const HOUR = 3600
const MID: Record<string, number> = {
  BTC: 91240.5,
  ETH: 3612.84,
  SOL: 182.36,
  HYPE: 41.27,
  XRP: 2.4188,
  DOGE: 0.38214,
  FARTCOIN: 1.0832,
  GOLD: 2688.4,
  TSLA: 412.66,
  NVDA: 141.92,
  EUR: 1.0842,
}

type Seed = {
  id: string
  strategyId: 'dynamic' | 'volume'
  venueId: string
  marketSymbol: string
  margin: number
  leverage: number
  phase: Phase
  stopReason?: StopReason
  activeSeconds: number
  /** How long ago it started, in seconds. */
  startedAgo: number
  volume: number
  pnl: number
  makerShare: number
  cutoff?: number
  durationMinutes?: number
}

const ACTIVE: Seed[] = [
  { id: 'mm-201', strategyId: 'volume', venueId: 'Hyperliquid', marketSymbol: 'BTC', margin: 500, leverage: 10, phase: 'running', activeSeconds: 8048, startedAgo: 8060, volume: 184210, pnl: 3.42, makerShare: 0.91, cutoff: 25 },
  { id: 'mm-202', strategyId: 'dynamic', venueId: 'Arcus', marketSymbol: 'ETH', margin: 300, leverage: 8, phase: 'paused', activeSeconds: 20400, startedAgo: 26100, volume: 96320, pnl: 1.18, makerShare: 0.94 },
  { id: 'mm-203', strategyId: 'volume', venueId: 'zkLighter', marketSymbol: 'SOL', margin: 250, leverage: 12, phase: 'paused', stopReason: 'drawdown', activeSeconds: 11100, startedAgo: 14800, volume: 61840, pnl: -25, makerShare: 0.88, cutoff: 25 },
]

const COMPLETED: Seed[] = [
  { id: 'mm-190', strategyId: 'volume', venueId: 'Decibel', marketSymbol: 'BTC', margin: 7, leverage: 4, phase: 'stopped', stopReason: 'duration', activeSeconds: 187, startedAgo: 13 * 86400, volume: 7.2, pnl: -0.0028, makerShare: 0.5, durationMinutes: 3 },
  { id: 'mm-189', strategyId: 'dynamic', venueId: 'Lighter@Robinhood', marketSymbol: 'NVDA', margin: 200, leverage: 5, phase: 'stopped', stopReason: 'market-hours', activeSeconds: 23400, startedAgo: 14 * 86400, volume: 48210, pnl: 6.14, makerShare: 0.96 },
  { id: 'mm-188', strategyId: 'volume', venueId: 'Hyperliquid', marketSymbol: 'HYPE', margin: 400, leverage: 6, phase: 'stopped', stopReason: 'user', activeSeconds: 41200, startedAgo: 15 * 86400, volume: 212480, pnl: -8.92, makerShare: 0.87 },
  { id: 'mm-187', strategyId: 'dynamic', venueId: 'Arcus', marketSymbol: 'BTC', margin: 1000, leverage: 10, phase: 'stopped', stopReason: 'duration', activeSeconds: 86400, startedAgo: 17 * 86400, volume: 1240500, pnl: 42.18, makerShare: 0.95, durationMinutes: 1440 },
  { id: 'mm-186', strategyId: 'volume', venueId: 'zkLighter', marketSymbol: 'DOGE', margin: 150, leverage: 8, phase: 'stopped', stopReason: 'drawdown', activeSeconds: 9300, startedAgo: 18 * 86400, volume: 38420, pnl: -20, makerShare: 0.84, cutoff: 20 },
  { id: 'mm-185', strategyId: 'dynamic', venueId: 'Pacifica', marketSymbol: 'SOL', margin: 300, leverage: 10, phase: 'stopped', stopReason: 'user', activeSeconds: 15600, startedAgo: 19 * 86400, volume: 88340, pnl: 2.77, makerShare: 0.93 },
  { id: 'mm-184', strategyId: 'volume', venueId: 'Arcus', marketSymbol: 'GOLD', margin: 250, leverage: 5, phase: 'stopped', stopReason: 'over-budget', activeSeconds: 12800, startedAgo: 20 * 86400, volume: 54200, pnl: -11.4, makerShare: 0.82 },
  { id: 'mm-183', strategyId: 'dynamic', venueId: 'Hyperliquid', marketSymbol: 'ETH', margin: 600, leverage: 12, phase: 'stopped', stopReason: 'duration', activeSeconds: 36000, startedAgo: 21 * 86400, volume: 402150, pnl: 14.6, makerShare: 0.94, durationMinutes: 600 },
  { id: 'mm-182', strategyId: 'volume', venueId: 'Hyperliquid', marketSymbol: 'FARTCOIN', margin: 100, leverage: 3, phase: 'stopped', stopReason: 'fatal', activeSeconds: 2100, startedAgo: 22 * 86400, volume: 6140, pnl: -1.36, makerShare: 0.79 },
  { id: 'mm-181', strategyId: 'dynamic', venueId: 'Arcus', marketSymbol: 'XRP', margin: 200, leverage: 10, phase: 'stopped', stopReason: 'user', activeSeconds: 17800, startedAgo: 24 * 86400, volume: 71250, pnl: 0.94, makerShare: 0.92 },
  { id: 'mm-180', strategyId: 'volume', venueId: 'Decibel', marketSymbol: 'ETH', margin: 350, leverage: 8, phase: 'stopped', stopReason: 'duration', activeSeconds: 21600, startedAgo: 26 * 86400, volume: 158800, pnl: -4.1, makerShare: 0.88, durationMinutes: 360 },
  { id: 'mm-179', strategyId: 'dynamic', venueId: 'Lighter@Robinhood', marketSymbol: 'TSLA', margin: 250, leverage: 5, phase: 'stopped', stopReason: 'market-hours', activeSeconds: 23400, startedAgo: 27 * 86400, volume: 52770, pnl: 3.38, makerShare: 0.95 },
  { id: 'mm-178', strategyId: 'volume', venueId: 'zkLighter', marketSymbol: 'BTC', margin: 500, leverage: 15, phase: 'stopped', stopReason: 'crash_loop', activeSeconds: 4300, startedAgo: 29 * 86400, volume: 96410, pnl: -6.58, makerShare: 0.86 },
  { id: 'mm-177', strategyId: 'dynamic', venueId: 'Arcus', marketSymbol: 'SOL', margin: 400, leverage: 10, phase: 'stopped', stopReason: 'user', activeSeconds: 52000, startedAgo: 31 * 86400, volume: 286300, pnl: 11.92, makerShare: 0.94 },
  { id: 'mm-176', strategyId: 'volume', venueId: 'Pacifica', marketSymbol: 'HYPE', margin: 200, leverage: 6, phase: 'stopped', stopReason: 'drawdown', activeSeconds: 7600, startedAgo: 33 * 86400, volume: 31890, pnl: -15, makerShare: 0.83, cutoff: 15 },
]

/** Fees at a blended 0.3 bp of volume, the CPM that implies. */
function feesFor(volume: number) {
  return volume * 0.00003 + 0.002
}

function rowFrom(s: Seed, now: number): AgentRow {
  const started = now - s.startedAgo * 1000
  const ended = s.phase === 'stopped' ? started + s.activeSeconds * 1000 + 40_000 : null
  const fees = feesFor(s.volume)
  const durationOn = s.durationMinutes !== undefined
  const hours = durationOn && s.durationMinutes! >= 60 && s.durationMinutes! % 60 === 0
  return {
    id: s.id,
    strategyId: s.strategyId,
    strategyName: null,
    marketSymbol: s.marketSymbol,
    venueId: s.venueId,
    leverage: s.leverage,
    margin: s.margin,
    marginMode: 'cross',
    cutoffOn: true,
    cutoff: s.cutoff ?? 0,
    durationOn,
    durationUnit: hours ? 'hr' : 'min',
    durationValue: !durationOn ? 10 : hours ? s.durationMinutes! / 60 : s.durationMinutes!,
    status: s.phase === 'paused' ? 'paused' : 'running',
    phase: s.phase,
    stopReason: s.stopReason ?? (s.phase === 'stopped' ? 'user' : null),
    activeSeconds: s.activeSeconds,
    runtimeLabel: runtimeLabel(s.activeSeconds),
    snapshotAt: now,
    volume: s.volume,
    pnl: s.pnl,
    makerShare: s.makerShare,
    fees,
    cpm: s.volume >= 10_000 ? (fees - Math.max(0, s.pnl)) / (s.volume / 1e6) : null,
    fills: Math.max(2, Math.round(s.volume / 1450)),
    createdAt: new Date(started - 20_000).toISOString(),
    activatedAt: new Date(started).toISOString(),
    deactivatedAt: ended ? new Date(ended).toISOString() : null,
  }
}

function runtimeLabel(seconds: number) {
  const h = Math.floor(seconds / HOUR)
  const m = Math.floor((seconds % HOUR) / 60)
  const sec = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`
  return `${sec}s`
}

export function seedRows(now = Date.now()) {
  return {
    active: ACTIVE.map((s) => rowFrom(s, now)),
    completed: COMPLETED.map((s) => rowFrom(s, now)),
  }
}

/* ------------------------------------------------------------ detail -- */

const FILL_ACTIONS = [
  ['open_long', 'Open long', 'buy'],
  ['close_long', 'Close long', 'sell'],
  ['open_short', 'Open short', 'sell'],
  ['close_short', 'Close short', 'buy'],
] as const

/** A steady mock RNG, so a detail reads the same every time it opens. */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function fills(row: AgentRow, count: number, from: number, to: number): ActivityEvent[] {
  const rand = rng(row.id)
  const mid = MID[row.marketSymbol] ?? 100
  const notionalEach = Math.max(1, (row.margin * row.leverage) / 4)
  const out: ActivityEvent[] = []
  for (let i = 0; i < count; i++) {
    const at = new Date(to - ((to - from) * i) / Math.max(1, count))
    const [, label, side] = FILL_ACTIONS[i % 4]
    const px = mid * (1 + (rand() - 0.5) * 0.004)
    const notional = notionalEach * (0.6 + rand() * 0.8)
    const size = notional / px
    const maker = rand() > 0.08
    const fee = notional * (maker ? 0.00001 : 0.00025)
    const sizeText = size.toLocaleString('en-US', { maximumFractionDigits: size >= 1000 ? 2 : size >= 1 ? 4 : 6 })
    out.push({
      id: `fill-${row.id}-${i}`,
      kind: 'fill',
      text: `${label}: ${side} ${sizeText} at ${price(px)} · ${maker ? 'Maker' : 'Taker'} · fee ${usdFine(fee)}`,
      at,
      fill: { notional },
    })
  }
  return out
}

function system(id: string, text: string, at: number, kind: 'system' | 'guard' = 'system'): ActivityEvent {
  return { id: `${id}-${at}`, kind, text, at: new Date(at) }
}

export function detailFor(row: AgentRow, now = Date.now()): AgentDetail {
  const rand = rng(`${row.id}-detail`)
  const start = Date.parse(row.activatedAt ?? row.createdAt)
  const end = row.deactivatedAt ? Date.parse(row.deactivatedAt) : now
  const fresh = row.volume === 0

  const activity: ActivityEvent[] = fresh ? [] : fills(row, row.phase === 'stopped' ? 18 : 8, start + 60_000, end - 30_000)
  if (row.phase === 'stopped') {
    const reason = row.stopReason === 'drawdown' ? 'guard' : 'system'
    activity.unshift(system(row.id, 'Stopped', end, reason))
  }
  if (row.phase === 'paused') {
    activity.unshift(
      row.stopReason === 'drawdown'
        ? system(row.id, 'Cut-off reached. Quotes cancelled and inventory flattened.', now - 40 * 60_000, 'guard')
        : system(row.id, 'Paused', now - 25 * 60_000),
    )
  }
  if (row.phase !== 'starting') activity.push(system(row.id, 'Started quoting', start))
  activity.sort((a, b) => b.at.getTime() - a.at.getTime())

  // Cumulative volume at each five minute mark across the last hour
  const volumeSeries =
    row.phase === 'running' && !fresh
      ? Array.from({ length: 13 }, (_, i) => {
          const t = now - (12 - i) * 5 * 60_000
          const lastHour = row.volume * 0.12
          return { t, v: Math.round(lastHour * (i / 12) * (0.85 + rand() * 0.3) * 100) / 100 }
        }).map((p, i, all) => (i === 0 ? { ...p, v: 0 } : { ...p, v: Math.max(p.v, all[i - 1].v) }))
      : []

  const mid = MID[row.marketSymbol] ?? 100
  const open = row.phase === 'running' && !fresh
  const size = open ? (row.margin * row.leverage * 0.18) / mid : 0

  return {
    strategy: row,
    walletAddress: '0x3cc4a1f0b27e9d415c6a8b2e0f7d93c1a5e4d768',
    startEquity: row.margin,
    buyingPower: row.margin * row.leverage,
    maxInventory: row.margin * row.leverage * 0.35,
    remainingSeconds: row.durationOn && row.phase !== 'stopped' ? Math.max(0, row.durationValue * (row.durationUnit === 'hr' ? 3600 : 60) - row.activeSeconds) : null,
    roundTrips: Math.round(row.fills / 2),
    quotedVolume: row.volume * 1.0,
    makerVolume: row.volume * (row.makerShare ?? 0),
    takerFills: Math.round(row.fills * (1 - (row.makerShare ?? 1))),
    spreadPnl: row.pnl + row.fees,
    currentSpreadBp: 2.4,
    lastError: null,
    positions: open
      ? [
          {
            instrument: row.marketSymbol,
            side: rand() > 0.5 ? 'Long' : 'Short',
            size,
            notional: size * mid,
            mark: mid,
            stale: false,
          },
        ]
      : [],
    activity,
    volumeSeries,
  }
}
