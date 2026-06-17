import { Clock, RefreshCw, Share2 } from 'lucide-react'
import { terminalGradientCta } from '../../design-system/tokens/terminalConnectWallet'

function formatCountdown(totalSec) {
  const s = Math.max(0, totalSec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r.toString().padStart(2, '0')}s`
}

/** Expire timer + share/refresh — discovery controls live in MarketFiltersBar. */
export default function SuggestionToolbar({
  expireSeconds,
  onRefresh,
  variant = 'both',
  compact = false,
}) {
  const showMobile = variant === 'both' || variant === 'mobile'
  const showDesktop = variant === 'both' || variant === 'desktop'
  const expired = expireSeconds <= 0

  const expireBlock = (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight sm:items-center sm:whitespace-nowrap">
      <p className={compact ? 'text-xs text-[#757575]' : 'text-sm text-white'}>
        {compact ? 'Expires in' : 'Suggestions Expire in:'}
      </p>
      <p
        className={`font-semibold ${
          compact ? 'text-sm' : 'text-base'
        } ${expired ? 'text-[#d53d3d]' : 'text-[#269755]'}`}
      >
        {expired ? 'Expired' : formatCountdown(expireSeconds)}
      </p>
    </div>
  )

  const actionButtons = (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#242424] font-medium text-white hover:bg-white/5 ${
          compact
            ? 'min-h-8 px-2.5 py-1 text-xs'
            : 'px-3 py-2 text-sm sm:py-1.5'
        }`}
      >
        <Share2
          className={`shrink-0 ${compact ? 'size-3.5' : 'size-4'}`}
          strokeWidth={2}
          aria-hidden
        />
        Share
      </button>
      <button
        type="button"
        onClick={onRefresh}
        className={`${terminalGradientCta.componentClassName} justify-center gap-1.5 font-semibold ${
          compact
            ? '!min-h-8 !px-2.5 !py-1 !text-xs'
            : 'py-2 sm:py-1.5'
        }`}
      >
        <RefreshCw
          className={`shrink-0 ${compact ? 'size-3.5' : 'size-4'}`}
          strokeWidth={2}
          aria-hidden
        />
        Refresh
      </button>
    </div>
  )

  return (
    <>
      {showMobile ? (
        <div
          className={
            variant === 'both' ? 'max-tablet:flex tablet:hidden' : 'flex'
          }
        >
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-[#757575]" aria-hidden />
              {expireBlock}
            </div>
            {actionButtons}
          </div>
        </div>
      ) : null}

      {showDesktop ? (
        <div
          className={`hidden items-center gap-2.5 tablet:flex ${
            compact ? 'shrink-0' : 'w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end'
          }`}
        >
          {expireBlock}
          {actionButtons}
        </div>
      ) : null}
    </>
  )
}
