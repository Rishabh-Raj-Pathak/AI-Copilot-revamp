import ConnectWalletButton from "./ConnectWalletButton.jsx";
import WalletMenu from "./WalletMenu.jsx";
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

export default function CopilotMobileHeader({
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#242424] bg-black px-3 py-3 max-tablet:flex tablet:hidden">
      <div className="min-w-0 shrink-0" data-tour="copilot-overview">
        <Logo />
      </div>
      <div data-tour="wallet-connect" className="shrink-0">
        {walletConnected ? (
          <WalletMenu
            variant="mobile"
            onOpenProfile={onOpenProfile}
            onDisconnect={onWalletDisconnect}
          />
        ) : (
          <ConnectWalletButton onConnect={() => onWalletConnected?.()} />
        )}
      </div>
    </header>
  );
}
