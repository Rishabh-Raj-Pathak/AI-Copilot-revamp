import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import AppTopBar from "../mobile/AppTopBar.jsx";
import useIsMobile from "../mobile/useIsMobile.js";
import AgentsSwitcher from "../mobile/agents/AgentsSwitcher.jsx";
import { MarketMakingApp } from "../../market-making/MarketMakingApp.tsx";

/*
 * Market Making, the third kind of agent beside Delta Neutral and Alpha Agents.
 *
 * The body is the standalone app from /market-making, ported to
 * src/market-making. Its own fake navbar is gone; this shell supplies the real
 * chrome, the same way `DeltaNeutralVaultsPage` does: `HeaderTerminal` on
 * desktop, the app top bar and Agents tabs on a phone.
 *
 * `version` is the standalone app's layout (1-3), picked from VAULT_VIEWS.
 * `.mm-root` scopes that app's base styles (see its styles/theme.css).
 */
const LAYOUT_FOR_VERSION = { 1: "v1", 2: "v2", 3: "v3" };

export default function MarketMakingPage({
  version = 2,
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
  const variant = LAYOUT_FOR_VERSION[version] ?? "v2";
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-white">
        <AppTopBar title="Agents" meta="Fully non-custodial">
          <AgentsSwitcher />
        </AppTopBar>
        <div className="mm-root min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
          <div className="px-5 pt-5 pb-8 max-[374px]:px-4">
            <MarketMakingApp variant={variant} compact />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#050505] text-white">
      <HeaderTerminal
        activeNavItem="Vaults"
        vaultView={`market-making-${version}`}
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

      <div className="mm-root minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <main className="mx-auto max-w-[1240px] px-5 pt-6 pb-16 lg:px-8 lg:pt-8">
          <MarketMakingApp variant={variant} />
        </main>
      </div>
    </div>
  );
}
