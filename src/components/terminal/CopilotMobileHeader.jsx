import ConnectWalletButton from "./ConnectWalletButton.jsx";
import TerminalPlatformSelect from "./TerminalPlatformSelect.jsx";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

function Logo() {
  return (
    <div className="flex h-[29px] shrink-0 items-center gap-2">
      <div className="relative h-5 w-[15px] shrink-0">
        <img
          alt=""
          className="absolute inset-0 size-full max-w-none"
          src={a.logoMark}
        />
      </div>
      <p className="whitespace-nowrap text-white">
        <span className="text-[18px] font-semibold leading-[1.2]">Hypr</span>
        <span className="bg-gradient-to-r from-[#f7bb08] from-[65.388%] to-[#2fffce] bg-clip-text text-[18px] font-semibold leading-[1.2] text-transparent">
          Earn
        </span>
      </p>
    </div>
  );
}

function ProfileAvatar() {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#242424] bg-[#1a1a1a] text-[10px] font-semibold text-[#bfbfbf]"
      aria-hidden
    >
      U
    </span>
  );
}

export default function CopilotMobileHeader({
  walletConnected,
  onWalletConnected,
  terminalPlatform,
  onTerminalPlatformChange,
}) {
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b border-[#242424] bg-black px-3 py-3 max-tablet:flex tablet:hidden">
      <div className="flex items-center justify-between gap-2">
        <div data-tour="copilot-overview">
          <Logo />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TerminalPlatformSelect
            value={terminalPlatform}
            onChange={onTerminalPlatformChange}
            compact
          />
          <ProfileAvatar />
          <div data-tour="wallet-connect" className="shrink-0">
            {walletConnected ? (
              <button
                type="button"
                className="flex max-w-[9.5rem] items-center gap-1.5 rounded-md border border-[#242424] px-2.5 py-2 text-xs font-medium text-white hover:bg-white/5"
              >
                <span className="relative size-4 shrink-0">
                  <img
                    alt=""
                    className="absolute inset-0 size-full max-w-none p-[16.67%]"
                    src={a.walletIcon}
                  />
                </span>
                <span className="truncate">0xbf4…4eed</span>
              </button>
            ) : (
              <ConnectWalletButton onConnect={() => onWalletConnected?.()} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
