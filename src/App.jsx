import { useState } from "react";
import TerminalCopilotPage from "./components/terminal/TerminalCopilotPage.jsx";
import VaultsPage from "./components/vaults/VaultsPage.jsx";

export default function App() {
  const [page, setPage] = useState("copilot");
  const [walletConnected, setWalletConnected] = useState(false);
  const [terminalPlatform, setTerminalPlatform] = useState("hyperliquid");

  if (page === "vaults") {
    return (
      <VaultsPage
        walletConnected={walletConnected}
        onWalletConnected={() => setWalletConnected(true)}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={setTerminalPlatform}
        onOpenCopilot={() => setPage("copilot")}
      />
    );
  }

  return (
    <TerminalCopilotPage
      walletConnected={walletConnected}
      onWalletConnected={() => setWalletConnected(true)}
      terminalPlatform={terminalPlatform}
      onTerminalPlatformChange={setTerminalPlatform}
      onOpenVaults={() => setPage("vaults")}
    />
  );
}
