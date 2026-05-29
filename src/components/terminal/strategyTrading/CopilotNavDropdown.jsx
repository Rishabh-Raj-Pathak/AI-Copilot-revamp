import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";

export const COPILOT_VIEWS = [
  { id: "suggestions", label: "AI Copilot" },
  { id: "strategy-trading-v1", label: "Strategy Copilot v1" },
  { id: "strategy-trading-v2", label: "Strategy Copilot v2" },
];

export function isStrategyCopilotView(viewId) {
  return (
    viewId === "strategy-trading-v1" || viewId === "strategy-trading-v2"
  );
}

export function getUiVersionFromCopilotView(viewId) {
  if (viewId === "strategy-trading-v1") return "v1";
  if (viewId === "strategy-trading-v2") return "v2";
  return "v2";
}

function NavChevron({ className }) {
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
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function getCopilotViewLabel(viewId) {
  return COPILOT_VIEWS.find((v) => v.id === viewId)?.label ?? "AI Copilot";
}

export default function CopilotNavDropdown({
  activeView,
  onViewChange,
  variant = "navbar",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const currentLabel = getCopilotViewLabel(activeView);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const pick = (id) => {
    onViewChange(id);
    setOpen(false);
  };

  const isMobile = variant === "mobile";
  const isV2Nav = activeView === "strategy-trading-v2";

  const triggerClass = isV2Nav
    ? "flex shrink-0 items-center gap-1 rounded-md border border-white/8 bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 text-xs font-medium text-[#19E6A3] backdrop-blur-sm transition-colors hover:border-white/12 hover:bg-[rgba(255,255,255,0.06)] sm:px-3 sm:text-sm"
    : isMobile
      ? "flex items-center gap-1 rounded-md border border-[#3e2e00] bg-[#3e2e00] px-2.5 py-1.5 text-xs font-medium text-[#f2b500] sm:text-sm"
      : "flex shrink-0 items-center gap-1 rounded-md bg-[#3e2e00] px-2.5 py-1.5 text-xs font-medium text-[#f2b500] transition-colors sm:px-3 sm:text-sm";

  const chevronClass = isV2Nav
    ? "text-[#19E6A3]"
    : "text-[#f2b500]";

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        {currentLabel}
        <NavChevron
          className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""} ${chevronClass}`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Copilot mode"
          className={`absolute z-[120] min-w-[12.75rem] overflow-hidden rounded-md border border-[#242424] bg-[#121212] py-1 shadow-lg ${
            isMobile ? "left-0 top-full mt-1" : "left-0 top-full mt-1"
          }`}
        >
          {COPILOT_VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="menuitem"
              onClick={() => pick(v.id)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs text-white transition-colors hover:bg-white/10 sm:text-sm"
            >
              <span>{v.label}</span>
              {v.id === activeView ? (
                <Check
                  className={`size-3.5 shrink-0 ${isV2Nav ? "text-[#19E6A3]" : "text-[#f2b500]"}`}
                  aria-hidden
                />
              ) : (
                <span className="size-3.5 shrink-0" aria-hidden />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
