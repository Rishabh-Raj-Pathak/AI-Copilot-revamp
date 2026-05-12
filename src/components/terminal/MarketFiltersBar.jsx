import { terminalKpiBar } from '../../design-system/tokens/terminalKpiBar'
import { terminalAssets as a } from '../../figma/terminalAssets.js'

const filterDefs = [
  { id: 'trending', label: 'Trending', icon: a.trending },
  { id: 'hip3', label: 'HIP-3', icon: a.hyperliquid },
  { id: 'bluechip', label: 'Bluechip', icon: a.pokerChip },
  { id: 'spotlight', label: 'Spotlight', icon: a.spotlight },
  { id: 'all', label: 'All Setups', icon: null },
]

function formatVol(n) {
  return `$${n.toLocaleString('en-US')}`
}

export default function MarketFiltersBar({ activeFilter, onFilterChange, stats }) {
  return (
    <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#242424] px-5 py-3">
      <div className="flex flex-wrap items-start gap-2">
        {filterDefs.map((f) => {
          const active = f.id === activeFilter
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors ${
                active ? 'border-[#242424] bg-[#3e2e00] text-[#f2b500]' : 'border-[#242424] text-white hover:bg-white/5'
              }`}
            >
              {f.icon ? (
                <span className="relative size-3.5 shrink-0">
                  <img alt="" className="absolute inset-0 size-full max-w-none object-contain" src={f.icon} />
                </span>
              ) : null}
              {f.label}
            </button>
          )
        })}
      </div>
      <div className="flex shrink-0 flex-wrap items-start justify-end gap-5 leading-tight whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={terminalKpiBar.labelClassName}>Total Volume:</span>
          <span className={terminalKpiBar.valueClassName}>{formatVol(stats.volume)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={terminalKpiBar.labelClassName}>Total Trades:</span>
          <span className={terminalKpiBar.valueClassName}>
            {stats.trades.toLocaleString('en-US')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={terminalKpiBar.labelClassName}>Winning %:</span>
          <span className={terminalKpiBar.valueClassName}>{stats.winPct}%</span>
        </div>
      </div>
    </div>
  )
}
