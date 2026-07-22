import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import ConnectSocialStep from "./ConnectSocialStep.jsx";
import SharePnlStep from "./SharePnlStep.jsx";
import { useProfile } from "./ProfileContext.jsx";
import { SOCIAL_PROVIDERS, X_HANDLE } from "./simulatedOAuth.js";
import {
  PROFILE_POINTS,
  PROFILE_POINTS_TOTAL,
  PROFILE_STEP_ORDER,
  STEP_TELEGRAM,
  STEP_WALLET,
  STEP_X,
} from "./profileSteps.js";

/**
 * The checklist, as a vertical stepper: one row per step, one open panel — and
 * the permanent ledger of where the profile's 250 points went.
 *
 * A checklist is read top to bottom, so the steps run that way too — the rail
 * connecting the markers is what makes "done / doing / next" legible at a
 * glance, and it's why there's no separate progress bar or percentage. The
 * markers *are* the progress bar.
 *
 * The card used to swap itself for a one-line "Profile complete · +250 points"
 * the moment the last step landed, and that was the bug this rewrite exists to
 * fix: the breakdown vanished at exactly the moment the user had a number worth
 * breaking down. Every point on the board is attached to something they did, so
 * the rows stay. What collapses on completion is the *interaction* — no panels,
 * no chevrons, nothing left to press — not the accounting.
 *
 * So the column adds up in public, before and after: three `+N` lines over a
 * hairline and the total under it, in one right-aligned column that can be
 * checked by eye.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function ProfileChecklistCard({ onNotify }) {
  const { socials, pnlShared, progress, connectSocial, sharePnl } = useProfile();

  // Open the first thing that isn't done yet; the user can override. Every step
  // is startable now that the share sits inside the link it depends on, so
  // there's no locked row to skip past.
  const [openId, setOpenId] = useState(
    () => PROFILE_STEP_ORDER.find((id) => !progress.done[id]) ?? null,
  );

  // Telegram hands over to X. X hands over to itself: linking the account is
  // half of step three, and the panel it leaves open is the one holding the
  // post — the next thing to do is already on screen.
  const handleConnect = (account) => {
    connectSocial(account);
    setOpenId(STEP_X);
  };

  const handleShared = () => {
    sharePnl();
    setOpenId(null);
  };

  /** Would finishing this step be the thing that finishes the checklist? */
  const completedBy = (id) =>
    PROFILE_STEP_ORDER.every((step) => step === id || progress.done[step]);

  /**
   * Suppressing `onNotify` on the finishing step is deliberate: the celebration
   * modal takes the screen a beat later, and a toast sliding in underneath it is
   * noise.
   *
   * Once the board is complete every panel is dropped, which is what turns the
   * stepper into a receipt.
   */
  const panelFor = (id, render) =>
    progress.isComplete ? null : render(completedBy(id) ? undefined : onNotify);

  /**
   * Step three has three faces, not two: link outstanding, post outstanding,
   * both landed. A row still reading "Follow @hyprearn" after the follow would
   * be billing the user for something they already did.
   */
  const labelFor = (id) => {
    const labels = STEP_LABELS[id];
    if (progress.done[id]) return labels.done;
    return id === STEP_X && socials.x ? labels.doing : labels.todo;
  };

  const steps = [
    { id: STEP_WALLET },
    {
      id: STEP_TELEGRAM,
      panel: panelFor(STEP_TELEGRAM, (notify) => (
        <ConnectSocialStep
          provider={STEP_TELEGRAM}
          account={socials.telegram}
          onConnect={handleConnect}
          onNotify={notify}
        />
      )),
    },
    {
      /* Two moves in one panel, stacked in the order they happen: link the
         account, then post from it. The post only appears once there's an
         account to post from — an explanation of why a button can't be pressed
         is worse than the button not being there yet.

         `notify` is the finishing-step-suppressed one and goes to the post,
         which is what actually finishes the board; the link never does, so it
         keeps its own toast. */
      id: STEP_X,
      panel: panelFor(STEP_X, (notify) => (
        <div className="flex flex-col gap-2">
          <ConnectSocialStep
            provider={STEP_X}
            account={socials.x}
            onConnect={handleConnect}
            onNotify={onNotify}
          />
          {socials.x ? (
            <SharePnlStep
              account={socials.x}
              shared={pnlShared}
              onShared={handleShared}
              onNotify={notify}
            />
          ) : null}
        </div>
      )),
    },
  ].map((step) => ({
    ...step,
    done: progress.done[step.id],
    label: labelFor(step.id),
    points: PROFILE_POINTS[step.id],
  }));

  return (
    /* One column system, top to bottom: a header band, then the stepper beneath
       it at the card's full width. The card is wide because the page is, and the
       width is spent on a single set of edges — labels start at the marker rail,
       points land in one column, chevrons sit on the card's right padding, under
       the header's own right-aligned line. Nothing floats. */
    <section
      className={`rounded-xl border p-4 sm:p-5 ${
        progress.isComplete
          ? "border-[#1e5a3f] bg-[#0d2019]"
          : "border-[#242424] bg-[#0f0f0f]"
      }`}
    >
      <Header progress={progress} />

      <ol className="mt-4 sm:mt-5">
        {steps.map((step, i) => (
          <StepRow
            key={step.id}
            index={i + 1}
            label={step.label}
            panel={step.panel}
            points={step.points}
            done={step.done}
            last={i === steps.length - 1}
            open={openId === step.id && Boolean(step.panel)}
            onToggle={() =>
              setOpenId((current) => (current === step.id ? null : step.id))
            }
          />
        ))}
      </ol>

      <TotalRow earned={progress.points} complete={progress.isComplete} />
    </section>
  );
}

/**
 * What to do, and what was done. A finished row saying "Connect X" would read as
 * an instruction the user still owes us, when the whole job of the finished card
 * is to report facts.
 *
 * The X row names outcomes ("Following @hyprearn") where its panel's buttons
 * name mechanisms ("Connect X") — a user asking "what did I get for 175 points?"
 * is answered by the outcome, not by the OAuth screen it took. It carries a
 * third label because it's the one step with two moves in it: the row names
 * whichever of them is still outstanding, so the collapsed card always shows the
 * next thing to do rather than the first thing that was asked for.
 */
const STEP_LABELS = {
  [STEP_WALLET]: { todo: "Connect a wallet", done: "Wallet connected" },
  [STEP_TELEGRAM]: {
    todo: SOCIAL_PROVIDERS.telegram.connectLabel,
    done: "Telegram joined",
  },
  [STEP_X]: {
    todo: `Follow ${X_HANDLE} on X & share a PnL card`,
    doing: "Share your first PnL card",
    done: `Following ${X_HANDLE} · PnL card shared`,
  },
};

/**
 * Same band either way — title, count, and one figure on the right — because the
 * card is the same card before and after. Only the tense changes: a promise of
 * what's left becomes a statement of what landed.
 */
function Header({ progress }) {
  const complete = progress.isComplete;

  return (
    <header
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b pb-3.5 sm:pb-4 ${
        complete ? "border-[#1f3b30]" : "border-[#242424]"
      }`}
    >
      <h2 className="flex items-center gap-2 text-base font-semibold text-white">
        {complete ? (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#1e5a3f] bg-black text-[#00f3b6]">
            <Check className="size-3" strokeWidth={3} aria-hidden />
          </span>
        ) : null}
        {complete ? "Profile complete" : "Complete your profile"}
      </h2>

      <span className="shrink-0 rounded-full border border-[#242424] bg-black px-2 py-0.5 text-[11px] font-medium tabular-nums text-[#929292]">
        {progress.completedCount} of {progress.totalCount}
      </span>

      {/* Full line of its own on mobile, where right-aligning a sentence under a
          title reads as a stray fragment. */}
      <p className="w-full text-xs text-[#757575] sm:ml-auto sm:w-auto">
        {complete ? (
          <>
            All{" "}
            <span className="font-semibold text-[#f2b500]">
              {progress.points} points
            </span>{" "}
            allotted — here's where they came from
          </>
        ) : (
          <>
            <span className="font-semibold text-[#f2b500]">
              +{progress.pointsRemaining} points
            </span>{" "}
            left to earn
          </>
        )}
      </p>
    </header>
  );
}

/**
 * The marker column grows with the row, so the rail closes the gap to the next
 * marker whether the panel is open or shut. A step with no panel isn't a button
 * — nothing to disclose, nothing to press, which is every row once the board is
 * finished.
 *
 * The row is a table row, not a floating group: label from the rail, points in a
 * fixed column, chevron on the card's edge. The panel opens *under* its own row,
 * flush with the label, so an open step stays one block instead of a header here
 * and a detail pane over there.
 */
function StepRow({ index, label, points, done, last, open, panel, onToggle }) {
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
          {done ? (
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          ) : (
            index
          )}
        </span>
        {/* The last marker has nothing to connect to — a rail past it would
            point at the total, which is not another step. */}
        {last ? null : (
          <span className="my-1 w-px flex-1 bg-[#242424]" aria-hidden />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${last ? "pb-3" : "pb-5"}`}>
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

/**
 * The sum, under a hairline, in the same column the three `+N` lines land in —
 * so `25 + 50 + 175` can be checked against `250` by eye. Without it the user is
 * asked to trust the header's arithmetic; with it, the card shows its working.
 *
 * Indented past the marker rail (`pl-9` = marker + gap) so it lines up with the
 * labels, not with the markers: it's a total of the rows, not another row.
 */
function TotalRow({ earned, complete }) {
  return (
    <div
      className={`mt-1 flex items-center gap-3 border-t pt-3 pl-9 ${
        complete ? "border-[#1f3b30]" : "border-[#242424]"
      }`}
    >
      <span className="min-w-0 flex-1 truncate text-sm text-[#bfbfbf]">
        Profile total
        <span className="hidden text-[#757575] sm:inline">
          {complete
            ? " — all three steps paid out"
            : ` — ${earned} earned so far`}
        </span>
      </span>
      <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-white">
        {PROFILE_POINTS_TOTAL}
      </span>
      <span className="size-4 shrink-0" aria-hidden />
    </div>
  );
}

/**
 * Open outranks done: the step you're looking at is the one that reads loudest.
 *
 * One line on desktop. On mobile the label has ~180px to work with and step
 * three names two things, so it wraps rather than ellipsing halfway through the
 * second one — the same trade the connect rows make with their benefit line.
 */
function RowLabel({ done, open, children }) {
  return (
    <span
      className={`min-w-0 flex-1 text-sm max-sm:line-clamp-2 sm:truncate ${
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
