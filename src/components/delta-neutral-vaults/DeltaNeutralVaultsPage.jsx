import "../../design-system/vaults/index.css";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import AppTopBar from "../mobile/AppTopBar.jsx";
import useIsMobile from "../mobile/useIsMobile.js";
import AgentsSwitcher from "../mobile/agents/AgentsSwitcher.jsx";
import { DeltaNeutralVaults3Page } from "../../delta-neutral/pages/DeltaNeutralVaults3Page.tsx";
import { DeltaNeutralVaultsV2Page } from "../../delta-neutral/pages/DeltaNeutralVaultsV2Page.tsx";

/*
 * Both Delta Neutral versions share this shell -- header, scroll container and, on a
 * phone, the app top bar and Agents switcher are chrome, not part of either version,
 * and forking them would mean every future navbar change had to be made twice.
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
  const isMobile = useIsMobile();

  /*
   * Phone: Figma "Agents / Delta Neutral -- Full Page" (951:4048) -- app top bar with
   * the "Agents" title and the Delta Neutral / Alpha Agents header tabs, then the
   * version body. The global tab bar is fixed, so the scroll
   * area clears it; the positions drawer the body pins above it is cleared by the body.
   */
  if (isMobile) {
    return (
      <div className="delta-neutral-root flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-white">
        <AppTopBar title="Agents" meta="Fully non-custodial">
          <AgentsSwitcher />
        </AppTopBar>
        <div className="delta-neutral-minimal-scrollbar vaults-root min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
          <div className="flex w-full flex-col gap-4 px-5 pt-4 max-[374px]:px-4">
            <VersionPage />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delta-neutral-root flex h-dvh min-h-0 flex-col overflow-hidden bg-[#050505] text-white">
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
    </div>
  );
}
