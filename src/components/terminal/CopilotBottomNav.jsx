import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Gift,
  Menu,
  Sparkles,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "copilot", label: "Copilot", icon: Sparkles },
  { id: "trade", label: "Trade", icon: ArrowLeftRight },
  { id: "vaults", label: "Vaults", icon: Wallet },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "more", label: "More", icon: Menu },
];

export default function CopilotBottomNav({
  activeId = "copilot",
  onNavClick,
  onCopilotTutorial,
  onVaultTutorial,
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreRef = useRef(null);

  const hasMoreMenu =
    typeof onCopilotTutorial === "function" ||
    typeof onVaultTutorial === "function";

  useEffect(() => {
    if (!moreMenuOpen) return;
    const close = (e) => {
      const el = moreRef.current;
      if (el && !el.contains(e.target)) setMoreMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreMenuOpen]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex shrink-0 items-stretch justify-around border-t border-[#242424] bg-black px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 max-tablet:flex tablet:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = id === activeId;
        const isMore = id === "more";

        if (isMore) {
          return (
            <div key={id} className="relative flex min-w-0 flex-1" ref={moreRef}>
              <button
                type="button"
                aria-expanded={moreMenuOpen}
                aria-haspopup={hasMoreMenu ? "menu" : undefined}
                onClick={() => {
                  if (hasMoreMenu) setMoreMenuOpen((o) => !o);
                }}
                className={`flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors ${
                  moreMenuOpen
                    ? "bg-[#3e2e00]/40 text-[#f2b500]"
                    : "text-[#8c8c8c] hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
              {moreMenuOpen && hasMoreMenu ? (
                <div
                  role="menu"
                  className="absolute bottom-full left-1/2 z-[60] mb-2 w-[min(14rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-[#242424] bg-[#0f0f0f] py-1 shadow-lg"
                >
                  {typeof onCopilotTutorial === "function" ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10"
                      onClick={() => {
                        onCopilotTutorial();
                        setMoreMenuOpen(false);
                      }}
                    >
                      AI Copilot tutorial
                    </button>
                  ) : null}
                  {typeof onVaultTutorial === "function" ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2.5 text-left text-sm text-white hover:bg-white/10"
                      onClick={() => {
                        onVaultTutorial();
                        setMoreMenuOpen(false);
                      }}
                    >
                      Vault tutorial
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavClick?.(id)}
            className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors ${
              active
                ? "bg-[#3e2e00]/40 text-[#f2b500] shadow-[0_0_20px_rgba(242,181,0,0.12)]"
                : "text-[#8c8c8c] hover:text-white"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={`size-5 shrink-0 ${active ? "text-[#f2b500]" : ""}`}
              strokeWidth={active ? 2.25 : 2}
              aria-hidden
            />
            <span
              className={`text-[10px] font-medium leading-none ${
                active ? "font-semibold text-[#f2b500]" : ""
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
