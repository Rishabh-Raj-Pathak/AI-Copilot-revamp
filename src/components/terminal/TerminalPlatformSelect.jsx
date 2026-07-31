import { useEffect, useId, useRef, useState } from "react";
import { refreshCopilotTourIfActive } from "../../copilot/copilotTour.js";
import {
  terminalPlatformSelect as s,
  terminalPlatforms,
} from "../../design-system/tokens/terminalPlatformSelect";
import { DexIcon } from "./dexIcons.jsx";

function NavChevron({ className, open }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{
        transform: open ? "rotate(180deg)" : undefined,
        transition: "transform 0.15s ease",
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckMark({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

const DEFAULT_SELECTED = ["hyperliquid"];

/**
 * Navbar venue selector — pill + checklist dropdown (Hyperliquid, Nado,
 * Pacifica, Paradex). Multi-select: `value`/`onChange` carry an array of ids,
 * and every checked dex stays visible in the trade setup panel / position
 * tables that read this selection. At least one dex must stay checked.
 * Styling from {@link terminalPlatformSelect}.
 */
export default function TerminalPlatformSelect({
  value,
  onChange,
  onPlatformChange,
  defaultValue = DEFAULT_SELECTED,
  compact = false,
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = isControlled ? value : uncontrolled;

  const toggle = (id) => {
    const isSelected = selected.includes(id);
    if (isSelected && selected.length === 1) return; // keep at least one checked
    const next = isSelected
      ? selected.filter((s2) => s2 !== id)
      : [...selected, id];
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
    onPlatformChange?.(id);
  };

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const current =
    terminalPlatforms.find((p) => p.id === selected[0]) ?? terminalPlatforms[0];
  const triggerLabel =
    selected.length === 1 ? current.label : `${selected.length} DEXs`;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => refreshCopilotTourIfActive());
  }, [open]);

  return (
    <div ref={rootRef} className={s.root} data-tour="dex-selector">
      <button
        type="button"
        className={
          compact
            ? "flex size-9 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-black p-1.5 outline-none transition-colors hover:bg-[#0d0d0d] focus-visible:ring-2 focus-visible:ring-[#f2b500]/40"
            : s.trigger
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={compact ? `Platform: ${triggerLabel}` : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={compact ? "flex size-full items-center justify-center" : s.iconFrame}>
          <DexIcon id={selected[0]} />
        </span>
        {compact ? null : (
          <>
            <span className="max-w-38 truncate">{triggerLabel}</span>
            <NavChevron className={s.chevron} open={open} />
          </>
        )}
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Trading platforms"
          aria-multiselectable="true"
          className={s.menu}
        >
          {terminalPlatforms.map((p) => {
            const active = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`${s.menuItem} ${active ? s.menuItemActive : ""}`}
                onClick={() => toggle(p.id)}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
                    active
                      ? "border-[#f2b500] bg-[#f2b500] text-black"
                      : "border-[#4a4a4a] text-transparent"
                  }`}
                >
                  <CheckMark className="size-3" />
                </span>
                <span className={s.menuItemIconFrame}>
                  <DexIcon id={p.id} />
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
