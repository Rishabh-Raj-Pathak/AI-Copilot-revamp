import { CandlestickChart, Gem, Sparkles, TrendingUp } from 'lucide-react'
import CopilotDiscoveryPanel from './CopilotDiscoveryPanel.jsx'
import SuggestionToolbar from './SuggestionToolbar.jsx'

const categoryFilterDefs = [
  { id: 'bluechip', label: 'Bluechip', icon: Gem },
  { id: 'hip3', label: 'Stocks (HIP-3)', icon: CandlestickChart },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'tradexyz', label: 'Trade[XYZ]', icon: Sparkles },
]

function FilterPills({ defs, activeFilter, onFilterChange, mobile = false, inline = false }) {
  return (
    <div
      className={
        mobile
          ? 'minimal-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5'
          : inline
            ? 'flex shrink-0 flex-nowrap items-center gap-1.5'
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
            className={`flex shrink-0 items-center gap-1 border font-medium transition-colors min-h-8 rounded-md px-2.5 py-1 text-xs border-[#242424] bg-transparent ${
              active
                ? 'text-[#f2b500]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            {f.icon ? (
              <f.icon className="size-3 shrink-0" strokeWidth={2} aria-hidden />
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
          : 'flex w-full items-center justify-between gap-x-3 gap-y-2'
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
                  mobile
                />
              </div>
            ) : null}
            <MarketsRow
              defs={categoryFilterDefs}
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

      {/* Desktop — strategy, filters, and utilities in one row */}
      <div className="hidden border-b border-[#242424] px-3 py-2 sm:px-5 sm:py-2.5 tablet:block">
        {showStrategy ? (
          <CopilotDiscoveryPanel
            strategies={strategies}
            selectedId={selectedStrategyId}
            onSelect={onStrategySelect}
            filtersSlot={
              <FilterPills
                defs={categoryFilterDefs}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                inline
              />
            }
            utilitiesSlot={
              showUtilities ? (
                <SuggestionToolbar
                  variant="desktop"
                  compact
                  expireSeconds={expireSeconds}
                  onRefresh={onRefresh}
                />
              ) : null
            }
          />
        ) : (
          <MarketsRow
            defs={categoryFilterDefs}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            expireSeconds={expireSeconds}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  )
}
