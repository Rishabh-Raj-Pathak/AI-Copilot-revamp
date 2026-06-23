import { useState } from "react";
import { destroyCopilotProductTourIfStillActive } from "./copilot/copilotTour.js";
import { destroyVaultsProductTourIfStillActive } from "./copilot/vaultsTour.js";
import InstallAppPrompt from "./components/install/InstallAppPrompt.jsx";
import DeltaNeutralVaultsPage from "./components/delta-neutral-vaults/DeltaNeutralVaultsPage.jsx";
import TerminalCopilotPage from "./components/terminal/TerminalCopilotPage.jsx";
import VaultsPage from "./components/vaults/VaultsPage.jsx";

export default function App() {
  const [page, setPage] = useState("copilot");
  const [walletConnected, setWalletConnected] = useState(false);
  const [terminalPlatform, setTerminalPlatform] = useState("hyperliquid");
  const [runCopilotTourOnEnter, setRunCopilotTourOnEnter] = useState(false);
  const [runVaultTourOnEnter, setRunVaultTourOnEnter] = useState(false);

  const handleVaultViewChange = (viewId) => {
    if (viewId === "delta-neutral") {
      setPage("delta-neutral-vaults");
      return;
    }
    setPage("vaults");
  };

  const sharedWalletProps = {
    walletConnected,
    onWalletConnected: () => setWalletConnected(true),
    terminalPlatform,
    onTerminalPlatformChange: setTerminalPlatform,
  };

  const content =
    page === "vaults" ? (
      <VaultsPage
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
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
    <>
      {content}
      <InstallAppPrompt page={page} />
    </>
  );
}
