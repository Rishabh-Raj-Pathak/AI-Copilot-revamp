import { terminalAssets as a } from '../../figma/terminalAssets.js'
import CopilotDiscoveryPanel from './CopilotDiscoveryPanel.jsx'
import { CopilotPlatformKpis } from './CopilotStrategyLensKpis.jsx'
import SuggestionToolbar from './SuggestionToolbar.jsx'

const filterDefs = [
  { id: 'trending', label: 'Trending', icon: a.trending },
  { id: 'hip3', label: 'HIP-3', icon: a.hyperliquid },
  { id: 'bluechip', label: 'Bluechip', icon: a.pokerChip },
  { id: 'spotlight', label: 'Spotlight', icon: a.spotlight },
  { id: 'all', label: 'All Setups', icon: null },
]

/** Figma mobile Copilot — filter row order (1017:24652). */
const mobileFilterDefs = [
  { id: 'bluechip', label: 'Bluechip', icon: a.pokerChip },
  { id: 'hip3', label: 'Stocks (HIP-3)', icon: a.hyperliquid },
  { id: 'trending', label: 'Trending', icon: a.trending },
  { id: 'tradexyz', label: 'Trade[XYZ]', icon: a.spotlight },
]

function FilterPills({ defs, activeFilter, onFilterChange, mobile = false }) {
  return (
    <div
      className={
        mobile
          ? 'minimal-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5'
          : 'minimal-scrollbar flex min-w-0 flex-1 flex-wrap items-center gap-2 max-tablet:flex-nowrap max-tablet:overflow-x-auto max-tablet:pb-0.5'
      }
    >
      {defs.map((f) => {
        const active = f.id === activeFilter
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`flex shrink-0 items-center gap-1 border font-medium transition-colors min-h-8 rounded-md px-2.5 py-1 text-xs ${
              active
                ? 'border-[#f2b500] bg-transparent text-[#f2b500]'
                : 'border-[#242424] bg-transparent text-white hover:bg-white/5'
            }`}
          >
            {f.icon ? (
              <span className="relative size-3 shrink-0">
                <img
                  alt=""
                  className="absolute inset-0 size-full max-w-none object-contain"
                  src={f.icon}
                />
              </span>
            ) : null}
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

function MarketsRow({
  defs,
  activeFilter,
  onFilterChange,
  mobile = false,
  expireSeconds,
  onRefresh,
}) {
  const showUtilities =
    expireSeconds !== undefined && typeof onRefresh === 'function'

  return (
    <div
      className={
        mobile
          ? 'flex flex-col gap-2.5'
          : 'flex w-full items-center gap-x-3 gap-y-2'
      }
    >
      <FilterPills
        defs={defs}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        mobile={mobile}
      />
      {!mobile && showUtilities ? (
        <SuggestionToolbar
          variant="desktop"
          compact
          expireSeconds={expireSeconds}
          onRefresh={onRefresh}
        />
      ) : null}
    </div>
  )
}

export default function MarketFiltersBar({
  activeFilter,
  onFilterChange,
  stats,
  expireSeconds,
  onRefresh,
  strategies,
  selectedStrategyId,
  onStrategySelect,
}) {
  const showUtilities =
    expireSeconds !== undefined && typeof onRefresh === 'function'
  const showStrategy =
    strategies?.length &&
    selectedStrategyId &&
    typeof onStrategySelect === 'function'

  return (
    <div className="flex w-full shrink-0 flex-col">
      {/* Mobile — Figma 1017:24652 */}
      <div className="flex flex-col max-tablet:flex tablet:hidden">
        <div className="sticky top-0 z-20 border-b border-[#242424] bg-black">
          <div className="flex flex-col gap-2.5 px-3 py-2.5">
            {showStrategy ? (
              <div className="border-b border-[#242424] pb-2.5">
                <CopilotDiscoveryPanel
                  strategies={strategies}
                  selectedId={selectedStrategyId}
                  onSelect={onStrategySelect}
                  stats={stats}
                  mobile
                />
              </div>
            ) : null}
            <MarketsRow
              defs={mobileFilterDefs}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
              mobile
            />
            {showUtilities ? (
              <SuggestionToolbar
                variant="mobile"
                expireSeconds={expireSeconds}
                onRefresh={onRefresh}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop — performance + strategy side by side */}
      <div className="hidden flex-col gap-3 border-b border-[#242424] px-3 py-2 sm:px-5 sm:py-2.5 tablet:flex">
        {showStrategy ? (
          <CopilotDiscoveryPanel
            strategies={strategies}
            selectedId={selectedStrategyId}
            onSelect={onStrategySelect}
            stats={stats}
          />
        ) : (
          <CopilotPlatformKpis stats={stats} variant="standalone" />
        )}
        <MarketsRow
          defs={filterDefs}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          expireSeconds={expireSeconds}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  )
}
