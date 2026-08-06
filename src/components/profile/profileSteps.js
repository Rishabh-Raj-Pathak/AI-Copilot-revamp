/**
 * Step definitions and derived progress for "Complete your profile".
 *
 * Three steps, and the first is already satisfied by the time the card renders —
 * the user arrived here by connecting a wallet. Starting them at 1/3 rather than
 * 0/3 is the point, not an accident.
 *
 * Sharing a PnL card used to be a fourth row and isn't one any more: it's the
 * second half of the X step. There is nothing to post from until X is linked, so
 * a row of its own could only ever be a locked row waiting on the row above it —
 * a step the user can see, can't start, and has to be told why. Folding it in
 * deletes both the lock and the wait: step three links the account and posts the
 * first card from it, in one panel, in the order those two things happen.
 *
 * Every point on the board belongs to an action the user can name. There is no
 * completion bonus any more, and that removal is the whole fix: 60 of the old
 * 250 arrived out of nowhere the instant the last step landed, so a finished
 * profile reading "+250" could only be traced back to 190 of itself. The rest
 * had to be taken on trust, which is exactly the thing a points board can't ask
 * for.
 *
 * What's left is a ladder — 25 / 50 / 175, in the order the steps are done. It
 * sums to 250 by construction and, more importantly, visibly: each step pays
 * more than the one before it, so the column can be checked by eye without
 * trusting the total printed under it. The last rung is two moves and is priced
 * as two (75 for the link, 100 for the post), so it credits as the user goes
 * rather than paying nothing until both have landed.
 */

export const STEP_WALLET = "wallet";
/** Deliberately equal to the provider ids in `socials` — see `SOCIAL_POINTS`. */
export const STEP_TELEGRAM = "telegram";
export const STEP_X = "x";

/**
 * The two halves of step three, priced separately.
 *
 * The link is worth more than Telegram because it's the account we can attribute
 * referrals to; the post is worth the most on the board because it's the only
 * thing the profile does that's visible outside the app. Together they're what
 * the step's row prints.
 */
export const X_LINK_POINTS = 75;
export const X_SHARE_POINTS = 100;

/**
 * Display-only. Derived on every render, never persisted.
 *
 * The board sums to 250 — the profile's hard ceiling — and every one of those
 * points is attached to something the user did:
 *   wallet  25 (10%) — already satisfied on arrival, so it's a head start, not a
 *                      payday. Big enough to see, small enough not to be the
 *                      reason anyone's here.
 *   tg      50 (20%) — a pairing code and a round trip through the bot. More
 *                      friction than an OAuth click, and priced above one.
 *   x      175 (70%) — one authorization that is also the follow, and then the
 *                      first PnL card posted from it. The heaviest step because
 *                      it's the one that ends with the profile working for us
 *                      rather than the other way round.
 */
export const PROFILE_POINTS = {
  [STEP_WALLET]: 25,
  [STEP_TELEGRAM]: 50,
  [STEP_X]: X_LINK_POINTS + X_SHARE_POINTS,
};

/**
 * What linking each provider is worth, keyed by provider id.
 *
 * Telegram's link is the whole step; X's is half of one, which is why this can't
 * just be an alias of `PROFILE_POINTS` any more. Components that think in
 * providers (the connect rows) use this and are talking about the link alone;
 * components that think in steps (the checklist) use `PROFILE_POINTS` and are
 * talking about the row's full value.
 */
export const SOCIAL_POINTS = {
  telegram: PROFILE_POINTS[STEP_TELEGRAM],
  x: X_LINK_POINTS,
};

/** The link steps, in checklist order. Wallet isn't a provider. */
export const SOCIAL_PROVIDER_ORDER = [STEP_TELEGRAM, STEP_X];

/**
 * Wallet, Telegram, X — and the share lives inside that last one, because you
 * can't post from an account you haven't linked.
 */
export const PROFILE_STEP_ORDER = [STEP_WALLET, STEP_TELEGRAM, STEP_X];

/** Every step is required, so this is both the ceiling and the promise. */
export const PROFILE_POINTS_TOTAL = PROFILE_STEP_ORDER.reduce(
  (sum, id) => sum + PROFILE_POINTS[id],
  0,
);

/**
 * Wallet completion is the live session flag, never the stored record — a
 * reload drops `walletConnected` but must not drop the user's saved answers.
 *
 * @param {object} input
 * @param {boolean} input.walletConnected
 * @param {import('../../lib/profileSession.js').ProfileSocials} input.socials
 * @param {boolean} [input.pnlShared]
 */
export function computeProfileProgress({
  walletConnected,
  socials,
  pnlShared = false,
}) {
  const xLinked = Boolean(socials?.x);
  /**
   * Gated on the link as well as the post, so "nothing to post from ⇒ nothing
   * posted" holds by construction rather than by the share panel being careful.
   * Nothing can unlink an account today, but a record that arrived from anywhere
   * else shouldn't be able to pay out a post with no account behind it.
   */
  const xShared = xLinked && Boolean(pnlShared);

  const done = {
    [STEP_WALLET]: Boolean(walletConnected),
    [STEP_TELEGRAM]: Boolean(socials?.telegram),
    /** Both halves, or the step isn't done — the row is the pair. */
    [STEP_X]: xShared,
  };

  const completedCount = PROFILE_STEP_ORDER.filter((id) => done[id]).length;
  const isComplete = completedCount === PROFILE_STEP_ORDER.length;

  /**
   * Paid per action, not per row: a user who has linked X but not posted yet is
   * 75 up, and the header would be lying to them if it said otherwise.
   */
  const earned =
    (done[STEP_WALLET] ? PROFILE_POINTS[STEP_WALLET] : 0) +
    (done[STEP_TELEGRAM] ? PROFILE_POINTS[STEP_TELEGRAM] : 0) +
    (xLinked ? X_LINK_POINTS : 0) +
    (xShared ? X_SHARE_POINTS : 0);

  return {
    done,
    completedCount,
    totalCount: PROFILE_STEP_ORDER.length,
    percent: Math.round((completedCount / PROFILE_STEP_ORDER.length) * 100),
    points: earned,
    pointsTotal: PROFILE_POINTS_TOTAL,
    /**
     * Exactly `total - earned` now that every action pays out and nothing on the
     * board is optional. It stays a named field because callers render it as a
     * promise ("+N points left"), and that promise should break loudly here if
     * something ever goes optional again.
     */
    pointsRemaining: PROFILE_POINTS_TOTAL - earned,
    isComplete,
  };
}
