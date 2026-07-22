import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { REWARD_VIEWS } from "./rewardsNavData.js";

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

export default function RewardsNavDropdown({
  activeView = "rewards",
  onViewChange,
  navActive = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={`flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
          navActive
            ? "bg-[#3e2e00] text-[#f2b500]"
            : "text-white hover:bg-white/5"
        }`}
      >
        Rewards
        <NavChevron
          className={`size-4 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          } ${navActive ? "text-[#f2b500]" : "text-white/80"}`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Rewards experience"
          className="absolute left-0 top-full z-[120] mt-1 min-w-[12.75rem] overflow-hidden rounded-md border border-[#242424] bg-[#0f0f0f] py-1 shadow-lg"
        >
          {REWARD_VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onViewChange?.(view.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs text-white transition-colors hover:bg-white/10 sm:text-sm"
            >
              <span>{view.label}</span>
              {view.id === activeView ? (
                <Check className="size-3.5 shrink-0 text-[#f2b500]" aria-hidden />
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
