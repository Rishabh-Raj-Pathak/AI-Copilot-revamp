import { terminalKpiBar } from '../../design-system/tokens/terminalKpiBar'
import { terminalAssets as a } from '../../figma/terminalAssets.js'
import {
  formatMobileCount,
  formatMobileRewardsUsd,
  formatMobileVolumeUsd,
} from './copilotMobileFormat.js'
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
  { id: 'trending', label: 'Trending', icon: a.trending },
  { id: 'hip3', label: 'HIP-3', icon: a.hyperliquid },
  { id: 'tradexyz', label: 'Trade[XYZ]', icon: a.spotlight },
]

function formatVol(n) {
  return `$${n.toLocaleString('en-US')}`
}

function FilterPills({ defs, activeFilter, onFilterChange, mobile = false }) {
  return (
    <div
      className={
        mobile
          ? 'minimal-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5'
          : 'minimal-scrollbar flex min-w-0 flex-1 flex-wrap items-center gap-1.5 max-tablet:flex-nowrap max-tablet:overflow-x-auto max-tablet:pb-0.5 sm:gap-2'
      }
    >
      {defs.map((f) => {
        const active = f.id === activeFilter
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`flex shrink-0 items-center border font-medium transition-colors ${
              mobile
                ? 'min-h-8 gap-1 rounded-md px-2.5 py-1 text-xs'
                : 'gap-1.5 rounded-full px-3 py-1.5 text-xs max-tablet:min-h-9 max-tablet:px-2.5 max-tablet:py-1.5'
            } ${
              active
                ? mobile
                  ? 'border-transparent bg-[#3e2e00] text-[#f2b500]'
                  : 'border-[#242424] bg-[#3e2e00] text-[#f2b500]'
                : 'border-[#242424] bg-transparent text-white hover:bg-white/5'
            }`}
          >
            {f.icon ? (
              <span
                className={`relative shrink-0 ${mobile ? 'size-3' : 'size-3.5'}`}
              >
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

export default function MarketFiltersBar({
  activeFilter,
  onFilterChange,
  stats,
  expireSeconds,
  onRefresh,
}) {
  const rewards = stats.rewards ?? stats.volume * 0.0003
  const showMobileToolbar =
    expireSeconds !== undefined && typeof onRefresh === 'function'

  return (
    <div className="flex w-full shrink-0 flex-col border-b border-[#242424]">
      {/* Mobile — Figma 1017:24652 */}
      <div className="flex flex-col gap-3 px-3 py-3 max-tablet:flex tablet:hidden">
        <div className="grid grid-cols-3 gap-2 border-b border-[#242424] pb-3">
          <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
            <span className="text-[11px] leading-tight text-[#757575]">
              Total Volume
            </span>
            <span className="truncate text-sm font-semibold text-white">
              {formatMobileVolumeUsd(stats.volume)}
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
            <span className="text-[11px] leading-tight text-[#757575]">
              Trades Executed
            </span>
            <span className="truncate text-sm font-semibold text-white">
              {formatMobileCount(stats.trades)}
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
            <span className="text-[11px] leading-tight text-[#757575]">
              Rewards Distributed
            </span>
            <span className="truncate text-sm font-semibold text-white">
              {formatMobileRewardsUsd(rewards)}
            </span>
          </div>
        </div>
        <FilterPills
          defs={mobileFilterDefs}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          mobile
        />
        {showMobileToolbar ? (
          <SuggestionToolbar
            variant="mobile"
            expireSeconds={expireSeconds}
            onRefresh={onRefresh}
          />
        ) : null}
      </div>

      {/* Desktop / tablet — unchanged */}
      <div className="hidden w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3 tablet:flex">
        <FilterPills
          defs={filterDefs}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
        <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div className="flex flex-wrap items-start justify-start gap-x-3 gap-y-1.5 leading-tight sm:gap-5 sm:whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className={terminalKpiBar.labelClassName}>Total Volume:</span>
              <span className={terminalKpiBar.valueClassName}>
                {formatVol(stats.volume)}
              </span>
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
      </div>
    </div>
  )
}
