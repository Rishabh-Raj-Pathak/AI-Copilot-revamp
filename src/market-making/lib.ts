import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/*
 * Formatting and rules, transcribed from production's Market Making chunk
 * (app/(pages)/market-making/page-*.js). Names are readable; behaviour is not
 * changed. Production merges classes with tailwind-merge, and several of its
 * buttons rely on that to override padding and size, so `cn` does too.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Gold eyebrow: card labels and section headings. */
export const EYEBROW = 'text-[11px] leading-4 font-medium tracking-[0.09em] uppercase text-[#ccb17f]'
/** Muted eyebrow: figure labels, table heads, slider ticks. */
export const EYEBROW_MUTED = 'text-[11px] leading-4 font-medium tracking-[0.09em] uppercase text-[#717182]'
export const MONO = 'font-[ui-monospace,SF_Mono,Menlo,Consolas,monospace]'

/* ------------------------------------------------------------- types -- */

export type Phase = 'starting' | 'running' | 'offline' | 'pausing' | 'paused' | 'stopping' | 'stopped'
export type StopReason =
  | 'user'
  | 'requested'
  | 'drawdown'
  | 'stop-loss'
  | 'over-budget'
  | 'duration'
  | 'fatal'
  | 'crash_loop'
  | 'market-hours'

export type Config = {
  venueId: string | null
  strategyId: string | null
  marketSymbol: string | null
  margin: number
  leverage: number
  marginMode: 'cross' | 'isolated'
  cutoffOn: boolean
  cutoff: number
  durationOn: boolean
  durationUnit: 'hr' | 'min'
  durationValue: number
}

export const DEFAULT_CONFIG: Config = {
  venueId: null,
  strategyId: null,
  marketSymbol: null,
  margin: 0,
  leverage: 4,
  marginMode: 'cross',
  cutoffOn: false,
  cutoff: 20,
  durationOn: false,
  durationUnit: 'hr',
  durationValue: 10,
}

export type Venue = { id: string }
export type Market = {
  venueId: string
  symbol: string
  name: string
  categories: string[]
  minMargin?: number
  maxLeverage?: number
  sortWeight: number
  allowedStrategies: string[] | null
}
export type Strategy = { id: string; name: string; badge?: string; avgVolumePerUsdPerHour: number }
export type Overview = { venues: Venue[]; markets: Market[]; categories: string[]; strategies: Strategy[] }

/** One agent, as the dashboard rows carry it. */
export type AgentRow = {
  id: string
  strategyId: string
  strategyName: string | null
  marketSymbol: string
  venueId: string
  leverage: number
  margin: number
  marginMode: 'cross' | 'isolated'
  cutoffOn: boolean
  cutoff: number
  durationOn: boolean
  durationUnit: 'hr' | 'min'
  durationValue: number
  status: 'running' | 'paused'
  phase: Phase
  stopReason: StopReason | null
  activeSeconds: number
  runtimeLabel: string
  snapshotAt: number
  volume: number
  pnl: number
  makerShare: number | null
  fees: number
  cpm: number | null
  fills: number
  createdAt: string
  activatedAt: string | null
  deactivatedAt: string | null
}

export type ActivityEvent = {
  id: string
  kind: 'fill' | 'guard' | 'system'
  text: string
  at: Date
  fill?: { notional: number }
}

export type Position = {
  instrument: string
  side: 'Long' | 'Short'
  size: number
  notional: number | null
  mark: number | null
  stale: boolean
}

export type AgentDetail = {
  strategy: AgentRow
  walletAddress: string
  startEquity: number
  buyingPower: number
  maxInventory: number | null
  remainingSeconds: number | null
  roundTrips: number
  quotedVolume: number
  makerVolume: number
  takerFills: number
  spreadPnl: number
  currentSpreadBp: number
  lastError: string | null
  positions: Position[]
  activity: ActivityEvent[]
  volumeSeries: { t: number; v: number }[]
}

/* -------------------------------------------------------- formatting -- */

export const STRATEGY_LINE: Record<string, string> = {
  dynamic: 'Quotes both sides. Widens on volatility, stands aside in a real spike.',
  volume: 'Built for volume. Turns over more of your margin each hour.',
}
const STRATEGY_FALLBACK_NAME: Record<string, string> = { dynamic: 'Dynamic', volume: 'Volume' }
/** Categories the market filter never shows. */
export const HIDDEN_CATEGORIES = ['default']

const STOP_LABEL: Record<string, string> = {
  user: 'Stopped by you',
  requested: 'Stopped by you',
  drawdown: 'Cut-off reached',
  'stop-loss': 'Max Loss reached',
  'over-budget': 'Cost limit reached',
  duration: 'Time limit reached',
  fatal: 'Exchange error',
  crash_loop: 'Stopped after repeated errors',
  'market-hours': 'US market closed',
}

export const PHASE_TONE: Record<Phase, { dot: string; text: string }> = {
  starting: { dot: 'bg-[#ccb17f]', text: 'text-[#ccb17f]' },
  running: { dot: 'bg-[#4ade80]', text: 'text-[#4ade80]' },
  offline: { dot: 'bg-[#e5484d]', text: 'text-[#e5484d]' },
  pausing: { dot: 'bg-[#ccb17f]', text: 'text-[#ccb17f]' },
  paused: { dot: 'bg-[#ccb17f]', text: 'text-[#ccb17f]' },
  stopping: { dot: 'bg-[#ccb17f]', text: 'text-[#ccb17f]' },
  stopped: { dot: 'bg-[#63646f]', text: 'text-[#717182]' },
}

export const PHASE_LABEL: Record<Phase, string> = {
  starting: 'Starting',
  running: 'Active',
  offline: 'Offline',
  pausing: 'Pausing',
  paused: 'Paused',
  stopping: 'Stopping',
  stopped: 'Completed',
}

/** "$1,234.50", fixed decimals. */
export function usd(v: number, digits = 2) {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

/** "$1.24M", "$346.1K", "$7". */
export function usdCompact(v: number) {
  const a = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1)}K`
  if (a > 0 && a < 1) return `${sign}$${a.toFixed(a < 0.01 ? 4 : 2)}`
  return `${sign}$${a.toFixed(0)}`
}

function fineDigits(v: number) {
  const a = Math.abs(v)
  return a > 0 && a < 0.01 ? 4 : 2
}

/** Two decimals, four below a cent. */
export function usdFine(v: number) {
  return usd(v, fineDigits(v))
}

/** "+$3.42", "-$25.00". */
export function usdFineSigned(v: number) {
  const digits = fineDigits(v)
  return `${v > 0 ? '+' : v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

export function pct(v: number, digits = 1) {
  return `${v.toFixed(digits)}%`
}

/** A price: cents above $1, more below. */
export function price(v: number) {
  if (v >= 1e3) return `$${v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
  if (v >= 1) return `$${v.toFixed(2)}`
  if (v >= 0.01) return `$${v.toFixed(4)}`
  return `$${v.toFixed(6)}`
}

/** "2h 14m", "6m 02s", "40s". */
export function runtime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

export const ago = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`

/** "26 Oct 2026, 15:29:25", for titles and long chart spans. */
export function fullStamp(d: Date) {
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** "13 Oct, 20:05". */
export function dayTime(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function stopLabel(reason: string | null) {
  if (!reason) return null
  return STOP_LABEL[reason] ?? titleCase(reason)
}

export function strategyName(a: Pick<AgentRow, 'strategyName' | 'strategyId'>) {
  return (a.strategyName?.trim() || STRATEGY_FALLBACK_NAME[a.strategyId] || titleCase(a.strategyId)).replace(
    /(^|\s)(\S)/g,
    (_m, s: string, c: string) => s + c.toUpperCase(),
  )
}

export function titleCase(s: string) {
  return s
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/* ------------------------------------------------------------- rules -- */

export function maxLeverage(m: Market | null | undefined) {
  return m?.maxLeverage ?? 40
}

export function minMargin(m: Market | null | undefined) {
  return m?.minMargin ?? 50
}

export function strategyAllowed(m: Market | null | undefined, strategyId: string) {
  return !m?.allowedStrategies || m.allowedStrategies.includes(strategyId)
}

/** The highest cut-off a margin allows: a dollar under it. */
export function cutoffCeiling(margin: number) {
  return Math.max(1, Math.ceil(margin) - 1)
}

export function effectiveCutoff(c: Config) {
  return Math.min(c.cutoff, cutoffCeiling(c.margin))
}

export function buyingPower(c: Pick<Config, 'margin' | 'leverage'>) {
  return c.margin * c.leverage
}

/** A balance, floored to the cent, so MAX never asks for more than is there. */
export function floorCents(v: number) {
  return Math.max(0, Math.floor(v * 100) / 100)
}

export function durationMinutes(c: Pick<Config, 'durationUnit' | 'durationValue'>) {
  return Math.max(1, Math.round(c.durationUnit === 'hr' ? c.durationValue * 60 : c.durationValue))
}

export function roundCents(v: number) {
  return Math.floor(v * 100 + 1e-9) / 100
}

/** Bucket sizes, in seconds, for charting a finished run from its fills. */
export const RUN_BUCKETS = [10, 30, 60, 300, 900, 1800, 3600, 10800, 21600, 43200, 86400]

/** Seconds an agent has been quoting, counted forward from its last snapshot while it runs. */
export function liveSeconds(a: AgentRow, now: number) {
  if (a.phase !== 'running') return a.activeSeconds
  const since = Math.max(0, Math.floor((now - a.snapshotAt) / 1000))
  const total = a.activeSeconds + since
  return a.durationOn ? Math.min(total, durationMinutes(a) * 60) : total
}
