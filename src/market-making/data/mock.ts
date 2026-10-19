export type Venue = {
  id: string
  name: string
  /** Brand tint for the venue glyph. Kept low saturation against black */
  tint: string
  balance: number
  maxLeverage: number
  supportsIsolated: boolean
  /** Venue reachability. Drives the status dot in the selector */
  status: 'live' | 'offline'
  /** Reason surfaced when a margin mode is unavailable */
  isolatedNote?: string
  takerFeeBps: number
  makerFeeBps: number
  wallet: string
}

export const VENUES: Venue[] = [
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    tint: '#4ade80',
    balance: 2840.53,
    maxLeverage: 50,
    status: 'live',
    supportsIsolated: true,
    takerFeeBps: 4.5,
    makerFeeBps: 1.5,
    wallet: '0x780a4f2b91cd7e3a55d1c0b8e948a0',
  },
  {
    id: 'pacifica',
    name: 'Pacifica',
    tint: '#8ab4f8',
    balance: 1210.0,
    maxLeverage: 20,
    status: 'live',
    supportsIsolated: false,
    isolatedNote: 'Pacifica settles every position against one shared margin pool.',
    takerFeeBps: 5,
    makerFeeBps: 2,
    wallet: '0x4c19ba7d3e5f08a2c6d9114e772b31',
  },
  {
    id: 'nado',
    name: 'Nado',
    tint: '#e8d5b5',
    balance: 640.18,
    maxLeverage: 25,
    status: 'offline',
    supportsIsolated: true,
    takerFeeBps: 6,
    makerFeeBps: 1,
    wallet: '0x91fe2c8a05b7d4319e6c22ab84f005',
  },
  {
    id: 'avantis',
    name: 'Avantis',
    tint: '#b39ddb',
    balance: 0,
    maxLeverage: 25,
    status: 'live',
    supportsIsolated: true,
    takerFeeBps: 8,
    makerFeeBps: 0,
    wallet: '0x2db7401fc9a6e85310bb7d4c9e1a66',
  },
  {
    id: 'zklighter',
    name: 'zkLighter',
    tint: '#7fd1c8',
    balance: 3980.72,
    maxLeverage: 20,
    status: 'live',
    supportsIsolated: false,
    isolatedNote: 'zkLighter runs a single cross margin account per wallet.',
    takerFeeBps: 2,
    makerFeeBps: -0.5,
    wallet: '0x66c3a1e8b204df7791e0c5a3d84b12',
  },
  {
    id: 'lighter',
    name: 'Lighter',
    tint: '#f0ddb9',
    balance: 512.4,
    maxLeverage: 20,
    status: 'live',
    supportsIsolated: true,
    takerFeeBps: 0,
    makerFeeBps: 0,
    wallet: '0x0ab594d7e3c81f26aa4470e9b1cd83',
  },
]

export type Strategy = {
  id: string
  name: string
  badge?: string
  line: string
  /** Buying power turned over per day. Drives the volume estimate */
  turnoverPerDay: number
  /** Share of fills expected to rest as maker */
  makerShare: number
  quoteSizePct: number
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'adaptive',
    name: 'Dynamic',
    badge: 'Recommended',
    line: 'Quotes both sides. Widens on volatility, stands aside in a real spike.',
    turnoverPerDay: 1600,
    makerShare: 0.94,
    quoteSizePct: 12,
  },
  {
    id: 'tight',
    name: 'Aggressive',
    badge: 'Max Volume',
    line: 'Quotes at the top of the book. Most fills, thinnest capture per fill.',
    turnoverPerDay: 3000,
    makerShare: 0.88,
    quoteSizePct: 18,
  },
  {
    id: 'passive',
    name: 'Conservative',
    badge: 'Lowest Cost',
    line: 'Rests deeper in the book. Fewer fills, better capture on each one.',
    turnoverPerDay: 800,
    makerShare: 0.98,
    quoteSizePct: 8,
  },
  {
    id: 'sniper',
    name: 'Precision',
    badge: 'Prime Hours',
    line: 'Quotes only in the cheapest hours. Holds flat the rest of the day.',
    turnoverPerDay: 1200,
    makerShare: 0.96,
    quoteSizePct: 14,
  },
]

export type Category =
  | 'Top Picks'
  | 'Bluechip'
  | 'Stocks'
  | 'Commodities'
  | 'Meme'
  | 'FX'

export const CATEGORIES: { id: Category; line: string }[] = [
  { id: 'Top Picks', line: 'Deepest books right now' },
  { id: 'Bluechip', line: 'Majors and large caps' },
  { id: 'Stocks', line: 'Tokenised equities' },
  { id: 'Commodities', line: 'Metals and energy' },
  { id: 'Meme', line: 'High turnover, wide spreads' },
  { id: 'FX', line: 'Currency pairs' },
]

export type Token = {
  symbol: string
  name: string
  category: Category[]
  maxLeverage: number
  mark: number
  vol24h: number
  /** Typical resting spread in basis points. Feeds the cost estimate */
  spreadBps: number
}

export const TOKENS: Token[] = [
  { symbol: 'BTC', name: 'Bitcoin', category: ['Top Picks', 'Bluechip'], maxLeverage: 50, mark: 91240.5, vol24h: 4_820_000_000, spreadBps: 1.2 },
  { symbol: 'ETH', name: 'Ethereum', category: ['Top Picks', 'Bluechip'], maxLeverage: 50, mark: 3120.88, vol24h: 2_140_000_000, spreadBps: 1.5 },
  { symbol: 'SOL', name: 'Solana', category: ['Top Picks', 'Bluechip'], maxLeverage: 40, mark: 186.42, vol24h: 1_060_000_000, spreadBps: 2.1 },
  { symbol: 'HYPE', name: 'Hyperliquid', category: ['Top Picks'], maxLeverage: 25, mark: 34.19, vol24h: 412_000_000, spreadBps: 3.4 },
  { symbol: 'BNB', name: 'BNB', category: ['Bluechip'], maxLeverage: 25, mark: 612.7, vol24h: 388_000_000, spreadBps: 2.6 },
  { symbol: 'XRP', name: 'XRP', category: ['Bluechip'], maxLeverage: 20, mark: 2.14, vol24h: 341_000_000, spreadBps: 3.0 },
  { symbol: 'NVDA', name: 'NVIDIA', category: ['Stocks'], maxLeverage: 10, mark: 184.22, vol24h: 96_400_000, spreadBps: 5.8 },
  { symbol: 'TSLA', name: 'Tesla', category: ['Stocks'], maxLeverage: 10, mark: 412.06, vol24h: 74_100_000, spreadBps: 6.2 },
  { symbol: 'AAPL', name: 'Apple', category: ['Stocks'], maxLeverage: 10, mark: 258.9, vol24h: 51_800_000, spreadBps: 6.5 },
  { symbol: 'CRCL', name: 'Circle', category: ['Stocks'], maxLeverage: 10, mark: 65.41, vol24h: 22_600_000, spreadBps: 9.1 },
  { symbol: 'XAU', name: 'Gold', category: ['Commodities'], maxLeverage: 25, mark: 4080.15, vol24h: 128_000_000, spreadBps: 4.2 },
  { symbol: 'XAG', name: 'Silver', category: ['Commodities'], maxLeverage: 25, mark: 60.14, vol24h: 41_300_000, spreadBps: 5.5 },
  { symbol: 'WTI', name: 'Crude Oil', category: ['Commodities'], maxLeverage: 20, mark: 69.02, vol24h: 18_900_000, spreadBps: 7.4 },
  { symbol: 'DOGE', name: 'Dogecoin', category: ['Meme'], maxLeverage: 20, mark: 0.1642, vol24h: 214_000_000, spreadBps: 4.8 },
  { symbol: 'WIF', name: 'dogwifhat', category: ['Meme'], maxLeverage: 10, mark: 0.842, vol24h: 62_400_000, spreadBps: 8.9 },
  { symbol: 'PEPE', name: 'Pepe', category: ['Meme'], maxLeverage: 10, mark: 0.0000082, vol24h: 88_700_000, spreadBps: 9.6 },
  { symbol: 'EUR', name: 'Euro', category: ['FX'], maxLeverage: 50, mark: 1.0842, vol24h: 34_200_000, spreadBps: 1.8 },
  { symbol: 'GBP', name: 'Sterling', category: ['FX'], maxLeverage: 50, mark: 1.2711, vol24h: 19_400_000, spreadBps: 2.2 },
  { symbol: 'JPY', name: 'Yen', category: ['FX'], maxLeverage: 50, mark: 0.00654, vol24h: 12_100_000, spreadBps: 2.4 },
]

/* ------------------------------------------------------- active agents -- */

export type AgentStatus = 'running' | 'paused'

/**
 * A configured market making agent that is already live. Distinct from a
 * Strategy, which is the quoting style an agent runs.
 */
export type ActiveAgent = {
  id: string
  strategyId: string
  marketSymbol: string
  venueId: string
  leverage: number
  margin: number
  marginMode: 'cross' | 'isolated'
  status: AgentStatus
  /** How long it has been live, already formatted */
  runtimeLabel: string
  volume: number
  pnl: number
  makerShare: number
  /** Fees paid so far, net of maker rebates */
  fees: number
  /** Open position PnL, not yet booked */
  unrealizedPnl: number
  /** Drawdown floor, in dollars below the starting balance */
  maxLoss: number
  /** What is left of the max loss before the run halts */
  safetyBuffer: number
  /** Inventory lean as a signed share of the cap. Negative is short, 0 is flat. */
  inventoryPct: number
  inventoryCapPct: number
  lastTradeLabel: string
  /** Volume goal, or null when the run has no target */
  targetVolume: number | null
}

/** Sample agents. Not seeded by default — the console starts empty. */
export const ACTIVE_AGENTS: ActiveAgent[] = [
  {
    id: 'agent-1',
    strategyId: 'adaptive',
    marketSymbol: 'BTC',
    venueId: 'hyperliquid',
    leverage: 4,
    margin: 500,
    marginMode: 'cross',
    status: 'running',
    runtimeLabel: '12h 04m',
    volume: 1_840_000,
    pnl: 96.42,
    makerShare: 0.94,
    fees: 214.6,
    unrealizedPnl: 12.4,
    maxLoss: 20,
    safetyBuffer: 18.2,
    inventoryPct: 32,
    inventoryCapPct: 75,
    lastTradeLabel: 'just now',
    targetVolume: null,
  },
  {
    id: 'agent-2',
    strategyId: 'tight',
    marketSymbol: 'SOL',
    venueId: 'pacifica',
    leverage: 6,
    margin: 350,
    marginMode: 'cross',
    status: 'running',
    runtimeLabel: '3h 41m',
    volume: 3_210_000,
    pnl: -41.18,
    makerShare: 0.88,
    fees: 486.2,
    unrealizedPnl: -8.15,
    maxLoss: 25,
    safetyBuffer: 11.4,
    inventoryPct: -58,
    inventoryCapPct: 75,
    lastTradeLabel: '12s ago',
    targetVolume: 5_000_000,
  },
  {
    id: 'agent-3',
    strategyId: 'passive',
    marketSymbol: 'XAU',
    venueId: 'zklighter',
    leverage: 3,
    margin: 850,
    marginMode: 'cross',
    status: 'paused',
    runtimeLabel: '24h 00m',
    volume: 942_000,
    pnl: 128.9,
    makerShare: 0.98,
    fees: 62.4,
    unrealizedPnl: 0,
    maxLoss: 15,
    safetyBuffer: 15,
    inventoryPct: 0,
    inventoryCapPct: 75,
    lastTradeLabel: '18m ago',
    targetVolume: 1_000_000,
  },
]

export type ActivityKind = 'fill' | 'quote' | 'funding' | 'guard' | 'system'

export type ActivityEvent = {
  id: string
  kind: ActivityKind
  text: string
  at: Date
}

export type Position = {
  instrument: string
  side: 'Long' | 'Short'
  size: number
  entry: number
  mark: number
  pnl: number
}

export type Fill = {
  at: string
  side: 'Buy' | 'Sell'
  size: number
  price: number
  role: 'Maker' | 'Taker'
  fee: number
}

export type HistoryRun = {
  id: string
  strategy: string
  market: string
  venue: string
  leverage: number
  quoteSize: number
  start: string
  end: string
  durationLabel: string
  volume: number
  fees: number
  pnl: number
  makerShare: number
  fills: number
  sampleFills: Fill[]
}

export const HISTORY: HistoryRun[] = [
  {
    id: 'run-4821',
    strategy: 'Dynamic',
    market: 'BTC',
    venue: 'Hyperliquid',
    leverage: 4,
    quoteSize: 120,
    start: '2026-09-08 09:12',
    end: '2026-09-08 21:12',
    durationLabel: '12h 00m',
    volume: 1_842_000,
    fees: 214.6,
    pnl: 96.42,
    makerShare: 0.94,
    fills: 1284,
    sampleFills: [
      { at: '09:12:04', side: 'Buy', size: 0.0131, price: 90_812.5, role: 'Maker', fee: 0.18 },
      { at: '09:12:41', side: 'Sell', size: 0.0131, price: 90_849.0, role: 'Maker', fee: 0.18 },
      { at: '09:14:08', side: 'Buy', size: 0.0128, price: 90_774.5, role: 'Maker', fee: 0.17 },
      { at: '09:15:52', side: 'Sell', size: 0.0128, price: 90_806.0, role: 'Taker', fee: 0.52 },
    ],
  },
  {
    id: 'run-4795',
    strategy: 'Aggressive',
    market: 'SOL',
    venue: 'Hyperliquid',
    leverage: 6,
    quoteSize: 210,
    start: '2026-09-06 14:00',
    end: '2026-09-07 02:00',
    durationLabel: '12h 00m',
    volume: 3_210_000,
    fees: 486.2,
    pnl: -41.18,
    makerShare: 0.88,
    fills: 2610,
    sampleFills: [
      { at: '14:00:11', side: 'Sell', size: 1.14, price: 184.22, role: 'Maker', fee: 0.31 },
      { at: '14:00:58', side: 'Buy', size: 1.14, price: 184.09, role: 'Maker', fee: 0.31 },
      { at: '14:02:20', side: 'Sell', size: 1.10, price: 184.41, role: 'Taker', fee: 0.91 },
    ],
  },
  {
    id: 'run-4712',
    strategy: 'Conservative',
    market: 'XAU',
    venue: 'zkLighter',
    leverage: 3,
    quoteSize: 85,
    start: '2026-09-04 08:30',
    end: '2026-09-05 08:30',
    durationLabel: '24h 00m',
    volume: 942_000,
    fees: 62.4,
    pnl: 128.9,
    makerShare: 0.98,
    fills: 604,
    sampleFills: [
      { at: '08:30:22', side: 'Buy', size: 0.041, price: 4_072.1, role: 'Maker', fee: -0.09 },
      { at: '08:38:05', side: 'Sell', size: 0.041, price: 4_078.4, role: 'Maker', fee: -0.09 },
    ],
  },
]

export const SEED_ACTIVITY: { kind: ActivityKind; text: string; agoSec: number }[] = [
  { kind: 'fill', text: 'Filled sell 0.0128 BTC at $91,268.0 as maker. Fee $0.17.', agoSec: 6 },
  { kind: 'fill', text: 'Filled buy 0.0128 BTC at $91,241.5 as maker. Fee $0.17.', agoSec: 19 },
  { kind: 'quote', text: 'Requoted both sides. Spread widened to 2.4 bps on book pressure.', agoSec: 44 },
  { kind: 'funding', text: 'Funding paid $0.42 on 0.031 BTC long carry.', agoSec: 121 },
  { kind: 'guard', text: 'Inventory reached 62 percent of cap. Bid size trimmed to rebalance.', agoSec: 208 },
  { kind: 'fill', text: 'Filled buy 0.0131 BTC at $91,198.0 as maker. Fee $0.18.', agoSec: 263 },
  { kind: 'system', text: 'Run started on Hyperliquid. Quoting BTC at 4x, $120 per side.', agoSec: 412 },
]

/** Live quotes for the running dashboard. Kept small and honest */
export const OPEN_POSITIONS: Position[] = [
  { instrument: 'BTC-USD.P', side: 'Long', size: 0.0212, entry: 91_186.4, mark: 91_240.5, pnl: 1.15 },
]
