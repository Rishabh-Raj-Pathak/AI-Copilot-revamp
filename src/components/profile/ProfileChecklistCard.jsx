import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { WALLET_CHAIN, truncateAddress } from "../../lib/wallet.js";
import ConnectSocialStep from "./ConnectSocialStep.jsx";
import FollowOnXStep from "./FollowOnXStep.jsx";
import { useProfile } from "./ProfileContext.jsx";
import { X_HANDLE } from "./simulatedOAuth.js";
import {
  PROFILE_POINTS,
  STEP_FOLLOW,
  STEP_SOCIAL,
  STEP_WALLET,
} from "./profileSteps.js";

/**
 * The checklist, as a stepper rather than a stack of accordions.
 *
 * Three tabs, one open panel. The old card rendered every step's disclosure at
 * once and ran ~500px tall; only one step is ever actionable, so only one panel
 * is ever mounted. The three progress segments sit directly above the three
 * tabs — the bar *is* the legend, which is why there's no separate percentage.
 *
 * Renders at 1/3 on first paint because the wallet step is already satisfied —
 * the user connected one to get here.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ProfileChecklistCard({ onNotify }) {
  const {
    address,
    socials,
    social,
    followedX,
    progress,
    connectSocial,
    markFollowedX,
  } = useProfile();

  // Open the first thing that still needs doing; the user can override.
  const [activeId, setActiveId] = useState(() =>
    !social ? STEP_SOCIAL : STEP_FOLLOW,
  );

  // Connecting does *not* jump to the next step. The other provider goes on
  // offer the moment the first one lands, and advancing would hide it exactly
  // as it appeared — so the last step gets an explicit invitation instead.
  const handleFollowed = () => {
    markFollowedX();
    // When this is the last step, the completion modal takes the screen a beat
    // later and a toast underneath it is noise.
    if (!social) onNotify?.(`Now following ${X_HANDLE}`, "success");
  };

  if (progress.isComplete) {
    return <CompleteSummary points={progress.points} />;
  }

  const steps = [
    { id: STEP_WALLET, index: 1, label: "Wallet" },
    { id: STEP_SOCIAL, index: 2, label: "X or Telegram" },
    { id: STEP_FOLLOW, index: 3, label: "Follow us on X" },
  ];

  const remaining = progress.pointsTotal - progress.points;

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold text-white">
          Complete your profile
        </h2>
        <p className="text-xs text-[#757575]">
          <span className="font-semibold text-[#f2b500]">
            +{remaining} points
          </span>{" "}
          left · includes a +{PROFILE_POINTS.completionBonus} finish bonus
        </p>
      </header>

      <div
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
        className="mt-3 grid grid-cols-3 gap-1.5"
      >
        {steps.map((step) => (
          <span
            key={step.id}
            className={`h-1 rounded-full transition-colors ${
              progress.done[step.id]
                ? "bg-gradient-to-r from-[#f2b500] to-[#00f3b6]"
                : "bg-[#242424]"
            }`}
          />
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {steps.map((step) => (
          <StepTab
            key={step.id}
            {...step}
            done={progress.done[step.id]}
            active={activeId === step.id}
            points={PROFILE_POINTS[step.id]}
            onSelect={setActiveId}
          />
        ))}
      </div>

      <div
        id="profile-step-panel"
        className="mt-3 rounded-lg border border-[#242424] bg-black p-3"
      >
        <h3 className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          {activeId === STEP_SOCIAL
            ? social
              ? "Your accounts"
              : "Link an account"
            : PANEL_TITLE[activeId]}
        </h3>

        <div className="mt-2.5">
          {activeId === STEP_WALLET ? (
            <WalletSummary address={address} />
          ) : null}

          {activeId === STEP_SOCIAL ? (
            <>
              <ConnectSocialStep
                socials={socials}
                onConnect={connectSocial}
                onNotify={onNotify}
              />
              {social && !followedX ? (
                <button
                  type="button"
                  onClick={() => setActiveId(STEP_FOLLOW)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#f2b500] transition-opacity hover:opacity-80"
                >
                  Last step — follow us on X
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </>
          ) : null}

          {activeId === STEP_FOLLOW ? (
            <FollowOnXStep followed={followedX} onFollowed={handleFollowed} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

const PANEL_TITLE = {
  [STEP_WALLET]: "Connected wallet",
  [STEP_FOLLOW]: `Follow ${X_HANDLE} on X`,
};

function StepTab({ id, index, label, done, active, points, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-expanded={active}
      aria-controls="profile-step-panel"
      className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left transition-colors sm:px-2.5 ${
        active
          ? "border-[#454545] bg-black"
          : "border-transparent hover:bg-white/[0.03]"
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors ${
          done
            ? "border-[#1e5a3f] bg-[#0d2019] text-[#00f3b6]"
            : active
              ? "border-[#f2b500] bg-[#f2b500]/10 text-[#f2b500]"
              : "border-[#242424] bg-black text-[#757575]"
        }`}
      >
        {done ? <Check className="size-3" strokeWidth={3} aria-hidden /> : index}
      </span>

      <span className="flex min-w-0 flex-col">
        <span
          className={`text-[11px] font-medium leading-tight sm:text-sm ${
            done ? "text-[#bfbfbf]" : "text-white"
          }`}
        >
          {label}
        </span>
        <span
          className={`text-[10px] font-semibold ${
            done ? "text-[#00f3b6]" : "text-[#757575]"
          }`}
        >
          +{points}
        </span>
      </span>
    </button>
  );
}

/** The full address lives in its own section below, so one line is enough. */
function WalletSummary({ address }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="text-sm font-medium text-white">
        {truncateAddress(address)}
      </span>
      <span className="rounded-full border border-[#242424] px-2 py-0.5 text-[10px] text-[#bfbfbf]">
        {WALLET_CHAIN.label}
      </span>
      <span className="flex items-center gap-1 text-xs text-[#00f3b6]">
        <Check className="size-3.5" aria-hidden />
        Connected
      </span>
    </div>
  );
}

function CompleteSummary({ points }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1e5a3f] bg-[#0d2019] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#1e5a3f] bg-black text-[#00f3b6]">
          <Check className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">Profile complete</h2>
          <p className="text-sm text-[#929292]">
            Copilot is tuned to your setup.
          </p>
        </div>
      </div>
      <span className="rounded-full border border-[#242424] bg-black px-3 py-1 text-sm font-semibold text-[#f2b500]">
        +{points} points
      </span>
    </section>
  );
}
