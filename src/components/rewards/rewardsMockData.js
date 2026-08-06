/**
 * Rewards / referral mock data — Figma Terminal `referral` (1023:15418).
 *
 * Every figure the design spells out is copied verbatim so the page reads exactly
 * like the artboard. The two things the artboard does not cover — the "Claim
 * History" tab and the Affiliate / Referred User toggle positions — are modelled
 * on the same shape and marked below; there is no backend behind any of it.
 */

/** Tier badge art, exported from Figma and vendored (see `terminalAssets.js` for why). */
const TIER_BADGE_DIR = "/rewards/tiers";

/** The three reward paths behind the `toggle-2` on the Referral Rewards panel. */
export const REWARD_PATHS = [
  { id: "direct", label: "Direct Path" },
  { id: "affiliate", label: "Affiliate" },
  { id: "referred", label: "Referred User" },
];

/**
 * Ladder of trading-volume tiers.
 *
 * `direct` is Figma's; `affiliate` (second-level referrals) and `referred` (what
 * the invited trader earns back) are illustrative — the artboard only draws the
 * Direct Path position of the toggle.
 */
export const REWARD_TIERS = [
  {
    id: "base",
    name: "Base",
    volume: "$0",
    badge: `${TIER_BADGE_DIR}/base.png`,
    /** Card chrome, straight off the artboard. */
    border: "#242424",
    background: "transparent",
    rewards: {
      direct: { revenueShare: "4%", tierBonus: "--" },
      affiliate: { revenueShare: "1%", tierBonus: "--" },
      referred: { revenueShare: "4%", tierBonus: "--" },
    },
  },
  {
    id: "scout",
    name: "Scout",
    volume: "$500K+",
    badge: `${TIER_BADGE_DIR}/scout.png`,
    border: "#454545",
    background: "#0d0d0d",
    rewards: {
      direct: { revenueShare: "4%", tierBonus: "$40" },
      affiliate: { revenueShare: "1%", tierBonus: "$10" },
      referred: { revenueShare: "5%", tierBonus: "$20" },
    },
  },
  {
    id: "degen",
    name: "Degen",
    volume: "$2M+",
    badge: `${TIER_BADGE_DIR}/degen.png`,
    border: "#804400",
    background: "#0d0700",
    rewards: {
      direct: { revenueShare: "4%", tierBonus: "$80" },
      affiliate: { revenueShare: "1%", tierBonus: "$20" },
      referred: { revenueShare: "6%", tierBonus: "$40" },
    },
  },
  {
    id: "executor",
    name: "Executor",
    volume: "$10M+",
    badge: `${TIER_BADGE_DIR}/executor.png`,
    border: "#664e00",
    background: "#120e00",
    rewards: {
      direct: { revenueShare: "8%", tierBonus: "$800" },
      affiliate: { revenueShare: "2%", tierBonus: "$200" },
      referred: { revenueShare: "8%", tierBonus: "$400" },
    },
  },
  {
    id: "alpha-hunter",
    name: "Alpha Hunter",
    volume: "$35M+",
    badge: `${TIER_BADGE_DIR}/alpha-hunter.png`,
    border: "#004f80",
    background: "#00101a",
    rewards: {
      direct: { revenueShare: "15%", tierBonus: "$2,200" },
      affiliate: { revenueShare: "4%", tierBonus: "$550" },
      referred: { revenueShare: "10%", tierBonus: "$1,100" },
    },
  },
  {
    id: "whale",
    name: "Whale",
    volume: "$100M+",
    badge: `${TIER_BADGE_DIR}/whale.png`,
    /** Top tier gets the CTA ramp — 2px amber stroke over the scrimmed gradient. */
    highlighted: true,
    border: "#f2b500",
    background: "transparent",
    rewards: {
      direct: { revenueShare: "25%", tierBonus: "$4,000" },
      affiliate: { revenueShare: "6%", tierBonus: "$1,000" },
      referred: { revenueShare: "12%", tierBonus: "$2,000" },
    },
  },
];

/** Where the connected wallet sits on the ladder — drives the top-left card. */
export const CURRENT_TIER = {
  tierId: "base",
  name: "Base",
  volume: 254_000,
  nextTierVolume: 500_000,
  nextTierBonus: "$40",
  nextRevenueShare: "4%",
};

/** The five KPI tiles under the hero row. */
export const REWARD_STATS = {
  totalRewards: "$298,750",
  claimableRewards: "$298,750",
  fromYourTrades: "$72,400",
  fromReferrals: "$226,350",
  totalReferredUsers: "10",
};

// KOL variant: the same Rewards components, populated for Gautam's campaign.
export const KOL_CURRENT_MILESTONE = {
  tierId: "base",
  name: "M2",
  volume: 384_600,
  nextTierVolume: 500_000,
  nextTierBonus: "$60",
  nextMilestone: "M3",
};

export const KOL_REWARD_STATS = {
  totalRewards: "$32.84",
  claimableRewards: "$32.84",
  milestoneRewards: "$20.00",
  feeCashback: "$12.84",
  fromYourTrades: "$12.84",
  leaderboardRank: "#6",
};

export const KOL_REFERRAL_CODE = "GAUTAM";
export const KOL_FEE_REBATE = "8%";
export const KOL_CAMPAIGN_END = "2026-08-11T23:59:59+05:30";
export const KOL_MIN_CLAIM_AMOUNT = 10;

/**
 * Gautam campaign claims stay locked until milestone rewards and fee cashback
 * add up to the campaign's minimum claim amount.
 */
export function canClaimKolRewards(claimableAmount) {
  const numericAmount = Number.parseFloat(
    String(claimableAmount).replace(/[$,]/g, ""),
  );
  return Number.isFinite(numericAmount) && numericAmount >= KOL_MIN_CLAIM_AMOUNT;
}

export const KOL_MILESTONES = [
  {
    id: "m1",
    name: "M1",
    volume: "$50K",
    badge: `${TIER_BADGE_DIR}/base.png`,
    border: "#242424",
    background: "transparent",
    reward: "$5",
    cumulative: "$5",
  },
  {
    id: "m2",
    name: "M2",
    volume: "$150K",
    badge: `${TIER_BADGE_DIR}/scout.png`,
    border: "#454545",
    background: "#0d0d0d",
    reward: "$15",
    cumulative: "$20",
  },
  {
    id: "m3",
    name: "M3",
    volume: "$500K",
    badge: `${TIER_BADGE_DIR}/degen.png`,
    border: "#242424",
    background: "transparent",
    reward: "$60",
    cumulative: "$80",
  },
  {
    id: "m4",
    name: "M4",
    volume: "$1.5M",
    badge: `${TIER_BADGE_DIR}/executor.png`,
    border: "#664e00",
    background: "#120e00",
    reward: "$220",
    cumulative: "$300",
  },
  {
    id: "m5",
    name: "M5",
    volume: "$5M",
    badge: `${TIER_BADGE_DIR}/whale.png`,
    border: "#004f80",
    background: "#00101a",
    reward: "$900",
    cumulative: "$1,200",
  },
];

export const KOL_LEADERBOARD = [
  { id: 1, wallet: "0xA7...91F2", volume: "$4,860,200", milestone: "M4", claimedReward: "$300", movement: "+1" },
  { id: 2, wallet: "0xD9...34C9", volume: "$2,760,000", milestone: "M4", claimedReward: "$300", movement: "–1" },
  { id: 3, wallet: "0xE1...C1D4", volume: "$1,240,800", milestone: "M3", claimedReward: "$80", movement: "+2" },
  { id: 4, wallet: "0xF2...9B78", volume: "$890,400", milestone: "M3", claimedReward: "$80", movement: "–" },
  { id: 5, wallet: "0xB7...6D01", volume: "$562,100", milestone: "M3", claimedReward: "$80", movement: "+1" },
  {
    id: 6,
    wallet: "0x98...3ee8 · You",
    volume: "$384,600",
    milestone: "M2",
    claimedReward: "$25.32",
    movement: "+2",
    current: true,
  },
  { id: 7, wallet: "0xC4...18E4", volume: "$276,900", milestone: "M2", claimedReward: "$20", movement: "–2" },
  { id: 8, wallet: "0xB9...4C12", volume: "$148,300", milestone: "M1", claimedReward: "$5", movement: "+1" },
];

export const KOL_CLAIM_HISTORY = [
  { id: 1, date: "20 Jul, 2026", amount: "$17.64", source: "Milestone reward + fee cashback", status: "Sent to wallet" },
  { id: 2, date: "18 Jul, 2026", amount: "$5.20", source: "Milestone reward + fee cashback", status: "Sent to wallet" },
  { id: 3, date: "16 Jul, 2026", amount: "$2.48", source: "Gautam 8% fee cashback", status: "Sent to wallet" },
];

export const KOL_TOTAL_PAGES = 1;

/** Referral link + code shown in the "Your Referral Code" / "Enter a Code" cards. */
export const REFERRAL_LINK_PREFIX = "https://hyprearn.com/trading/";
export const REFERRAL_CODE = "HYPREARN";

/** Revenue share the owner of a code earns, and the fee rebate its user gets back. */
export const REFERRER_REVENUE_SHARE = "15%";
export const REFERRED_FEE_REBATE = "4%";

/** "Referred Users" tab — the ten rows the artboard lists. */
export const REFERRED_USERS = [
  { id: 1, wallet: "0x98...3ee8", joined: "12 May, 2025", volume: "$2,350,000", reward: "$2,350" },
  { id: 2, wallet: "0xb7...6D01", joined: "06 Apr, 2025", volume: "$8,200,000", reward: "$8,200" },
  { id: 3, wallet: "0xC4...18E4", joined: "22 Jun, 2025", volume: "$12,500,000", reward: "$12,500" },
  { id: 4, wallet: "0xD9...34C9", joined: "18 Jul, 2025", volume: "$28,700,000", reward: "$43,050" },
  { id: 5, wallet: "0xE1...C1D4", joined: "02 Aug, 2025", volume: "$36,400,000", reward: "$54,600" },
  { id: 6, wallet: "0xF2...9B78", joined: "28 Aug, 2025", volume: "$63,800,000", reward: "$127,600" },
  { id: 7, wallet: "0xA8...8E01", joined: "14 Sep, 2025", volume: "$108,000,000", reward: "$216,000" },
  { id: 8, wallet: "0xB9...4C12", joined: "29 Sep, 2025", volume: "$96,500,000", reward: "$193,000" },
  { id: 9, wallet: "0xC7...1A03", joined: "11 Oct, 2025", volume: "$52,300,000", reward: "$104,600" },
  { id: 10, wallet: "0xD1...F6A8", joined: "30 Oct, 2025", volume: "$11,800,000", reward: "$11,800" },
];

/** "Claim History" tab — same table shape, not drawn on the artboard. */
export const CLAIM_HISTORY = [
  { id: 1, date: "02 Nov, 2025", amount: "$54,200", source: "Referrals", status: "Paid" },
  { id: 2, date: "18 Oct, 2025", amount: "$12,900", source: "Your Trades", status: "Paid" },
  { id: 3, date: "05 Oct, 2025", amount: "$48,750", source: "Referrals", status: "Paid" },
  { id: 4, date: "21 Sep, 2025", amount: "$9,400", source: "Your Trades", status: "Paid" },
  { id: 5, date: "07 Sep, 2025", amount: "$31,600", source: "Referrals", status: "Paid" },
  { id: 6, date: "24 Aug, 2025", amount: "$27,300", source: "Referrals", status: "Paid" },
  { id: 7, date: "10 Aug, 2025", amount: "$8,100", source: "Your Trades", status: "Paid" },
  { id: 8, date: "27 Jul, 2025", amount: "$19,450", source: "Referrals", status: "Paid" },
  { id: 9, date: "13 Jul, 2025", amount: "$6,800", source: "Your Trades", status: "Paid" },
  { id: 10, date: "29 Jun, 2025", amount: "$22,150", source: "Referrals", status: "Paid" },
];

/** The artboard's pager reads "Showing Page 1 of 100". */
export const TOTAL_PAGES = 100;

/**
 * Look up a tier's numbers for the selected path.
 * @param {(typeof REWARD_TIERS)[number]} tier
 * @param {string} pathId
 */
export function tierRewardsForPath(tier, pathId) {
  return tier.rewards[pathId] ?? tier.rewards.direct;
}
