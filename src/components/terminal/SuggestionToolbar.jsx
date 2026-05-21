import { Clock } from 'lucide-react'
import { terminalGradientCta } from '../../design-system/tokens/terminalConnectWallet'
import { terminalAssets as a } from '../../figma/terminalAssets.js'

function formatCountdown(totalSec) {
  const s = Math.max(0, totalSec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r.toString().padStart(2, '0')}s`
}

function MobileStatusRow({ expireSeconds, onRefresh }) {
  const expired = expireSeconds <= 0

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1.5">
        <Clock className="size-4 shrink-0 text-[#757575]" aria-hidden />
        <p className="text-sm text-[#757575]">
          Expires In:{' '}
          <span
            className={
              expired
                ? 'font-semibold text-[#d53d3d]'
                : 'font-semibold text-[#269755]'
            }
          >
            {expired ? 'Expired' : formatCountdown(expireSeconds)}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex min-h-8 items-center justify-center gap-1 rounded-md border border-[#242424] px-2.5 py-1 text-xs font-medium text-white hover:bg-white/5"
          >
            <span className="relative size-3.5 shrink-0">
              <img
                alt=""
                className="absolute inset-0 size-full max-w-none p-[12.5%]"
                src={a.shareIcon}
              />
            </span>
            Share
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className={`${terminalGradientCta.componentClassName} !min-h-8 justify-center gap-1 !px-2.5 !py-1 !text-xs !font-semibold`}
          >
            <span className="relative size-3.5 shrink-0">
              <img
                alt=""
                className="absolute inset-0 size-full max-w-none p-[16.66%]"
                src={a.refreshIcon}
              />
            </span>
            Refresh
          </button>
      </div>
    </div>
  )
}

export default function SuggestionToolbar({
  expireSeconds,
  onRefresh,
  variant = 'both',
}) {
  const showMobile = variant === 'both' || variant === 'mobile'
  const showDesktop = variant === 'both' || variant === 'desktop'

  return (
    <>
      {showMobile ? (
        <div
          className={
            variant === 'both' ? 'max-tablet:flex tablet:hidden' : 'flex'
          }
        >
          <MobileStatusRow
            expireSeconds={expireSeconds}
            onRefresh={onRefresh}
          />
        </div>
      ) : null}

      {/* Desktop / tablet — unchanged */}
      {showDesktop ? (
      <div className="hidden w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 tablet:flex">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-tight sm:items-center sm:whitespace-nowrap">
          <p className="text-sm text-white">Suggestions Expire in:</p>
          <p className="text-base font-semibold text-[#269755]">
            {formatCountdown(expireSeconds)}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#242424] px-3 py-2 text-sm font-medium text-white hover:bg-white/5 sm:w-auto sm:py-1.5"
          >
            <span className="relative size-4 shrink-0">
              <img
                alt=""
                className="absolute inset-0 size-full max-w-none p-[12.5%]"
                src={a.shareIcon}
              />
            </span>
            Share
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className={`${terminalGradientCta.componentClassName} w-full justify-center gap-1.5 py-2 sm:w-auto sm:py-1.5`}
          >
            <span className="relative size-4 shrink-0">
              <img
                alt=""
                className="absolute inset-0 size-full max-w-none p-[16.66%]"
                src={a.refreshIcon}
              />
            </span>
            Refresh
          </button>
        </div>
      </div>
      ) : null}
    </>
  )
}
