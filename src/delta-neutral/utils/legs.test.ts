import { describe, expect, it } from "vitest";
import { DEX_PROFILES, resolveLegs, type ManagedDexId } from "./legs";

const VENUES: ManagedDexId[] = ["Hyperliquid", "Nado", "Pacifica"];

describe("resolveLegs", () => {
  it("shorts the venue paying more funding and longs the cheaper one", () => {
    // Pacifica 0.028 > Hyperliquid 0.021
    const legs = resolveLegs("Hyperliquid", "Pacifica");
    expect(legs).toMatchObject({
      shortDex: "Pacifica",
      longDex: "Hyperliquid",
    });
    expect(legs!.spread8h).toBeCloseTo(0.007, 6);
  });

  it("assigns the same sides regardless of the order the venues were picked in", () => {
    // The regression this whole flow exists to prevent: side assignment used to follow
    // the dropdown the user touched first, which flipped the spread sign.
    for (const a of VENUES) {
      for (const b of VENUES) {
        if (a === b) continue;
        expect(resolveLegs(a, b)).toEqual(resolveLegs(b, a));
      }
    }
  });

  it("never produces a negative spread for any venue pair", () => {
    for (const a of VENUES) {
      for (const b of VENUES) {
        if (a === b) continue;
        expect(resolveLegs(a, b)!.spread8h).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("reports the rate that actually belongs to each assigned leg", () => {
    for (const a of VENUES) {
      for (const b of VENUES) {
        if (a === b) continue;
        const legs = resolveLegs(a, b)!;
        expect(legs.shortRate8h).toBe(DEX_PROFILES[legs.shortDex].funding8hPct);
        expect(legs.longRate8h).toBe(DEX_PROFILES[legs.longDex].funding8hPct);
        expect(legs.spread8h).toBeCloseTo(
          legs.shortRate8h - legs.longRate8h,
          10,
        );
      }
    }
  });

  it("returns null until two distinct venues are chosen", () => {
    expect(resolveLegs("", "")).toBeNull();
    expect(resolveLegs("Hyperliquid", "")).toBeNull();
    expect(resolveLegs("", "Pacifica")).toBeNull();
    expect(resolveLegs("Nado", "Nado")).toBeNull();
  });
});
