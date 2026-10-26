import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { VENUE_ACCOUNTS } from './data'

/*
 * Production's venue account hook, which signs a DEX account in through the
 * wallet and reads its balance, as a mock: the same statuses and fields, with
 * the network calls replaced by short timers. "Signed in" is the prototype's
 * own wallet connection.
 */

export type VenueAccount = {
  status: 'select-dex' | 'connect-wallet' | 'connect-dex' | 'ready'
  isConnected: boolean
  isConnecting: boolean
  walletAddress: string | null
  balance: number
  isBalanceLoading: boolean
  connectedVenues: Record<string, boolean>
  blockedVenues: Record<string, string>
  connect: () => void
  changeWallet: () => void
  deposit: () => void
}

const CONNECT_MS = 900
const BALANCE_MS = 600

export function useVenueAccount(venueId: string | null, signedIn: boolean, onLogin: () => void): VenueAccount {
  const [linked, setLinked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.entries(VENUE_ACCOUNTS).map(([id, a]) => [id, a.onboarded])),
  )
  const [connecting, setConnecting] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const account = venueId ? VENUE_ACCOUNTS[venueId] : undefined
  const isConnected = signedIn && !!venueId && !!linked[venueId]

  const connect = useCallback(() => {
    if (!venueId) return
    if (!signedIn) {
      onLogin()
      return
    }
    setConnecting(true)
    later(() => {
      setLinked((l) => ({ ...l, [venueId]: true }))
      setConnecting(false)
      setLoadingBalance(true)
      later(() => setLoadingBalance(false), BALANCE_MS)
    }, CONNECT_MS)
  }, [venueId, signedIn, onLogin])

  // Production disconnects, then asks which wallet to use; the mock stops at the disconnect
  const changeWallet = useCallback(() => {
    if (venueId) setLinked((l) => ({ ...l, [venueId]: false }))
  }, [venueId])

  const connectedVenues = useMemo(
    () => Object.fromEntries(Object.keys(VENUE_ACCOUNTS).map((id) => [id, signedIn && !!linked[id]])),
    [linked, signedIn],
  )

  return {
    status: venueId ? (signedIn ? (isConnected ? 'ready' : 'connect-dex') : 'connect-wallet') : 'select-dex',
    isConnected,
    isConnecting: connecting,
    walletAddress: isConnected ? (account?.wallet ?? null) : null,
    balance: isConnected ? (account?.balance ?? 0) : 0,
    isBalanceLoading: isConnected && loadingBalance,
    connectedVenues,
    blockedVenues: BLOCKED,
    connect,
    changeWallet,
    // Production opens its deposit sheet here
    deposit: () => {},
  }
}

const BLOCKED: Record<string, string> = {}

/* --------------------------------------------------------------- now -- */

let now = Date.now()
const listeners = new Set<() => void>()
let ticker: number | undefined

function subscribe(fn: () => void) {
  listeners.add(fn)
  now = Date.now()
  ticker ??= window.setInterval(() => {
    now = Date.now()
    listeners.forEach((l) => l())
  }, 1000)
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && ticker !== undefined) {
      window.clearInterval(ticker)
      ticker = undefined
    }
  }
}
const idle = () => () => {}
const read = () => now

/** The current time, ticking once a second while `live`. One shared timer. */
export function useNow(live = true) {
  return useSyncExternalStore(live ? subscribe : idle, read, read)
}
