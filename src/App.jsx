import { useState } from "react";
import { destroyCopilotProductTourIfStillActive } from "./copilot/copilotTour.js";
import { destroyVaultsProductTourIfStillActive } from "./copilot/vaultsTour.js";
import InstallAppPrompt from "./components/install/InstallAppPrompt.jsx";
import DeltaNeutralVaultsPage from "./components/delta-neutral-vaults/DeltaNeutralVaultsPage.jsx";
import ProfilePage from "./components/profile/ProfilePage.jsx";
import { ProfileProvider } from "./components/profile/ProfileContext.jsx";
import TerminalCopilotPage from "./components/terminal/TerminalCopilotPage.jsx";
import TradePage from "./components/trade/TradePage.jsx";
import VaultsPage from "./components/vaults/VaultsPage.jsx";
import { AgentLogsProvider } from "./components/vaults/agentLogs/AgentLogsContext.jsx";
import { MOCK_WALLET_ADDRESS } from "./lib/wallet.js";

export default function App() {
  const [page, setPage] = useState("copilot");
  const [walletConnected, setWalletConnected] = useState(false);
  const [terminalPlatform, setTerminalPlatform] = useState("hyperliquid");
  const [runCopilotTourOnEnter, setRunCopilotTourOnEnter] = useState(false);
  const [runVaultTourOnEnter, setRunVaultTourOnEnter] = useState(false);
  /** Where the back arrow on the profile page returns to. */
  const [profileReturnPage, setProfileReturnPage] = useState("copilot");

  const handleVaultViewChange = (viewId) => {
    if (viewId === "delta-neutral") {
      setPage("delta-neutral-vaults");
      return;
    }
    setPage("vaults");
  };

  const leaveProfile = () => setPage(profileReturnPage);

  const sharedWalletProps = {
    walletConnected,
    onWalletConnected: () => setWalletConnected(true),
    onWalletDisconnect: () => {
      setWalletConnected(false);
      if (page === "profile") leaveProfile();
    },
    onOpenProfile: () => {
      if (page === "profile") return;
      // Profile has none of the anchors either tour points at — leaving one
      // running would strand its overlay on top of this page.
      destroyCopilotProductTourIfStillActive();
      destroyVaultsProductTourIfStillActive();
      setProfileReturnPage(page);
      setPage("profile");
    },
    terminalPlatform,
    onTerminalPlatformChange: setTerminalPlatform,
  };

  const openTrade = () => setPage("trade");

  const content =
    page === "profile" ? (
      <ProfilePage
        {...sharedWalletProps}
        onBack={leaveProfile}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "trade" ? (
      <TradePage
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenCopilotTutorial={() => {
          setRunCopilotTourOnEnter(true);
          setPage("copilot");
        }}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "vaults" ? (
      <VaultsPage
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenCopilotTutorial={() => {
          destroyVaultsProductTourIfStillActive();
          setRunCopilotTourOnEnter(true);
          setPage("copilot");
        }}
        onVaultViewChange={handleVaultViewChange}
        runProductTourOnEnter={runVaultTourOnEnter}
        onProductTourEnterConsumed={() => setRunVaultTourOnEnter(false)}
      />
    ) : page === "delta-neutral-vaults" ? (
      <DeltaNeutralVaultsPage
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenCopilotTutorial={() => {
          destroyVaultsProductTourIfStillActive();
          setRunCopilotTourOnEnter(true);
          setPage("copilot");
        }}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : (
      <TerminalCopilotPage
        {...sharedWalletProps}
        onOpenVaults={() => setPage("vaults")}
        onOpenTrade={openTrade}
        onOpenDeltaNeutralVaults={() => setPage("delta-neutral-vaults")}
        onVaultViewChange={handleVaultViewChange}
        onOpenVaultTutorial={() => {
          destroyCopilotProductTourIfStillActive();
          setRunVaultTourOnEnter(true);
          setPage("vaults");
        }}
        runProductTourOnEnter={runCopilotTourOnEnter}
        onProductTourEnterConsumed={() => setRunCopilotTourOnEnter(false)}
      />
    );

  return (
    <AgentLogsProvider>
      {/* `walletConnected` stays here — it drives routing, the shared wallet
          props and the tour autostart. The provider only reads it. */}
      <ProfileProvider
        walletConnected={walletConnected}
        address={MOCK_WALLET_ADDRESS}
      >
        {content}
        <InstallAppPrompt page={page} />
      </ProfileProvider>
    </AgentLogsProvider>
  );
}
