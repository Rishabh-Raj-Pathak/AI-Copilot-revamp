import { useEffect, useRef, useState } from "react";
import AppButton from "../AppButton.jsx";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { useProfile } from "../../profile/ProfileContext.jsx";
import { X_HANDLE, startXAuthorization } from "../../profile/simulatedOAuth.js";
import { EntryOffer, XMark } from "../../compete/competeCopy.jsx";
import { CTA_SWEEP, GOLD, SETTLED_GREEN } from "../../compete/competeTheme.js";

/**
 * The phone presentation of `CompeteEntryModal`: the same "link X and you are
 * in" gate, as a bottom sheet over the hub instead of a centred dialog.
 *
 * Same flow and the same profile store — linking X here satisfies the
 * profile checklist too, and an account the profile already holds skips the
 * authorization round trip. Kept open across the exit animation with the
 * last competition, and each opening starts from a clean state.
 */
export default function CompeteEntrySheet({ competition, onEntered, onClose }) {
  const open = Boolean(competition);
  const [prev, setPrev] = useState(competition);
  const [shown, setShown] = useState(competition);
  const [session, setSession] = useState(0);

  // Remember what is open so the sheet keeps its content while it slides out,
  // and bump the session on each opening so the body resets.
  if (competition !== prev) {
    setPrev(competition);
    if (competition) {
      setShown(competition);
      setSession((n) => n + 1);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Enter the competition">
      {shown ? (
        <EntryBody
          key={session}
          open={open}
          competition={shown}
          onEntered={onEntered}
          onDone={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}

function Badge({ done, children }) {
  return (
    <span
      className="flex size-14 shrink-0 items-center justify-center rounded-full"
      style={
        done
          ? { backgroundImage: CTA_SWEEP }
          : { backgroundColor: "rgba(255,212,0,0.1)", border: "1px solid rgba(255,212,0,0.28)" }
      }
    >
      {children}
    </span>
  );
}

function EntryBody({ open, competition, onEntered, onDone }) {
  const { socials, connectSocial } = useProfile();
  const [authorizing, setAuthorizing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const cancelRef = useRef(null);
  const xAccount = socials.x;

  // A dismissed sheet must not resolve an authorization into the profile.
  useEffect(() => {
    if (!open) cancelRef.current?.();
  }, [open]);
  useEffect(() => () => cancelRef.current?.(), []);

  const enter = () => {
    setConfirmed(true);
    onEntered?.(competition.id);
  };

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

  if (confirmed) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-6 text-center">
        <Badge done>
          <AppIcon src={appIcons.check12} size={26} className="text-black" />
        </Badge>
        <h3 className="text-app-title font-semibold text-ink">You’re in</h3>
        <p className="text-app-body text-ink-muted">
          <span style={{ color: SETTLED_GREEN }}>{xAccount?.handle}</span>
          {` is entered in the ${competition.venue} competition and now following ${X_HANDLE}. Clear `}
          <span style={{ color: GOLD }}>$50K</span>
          {" in volume through HyprEarn to qualify for a prize."}
        </p>
        <AppButton variant="secondary" onClick={onDone} className="mt-2">
          Back to Compete
        </AppButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-6 text-center">
      <Badge>
        <AppIcon src={appIcons.trophy14} size={28} className="text-[#ffd400]" />
      </Badge>
      <p className="text-app-body text-ink-muted">
        <EntryOffer />
      </p>
      <AppButton
        onClick={submit}
        aria-busy={authorizing || undefined}
        aria-label={xAccount ? `Continue as ${xAccount.handle}` : authorizing ? undefined : "Connect your X"}
        className={`mt-2 ${authorizing ? "opacity-80" : ""}`}
      >
        {authorizing ? <AppIcon src={appIcons.loader16} size={16} className="animate-spin" /> : null}
        <span>
          {authorizing ? (
            "Authorizing on X…"
          ) : xAccount ? (
            `Continue as ${xAccount.handle}`
          ) : (
            <>
              {"Connect your "}
              <XMark />
            </>
          )}
        </span>
      </AppButton>
      <p className="text-app-caption text-ink-faint">Entering is free. Only HyprEarn volume counts.</p>
    </div>
  );
}
