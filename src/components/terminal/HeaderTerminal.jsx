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
  activeNavItem = "AI Copilot",
  onNavItemClick,
  showProductTour = true,
  walletConnected,
  onWalletConnected,
  terminalPlatform,
  onTerminalPlatformChange,
}) {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-[#242424] bg-black px-5 py-3">
      <div
        className="flex min-w-0 items-center gap-5"
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
        <nav className="flex items-end gap-2">
          {nav.map((label) => {
            const active = label === activeNavItem;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onNavItemClick?.(label)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#3e2e00] text-[#f2b500]"
                    : "text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5"
          >
            More
            <NavChevron className="size-4 shrink-0 text-[#bfbfbf]" />
          </button>
          {showProductTour && typeof onProductTour === "function" ? (
            <button
              type="button"
              onClick={onProductTour}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[#bfbfbf] hover:bg-white/5 hover:text-white"
            >
              Product Tour
            </button>
          ) : null}
        </nav>
      </div>
      <div className="terminal-header-actions flex shrink-0 items-center justify-end gap-3">
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
