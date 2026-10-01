import {
  KOL_CURRENT_MILESTONE,
  KOL_MILESTONES,
  REWARD_TIERS,
  tierRewardsForPath,
} from "../../rewards/rewardsMockData.js";
import { PHONE_TIER_STYLE, spaced, tierBadge, tierVolume } from "./rewardsPhone.js";

/**
 * Figma "Referral Rewards" (955:5057): the tier ladder as a two-column grid
 * of tinted cards — name, volume threshold and badge over a divider in the
 * card's own line colour, then Revenue Share and Tier Bonus.
 *
 * The phone artboard draws no path toggle, so the cards carry the Direct
 * Path figures. The KOL variant lists its five milestones the same way.
 */
export default function RewardsTierGrid({ variant, connected }) {
  const isKol = variant === "kol";
  const tiers = isKol ? KOL_MILESTONES : REWARD_TIERS;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-app-line p-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-app-display font-semibold leading-[28.8px] text-ink">
          {isKol ? "Milestones" : "Referral Rewards"}
        </h2>
        {isKol ? (
          <p className="text-app-body text-ink-muted">
            Trade through milestones and unlock up to $1,200.
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 items-start gap-3">
        {tiers.map((tier) => (
          <TierTile
            key={tier.id}
            tier={tier}
            isKol={isKol}
            current={isKol && connected && tier.name === KOL_CURRENT_MILESTONE.name}
          />
        ))}
      </div>
    </section>
  );
}

function TierTile({ tier, isKol, current }) {
  const badge = tierBadge(tier);
  const badgeSize = isKol ? Math.min(badge.size, 44) : badge.size;
  const style = isKol
    ? current
      ? { border: "#f2b500", backgroundImage: undefined, background: "#120e00" }
      : { border: tier.border, background: tier.background === "transparent" ? "#000000" : tier.background }
    : PHONE_TIER_STYLE[tier.id] ?? PHONE_TIER_STYLE.base;
  const rewards = isKol ? null : tierRewardsForPath(tier, "direct");

  return (
    <article
      aria-current={current ? "step" : undefined}
      className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-lg border px-[11px] pb-5 pt-[18px]"
      style={{
        borderColor: style.border,
        backgroundColor: style.background,
        backgroundImage: style.backgroundImage,
      }}
    >
      <div className="flex w-full items-start justify-between gap-1">
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          {/* "Milestone N" is longer than any tier name; at 14px beside a
              capped badge it stays on one line. */}
          <h3
            className={`font-semibold leading-5 text-ink ${
              isKol ? "whitespace-nowrap text-app-body" : "text-app-headline"
            }`}
          >
            {isKol ? `Milestone ${tier.name.slice(1)}` : tier.name}
          </h3>
          {current ? (
            <span className="rounded-full border border-[#705600] bg-[#211a00] px-[5px] py-0.5 text-[9px] font-semibold uppercase leading-[1.2] text-app-accent">
              You’re here
            </span>
          ) : null}
          <p className="whitespace-nowrap text-[18px] font-semibold leading-[22px] text-ink">
            {isKol ? spaced(tier.volume) : tierVolume(tier.volume)}
          </p>
          <p className="whitespace-nowrap text-app-micro font-medium leading-3 text-ink-muted">
            {isKol ? "Volume needed" : "Trading Volume"}
          </p>
        </div>
        <img
          alt=""
          src={badge.src}
          className="shrink-0 object-contain"
          style={{ width: badgeSize, height: badgeSize }}
        />
      </div>
      <div className="h-px w-full shrink-0" style={{ backgroundColor: style.border }} aria-hidden />
      <div className="flex flex-col">
        <p className="text-app-caption leading-[15px] text-ink-muted">
          {isKol ? "Milestone reward" : "Revenue Share"}
        </p>
        <p className="text-app-headline font-semibold leading-5 text-ink">
          {spaced(isKol ? tier.reward : rewards.revenueShare)}
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-app-caption leading-[15px] text-ink-muted">
          {isKol ? "Total earned" : "Tier Bonus"}
        </p>
        <p className="text-app-headline font-semibold leading-5 text-ink">
          {spaced(isKol ? tier.cumulative : rewards.tierBonus)}
        </p>
      </div>
    </article>
  );
}
