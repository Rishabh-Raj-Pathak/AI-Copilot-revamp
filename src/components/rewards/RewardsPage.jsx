import { useCallback, useEffect, useRef, useState } from "react";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import CopilotMobileHeader from "../terminal/CopilotMobileHeader.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import { Toast, ToastViewport } from "../ui/toast.jsx";
import ReferralActivityPanel from "./ReferralActivityPanel.jsx";
import ReferralTiersPanel from "./ReferralTiersPanel.jsx";
import { RewardsHeroRow, RewardsStatsRow } from "./RewardsSummary.jsx";
import { KOL_REWARD_STATS, REWARD_STATS } from "./rewardsMockData.js";

const FEEDBACK_MS = 2000;

/**
 * Rewards / referral dashboard — Figma Terminal `referral` (1023:15418).
 *
 * A primary nav destination, so it uses the page shell without the back arrow:
 * mobile header, desktop nav, scrolling content, bottom nav. No backend behind
 * any of the numbers (see `rewardsMockData.js`).
 */
export default function RewardsPage({
  variant = "rewards",
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onOpenSupport,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
  onOpenTrade,
  onOpenRewards,
  onVaultViewChange,
}) {
  const isKol = variant === "kol";
  const stats = isKol ? KOL_REWARD_STATS : REWARD_STATS;
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify = useCallback((message, variant = "success") => {
    setToast({ message, variant });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), FEEDBACK_MS);
  }, []);

  const walletHeaderProps = {
    walletConnected,
    onWalletConnected,
    onWalletDisconnect,
    onOpenProfile,
    onOpenSupport,
    terminalPlatform,
    onTerminalPlatformChange,
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <CopilotMobileHeader {...walletHeaderProps} />
      <HeaderTerminal
        {...walletHeaderProps}
        activeNavItem={isKol ? "KOL" : "Rewards"}
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Trade") onOpenTrade?.();
          if (label === "KOL") onOpenRewards?.("kol");
          if (label === "Rewards") onOpenRewards?.("rewards");
        }}
        showCopilotTutorial={false}
      />

      <main className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {/* Same gutter scale as every other page (see `ProfilePage`). */}
        <div className="flex w-full flex-col gap-5 px-5 py-8 pb-16 max-tablet:gap-4 max-tablet:px-4 max-tablet:py-5 max-tablet:pb-4 sm:px-8 lg:px-10 xl:px-12">
          <RewardsHeroRow onNotify={notify} variant={variant} />
          <RewardsStatsRow
            variant={variant}
            onClaim={() =>
              notify(
                isKol
                  ? `${stats.claimableRewards} claimed, including 8% fee cashback`
                  : `${stats.claimableRewards} claimed`,
              )
            }
          />
          {isKol ? <ReferralTiersPanel variant={variant} /> : null}
          <ReferralActivityPanel variant={variant} />
          {!isKol ? <ReferralTiersPanel variant={variant} /> : null}
        </div>
      </main>

      <CopilotBottomNav
        activeId="rewards"
        rewardView={variant}
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onOpenSupport={onOpenSupport}
        onNavClick={(id) => {
          if (id === "copilot") onOpenCopilot?.();
          if (id === "trade") onOpenTrade?.();
          if (id === "kol") onOpenRewards?.("kol");
          if (id === "rewards") onOpenRewards?.("rewards");
        }}
      />

      {toast ? (
        <ToastViewport>
          <Toast variant={toast.variant}>{toast.message}</Toast>
        </ToastViewport>
      ) : null}
    </div>
  );
}
