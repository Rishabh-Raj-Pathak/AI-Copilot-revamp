export type ManagedDexId = "Hyperliquid" | "Nado" | "Pacifica" | "Variational";
export type DexSelection = ManagedDexId | "";

/**
 * Venue-level economics.
 *
 * Unit suffixes are load-bearing: `…Pct` is a percent (0.021 means 0.021%), `…Usd`
 * is dollars, `…Ratio` is a fraction. The predecessor of `perpTakerFeePct` was a
 * `string` named `feeRoundTripPct`, which had to be `parseFloat`'d at every use site
 * and was divided by 10000 at one of them — a percent treated as a bps count, so fee
 * drag came out 100x understated. A suffix on every name makes that unwritable.
 */
export type DexProfile = {
  id: ManagedDexId;
  /** 8h funding rate, percent (e.g. 0.021 = 0.021%) */
  funding8hPct: number;
  spark: number[];
  tvl: string;
  /** One-way taker fee on the perp book, % of notional. Round trip is 2x this. */
  perpTakerFeePct: number;
  /** One-way taker fee on the spot book. `null` when the venue has no spot book. */
  spotTakerFeePct: number | null;
  /** Maintenance margin, as a fraction. Sets how far price can run before liquidation. */
  maintenanceMarginRatio: number;
  /**
   * Flat cost per leg, in dollars — the only cost that does not scale with size.
   *
   * Zero on every venue shipped here: Hyperliquid charges no gas on a trade, and the
   * rest settle on an L2 or on Solana where it rounds away. The field and its
   * handling stay, because a venue that does charge it moves break-even sharply at
   * small size — but a non-zero value has to be itemised in Cost to open alongside
   * spread and fees, or the lines there stop adding up to the total above them.
   */
  perpGasPerLegUsd: number;
  spotGasPerLegUsd: number | null;
  /**
   * Cost of borrowing to lever the spot leg. `null` everywhere today: the spot leg
   * is held outright, so this is a modelled zero rather than an omission for someone
   * to rediscover when margin spot lands.
   */
  spotBorrowAprPct: number | null;
};

/*
 * Funding rates are spread across a wider band than the venues shipped with, which
 * clustered inside 0.0185–0.028 and left every cross-venue spread under 0.01%/8h —
 * small enough that the UI needed a floor to look plausible. Each rate below is
 * still inside a real-world band (11%–36% outright APR); it is the dispersion that
 * changed, so the pairs now rank differently from one another.
 */
export const DEX_PROFILES: Record<ManagedDexId, DexProfile> = {
  Hyperliquid: {
    id: "Hyperliquid",
    funding8hPct: 0.0125,
    spark: [
      0.0104, 0.0118, 0.011, 0.0126, 0.0134, 0.013, 0.0139, 0.0134, 0.0142,
      0.0133, 0.0127, 0.0125,
    ],
    tvl: "$1.2B",
    perpTakerFeePct: 0.0175,
    spotTakerFeePct: 0.035,
    maintenanceMarginRatio: 0.005,
    perpGasPerLegUsd: 0,
    spotGasPerLegUsd: 0,
    spotBorrowAprPct: null,
  },
  Nado: {
    id: "Nado",
    funding8hPct: 0.01,
    spark: [
      0.0076, 0.0086, 0.0081, 0.0092, 0.0103, 0.0097, 0.0108, 0.0103, 0.0113,
      0.0103, 0.0097, 0.01,
    ],
    tvl: "$420M",
    perpTakerFeePct: 0.024,
    spotTakerFeePct: 0.04,
    maintenanceMarginRatio: 0.008,
    perpGasPerLegUsd: 0,
    spotGasPerLegUsd: 0,
    spotBorrowAprPct: null,
  },
  Pacifica: {
    id: "Pacifica",
    funding8hPct: 0.033,
    spark: [
      0.0259, 0.0295, 0.033, 0.0354, 0.0365, 0.0342, 0.0377, 0.0365, 0.0389,
      0.0365, 0.0354, 0.033,
    ],
    tvl: "$890M",
    perpTakerFeePct: 0.021,
    spotTakerFeePct: 0.03,
    maintenanceMarginRatio: 0.006,
    perpGasPerLegUsd: 0,
    spotGasPerLegUsd: 0,
    spotBorrowAprPct: null,
  },
  Variational: {
    id: "Variational",
    funding8hPct: 0.026,
    spark: [
      0.021, 0.0232, 0.0254, 0.0243, 0.0277, 0.0265, 0.0288, 0.0277, 0.0299,
      0.0277, 0.0265, 0.026,
    ],
    tvl: "$310M",
    perpTakerFeePct: 0.02,
    spotTakerFeePct: 0.032,
    maintenanceMarginRatio: 0.0075,
    perpGasPerLegUsd: 0,
    spotGasPerLegUsd: 0,
    spotBorrowAprPct: null,
  },
};

export const DEX_FUNDING_INTERVAL_HOURS: Record<ManagedDexId, number> = {
  Pacifica: 1,
  Hyperliquid: 4,
  Nado: 8,
  Variational: 1,
};

export type LegAssignment = {
  longDex: ManagedDexId;
  shortDex: ManagedDexId;
  /**
   * `null` on a cash-and-carry long leg: spot earns no funding at all. `null` rather
   * than `0`, because a zero here is a rate the venue never quoted — the same class
   * of fabrication as the constants this module exists to remove.
   */
  longRate8h: number | null;
  shortRate8h: number;
  /** shortRate − longRate, %/8h. Non-negative by construction. */
  spread8h: number;
};

/**
 * Sides are not a user choice — funding assigns them. Shorts collect funding, so the
 * venue paying more takes the short leg and the cheaper venue takes the long leg.
 *
 * This makes the spread non-negative no matter which order the user picked the two
 * venues in, and it is what lets the legs flip on their own when the rates cross.
 */
export function resolveLegs(
  a: DexSelection,
  b: DexSelection,
): LegAssignment | null {
  if (a === "" || b === "" || a === b) return null;
  const shortDex = DEX_PROFILES[a].funding8hPct >= DEX_PROFILES[b].funding8hPct ? a : b;
  const longDex = shortDex === a ? b : a;
  const shortRate8h = DEX_PROFILES[shortDex].funding8hPct;
  const longRate8h = DEX_PROFILES[longDex].funding8hPct;
  return {
    longDex,
    shortDex,
    longRate8h,
    shortRate8h,
    spread8h: shortRate8h - longRate8h,
  };
}

/**
 * Cash-and-carry assigns sides by structure, not by rate: you hold the asset and
 * short the future, so **the perp is the short leg by definition**.
 *
 * `resolveLegs` cannot be reused here. Its rule — higher funding wins the short —
 * would hand the short to the spot venue whenever that venue's perp book happens to
 * quote the higher rate, which inverts the entire summary. The spot leg's own
 * `funding8hPct` is irrelevant to a position held on the spot book, so it does not
 * appear in the result at all.
 */
export function resolveCashAndCarryLegs(
  spotVenue: DexSelection,
  perpVenue: DexSelection,
): LegAssignment | null {
  if (spotVenue === "" || perpVenue === "" || spotVenue === perpVenue) return null;
  const shortRate8h = DEX_PROFILES[perpVenue].funding8hPct;
  return {
    longDex: spotVenue,
    shortDex: perpVenue,
    longRate8h: null,
    shortRate8h,
    // One leg pays, so the whole rate is the capture — there is nothing to net off.
    spread8h: shortRate8h,
  };
}

/**
 * The widest the two legs' funding rates pulled apart across the lookback window,
 * %/8h -- the ceiling the live spread is read against.
 *
 * Measured off the `spark` series the venue profiles already carry, pointwise: the
 * spread is a *difference*, so the widest one is the largest gap on any single
 * sample, not the gap between the two series' independent peaks. Those peaks can
 * fall in different weeks, and pairing them would quote a spread that never existed.
 *
 * Its predecessor was `Math.max(0.001, |spread| * 2.57)` -- the live spread scaled
 * by a constant, which is not a lookback at all and could never be crossed.
 */
export function maxFundingSpread8h(legs: LegAssignment): number {
  const shortSpark = DEX_PROFILES[legs.shortDex].spark;

  /*
   * Cash-and-carry: the spot leg quotes no funding, so the perp's own rate is the
   * whole capture and its own peak is the ceiling. Differencing against the spot
   * venue's perp book would net off a rate this position never touches.
   */
  if (legs.longRate8h === null) {
    return shortSpark.reduce((widest, rate) => Math.max(widest, rate), 0);
  }

  const longSpark = DEX_PROFILES[legs.longDex].spark;
  const samples = Math.min(longSpark.length, shortSpark.length);
  let widest = 0;
  for (let i = 0; i < samples; i += 1) {
    widest = Math.max(widest, Math.abs(shortSpark[i] - longSpark[i]));
  }
  // The live spread is one more observation of the same quantity, and it is not in
  // the series. A ceiling below the number it caps would read as a bug.
  return Math.max(widest, legs.spread8h);
}
