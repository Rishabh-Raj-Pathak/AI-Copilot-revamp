/**
 * Delta Neutral 2 phone theme — Figma `kN9AkNRzaxmg4mhFVkt1Bo` (Terminal),
 * section "Delta Neutral 2 · Mobile-native (390)" (4476:2).
 *
 * The vault colours (warm black, bronze, champagne) have no `app-*` token, so
 * every recurring recipe lives here once. Data colours follow the web DN code:
 * values #dcdce8, labels #717182, gold #ccb17f, titles #e8d5b5, green #00d492,
 * red #e5484d.
 *
 * Control scale (Figma notes 4512:2): pills in sentence case — 44 for page and
 * sheet CTAs, 38 for card actions, 32 for row actions; cards r16 / p14, tiles
 * and fields r12, toggles r10 / r8, chips r9.
 */

/* ── Fills (multi-layer gradients stay inline styles) ─────────────────── */

/** Alpha Agents card: #0c0c0c under a warm wash (Figma "Vault Card"). */
export const CARD_FILL = {
  backgroundImage:
    "linear-gradient(180deg, rgba(22,20,18,0.6) 0%, rgba(14,12,10,0.4) 100%), linear-gradient(90deg, #0c0c0c 0%, #0c0c0c 100%)",
};

/** Cross-DEX setup: a gold glow in the middle of a dark gradient. */
export const HERO_FILL = {
  backgroundImage:
    "radial-gradient(50% 50% at 50% 50%, rgba(214,177,107,0.08) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(14,13,12,0.9) 0%, rgba(10,10,10,0.96) 100%)",
};

/** Primary CTA ("New vault", "Open … vault", "Save"). */
export const BRONZE_FILL = {
  backgroundImage:
    "linear-gradient(180deg, rgba(56,42,28,0.98) 0%, rgba(28,24,18,0.99) 100%), linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.03) 100%)",
};

/** Row action that starts something ("Connect DEX", "Set up"). */
export const BRONZE_SMALL_FILL = {
  backgroundImage:
    "linear-gradient(180deg, rgba(42,34,25,0.98) 0%, rgba(20,16,12,0.99) 100%), linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.03) 100%)",
};

/* ── Surfaces ─────────────────────────────────────────────────────────── */

export const CARD = "flex flex-col gap-3 rounded-[16px] border p-3.5";
export const CARD_EDGE = "border-[rgba(120,90,40,0.5)]";
/** An expanded pair / history card lifts its edge to gold. */
export const CARD_EDGE_OPEN = "border-[rgba(214,177,107,0.45)]";
export const HERO_EDGE = "border-[rgba(214,177,107,0.22)]";

/** Inner tile (wallet rows, legs, breakdowns). */
export const TILE = "rounded-[12px] border border-white/[0.05] bg-[#0c0a08]";

/** 44px field (venue / token select, margin and leverage inputs). */
export const FIELD =
  "rounded-[12px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,18,19,0.98)_0%,rgba(11,11,12,0.99)_100%)]";

/** Sheets: warm-black gradient, #785a28 @35% edge, 24px top corners. */
export const SHEET_CLASS =
  "rounded-t-[24px]! border-[rgba(120,90,40,0.35)]! bg-[linear-gradient(180deg,#14120f_0%,#0a0908_100%)]!";

/** Hairline that fades out at both ends (Figma "Divider"). */
export const DIVIDER =
  "h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0)_100%)]";

/* ── Selection ────────────────────────────────────────────────────────── */

/** Group toggle (All / Categories / Tokens, Tokens / Categories): 36 tall, r10. */
export const TOGGLE = "flex gap-0.5 rounded-[10px] border border-white/[0.08] bg-[rgba(10,10,10,0.78)] p-0.5";
export const TOGGLE_OPTION =
  "relative flex h-8 min-w-0 flex-1 items-center justify-center rounded-[8px] border text-[13px] font-medium leading-[18px] transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0";
export const TOGGLE_ON =
  "border-[rgba(214,177,107,0.42)] bg-[linear-gradient(180deg,rgba(54,42,28,0.96)_0%,rgba(22,18,13,0.98)_100%)] text-[#f0ddb9]";
export const TOGGLE_OFF = "border-transparent text-[#9394a1] active:text-[#d9dae4]";

/** Category chip (32, r9): bronze when picked. */
export const CHIP = "flex h-8 items-center rounded-[9px] border text-[12px] leading-4 transition-colors";
export const CHIP_ON =
  "border-[rgba(214,177,107,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] font-semibold text-[#f0ddb9]";

/* ── Type ─────────────────────────────────────────────────────────────── */

/** Card eyebrow ("Cross-DEX setup", "Live rates", "Size"). */
export const EYEBROW =
  "text-[11px] font-semibold uppercase leading-[14px] tracking-[0.8px] text-[rgba(227,202,156,0.82)]";
/** Field label ("Venue A", "Market"). */
export const FIELD_LABEL = "text-[11px] font-medium uppercase leading-[14px] tracking-[0.5px] text-[#8f90a1]";
/** Data label (left of a row). */
export const LABEL = "text-[11px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]";
/** Data value (right of a row). */
export const VALUE = "text-[12px] leading-4 text-[#dcdce8]";
/** Small print under a list ("Each venue keeps its own wallet…"). */
export const HINT = "text-[11px] leading-[15px] text-[#8d8e99]";

export const GREEN = "text-[#00d492]";
export const RED = "text-[#e5484d]";
export const GOLD = "text-[#ccb17f]";
export const TITLE = "text-[#e8d5b5]";
