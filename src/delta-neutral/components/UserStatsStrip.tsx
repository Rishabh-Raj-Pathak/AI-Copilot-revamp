import React, { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { StatCard } from './StatCard';
import { usePayoutCountdown } from './ActiveVaultCard';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { formatCompactUsd, formatElapsed, formatUsd } from '../utils/format';
import { hasVaultActivity, type UserVaultStats } from '../utils/userStats';

export type UserStatItem = {
  title: string;
  mobileTitle: string;
  value: string;
  subtext: string;
  /** What the figure counts, for the info popover and the phone's sheet. */
  body: string;
};

/** Cents while funding is small; a single cent is still a payout. */
function formatFunding(usd: number) {
  return usd >= 1000 ? formatCompactUsd(usd) : formatUsd(usd);
}

/**
 * The three figures, all about the signed-in user and none of them able to read as a
 * loss: Net PnL sits under water until a vault earns back its fees, so the strip
 * reports funding and leaves fees to each vault's PnL breakdown. Empty for a user with
 * nothing to report.
 */
export function useUserStatItems(stats: UserVaultStats | null): UserStatItem[] {
  const payoutSec = usePayoutCountdown();
  if (!stats || !hasVaultActivity(stats)) return [];

  const payoutIn = formatElapsed(payoutSec * 1000);
  // A fresh vault can sit at or below zero until its first settlement; show when that is instead.
  const funding: UserStatItem =
    stats.fundingUsd > 0
      ? {
          title: 'Funding Earned',
          mobileTitle: 'Funding',
          value: formatFunding(stats.fundingUsd),
          subtext: `Next payout in ${payoutIn}`,
          body: 'Funding your vaults have collected from the rate gap between their two venues. Fees for each vault are in its PnL breakdown.',
        }
      : {
          title: 'Next Payout',
          mobileTitle: 'Payout',
          value: payoutIn,
          subtext: 'When funding next settles',
          body: 'Time until the venues next settle funding on your vaults.',
        };

  return [
    {
      title: 'Your Volume',
      mobileTitle: 'Volume',
      value: formatCompactUsd(stats.volumeUsd),
      subtext: `${formatCompactUsd(stats.volume7dUsd)} this week`,
      body: 'Everything your vaults have traded on both legs, including vaults you have since closed.',
    },
    funding,
    {
      title: 'Trades Executed',
      mobileTitle: 'Trades',
      value: stats.tradesExecuted.toLocaleString('en-US'),
      subtext:
        stats.runningVaults > 0
          ? `${stats.runningVaults} ${stats.runningVaults === 1 ? 'vault' : 'vaults'} running`
          : 'Opens, rebalances and closes',
      body: 'Every open, rebalance and close your vaults have placed for you.',
    },
  ];
}

const EXPLAIN_BUTTON =
  'h-7 w-7 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] text-[#8f90a1] transition-colors hover:border-[rgba(214,176,106,0.4)] hover:text-[#d6b06a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.5)]';

/** The stat tiles under the page title, with the popover (dialog on narrow screens) that explains them. */
export function UserStatsStrip({ stats }: { stats: UserVaultStats }) {
  const items = useUserStatItems(stats);
  const [explainOpen, setExplainOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <div className="relative">
        <div className="absolute right-0 top-0 z-10 flex items-center max-tablet:-top-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" aria-label="Explain your stats" className={`hidden tablet:inline-flex ${EXPLAIN_BUTTON}`}>
                <CircleAlert className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[330px] border-[rgba(146,111,56,0.45)] bg-[linear-gradient(180deg,rgba(14,12,10,0.98)_0%,rgba(8,8,8,0.98)_100%)] p-3.5 text-[#e8d5b5]">
              <p className="text-[12px] font-semibold uppercase tracking-[1px] text-[#ccb17f]">Your Stats</p>
              <div className="mt-2 space-y-2">
                {items.map(item => (
                  <div key={item.title} className="text-[11px] leading-relaxed">
                    <p className="font-semibold text-[#e8d5b5]">{item.title}</p>
                    <p className="text-[#9c9cac]">{item.body}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            type="button"
            aria-label="Explain your stats"
            onClick={() => setExplainOpen(true)}
            className={`inline-flex tablet:hidden ${EXPLAIN_BUTTON}`}
          >
            <CircleAlert className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5 tablet:gap-4">
          {items.map(item => (
            <StatCard
              key={item.title}
              variant="vaults"
              title={item.title}
              mobileTitle={item.mobileTitle}
              value={item.value}
              subtext={item.subtext}
            />
          ))}
        </div>
      </div>
      <Dialog open={explainOpen} onOpenChange={setExplainOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[14px] border border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-4 text-[#f5f5f5]">
          <DialogTitle className="font-['Onest',sans-serif] text-[14px] text-[#e8d5b5]">Your Stats</DialogTitle>
          <DialogDescription className="mt-1 text-[12px] text-[#a5a6b3]">
            Your delta-neutral activity, across every vault you have run.
          </DialogDescription>
          <div className="mt-2 space-y-2">
            {items.map(item => (
              <div key={item.title} className="text-[12px] leading-relaxed">
                <p className="font-semibold text-[#e8d5b5]">{item.title}</p>
                <p className="text-[#9c9cac]">{item.body}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
