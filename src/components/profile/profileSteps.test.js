import { describe, expect, it } from "vitest";
import {
  PROFILE_POINTS,
  PROFILE_POINTS_TOTAL,
  PROFILE_STEP_ORDER,
  SOCIAL_POINTS,
  X_LINK_POINTS,
  X_SHARE_POINTS,
  computeProfileProgress,
} from "./profileSteps.js";

const AT = "2026-01-01T00:00:00.000Z";

/** Linked. For Telegram that's the whole step; for X it's the first half. */
const linked = (provider) => ({
  provider,
  handle: "@0xleverage",
  verifiedAt: AT,
});

const progressOf = (socials, { walletConnected = true, pnlShared = false } = {}) =>
  computeProfileProgress({
    walletConnected,
    pnlShared,
    socials: { x: null, telegram: null, ...socials },
  });

/** Every step done: the only state that pays out the whole board. */
const finished = () =>
  progressOf(
    { telegram: linked("telegram"), x: linked("x") },
    { pnlShared: true },
  );

describe("the board sums to 250 across three named steps", () => {
  it("prices the ladder 25 / 50 / 175", () => {
    expect(PROFILE_POINTS.wallet).toBe(25);
    expect(PROFILE_POINTS.telegram).toBe(50);
    expect(PROFILE_POINTS.x).toBe(175);
    expect(PROFILE_POINTS_TOTAL).toBe(250);
  });

  it("splits the X step into the link and the post it enables", () => {
    expect(X_LINK_POINTS).toBe(75);
    expect(X_SHARE_POINTS).toBe(100);
    expect(X_LINK_POINTS + X_SHARE_POINTS).toBe(PROFILE_POINTS.x);
  });

  it("attaches every point to a step, with nothing left over", () => {
    // The regression this whole model exists to prevent: a completion bonus
    // worth 60 that no row could account for, so a finished profile showed a
    // number the user couldn't trace. Anything on the board that isn't a step's
    // points is exactly that bug coming back.
    const fromSteps = PROFILE_STEP_ORDER.reduce(
      (sum, id) => sum + PROFILE_POINTS[id],
      0,
    );
    expect(fromSteps).toBe(PROFILE_POINTS_TOTAL);
    expect(PROFILE_POINTS.completionBonus).toBeUndefined();
    expect(PROFILE_POINTS.share).toBeUndefined();
    expect(Object.keys(PROFILE_POINTS).sort()).toEqual(
      [...PROFILE_STEP_ORDER].sort(),
    );
  });

  it("pays each step more than the one before it", () => {
    // The ladder is what makes the column checkable by eye; a step that slipped
    // below its predecessor would still sum to 250 and read as arbitrary.
    const values = PROFILE_STEP_ORDER.map((id) => PROFILE_POINTS[id]);
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it("prices the per-provider connect rows at what the link alone is worth", () => {
    // Telegram's link is its whole step; X's is half of one. The connect row
    // must promise the half, not the row it lives in — a `+175` on the button
    // would be collected in two goes.
    expect(SOCIAL_POINTS).toEqual({
      telegram: PROFILE_POINTS.telegram,
      x: X_LINK_POINTS,
    });
    expect(SOCIAL_POINTS.x).toBeLessThan(PROFILE_POINTS.x);
  });

  it("promises the whole board, because every step is required", () => {
    const progress = progressOf({}, { walletConnected: false });
    expect(progress.pointsRemaining).toBe(PROFILE_POINTS_TOTAL);
    expect(progress.points).toBe(0);
    expect(progress.totalCount).toBe(3);
  });
});

describe("computeProfileProgress — every action pays when it lands", () => {
  it("credits the wallet immediately", () => {
    const progress = progressOf({});
    expect(progress.points).toBe(PROFILE_POINTS.wallet);
    expect(progress.completedCount).toBe(1);
  });

  it("credits Telegram on the join, with nothing held back for an alert", () => {
    const progress = progressOf({ telegram: linked("telegram") });
    expect(progress.done.telegram).toBe(true);
    expect(progress.points).toBe(PROFILE_POINTS.wallet + PROFILE_POINTS.telegram);
  });

  it("credits the X link before the step it belongs to is finished", () => {
    // The user is 75 up the moment they authorize, and the header would be
    // lying to them if the step paid nothing until the card went out.
    const progress = progressOf({ x: linked("x") });
    expect(progress.done.x).toBe(false);
    expect(progress.points).toBe(PROFILE_POINTS.wallet + X_LINK_POINTS);
  });

  it("finishes the X step only once the card is posted from it", () => {
    const linkedOnly = progressOf({ x: linked("x") });
    const shared = progressOf({ x: linked("x") }, { pnlShared: true });
    expect(shared.done.x).toBe(true);
    expect(shared.points - linkedOnly.points).toBe(X_SHARE_POINTS);
  });

  it("won't pay the post out without the account it posts from", () => {
    // "Nothing to post from ⇒ nothing posted" has to hold for the record, not
    // just for the panel that hides the button.
    const progress = progressOf({}, { pnlShared: true });
    expect(progress.done.x).toBe(false);
    expect(progress.points).toBe(PROFILE_POINTS.wallet);
  });

  it("ignores any leftover activation flag on a linked account", () => {
    // Records from an older board carried `activatedAt`. Whether it's present or
    // not must not change what a link is worth.
    const stale = { ...linked("x"), activatedAt: null };
    expect(progressOf({ x: stale }).points).toBe(progressOf({ x: linked("x") }).points);
  });

  it("reaches the full 250 only once the card is posted", () => {
    const progress = finished();
    expect(progress.isComplete).toBe(true);
    expect(progress.points).toBe(250);
    expect(progress.pointsRemaining).toBe(0);
  });

  it("leaves exactly the post outstanding when it's the last thing left", () => {
    const progress = progressOf({ telegram: linked("telegram"), x: linked("x") });
    expect(progress.completedCount).toBe(2);
    expect(progress.isComplete).toBe(false);
    expect(progress.pointsRemaining).toBe(X_SHARE_POINTS);
  });

  it("holds the wallet step to the live session flag, not the record", () => {
    const progress = progressOf(
      { telegram: linked("telegram"), x: linked("x") },
      { walletConnected: false, pnlShared: true },
    );
    expect(progress.done.wallet).toBe(false);
    expect(progress.isComplete).toBe(false);
  });
});

describe("step ordering and progress reporting", () => {
  it("runs wallet, Telegram, then X — with the share inside the last one", () => {
    expect(PROFILE_STEP_ORDER).toEqual(["wallet", "telegram", "x"]);
    expect(Object.keys(progressOf({}).done)).toEqual(PROFILE_STEP_ORDER);
  });

  it("reports percent off completed steps", () => {
    expect(progressOf({}).percent).toBe(33);
    expect(progressOf({ telegram: linked("telegram") }).percent).toBe(67);
    expect(finished().percent).toBe(100);
  });
});
