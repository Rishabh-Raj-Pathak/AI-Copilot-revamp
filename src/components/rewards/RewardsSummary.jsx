import { useEffect, useState } from "react";
import { Check, Copy, Gift, Info, Medal, SquarePen } from "lucide-react";
import { Tooltip } from "../ui/tooltip.jsx";
import {
  CURRENT_TIER,
  canClaimKolRewards,
  KOL_CAMPAIGN_END,
  KOL_CURRENT_MILESTONE,
  KOL_FEE_REBATE,
  KOL_MILESTONES,
  KOL_MIN_CLAIM_AMOUNT,
  KOL_REFERRAL_CODE,
  KOL_REWARD_STATS,
  REFERRAL_CODE,
  REFERRAL_LINK_PREFIX,
  REFERRED_FEE_REBATE,
  REFERRER_REVENUE_SHARE,
  REWARD_STATS,
  REWARD_TIERS,
} from "./rewardsMockData.js";

/** Amber → aquamarine CTA ramp (Figma `gradients/1`), used by the primary buttons. */
const CTA_RAMP = "linear-gradient(90deg, #f2b500 0%, #00f3b6 100%)";

/** Same ramp behind an 85% black scrim — Figma's `gradients/6` fill. */
const SCRIMMED_RAMP =
  "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.85) 100%), linear-gradient(90deg, #f2b500 0%, #00f3b6 100%)";

/** Card frame shared by every tile on this page (radius/sm, border/neutral/subtlest). */
const CARD = "rounded-lg border border-[#242424] p-5";

/**
 * Decorative 3D art bleeding off the right edge of four of the five KPI tiles,
 * exported from Figma and vendored under `public/rewards/stats`.
 *
 * Offsets are the artboard's own, measured against its 232×89 card and anchored to
 * the card's right edge so they survive the responsive grid. Each piece is drawn
 * twice — a heavily blurred copy for the glow, then the sharp one over it.
 */
const STAT_ART = {
  totalRewards: {
    src: "/rewards/stats/total-rewards.png",
    rotate: -20.87,
    glow: { right: -22.5, top: 16.2, width: 99.2, height: 83.2, blur: 40 },
    sharp: { right: -22.5, top: 16.2, width: 99.2, height: 83.2 },
  },
  fromYourTrades: {
    src: "/rewards/stats/from-trades.png",
    rotate: -7.49,
    glow: { right: -13.5, top: 23.5, width: 106, height: 87, blur: 40 },
    sharp: { right: -12.7, top: 23, width: 106, height: 87 },
  },
  fromReferrals: {
    src: "/rewards/stats/from-referrals.png",
    rotate: 139.32,
    glow: { right: -22.7, top: 17.6, width: 101.9, height: 110.1, blur: 45 },
    sharp: { right: -13, top: 9.5, width: 94.9, height: 102.5 },
  },
  totalReferredUsers: {
    src: "/rewards/stats/referred-users.png",
    rotate: 0,
    glow: { right: -10.5, top: 17.5, width: 70, height: 70, blur: 40 },
    sharp: { right: -13.5, top: 21.5, width: 74, height: 74 },
  },
};

function formatVolume(n) {
  return n.toLocaleString("en-US");
}

function formatCompactVolume(n) {
  const divisor = n >= 1_000_000 ? 1_000_000 : 1_000;
  const suffix = n >= 1_000_000 ? "M" : "K";
  const value = Number((n / divisor).toFixed(1));
  return `$${value}${suffix}`;
}

function formatCountdown(endAt) {
  const difference = Math.max(0, Date.parse(endAt) - Date.now());
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference / 3_600_000) % 24);
  const minutes = Math.floor((difference / 60_000) % 60);
  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

function useCampaignCountdown(enabled) {
  const [value, setValue] = useState(() =>
    enabled ? formatCountdown(KOL_CAMPAIGN_END) : "—",
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => setValue(formatCountdown(KOL_CAMPAIGN_END));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return value;
}

/**
 * Hero row — current tier progress, the wallet's own code, and the code entry box.
 * Three equal columns on tablet and up, stacked below it.
 */
export function RewardsHeroRow({ onNotify, variant = "rewards" }) {
  return (
    <div className="grid gap-5 tablet:grid-cols-3">
      <TierProgressCard variant={variant} />
      <ReferralCodeCard variant={variant} onNotify={onNotify} />
      <EnterCodeCard variant={variant} onNotify={onNotify} />
    </div>
  );
}

/** Top-left card: tier name, what the next tier pays, and volume progress toward it. */
function TierProgressCard({ variant }) {
  const isKol = variant === "kol";
  const progress = isKol ? KOL_CURRENT_MILESTONE : CURRENT_TIER;
  const { name, tierId, volume, nextTierVolume, nextTierBonus } = progress;
  const tier = isKol
    ? KOL_MILESTONES.find((item) => item.name === name) ?? KOL_MILESTONES[0]
    : REWARD_TIERS.find((item) => item.id === tierId) ?? REWARD_TIERS[0];
  const pct = Math.min(100, Math.round((volume / nextTierVolume) * 1000) / 10);
  const remainingVolume = Math.max(0, nextTierVolume - volume);
  const currentMilestoneLabel = isKol ? `Milestone ${name.slice(1)}` : name;
  const nextMilestoneLabel = isKol
    ? `Milestone ${progress.nextMilestone.slice(1)}`
    : progress.nextMilestone;

  if (isKol) {
    return (
      <section className="rounded-lg border border-[#f7bb08] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold leading-[1.2] text-white">
              <Medal
                className="size-5 shrink-0 text-[#f2b500]"
                strokeWidth={2.25}
                aria-hidden
              />
              {currentMilestoneLabel}
            </h2>
            <div className="mt-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-2xl font-semibold leading-none text-white">
                  {formatCompactVolume(volume)}
                </p>
                <span className="text-sm text-[#8f8f8f]">
                  of {formatCompactVolume(nextTierVolume)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-[#8f8f8f]">
                Your trading volume
              </p>
            </div>
          </div>
          <img
            src={tier.badge}
            alt=""
            className="size-20 shrink-0 object-contain tablet:size-24"
          />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-[#bfbfbf]">Progress to {nextMilestoneLabel}</p>
              <p className="mt-1 text-xs text-[#8f8f8f]">
                You’ll unlock{" "}
                <span className="font-semibold text-[#f2b500]">{nextTierBonus}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-xs text-[#8f8f8f]">
                {formatCompactVolume(remainingVolume)} to {progress.nextMilestone}
              </p>
              <span className="h-3 w-px bg-[#3a3a3a]" aria-hidden />
              <p className="text-sm font-semibold tabular-nums text-white">
                {Math.round(pct)}%
              </p>
            </div>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[#242424]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={nextTierVolume}
            aria-valuenow={volume}
            aria-label={`${Math.round(pct)}% complete toward ${nextMilestoneLabel}; ${formatVolume(remainingVolume)} trading volume remaining`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f7bb08] to-[#2fffce]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[#f7bb08] p-5">
      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold leading-[1.2] text-white">{name}</h2>
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-[#242424] px-3 py-1.5 text-sm font-medium leading-[1.2] text-white">
              <Medal className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              Tier Rewards
            </span>
          </div>
          <p className="text-sm leading-[1.2] text-[#bfbfbf]">
            Keep trading to advance to the next tier and earn a Tier Bonus of{" "}
            <span className="font-semibold text-[#f2b500]">{nextTierBonus}</span> and
            unlock a{" "}
            <span className="font-semibold text-[#f2b500]">
              {progress.nextRevenueShare}
            </span>{" "}
            Revenue Share
          </p>
        </div>
        <img
          src={tier.badge}
          alt=""
          className="size-20 shrink-0 object-contain tablet:size-24 xl:size-[120px]"
        />
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm leading-[1.2] text-[#757575]">Trading Volume</p>
        </div>
        <div
          className="h-[17px] w-full overflow-hidden rounded-full"
          style={{ backgroundImage: SCRIMMED_RAMP }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={nextTierVolume}
          aria-valuenow={volume}
          aria-label="Trading volume toward the next tier"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f7bb08] from-[65%] to-[#2fffce]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs leading-[1.2] text-white">
          {formatVolume(volume)} / {formatVolume(nextTierVolume)}
        </p>
      </div>
    </section>
  );
}

/**
 * Middle card: the wallet's own referral code.
 *
 * The artboard leaves the body of this card empty; it borrows the field + button
 * pair from its neighbour so the code is actually shareable.
 */
function ReferralCodeCard({ onNotify, variant }) {
  const isKol = variant === "kol";
  const [copied, setCopied] = useState(false);
  const code = REFERRAL_CODE;

  const copy = async () => {
    const link = `${REFERRAL_LINK_PREFIX}${code}`;
    try {
      await navigator.clipboard?.writeText(link);
    } catch {
      // Clipboard is best-effort in the prototype — still confirm to the user.
    }
    setCopied(true);
    onNotify?.(isKol ? "Gautam referral link copied" : "Referral link copied");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`flex flex-col justify-between gap-5 ${CARD}`}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold leading-[1.2] text-white">
          {isKol ? "Invite friends, earn rewards" : "Your Referral Code"}
        </h2>
        <p className="text-sm leading-[1.2] text-[#bfbfbf]">
          {isKol ? "Share your link and earn " : "Share this code with people to earn a "}
          <span className="font-semibold text-[#f2b500]">{REFERRER_REVENUE_SHARE}</span>{" "}
          {isKol ? "revenue share when your referrals trade." : "Revenue Share"}
        </p>
      </header>

      <div className="flex items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="truncate text-xs leading-[1.2] text-[#bfbfbf]">
            {REFERRAL_LINK_PREFIX}
          </p>
          <p className="truncate rounded-md border border-[#242424] bg-black px-3 py-2 text-sm font-medium leading-[1.2] text-white">
            {code}
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-base font-medium leading-[1.2] text-black transition-opacity hover:opacity-90"
          style={{ backgroundImage: CTA_RAMP }}
        >
          {copied ? (
            <Check className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          ) : (
            <Copy className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          )}
          {copied ? "Copied" : isKol ? "Copy link" : "Copy"}
        </button>
      </div>
    </section>
  );
}

/** Right card: apply someone else's code to rebate part of your trading fees. */
function EnterCodeCard({ onNotify, variant }) {
  const isKol = variant === "kol";
  const defaultCode = isKol ? KOL_REFERRAL_CODE : REFERRAL_CODE;
  const feeRebate = isKol ? KOL_FEE_REBATE : REFERRED_FEE_REBATE;
  const [code, setCode] = useState(defaultCode);
  const [draft, setDraft] = useState(defaultCode);
  const [editing, setEditing] = useState(false);

  const submit = () => {
    if (!editing) {
      setDraft(code);
      setEditing(true);
      return;
    }
    const next = draft.trim().toUpperCase();
    if (!next) return;
    setCode(next);
    setEditing(false);
    onNotify?.(`Referral code ${next} applied`);
  };

  return (
    <section className={`flex flex-col justify-between gap-5 ${CARD}`}>
      <header className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold leading-[1.2] text-white">
          {isKol ? `Get ${feeRebate} fee discount` : "Enter a Code"}
        </h2>
        <p className="text-sm leading-[1.2] text-[#bfbfbf]">
          {isKol ? (
            <>
              Get <span className="font-semibold text-[#f2b500]">{feeRebate}</span> of your
              trading fees back with code{" "}
              <span className="font-semibold text-white">{code}</span>.
            </>
          ) : (
            <>
              Use a referral code to get back{" "}
              <span className="font-semibold text-[#f2b500]">{feeRebate}</span> of your
              trading fees
            </>
          )}
        </p>
      </header>

      <div className="flex items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {!isKol ? (
            <label
              htmlFor="rewards-referral-code"
              className="truncate text-xs leading-[1.2] text-[#bfbfbf]"
            >
              {REFERRAL_LINK_PREFIX}
            </label>
          ) : null}
          <input
            id="rewards-referral-code"
            value={!isKol && editing ? draft : code}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (!isKol && e.key === "Enter") submit();
            }}
            readOnly={isKol || !editing}
            className="w-full rounded-md border border-[#242424] bg-black px-3 py-2 text-sm font-medium leading-[1.2] text-white outline-none read-only:cursor-default focus:border-[#f2b500]"
          />
        </div>
        {isKol ? (
          <span className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#146c5b] bg-[#071c18] px-4 text-sm font-medium leading-[1.2] text-[#52e5c4]">
            <Check className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Bonus active
          </span>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-base font-medium leading-[1.2] text-black transition-opacity hover:opacity-90"
            style={{ backgroundImage: CTA_RAMP }}
          >
            {editing ? (
            <Check className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            ) : (
              <SquarePen className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            )}
            {editing ? "Save" : "Edit"}
          </button>
        )}
      </div>
    </section>
  );
}

/** The five KPI tiles. `Claimable Rewards` carries the Claim action. */
export function RewardsStatsRow({ onClaim, variant = "rewards" }) {
  const isKol = variant === "kol";
  const stats = isKol ? KOL_REWARD_STATS : REWARD_STATS;
  const countdown = useCampaignCountdown(isKol);
  const numericClaimable = Number.parseFloat(
    String(stats.claimableRewards).replace(/[$,]/g, ""),
  );
  const canClaim = !isKol || canClaimKolRewards(stats.claimableRewards);
  const amountUntilClaim = Math.max(
    0,
    KOL_MIN_CLAIM_AMOUNT - (Number.isFinite(numericClaimable) ? numericClaimable : 0),
  );

  // Gautam's artboard puts the two earned tiles side by side and pushes the Claim
  // action third; the standard page keeps Claimable Rewards second.
  const claimTile = (
    <StatCard
      key="claim"
      compact={isKol}
      label={isKol ? "Available to claim" : "Claimable Rewards"}
      value={stats.claimableRewards}
      info={
        isKol
          ? `Claim once your balance reaches $${KOL_MIN_CLAIM_AMOUNT}. Your balance includes Gautam milestone rewards and ${KOL_FEE_REBATE} fee cashback.`
          : undefined
      }
      status={
        isKol
          ? canClaim
            ? "Ready to claim"
            : `$${amountUntilClaim.toFixed(2)} more to claim`
          : undefined
      }
    >
      <button
        type="button"
        onClick={onClaim}
        disabled={!canClaim}
        aria-label={
          canClaim
            ? `Claim ${stats.claimableRewards}`
            : `Claim unlocks at $${KOL_MIN_CLAIM_AMOUNT}`
        }
        className={`inline-flex shrink-0 items-center border border-[#241b00] font-medium leading-[1.2] text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40 ${
          isKol
            ? "h-8 gap-1.5 rounded-md px-4 text-sm"
            : "gap-1 rounded px-2 py-1 text-xs"
        }`}
        style={{ backgroundImage: CTA_RAMP }}
      >
        <Gift className="size-4 shrink-0" strokeWidth={2} aria-hidden />
        {canClaim ? "Claim" : `Unlock at $${KOL_MIN_CLAIM_AMOUNT}`}
      </button>
    </StatCard>
  );

  const feeTile = (
    <StatCard
      key="fees"
      compact={isKol}
      label={isKol ? "Cashback earned" : "From Your Trades"}
      value={stats.fromYourTrades}
      art={isKol ? undefined : STAT_ART.fromYourTrades}
    />
  );

  return (
    <div
      className={`grid grid-cols-2 gap-4 tablet:gap-5 ${
        isKol ? "tablet:grid-cols-4" : "tablet:grid-cols-5"
      }`}
    >
      <StatCard
        compact={isKol}
        label={isKol ? "Total earned" : "Total Rewards"}
        value={stats.totalRewards}
        art={isKol ? undefined : STAT_ART.totalRewards}
        accent={isKol}
      />
      {isKol ? feeTile : claimTile}
      {isKol ? claimTile : feeTile}
      <StatCard
        compact={isKol}
        label={isKol ? "Gautam campaign ends" : "From Referrals"}
        value={isKol ? countdown : stats.fromReferrals}
        art={isKol ? undefined : STAT_ART.fromReferrals}
      />
      {!isKol ? (
        <StatCard
          label="Total Referred Users"
          value={stats.totalReferredUsers}
          art={STAT_ART.totalReferredUsers}
        />
      ) : null}
    </div>
  );
}

function StatCard({ label, value, art, children, info, status, accent, compact = false }) {
  return (
    <section
      className={`@container relative overflow-hidden rounded-lg border border-[#242424] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      {art ? <StatArt {...art} /> : null}
      {/* Two independent rows rather than a two-column grid: the Claim button is
          much wider than the status pill, and a shared column would squeeze
          `Available to claim` onto two lines. */}
      <div className={`relative flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="text-sm leading-[1.2] text-[#bfbfbf]">{label}</p>
            {info ? (
              <Tooltip content={info} align="end">
                <button
                  type="button"
                  aria-label="How available rewards are calculated"
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b500]"
                >
                  <Info className="size-3.5" strokeWidth={2} aria-hidden />
                </button>
              </Tooltip>
            ) : null}
          </div>
          {status ? (
            <span
              className={`hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-medium leading-[1.2] @min-[12rem]:inline-flex ${
                status === "Ready to claim" ? "text-[#4ade80]" : "text-[#8f8f8f]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  status === "Ready to claim" ? "bg-[#4ade80]" : "bg-[#8f8f8f]"
                }`}
                aria-hidden
              />
              {status}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          {/* Gautam's headline number is painted with the CTA ramp, not white. */}
          <p
            className={`text-xl font-semibold leading-[1.2] ${
              accent ? "bg-clip-text text-transparent" : "text-white"
            }`}
            style={accent ? { backgroundImage: CTA_RAMP } : undefined}
          >
            {value}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * The glow + sharp pair from `STAT_ART`, clipped by the card.
 *
 * The art keeps the artboard's fixed size, so it only fits once the tile is about
 * as wide as the 232px card it was drawn against; on the narrower tablet and mobile
 * grids it would sit under the value, so it drops out there. The container query
 * measures the card's content box, so 10.5rem is 232px of card less its 40px of
 * padding — lower it if you want the art on the mobile grid too.
 */
function StatArt({ src, rotate, glow, sharp }) {
  const layer = (piece, defaultOpacity) => ({
    right: `${piece.right}px`,
    top: `${piece.top}px`,
    width: `${piece.width}px`,
    height: `${piece.height}px`,
    opacity: piece.opacity ?? defaultOpacity,
    transform: (piece.rotate ?? rotate) ? `rotate(${piece.rotate ?? rotate}deg)` : undefined,
    filter: piece.blur ? `blur(${piece.blur}px)` : undefined,
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden @min-[10.5rem]:block">
      <img
        src={src}
        alt=""
        className="absolute max-w-none object-contain"
        style={layer(glow, 0.5)}
      />
      <img
        src={src}
        alt=""
        className="absolute max-w-none object-contain"
        style={layer(sharp, 0.6)}
      />
    </div>
  );
}
