/**
 * Step definitions and derived progress for "Complete your profile".
 *
 * Three required steps, and the first is already satisfied by the time the card
 * renders — the user arrived here by connecting a wallet. Starting them at 1/3
 * rather than 0/3 is the point, not an accident.
 */

import { DEFAULT_PREFERENCES } from "../terminal/strategyTrading/strategyTradingMockData.js";

export const STEP_WALLET = "wallet";
export const STEP_SOCIAL = "social";
export const STEP_TRADING = "trading";

/** Display-only. Derived on every render, never persisted. */
export const PROFILE_POINTS = {
  [STEP_WALLET]: 50,
  [STEP_SOCIAL]: 200,
  [STEP_TRADING]: 100,
  completionBonus: 150,
};

export const PROFILE_POINTS_TOTAL =
  PROFILE_POINTS[STEP_WALLET] +
  PROFILE_POINTS[STEP_SOCIAL] +
  PROFILE_POINTS[STEP_TRADING] +
  PROFILE_POINTS.completionBonus;

export const PROFILE_STEP_ORDER = [STEP_WALLET, STEP_SOCIAL, STEP_TRADING];

/**
 * The trading vocabulary is borrowed wholesale from `TradingPreferencesPanel`
 * so the profile and the strategy workstation never disagree about what
 * "balanced" means. `custom` is dropped — it needs a follow-up input that
 * doesn't belong in a three-field onboarding step.
 */
export const RISK_OPTIONS = [
  { id: "low", label: "Low", hint: "Fewer setups, tighter stops" },
  { id: "balanced", label: "Balanced", hint: "The default Copilot posture" },
  { id: "high", label: "High", hint: "More setups, wider stops" },
];

export const MARKET_OPTIONS = [
  { id: "btc", label: "BTC" },
  { id: "eth", label: "ETH" },
  { id: "sol", label: "SOL" },
  { id: "hype", label: "HYPE" },
];

export const LEVERAGE_OPTIONS = ["1x", "2x", "3x", "5x"];

export const DEFAULT_TRADING = {
  risk: DEFAULT_PREFERENCES.riskPreference,
  market: DEFAULT_PREFERENCES.preferredMarkets?.[0] ?? "btc",
  maxLeverage: DEFAULT_PREFERENCES.maxLeverage,
};

/** @param {string} id */
export function riskLabel(id) {
  return RISK_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

/** @param {string} id */
export function marketLabel(id) {
  return MARKET_OPTIONS.find((o) => o.id === id)?.label ?? id?.toUpperCase();
}

/**
 * Seed the workstation's preference object from a saved profile. One-way: the
 * profile feeds Copilot, panel edits stay local to the workstation.
 *
 * @param {typeof DEFAULT_PREFERENCES} defaults
 * @param {import('../../lib/profileSession.js').ProfileTrading|null} trading
 */
export function mergeProfileTrading(defaults, trading) {
  if (!trading) return defaults;
  return {
    ...defaults,
    riskPreference: trading.risk,
    preferredMarkets: [trading.market],
    maxLeverage: trading.maxLeverage,
  };
}

/**
 * Wallet completion is the live session flag, never the stored record — a
 * reload drops `walletConnected` but must not drop the user's saved answers.
 *
 * @param {{ walletConnected: boolean, social: object|null, trading: object|null }} input
 */
export function computeProfileProgress({ walletConnected, social, trading }) {
  const done = {
    [STEP_WALLET]: Boolean(walletConnected),
    [STEP_SOCIAL]: Boolean(social),
    [STEP_TRADING]: Boolean(trading),
  };

  const completedCount = PROFILE_STEP_ORDER.filter((id) => done[id]).length;
  const isComplete = completedCount === PROFILE_STEP_ORDER.length;

  const earned =
    PROFILE_STEP_ORDER.reduce(
      (sum, id) => (done[id] ? sum + PROFILE_POINTS[id] : sum),
      0,
    ) + (isComplete ? PROFILE_POINTS.completionBonus : 0);

  return {
    done,
    completedCount,
    totalCount: PROFILE_STEP_ORDER.length,
    percent: Math.round((completedCount / PROFILE_STEP_ORDER.length) * 100),
    points: earned,
    pointsTotal: PROFILE_POINTS_TOTAL,
    isComplete,
  };
}
