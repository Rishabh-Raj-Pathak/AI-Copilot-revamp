import { useState } from 'react'
import { PageHeader } from './components/PageHeader'
import { Segmented, StatCard } from './components/ui/primitives'
import { ConfigureV1 } from './screens/ConfigureV1'
import { ConfigureV3 } from './screens/ConfigureV3'
import { Dashboard } from './screens/Dashboard'
import { ComponentSheet } from './screens/ComponentSheet'
import { DEFAULT_CONFIG, DEMO_CONFIG, configFromAgent, type Config } from './lib/config'
import { ACTIVE_AGENTS, type ActiveAgent, type HistoryRun } from './data/mock'

/**
 * Which Market Making layout renders. In the standalone app this was picked
 * from its own Agents menu; in the prototype each one is a route, listed in
 * VAULT_VIEWS next to the Delta Neutral versions.
 */
export type LayoutVariant = 'v1' | 'v2' | 'v3'

type Tab = 'configure' | 'dashboard' | 'components'

const SUBHEAD = [
  'HyprEarn quotes both sides of the book on your chosen venue and manages inventory for you.',
  'You earn the spread and maker rebates without taking a direction.',
]

/** Lifetime totals. Sits above whatever the current tab shows. */
function LifetimeStats({ agents }: { agents: ActiveAgent[] }) {
  const running = agents.filter((a) => a.status === 'running').length
  const paused = agents.length - running

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard label="Total Volume" value="$18.42M" descriptor="Volume generated" />
      <StatCard
        label="Avg CPM"
        value="$118.20"
        descriptor="Execution cost"
        tip="Average cost per $1M of volume across every completed run. Lower is better."
      />
      <StatCard
        label="Active Strategies"
        value={String(agents.length)}
        descriptor={`${running} running · ${paused} paused`}
      />
    </div>
  )
}

/** Only one strategy ships today; the console layouts offer just that one. */
const ONE_STRATEGY = ['adaptive']

/**
 * What differs between layouts, in one place rather than scattered through
 * the render. v4-v6 are v2 with a different take on the strategy panel.
 */
const LAYOUTS: Record<LayoutVariant, { console: boolean; limited: boolean }> = {
  v1: { console: false, limited: false },
  v2: { console: true, limited: true },
  v3: { console: false, limited: false },
}

const TITLE_TIP =
  'Two sided quoting on a single perp DEX, from your own account. Non custodial. Runs on HyprEarn infra, not in your browser.'

/**
 * The Market Making agent: Configure, Dashboard and the component sheet.
 * Everything below the app header — the prototype's own `HeaderTerminal` (or
 * the phone top bar) replaces the standalone app's shell.
 *
 * `compact` is the phone shell: the page switch drops to its small size, since
 * at full size it is wider than a 375px screen.
 */
export function MarketMakingApp({
  variant = 'v2',
  compact = false,
}: {
  variant?: LayoutVariant
  compact?: boolean
}) {
  const [tab, setTab] = useState<Tab>('configure')
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [running, setRunning] = useState(false)
  const layout = LAYOUTS[variant]

  // Live agents are shared: the rail lists them, the dashboard drives one.
  // Nothing is live until the operator activates something
  const [agents, setAgents] = useState<ActiveAgent[]>([])
  const [viewingAgentId, setViewingAgentId] = useState<string | null>(null)
  /** A finished run opened from the completed half of the list. */
  const [viewingRun, setViewingRun] = useState<HistoryRun | null>(null)
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const viewingAgent = agents.find((a) => a.id === viewingAgentId) ?? null

  /** Tab clicks always land on a tab's own top level, not a drilled in view. */
  const goToTab = (t: Tab) => {
    if (t === 'dashboard') {
      setViewingAgentId(null)
      setViewingRun(null)
    }
    setTab(t)
  }
  const editingAgent = agents.find((a) => a.id === editingAgentId) ?? null

  /** Open one agent in the dashboard. */
  const viewStrategy = (a: ActiveAgent) => {
    setConfig(configFromAgent(a))
    setRunning(a.status === 'running')
    setEditingAgentId(null)
    setViewingRun(null)
    setViewingAgentId(a.id)
    setTab('dashboard')
  }

  /** Send an agent back to the form for editing. */
  const editAgent = (a: ActiveAgent) => {
    setConfig(configFromAgent(a))
    setViewingAgentId(null)
    setEditingAgentId(a.id)
    setTab('configure')
  }

  /** Open a finished run in the same detail layout. */
  const viewResults = (r: HistoryRun) => {
    setViewingAgentId(null)
    setEditingAgentId(null)
    setViewingRun(r)
    setTab('dashboard')
  }

  const cancelEdit = () => {
    setEditingAgentId(null)
    setConfig(DEFAULT_CONFIG)
  }

  /** Pause or resume the agent currently open in the dashboard. */
  const toggleAgentRun = () => {
    if (!viewingAgent) {
      setRunning((r) => !r)
      return
    }
    const next = viewingAgent.status === 'running' ? 'paused' : 'running'
    setAgents((prev) => prev.map((a) => (a.id === viewingAgent.id ? { ...a, status: next } : a)))
    setRunning(next === 'running')
  }

  const deactivateAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id))
    if (editingAgentId === id) cancelEdit()
    if (viewingAgentId === id) {
      // Drop back to the agents list, which shows the empty state if that
      // was the last one. Bouncing to configure skipped past it.
      setViewingAgentId(null)
      setConfig(DEFAULT_CONFIG)
    }
  }

  /** The form's primary button: saves an edit, or launches a new agent. */
  const submitAgentForm = () => {
    if (editingAgentId) {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === editingAgentId
            ? {
                ...a,
                strategyId: config.strategyId ?? a.strategyId,
                marketSymbol: config.marketSymbol ?? a.marketSymbol,
                venueId: config.venueId ?? a.venueId,
                margin: config.margin,
                leverage: config.leverage,
                marginMode: config.marginMode,
              }
            : a,
        ),
      )
      const saved = editingAgentId
      cancelEdit()
      setViewingAgentId(saved)
      setTab('dashboard')
      return
    }

    if (config.strategyId && config.marketSymbol && config.venueId) {
      const created: ActiveAgent = {
        id: `agent-${Date.now()}`,
        strategyId: config.strategyId,
        marketSymbol: config.marketSymbol,
        venueId: config.venueId,
        leverage: config.leverage,
        margin: config.margin,
        marginMode: config.marginMode,
        status: 'running',
        runtimeLabel: 'just now',
        volume: 0,
        pnl: 0,
        makerShare: 0,
        fees: 0,
        unrealizedPnl: 0,
        maxLoss: config.cutoffOn ? config.cutoff : 0,
        safetyBuffer: config.cutoffOn ? config.cutoff : 0,
        inventoryPct: 0,
        inventoryCapPct: 75,
        lastTradeLabel: 'no fills yet',
        targetVolume: null,
      }
      setAgents((prev) => [...prev, created])
      // Straight into the strategy that was just activated
      setViewingAgentId(created.id)
    }
    setRunning(true)
    setTab('dashboard')
  }

  return (
    <>
      <PageHeader
        title="Market Making"
        subhead={SUBHEAD}
        tip={TITLE_TIP}
        right={
          <Segmented
            options={[
              { id: 'configure', label: 'Configure' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'components', label: 'Components' },
            ]}
            value={tab}
            onChange={goToTab}
            size={compact ? 'sm' : 'md'}
          />
        }
      />

      {tab === 'configure' && (
        <>
          {variant === 'v1' && <LifetimeStats agents={agents} />}

          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const filling = !config.connected
                setConfig(filling ? DEMO_CONFIG : DEFAULT_CONFIG)
                setAgents(filling ? ACTIVE_AGENTS : [])
                setViewingAgentId(null)
                setEditingAgentId(null)
              }}
              className="text-[12px] text-mm-ink-6 transition-colors hover:text-mm-ink-3"
            >
              {config.connected ? 'Reset to empty state' : 'Load a filled state'}
            </button>
          </div>

          {variant === 'v1' ? (
            <ConfigureV1
              config={config}
              setConfig={setConfig}
              onStart={() => {
                setRunning(true)
                setTab('dashboard')
              }}
            />
          ) : (
            <ConfigureV3
              config={config}
              setConfig={setConfig}
              onStart={submitAgentForm}
              editingAgent={editingAgent}
              onCancelEdit={cancelEdit}
              strategyIds={layout.limited ? ONE_STRATEGY : undefined}
            />
          )}
        </>
      )}

      {tab === 'dashboard' && variant !== 'v1' && !viewingAgent && !viewingRun && <LifetimeStats agents={agents} />}

      {tab === 'dashboard' && (
        <Dashboard
          config={config}
          running={running}
          onToggleRun={toggleAgentRun}
          onBackToConfigure={() => {
            if (variant !== 'v1' && viewingRun) {
              setViewingRun(null)
              return
            }
            if (variant !== 'v1' && viewingAgent) {
              setViewingAgentId(null)
              return
            }
            setViewingAgentId(null)
            setTab('configure')
          }}
          agents={variant !== 'v1' ? agents : null}
          agent={variant !== 'v1' ? viewingAgent : null}
          run={layout.console ? viewingRun : null}
          listStyle={layout.console ? 'combined' : 'split'}
          onViewStrategy={viewStrategy}
          onViewResults={viewResults}
          onNewAgent={() => {
            cancelEdit()
            setTab('configure')
          }}
          onEditAgent={viewingAgent ? () => editAgent(viewingAgent) : undefined}
          onDeactivateAgent={viewingAgent ? () => deactivateAgent(viewingAgent.id) : undefined}
        />
      )}

      {tab === 'components' && <ComponentSheet />}
    </>
  )
}
