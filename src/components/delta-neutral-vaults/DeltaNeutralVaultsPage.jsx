import "../../design-system/vaults/index.css";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import VaultsMobileNavBar from "../terminal/VaultsMobileNavBar.jsx";
import { DeltaNeutralVaults3Page } from "../../delta-neutral/pages/DeltaNeutralVaults3Page.tsx";

export default function DeltaNeutralVaultsPage({
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onOpenSupport,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
  onOpenRewards,
  onOpenTrade,
  onOpenCopilotTutorial,
  onVaultViewChange,
}) {
  return (
    <div className="delta-neutral-root flex h-dvh min-h-0 flex-col overflow-hidden bg-[#050505] text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <VaultsMobileNavBar
        vaultView="delta-neutral"
        onVaultViewChange={onVaultViewChange}
      />
      <HeaderTerminal
        activeNavItem="Vaults"
        vaultView="delta-neutral"
        onVaultViewChange={onVaultViewChange}
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Trade") onOpenTrade?.();
          if (label === "Rewards") onOpenRewards?.();
          if (label === "KOL") onOpenRewards?.("kol");
        }}
        onCopilotTutorial={onOpenCopilotTutorial}
        showCopilotTutorial={!!onOpenCopilotTutorial}
        walletConnected={walletConnected}
        onWalletConnected={onWalletConnected}
        onWalletDisconnect={onWalletDisconnect}
        onOpenProfile={onOpenProfile}
        onOpenSupport={onOpenSupport}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={onTerminalPlatformChange}
      />

      <div className="delta-neutral-minimal-scrollbar vaults-root min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="flex w-full flex-col gap-6 px-5 py-6 pb-16 max-tablet:gap-4 max-tablet:px-4 max-tablet:py-5 max-tablet:pb-4 tablet:px-8 tablet:py-8 lg:px-10 xl:px-12">
          <DeltaNeutralVaults3Page />
        </div>
      </div>

      <CopilotBottomNav
        activeId="vaults"
        vaultView="delta-neutral"
        onVaultViewChange={onVaultViewChange}
        onNavClick={(id) => {
          if (id === "copilot") onOpenCopilot?.();
          if (id === "rewards") onOpenRewards?.();
          if (id === "kol") onOpenRewards?.("kol");
        }}
        onOpenSupport={onOpenSupport}
        onCopilotTutorial={onOpenCopilotTutorial}
      />
    </div>
  );
}
