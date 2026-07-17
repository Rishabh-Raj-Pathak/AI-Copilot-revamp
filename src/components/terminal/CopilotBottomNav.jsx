import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Gift,
  Menu,
  Sparkles,
  Wallet,
} from "lucide-react";
import MoreSheet from "./MoreSheet.jsx";
import { VAULT_VIEWS } from "./VaultsNavDropdown.jsx";

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
  vaultView,
  onVaultViewChange,
  onOpenSupport,
  onCopilotTutorial,
  onVaultTutorial,
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [vaultMenuOpen, setVaultMenuOpen] = useState(false);
  const vaultRef = useRef(null);

  const hasVaultMenu = typeof onVaultViewChange === "function";

  useEffect(() => {
    if (!vaultMenuOpen) return;
    const close = (e) => {
      const el = vaultRef.current;
      if (el && !el.contains(e.target)) setVaultMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setVaultMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [vaultMenuOpen]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex shrink-0 items-stretch justify-around border-t border-[#242424] bg-black px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 max-tablet:flex tablet:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = id === activeId;
        const isMore = id === "more";
        const isVaults = id === "vaults";

        if (isMore) {
          return (
            <div key={id} className="relative flex min-w-0 flex-1">
              <button
                type="button"
                aria-expanded={moreMenuOpen}
                aria-haspopup="dialog"
                onClick={() => setMoreMenuOpen((o) => !o)}
                className={`flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors ${
                  moreMenuOpen
                    ? "bg-[#3e2e00]/40 text-[#f2b500]"
                    : "text-[#8c8c8c] hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
              <MoreSheet
                open={moreMenuOpen}
                onClose={() => setMoreMenuOpen(false)}
                onOpenSupport={onOpenSupport}
                onCopilotTutorial={onCopilotTutorial}
                onVaultTutorial={onVaultTutorial}
              />
            </div>
          );
        }

        if (isVaults && hasVaultMenu) {
          return (
            <div key={id} className="relative flex min-w-0 flex-1" ref={vaultRef}>
              <button
                type="button"
                aria-expanded={vaultMenuOpen}
                aria-haspopup="menu"
                onClick={() => setVaultMenuOpen((o) => !o)}
                className={`flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors ${
                  active || vaultMenuOpen
                    ? "bg-[#3e2e00]/40 text-[#f2b500] shadow-[0_0_20px_rgba(242,181,0,0.12)]"
                    : "text-[#8c8c8c] hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`size-5 shrink-0 ${active || vaultMenuOpen ? "text-[#f2b500]" : ""}`}
                  strokeWidth={active || vaultMenuOpen ? 2.25 : 2}
                  aria-hidden
                />
                <span
                  className={`text-[10px] font-medium leading-none ${
                    active || vaultMenuOpen ? "font-semibold text-[#f2b500]" : ""
                  }`}
                >
                  {label}
                </span>
              </button>
              {vaultMenuOpen ? (
                <div
                  role="menu"
                  aria-label="Vault type"
                  className="absolute bottom-full left-1/2 z-[60] mb-2 w-[min(15rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-[#242424] bg-[#0f0f0f] py-1 shadow-lg"
                >
                  {VAULT_VIEWS.map((v) => {
                    const viewActive = vaultView === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="menuitem"
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm ${
                          viewActive
                            ? "bg-[#3e2e00]/60 font-semibold text-[#f2b500]"
                            : "text-white hover:bg-white/10"
                        }`}
                        onClick={() => {
                          onVaultViewChange(v.id);
                          onNavClick?.("vaults");
                          setVaultMenuOpen(false);
                        }}
                      >
                        <span>{v.label}</span>
                        {viewActive ? (
                          <Check className="size-3.5 shrink-0 text-[#f2b500]" aria-hidden />
                        ) : null}
                      </button>
                    );
                  })}
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
