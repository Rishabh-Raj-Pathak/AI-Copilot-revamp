import { Configure } from './Configure'
import { VENUES, type ActiveAgent } from '../data/mock'
import { type Config } from '../lib/config'

type Props = {
  config: Config
  setConfig: (c: Config) => void
  onStart: () => void
  /** Set while the form is editing a live agent rather than creating one. */
  editingAgent: ActiveAgent | null
  onCancelEdit: () => void
  /** Which strategies this layout offers, and which are not live yet. */
  strategyIds?: string[]
  comingSoonIds?: string[]
}

/**
 * Market Making 3 — configure is where a strategy is set up, and nothing else.
 * The live agents moved to the dashboard, which is where activating lands you.
 */
export function ConfigureV3({
  config,
  setConfig,
  onStart,
  editingAgent,
  onCancelEdit,
  strategyIds,
  comingSoonIds,
}: Props) {
  return (
    <Configure
      config={config}
      setConfig={setConfig}
      onStart={onStart}
      strategyIds={strategyIds}
      comingSoonIds={comingSoonIds}
      startLabel={editingAgent ? 'Save changes' : 'Activate Strategy'}
      above={
        editingAgent ? (
          <EditingBanner agent={editingAgent} onCancel={onCancelEdit} />
        ) : undefined
      }
    />
  )
}

function EditingBanner({ agent, onCancel }: { agent: ActiveAgent; onCancel: () => void }) {
  const venue = VENUES.find((v) => v.id === agent.venueId)
  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] px-4 py-3"
      style={{
        border: '1px solid rgba(204,177,127,0.35)',
        backgroundColor: 'rgba(204,177,127,0.06)',
      }}
    >
      <span className="text-[13px] text-mm-gold-100">
        Editing <span className="mm-mono font-semibold">{agent.marketSymbol}</span>
        {venue ? ` on ${venue.name}` : ''}
      </span>
      <span className="text-[12px] text-mm-ink-5">
        Changes apply when you save.{' '}
        {agent.status === 'running'
          ? 'The agent keeps running meanwhile.'
          : 'It stays paused until you resume it.'}
      </span>
      <button
        type="button"
        onClick={onCancel}
        className="ml-auto shrink-0 text-[12px] font-medium text-mm-ink-4 transition-colors hover:text-mm-ink-1"
      >
        Cancel
      </button>
    </div>
  )
}
