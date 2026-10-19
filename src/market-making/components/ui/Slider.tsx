import { clamp } from '../../lib/format'

export type Tick = { value: number; label: string }

type Props = {
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  ticks?: Tick[]
  disabled?: boolean
  ariaLabel: string
}

/**
 * Gold gradient slider. A native range input sits transparent on top of the
 * painted track so keyboard and pointer behaviour stay standard.
 */
export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  ticks,
  disabled,
  ariaLabel,
}: Props) {
  const pctFilled = ((clamp(value, min, max) - min) / (max - min)) * 100

  return (
    <div className={disabled ? 'opacity-45' : undefined}>
      <div className="relative h-5 select-none">
        {/* Track */}
        <div
          className="absolute top-1/2 h-[7px] w-full -translate-y-1/2 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.09)',
            boxShadow:
              'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)',
          }}
        />
        {/* Fill */}
        <div
          className="absolute top-1/2 h-[7px] -translate-y-1/2 rounded-full"
          style={{
            width: `${pctFilled}%`,
            backgroundImage: disabled
              ? 'linear-gradient(to right, #4a3d24, #6b5a38)'
              : 'linear-gradient(to right, #8f6a33, #d6b06a)',
          }}
        />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${pctFilled}%`,
            backgroundImage: 'linear-gradient(to bottom, #f2ddb5, #ba8f52)',
            border: '1px solid rgba(204,177,127,0.7)',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.28)',
          }}
        />
        <input
          type="range"
          aria-label={ariaLabel}
          min={min}
          max={max}
          step={step}
          value={clamp(value, min, max)}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>

      {ticks && ticks.length > 0 && (
        <div className="mt-2 flex justify-between">
          {ticks.map((t) => (
            <button
              key={t.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(t.value)}
              className="mm-micro-muted cursor-pointer transition-colors hover:text-mm-gold-300 disabled:cursor-not-allowed"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
