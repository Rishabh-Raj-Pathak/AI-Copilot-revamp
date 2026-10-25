import { describe, expect, it } from "vitest";
import type { ActiveVaultCardModel } from "../components/ActiveVaultCard";
import { hasVaultActivity, INITIAL_LEDGER, recordClose, recordTrade, userVaultStats } from "./userStats";

function vault(id: string, volume: number, volume7d: number, funding: number): ActiveVaultCardModel {
  return {
    id,
    pair: "BTC/USDC",
    marketType: "token",
    longAccount: "Hyperliquid",
    shortAccount: "Pacifica",
    longWallet: "",
    shortWallet: "",
    status: "balanced",
    longPnl: 0,
    shortPnl: 0,
    fundingEarned: funding,
    notional: 10_000,
    hedgeHealth: 100,
    totalVolumeUsd: volume,
    volume7dUsd: volume7d,
  };
}

describe("userVaultStats", () => {
  it("adds up the running vaults", () => {
    const stats = userVaultStats([vault("a", 100_000, 20_000, 12), vault("b", 50_000, 5_000, 3.5)], INITIAL_LEDGER);
    expect(stats.volumeUsd).toBe(150_000);
    expect(stats.volume7dUsd).toBe(25_000);
    expect(stats.fundingUsd).toBe(15.5);
    expect(stats.runningVaults).toBe(2);
  });

  it("keeps a closed vault's totals, so lifetime figures never drop", () => {
    const a = vault("a", 100_000, 20_000, 12);
    const b = vault("b", 50_000, 5_000, 3.5);
    const before = userVaultStats([a, b], INITIAL_LEDGER);
    const after = userVaultStats([a], recordClose(INITIAL_LEDGER, b));
    expect(after.volumeUsd).toBe(before.volumeUsd);
    expect(after.fundingUsd).toBe(before.fundingUsd);
    expect(after.tradesExecuted).toBe(before.tradesExecuted + 1);
    expect(after.runningVaults).toBe(1);
  });

  it("reads a vault with no volume yet as zero", () => {
    const fresh = { ...vault("c", 0, 0, 0), totalVolumeUsd: undefined, volume7dUsd: undefined };
    expect(userVaultStats([fresh], INITIAL_LEDGER).volumeUsd).toBe(0);
  });
});

describe("hasVaultActivity", () => {
  it("is false only for a user who has never traded or run a vault", () => {
    const empty = { ...INITIAL_LEDGER, trades: 0 };
    expect(hasVaultActivity(userVaultStats([], empty))).toBe(false);
    expect(hasVaultActivity(userVaultStats([], recordTrade(empty)))).toBe(true);
  });
});
