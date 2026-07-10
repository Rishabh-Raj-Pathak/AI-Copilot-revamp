import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { startCanvasCelebration } from "../../lib/celebration.js";
import { useProfile } from "./ProfileContext.jsx";

/**
 * Fires once per session, the moment the third step lands.
 *
 * `dismissed` is tracked separately from `latched` rather than reusing one
 * flag: `shouldCelebrate` stays true until the record says otherwise, so a
 * single flag would reopen the modal the instant the user closed it.
 */
export default function ProfileCompleteModal({ onDone }) {
  const { shouldCelebrate, progress, markCelebrated } = useProfile();
  const [latched, setLatched] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const canvasRef = useRef(null);

  // Catch the transition during render — no effect, so nothing paints between
  // completion and the celebration.
  if (shouldCelebrate && !latched && !dismissed) setLatched(true);

  const visible = latched && !dismissed;

  // Persisting the celebration is an external-system write, which is what an
  // effect is for. It's idempotent, so StrictMode's double invoke is harmless.
  useEffect(() => {
    if (visible) markCelebrated();
  }, [visible, markCelebrated]);

  useEffect(() => {
    if (!visible) return;
    return startCanvasCelebration(canvasRef.current);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && setDismissed(true);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible || typeof document === "undefined") return null;

  const close = () => {
    setDismissed(true);
    onDone?.();
  };

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 px-5 py-8">
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-0 bg-transparent"
        onClick={close}
        aria-label="Close"
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-1 h-full w-full"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-complete-title"
        className="relative z-2 w-full max-w-[402px] rounded-xl border border-[#242424] bg-black p-6 text-center shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
      >
        <div className="flex flex-col items-center gap-5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f7bb08] to-[#2fffce]">
            <Check className="size-8 text-black" strokeWidth={2.5} aria-hidden />
          </span>

          <h2
            id="profile-complete-title"
            className="text-xl font-semibold leading-tight text-white"
          >
            Profile complete
          </h2>

          <p className="text-base leading-snug text-[#bfbfbf]">
            You earned{" "}
            <span className="bg-linear-to-r from-[#f7bb08] to-[#2fffce] bg-clip-text font-semibold text-transparent">
              {progress.points} HyprEarn Points
            </span>
            . They're live on your balance — Copilot is ready when you are.
          </p>

          <button
            type="button"
            onClick={close}
            className="ds-terminal-gradient-cta w-full rounded-[10px] px-6 py-3 text-lg font-medium"
          >
            Back to trading
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
