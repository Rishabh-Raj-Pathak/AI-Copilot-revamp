import ClockIcon from './ClockIcon.jsx'

/** Tag row — matches Figma chip variants on node 4039:11883. */
export default function SetupChip({ chip }) {
  if (chip.kind === 'side') {
    const long = chip.label === 'Long'
    if (long) {
      return (
        <span className="rounded-full border border-[#0a2917] bg-[#05150c] px-2 py-0.5 text-xs font-medium text-[#269755]">
          {chip.label}
        </span>
      )
    }
    return (
      <span className="rounded-full border border-[#470f0f] bg-[#260808] px-2 py-0.5 text-xs font-medium text-[#d53d3d]">
        {chip.label}
      </span>
    )
  }

  if (chip.kind === 'win') {
    return (
      <span className="rounded-full border border-[#0a2917] bg-[#05150c] px-2 py-0.5 text-xs font-medium text-[#269755]">
        {chip.label}
      </span>
    )
  }

  if (chip.kind === 'review') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#242424] bg-[#121212] px-2 py-0.5 text-xs font-medium text-white">
        <ClockIcon className="size-3 shrink-0 text-[#bfbfbf]" />
        {chip.label}
      </span>
    )
  }

  if (chip.kind === 'muted') {
    return (
      <span className="rounded-full border border-[#242424] bg-[#121212] px-2 py-0.5 text-xs font-medium text-white">
        {chip.label}
      </span>
    )
  }

  if (chip.kind === 'rr') {
    return (
      <span className="text-xs font-medium text-[#f2b500]">{chip.label}</span>
    )
  }

  if (chip.kind === 'range') {
    return (
      <span className="rounded-full border border-[#242424] bg-[#121212] px-2.5 py-0.5 text-xs font-medium text-[#bfbfbf]">
        {chip.label}
      </span>
    )
  }

  return (
    <span className="rounded-full border border-[#242424] bg-[#121212] px-2 py-0.5 text-xs font-medium text-white">
      {chip.label}
    </span>
  )
}
