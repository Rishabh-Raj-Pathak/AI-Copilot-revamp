import { useEffect, useState } from 'react'
import { copilotPriceChart } from '../../../figma/terminalAssets.js'

/**
 * Single chart image (Figma 4039:11895). Shown after `delayMs` once `active`
 * so the graph does not mount on the same frame as the expand click.
 */
export default function SuggestionPriceChart({ active, delayMs = 3 }) {
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    if (!active) {
      setShowImage(false)
      return undefined
    }
    const id = window.setTimeout(() => setShowImage(true), delayMs)
    return () => {
      window.clearTimeout(id)
      setShowImage(false)
    }
  }, [active, delayMs])

  if (!active) return null

  return (
    <div className="mt-5 flex w-full justify-center overflow-hidden rounded-xl border border-[#2e2200] bg-[#0a0a0a] p-2">
      {showImage ? (
        <img
          alt=""
          src={copilotPriceChart}
          className="mx-auto block max-h-[220px] w-full max-w-full rounded-lg border border-[#1a1a1a] object-contain object-top"
        />
      ) : (
        <div
          className="h-[220px] max-h-[220px] w-full max-w-full rounded-lg bg-[#0d0d0d]"
          aria-hidden
        />
      )}
    </div>
  )
}
