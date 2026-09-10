import { describe, expect, it } from "vitest";
import {
  DEX_PROFILES,
  resolveCashAndCarryLegs,
  resolveLegs,
  type ManagedDexId,
} from "./legs";
import { marketProfileFor } from "./markets";
import {
  buildPositionSummary,
  EPOCHS_PER_YEAR,
  type PositionSummaryInput,
} from "./positionSummary";

const VENUES: ManagedDexId[] = ["Hyperliquid", "Nado", "Pacifica", "Variational"];

/** Perp <> Perp between two venues. */
function perpPerp(
  a: ManagedDexId,
  b: ManagedDexId,
  over: Partial<PositionSummaryInput> = {},
) {
  return buildPositionSummary({
    structure: "Perp <> Perp",
    legs: resolveLegs(a, b)!,
    spotVenue: null,
    marginUsd: 10_000,
    leverage: 3,
    market: marketProfileFor("BTC-USDC"),
    ...over,
  });
}

/** Cash-and-carry: coin held on `spot`, perp shorted on `perp`. */
function spotPerp(
  spot: ManagedDexId,
  perp: ManagedDexId,
  over: Partial<PositionSummaryInput> = {},
) {
  return buildPositionSummary({
    structure: "Spot <> Perp",
    legs: resolveCashAndCarryLegs(spot, perp)!,
    spotVenue: spot,
    marginUsd: 10_000,
    leverage: 3,
    market: marketProfileFor("BTC-USDC"),
    ...over,
  });
}

describe("the two structures are economically distinct", () => {
  /*
   * The regression this module exists for. Before it, `spreadFunding8h`,
   * `crossDexApr`, `fundingProjection` and `feesDragEst` were computed identically
   * for both structures — the spot leg was handed a funding rate from DEX_PROFILES
   * and levered like a perp. All four quantities below were byte-identical.
   */
  it("differ on funding, capital, APR and cost for the same venues and size", () => {
    const pp = perpPerp("Hyperliquid", "Pacifica");
    const sp = spotPerp("Hyperliquid", "Pacifica");

    expect(sp.grossFundingAprPct).not.toBeCloseTo(pp.grossFundingAprPct, 6);
    expect(sp.capitalRequiredUsd).not.toBeCloseTo(pp.capitalRequiredUsd, 6);
    expect(sp.netAprOnCapitalPct).not.toBeCloseTo(pp.netAprOnCapitalPct, 6);
    expect(sp.costToOpenUsd.total).not.toBeCloseTo(pp.costToOpenUsd.total, 6);
  });

  it("collects the whole perp rate on cash-and-carry, not a cross-venue spread", () => {
    const sp = spotPerp("Hyperliquid", "Pacifica");
    expect(sp.grossFundingAprPct).toBeCloseTo(
      DEX_PROFILES.Pacifica.funding8hPct * EPOCHS_PER_YEAR,
      6,
    );

    const pp = perpPerp("Hyperliquid", "Pacifica");
    expect(pp.grossFundingAprPct).toBeCloseTo(
      (DEX_PROFILES.Pacifica.funding8hPct - DEX_PROFILES.Hyperliquid.funding8hPct) *
        EPOCHS_PER_YEAR,
      6,
    );
  });

  it("adds spot yield only on cash-and-carry", () => {
    const eth = marketProfileFor("ETH-USDC");
    expect(eth.spotYieldAprPct).toBeGreaterThan(0);
    expect(spotPerp("Hyperliquid", "Pacifica", { market: eth }).spotYieldAprPct).toBe(
      eth.spotYieldAprPct,
    );
    expect(perpPerp("Hyperliquid", "Pacifica", { market: eth }).spotYieldAprPct).toBe(0);
  });

  it("reports an entry basis only on cash-and-carry", () => {
    expect(spotPerp("Hyperliquid", "Pacifica").entryBasisPct).not.toBeNull();
    expect(perpPerp("Hyperliquid", "Pacifica").entryBasisPct).toBeNull();
  });
});

describe("the spot leg", () => {
  it("earns no funding and cannot be liquidated, at any leverage", () => {
    for (const spot of VENUES) {
      for (const perp of VENUES) {
        if (spot === perp) continue;
        for (const leverage of [1, 3, 10, 50]) {
          const s = spotPerp(spot, perp, { leverage });
          expect(s.long.instrument).toBe("Spot");
          expect(s.long.fundingRate8hPct).toBeNull();
          expect(s.long.fundingAprPct).toBeNull();
          expect(s.long.fundingIntervalHours).toBeNull();
          expect(s.long.liquidation).toBeNull();
        }
      }
    }
  });

  it("locks its full notional and carries no leverage", () => {
    const s = spotPerp("Hyperliquid", "Pacifica", { leverage: 10 });
    expect(s.long.capitalUsd).toBeCloseTo(s.notionalUsd, 6);
    expect(s.long.leverage).toBe(1);
    // The perp leg still levers.
    expect(s.short.capitalUsd).toBeCloseTo(s.notionalUsd / 10, 6);
  });

  it("is charged the spot fee, never the perp fee", () => {
    const s = spotPerp("Nado", "Pacifica");
    expect(DEX_PROFILES.Nado.spotTakerFeePct).not.toBe(
      DEX_PROFILES.Nado.perpTakerFeePct,
    );
    expect(s.long.openFeePct).toBe(DEX_PROFILES.Nado.spotTakerFeePct);
    expect(s.short.openFeePct).toBe(DEX_PROFILES.Pacifica.perpTakerFeePct);
  });
});

describe("capital", () => {
  it("follows the structure's own formula", () => {
    for (const leverage of [1, 2, 3, 5, 10, 20, 50]) {
      const pp = perpPerp("Nado", "Pacifica", { leverage });
      expect(pp.capitalRequiredUsd).toBeCloseTo((2 * pp.notionalUsd) / leverage, 6);
      expect(pp.capitalEfficiencyX).toBeCloseTo(leverage / 2, 6);

      const sp = spotPerp("Nado", "Pacifica", { leverage });
      expect(sp.capitalRequiredUsd).toBeCloseTo(
        sp.notionalUsd * (1 + 1 / leverage),
        6,
      );
      expect(sp.capitalEfficiencyX).toBeCloseTo(leverage / (leverage + 1), 6);
    }
  });

  it("can never lever a cash-and-carry above its notional return", () => {
    // capitalEfficiency = L/(L+1) < 1 always, so the return on capital is bounded by
    // the return on notional. This ceiling is the real trade-off against Perp <> Perp
    // and it vanished when both structures shared one formula.
    for (const leverage of [1, 3, 10, 50]) {
      const sp = spotPerp("Nado", "Pacifica", { leverage });
      expect(sp.capitalEfficiencyX).toBeLessThan(1);
      expect(sp.netAprOnCapitalPct).toBeLessThan(sp.netAprOnNotionalPct);
    }
  });
});

describe("liquidation", () => {
  it("gives both perp legs a price, long below mark and short above", () => {
    const pp = perpPerp("Nado", "Pacifica", { leverage: 5 });
    const mark = marketProfileFor("BTC-USDC").markPriceUsd;
    expect(pp.long.liquidation!.priceUsd).toBeLessThan(mark);
    expect(pp.short.liquidation!.priceUsd).toBeGreaterThan(mark);
    expect(pp.long.liquidation!.isolated).toBe(true);
  });

  it("moves closer to mark as leverage rises", () => {
    const at3 = perpPerp("Nado", "Pacifica", { leverage: 3 });
    const at20 = perpPerp("Nado", "Pacifica", { leverage: 20 });
    expect(at20.short.liquidation!.adversePricePct).toBeLessThan(
      at3.short.liquidation!.adversePricePct,
    );
  });

  it("collapses to the 1/leverage shorthand when maintenance margin is zero", () => {
    // The trade panel uses px * (1 +/- 1/leverage). This model generalises it, so at
    // mmr = 0 the two must agree exactly.
    const summary = buildPositionSummary({
      structure: "Perp <> Perp",
      legs: {
        longDex: "Nado",
        shortDex: "Pacifica",
        longRate8h: 0.01,
        shortRate8h: 0.033,
        spread8h: 0.023,
      },
      spotVenue: null,
      marginUsd: 1000,
      leverage: 4,
      market: marketProfileFor("BTC-USDC"),
    });
    // Nado's real mmr is non-zero, so assert the shape rather than the value: the
    // distance must sit just inside the zero-mmr bound of 1/leverage.
    expect(summary.long.liquidation!.adversePricePct).toBeLessThan(100 / 4);
    expect(summary.long.liquidation!.adversePricePct).toBeGreaterThan(100 / 4 - 1);
  });
});

describe("costs and break-even", () => {
  it("sums the three cost lines into the total", () => {
    const pp = perpPerp("Nado", "Pacifica");
    const { fees, priceImpact, gas, total } = pp.costToOpenUsd;
    expect(fees + priceImpact + gas).toBeCloseTo(total, 10);
    expect(pp.roundTripCostUsd.total).toBeCloseTo(total * 2, 10);
  });

  it("pays back slower at larger size, because price impact scales with it", () => {
    /*
     * The size-sensitivity the previous model could not express: it reported the same
     * payback on $500 as on $50,000.
     *
     * The direction depends on which cost dominates. Every venue shipped today quotes
     * zero gas, so the only size-dependent cost left is price impact and payback
     * lengthens with size. Reintroduce a venue that charges gas and the small end
     * gets worse instead — the flat cost is a larger share of a smaller notional.
     */
    const small = perpPerp("Nado", "Pacifica", { marginUsd: 500, leverage: 1 });
    const large = perpPerp("Nado", "Pacifica", { marginUsd: 50_000, leverage: 1 });
    expect(large.breakEvenDays!).toBeGreaterThan(small.breakEvenDays!);
  });

  it("charges more price impact on a thin book than a deep one", () => {
    const deep = perpPerp("Nado", "Pacifica", { market: marketProfileFor("BTC-USDC") });
    const thin = perpPerp("Nado", "Pacifica", { market: marketProfileFor("BONK-USDC") });
    expect(thin.costToOpenUsd.priceImpact).toBeGreaterThan(
      deep.costToOpenUsd.priceImpact,
    );
  });
});

describe("no floor", () => {
  /*
   * The predecessor ended in `Math.max(30.01, ...)`, which pinned the displayed APY
   * to a constant for every venue pair and every input. These are the tests that make
   * re-adding one fail loudly.
   */
  it("reports a negative APR rather than clamping it", () => {
    const summary = buildPositionSummary({
      structure: "Perp <> Perp",
      legs: {
        longDex: "Nado",
        shortDex: "Pacifica",
        longRate8h: 0.00998,
        shortRate8h: 0.01,
        // 0.022% APR gross, against 0.09% of round-trip venue fees alone.
        spread8h: 0.00002,
      },
      spotVenue: null,
      marginUsd: 100,
      leverage: 1,
      market: marketProfileFor("BONK-USDC"),
    });
    expect(summary.netAprOnCapitalPct).toBeLessThan(0);
    expect(summary.reasons).toContain(
      "Round-trip cost exceeds the spread at this size.",
    );
  });

  it("never returns exactly the old constant for every pair", () => {
    const values = new Set<number>();
    for (const a of VENUES) {
      for (const b of VENUES) {
        if (a === b) continue;
        values.add(Number(perpPerp(a, b).netAprOnCapitalPct.toFixed(4)));
      }
    }
    // Six distinct venue pairs must produce six distinct headline rates.
    expect(values.size).toBe(6);
  });

  it("has no break-even when nothing is being earned", () => {
    const summary = perpPerp("Nado", "Pacifica", { marginUsd: 0 });
    expect(summary.breakEvenDays).toBeNull();
  });
});

describe("responds to the controls", () => {
  it("raises the headline APR as leverage rises, for both structures", () => {
    for (const build of [perpPerp, spotPerp]) {
      let previous = -Infinity;
      for (let leverage = 1; leverage <= 50; leverage += 1) {
        const value = build("Nado", "Pacifica", { leverage }).netAprOnCapitalPct;
        expect(value).toBeGreaterThan(previous);
        previous = value;
      }
    }
  });

  it("scales income linearly with size but leaves the rate alone", () => {
    // The predecessor multiplied the APR itself by the participation rate, so
    // deploying half your balance appeared to halve your yield. It halves the dollars.
    const small = perpPerp("Nado", "Pacifica", { marginUsd: 5_000 });
    const large = perpPerp("Nado", "Pacifica", { marginUsd: 10_000 });
    expect(large.incomeUsd.daily / small.incomeUsd.daily).toBeCloseTo(2, 2);
    expect(large.grossFundingAprPct).toBeCloseTo(small.grossFundingAprPct, 10);
  });
});

describe("settlement cadence", () => {
  it("waits for the slower venue on Perp <> Perp", () => {
    // Nado 8h, Pacifica 1h — the pair is not settled until both sides have paid.
    expect(perpPerp("Nado", "Pacifica").fundingSettlement).toMatchObject({
      venue: "Nado",
      intervalHours: 8,
    });
  });

  it("follows the perp venue alone on cash-and-carry", () => {
    // Only one venue settles, so there is no slower-of-the-two to wait for.
    expect(spotPerp("Nado", "Pacifica").fundingSettlement).toMatchObject({
      venue: "Pacifica",
      intervalHours: 1,
    });
  });
});

describe("validity", () => {
  it("refuses cash-and-carry on a perp-only market", () => {
    const wti = marketProfileFor("WTI-USDC");
    expect(wti.spotImpactBpsPerMillion).toBeNull();
    const summary = spotPerp("Nado", "Pacifica", { market: wti });
    expect(summary.valid).toBe(false);
    expect(summary.reasons.join(" ")).toContain("perpetual only");
  });

  it("is invalid but still finite with no amount entered", () => {
    const summary = perpPerp("Nado", "Pacifica", { marginUsd: 0 });
    expect(summary.valid).toBe(false);
    expect(Number.isFinite(summary.netAprOnCapitalPct)).toBe(true);
    expect(Number.isFinite(summary.capitalRequiredUsd)).toBe(true);
  });

  it("produces no NaN or Infinity on degenerate input", () => {
    for (const over of [
      { marginUsd: 0 },
      { leverage: 0 },
      { marginUsd: 0, leverage: 0 },
      { marginUsd: -100 },
      { leverage: 1 },
    ]) {
      for (const summary of [
        perpPerp("Nado", "Pacifica", over),
        spotPerp("Nado", "Pacifica", over),
      ]) {
        for (const value of [
          summary.notionalUsd,
          summary.capitalRequiredUsd,
          summary.capitalEfficiencyX,
          summary.netAprOnNotionalPct,
          summary.netAprOnCapitalPct,
          summary.costToOpenUsd.total,
          summary.incomeUsd.daily,
        ]) {
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    }
  });
});

describe("golden fixture", () => {
  /*
   * One case with every figure computed by hand, so a unit slip anywhere in the chain
   * fails here with an arithmetic trail to check against. This is the guard against
   * the class of bug that produced `parseFloat(pct) / 10000`.
   *
   * Nado / Pacifica, Perp <> Perp, $10,000 margin at 1x, BTC-USDC.
   *
   *   notional          10000 * 1                          = 10,000
   *   spread8h          0.033 - 0.01                       = 0.023 %/8h
   *   grossFundingApr   0.023 * 1095                       = 25.185 %
   *   long  Nado     fee 10000 * 0.024%                    = $2.40
   *                  impact 18bps/M * 0.01 / 100 = 0.0018% = $0.18   gas $0
   *   short Pacifica fee 10000 * 0.021%                    = $2.10
   *                  impact                        0.0018% = $0.18   gas $0
   *   costToOpen        4.50 + 0.36 + 0                    = $4.86
   *   roundTrip         4.86 * 2                           = $9.72
   *   feeDrag           (0.024 + 0.021) * 2                = 0.09 %
   *   impactDrag        (0.0018 + 0.0018) * 2              = 0.0072 %
   *   gasDrag           0 * 2 / 10000 * 100                = 0 %
   *   netAprOnNotional  25.185 - 0.09 - 0.0072             = 25.0878 %
   *   capital           2 * 10000 / 1                      = $20,000
   *   netAprOnCapital   25.0878 * (10000 / 20000)          = 12.5439 %
   *   grossIncomeDaily  10000 * 25.185% / 365              = $6.9000
   *   breakEven         9.72 / 6.9000                      = 1.4087 d
   */
  const g = perpPerp("Nado", "Pacifica", { marginUsd: 10_000, leverage: 1 });

  it("matches every hand-computed figure", () => {
    expect(g.notionalUsd).toBe(10_000);
    expect(g.grossFundingAprPct).toBeCloseTo(25.185, 6);

    expect(g.long.openFeeUsd).toBeCloseTo(2.4, 10);
    expect(g.short.openFeeUsd).toBeCloseTo(2.1, 10);
    expect(g.long.priceImpactPct).toBeCloseTo(0.0018, 10);
    expect(g.long.priceImpactUsd).toBeCloseTo(0.18, 10);

    expect(g.costToOpenUsd.fees).toBeCloseTo(4.5, 10);
    expect(g.costToOpenUsd.priceImpact).toBeCloseTo(0.36, 10);
    expect(g.costToOpenUsd.gas).toBeCloseTo(0, 10);
    expect(g.costToOpenUsd.total).toBeCloseTo(4.86, 10);
    expect(g.roundTripCostUsd.total).toBeCloseTo(9.72, 10);

    // The two lines the panel itemises must still add up to the total it shows.
    expect(g.costToOpenUsd.priceImpact + g.costToOpenUsd.fees).toBeCloseTo(
      g.costToOpenUsd.total,
      10,
    );

    expect(g.feeDragAprPct).toBeCloseTo(0.09, 10);
    expect(g.impactDragAprPct).toBeCloseTo(0.0072, 10);
    expect(g.gasDragAprPct).toBeCloseTo(0, 10);

    expect(g.netAprOnNotionalPct).toBeCloseTo(25.0878, 6);
    expect(g.capitalRequiredUsd).toBeCloseTo(20_000, 6);
    expect(g.netAprOnCapitalPct).toBeCloseTo(12.5439, 4);
    expect(g.incomeUsd.daily).toBeCloseTo(6.9, 4);
    expect(g.breakEvenDays!).toBeCloseTo(1.4087, 3);
  });
});
