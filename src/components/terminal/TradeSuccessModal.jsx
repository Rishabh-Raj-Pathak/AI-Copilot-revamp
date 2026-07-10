import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { terminalConnectWallet } from "../../design-system/tokens/terminalConnectWallet";
import { terminalAssets as a } from "../../figma/terminalAssets.js";
import { startCanvasCelebration } from "../../lib/celebration.js";

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
    return startCanvasCelebration(canvasRef.current);
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
            You're in—position opened
          </h2>
          <p className="w-full text-center text-base font-normal leading-[1.2] text-[#bfbfbf]">
            Follow size, PnL, and exits anytime from your{" "}
            <span className="bg-linear-to-r from-[#f7bb08] from-[65.388%] to-[#2fffce] bg-clip-text font-semibold text-transparent">
              Portfolio
            </span>
            . Want to show friends what you just put on? You can share this setup in one tap.
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
