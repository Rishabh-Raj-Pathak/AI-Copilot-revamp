import { useRef, useState } from "react";
import { destroyCopilotProductTourIfStillActive } from "./copilot/copilotTour.js";
import { destroyVaultsProductTourIfStillActive } from "./copilot/vaultsTour.js";
import CompetePage from "./components/compete/CompetePage.jsx";
import DeltaNeutralVaultsPage from "./components/delta-neutral-vaults/DeltaNeutralVaultsPage.jsx";
import { pushHistoryLayer, releaseHistoryLayer } from "./components/mobile/appHistory.js";
import AppTabBar from "./components/mobile/AppTabBar.jsx";
import { AppToastProvider } from "./components/mobile/AppToast.jsx";
import { MobileAppProvider, PUSHED_PAGES } from "./components/mobile/MobileAppContext.js";
import MobilePageTransition from "./components/mobile/MobilePageTransition.jsx";
import MobilePnlCalendarPage from "./components/mobile/pnl/MobilePnlCalendarPage.jsx";
import MobilePointsPage from "./components/mobile/points/MobilePointsPage.jsx";
import DeleteAccountFlow from "./components/mobile/profile/DeleteAccountFlow.jsx";
import ProfilePage from "./components/profile/ProfilePage.jsx";
import { ProfileProvider } from "./components/profile/ProfileContext.jsx";
import RewardsPage from "./components/rewards/RewardsPage.jsx";
import SupportPage from "./components/support/SupportPage.jsx";
import TerminalCopilotPage from "./components/terminal/TerminalCopilotPage.jsx";
import TradePage from "./components/trade/TradePage.jsx";
import VaultsPage from "./components/vaults/VaultsPage.jsx";
import { AgentLogsProvider } from "./components/vaults/agentLogs/AgentLogsContext.jsx";
import { MOCK_WALLET_ADDRESS } from "./lib/wallet.js";

/** Mock points balance shown once a wallet is connected (Figma "Top Bar / Connected"). */
const MOCK_POINTS_BALANCE = 77.62;

export default function App() {
  const [page, setPage] = useState("copilot");
  const [walletConnected, setWalletConnected] = useState(false);
  const [terminalPlatform, setTerminalPlatform] = useState("hyperliquid");
  const [runCopilotTourOnEnter, setRunCopilotTourOnEnter] = useState(false);
  const [runVaultTourOnEnter, setRunVaultTourOnEnter] = useState(false);
  /** Where the back arrow on the profile page returns to. */
  const [profileReturnPage, setProfileReturnPage] = useState("copilot");
  /** Where the back arrow on the support page returns to. */
  const [supportReturnPage, setSupportReturnPage] = useState("copilot");
  /** Phone tabs reopen the last sub-view they showed (Agents → DN or Alpha). */
  const [lastAgentsPage, setLastAgentsPage] = useState("dn-vaults-1");
  const [lastRewardsPage, setLastRewardsPage] = useState("rewards");
  /**
   * Phone back stack for pushed screens. Each entry owns one browser-history
   * entry, so Android back / iOS swipe-back pops the screen like a native app.
   * A ref, not state: it is only read inside event handlers.
   */
  const mobileStackRef = useRef([]);

  // Rebuilt every render, so `page` is always the screen being left.
  const mobileNavigate = (target) => {
    const resolved =
      target === "agents" ? lastAgentsPage : target === "rewards" ? lastRewardsPage : target;
    const from = page;
    if (resolved === from) return;

    if (PUSHED_PAGES.has(resolved)) {
      // Neither tour has anchors on a pushed screen; a live overlay would strand.
      destroyCopilotProductTourIfStillActive();
      destroyVaultsProductTourIfStillActive();
      const entry = { page: from, layer: null };
      entry.layer = pushHistoryLayer({
        onPop: () => {
          const stack = mobileStackRef.current;
          const index = stack.indexOf(entry);
          if (index === -1) return;
          stack.splice(index);
          setPage(entry.page);
        },
      });
      mobileStackRef.current.push(entry);
    } else {
      // A tab switch resets the stack, like tapping a tab in a native app.
      const entries = mobileStackRef.current.splice(0);
      for (const entry of entries.reverse()) releaseHistoryLayer(entry.layer);
      if (resolved === "vaults" || resolved.startsWith("dn-vaults")) setLastAgentsPage(resolved);
      if (resolved === "rewards" || resolved === "kol") setLastRewardsPage(resolved);
    }
    setPage(resolved);
  };

  const mobileGoBack = () => {
    const entry = mobileStackRef.current.pop();
    if (entry) releaseHistoryLayer(entry.layer);
    setPage(entry?.page ?? "copilot");
  };

  /*
   * The nav menus hand back a VAULT_VIEWS id; this is the one place it becomes a page.
   * "delta-neutral" used to be a single view -- it is now numbered, and the number is
   * carried through into the page id so the two versions are separate routes rather
   * than one route with a toggle inside it.
   */
  const handleVaultViewChange = (viewId) => {
    if (viewId?.startsWith("delta-neutral")) {
      setPage(viewId === "delta-neutral-2" ? "dn-vaults-2" : "dn-vaults-1");
      return;
    }
    setPage("vaults");
  };

  const leaveProfile = () => setPage(profileReturnPage);
  const leaveSupport = () => setPage(supportReturnPage);

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
    onOpenSupport: () => {
      if (page === "support") return;
      // Same reasoning as profile: neither tour has an anchor on the support
      // page, so a still-running overlay would strand itself on top of it.
      destroyCopilotProductTourIfStillActive();
      destroyVaultsProductTourIfStillActive();
      setSupportReturnPage(page);
      setPage("support");
    },
    terminalPlatform,
    onTerminalPlatformChange: setTerminalPlatform,
  };

  const openTrade = () => setPage("trade");
  const openRewards = (viewId = "rewards") =>
    setPage(viewId === "kol" ? "kol" : "rewards");
  const openCompete = () => setPage("compete");

  const runCopilotTutorialFromShell = () => {
    destroyVaultsProductTourIfStillActive();
    setRunCopilotTourOnEnter(true);
    mobileNavigate("copilot");
  };
  const runVaultTutorialFromShell = () => {
    destroyCopilotProductTourIfStillActive();
    setRunVaultTourOnEnter(true);
    mobileNavigate("vaults");
  };

  const mobileApp = {
    page,
    navigate: mobileNavigate,
    goBack: mobileGoBack,
    walletConnected,
    address: MOCK_WALLET_ADDRESS,
    connectWallet: () => setWalletConnected(true),
    disconnectWallet: () => {
      setWalletConnected(false);
      // Profile and account screens describe a session that no longer exists.
      if (page === "profile" || page === "delete-account") mobileGoBack();
    },
    terminalPlatform,
    setTerminalPlatform,
    pointsBalance: walletConnected ? MOCK_POINTS_BALANCE : 0,
    runCopilotTutorial: runCopilotTutorialFromShell,
    runVaultTutorial: runVaultTutorialFromShell,
  };

  const content =
    page === "points" ? (
      <MobilePointsPage />
    ) : page === "pnl-calendar" ? (
      <MobilePnlCalendarPage />
    ) : page === "delete-account" ? (
      <DeleteAccountFlow />
    ) : page === "support" ? (
      <SupportPage
        {...sharedWalletProps}
        onBack={leaveSupport}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "profile" ? (
      <ProfilePage
        {...sharedWalletProps}
        onBack={leaveProfile}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "rewards" ? (
      <RewardsPage
        key="rewards"
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "kol" ? (
      <RewardsPage
        key="kol"
        variant="kol"
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "compete" ? (
      <CompetePage
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
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
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
        onVaultViewChange={handleVaultViewChange}
      />
    ) : page === "vaults" ? (
      <VaultsPage
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
        onOpenCopilotTutorial={() => {
          destroyVaultsProductTourIfStillActive();
          setRunCopilotTourOnEnter(true);
          setPage("copilot");
        }}
        onVaultViewChange={handleVaultViewChange}
        runProductTourOnEnter={runVaultTourOnEnter}
        onProductTourEnterConsumed={() => setRunVaultTourOnEnter(false)}
      />
    ) : page === "dn-vaults-1" || page === "dn-vaults-2" ? (
      <DeltaNeutralVaultsPage
        // Remount on the version switch. The two pages hold their own builder and
        // active-vault state; without a key React reconciles one into the other and
        // v2 inherits whatever v1 was mid-way through setting up.
        key={page}
        version={page === "dn-vaults-2" ? 2 : 1}
        {...sharedWalletProps}
        onOpenCopilot={() => setPage("copilot")}
        onOpenTrade={openTrade}
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
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
        onOpenRewards={openRewards}
        onOpenCompete={openCompete}
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
        <MobileAppProvider value={mobileApp}>
          <AppToastProvider>
            <MobilePageTransition pageKey={page}>{content}</MobilePageTransition>
            {/* One persistent phone tab bar (`tablet:hidden`); the delete flow
                hides it so nothing competes with the destructive footer. */}
            {page === "delete-account" ? null : <AppTabBar />}
          </AppToastProvider>
        </MobileAppProvider>
      </ProfileProvider>
    </AgentLogsProvider>
  );
}
