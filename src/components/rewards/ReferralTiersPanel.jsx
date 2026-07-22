import { useState } from "react";
import {
  KOL_CURRENT_MILESTONE,
  KOL_MILESTONES,
  REWARD_PATHS,
  REWARD_TIERS,
  tierRewardsForPath,
} from "./rewardsMockData.js";

/** Whale's fill — the CTA ramp behind an 85% black scrim (Figma `gradients/6`). */
const SCRIMMED_RAMP =
  "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.85) 100%), linear-gradient(90deg, #f2b500 0%, #00f3b6 100%)";

/**
 * The tier ladder at the foot of the page: a segmented path toggle over six
 * volume tiers, each showing that path's revenue share and tier bonus.
 */
export default function ReferralTiersPanel({ variant = "rewards" }) {
  const [pathId, setPathId] = useState(REWARD_PATHS[0].id);
  const isKol = variant === "kol";
  const tiers = isKol ? KOL_MILESTONES : REWARD_TIERS;
  return (
    <section className="flex flex-col gap-10 rounded-lg border border-[#242424] p-5 max-tablet:gap-6">
      <header className="flex items-start justify-between gap-4 max-tablet:flex-col">
        <div>
          <h2 className="text-[32px] font-semibold leading-[1.2] text-white max-tablet:text-2xl">
            {isKol ? "Gautam Milestones" : "Referral Rewards"}
          </h2>
          {isKol ? (
            <p className="mt-2 text-sm leading-[1.4] text-[#bfbfbf]">
              Trade through Gautam&apos;s milestones and unlock up to $1,200.
            </p>
          ) : null}
        </div>
        {!isKol ? (
          <div
            role="tablist"
            aria-label="Reward path"
            className="flex items-center gap-0 rounded-[10px] border border-[#242424] p-1 max-tablet:w-full"
          >
            {REWARD_PATHS.map((p) => {
              const active = p.id === pathId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPathId(p.id)}
                  className={`rounded-lg px-5 py-2.5 text-sm leading-[1.2] transition-colors max-tablet:flex-1 max-tablet:px-2 max-tablet:text-xs ${
                    active
                      ? "bg-[#242424] font-semibold text-white"
                      : "text-[#bfbfbf] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </header>

      {/* Six across only once the columns can hold a badge plus its label —
          below that the artboard's row would squeeze every tier name to two lines. */}
      <div
        className={`grid grid-cols-2 gap-3 tablet:grid-cols-3 tablet:gap-5 ${
          isKol ? "xl:grid-cols-5" : "xl:grid-cols-6"
        }`}
      >
        {tiers.map((tier) => {
          const isCurrent = isKol && tier.name === KOL_CURRENT_MILESTONE.name;
          return (
            <TierCard
              key={tier.id}
              tier={tier}
              pathId={pathId}
              isKol={isKol}
              isCurrent={isCurrent}
            />
          );
        })}
      </div>
    </section>
  );
}

function TierCard({ tier, pathId, isKol, isCurrent }) {
  const standardRewards = isKol ? null : tierRewardsForPath(tier, pathId);
  const isHighlighted = isCurrent || (!isKol && tier.highlighted);

  return (
    <article
      aria-current={isCurrent ? "step" : undefined}
      className={`flex flex-col gap-5 rounded-lg px-3 py-5 ${
        isHighlighted ? "border-2 border-[#f2b500]" : "border"
      }`}
      style={{
        borderColor: isHighlighted ? undefined : tier.border,
        backgroundColor: isHighlighted ? undefined : tier.background,
        backgroundImage: isHighlighted ? SCRIMMED_RAMP : undefined,
      }}
    >
      {/* `min-h` keeps the six dividers on one line even when a long tier name
          wraps in the narrow columns — the artboard's names all fit on one. */}
      <div className="flex min-h-[86px] items-start justify-between gap-2 tablet:min-h-0 xl:min-h-[86px] 2xl:min-h-0">
        <div className="flex min-w-0 flex-col gap-2">
          {/* The chip sits under the name, not beside it — the artboard stacks them
              so every card's volume line starts at the same height. */}
          <div className="flex flex-col items-start gap-1.5">
            <h3 className="text-sm font-semibold leading-[1.2] text-white">
              {isKol ? `Milestone ${tier.name.slice(1)}` : tier.name}
            </h3>
            {isCurrent ? (
              <span className="rounded-full border border-[#705600] bg-[#211a00] px-[5px] py-0.5 text-[9px] font-semibold uppercase leading-[1.2] text-[#f2b500]">
                You’re here
              </span>
            ) : null}
          </div>
          <p className="text-lg font-semibold leading-[1.2] text-white">{tier.volume}</p>
          <p className="text-[10px] leading-[1.2] text-[#bfbfbf] tablet:whitespace-nowrap">
            {isKol ? "Volume needed" : "Trading Volume"}
          </p>
        </div>
        <img
          src={tier.badge}
          alt=""
          className="size-14 shrink-0 object-contain tablet:size-16 2xl:size-[75px]"
        />
      </div>

      <div className="h-px w-full bg-[#454545]" aria-hidden />

      <TierStat
        label={isKol ? "Milestone reward" : "Revenue Share"}
        value={isKol ? tier.reward : standardRewards.revenueShare}
      />
      <TierStat
        label={isKol ? "Total earned" : "Tier Bonus"}
        value={isKol ? tier.cumulative : standardRewards.tierBonus}
      />
    </article>
  );
}

function TierStat({ label, value }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-[1.2] text-[#bfbfbf]">{label}</p>
      <p className="text-base font-semibold leading-[1.2] text-white">{value}</p>
    </div>
  );
}
