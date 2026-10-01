import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";

/**
 * Form parts of the phone trade ticket (Figma "Copilot / Trade Ticket — Full
 * Content" 947:3345). Kept apart from the sheet so the Trade page and the
 * copilot cards render the exact same controls.
 */

/**
 * Two-up pill toggle — Figma "Side Toggle" (947:3385) / "Margin Mode" (947:3390).
 * `activeClass` maps an option value to its selected fill.
 */
export function AppSegmented({ options, value, onChange, activeClass, ariaLabel }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex w-full gap-px rounded-[10px] border border-app-line bg-app-bg p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`app-pressable flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg text-app-body leading-5 ${
              active
                ? `font-semibold text-ink ${activeClass?.(opt.value) ?? "bg-app-accent-subtle"}`
                : "text-ink-muted active:bg-white/[0.04]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Underline tabs — Figma "Order Type Tabs" (947:3395). */
export function AppUnderlineTabs({ options, value, onChange, ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex w-full">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`flex h-11 min-w-0 flex-1 items-center justify-center border-b-[3px] text-app-body leading-[16.8px] transition-colors ${
              active
                ? "border-ink font-bold text-ink"
                : "border-transparent text-ink-muted active:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const HINT_TONE = {
  gain: "text-app-positive",
  loss: "text-app-negative",
};

/**
 * Labelled amount input — Figma "Margin" (947:3403) / "Gain %" (947:3435).
 * 16px text and a decimal keypad so iOS neither zooms nor shows letters.
 */
export function AppAmountField({
  label,
  hint,
  hintTone = "gain",
  icon = appIcons.dollar20,
  value,
  onChange,
  onBlur,
  placeholder = "0.00",
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="flex items-start justify-between whitespace-nowrap text-app-caption">
        <span className="text-ink-muted">{label}</span>
        {hint != null ? (
          <span className={`font-semibold ${HINT_TONE[hintTone]}`}>{hint}</span>
        ) : null}
      </span>
      <span className="flex h-11 w-full items-center gap-2 rounded-lg border border-app-line-strong bg-app-bg px-3 transition-colors focus-within:border-app-line-accent">
        <AppIcon src={icon} size={20} className="text-ink" />
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          onBlur={onBlur}
          className="h-full min-w-0 flex-1 bg-transparent text-app-headline leading-5 text-ink outline-none placeholder:text-ink-faint"
        />
      </span>
    </label>
  );
}

/**
 * Figma "Size Slider" / "Leverage Slider" (947:3415, 947:3421): an 8px gold
 * track, brand-gradient fill and the value at the right. A transparent native
 * range sits over the track — 44px tall — so it drags with a thumb-sized hit
 * area and keeps keyboard / screen-reader support.
 */
export function AppRangeSlider({ value, min = 0, max = 100, step = 1, onChange, valueLabel, ariaLabel }) {
  const span = Math.max(max - min, 1);
  const pct = Math.min(100, Math.max(0, ((value - min) / span) * 100));
  return (
    <div className="flex w-full items-center gap-3">
      <div className="relative h-2 min-w-0 flex-1 rounded bg-app-accent-subtle">
        <div
          className="absolute inset-y-0 left-0 rounded bg-[linear-gradient(90deg,#f7bb08_65.39%,#2fffce)]"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          aria-valuetext={valueLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 cursor-pointer appearance-none opacity-0"
        />
      </div>
      <span className="h-5 w-10 shrink-0 text-right text-app-body leading-5 text-ink">
        {valueLabel}
      </span>
    </div>
  );
}

/** Figma "Early Exit Optimization" (947:3442): 16px box + 12px label. */
export function AppCheckbox({ checked, onChange, label }) {
  return (
    <label className="flex h-6 cursor-pointer items-center gap-2 self-start">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-app-accent/60 ${
          checked ? "border-app-accent bg-app-accent text-black" : "border-ink-muted"
        }`}
        aria-hidden
      >
        {checked ? <AppIcon src={appIcons.check12} size={12} /> : null}
      </span>
      <span className="text-app-caption text-ink-muted">{label}</span>
    </label>
  );
}

/**
 * Section disclosure — Figma "Take Profit/Stop Loss Toggle" (947:3425). The
 * design draws the chevron down while open; collapsed it turns to point right.
 */
export function AppCollapseToggle({ title, open, onToggle, controls }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className="flex min-h-11 w-full items-center justify-between -my-2.5"
    >
      <span className="text-app-headline font-semibold text-ink-muted">{title}</span>
      <AppIcon
        src={appIcons.chevronDown20}
        size={20}
        className={`text-ink-muted transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
      />
    </button>
  );
}
