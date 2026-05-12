/**
 * Selection control — Figma: yellow ring; selected = filled inner disc.
 */
export default function SetupRadio({ selected }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        selected ? 'border-[#f7bb08]' : 'border-[#3a3a3a]'
      }`}
    >
      {selected ? <span className="size-3 rounded-full bg-[#f7bb08]" /> : null}
    </span>
  )
}
