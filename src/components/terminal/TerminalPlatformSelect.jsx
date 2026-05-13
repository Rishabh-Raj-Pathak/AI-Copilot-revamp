import { useEffect, useId, useRef, useState } from "react";
import { refreshCopilotTourIfActive } from "../../copilot/copilotTour.js";
import {
  terminalPlatformSelect as s,
  terminalPlatforms,
} from "../../design-system/tokens/terminalPlatformSelect";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

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

/** Venue marks for non-Figma platforms — simple geometric marks, mint-forward palette. */
function PlatformMark({ id }) {
  if (id === "hyperliquid") {
    return (
      <img
        alt=""
        className="size-[18px] max-w-none object-contain"
        src={a.hyperliquid}
      />
    );
  }
  if (id === "nado") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-[18px] text-[#5eead4]"
        aria-hidden
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M6 8h12M6 12h12M6 16h9"
        />
      </svg>
    );
  }
  if (id === "pacifica") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-[18px] text-[#38bdf8]"
        aria-hidden
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M4 14c3-4 9-4 16 0M6 17c2.5-2 6.5-2 12 0"
        />
      </svg>
    );
  }
  if (id === "paradex") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-[18px] text-[#c4b5fd]"
        aria-hidden
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          d="M12 5l7 7-7 7-7-7 7-7z"
        />
      </svg>
    );
  }
  return null;
}

/**
 * Navbar venue selector — pill + dropdown (Hyperliquid, Nado, Pacifica, Paradex).
 * Styling from {@link terminalPlatformSelect}.
 */
export default function TerminalPlatformSelect({
  value,
  onChange,
  onPlatformChange,
  defaultValue = "hyperliquid",
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = isControlled ? value : uncontrolled;
  const setSelected = (id) => {
    if (!isControlled) setUncontrolled(id);
    onChange?.(id);
  };

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const current =
    terminalPlatforms.find((p) => p.id === selected) ?? terminalPlatforms[0];

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
        className={s.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={s.iconFrame}>
          <PlatformMark id={selected} />
        </span>
        <span className="max-w-38 truncate">{current.label}</span>
        <NavChevron className={s.chevron} open={open} />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Trading platform"
          className={s.menu}
        >
          {terminalPlatforms.map((p) => {
            const active = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`${s.menuItem} ${active ? s.menuItemActive : ""}`}
                onClick={() => {
                  if (p.id !== selected) {
                    onPlatformChange?.(p.id);
                  }
                  setSelected(p.id);
                  setOpen(false);
                }}
              >
                <span className={s.menuItemIconFrame}>
                  <PlatformMark id={p.id} />
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
