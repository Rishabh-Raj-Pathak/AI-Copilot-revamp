import { useEffect, useRef, useState } from "react";
import ConnectWalletButton from "./ConnectWalletButton.jsx";
import TerminalPlatformSelect from "./TerminalPlatformSelect.jsx";
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
  onProductTour,
  onProductTour1,
  onProductTour2,
  activeNavItem = "AI Copilot",
  onNavItemClick,
  showProductTour = true,
  walletConnected,
  onWalletConnected,
  terminalPlatform,
  onTerminalPlatformChange,
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  const showDualProductTour =
    showProductTour &&
    typeof onProductTour1 === "function" &&
    typeof onProductTour2 === "function";

  const showSingleProductTour =
    showProductTour &&
    typeof onProductTour === "function" &&
    !showDualProductTour;

  const moreMenuHasTour = showDualProductTour || showSingleProductTour;

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

  return (
    <header className="flex min-h-16 shrink-0 w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-[#242424] bg-black px-3 py-2.5 sm:gap-x-3 sm:px-5 sm:py-3 lg:h-16 lg:flex-nowrap lg:gap-4 lg:py-3">
      <div
        className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5"
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
        <nav className="minimal-scrollbar flex min-w-0 flex-1 items-end gap-1.5 overflow-x-auto sm:gap-2 lg:flex-initial lg:overflow-visible">
          {nav.map((label) => {
            const active = label === activeNavItem;
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
              aria-expanded={moreMenuHasTour ? moreMenuOpen : undefined}
              aria-haspopup={moreMenuHasTour ? "menu" : undefined}
              onClick={() => {
                if (!moreMenuHasTour) return;
                setMoreMenuOpen((o) => !o);
              }}
              className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/5 sm:px-3 sm:text-sm"
            >
              More
              <NavChevron className="size-4 shrink-0 text-[#bfbfbf]" />
            </button>
            {moreMenuOpen && moreMenuHasTour ? (
              <div
                className="absolute right-0 top-full z-[120] mt-1 min-w-[11rem] rounded-md border border-[#242424] bg-[#121212] py-1 shadow-lg"
                role="menu"
              >
                {showDualProductTour ? (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 sm:text-sm"
                      onClick={() => {
                        onProductTour1?.();
                        setMoreMenuOpen(false);
                      }}
                    >
                      Get started 1
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 sm:text-sm"
                      onClick={() => {
                        onProductTour2?.();
                        setMoreMenuOpen(false);
                      }}
                    >
                      Get started 2
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 sm:text-sm"
                    onClick={() => {
                      onProductTour?.();
                      setMoreMenuOpen(false);
                    }}
                  >
                    Get started
                  </button>
                )}
                <p className="border-t border-[#242424] px-3 pb-2 pt-1.5 text-[10px] leading-snug text-[#757575]">
                  For our reference
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
