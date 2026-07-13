export type ManagedDexId = "Hyperliquid" | "Nado" | "Pacifica";
export type DexSelection = ManagedDexId | "";

export type DexProfile = {
  id: ManagedDexId;
  /** 8h funding rate, percent (e.g. 0.021 = 0.021%) */
  funding8hPct: number;
  spark: number[];
  tvl: string;
  feeRoundTripPct: string;
};

export const DEX_PROFILES: Record<ManagedDexId, DexProfile> = {
  Hyperliquid: {
    id: "Hyperliquid",
    funding8hPct: 0.021,
    spark: [
      0.018, 0.021, 0.019, 0.022, 0.024, 0.023, 0.025, 0.024, 0.026, 0.024,
      0.023, 0.024,
    ],
    tvl: "$1.2B",
    feeRoundTripPct: "0.035",
  },
  Nado: {
    id: "Nado",
    funding8hPct: 0.0185,
    spark: [
      0.014, 0.016, 0.015, 0.017, 0.019, 0.018, 0.02, 0.019, 0.021, 0.019,
      0.018, 0.019,
    ],
    tvl: "$420M",
    feeRoundTripPct: "0.048",
  },
  Pacifica: {
    id: "Pacifica",
    funding8hPct: 0.028,
    spark: [
      0.022, 0.025, 0.028, 0.03, 0.031, 0.029, 0.032, 0.031, 0.033, 0.031, 0.03,
      0.031,
    ],
    tvl: "$890M",
    feeRoundTripPct: "0.042",
  },
};

export const DEX_FUNDING_INTERVAL_HOURS: Record<ManagedDexId, number> = {
  Pacifica: 1,
  Hyperliquid: 4,
  Nado: 8,
};

export type LegAssignment = {
  longDex: ManagedDexId;
  shortDex: ManagedDexId;
  longRate8h: number;
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
