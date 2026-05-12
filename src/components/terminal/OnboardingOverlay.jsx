import { useState } from 'react'

export default function OnboardingOverlay() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-w-md rounded-xl border border-[#242424] bg-[#121212] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">Welcome to AI Copilot</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#bfbfbf]">
          This demo shows AI-suggested trade setups alongside execution controls. Browse filters, review the
          highlighted setup and chart, then adjust the order panel before simulating execution.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[#bfbfbf]">
          <li>Pick a market filter (Trending is active by default)</li>
          <li>Compare suggestions and metrics on the left</li>
          <li>Use the right panel to tune size, leverage, and risk</li>
        </ul>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-[#269755] py-2.5 text-sm font-semibold text-white hover:brightness-110"
          onClick={() => setOpen(false)}
        >
          Start demo
        </button>
      </div>
    </div>
  )
}
