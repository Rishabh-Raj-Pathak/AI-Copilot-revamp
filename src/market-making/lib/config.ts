import {
  STRATEGIES,
  TOKENS,
  VENUES,
  type ActiveAgent,
  type Strategy,
  type Token,
  type Venue,
} from '../data/mock'

export type MarginMode = 'cross' | 'isolated'
export type DurationUnit = 'min' | 'hr'

export type Config = {
  venueId: string | null
  connected: boolean
  /** Set when the venue balance call is in flight or rate limited */
  balanceState: 'ready' | 'loading' | 'ratelimited'
  strategyId: string | null
  marketSymbol: string | null
  margin: number
  leverage: number
  marginMode: MarginMode
  cutoffOn: boolean
  cutoff: number
  durationOn: boolean
  durationUnit: DurationUnit
  durationValue: number
}

export const DEFAULT_CONFIG: Config = {
  venueId: null,
  connected: false,
  balanceState: 'ready',
  // The recommended strategy is pre-selected: with one on offer there is no
  // choice to make, and with several it is the sensible starting point.
  strategyId: 'adaptive',
  marketSymbol: null,
  margin: 0,
  leverage: 4,
  marginMode: 'cross',
  cutoffOn: true,
  cutoff: 20,
  durationOn: false,
  durationUnit: 'hr',
  durationValue: 10,
}

export const DEMO_CONFIG: Config = {
  venueId: 'hyperliquid',
  connected: true,
  balanceState: 'ready',
  strategyId: 'adaptive',
  marketSymbol: 'BTC',
  margin: 500,
  leverage: 4,
  marginMode: 'cross',
  cutoffOn: true,
  cutoff: 20,
  durationOn: true,
  durationValue: 12,
  durationUnit: 'hr',
}

/** Load a live agent back into the configure form. */
export function configFromAgent(a: ActiveAgent): Config {
  return {
    ...DEFAULT_CONFIG,
    venueId: a.venueId,
    connected: true,
    strategyId: a.strategyId,
    marketSymbol: a.marketSymbol,
    margin: a.margin,
    leverage: a.leverage,
    marginMode: a.marginMode,
  }
}

export function getVenue(c: Config): Venue | null {
  return VENUES.find((v) => v.id === c.venueId) ?? null
}

export function getStrategy(c: Config): Strategy | null {
  return STRATEGIES.find((s) => s.id === c.strategyId) ?? null
}

export function getToken(c: Config): Token | null {
  return TOKENS.find((t) => t.symbol === c.marketSymbol) ?? null
}

/** Leverage ceiling is the lower of what the venue and the market allow */
export function maxLeverage(c: Config): number {
  const venue = getVenue(c)
  const token = getToken(c)
  if (!venue) return 50
  if (!token) return venue.maxLeverage
  return Math.min(venue.maxLeverage, token.maxLeverage)
}

export function buyingPower(c: Config): number {
  return c.margin * c.leverage
}

/** Run horizon in days. Falls back to one day so the estimate stays comparable */
export function horizonDays(c: Config): number {
  if (!c.durationOn) return 1
  const hours = c.durationUnit === 'hr' ? c.durationValue : c.durationValue / 60
  return hours / 24
}

export type VolumeEstimate = {
  low: number
  high: number
  /** True when duration is off, so the figure is quoted per day */
  perDay: boolean
  turnoverPerDay: number
  feeBps: number
  buyingPower: number
  estFeesLow: number
  estFeesHigh: number
}

/**
 * Volume is an estimate, never a promise. Returned as a range built from
 * buying power, the strategy turnover rate and the venue fee.
 */
export function estimateVolume(c: Config): VolumeEstimate | null {
  const strategy = getStrategy(c)
  const venue = getVenue(c)
  const token = getToken(c)
  if (!strategy || !venue || !token || c.margin <= 0) return null

  const bp = buyingPower(c)
  const days = horizonDays(c)
  // Wider spreads mean fewer round trips, so thin books turn over slower
  const spreadDrag = Math.max(0.55, 1 - (token.spreadBps - 1.2) * 0.045)
  const centre = bp * strategy.turnoverPerDay * spreadDrag * days

  const feeBps =
    venue.makerFeeBps * strategy.makerShare + venue.takerFeeBps * (1 - strategy.makerShare)

  return {
    low: centre * 0.8,
    high: centre * 1.2,
    perDay: !c.durationOn,
    turnoverPerDay: strategy.turnoverPerDay * spreadDrag,
    feeBps,
    buyingPower: bp,
    estFeesLow: (centre * 0.8 * feeBps) / 10_000,
    estFeesHigh: (centre * 1.2 * feeBps) / 10_000,
  }
}

/** Blocking reasons, in the order the user meets them on the page */
export function blockingReason(c: Config): string | null {
  const venue = getVenue(c)
  if (!venue) return 'Select a venue to continue.'
  if (!c.connected) return 'Connect your venue account to continue.'
  if (!c.strategyId) return 'Pick a strategy to continue.'
  if (!c.marketSymbol) return 'Pick a market to continue.'
  if (c.margin <= 0) return 'Set the margin you want to deploy.'
  if (c.margin > venue.balance) return `Margin is above your ${venue.name} balance of $${venue.balance.toFixed(2)}.`
  if (c.cutoffOn && c.cutoff <= 0) return 'Set a cut-off amount, or switch the cut-off off.'
  if (c.durationOn && c.durationValue <= 0) return 'Set a run length, or switch the timer off.'
  return null
}
