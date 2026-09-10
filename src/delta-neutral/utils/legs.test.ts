import { describe, expect, it } from "vitest";
import {
  DEX_PROFILES,
  maxFundingSpread8h,
  resolveCashAndCarryLegs,
  resolveLegs,
  type ManagedDexId,
} from "./legs";

const VENUES: ManagedDexId[] = ["Hyperliquid", "Nado", "Pacifica", "Variational"];

describe("resolveLegs", () => {
  it("shorts the venue paying more funding and longs the cheaper one", () => {
    // Pacifica 0.033 > Hyperliquid 0.0125
    const legs = resolveLegs("Hyperliquid", "Pacifica");
    expect(legs).toMatchObject({
      shortDex: "Pacifica",
      longDex: "Hyperliquid",
    });
    expect(legs!.spread8h).toBeCloseTo(0.0205, 6);
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
          legs.shortRate8h - legs.longRate8h!,
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

describe("resolveCashAndCarryLegs", () => {
  it("always shorts the perp, even when the spot venue quotes the higher rate", () => {
    // The regression the separate resolver exists for. Pacifica 0.033 > Nado 0.01, so
    // resolveLegs would hand Pacifica the short — but Pacifica is the spot venue here,
    // and you cannot collect funding on a coin you are holding outright.
    expect(resolveLegs("Pacifica", "Nado")).toMatchObject({ shortDex: "Pacifica" });

    const legs = resolveCashAndCarryLegs("Pacifica", "Nado")!;
    expect(legs.shortDex).toBe("Nado");
    expect(legs.longDex).toBe("Pacifica");
  });

  it("reports no funding rate on the spot leg", () => {
    for (const spot of VENUES) {
      for (const perp of VENUES) {
        if (spot === perp) continue;
        const legs = resolveCashAndCarryLegs(spot, perp)!;
        // null, not 0 — a zero here is a rate the venue never quoted.
        expect(legs.longRate8h).toBeNull();
        expect(legs.shortRate8h).toBe(DEX_PROFILES[perp].funding8hPct);
      }
    }
  });

  it("captures the whole perp rate, not a spread against the spot venue", () => {
    for (const spot of VENUES) {
      for (const perp of VENUES) {
        if (spot === perp) continue;
        const legs = resolveCashAndCarryLegs(spot, perp)!;
        expect(legs.spread8h).toBe(DEX_PROFILES[perp].funding8hPct);
      }
    }
  });

  it("is order-sensitive, unlike resolveLegs — the arguments name the roles", () => {
    expect(resolveCashAndCarryLegs("Nado", "Pacifica")).not.toEqual(
      resolveCashAndCarryLegs("Pacifica", "Nado"),
    );
  });

  it("returns null until two distinct venues are chosen", () => {
    expect(resolveCashAndCarryLegs("", "")).toBeNull();
    expect(resolveCashAndCarryLegs("Hyperliquid", "")).toBeNull();
    expect(resolveCashAndCarryLegs("", "Pacifica")).toBeNull();
    expect(resolveCashAndCarryLegs("Nado", "Nado")).toBeNull();
  });
});

describe("maxFundingSpread8h", () => {
  it("never sits below the live spread it is the ceiling for", () => {
    for (const a of VENUES) {
      for (const b of VENUES) {
        if (a === b) continue;
        const legs = resolveLegs(a, b)!;
        expect(maxFundingSpread8h(legs)).toBeGreaterThanOrEqual(legs.spread8h);
      }
    }
  });

  it("is order-independent, because the underlying leg assignment is", () => {
    for (const a of VENUES) {
      for (const b of VENUES) {
        if (a === b) continue;
        expect(maxFundingSpread8h(resolveLegs(a, b)!)).toBe(
          maxFundingSpread8h(resolveLegs(b, a)!),
        );
      }
    }
  });

  it("takes the widest gap on a single sample, not the gap between two peaks", () => {
    const legs = resolveLegs("Hyperliquid", "Pacifica")!;
    const long = DEX_PROFILES[legs.longDex].spark;
    const short = DEX_PROFILES[legs.shortDex].spark;

    const pointwise = Math.max(
      ...short.map((rate, i) => Math.abs(rate - long[i])),
    );
    expect(maxFundingSpread8h(legs)).toBeCloseTo(pointwise, 10);

    // Pairing the two series' independent peaks would quote a spread that never
    // occurred, and it is strictly the larger number — so this is a real distinction.
    const peakToPeak = Math.max(...short) - Math.min(...long);
    expect(peakToPeak).toBeGreaterThan(pointwise);
  });

  it("uses the perp's own peak on cash-and-carry, where the spot leg quotes nothing", () => {
    const legs = resolveCashAndCarryLegs("Hyperliquid", "Pacifica")!;
    expect(maxFundingSpread8h(legs)).toBe(
      Math.max(...DEX_PROFILES.Pacifica.spark),
    );
  });
});
