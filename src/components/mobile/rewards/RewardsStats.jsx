import { useEffect, useState } from "react";
import {
  canClaimKolRewards,
  KOL_CAMPAIGN_END,
  KOL_MIN_CLAIM_AMOUNT,
  KOL_REWARD_STATS,
  REWARD_STATS,
} from "../../rewards/rewardsMockData.js";
import { spaced } from "./rewardsPhone.js";

/**
 * Figma "Stats" (996:5911): one full-width tile per figure, stacked 12px
 * apart. Signed out every figure is the artboard's muted `$ 0`. Claimable
 * Rewards carries the gradient Claim; once claimed it drops to `$ 0`.
 */

function campaignCountdown() {
  const ms = Math.max(0, Date.parse(KOL_CAMPAIGN_END) - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms / 3_600_000) % 24);
  const minutes = Math.floor((ms / 60_000) % 60);
  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

function useCampaignCountdown(enabled) {
  const [value, setValue] = useState(campaignCountdown);
  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => setValue(campaignCountdown()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return value;
}

function StatTile({ label, value, muted, status, children }) {
  return (
    <section className="flex w-full flex-col gap-2 rounded-xl border border-app-line bg-app-bg p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-app-body leading-[16.8px] text-ink-muted">{label}</p>
        {status ? (
          <span
            className={`flex shrink-0 items-center gap-1.5 text-app-micro font-medium ${
              status.ready ? "text-[#4ade80]" : "text-ink-subtle"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${status.ready ? "bg-[#4ade80]" : "bg-ink-subtle"}`}
              aria-hidden
            />
            {status.label}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-9 w-full items-center justify-between gap-3">
        <p
          className={`truncate text-app-title font-semibold leading-[26px] ${
            muted ? "text-white/60" : "text-ink"
          }`}
        >
          {value}
        </p>
        {children}
      </div>
    </section>
  );
}

function ClaimButton({ onClick, dimmed, label = "Claim", ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={dimmed}
      aria-label={ariaLabel}
      className={`app-pressable app-gradient-brand flex h-9 shrink-0 items-center justify-center rounded-lg px-6 text-app-body font-semibold leading-5 tracking-[0.3px] text-black ${
        dimmed ? "opacity-35" : ""
      }`}
    >
      {label}
    </button>
  );
}

export default function RewardsStats({ variant, connected, claimed, onClaim, onRequireWallet }) {
  const isKol = variant === "kol";
  const stats = isKol ? KOL_REWARD_STATS : REWARD_STATS;
  const countdown = useCampaignCountdown(isKol);
  const zero = "$ 0";
  const figure = (value) => (connected ? spaced(value) : zero);
  const claimable = connected && !claimed ? spaced(stats.claimableRewards) : zero;
  const kolReady = canClaimKolRewards(stats.claimableRewards);
  const canClaim = connected && !claimed && (!isKol || kolReady);

  const claim = () => {
    if (!connected) return onRequireWallet();
    if (canClaim) onClaim();
  };

  const claimTile = (
    <StatTile
      key="claim"
      label={isKol ? "Available to claim" : "Claimable Rewards"}
      value={claimable}
      muted={claimable === zero}
      status={
        isKol && connected && !claimed
          ? kolReady
            ? { ready: true, label: "Ready to claim" }
            : { ready: false, label: `Unlocks at $${KOL_MIN_CLAIM_AMOUNT}` }
          : undefined
      }
    >
      <ClaimButton
        onClick={claim}
        dimmed={connected && !canClaim}
        ariaLabel={canClaim ? `Claim ${stats.claimableRewards}` : undefined}
      />
    </StatTile>
  );

  if (isKol) {
    return (
      <div className="flex flex-col gap-3">
        <StatTile label="Total earned" value={figure(stats.totalRewards)} muted={!connected} />
        <StatTile label="Cashback earned" value={figure(stats.fromYourTrades)} muted={!connected} />
        {claimTile}
        <StatTile label="Gautam campaign ends" value={countdown} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <StatTile label="Total Rewards" value={figure(stats.totalRewards)} muted={!connected} />
      {claimTile}
      <StatTile label="From Referrals" value={figure(stats.fromReferrals)} muted={!connected} />
      <StatTile
        label="Total Referred Users"
        value={connected ? stats.totalReferredUsers : "0"}
        muted={!connected}
      />
    </div>
  );
}
