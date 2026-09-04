/**
 * The handful of literal colours the Compete surface owns, in one place because
 * the card and the entry modal have to agree on them: the modal is launched by
 * the card's CTA and sits directly on top of it, so a second copy of the sweep
 * that drifted by a hex would read as a rendering bug.
 *
 * Everything else on this surface is the ink ladder or a design token — see
 * src/design-system/TYPE-SCALE.md. These are here only because a gradient
 * cannot be expressed as one.
 *
 * A plain module rather than exports on `CompetitionCard`, so react-refresh
 * keeps treating that file as a component module.
 */

/** The HyprEarn sweep — gold in, teal out. Same ramp on the edge and the CTA. */
export const EDGE_SWEEP = "linear-gradient(90deg,#A88900 0%,#86890A 50%,#09855C 100%)";
export const CTA_SWEEP = "linear-gradient(90deg,#FED501 0%,#FCD603 25%,#00CDC9 100%)";

/** Settled edge on a competition that has already paid out. */
export const EDGE_ENDED = "#3E3E3E";

/*
 * Two accents, and everything else is the ink ladder. The reference art has
 * the dot and the countdown at slightly different greens, and three near-
 * identical greys on the settled card — that is antialiasing noise in a
 * screenshot, not intent, so it collapses here.
 */
export const LIVE_GREEN = "#4AE87F";
export const GOLD = "#FFD400";
export const INK_MUTED = "#bfbfbf";
export const INK_FAINT = "#757575";

/** One tint across every icon on a running card; grey once it has settled. */
export const LIVE_ICON = "#B6DE4A";

/**
 * The "done" green, taken from the profile's connect rows rather than from
 * `LIVE_GREEN` above. A linked account looks the same wherever the app shows
 * one, and the entry modal renders the same X row the profile checklist does.
 */
export const SETTLED_GREEN = "#00f3b6";
export const SETTLED_BORDER = "#1e5a3f";
export const SETTLED_BG = "#0d2019";
