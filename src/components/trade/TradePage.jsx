import { useState } from "react";
import ProfileCompletionBanner from "../profile/ProfileCompletionBanner.jsx";
import { useProfile } from "../profile/ProfileContext.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import TradeSuccessModal from "../terminal/TradeSuccessModal.jsx";
import { openSetupShare } from "../../lib/share.js";
import TradeAlertsBar from "./TradeAlertsBar.jsx";
import TradeBottomPanel from "./TradeBottomPanel.jsx";
import TradeChartPanel from "./TradeChartPanel.jsx";
import TradeMarketBar from "./TradeMarketBar.jsx";
import TradeOrderPanel from "./TradeOrderPanel.jsx";
import { DEFAULT_COIN } from "./tradeMockData.js";

/** Perps trade terminal — market bar, chart, positions tables, order ticket. */
export default function TradePage({
  onOpenCopilot,
  onOpenRewards,
  onVaultViewChange,
  onOpenCopilotTutorial,
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onOpenSupport,
  terminalPlatform,
  onTerminalPlatformChange,
}) {
  const [coin, setCoin] = useState(DEFAULT_COIN);
  const [successOpen, setSuccessOpen] = useState(false);
  const { socials } = useProfile();

  /** With X linked the composer opens; without it, the ask is what's missing. */
  const handleShareSetup = () => {
    setSuccessOpen(false);
    if (socials.x) openSetupShare({ coin });
    else onOpenProfile?.();
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white">
      <HeaderTerminal
        activeNavItem="Trade"
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Rewards") onOpenRewards?.();
          if (label === "KOL") onOpenRewards?.("kol");
        }}
        onVaultViewChange={onVaultViewChange}
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

      <ProfileCompletionBanner onOpenProfile={() => onOpenProfile?.()} />

      <TradeAlertsBar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col max-lg:overflow-y-auto">
          <TradeMarketBar coin={coin} onCoinChange={setCoin} />
          <div className="flex min-h-0 flex-1 flex-col max-lg:min-h-[26rem]">
            <TradeChartPanel coin={coin} />
          </div>
          <TradeBottomPanel />
        </div>

        <div className="flex w-full shrink-0 flex-col lg:h-full lg:w-[420px]">
          <TradeOrderPanel
            key={coin}
            coin={coin}
            onSubmit={() => setSuccessOpen(true)}
          />
        </div>
      </div>

      <TradeSuccessModal
        open={successOpen}
        onViewPortfolio={() => setSuccessOpen(false)}
        onShareSetup={handleShareSetup}
      />
    </div>
  );
}
