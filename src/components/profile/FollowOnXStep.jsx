import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { XGlyph } from "./SocialGlyphs.jsx";
import { X_HANDLE, X_PROFILE_URL, startXFollowCheck } from "./simulatedOAuth.js";

/**
 * Step three: follow HyprEarn on X.
 *
 * The follow happens on x.com, so this step can't credit itself on click the
 * way a chip selection could. Pressing the button opens the profile and starts
 * the confirmation wait; the step lands when that resolves. The tab is opened
 * from the click handler, never from the timer — a popup blocker eats anything
 * a user gesture didn't open.
 *
 * @param {object} props
 * @param {boolean} props.followed
 * @param {() => void} props.onFollowed
 */
export default function FollowOnXStep({ followed, onFollowed }) {
  const [pending, setPending] = useState(false);
  const cancelRef = useRef(null);

  // A check that outlives the panel must not resolve into the store. StrictMode
  // double-invokes effects in dev, so the timer owns its teardown.
  useEffect(() => () => cancelRef.current?.(), []);

  if (followed) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-[#1e5a3f] bg-[#0d2019] px-3 py-2">
        <span className="shrink-0 text-white">
          <XGlyph className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
          {X_HANDLE}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#00f3b6]">
          <Check className="size-3.5" aria-hidden />
          Following
        </span>
      </div>
    );
  }

  const follow = () => {
    if (pending) return;
    window.open(X_PROFILE_URL, "_blank", "noopener,noreferrer");
    setPending(true);
    cancelRef.current = startXFollowCheck(() => {
      cancelRef.current = null;
      setPending(false);
      onFollowed();
    });
  };

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs leading-relaxed text-[#929292]">
        Alpha, agent drops and launch news land on X first.
      </p>

      <button
        type="button"
        onClick={follow}
        disabled={pending}
        className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#242424] bg-black px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <XGlyph className="size-4" />
        {pending ? `Confirming follow…` : `Follow ${X_HANDLE}`}
        {pending ? (
          <Loader2 className="size-4 animate-spin text-[#00f3b6]" aria-hidden />
        ) : (
          <ExternalLink className="size-3.5 text-[#757575]" aria-hidden />
        )}
      </button>
    </div>
  );
}
