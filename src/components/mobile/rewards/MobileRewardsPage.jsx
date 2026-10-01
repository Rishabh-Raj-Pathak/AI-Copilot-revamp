import { useState } from "react";
import AppTopBar from "../AppTopBar.jsx";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { KOL_REWARD_STATS, REWARD_STATS } from "../../rewards/rewardsMockData.js";
import { EnterCodeCard, ReferralCodeCard, TierCard } from "./RewardsCards.jsx";
import RewardsStats from "./RewardsStats.jsx";
import RewardsTierGrid from "./RewardsTierGrid.jsx";
import RewardsActivityTable from "./RewardsActivityTable.jsx";

/**
 * Phone Rewards — Figma "Rewards / Referral — Full Page" (955:4978).
 *
 * A tab screen: the app top bar, then one scrolling column in the artboard's
 * order — tier, your code, enter a code, the four stat tiles, the tier ladder
 * and the referral table — 16px apart. The global tab bar is `App`'s.
 *
 * The artboard is the signed-out state. Connected, the same cards fill with
 * the rewards mock data; signed out, any action opens the network picker the
 * top bar's Connect button uses, so the page never dead-ends.
 *
 * `variant="kol"` is the Gautam campaign page on the same layout.
 */
export default function MobileRewardsPage({
  variant = "rewards",
  onWalletConnected,
  onWalletDisconnect,
  onTerminalPlatformChange,
}) {
  const app = useMobileApp();
  const toast = useAppToast();
  const isKol = variant === "kol";
  const connected = app.walletConnected;
  const [connectOpen, setConnectOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const stats = isKol ? KOL_REWARD_STATS : REWARD_STATS;

  const requireWallet = () => setConnectOpen(true);

  const connect = () => {
    setConnectOpen(false);
    (onWalletConnected ?? app.connectWallet)();
    toast.show({ title: "Wallet connected" });
  };

  const claim = () => {
    setClaimed(true);
    toast.show({
      title: `${stats.claimableRewards} claimed`,
      message: isKol ? "Includes your 8% fee cashback." : "Sent to your wallet.",
    });
  };

  const shared = { variant, connected, onRequireWallet: requireWallet };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-ink">
      <AppTopBar
        onWalletConnected={onWalletConnected}
        onWalletDisconnect={onWalletDisconnect}
        onTerminalPlatformChange={onTerminalPlatformChange}
      />

      <main className="app-no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
          {isKol ? (
            <header className="flex flex-col gap-1.5">
              <h1 className="text-app-display font-semibold text-ink">Gautam Community Rewards</h1>
              <p className="text-app-callout text-ink-muted">
                Trade, hit milestones, earn rewards, and get 8% fee cashback.
              </p>
            </header>
          ) : null}
          <TierCard variant={variant} connected={connected} />
          <ReferralCodeCard {...shared} />
          <EnterCodeCard {...shared} />
          <RewardsStats {...shared} claimed={claimed} onClaim={claim} />
          <RewardsTierGrid variant={variant} connected={connected} />
          <RewardsActivityTable variant={variant} connected={connected} onConnect={requireWallet} />
        </div>
      </main>

      <ConnectNetworkSheet
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onSelect={connect}
      />
    </div>
  );
}
