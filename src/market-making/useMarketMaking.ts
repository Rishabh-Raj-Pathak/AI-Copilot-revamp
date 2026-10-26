import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OVERVIEW, detailFor, seedRows } from './data'
import { DEFAULT_CONFIG, effectiveCutoff, liveSeconds, roundCents, runtime, type AgentRow, type Config } from './lib'
import { useVenueAccount } from './useVenueAccount'

/*
 * Everything Market Making remembers and does, shared by the desktop page
 * (`MarketMakingApp`) and the phone screen (`components/mobile/mm`): the
 * agents, the form, the venue account and the mock actions. Production talks
 * to /web/trade/mm; here each action is a mock with a short delay, so the
 * pending states (Activating…, Pausing…) still show. Which screen is open is
 * each layout's own business.
 */

export type Pending = 'create' | 'update' | 'pause' | 'resume' | 'deactivate' | null
export type Totals = { volume: number; cpm: number | null; realizedPnl: number; activeCount: number }

const LATENCY = 700
const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms))

export function useMarketMaking({ signedIn, onLogin }: { signedIn: boolean; onLogin: () => void }) {
  const seeded = useMemo(() => seedRows(), [])
  const [active, setActive] = useState<AgentRow[]>(seeded.active)
  const [completed, setCompleted] = useState<AgentRow[]>(seeded.completed)
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [editing, setEditing] = useState<AgentRow | null>(null)
  const [pending, setPending] = useState<Pending>(null)
  const marginTouched = useRef(false)
  const dex = useVenueAccount(config.venueId, signedIn, onLogin)

  const totals: Totals = useMemo(() => {
    const all = [...active, ...completed]
    const volume = all.reduce((s, a) => s + a.volume, 0)
    const fees = all.reduce((s, a) => s + a.fees, 0)
    const pnl = all.reduce((s, a) => s + a.pnl, 0)
    return {
      volume,
      cpm: volume >= 10_000 ? (fees - Math.max(0, pnl)) / (volume / 1e6) : null,
      realizedPnl: pnl,
      activeCount: active.filter((a) => a.status === 'running').length,
    }
  }, [active, completed])

  // Details are built once per agent and kept, so an open view does not reshuffle
  const details = useRef(new Map<string, ReturnType<typeof detailFor>>())
  const getDetail = useCallback(
    (id: string) => {
      const row = active.find((a) => a.id === id) ?? completed.find((a) => a.id === id)
      if (!row) return null
      const cached = details.current.get(id)
      const d = cached && cached.strategy.phase === row.phase ? { ...cached, strategy: row } : detailFor(row)
      details.current.set(id, d)
      return d
    },
    [active, completed],
  )

  // A new agent shows Starting until the runner picks it up
  useEffect(() => {
    if (!active.some((a) => a.phase === 'starting')) return
    const t = window.setTimeout(() => {
      const now = new Date().toISOString()
      setActive((rows) =>
        rows.map((a) => (a.phase === 'starting' ? { ...a, phase: 'running', activatedAt: now, snapshotAt: Date.now() } : a)),
      )
    }, 3000)
    return () => window.clearTimeout(t)
  }, [active])

  /** Back to an empty form. `keepVenue` is production's New Agent, which keeps the venue. */
  const resetForm = useCallback((keepVenue = false) => {
    setEditing(null)
    marginTouched.current = false
    setConfig((c) => (keepVenue ? { ...DEFAULT_CONFIG, venueId: c.venueId } : DEFAULT_CONFIG))
  }, [])

  /** Activates a new agent, or saves the one being edited. Resolves to its id. */
  const submit = async (): Promise<string | null> => {
    const { venueId, strategyId, marketSymbol } = config
    if (!venueId || !strategyId || !marketSymbol) return null
    setPending(editing ? 'update' : 'create')
    await wait()
    const margin = roundCents(config.margin)
    const cutoff = config.cutoffOn ? roundCents(effectiveCutoff(config)) : 0
    if (editing) {
      const id = editing.id
      setActive((rows) =>
        rows.map((a) =>
          a.id === id
            ? {
                ...a,
                margin,
                leverage: config.leverage,
                cutoffOn: cutoff > 0,
                cutoff,
                durationOn: config.durationOn,
                durationUnit: config.durationUnit,
                durationValue: config.durationValue,
              }
            : a,
        ),
      )
      setPending(null)
      resetForm()
      return id
    }
    const id = `mm-${Date.now()}`
    const now = Date.now()
    setActive((rows) => [
      ...rows,
      {
        id,
        strategyId,
        strategyName: null,
        marketSymbol,
        venueId,
        leverage: config.leverage,
        margin,
        marginMode: config.marginMode,
        cutoffOn: cutoff > 0,
        cutoff,
        durationOn: config.durationOn,
        durationUnit: config.durationUnit,
        durationValue: config.durationValue,
        status: 'running',
        phase: 'starting',
        stopReason: null,
        activeSeconds: 0,
        runtimeLabel: runtime(0),
        snapshotAt: now,
        volume: 0,
        pnl: 0,
        makerShare: null,
        fees: 0,
        cpm: null,
        fills: 0,
        createdAt: new Date(now).toISOString(),
        activatedAt: null,
        deactivatedAt: null,
      },
    ])
    setPending(null)
    resetForm()
    return id
  }

  /** Pauses a running agent or resumes a paused one. Resolves to what it did. */
  const toggleRun = async (a: AgentRow): Promise<'paused' | 'resumed'> => {
    const pausing = a.status === 'running'
    setPending(pausing ? 'pause' : 'resume')
    await wait()
    const now = Date.now()
    setActive((rows) =>
      rows.map((x) =>
        x.id === a.id
          ? pausing
            ? { ...x, status: 'paused', phase: 'paused', stopReason: 'user', activeSeconds: liveSeconds(x, now), snapshotAt: now }
            : { ...x, status: 'running', phase: 'running', stopReason: null, snapshotAt: now }
          : x,
      ),
    )
    setPending(null)
    return pausing ? 'paused' : 'resumed'
  }

  /** Stops an agent for good; its run moves to the completed list. */
  const deactivate = async (a: AgentRow) => {
    setPending('deactivate')
    await wait()
    const now = Date.now()
    const seconds = liveSeconds(a, now)
    setActive((rows) => rows.filter((x) => x.id !== a.id))
    setCompleted((rows) => [
      {
        ...a,
        phase: 'stopped',
        stopReason: 'user',
        activeSeconds: seconds,
        runtimeLabel: runtime(seconds),
        deactivatedAt: new Date(now).toISOString(),
      },
      ...rows,
    ])
    setPending(null)
  }

  /** A margin the operator set: autofill leaves the form alone from then on. */
  const setMargin = useCallback((margin: number) => {
    marginTouched.current = true
    setConfig((c) => ({ ...c, margin }))
  }, [])

  /** Loads an agent into the form. Venue, market and strategy stay locked. */
  const edit = (a: AgentRow) => {
    setEditing(a)
    setConfig({
      venueId: a.venueId,
      strategyId: a.strategyId,
      marketSymbol: a.marketSymbol,
      margin: a.margin,
      leverage: a.leverage,
      marginMode: a.marginMode,
      cutoffOn: a.cutoff > 0,
      cutoff: a.cutoff > 0 ? a.cutoff : DEFAULT_CONFIG.cutoff,
      durationOn: a.durationOn,
      durationUnit: a.durationUnit,
      durationValue: a.durationValue,
    })
  }

  return {
    overview: OVERVIEW,
    active,
    completed,
    hasAgents: seeded.active.length + seeded.completed.length > 0,
    totals,
    getDetail,
    config,
    setConfig,
    setMargin,
    editing,
    pending,
    marginTouched,
    dex,
    resetForm,
    submit,
    toggleRun,
    deactivate,
    edit,
  }
}

export type MarketMakingState = ReturnType<typeof useMarketMaking>
