/**
 * Shared order-panel primitives. Used by both the AI Copilot `DetailsPanel`
 * and the Trade page `TradeOrderPanel`.
 */
import { useId } from "react";
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

/**
 * Checkbox + label as one control. A bare `Checkbox` inside a `<label>` only
 * answers to clicks on the 16px box — a `<button>` is not a labelable element,
 * so the browser never forwards the label click to it.
 */
export function CheckboxRow({ checked, onChange, label, className = "" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`group flex w-full items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#f2b500]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
    >
      <span className="relative size-4 shrink-0" aria-hidden>
        {checked ? (
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none"
            src={a.checkboxCheck}
          />
        ) : (
          <span className="absolute inset-0 rounded-sm border-[1.5px] border-[#6a6a6a] transition-colors group-hover:border-[#bfbfbf]" />
        )}
      </span>
      {label}
    </button>
  );
}

/**
 * Two/three-way segmented control. `size="xs"` is the in-field variant that
 * rides inside a `TriggerField` (the $ ⇄ % unit switch); the default size is
 * the standalone one (TP/SL trigger source).
 */
export function Segmented({
  value,
  options,
  onChange,
  ariaLabel,
  size = "sm",
}) {
  const xs = size === "xs";
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex shrink-0 items-center rounded-md border border-[#242424] bg-[#0f0f0f] ${
        xs ? "p-px" : "p-0.5"
      }`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(o.value)}
            className={`rounded-sm transition-colors ${
              xs ? "px-1.5 py-px text-micro" : "px-2 py-0.5 text-data"
            } ${
              active
                ? "bg-[#3e2e00] font-medium text-[#f2b500]"
                : "text-ink-subtle hover:text-ink-muted"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
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
 * `ticks` splits the rail into evenly-spaced stops (5 → 0/25/50/75/100). Only
 * the *interior* stops get a dot: a dot centred on a rail cap is half-clipped
 * by the cap's own radius, which reads as a stray dot floating past the track.
 *
 * `milestones` adds the stop values as a clickable row under the rail, so the
 * scale is legible without dragging and each stop is one tap away.
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
  milestones = false,
  formatMilestone = (v) => `${v}%`,
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const s = terminalSetupSlider;

  const stops =
    ticks > 1
      ? Array.from({ length: ticks }, (_, i) => ({
          at: (i / (ticks - 1)) * 100,
          stopValue: Math.round(min + ((max - min) * i) / (ticks - 1)),
        }))
      : [];

  const rail = (
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
      {stops.slice(1, -1).map((stop) => (
        <span
          key={stop.at}
          aria-hidden
          className={`pointer-events-none absolute top-1/2 z-5 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            pct >= stop.at ? "bg-black/35" : "bg-white/20"
          }`}
          style={{ left: `${stop.at}%` }}
        />
      ))}
      <div className={s.thumbWrap} style={{ left: `${pct}%` }}>
        <span className={s.thumb} aria-hidden />
      </div>
    </div>
  );

  if (!milestones || stops.length < 2) {
    return (
      <div className={s.root}>
        {rail}
        {valueLabel ? <p className={s.value}>{valueLabel}</p> : null}
      </div>
    );
  }

  return (
    <div className={s.root}>
      <div className={s.stack}>
        {rail}
        <div className={s.marks}>
          {stops.map((stop, i) => (
            <button
              key={stop.at}
              type="button"
              onClick={() => onChange(stop.stopValue)}
              aria-label={`Set to ${formatMilestone(stop.stopValue)}`}
              className={`${s.mark} hover:text-[#f2b500] ${
                pct + 0.5 >= stop.at ? "text-[#f2b500]" : "text-ink-faint"
              }`}
              style={{
                left: `${stop.at}%`,
                transform:
                  i === 0
                    ? "none"
                    : i === stops.length - 1
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
              }}
            >
              {formatMilestone(stop.stopValue)}
            </button>
          ))}
        </div>
      </div>
      {valueLabel ? <p className={s.value}>{valueLabel}</p> : null}
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
      <span className="text-data text-ink-muted">{label}</span>
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
        <span className="min-w-0 flex-1 text-control text-ink">
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
      <span className="text-control font-medium text-ink-muted">{title}</span>
      <CollapseChevron
        className={`size-5 shrink-0 text-ink-subtle transition-transform duration-200 ease-out group-hover:text-ink-muted ${open ? "rotate-180" : "rotate-0"}`}
      />
    </button>
  );
}

/** `hint` colours — Gain % reads green, Loss % red (order panel parity). */
const HINT_TONES = {
  brand: "text-[#f2b500]",
  gain: "text-[#269755]",
  loss: "text-[#d53d3d]",
};

/**
 * TP/SL field. Label and value share the box — label pinned left, value
 * right-aligned against the unit control — which is what lets a two-column
 * TP/SL grid stay legible at order-panel width.
 *
 * The label is a real label, not placeholder text: a placeholder disappears
 * the moment a value lands in the field, and four filled boxes of digits are
 * exactly when "is this the TP or the SL leg" needs answering.
 *
 * `unitSlot` takes a `Segmented size="xs"` ($ ⇄ %); `hint` renders the
 * converted value under the field.
 */
export function TriggerField({
  label,
  value,
  onChange,
  unitSlot,
  hint,
  hintTone = "brand",
}) {
  const inputId = useId();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* gap-1, not more: the value is right-aligned, so it grows leftward
          toward the label and every extra pixel of gap comes off the digits. */}
      <div className="flex h-9 min-w-0 items-center gap-1 rounded-lg border border-[#242424] bg-[#050505] pl-2.5 pr-1.5 transition-colors focus-within:border-[#3a3a3a]">
        <label
          htmlFor={inputId}
          className="shrink-0 cursor-text text-data text-ink-muted"
        >
          {label}
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-right text-data text-ink outline-none placeholder:text-ink-faint"
        />
        {unitSlot}
      </div>
      {hint ? (
        <span
          className={`px-0.5 text-meta ${HINT_TONES[hintTone] ?? HINT_TONES.brand}`}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/**
 * `$`-prefixed free-text numeric field (Trade page). Unlike `StepperField`
 * this is an editable input, not a display + arrows.
 */
export function AmountField({
  label,
  value,
  onChange,
  hint,
  hintTone = "brand",
  percent = false,
  readOnly = false,
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-data text-ink-muted">{label}</span>
        {hint ? (
          <span
            className={`text-data ${HINT_TONES[hintTone] ?? HINT_TONES.brand}`}
          >
            {hint}
          </span>
        ) : null}
      </div>
      <div
        className={`flex items-center gap-2 rounded-md border border-[#242424] px-3 py-2 ${
          readOnly ? "bg-[#0f0f0f]" : "bg-black focus-within:border-[#3a3a3a]"
        }`}
      >
        {percent ? (
          <PercentGlyph />
        ) : (
          <span className="w-4 shrink-0 text-center text-data text-ink-muted">
            $
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          aria-label={label}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`min-w-0 flex-1 bg-transparent text-control outline-none placeholder:text-ink-faint ${
            readOnly ? "cursor-not-allowed text-ink-faint" : "text-ink"
          }`}
        />
      </div>
    </div>
  );
}
