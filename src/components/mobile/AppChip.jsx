import AppIcon from "./AppIcon.jsx";
import { appIcons } from "./mobileAssets.js";

/**
 * Figma "Category Chip" — Copilot's market chips, reused for the PnL Calendar
 * months and years. 32px visual, 44px hit area via the transparent ::before,
 * 13/16 type. Idle chips are outline only (white 7% edge, Medium #8F8F8F); the
 * active one takes the soft control fill (white 10% edge, SemiBold white).
 *
 * Render inside a `role="radiogroup"` row; `data-active` lets the row scroll
 * the active chip into view.
 *
 * Pass `expanded` to make it a disclosure instead (the PnL Calendar year
 * chip): white SemiBold label, a chevron that flips while open, filled while
 * open. `disabled` drops the chevron — there is nothing to open.
 */
export default function AppChip({ active, label, icon, onClick, ariaLabel, expanded, disabled = false }) {
  const disclosure = expanded !== undefined;
  return (
    <button
      type="button"
      role={disclosure ? undefined : "radio"}
      aria-checked={disclosure ? undefined : active}
      aria-expanded={disclosure && !disabled ? expanded : undefined}
      aria-label={ariaLabel}
      data-active={active || undefined}
      disabled={disabled}
      onClick={onClick}
      className={`app-pressable relative flex h-8 shrink-0 items-center gap-[5px] rounded-[9px] border px-3 text-app-callout leading-4 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] ${
        active || expanded
          ? "border-white/10 bg-app-control font-semibold text-ink"
          : disclosure
            ? "border-white/[0.07] font-semibold text-ink active:bg-white/[0.04] disabled:active:bg-transparent"
            : "border-white/[0.07] font-medium text-ink-subtle active:bg-white/[0.04]"
      }`}
    >
      {icon ? <AppIcon src={icon} size={13} /> : null}
      <span className="whitespace-nowrap">{label}</span>
      {disclosure && !disabled ? (
        <AppIcon
          src={appIcons.chevronDown14}
          size={14}
          className={`-mr-1 text-ink-subtle transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
        />
      ) : null}
    </button>
  );
}
