import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import ConnectWalletButton from "./ConnectWalletButton.jsx";
import TerminalPlatformSelect from "./TerminalPlatformSelect.jsx";
import CopilotNavDropdown, {
  COPILOT_VIEWS,
} from "./strategyTrading/CopilotNavDropdown.jsx";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

/** Same chevron path as DetailsPanel `CollapseChevron` — simple stroke dropdown. */
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

function Logo({ className = "h-5 w-[15px] shrink-0 relative" }) {
  return (
    <div className={className}>
      <img
        alt=""
        className="absolute inset-0 size-full max-w-none"
        src={a.logoMark}
      />
    </div>
  );
}

const nav = [
  "AI Copilot",
  "Vaults",
  "Trade",
  "Portfolio",
  "PnL Calendar",
  "Leaderboard",
  "Rewards",
];

export default function HeaderTerminal({
  onCopilotTutorial,
  onVaultTutorial,
  activeNavItem = "AI Copilot",
  onNavItemClick,
  copilotView,
  onCopilotViewChange,
  showCopilotTutorial = true,
  highlightMoreForTutorial = false,
  showMoreTutorialHint = false,
  onDismissMoreTutorialHint,
  walletConnected,
  onWalletConnected,
  terminalPlatform,
  onTerminalPlatformChange,
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const mobileNavRef = useRef(null);

  const showCopilotTutorialItem =
    showCopilotTutorial && typeof onCopilotTutorial === "function";
  const showVaultTutorialItem = typeof onVaultTutorial === "function";
  const moreMenuHasTutorial = showCopilotTutorialItem || showVaultTutorialItem;

  useEffect(() => {
    if (!moreMenuOpen) return;
    const close = (e) => {
      const el = moreMenuRef.current;
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

  useEffect(() => {
    if (!mobileNavOpen) return;
    const close = (e) => {
      const el = mobileNavRef.current;
      if (el && !el.contains(e.target)) setMobileNavOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!showMoreTutorialHint) return;
    const t = window.setTimeout(() => onDismissMoreTutorialHint?.(), 8000);
    return () => window.clearTimeout(t);
  }, [showMoreTutorialHint, onDismissMoreTutorialHint]);

  return (
    <header className="hidden min-h-16 shrink-0 w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-[#242424] bg-black px-3 py-2.5 sm:gap-x-3 sm:px-5 sm:py-3 tablet:flex tablet:h-16 tablet:flex-nowrap tablet:gap-4 tablet:py-3">
      <div
        className="flex min-w-0 flex-1 items-center gap-2 sm:gap-5"
        data-tour="copilot-overview"
      >
        <div className="flex h-[29px] shrink-0 items-center gap-2 overflow-hidden">
          <Logo />
          <p className="whitespace-nowrap text-[0px] text-white">
            <span className="font-semibold leading-[1.2] text-[18px]">
              Hypr
            </span>
            <span className="bg-gradient-to-r from-[#f7bb08] from-[65.388%] to-[#2fffce] bg-clip-text font-semibold leading-[1.2] text-[18px] text-transparent">
              Earn
            </span>
          </p>
        </div>
        <div className="relative shrink-0 max-tablet:block tablet:hidden" ref={mobileNavRef}>
          <button
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="terminal-mobile-nav"
            aria-label="Open navigation menu"
            className="flex size-11 items-center justify-center rounded-md border border-[#242424] text-white hover:bg-white/5"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {mobileNavOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
          {mobileNavOpen ? (
            <nav
              id="terminal-mobile-nav"
              className="absolute left-0 top-full z-[120] mt-1 max-h-[min(70dvh,20rem)] min-w-[12rem] overflow-y-auto rounded-md border border-[#242424] bg-[#121212] py-1 shadow-lg"
            >
              {nav.map((label) => {
                const active = label === activeNavItem;

                if (
                  label === "AI Copilot" &&
                  typeof onCopilotViewChange === "function"
                ) {
                  return (
                    <div
                      key={label}
                      className="border-b border-[#242424] px-1 py-1"
                      role="group"
                      aria-label="AI Copilot"
                    >
                      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#757575]">
                        AI Copilot
                      </p>
                      {COPILOT_VIEWS.map((v) => {
                        const viewActive = copilotView === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              onCopilotViewChange(v.id);
                              onNavItemClick?.(label);
                              setMobileNavOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left text-sm ${
                              viewActive
                                ? "bg-[#3e2e00] font-semibold text-[#f2b500]"
                                : "text-white hover:bg-white/10"
                            }`}
                          >
                            <span>{v.label}</span>
                            {viewActive ? (
                              <Check
                                className="size-3.5 shrink-0 text-[#f2b500]"
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onNavItemClick?.(label);
                      setMobileNavOpen(false);
                    }}
                    className={`block w-full px-3 py-2.5 text-left text-sm ${
                      active
                        ? "bg-[#3e2e00] font-semibold text-[#f2b500]"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              {showCopilotTutorialItem ? (
                <button
                  type="button"
                  className="block w-full border-t border-[#242424] px-3 py-2.5 text-left text-sm text-white hover:bg-white/10"
                  onClick={() => {
                    onCopilotTutorial?.();
                    setMobileNavOpen(false);
                    onDismissMoreTutorialHint?.();
                  }}
                >
                  AI Copilot tutorial
                </button>
              ) : null}
              {showVaultTutorialItem ? (
                <button
                  type="button"
                  className="block w-full border-t border-[#242424] px-3 py-2.5 text-left text-sm text-white hover:bg-white/10"
                  onClick={() => {
                    onVaultTutorial?.();
                    setMobileNavOpen(false);
                    onDismissMoreTutorialHint?.();
                  }}
                >
                  Vault tutorial
                </button>
              ) : null}
            </nav>
          ) : null}
        </div>
        <nav className="minimal-scrollbar hidden min-w-0 flex-1 items-end gap-1.5 overflow-x-auto sm:gap-2 tablet:flex tablet:flex-initial tablet:overflow-visible">
          {nav.map((label) => {
            const active = label === activeNavItem;

            if (
              label === "AI Copilot" &&
              typeof onCopilotViewChange === "function"
            ) {
              return (
                <CopilotNavDropdown
                  key={label}
                  activeView={copilotView ?? "suggestions"}
                  onViewChange={(id) => {
                    onCopilotViewChange(id);
                    onNavItemClick?.(label);
                  }}
                />
              );
            }

            return (
              <button
                key={label}
                type="button"
                onClick={() => onNavItemClick?.(label)}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "bg-[#3e2e00] text-[#f2b500]"
                    : "text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
          <div className="relative shrink-0" ref={moreMenuRef}>
            <button
              type="button"
              data-tutorial-more-trigger
              aria-expanded={moreMenuHasTutorial ? moreMenuOpen : undefined}
              aria-haspopup={moreMenuHasTutorial ? "menu" : undefined}
              onClick={() => {
                if (!moreMenuHasTutorial) return;
                onDismissMoreTutorialHint?.();
                setMoreMenuOpen((o) => !o);
              }}
              className={`flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/5 sm:px-3 sm:text-sm ${
                highlightMoreForTutorial ? "hyprearn-more-tutorial-pulse" : ""
              }`}
            >
              More
              <NavChevron className="size-4 shrink-0 text-[#bfbfbf]" />
            </button>
            {showMoreTutorialHint && !moreMenuOpen ? (
              <div
                className="absolute right-0 top-full z-[121] mt-1.5 max-w-[14rem] rounded-md border border-[#3e2e00] bg-[#171200] px-3 py-2 shadow-lg"
                role="tooltip"
              >
                <p className="text-xs leading-snug text-[#f2b500]">
                  Tutorial lives here — open <span className="text-white">More</span>{" "}
                  anytime.
                </p>
              </div>
            ) : null}
            {moreMenuOpen && moreMenuHasTutorial ? (
              <div
                className="absolute right-0 top-full z-[120] mt-1 min-w-[12.5rem] rounded-md border border-[#242424] bg-[#121212] py-1 shadow-lg"
                role="menu"
              >
                {showCopilotTutorialItem ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 sm:text-sm"
                    onClick={() => {
                      onCopilotTutorial?.();
                      setMoreMenuOpen(false);
                      onDismissMoreTutorialHint?.();
                    }}
                  >
                    AI Copilot tutorial
                  </button>
                ) : null}
                {showVaultTutorialItem ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 sm:text-sm"
                    onClick={() => {
                      onVaultTutorial?.();
                      setMoreMenuOpen(false);
                      onDismissMoreTutorialHint?.();
                    }}
                  >
                    Vault tutorial
                  </button>
                ) : null}
                <p className="border-t border-[#242424] px-3 pb-2 pt-1.5 text-[10px] leading-snug text-[#757575]">
                  Product walkthroughs
                </p>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
      <div className="terminal-header-actions flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:gap-3">
        <TerminalPlatformSelect
          value={terminalPlatform}
          onChange={onTerminalPlatformChange}
        />
        <div
          data-tour="wallet-connect"
          className="flex shrink-0 items-center gap-3"
        >
          {walletConnected ? (
            <button
              type="button"
              className="rounded-md border border-[#242424] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5"
            >
              Deposit
            </button>
          ) : null}
          {walletConnected ? (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-[#242424] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5"
            >
              <span className="relative size-4 shrink-0">
                <img
                  alt=""
                  className="absolute inset-0 size-full max-w-none p-[16.67%]"
                  src={a.walletIcon}
                />
              </span>
              0x98...3ee8
              <NavChevron className="size-4 shrink-0 text-[#757575]" />
            </button>
          ) : (
            <ConnectWalletButton onConnect={() => onWalletConnected?.()} />
          )}
        </div>
      </div>
    </header>
  );
}
