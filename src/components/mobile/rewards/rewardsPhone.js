import { appImages } from "../mobileAssets.js";

/**
 * Phone-only presentation data for Figma "Rewards / Referral — Full Page"
 * (955:4978). The numbers themselves stay in `rewards/rewardsMockData.js`;
 * this file only holds what the phone artboard draws differently from the
 * desktop one (card tints, badge sizes, the `$ 0` figure style).
 */

/** Figma `gradients/1` — the amber → aquamarine CTA ramp. */
export const CTA_RAMP = "linear-gradient(90deg, #f2b500 0%, #00f3b6 100%)";

/** Whale's fill: the same ramp behind an 85% black scrim (Figma `gradients/6`). */
export const SCRIMMED_RAMP =
  "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.85) 100%), linear-gradient(90deg, #f2b500 0%, #00f3b6 100%)";

/**
 * Card chrome per tier, straight off the phone artboard (955:5060…5138).
 * Scout and Whale differ from the desktop ladder: Scout is outlined in
 * border/accent, Whale in a 1px bronze line over the scrimmed ramp.
 */
export const PHONE_TIER_STYLE = {
  base: { border: "#242424", background: "#000000" },
  scout: { border: "#584200", background: "#0d0d0d" },
  degen: { border: "#804400", background: "#0d0700" },
  executor: { border: "#664e00", background: "#120e00" },
  "alpha-hunter": { border: "#004f80", background: "#00101a" },
  whale: { border: "#5a4a1a", backgroundImage: SCRIMMED_RAMP },
};

/** Each badge's drawn size on the artboard — the art is not framed alike. */
const BADGE_SIZE = {
  base: 63,
  scout: 45,
  degen: 63,
  executor: 46,
  alphaHunter: 53,
  whale: 46,
};

/** `/rewards/tiers/alpha-hunter.png` → `alphaHunter`, the `appImages.tier` key. */
function badgeKey(path) {
  const file = String(path).split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  return file.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

/** Vendored tier art and its artboard size for a tier or KOL milestone. */
export function tierBadge(tier) {
  const key = badgeKey(tier.badge);
  return {
    src: appImages.tier[key] ?? appImages.tier.base,
    size: BADGE_SIZE[key] ?? 46,
  };
}

/**
 * The phone artboard sets currency and percentages with a thin space before
 * the figure (`$ 0`, `$ 500K+`, `15 %`). Applied to the mock values so they
 * read like the design without changing the data.
 */
export function spaced(value) {
  return String(value)
    .replace(/^\$\s*/, "$ ")
    .replace(/(\d)%$/, "$1 %");
}

/** `$0` on the ladder reads `$ 0+` on the artboard, like every other tier. */
export function tierVolume(volume) {
  const text = spaced(volume);
  return text.endsWith("+") ? text : `${text}+`;
}

/** `254000` → `$254,000`. */
export function usd(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

/**
 * Table columns per tab. Four columns at the artboard's 40/108/91/94 split
 * (955:5160) — the desktop's fifth "Your Reward" column does not fit 358px.
 */
export const PHONE_TABLE_COLUMNS = {
  "referred-users": [
    { key: "wallet", label: "Wallet Address" },
    { key: "joined", label: "Date Joined" },
    { key: "volume", label: "Total Volume" },
  ],
  "claim-history": [
    { key: "date", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "source", label: "Source" },
  ],
  leaderboard: [
    { key: "wallet", label: "Wallet Address" },
    { key: "volume", label: "Total Volume" },
    { key: "milestone", label: "Milestone" },
  ],
  "kol-claims": [
    { key: "date", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
  ],
};

/** Flex weights for No. + three data columns, from the artboard header. */
export const COLUMN_FLEX = ["40 0 0", "108 0 0", "91 0 0", "94 0 0"];
