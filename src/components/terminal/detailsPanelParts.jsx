/**
 * Shared order-panel primitives. Used by both the AI Copilot `DetailsPanel`
 * and the Trade page `TradeOrderPanel`.
 */
import { terminalSetupSlider } from "../../design-system/tokens/terminalSetupSlider";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

/** Feather-style chevron (same path as FiChevronDown); inline SVG avoids react-icons resolve issues. */
export function CollapseChevron({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Checkbox({ checked, onChange, className = "size-6 shrink-0" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative ${className}`}
    >
      {!checked ? (
        <span className="absolute inset-[16.67%] rounded-[2px] border-[1.5px] border-[#bfbfbf]" />
      ) : (
        <span className="absolute inset-[16.67%]">
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none"
            src={a.checkboxCheck}
          />
        </span>
      )}
    </button>
  );
}

/** Minimal % glyph for Gain % / Loss % fields (replaces fragile remote SVG asset). */
export function PercentGlyph({ className = "size-4 shrink-0 text-[#bfbfbf]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <circle
        cx="16"
        cy="15"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M9.8 16.2 14.2 7.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Terminal setup sliders — tokens: `--ds-brand-gradient-horizontal`, `.ds-terminal-slider*`
 *
 * `ticks` draws evenly-spaced stop dots along the rail (the Trade page's
 * 0/25/50/75/100 percent track); omit it for a plain rail.
 */
export function CopilotSetupSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  valueLabel,
  ariaLabel,
  ticks = 0,
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const s = terminalSetupSlider;
  return (
    <div className={s.root}>
      <div className={s.well}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          className={s.input}
        />
        <div className={s.trackRail} aria-hidden />
        <div className={s.trackFill} style={{ width: `${pct}%` }} aria-hidden />
        {ticks > 1
          ? Array.from({ length: ticks }, (_, i) => {
              const at = (i / (ticks - 1)) * 100;
              return (
                <span
                  key={at}
                  aria-hidden
                  className={`pointer-events-none absolute top-1/2 z-[5] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    pct >= at ? "bg-[#f2b500]" : "bg-[#4a4a4a]"
                  }`}
                  style={{ left: `${at}%` }}
                />
              );
            })
          : null}
        <div className={s.thumbWrap} style={{ left: `${pct}%` }}>
          <div className={s.thumbHit}>
            <img
              alt=""
              className="block size-full max-w-none"
              src={a.sliderStop}
            />
          </div>
        </div>
      </div>
      <p className={s.value}>{valueLabel}</p>
    </div>
  );
}

export function StepperField({
  label,
  value,
  onDelta,
  showArrows = true,
  percentIcon = false,
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs text-[#bfbfbf]">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-[#242424] bg-black px-3 py-2">
        {percentIcon ? (
          <span className="flex size-4 shrink-0 items-center justify-center">
            <PercentGlyph />
          </span>
        ) : (
          <span className="relative size-4 shrink-0">
            <img
              alt=""
              className="absolute inset-0 size-full max-w-none p-[12.5%_29.17%]"
              src={a.dollarIcon}
            />
          </span>
        )}
        <span className="min-w-0 flex-1 text-sm font-medium text-white">
          {value}
        </span>
        {showArrows ? (
          <span className="relative size-4 shrink-0">
            <button
              type="button"
              aria-label="Increase"
              onClick={() => onDelta(1)}
              className="absolute top-0 left-0 z-10 h-1/2 w-full cursor-pointer"
            />
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => onDelta(-1)}
              className="absolute bottom-0 left-0 z-10 h-1/2 w-full cursor-pointer"
            />
            <img
              alt=""
              className="pointer-events-none absolute inset-0 size-full max-w-none p-[12.5%_31.25%]"
              src={a.chevronPair}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function CollapseHeading({ title, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="group flex w-full items-center justify-between gap-2 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#f2b500]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <span className="text-base font-medium text-[#d9d9d9]">{title}</span>
      <CollapseChevron
        className={`size-5 shrink-0 text-[#bfbfbf] transition-transform duration-200 ease-out group-hover:text-[#d9d9d9] ${open ? "rotate-180" : "rotate-0"}`}
      />
    </button>
  );
}

/**
 * `$`-prefixed free-text numeric field (Trade page). Unlike `StepperField`
 * this is an editable input, not a display + arrows.
 */
export function AmountField({ label, value, onChange, hint, percent = false }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-[#bfbfbf]">{label}</span>
        {hint ? <span className="text-xs text-[#f2b500]">{hint}</span> : null}
      </div>
      <div className="flex items-center gap-2 rounded-md border border-[#242424] bg-black px-3 py-2 focus-within:border-[#3a3a3a]">
        {percent ? (
          <PercentGlyph />
        ) : (
          <span className="w-4 shrink-0 text-center text-sm text-[#bfbfbf]">
            $
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-[#5a5a5a]"
        />
      </div>
    </div>
  );
}
