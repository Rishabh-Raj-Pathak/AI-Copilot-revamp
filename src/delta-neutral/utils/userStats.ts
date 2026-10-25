import type { ActiveVaultCardModel } from "../components/ActiveVaultCard";

/*
 * The user's own delta-neutral totals, for the stat strip above the builder.
 *
 * Lifetime figures: a vault that leaves the list keeps counting. Summing only the
 * running vaults would make Your Volume drop the moment one is deactivated. The real
 * backend gets these as the platform `overallStats` sums filtered to one user, closed
 * vaults included; the ledger below stands in for that here.
 */

/**
 * The trade history's `pagination.totalItems` before this session -- the bottom panel
 * shows only its first page. Every open, rebalance and close is one row.
 */
export const TRADES_BEFORE_SESSION = 214;

export type VaultLedger = {
  /** Totals of vaults no longer in the list. */
  closedVolumeUsd: number;
  closedVolume7dUsd: number;
  closedFundingUsd: number;
  trades: number;
};

export const INITIAL_LEDGER: VaultLedger = {
  closedVolumeUsd: 0,
  closedVolume7dUsd: 0,
  closedFundingUsd: 0,
  trades: TRADES_BEFORE_SESSION,
};

export type UserVaultStats = {
  volumeUsd: number;
  volume7dUsd: number;
  fundingUsd: number;
  tradesExecuted: number;
  runningVaults: number;
};

/** Keeps what these vaults traded and earned after they leave the list. */
export function carryOver(ledger: VaultLedger, vaults: ActiveVaultCardModel[]): VaultLedger {
  return vaults.reduce(
    (next, v) => ({
      ...next,
      closedVolumeUsd: next.closedVolumeUsd + (v.totalVolumeUsd ?? 0),
      closedVolume7dUsd: next.closedVolume7dUsd + (v.volume7dUsd ?? 0),
      closedFundingUsd: next.closedFundingUsd + v.fundingEarned,
    }),
    ledger,
  );
}

/** One more history row: a vault opened or closed. */
export function recordTrade(ledger: VaultLedger): VaultLedger {
  return { ...ledger, trades: ledger.trades + 1 };
}

export function recordClose(ledger: VaultLedger, vault: ActiveVaultCardModel): VaultLedger {
  return recordTrade(carryOver(ledger, [vault]));
}

export function userVaultStats(vaults: ActiveVaultCardModel[], ledger: VaultLedger): UserVaultStats {
  const running = carryOver(ledger, vaults);
  return {
    volumeUsd: running.closedVolumeUsd,
    volume7dUsd: running.closedVolume7dUsd,
    fundingUsd: running.closedFundingUsd,
    tradesExecuted: ledger.trades,
    runningVaults: vaults.length,
  };
}

/** A user who has never run a vault has nothing to report, so the strip stays hidden. */
export function hasVaultActivity(stats: UserVaultStats): boolean {
  return stats.tradesExecuted > 0 || stats.runningVaults > 0;
}
