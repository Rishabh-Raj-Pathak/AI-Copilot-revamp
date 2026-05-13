import confetti from "canvas-confetti";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { terminalConnectWallet } from "../../design-system/tokens/terminalConnectWallet";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

/** Brand-aligned confetti (terminal gradient CTA ramp + light highlights). */
const CELEBRATION_COLORS = [
  "#f1d302",
  "#24e5af",
  "#fefce8",
  "#f7bb08",
  "#2fffce",
];

/**
 * @param {(opts: import('canvas-confetti').Options) => void} fire
 */
function runTradeOpenedCelebration(fire) {
  const shared = {
    colors: CELEBRATION_COLORS,
    disableForReducedMotion: true,
    ticks: 220,
    gravity: 1.05,
    decay: 0.91,
  };

  fire({
    ...shared,
    particleCount: 52,
    angle: 60,
    spread: 58,
    origin: { x: 0, y: 0.58 },
    startVelocity: 38,
    scalar: 0.95,
  });
  fire({
    ...shared,
    particleCount: 52,
    angle: 120,
    spread: 58,
    origin: { x: 1, y: 0.58 },
    startVelocity: 38,
    scalar: 0.95,
  });
  fire({
    ...shared,
    particleCount: 42,
    spread: 70,
    origin: { x: 0.5, y: 0.42 },
    startVelocity: 32,
    scalar: 0.88,
  });

  window.setTimeout(() => {
    fire({
      ...shared,
      particleCount: 28,
      spread: 360,
      origin: { x: 0.5, y: 0.48 },
      startVelocity: 22,
      scalar: 0.75,
      ticks: 160,
    });
  }, 160);
}

/**
 * Post–open-trade success state (Figma: Modal 1017:37095).
 * Rendered in a portal so it stacks above product-tour overlays.
 */
export default function TradeSuccessModal({
  open,
  onViewPortfolio,
  onShareSetup,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const id = window.requestAnimationFrame(() => {
      runTradeOpenedCelebration(fire);
    });

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="hyprearn-trade-success-modal-root fixed inset-0 z-1000000001 flex items-center justify-center bg-black/90 px-5 py-8"
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-0 bg-transparent"
        onClick={onViewPortfolio}
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
        aria-labelledby="trade-success-title"
        className="relative z-2 w-full max-w-[402px] rounded-xl border border-[#242424] bg-black p-5 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="relative size-16 shrink-0">
            <img
              alt=""
              className="absolute inset-0 size-full max-w-none object-contain"
              src={a.tradeSuccessCheckRosette}
            />
          </div>
          <h2
            id="trade-success-title"
            className="w-full text-center text-xl font-semibold leading-[1.2] text-white"
          >
            Position Opened Successfully
          </h2>
          <p className="w-full text-center text-base font-normal leading-[1.2] text-[#bfbfbf]">
            You can track all your trades from the{" "}
            <span className="bg-linear-to-r from-[#f7bb08] from-[65.388%] to-[#2fffce] bg-clip-text font-semibold text-transparent">
              Portfolio
            </span>{" "}
            page. Would you like to share this setup with your friends &
            followers?
          </p>
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={onViewPortfolio}
              className="w-full rounded-[10px] border border-[#242424] bg-transparent px-6 py-3 text-lg font-medium leading-[1.2] text-white transition hover:bg-white/5"
            >
              View Portfolio
            </button>
            <button
              type="button"
              onClick={onShareSetup}
              className={`${terminalConnectWallet.componentClassName} w-full gap-2.5 px-6 py-3 text-lg font-medium leading-[1.2]`}
            >
              <span className="relative size-6 shrink-0">
                <img
                  alt=""
                  className="absolute inset-0 m-auto block size-[18px] max-w-none object-contain"
                  src={a.tradeSuccessShareLeadingIcon}
                />
              </span>
              Share Setup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
