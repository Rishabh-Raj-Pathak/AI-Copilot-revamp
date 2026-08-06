import { useEffect, useId, useRef, useState } from "react";
import { refreshCopilotTourIfActive } from "../../copilot/copilotTour.js";
import {
  terminalPlatformSelect as s,
  terminalPlatforms,
} from "../../design-system/tokens/terminalPlatformSelect";
import hyperliquidLogo from "@/assets/hyperliquid-logo.png";
import nadoLogo from "@/assets/nado-logo.png";
import pacificaLogo from "@/assets/pacifica-logo.png";

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

const VENUE_LOGO_SRC = {
  hyperliquid: hyperliquidLogo,
  nado: nadoLogo,
  pacifica: pacificaLogo,
};

/** Venue marks. Paradex has no brand asset yet, so it falls back to a geometric mark. */
function PlatformMark({ id }) {
  const logo = VENUE_LOGO_SRC[id];
  if (logo) {
    return (
      <img alt="" className="size-[18px] max-w-none object-contain" src={logo} />
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
  compact = false,
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
        className={
          compact
            ? "flex size-9 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-black p-1.5 outline-none transition-colors hover:bg-[#0d0d0d] focus-visible:ring-2 focus-visible:ring-[#f2b500]/40"
            : s.trigger
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={compact ? `Platform: ${current.label}` : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={compact ? "flex size-full items-center justify-center" : s.iconFrame}>
          <PlatformMark id={selected} />
        </span>
        {compact ? null : (
          <>
            <span className="max-w-38 truncate">{current.label}</span>
            <NavChevron className={s.chevron} open={open} />
          </>
        )}
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
