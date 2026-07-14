import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
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
 * The checklist, as a vertical stepper: one row per step, one open panel.
 *
 * A checklist is read top to bottom, so the steps run that way too — the rail
 * connecting the markers is what makes "done / doing / next" legible at a
 * glance, and it's why there's no separate progress bar or percentage. The
 * markers *are* the progress bar.
 *
 * Only steps with something to do open. The wallet step is a settled fact by
 * the time this renders — the user connected one to get here — so it's a static
 * row, not a disclosure hiding an address the identity card already shows.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ProfileChecklistCard({ onNotify }) {
  const {
    socials,
    social,
    followedX,
    progress,
    connectSocial,
    markFollowedX,
  } = useProfile();

  // Open the first thing that still needs doing; the user can override.
  const [openId, setOpenId] = useState(() =>
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
    { id: STEP_WALLET, label: "Wallet connected" },
    {
      id: STEP_SOCIAL,
      label: "Link Telegram or X",
      panel: (
        <>
          <ConnectSocialStep
            socials={socials}
            onConnect={connectSocial}
            onNotify={onNotify}
          />
          {social && !followedX ? (
            <button
              type="button"
              onClick={() => setOpenId(STEP_FOLLOW)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#f2b500] transition-opacity hover:opacity-80"
            >
              Last step — follow us on X
              <ArrowRight className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </>
      ),
    },
    {
      id: STEP_FOLLOW,
      label: `Follow ${X_HANDLE} on X`,
      panel: <FollowOnXStep followed={followedX} onFollowed={handleFollowed} />,
    },
  ];

  const remaining = progress.pointsTotal - progress.points;

  return (
    /* One column system, top to bottom: a header band, then the stepper beneath
       it at the card's full width. The card is wide because the page is, and the
       width is spent on a single set of edges — labels start at the marker rail,
       points land in one column, chevrons sit on the card's right padding, under
       the header's own right-aligned line. Nothing floats. */
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b border-[#242424] pb-3.5 sm:pb-4">
        <h2 className="text-base font-semibold text-white">
          Complete your profile
        </h2>
        <span className="shrink-0 rounded-full border border-[#242424] bg-black px-2 py-0.5 text-[11px] font-medium tabular-nums text-[#929292]">
          {progress.completedCount} of {progress.totalCount}
        </span>
        {/* Full line of its own on mobile, where right-aligning a sentence under
            a title reads as a stray fragment. */}
        <p className="w-full text-xs text-[#757575] sm:ml-auto sm:w-auto">
          <span className="font-semibold text-[#f2b500]">
            +{remaining} points
          </span>{" "}
          left, including a +{PROFILE_POINTS.completionBonus} finish bonus
        </p>
      </header>

      <ol className="mt-4 sm:mt-5">
        {steps.map((step, i) => (
          <StepRow
            key={step.id}
            index={i + 1}
            label={step.label}
            panel={step.panel}
            points={PROFILE_POINTS[step.id]}
            done={progress.done[step.id]}
            last={i === steps.length - 1}
            open={openId === step.id && Boolean(step.panel)}
            onToggle={() =>
              setOpenId((current) => (current === step.id ? null : step.id))
            }
          />
        ))}
      </ol>
    </section>
  );
}

/**
 * The marker column grows with the row, so the rail closes the gap to the next
 * marker whether the panel is open or shut. A step with no panel isn't a button
 * — nothing to disclose, nothing to press.
 *
 * The row is a table row, not a floating group: label from the rail, points in a
 * fixed column, chevron on the card's edge. The panel opens *under* its own row,
 * flush with the label, so an open step stays one block instead of a header here
 * and a detail pane over there.
 */
function StepRow({ index, label, points, done, open, last, panel, onToggle }) {
  const panelId = `profile-step-${index}`;

  const row = (
    <>
      <RowLabel done={done} open={open}>
        {label}
      </RowLabel>
      <RowPoints done={done}>{points}</RowPoints>
    </>
  );

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors ${
            done
              ? "border-[#1e5a3f] bg-[#0d2019] text-[#00f3b6]"
              : open
                ? "border-[#f2b500] bg-[#f2b500]/10 text-[#f2b500]"
                : "border-[#242424] bg-black text-[#757575]"
          }`}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : index}
        </span>
        {last ? null : <span className="my-1 w-px flex-1 bg-[#242424]" aria-hidden />}
      </div>

      <div className={`min-w-0 flex-1 ${last ? "" : "pb-5"}`}>
        {panel ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="group flex w-full items-center gap-3 py-0.5 text-left"
          >
            {row}
            <ChevronDown
              className={`size-4 shrink-0 text-[#575757] transition-transform group-hover:text-[#bfbfbf] ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>
        ) : (
          <div className="flex w-full items-center gap-3 py-0.5">
            {row}
            {/* Stands in for the chevron so points hold one column. */}
            <span className="size-4 shrink-0" aria-hidden />
          </div>
        )}

        {/* The card is as wide as the page; the panel is as wide as it needs to
            be. One measure for every step's detail, set here rather than inside
            each step, so no step invents its own. */}
        {open ? (
          <div id={panelId} className="mt-3.5 max-w-2xl">
            {panel}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** Open outranks done: the step you're looking at is the one that reads loudest. */
function RowLabel({ done, open, children }) {
  return (
    <span
      className={`min-w-0 flex-1 truncate text-sm ${
        open
          ? "font-medium text-white"
          : done
            ? "text-[#929292]"
            : "text-[#bfbfbf]"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * Fixed width, right-aligned: three scores of different lengths, one column.
 * They're the reason the step exists, so they read at the label's size — dimmer
 * than the label while unearned, and the brightest thing in the row once won.
 */
function RowPoints({ done, children }) {
  return (
    <span
      className={`w-14 shrink-0 text-right text-sm font-semibold tabular-nums ${
        done ? "text-[#00f3b6]" : "text-[#929292]"
      }`}
    >
      +{children}
    </span>
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
