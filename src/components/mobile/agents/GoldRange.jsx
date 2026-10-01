/**
 * The gold slider used across the Agents screens.
 *
 * `size="lg"` — Delta Neutral Margin / Leverage (Figma "Slider", 952:4097):
 * 8px track, bronze→gold fill, 20px gradient thumb.
 * `size="sm"` — Alpha agent allocation (Figma "Allocation", 950:4068):
 * 4px recessed track, 16px flat gold thumb.
 *
 * In both, the thumb is centred on the fill's end, so at 0 and 100 it hangs
 * half a thumb past the track — give the parent that much side room.
 *
 * A native range input sits on top for drag, keyboard and screen readers. It
 * is widened by one thumb so its own thumb centre lands exactly where the
 * drawn one does, and made 44px tall so a thumb tip can grab it.
 */
const SIZES = {
  lg: {
    thumb: 20,
    track: "h-2 rounded-full bg-white/[0.14]",
    fill: "h-2 rounded-full bg-[linear-gradient(90deg,#8f6a33_0%,#d6b06a_100%)]",
    knob: "border border-[rgba(232,213,181,0.28)] bg-[linear-gradient(180deg,#f2ddb5_0%,#ba8f52_100%)]",
    height: "h-5",
  },
  sm: {
    thumb: 16,
    track: "h-1 rounded-full border border-white/[0.05] bg-[#1e1b18]",
    fill: "h-[3px] rounded-full bg-[linear-gradient(180deg,#5a431e_0%,#785a28_100%)]",
    knob: "border border-[rgba(232,213,181,0.2)] bg-[#ccb17f] shadow-[0_2px_2px_rgba(0,0,0,0.3)]",
    height: "h-4",
  },
};

export default function GoldRange({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  size = "lg",
  ariaLabel,
  ariaValueText,
  className = "",
}) {
  const s = SIZES[size] ?? SIZES.lg;
  const span = max - min || 1;
  const ratio = Math.min(1, Math.max(0, (Number(value) - min) / span));
  const pct = `${ratio * 100}%`;

  return (
    <div className={`relative flex min-w-0 items-center ${s.height} ${className}`}>
      <div className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 ${s.track}`} />
      <div
        className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 ${s.fill}`}
        style={{ width: pct }}
      />
      <div
        className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${s.knob}`}
        style={{ left: pct, width: s.thumb, height: s.thumb }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        className="absolute top-1/2 h-11 -translate-y-1/2 cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-[var(--gold-range-thumb)] [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-[var(--gold-range-thumb)] [&::-webkit-slider-thumb]:appearance-none"
        style={{
          left: -s.thumb / 2,
          width: `calc(100% + ${s.thumb}px)`,
          "--gold-range-thumb": `${s.thumb}px`,
        }}
      />
    </div>
  );
}
