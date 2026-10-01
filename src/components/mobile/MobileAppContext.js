import { createContext, useContext } from "react";

/**
 * App-level state the phone shell needs on every screen: where to go when a
 * tab or row is tapped, the back stack for pushed screens, the wallet session,
 * the selected venue and the tutorials.
 *
 * Provided once by `App`. Before this, each page wired its own `onNavClick`
 * and several silently dropped tabs (Trade did nothing from Copilot, Vaults or
 * Delta Neutral). Reading navigation from one place removes that class of bug.
 */
const MobileAppContext = createContext(null);

export const MobileAppProvider = MobileAppContext.Provider;

/** Screens reached by drilling in. They get the back nav bar and a history entry. */
export const PUSHED_PAGES = new Set([
  "compete",
  "points",
  "profile",
  "support",
  "delete-account",
]);

/** Which tab a page belongs to; pushed screens highlight none (per Figma). */
export function tabForPage(page) {
  if (page === "copilot") return "copilot";
  if (page === "vaults" || page === "dn-vaults-1" || page === "dn-vaults-2") return "agents";
  if (page === "trade") return "trade";
  if (page === "rewards" || page === "kol") return "rewards";
  return null;
}

const FALLBACK = {
  page: "copilot",
  navigate: () => {},
  goBack: () => {},
  walletConnected: false,
  address: "",
  connectWallet: () => {},
  disconnectWallet: () => {},
  terminalPlatform: "hyperliquid",
  setTerminalPlatform: () => {},
  pointsBalance: 0,
  runCopilotTutorial: undefined,
  runVaultTutorial: undefined,
};

export function useMobileApp() {
  return useContext(MobileAppContext) ?? FALLBACK;
}
