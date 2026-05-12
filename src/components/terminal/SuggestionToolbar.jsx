import { terminalGradientCta } from '../../design-system/tokens/terminalConnectWallet'
import { terminalAssets as a } from '../../figma/terminalAssets.js'

function formatCountdown(totalSec) {
  const s = Math.max(0, totalSec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r.toString().padStart(2, '0')}s`
}

export default function SuggestionToolbar({ expireSeconds, onRefresh }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2 whitespace-nowrap leading-tight">
        <p className="text-sm text-white">Suggestions Expire in:</p>
        <p className="text-base font-semibold text-[#269755]">{formatCountdown(expireSeconds)}</p>
      </div>
      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#242424] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5"
        >
          <span className="relative size-4 shrink-0">
            <img alt="" className="absolute inset-0 size-full max-w-none p-[12.5%]" src={a.shareIcon} />
          </span>
          Share
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className={`${terminalGradientCta.componentClassName} gap-1.5`}
        >
          <span className="relative size-4 shrink-0">
            <img alt="" className="absolute inset-0 size-full max-w-none p-[16.66%]" src={a.refreshIcon} />
          </span>
          Refresh
        </button>
      </div>
    </div>
  )
}
