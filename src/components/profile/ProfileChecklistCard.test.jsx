import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { clearProfile, writeProfile } from "../../lib/profileSession.js";
import ProfileChecklistCard from "./ProfileChecklistCard.jsx";
import { ProfileProvider } from "./ProfileContext.jsx";
import { PROFILE_POINTS_TOTAL, PROFILE_STEP_ORDER } from "./profileSteps.js";

/**
 * The checklist's points column is a sum shown to the user, and a user who is at
 * 150 with one +100 step left will do that arithmetic. These tests assert the
 * card shows its working — every figure in the column equals the total printed
 * underneath it — in *both* states, because the bug they exist for is that the
 * finished card used to drop the breakdown and print the total alone.
 *
 * They read the rendered markup rather than the module's constants on purpose —
 * `PROFILE_POINTS_TOTAL` is derived from `PROFILE_POINTS`, so comparing the two
 * proves nothing about what a step that never got a row would do to the page.
 */
const AT = "2026-01-01T00:00:00.000Z";
const ADDRESS = "0xchecklisttest";

const render = () =>
  renderToStaticMarkup(
    <ProfileProvider walletConnected address={ADDRESS}>
      <ProfileChecklistCard />
    </ProfileProvider>,
  );

/** Seed the in-memory record so the card renders its finished state. */
const renderComplete = () => {
  writeProfile(ADDRESS, {
    socials: {
      x: { provider: "x", handle: "@0xleverage", verifiedAt: AT },
      telegram: { provider: "telegram", handle: "@0xleverage", verifiedAt: AT },
    },
    pnlSharedAt: AT,
  });
  return render();
};

/** Seed the linked accounts while leaving the first closed-trade share due. */
const renderReadyToShare = () => {
  writeProfile(ADDRESS, {
    socials: {
      x: { provider: "x", handle: "@0xleverage", verifiedAt: AT },
      telegram: { provider: "telegram", handle: "@0xleverage", verifiedAt: AT },
    },
  });
  return render();
};

afterEach(() => clearProfile(ADDRESS));

/**
 * Every cell in the fixed-width points column, in document order: the `+N` step
 * lines, then the bare total. Keyed off the column's own width class, so a column
 * that stops rendering fails loudly rather than summing to zero unnoticed.
 */
function pointsColumn(html) {
  return [...html.matchAll(/class="w-14[^"]*">(\+?)(\d+)</g)].map((m) => ({
    signed: m[1] === "+",
    value: Number(m[2]),
  }));
}

describe("the checklist's points column adds up on screen", () => {
  it("prints one signed line per step, then a bare total", () => {
    const column = pointsColumn(render());
    expect(column).toHaveLength(PROFILE_STEP_ORDER.length + 1);
    expect(column.slice(0, -1).every((cell) => cell.signed)).toBe(true);
    expect(column.at(-1).signed).toBe(false);
  });

  it("sums the signed lines to exactly the total it prints", () => {
    const column = pointsColumn(render());
    const lines = column.slice(0, -1).reduce((sum, cell) => sum + cell.value, 0);
    expect(lines).toBe(column.at(-1).value);
    expect(lines).toBe(PROFILE_POINTS_TOTAL);
  });

  it("counts three steps, with the share folded into the third", () => {
    const html = render();
    expect(html).toContain("of 3");
    expect(html).not.toContain("of 4");
    // The share is still on the board — it's named by the step that owns it,
    // not dropped along with its row.
    expect(html).toContain("share a PnL card");
  });

  it("has no unattributed bonus line left anywhere", () => {
    // 60 points used to arrive from nowhere on the last step. Nothing in the
    // column may be unattached to a row again.
    expect(render()).not.toContain("Finish bonus");
  });
});

describe("the finished card is the same ledger, not a receipt for one number", () => {
  it("keeps the whole breakdown on screen after the last step", () => {
    // The regression this file exists for: completion swapped the card for a
    // single "+250 points" badge, so the moment the user had a total worth
    // explaining was the moment the explanation disappeared.
    const column = pointsColumn(renderComplete());
    expect(column).toHaveLength(PROFILE_STEP_ORDER.length + 1);
    const lines = column.slice(0, -1).reduce((sum, cell) => sum + cell.value, 0);
    expect(lines).toBe(PROFILE_POINTS_TOTAL);
  });

  it("names what each earned line was for, in the past tense", () => {
    const html = renderComplete();
    for (const label of [
      "Wallet connected",
      "Telegram joined",
      // Both halves of step three, on the one row that was paid for them.
      "Following @hyprearn · PnL card shared",
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Profile complete");
    expect(html).toContain("of 3");
  });
});

describe("the closed-trade share action", () => {
  it("uses the closed trade as context instead of rendering a sample preview", () => {
    const html = renderReadyToShare();

    expect(html).toContain("Share this trade’s PnL");
    expect(html).toContain("Share on X as @0xleverage");
    expect(html).not.toContain("ETH · Long 5x");
    expect(html).not.toContain("+34.2%");
    expect(html).not.toContain("+$1,284");
  });
});
