import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, Trophy, X } from "lucide-react";
import { useProfile } from "../profile/ProfileContext.jsx";
import { X_HANDLE, startXAuthorization } from "../profile/simulatedOAuth.js";
import { EntryOffer, XMark } from "./competeCopy.jsx";
import { CTA_SWEEP, GOLD, SETTLED_GREEN } from "./competeTheme.js";

/**
 * The gate between a live competition and its leaderboard: link an X account,
 * and you are in.
 *
 * A modal rather than a page, and a translucent one, because it opens on the
 * way into the hub — the scrim blurs the grid rather than hiding it, so the
 * competitions are legibly behind the dialog and closing it puts you straight
 * into them.
 *
 * Built to the shape `ProfileCompleteModal` and `TradeSuccessModal` already
 * use, because a dialog that invents its own is the one that looks wrong:
 * 402px, symmetric padding, a centred column of badge → title → copy → CTA,
 * and one uniform gap doing all the spacing rather than a different hand-tuned
 * margin under every element.
 *
 * Two things that geometry depends on:
 *
 * The badge is not decoration. A centred column with nothing at the top has no
 * anchor on its vertical axis, so the only object up there was the close
 * control — off in one corner, with nothing opposite it. That reads as a
 * composition that came out crooked rather than one that was centred.
 *
 * The close control is positioned absolutely for the same reason. In the flow
 * it was a right-aligned row inside a centred stack, which both broke the axis
 * and pushed everything below it down by a row that carried no content.
 *
 * One row and no confirm button: linking the account *is* entering, so a
 * second press underneath it was asking the same question twice. The button
 * carries whichever of the two states applies — connect, or continue with the
 * account the profile already linked — so there is no arrangement of this
 * dialog that shows nothing to do.
 *
 * The X link is the profile's, not a second implementation of it: same
 * `startXAuthorization`, same glyph, and it writes through `connectSocial`. A
 * trader has one X account, so linking it here satisfies the profile checklist
 * too. Nothing in `components/profile` changes.
 *
 * The reference flow (arcus.xyz) opens a second dialog to confirm the follow.
 * That is a modal on top of a modal, and it also contradicts how this app
 * models the link: the authorization scope performs the follow, so there is no
 * second trip to x.com (see `simulatedOAuth.js`). The confirmation names it
 * instead — it is a real side effect and the user should be told, but it is
 * not a step they have to take.
 *
 * Mounted only while open, so every visit starts from a clean state and there
 * is no reset effect to keep in sync.
 */
export default function CompeteEntryModal({ competition, onEntered, onClose }) {
  const { socials, connectSocial } = useProfile();
  const [authorizing, setAuthorizing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  const xAccount = socials.x;

  // A cancelled or unmounted authorization must not resolve into the profile
  // store. StrictMode double-invokes effects in dev, so the timer owns its
  // teardown — the same contract `ConnectSocialStep` works to.
  useEffect(() => () => cancelRef.current?.(), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus moves into the dialog so Escape and Tab land here rather than on the
  // page still rendered behind it.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (typeof document === "undefined") return null;

  const enter = () => {
    setConfirmed(true);
    onEntered?.(competition.id);
  };

  /**
   * The one action. An account the profile already carries skips the round
   * trip — re-authorizing an X account this session has authorized would be a
   * consent screen asking permission it was already given.
   */
  const submit = () => {
    if (authorizing) return;
    if (xAccount) {
      enter();
      return;
    }
    setAuthorizing(true);
    cancelRef.current = startXAuthorization((account) => {
      cancelRef.current = null;
      setAuthorizing(false);
      connectSocial(account);
      enter();
    });
  };

  /**
   * Only the two states that are plain text. The unlinked label sets the X
   * mark as a glyph in the markup, so it is built in the button itself.
   */
  const actionLabel = authorizing
    ? "Authorizing on X…"
    : xAccount
      ? `Continue as ${xAccount.handle}`
      : null;

  const actionAriaLabel = xAccount
    ? `Continue as ${xAccount.handle}`
    : "Connect your X";

  return createPortal(
    <div
      className="ds-scrim fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto px-4 py-8 sm:px-5"
      /*
       * Lighter than the house scrim, which is tuned for a dialog you opened
       * mid-task. This one opens by itself the moment you arrive, so the hub
       * underneath has to stay readable — at the default 0.55 over 18px the
       * cards behind it collapse into a black field and the modal reads as the
       * page rather than as a layer on one. Overriding the tokens rather than
       * the declarations keeps `.ds-scrim`'s no-backdrop-filter fallback.
       */
      style={{
        "--ds-scrim-bg": "rgb(3 5 4 / 0.32)",
        "--ds-scrim-blur": "6px",
        "--ds-scrim-bg-fallback": "rgb(3 5 4 / 0.6)",
      }}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-0 bg-transparent"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compete-entry-title"
        className="relative z-2 my-auto w-full max-w-[402px] rounded-2xl border border-[#242424] bg-black p-5 text-center shadow-[0_8px_40px_rgba(0,0,0,0.45)] focus:outline-none sm:p-6"
      >
        <CloseButton onClick={onClose} />

        {/* One gap for the whole column — the same rhythm the other two modals
            in the app run on. Hand-tuning a margin per element is what made
            this one look assembled rather than laid out. */}
        <div className="flex flex-col items-center gap-4 sm:gap-5">
          {confirmed ? (
            <Confirmation
              competition={competition}
              handle={xAccount?.handle}
              onDone={onClose}
            />
          ) : (
            <>
              <Badge tone="offer">
                <Trophy
                  className="size-7 sm:size-8"
                  style={{ color: GOLD }}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </Badge>

              {/* No venue name: the card you pressed is still visible through
                  the scrim, and the sentence under this is about the offer
                  rather than the venue. */}
              <h2
                id="compete-entry-title"
                className="text-headline text-balance text-ink"
              >
                Enter the competition
              </h2>

              {/* The pitch sits above the ask: it is the answer to "why would
                  I", and an answer printed under the button arrives after the
                  question has been decided. `text-balance` evens the two lines
                  — centred copy with one full line over a short one is what
                  reads as ragged. */}
              <p className="text-copy text-balance text-ink-muted">
                <EntryOffer />
              </p>

              <button
                type="button"
                onClick={submit}
                disabled={authorizing}
                aria-label={authorizing ? undefined : actionAriaLabel}
                className="text-figure flex w-full items-center justify-center gap-2 rounded-[10px] px-6 py-3.5 text-[#0a0a0a] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-default disabled:hover:brightness-100"
                style={{ backgroundImage: CTA_SWEEP }}
              >
                {authorizing ? (
                  <Loader2
                    className="size-[1.1em] shrink-0 animate-spin"
                    aria-hidden
                  />
                ) : null}
                {/* One span, not a bare text node beside the mark: as separate
                    children the flex `gap` lands between the word and the glyph
                    on top of the space already in the string.

                    The mark is the word here, not an icon beside it — the same
                    rule the sentence above follows. */}
                <span>
                  {xAccount || authorizing ? (
                    actionLabel
                  ) : (
                    <>
                      {"Connect your "}
                      <XMark />
                    </>
                  )}
                </span>
              </button>

              {/* Cut to one line. Wrapped, the fine print took as much height
                  as the sentence that does the selling. */}
              <p className="text-copy text-ink-faint">
                Entering is free. Only HyprEarn volume counts.
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * The circle at the head of the column. Soft on the offer, solid on the win —
 * the same object either way, so the box does not change shape when the state
 * does, and the fill alone says which of the two you are looking at.
 */
function Badge({ tone, children }) {
  return (
    <span
      className="flex size-14 shrink-0 items-center justify-center rounded-full sm:size-16"
      style={
        tone === "offer"
          ? {
              backgroundColor: "rgba(255,212,0,0.1)",
              border: "1px solid rgba(255,212,0,0.28)",
            }
          : { backgroundImage: CTA_SWEEP }
      }
    >
      {children}
    </span>
  );
}

/**
 * Deliberately not the faintest thing in the box — it is the only way out of a
 * dialog that opened without being asked for, so it carries a filled chip
 * rather than a bare glyph on black. Absolute, so it never joins the centred
 * column's rhythm.
 */
function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="absolute right-3 top-3 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-ink-muted transition-colors hover:bg-white/15 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:right-4 sm:top-4"
    >
      <X className="size-4" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

/**
 * The other half of the modal, and the only place the account and the follow
 * are reported — there is no settled row on the form any more, because the
 * form is gone the instant the link lands.
 *
 * Same four elements in the same order as the form, so answering the dialog
 * swaps its contents without moving its frame.
 *
 * It restates the threshold rather than only congratulating: entering was the
 * easy half, and the number is the half still ahead.
 */
function Confirmation({ competition, handle, onDone }) {
  return (
    <>
      <Badge tone="done">
        <Check
          className="size-7 text-black sm:size-8"
          strokeWidth={2.5}
          aria-hidden
        />
      </Badge>

      <h2
        id="compete-entry-title"
        className="text-headline text-balance text-ink"
      >
        You&rsquo;re in
      </h2>

      <p className="text-copy text-balance text-ink-muted">
        <span style={{ color: SETTLED_GREEN }}>{handle}</span>
        {` is entered in the ${competition.venue} competition and now following ${X_HANDLE}. Clear `}
        <span style={{ color: GOLD }}>$50K</span>
        {" in volume through HyprEarn to qualify for a prize."}
      </p>

      <button
        type="button"
        onClick={onDone}
        className="text-figure w-full rounded-[10px] border border-[#242424] px-6 py-3.5 text-ink transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Back to Compete
      </button>
    </>
  );
}
