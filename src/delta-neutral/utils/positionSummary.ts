import {
  DEX_FUNDING_INTERVAL_HOURS,
  DEX_PROFILES,
  type LegAssignment,
  type ManagedDexId,
} from "./legs";
import type { InstrumentType, LegStructure, MarketProfile } from "./markets";

/** 8h funding epochs in a year. */
export const EPOCHS_PER_YEAR = (365 * 24) / 8;

/**
 * Round trips a year. One means opened once and closed once — a carry position.
 *
 * The predecessor multiplied fee drag by `EPOCHS_PER_YEAR * 0.25`, i.e. 273.75 round
 * trips a year, which describes a scalper rather than a vault.
 */
const DEFAULT_TURNOVER_PER_YEAR = 1;

export type LegLiquidation = {
  /** Equity over position value at entry: 1 / leverage. */
  marginRatio: number;
  /** How far price has to run against the leg, percent of mark. */
  adversePricePct: number;
  /** `null` when no mark price is known — the distance above still holds. */
  priceUsd: number | null;
  /**
   * Always true, and the reason this field exists. The two venues margin separately,
   * so the offsetting gain on the other leg is not collateral here: a squeeze can
   * liquidate this leg while the hedge is still open and profitable elsewhere.
   */
  isolated: true;
};

export type LegSummary = {
  venue: ManagedDexId;
  instrument: InstrumentType;
  side: "long" | "short";
  notionalUsd: number;
  /** Cash actually locked. Equals notional on a spot leg — spot cannot be levered. */
  capitalUsd: number;
  leverage: number;
  /** `null` on a spot leg: holding the coin earns no funding. */
  fundingRate8hPct: number | null;
  fundingIntervalHours: number | null;
  /** Signed from the vault's point of view: positive means this leg collects. */
  fundingAprPct: number | null;
  /** Staking or lending on the held coin. `null` on a perp leg. */
  yieldAprPct: number | null;
  openFeePct: number;
  openFeeUsd: number;
  priceImpactPct: number;
  priceImpactUsd: number;
  gasUsd: number;
  /** `null` on a spot leg, always. Coin held outright cannot be liquidated. */
  liquidation: LegLiquidation | null;
};

export type CostBreakdown = {
  fees: number;
  priceImpact: number;
  gas: number;
  total: number;
};

export type PositionSummary = {
  structure: LegStructure;
  /** Whether the numbers below are meaningful. A negative APR is still valid. */
  valid: boolean;
  /** Plain-English notes, blocking or advisory. First one is the headline. */
  reasons: string[];

  long: LegSummary;
  short: LegSummary;

  /** Per leg — the hedged size. Both legs match. */
  notionalUsd: number;
  /** Both legs added. For a "total traded" line only; never an APR denominator. */
  grossExposureUsd: number;
  netDeltaUsd: number;

  capitalRequiredUsd: number;
  /** notional / capital. Below 1 on cash-and-carry, always. */
  capitalEfficiencyX: number;

  grossFundingAprPct: number;
  spotYieldAprPct: number;
  feeDragAprPct: number;
  impactDragAprPct: number;
  gasDragAprPct: number;
  netAprOnNotionalPct: number;
  /** The headline. Return on the cash actually posted, net of every cost. */
  netAprOnCapitalPct: number;

  costToOpenUsd: CostBreakdown;
  roundTripCostUsd: CostBreakdown;
  breakEvenDays: number | null;

  /**
   * Gross — funding plus spot yield, before entry costs. Costs are reported
   * separately rather than amortised in here, so that "earns X/day, costs Y to open,
   * pays back in Z" reconciles on screen. `netAprOnCapitalPct` is the all-in rate.
   */
  incomeUsd: {
    perFundingInterval: number;
    daily: number;
    monthly: number;
    annual: number;
  };

  /** Spot <> Perp only. A one-off convergence gain, never annualised into the APR. */
  entryBasisPct: number | null;
  entryBasisUsd: number | null;

  fundingSettlement: { intervalHours: number; venue: ManagedDexId };
};

export type PositionSummaryInput = {
  structure: LegStructure;
  legs: LegAssignment;
  /** Which venue holds the spot leg. `null` on Perp <> Perp. */
  spotVenue: ManagedDexId | null;
  /** The Margin field — per leg, not a pot to be split. */
  marginUsd: number;
  leverage: number;
  market: MarketProfile;
  turnoverPerYear?: number;
};

/**
 * Isolated-margin liquidation distance.
 *
 * Liquidate when equity / position value falls to the maintenance margin ratio `m`.
 * With an initial margin fraction of 1/L and an adverse move of fraction `f`:
 *
 *   long:  (1/L - f) / (1 - f) = m  ->  f = (1/L - m) / (1 - m)
 *   short: (1/L - f) / (1 + f) = m  ->  f = (1/L - m) / (1 + m)
 *
 * At m = 0 both collapse to 1/L, which is the `px * (1 +/- 1/leverage)` shorthand
 * used in the trade panel — so this is a strict generalisation of it, not a
 * different model.
 */
function liquidationFor(
  side: "long" | "short",
  leverage: number,
  maintenanceMarginRatio: number,
  markPriceUsd: number | null,
): LegLiquidation | null {
  if (leverage <= 0) return null;
  const marginRatio = 1 / leverage;
  const denominator =
    side === "short" ? 1 + maintenanceMarginRatio : 1 - maintenanceMarginRatio;
  // Below maintenance at entry — no room at all rather than a negative distance.
  const adverseFrac = Math.max(
    0,
    (marginRatio - maintenanceMarginRatio) / denominator,
  );
  return {
    marginRatio,
    adversePricePct: adverseFrac * 100,
    priceUsd:
      markPriceUsd === null
        ? null
        : side === "short"
          ? markPriceUsd * (1 + adverseFrac)
          : markPriceUsd * (1 - adverseFrac),
    isolated: true,
  };
}

function buildLeg(args: {
  venue: ManagedDexId;
  instrument: InstrumentType;
  side: "long" | "short";
  notionalUsd: number;
  leverage: number;
  rate8hPct: number | null;
  market: MarketProfile;
  structure: LegStructure;
}): LegSummary {
  const {
    venue,
    instrument,
    side,
    notionalUsd,
    leverage,
    rate8hPct,
    market,
    structure,
  } = args;
  const profile = DEX_PROFILES[venue];
  const isSpot = instrument === "Spot";

  // Spot is bought outright, so it locks its full notional and carries no leverage.
  const legLeverage = isSpot ? 1 : leverage;
  const capitalUsd = isSpot ? notionalUsd : notionalUsd / legLeverage;

  // Fee by instrument. The predecessor summed two perp fees unconditionally, which
  // charged perp fees on a spot leg.
  const takerFeePct = isSpot
    ? (profile.spotTakerFeePct ?? 0)
    : profile.perpTakerFeePct;
  const impactBps = isSpot
    ? (market.spotImpactBpsPerMillion ?? 0)
    : market.perpImpactBpsPerMillion;
  const priceImpactPct = (impactBps * (notionalUsd / 1_000_000)) / 100;
  const gasUsd = isSpot ? (profile.spotGasPerLegUsd ?? 0) : profile.perpGasPerLegUsd;

  // A short collects positive funding; a long pays it.
  const fundingAprPct =
    rate8hPct === null
      ? null
      : (side === "short" ? rate8hPct : -rate8hPct) * EPOCHS_PER_YEAR;

  return {
    venue,
    instrument,
    side,
    notionalUsd,
    capitalUsd,
    leverage: legLeverage,
    fundingRate8hPct: rate8hPct,
    fundingIntervalHours: isSpot ? null : DEX_FUNDING_INTERVAL_HOURS[venue],
    fundingAprPct,
    yieldAprPct:
      isSpot && structure === "Spot <> Perp" ? market.spotYieldAprPct : null,
    openFeePct: takerFeePct,
    openFeeUsd: (notionalUsd * takerFeePct) / 100,
    priceImpactPct,
    priceImpactUsd: (notionalUsd * priceImpactPct) / 100,
    gasUsd,
    liquidation: isSpot
      ? null
      : liquidationFor(
          side,
          legLeverage,
          profile.maintenanceMarginRatio,
          market.markPriceUsd,
        ),
  };
}

/**
 * Everything the Position Summary renders, for either structure.
 *
 * Never throws and never clamps. The builder re-runs this on every keystroke, so a
 * throw would blank the page; and a floor on the output is what made the previous
 * headline a constant. A field that does not apply to a leg is `null`, not zero.
 */
export function buildPositionSummary(
  input: PositionSummaryInput,
): PositionSummary {
  const {
    structure,
    legs,
    spotVenue,
    marginUsd,
    leverage,
    market,
    turnoverPerYear = DEFAULT_TURNOVER_PER_YEAR,
  } = input;

  const reasons: string[] = [];
  const isCashAndCarry = structure === "Spot <> Perp";

  const safeLeverage = leverage > 0 ? leverage : 1;
  const notionalUsd = Math.max(0, marginUsd) * safeLeverage;

  // On cash-and-carry the spot leg is the long: you hold the coin and short the
  // future. `resolveCashAndCarryLegs` already assigns it that way.
  const longInstrument: InstrumentType =
    isCashAndCarry && legs.longDex === spotVenue ? "Spot" : "Perp";
  const shortInstrument: InstrumentType =
    isCashAndCarry && legs.shortDex === spotVenue ? "Spot" : "Perp";

  const long = buildLeg({
    venue: legs.longDex,
    instrument: longInstrument,
    side: "long",
    notionalUsd,
    leverage: safeLeverage,
    rate8hPct: longInstrument === "Spot" ? null : legs.longRate8h,
    market,
    structure,
  });
  const short = buildLeg({
    venue: legs.shortDex,
    instrument: shortInstrument,
    side: "short",
    notionalUsd,
    leverage: safeLeverage,
    rate8hPct: shortInstrument === "Spot" ? null : legs.shortRate8h,
    market,
    structure,
  });

  const capitalRequiredUsd = long.capitalUsd + short.capitalUsd;

  // Both resolvers already fold the structure into `spread8h`: a cross-venue
  // difference on Perp <> Perp, the whole perp rate on cash-and-carry where only one
  // leg pays. So the annualisation is the same expression either way.
  const grossFundingAprPct = legs.spread8h * EPOCHS_PER_YEAR;
  const spotYieldAprPct = isCashAndCarry ? market.spotYieldAprPct : 0;

  // Costs are dollars across both legs; both legs carry the same notional, so summing
  // the two percentages gives the drag as a percentage of one leg's notional — the
  // same denominator the APR uses.
  const openFeePctTotal = long.openFeePct + short.openFeePct;
  const openImpactPctTotal = long.priceImpactPct + short.priceImpactPct;
  const openGasUsdTotal = long.gasUsd + short.gasUsd;

  const costToOpenUsd: CostBreakdown = {
    fees: long.openFeeUsd + short.openFeeUsd,
    priceImpact: long.priceImpactUsd + short.priceImpactUsd,
    gas: openGasUsdTotal,
    total: 0,
  };
  costToOpenUsd.total =
    costToOpenUsd.fees + costToOpenUsd.priceImpact + costToOpenUsd.gas;

  // Closing costs about what opening did — a delta-neutral exit unwinds the same two
  // legs, the same way round.
  const roundTripCostUsd: CostBreakdown = {
    fees: costToOpenUsd.fees * 2,
    priceImpact: costToOpenUsd.priceImpact * 2,
    gas: costToOpenUsd.gas * 2,
    total: costToOpenUsd.total * 2,
  };

  const feeDragAprPct = openFeePctTotal * 2 * turnoverPerYear;
  const impactDragAprPct = openImpactPctTotal * 2 * turnoverPerYear;
  const gasDragAprPct =
    notionalUsd > 0
      ? ((openGasUsdTotal * 2) / notionalUsd) * 100 * turnoverPerYear
      : 0;

  const netAprOnNotionalPct =
    grossFundingAprPct +
    spotYieldAprPct -
    feeDragAprPct -
    impactDragAprPct -
    gasDragAprPct;

  const netIncomeAnnualUsd = (notionalUsd * netAprOnNotionalPct) / 100;
  const netAprOnCapitalPct =
    capitalRequiredUsd > 0 ? (netIncomeAnnualUsd / capitalRequiredUsd) * 100 : 0;

  // Only one venue settles on cash-and-carry, so the slower-of-the-two rule that
  // governs Perp <> Perp has nothing to compare against.
  const settlementVenue = isCashAndCarry
    ? short.venue
    : DEX_FUNDING_INTERVAL_HOURS[legs.longDex] >=
        DEX_FUNDING_INTERVAL_HOURS[legs.shortDex]
      ? legs.longDex
      : legs.shortDex;
  const intervalHours = DEX_FUNDING_INTERVAL_HOURS[settlementVenue];

  const grossAprPct = grossFundingAprPct + spotYieldAprPct;
  const grossIncomeDailyUsd = (notionalUsd * grossAprPct) / 100 / 365;

  const incomeUsd = {
    perFundingInterval:
      (notionalUsd * legs.spread8h * (intervalHours / 8)) / 100,
    daily: grossIncomeDailyUsd,
    monthly: grossIncomeDailyUsd * 30,
    annual: (notionalUsd * grossAprPct) / 100,
  };

  const breakEvenDays =
    grossIncomeDailyUsd > 0 ? roundTripCostUsd.total / grossIncomeDailyUsd : null;

  let valid = true;
  if (marginUsd <= 0) {
    valid = false;
    reasons.push("Enter an amount to size the position.");
  }
  if (leverage <= 0) {
    valid = false;
    reasons.push("Leverage must be at least 1x.");
  }
  if (isCashAndCarry && spotVenue !== null) {
    if (DEX_PROFILES[spotVenue].spotTakerFeePct === null) {
      valid = false;
      reasons.push(`${spotVenue} has no spot book for this pair.`);
    }
    if (market.spotImpactBpsPerMillion === null) {
      valid = false;
      reasons.push(`${market.token} trades as a perpetual only.`);
    }
  }
  for (const leg of [long, short]) {
    if (leg.liquidation && leg.liquidation.adversePricePct === 0) {
      valid = false;
      reasons.push(
        `${safeLeverage}x is above the maximum ${leg.venue} will margin.`,
      );
    }
  }
  if (valid && netAprOnCapitalPct <= 0) {
    reasons.push("Round-trip cost exceeds the spread at this size.");
  }

  return {
    structure,
    valid,
    reasons,
    long,
    short,
    notionalUsd,
    grossExposureUsd: long.notionalUsd + short.notionalUsd,
    netDeltaUsd: long.notionalUsd - short.notionalUsd,
    capitalRequiredUsd,
    capitalEfficiencyX:
      capitalRequiredUsd > 0 ? notionalUsd / capitalRequiredUsd : 0,
    grossFundingAprPct,
    spotYieldAprPct,
    feeDragAprPct,
    impactDragAprPct,
    gasDragAprPct,
    netAprOnNotionalPct,
    netAprOnCapitalPct,
    costToOpenUsd,
    roundTripCostUsd,
    breakEvenDays,
    incomeUsd,
    entryBasisPct: isCashAndCarry ? market.basisPct : null,
    entryBasisUsd: isCashAndCarry ? (notionalUsd * market.basisPct) / 100 : null,
    fundingSettlement: { intervalHours, venue: settlementVenue },
  };
}
