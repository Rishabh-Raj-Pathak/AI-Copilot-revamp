/**
 * Step definitions and derived progress for "Complete your profile".
 *
 * Three required steps, and the first is already satisfied by the time the card
 * renders — the user arrived here by connecting a wallet. Starting them at 1/3
 * rather than 0/3 is the point, not an accident.
 */

export const STEP_WALLET = "wallet";
export const STEP_SOCIAL = "social";
export const STEP_FOLLOW = "follow";

/** Display-only. Derived on every render, never persisted. */
export const PROFILE_POINTS = {
  [STEP_WALLET]: 50,
  [STEP_SOCIAL]: 200,
  [STEP_FOLLOW]: 100,
  completionBonus: 150,
};

export const PROFILE_POINTS_TOTAL =
  PROFILE_POINTS[STEP_WALLET] +
  PROFILE_POINTS[STEP_SOCIAL] +
  PROFILE_POINTS[STEP_FOLLOW] +
  PROFILE_POINTS.completionBonus;

export const PROFILE_STEP_ORDER = [STEP_WALLET, STEP_SOCIAL, STEP_FOLLOW];

/**
 * Wallet completion is the live session flag, never the stored record — a
 * reload drops `walletConnected` but must not drop the user's saved answers.
 *
 * @param {{ walletConnected: boolean, hasSocial: boolean, followedX: boolean }} input
 */
export function computeProfileProgress({ walletConnected, hasSocial, followedX }) {
  const done = {
    [STEP_WALLET]: Boolean(walletConnected),
    [STEP_SOCIAL]: Boolean(hasSocial),
    [STEP_FOLLOW]: Boolean(followedX),
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
