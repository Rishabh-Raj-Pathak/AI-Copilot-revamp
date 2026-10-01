import { useEffect, useRef, useState } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useAppToast } from "../appToastContext.js";
import {
  CURRENT_TIER,
  KOL_CURRENT_MILESTONE,
  KOL_FEE_REBATE,
  KOL_MILESTONES,
  KOL_REFERRAL_CODE,
  REFERRAL_CODE,
  REFERRAL_LINK_PREFIX,
  REFERRER_REVENUE_SHARE,
  REWARD_TIERS,
} from "../../rewards/rewardsMockData.js";
import { tierBadge, usd } from "./rewardsPhone.js";

/**
 * The top three cards of Figma "Rewards / Referral — Full Page" (955:4978):
 * current tier (955:4998), your referral code (955:5014) and enter a code
 * (955:5031). Signed out they show the artboard's empty state — `$0`, the
 * actions at 35% — and any tap on an action asks for a wallet instead.
 */

/** Shared card frame: radius 12, border/default, 16px inset inside the line. */
const CARD = "flex flex-col gap-3 rounded-xl border border-app-line bg-app-bg p-4";

/** Gradient action at the artboard's 35% when it cannot run yet. */
function rampClass(dimmed) {
  return `app-pressable app-gradient-brand flex shrink-0 items-center justify-center rounded-lg text-black ${
    dimmed ? "opacity-35" : ""
  }`;
}

async function copyText(text) {
  try {
    await navigator.clipboard?.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 955:4998 — tier name, trading volume and the tier's badge art. */
export function TierCard({ variant, connected }) {
  const isKol = variant === "kol";
  const progress = isKol ? KOL_CURRENT_MILESTONE : CURRENT_TIER;
  const reached = isKol
    ? KOL_MILESTONES.find((item) => item.name === progress.name)
    : REWARD_TIERS.find((item) => item.id === progress.tierId);
  // Signed out there is no volume, so the card sits on the first rung.
  const tier = connected && reached ? reached : isKol ? KOL_MILESTONES[0] : REWARD_TIERS[0];
  const name = isKol ? `Milestone ${tier.name.slice(1)}` : tier.name;
  const badge = tierBadge(tier);
  const figure = connected ? "text-ink" : "text-white/60";

  return (
    <section className="flex items-start justify-between gap-3 overflow-hidden rounded-xl border border-[#f7bb08] bg-app-bg p-4">
      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <AppIcon src={appIcons.tierGem20} size={20} className="text-app-accent" />
          <h2 className={`truncate text-[18px] font-semibold leading-[23px] ${figure}`}>{name}</h2>
        </div>
        <div className="flex flex-col gap-1.5 pt-0.5">
          <p className={`text-app-display font-semibold leading-6 ${figure}`}>
            {connected ? usd(progress.volume) : "$0"}
          </p>
          <p className="text-app-caption text-ink-subtle">Your trading volume</p>
        </div>
      </div>
      <img alt="" src={badge.src} className="size-20 shrink-0 object-contain" />
    </section>
  );
}

/**
 * 955:5014 — the wallet's own link and code. The pencil inside the field
 * makes the code editable; Share hands the link to the OS share sheet and
 * falls back to the clipboard.
 */
export function ReferralCodeCard({ variant, connected, onRequireWallet }) {
  const isKol = variant === "kol";
  const toast = useAppToast();
  const [code, setCode] = useState(REFERRAL_CODE);
  const [draft, setDraft] = useState(REFERRAL_CODE);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const link = connected ? `${REFERRAL_LINK_PREFIX}${code}` : REFERRAL_LINK_PREFIX;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const copyLink = async () => {
    if (!connected) return onRequireWallet();
    await copyText(link);
    toast.show({ title: isKol ? "Gautam referral link copied" : "Link copied", message: link });
  };

  const share = async () => {
    if (!connected) return onRequireWallet();
    if (navigator.share) {
      try {
        await navigator.share({ title: "HyprEarn", text: "Trade with me on HyprEarn", url: link });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  const toggleEdit = () => {
    if (!connected) return onRequireWallet();
    if (!editing) {
      setDraft(code);
      setEditing(true);
      return;
    }
    const next = draft.trim().toUpperCase();
    if (!next) return;
    setCode(next);
    setEditing(false);
    if (next !== code) toast.show({ title: "Referral code updated", message: `${REFERRAL_LINK_PREFIX}${next}` });
  };

  return (
    <section className={CARD}>
      <h2 className="text-[18px] font-semibold leading-[21.6px] tracking-[-0.45px] text-ink">
        {isKol ? "Invite friends, earn rewards" : "Your Referral Code"}
      </h2>
      <p className="text-app-body leading-[16.8px] text-ink-muted">
        {isKol ? "Share your link and earn " : "Share this code with people to earn a "}
        <span className="font-semibold text-app-accent">{REFERRER_REVENUE_SHARE}</span>
        {isKol ? " revenue share when your referrals trade." : " Revenue Share"}
      </p>
      <div className="flex min-w-0 max-w-full items-center gap-2">
        <p className="truncate text-app-caption leading-[14.4px] text-ink-muted">{link}</p>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy referral link"
          className="app-pressable -m-3.5 flex shrink-0 items-center justify-center p-3.5 text-ink-muted active:text-ink"
        >
          <AppIcon src={appIcons.copy16} size={16} />
        </button>
      </div>
      <div className="flex w-full items-center gap-2">
        <div
          className={`flex h-10 min-w-0 flex-1 items-center rounded-[10px] border bg-app-bg py-px pl-3 pr-px ${
            editing ? "border-app-accent" : "border-app-line"
          }`}
        >
          <input
            ref={inputRef}
            value={editing ? draft : connected ? code : ""}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") toggleEdit();
            }}
            readOnly={!editing}
            onClick={!connected ? onRequireWallet : undefined}
            placeholder="Create a code"
            aria-label="Your referral code"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={16}
            className="min-w-0 flex-1 bg-transparent text-base font-medium leading-[18px] uppercase text-ink outline-none placeholder:text-app-body placeholder:font-normal placeholder:normal-case placeholder:text-white/50"
          />
          <button
            type="button"
            onClick={toggleEdit}
            aria-label={editing ? "Save referral code" : "Edit referral code"}
            aria-disabled={!connected}
            className={`${rampClass(!connected)} h-[38px] w-[60px]`}
          >
            <AppIcon src={editing ? appIcons.check12 : appIcons.edit20} size={20} />
          </button>
        </div>
        <button
          type="button"
          onClick={share}
          aria-disabled={!connected}
          className={`${rampClass(!connected)} h-10 w-[108px] text-base font-medium leading-5`}
        >
          Share
        </button>
      </div>
    </section>
  );
}

/**
 * 955:5031 — apply somebody else's code. Redeem stays dimmed until there is
 * something to redeem; once applied the field locks to that code. The KOL
 * variant arrives with the campaign code already active.
 */
export function EnterCodeCard({ variant, connected, onRequireWallet }) {
  const isKol = variant === "kol";
  const toast = useAppToast();
  const [draft, setDraft] = useState("");
  const [applied, setApplied] = useState(null);
  const value = isKol ? KOL_REFERRAL_CODE : applied ?? draft;
  const canRedeem = connected && !applied && draft.trim().length > 0;

  const redeem = () => {
    if (!connected) return onRequireWallet();
    const next = draft.trim().toUpperCase();
    if (!next || applied) return;
    setApplied(next);
    toast.show({ title: `Referral code ${next} applied`, message: "Your account is now linked." });
  };

  return (
    <section className={CARD}>
      <h2 className="text-[18px] font-semibold leading-[21.6px] tracking-[-0.45px] text-ink">
        {isKol ? `Get ${KOL_FEE_REBATE} fee discount` : "Enter a Code"}
      </h2>
      <p className="text-app-body leading-[16.8px] text-ink-muted">
        {isKol ? (
          <>
            Get <span className="font-semibold text-app-accent">{KOL_FEE_REBATE}</span> of your
            trading fees back with code <span className="font-semibold text-ink">{KOL_REFERRAL_CODE}</span>.
          </>
        ) : (
          "Have a referral code? Apply it to link your account."
        )}
      </p>
      <div className="flex w-full items-center gap-2 pt-1">
        <input
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") redeem();
          }}
          onClick={!connected && !isKol ? onRequireWallet : undefined}
          readOnly={isKol || !connected || Boolean(applied)}
          placeholder="Enter a code"
          aria-label="Referral code to apply"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={16}
          className="h-10 min-w-0 flex-1 rounded-[10px] border border-app-line bg-app-bg px-3 text-base font-medium leading-[18px] uppercase text-ink outline-none placeholder:text-app-body placeholder:font-normal placeholder:normal-case placeholder:text-white/50 focus:border-app-accent read-only:focus:border-app-line"
        />
        {isKol ? (
          <span className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#146c5b] bg-[#071c18] px-3 text-app-body font-medium text-[#52e5c4]">
            <AppIcon src={appIcons.check12} size={14} />
            Bonus active
          </span>
        ) : (
          <button
            type="button"
            onClick={redeem}
            disabled={connected && !canRedeem}
            aria-disabled={!connected}
            className={`${rampClass(!canRedeem)} h-10 w-[100px] gap-1.5 text-base font-medium leading-5`}
          >
            {applied ? <AppIcon src={appIcons.check12} size={14} /> : null}
            {applied ? "Applied" : "Redeem"}
          </button>
        )}
      </div>
    </section>
  );
}
