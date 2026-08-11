import { useEffect } from "react";

const VARIANTS = {
  "tutorial-restart": {
    message: (
      <>
        You can restart the tutorial anytime from{" "}
        <span className="font-medium text-ink">More → Tutorial</span>.
      </>
    ),
    autoDismissMs: 6000,
  },
  "position-added": {
    message: (
      <>
        Demo position added. Open{" "}
        <span className="font-medium text-ink">Portfolio</span> from{" "}
        <span className="font-medium text-ink">More</span> when you connect a
        wallet.
      </>
    ),
    autoDismissMs: 6000,
  },
};

/**
 * Lightweight status toast for tutorial skip hint and mobile post-trade feedback.
 */
export default function CopilotTutorialToast({
  open,
  onDismiss,
  variant = "tutorial-restart",
}) {
  const content = VARIANTS[variant] ?? VARIANTS["tutorial-restart"];

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => onDismiss?.(), content.autoDismissMs);
    return () => window.clearTimeout(t);
  }, [open, onDismiss, content.autoDismissMs]);

  if (!open) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-5 left-1/2 z-[130] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-[#3e2e00] bg-[#171200] px-4 py-3 shadow-lg max-tablet:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      <p className="text-data text-[#f2b500]">{content.message}</p>
      <button
        type="button"
        className="mt-2 text-data text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        onClick={() => onDismiss?.()}
      >
        Got it
      </button>
    </div>
  );
}
