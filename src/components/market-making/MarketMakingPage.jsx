import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import AppTopBar from "../mobile/AppTopBar.jsx";
import useIsMobile from "../mobile/useIsMobile.js";
import AgentsSwitcher from "../mobile/agents/AgentsSwitcher.jsx";
import MmScreen from "../mobile/mm/MmScreen.jsx";
import { MarketMakingApp } from "../../market-making/MarketMakingApp.tsx";

/*
 * Market Making, the third kind of agent beside Delta Neutral and Alpha Agents.
 *
 * The body is a clone of production's page (app.hyprearn.com/market-making),
 * in src/market-making. This shell supplies the chrome around it, the same way
 * `DeltaNeutralVaultsPage` does: `HeaderTerminal` on desktop, the app top bar
 * and Agents tabs on a phone. The desktop <main> is production's own, padding
 * and all. On a phone the body is `MmScreen` (components/mobile/mm), the same
 * page in the Delta Neutral 2 phone pattern. Signing in is the prototype's
 * wallet connection.
 *
 * `.mm-root` scopes the page's base styles (see its styles/theme.css).
 */
const MAIN =
  "mx-auto flex min-h-screen w-full max-w-[1280px] flex-1 flex-col gap-4 px-4 pb-[calc(128px+env(safe-area-inset-bottom))] pt-6 font-['Onest',sans-serif] md:px-5 md:pb-[164px] lg:pt-8";

export default function MarketMakingPage({
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
  const isMobile = useIsMobile();
  const body = (
    <main className={MAIN}>
      <MarketMakingApp signedIn={!!walletConnected} onLogin={() => onWalletConnected?.()} />
    </main>
  );

  if (isMobile) {
    return (
      <div className="vaults-root flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-white">
        <AppTopBar title="Agents" meta="Fully non-custodial">
          <AgentsSwitcher />
        </AppTopBar>
        <MmScreen />
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#050505] text-white">
      <HeaderTerminal
        activeNavItem="Vaults"
        vaultView="market-making"
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

      <div className="mm-root minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{body}</div>
    </div>
  );
}
