import AppTopBar from "../mobile/AppTopBar.jsx";

/**
 * Phone header for Copilot, Rewards and the other tab screens — the Figma
 * "Top Bar" from the mobile app kit (`src/components/mobile`).
 *
 * Wallet state and navigation come from the shell context. The page handlers
 * are still accepted so a page can attach its own side effects (the copilot
 * tour listens for venue changes); anything not passed uses the shell default.
 */
export default function CopilotMobileHeader({
  onWalletConnected,
  onWalletDisconnect,
  onTerminalPlatformChange,
}) {
  return (
    <AppTopBar
      onWalletConnected={onWalletConnected}
      onWalletDisconnect={onWalletDisconnect}
      onTerminalPlatformChange={onTerminalPlatformChange}
    />
  );
}
