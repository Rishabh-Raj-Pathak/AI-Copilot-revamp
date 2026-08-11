import { ChevronRight, X } from "lucide-react";
import ProfileProgressRing from "./ProfileProgressRing.jsx";
import { useProfile } from "./ProfileContext.jsx";

/**
 * One-line nudge on the trading surfaces, rendered in the normal document flow
 * between the header and `<main>`.
 *
 * In-flow rather than fixed or portalled on purpose: the driver.js tour overlay
 * sits at z-index 1e9, the install prompt at z-60, the mobile nav at z-50 and
 * the tutorial toast at z-130. A banner that never leaves the flow can't lose
 * an argument with any of them.
 *
 * @param {object} props
 * @param {() => void} props.onOpenProfile
 * @param {boolean} [props.suppressed] true while a product tour owns the screen
 */
export default function ProfileCompletionBanner({ onOpenProfile, suppressed }) {
  const { walletConnected, progress, bannerDismissed, dismissBanner } =
    useProfile();

  if (suppressed || !walletConnected || progress.isComplete || bannerDismissed) {
    return null;
  }

  const remaining = progress.pointsRemaining;

  return (
    <div className="flex shrink-0 items-center gap-2.5 border-b border-[#242424] bg-[#121212] px-3 py-2 sm:gap-3 sm:px-5">
      <ProfileProgressRing percent={progress.percent} size={22} strokeWidth={2}>
        <span className="text-meta text-ink">
          {progress.completedCount}
        </span>
      </ProfileProgressRing>

      <button
        type="button"
        onClick={onOpenProfile}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:shadow-ds-ring focus-visible:outline-none"
      >
        <span className="truncate text-control font-medium text-ink">
          Finish your profile
        </span>
        <span className="hidden text-data text-ink-faint sm:inline">
          {progress.completedCount} of {progress.totalCount} done
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-[#3e2e00] bg-[#171200] ds-eyebrow px-1.5 py-0.5 text-[#f2b500] sm:px-2">
          +{remaining} pts
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden />
      </button>

      <button
        type="button"
        onClick={dismissBanner}
        aria-label="Dismiss profile reminder"
        className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-white/5 hover:text-ink focus-visible:shadow-ds-ring focus-visible:outline-none sm:mr-0 sm:size-7"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
