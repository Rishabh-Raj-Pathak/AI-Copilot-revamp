import { Clock, RefreshCw, Share2 } from 'lucide-react'
import { terminalGradientCta } from '../../design-system/tokens/terminalConnectWallet'

function formatCountdown(totalSec, mobile = false) {
  const s = Math.max(0, totalSec)
  const m = Math.floor(s / 60)
  const r = s % 60
  if (mobile) {
    return `${m.toString().padStart(2, '0')}m ${r.toString().padStart(2, '0')}s`
  }
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
  const showDiscovery = variant === 'discovery'
  const expired = expireSeconds <= 0
  const useMobileCountdown = compact || showMobile || showDiscovery

  const expireBlock = (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 leading-tight sm:items-center sm:gap-x-2 sm:whitespace-nowrap">
      <p
        className={`${
          useMobileCountdown ? "text-xs text-[#757575]" : "text-sm text-white"
        }`}
      >
        {useMobileCountdown ? "Expires in:" : "Suggestions Expire in:"}
      </p>
      <p
        className={`font-semibold ${
          useMobileCountdown ? "text-sm" : "text-base"
        } ${expired ? "text-[#d53d3d]" : "text-[#269755]"}`}
      >
        {expired ? "Expired" : formatCountdown(expireSeconds, useMobileCountdown)}
      </p>
    </div>
  )

  const actionButtons = (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        aria-label="Share"
        className={`flex cursor-pointer items-center justify-center rounded-md border border-[#242424] font-medium text-white hover:bg-white/5 ${
          compact || showDiscovery
            ? 'min-h-8 gap-1.5 px-2.5 py-1 text-xs max-sm:size-8 max-sm:p-0'
            : 'gap-1.5 px-3 py-2 text-sm sm:py-1.5'
        }`}
      >
        <Share2
          className={`shrink-0 ${compact || showDiscovery ? 'size-3.5' : 'size-4'}`}
          strokeWidth={2}
          aria-hidden
        />
        <span className={compact || showDiscovery ? 'max-sm:sr-only' : undefined}>
          Share
        </span>
      </button>
      <button
        type="button"
        aria-label="Refresh suggestions"
        onClick={onRefresh}
        className={`${terminalGradientCta.componentClassName} justify-center font-semibold ${
          compact || showDiscovery
            ? '!min-h-8 gap-1.5 !px-2.5 !py-1 !text-xs max-sm:!size-8 max-sm:!p-0'
            : 'gap-1.5 py-2 sm:py-1.5'
        }`}
      >
        <RefreshCw
          className={`shrink-0 ${compact || showDiscovery ? 'size-3.5' : 'size-4'}`}
          strokeWidth={2}
          aria-hidden
        />
        <span className={compact || showDiscovery ? 'max-sm:sr-only' : undefined}>
          Refresh
        </span>
      </button>
    </div>
  )

  if (showDiscovery) {
    return (
      <div className="flex shrink-0 items-center gap-2 max-sm:gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5 max-sm:max-w-[7.5rem]">
          <Clock
            className="size-3.5 shrink-0 text-[#757575] max-sm:hidden"
            aria-hidden
          />
          {expireBlock}
        </div>
        {actionButtons}
      </div>
    )
  }

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
