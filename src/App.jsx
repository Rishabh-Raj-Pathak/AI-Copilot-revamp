import { useState } from "react";
import { destroyCopilotProductTourIfStillActive } from "./copilot/copilotTour.js";
import { destroyVaultsProductTourIfStillActive } from "./copilot/vaultsTour.js";
import InstallAppPrompt from "./components/install/InstallAppPrompt.jsx";
import TerminalCopilotPage from "./components/terminal/TerminalCopilotPage.jsx";
import VaultsPage from "./components/vaults/VaultsPage.jsx";

export default function App() {
  const [page, setPage] = useState("copilot");
  const [walletConnected, setWalletConnected] = useState(false);
  const [terminalPlatform, setTerminalPlatform] = useState("hyperliquid");
  const [runCopilotTourOnEnter, setRunCopilotTourOnEnter] = useState(false);
  const [runVaultTourOnEnter, setRunVaultTourOnEnter] = useState(false);

  const content =
    page === "vaults" ? (
      <VaultsPage
        walletConnected={walletConnected}
        onWalletConnected={() => setWalletConnected(true)}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={setTerminalPlatform}
        onOpenCopilot={() => setPage("copilot")}
        onOpenCopilotTutorial={() => {
          destroyVaultsProductTourIfStillActive();
          setRunCopilotTourOnEnter(true);
          setPage("copilot");
        }}
        runProductTourOnEnter={runVaultTourOnEnter}
        onProductTourEnterConsumed={() => setRunVaultTourOnEnter(false)}
      />
    ) : (
      <TerminalCopilotPage
        walletConnected={walletConnected}
        onWalletConnected={() => setWalletConnected(true)}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={setTerminalPlatform}
        onOpenVaults={() => setPage("vaults")}
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
