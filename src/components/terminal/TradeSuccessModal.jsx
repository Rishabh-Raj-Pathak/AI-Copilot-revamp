import { createPortal } from "react-dom";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

/**
 * Post–open-trade success state (Figma: Modal 1017:37095).
 * Rendered in a portal so it stacks above product-tour overlays.
 */
export default function TradeSuccessModal({
  open,
  onViewPortfolio,
  onShareSetup,
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center bg-black/90 px-5 py-8">
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0 bg-transparent"
        onClick={onViewPortfolio}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-success-title"
        className="relative z-1 w-full max-w-[402px] rounded-xl border border-[#242424] bg-black p-5 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
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
              className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#f2b500] bg-linear-to-r from-[#f2b500] to-[#00f3b6] px-6 py-3 text-lg font-medium leading-[1.2] text-black transition hover:brightness-105"
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
