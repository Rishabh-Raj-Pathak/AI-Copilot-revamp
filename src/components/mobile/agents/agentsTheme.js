import { appImages } from "../mobileAssets.js";

/**
 * Shared gold-theme pieces for the phone Agents tab (Figma "02 Agents", 929:1147).
 *
 * The Agents screens carry the gold palette (#E8D5B5 / #CCB17F / #785A28 /
 * #717182) that has no `app-*` token, so the recurring recipes live here once
 * instead of being retyped per component.
 */

/** Page title type; the fill is one of the two gradients below. */
const GOLD_TITLE_TYPE =
  "w-fit bg-clip-text text-[26px] font-bold leading-[28.6px] tracking-[-0.52px] text-transparent";

/** "Delta Neutral": white → cream (50%) → bronze, top to bottom (Figma 951:4069). */
export const GOLD_TITLE_CLASS = `${GOLD_TITLE_TYPE} bg-[linear-gradient(180deg,#ffffff_0%,#e8d5b5_50%,#785a28_100%)]`;

/** "Agents": the same ramp with the cream stop at 60% (Figma 953:4137). */
export const GOLD_TITLE_AGENTS_CLASS = `${GOLD_TITLE_TYPE} bg-[linear-gradient(180deg,#ffffff_0%,#e8d5b5_60%,#785a28_100%)]`;

/** Pill fill shared by the switcher's active segment and the non-custodial badge. */
export const GOLD_PILL_FILL = "bg-[linear-gradient(180deg,#1a140b_0%,#0f0e0c_100%)]";

/** Delta Neutral venues (`ManagedDexId`) → vendored kit marks. Variational has none. */
export const DN_VENUE_LOGOS = {
  Hyperliquid: appImages.venue.hyperliquid,
  Nado: appImages.venue.nado,
  Pacifica: appImages.venue.pacifica,
};

/** Chain tag shown beside a venue that settles on its own chain (Figma "Chain", 951:4123). */
export const DN_VENUE_CHAINS = {
  Pacifica: "Solana",
};

/** Alpha agent badge palette keyed by `vault.badge.type` — the same hues VaultRow uses. */
export const AGENT_BADGE_CLASSES = {
  popular: "border-[rgba(43,127,255,0.2)] bg-[rgba(43,127,255,0.1)] text-[#51a2ff]",
  highApr: "border-[rgba(0,188,125,0.2)] bg-[rgba(0,188,125,0.1)] text-[#00d492]",
  highRisk: "border-[rgba(255,105,0,0.2)] bg-[rgba(255,105,0,0.1)] text-[#ff8904]",
};
