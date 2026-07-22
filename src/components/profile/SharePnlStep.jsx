import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { openPnlCardShare } from "../../lib/share.js";
import { XGlyph } from "./SocialGlyphs.jsx";
import { X_SHARE_POINTS } from "./profileSteps.js";
import { SAMPLE_PNL_CARD, startPnlCardShare } from "./simulatedOAuth.js";

/**
 * The second half of step three: post the first PnL card.
 *
 * The only thing on the checklist that produces something outside the app, and
 * the only one with a prerequisite — there's nothing to post from until X is
 * linked. That prerequisite is why this isn't a step of its own: it renders
 * directly under the X connect row, in the same panel, and only once that row
 * has settled. A locked fourth step naming what it was waiting for was a whole
 * row spent explaining an ordering the panel can just enforce.
 *
 * The composer is opened from the click handler, never from the timer: a popup
 * blocker eats anything a user gesture didn't open. The step then lands on the
 * post coming back, the same way the link above it lands on its callback.
 *
 * @param {object} props
 * @param {import('../../lib/profileSession.js').ProfileSocial} props.account  The linked X account — this never renders without one.
 * @param {boolean} props.shared
 * @param {() => void} props.onShared
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function SharePnlStep({ account, shared, onShared, onNotify }) {
  const [pending, setPending] = useState(false);
  const cancelRef = useRef(null);

  // A post that outlives the panel must not resolve into the store. StrictMode
  // double-invokes effects in dev, so the timer owns its teardown.
  useEffect(() => () => cancelRef.current?.(), []);

  if (shared) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-[#1e5a3f] bg-[#0d2019] px-3 py-2">
        <span className="shrink-0 text-white">
          <XGlyph className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
          Posted from {account?.handle ?? "your account"}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#00f3b6]">
          <Check className="size-3.5" aria-hidden />
          Shared
        </span>
      </div>
    );
  }

  // Belt and braces: the panel only mounts this once X is linked, but a card
  // with no handle to post from would be a broken button, not a broken layout.
  if (!account) return null;

  const post = () => {
    if (pending) return;
    openPnlCardShare(SAMPLE_PNL_CARD);
    setPending(true);
    cancelRef.current = startPnlCardShare(() => {
      cancelRef.current = null;
      setPending(false);
      onShared();
      onNotify?.(`PnL card posted — +${X_SHARE_POINTS} pts earned`, "success");
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <CardPreview />

      {/* The row `ConnectSocialStep` uses for a link you haven't made yet, down
          to the geometry: glyph, what it gets you, the number on the right edge.
          The settled X row sits immediately above this one inside the same
          panel, so the pair has to read as one sequence, not two components. */}
      <button
        type="button"
        onClick={post}
        disabled={pending}
        className="flex w-full items-center gap-2.5 rounded-lg border border-[#242424] bg-black px-3 py-2 text-left transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#242424] bg-[#0f0f0f] text-white">
          <XGlyph className="size-4" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold text-white">
            {pending ? "Posting to X…" : "Post the card"}
          </span>
          <span className="text-xs leading-snug text-[#929292] max-sm:line-clamp-2 sm:truncate">
            Goes out from {account.handle}. Every card carries your referral
            link.
          </span>
        </span>

        {pending ? (
          <Loader2
            className="size-4 shrink-0 animate-spin text-[#00f3b6]"
            aria-hidden
          />
        ) : (
          <span className="shrink-0 text-xs font-semibold text-[#f2b500]">
            +{X_SHARE_POINTS}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * What's about to be posted, as one line rather than a rendered card.
 *
 * The user is being asked to publish something under their own handle, so they
 * get to see the figures first — but this is half of a checklist panel, not a
 * preview modal, and a full card mock here would outweigh the step it sits in.
 */
function CardPreview() {
  const { coin, side, leverage, pnlPercent, pnl } = SAMPLE_PNL_CARD;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#242424] bg-[#0f0f0f] px-3 py-2">
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        Card
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-[#bfbfbf]">
        {coin} · {side} {leverage}
      </span>
      <span className="shrink-0 font-mono text-xs font-semibold text-[#00f3b6]">
        {pnlPercent}
        <span className="hidden text-[#00f3b6]/70 sm:inline"> · {pnl}</span>
      </span>
    </div>
  );
}
