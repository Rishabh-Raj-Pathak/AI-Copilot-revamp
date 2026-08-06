import { describe, expect, it } from "vitest";
import { canClaimKolRewards, KOL_MIN_CLAIM_AMOUNT } from "./rewardsMockData.js";

describe("Gautam campaign claim eligibility", () => {
  it("keeps Claim disabled for the first $5 milestone reward", () => {
    expect(canClaimKolRewards("$5.00")).toBe(false);
  });

  it("keeps Claim disabled just below the minimum", () => {
    expect(canClaimKolRewards(`$${KOL_MIN_CLAIM_AMOUNT - 0.01}`)).toBe(false);
  });

  it("unlocks Claim when the available balance reaches $10", () => {
    expect(canClaimKolRewards(`$${KOL_MIN_CLAIM_AMOUNT}.00`)).toBe(true);
  });

  it("allows larger formatted balances", () => {
    expect(canClaimKolRewards("$1,012.84")).toBe(true);
  });

  it("keeps Claim disabled when there is no positive balance", () => {
    expect(canClaimKolRewards("$0.00")).toBe(false);
  });
});
