import "../../design-system/vaults/index.css";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import VaultsMobileNavBar from "../terminal/VaultsMobileNavBar.jsx";
import { DeltaNeutralVaults3Page } from "../../delta-neutral/pages/DeltaNeutralVaults3Page.tsx";
import { DeltaNeutralVaultsV2Page } from "../../delta-neutral/pages/DeltaNeutralVaultsV2Page.tsx";

/*
 * Both Delta Neutral versions share this shell -- header, mobile nav, scroll container
 * and bottom nav are chrome, not part of either version, and forking them would mean
 * every future navbar change had to be made twice.
 *
 * `version` picks the body and, with it, which entry the nav menus tick. It is the only
 * thing that differs between the two routes, so a third version is one more entry here
 * and one more in VAULT_VIEWS.
 */
const VERSION_PAGES = {
  1: DeltaNeutralVaults3Page,
  2: DeltaNeutralVaultsV2Page,
};

export default function DeltaNeutralVaultsPage({
  version = 1,
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onOpenSupport,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
  onOpenRewards,
  onOpenCompete,
  onOpenTrade,
  onOpenCopilotTutorial,
  onVaultViewChange,
}) {
  const VersionPage = VERSION_PAGES[version] ?? VERSION_PAGES[1];
  const vaultView = `delta-neutral-${version}`;

  return (
    <div className="delta-neutral-root flex h-dvh min-h-0 flex-col overflow-hidden bg-[#050505] text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <VaultsMobileNavBar
        vaultView={vaultView}
        onVaultViewChange={onVaultViewChange}
      />
      <HeaderTerminal
        activeNavItem="Vaults"
        vaultView={vaultView}
        onVaultViewChange={onVaultViewChange}
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Trade") onOpenTrade?.();
          if (label === "Rewards") onOpenRewards?.();
          if (label === "KOL") onOpenRewards?.("kol");
          if (label === "Compete") onOpenCompete?.();
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
          <VersionPage />
        </div>
      </div>

      <CopilotBottomNav
        activeId="vaults"
        vaultView={vaultView}
        onVaultViewChange={onVaultViewChange}
        onOpenCompete={onOpenCompete}
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
