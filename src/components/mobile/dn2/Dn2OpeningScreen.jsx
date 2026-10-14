import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { appImages } from "../mobileAssets.js";
import { VenueMark } from "./Dn2Ui.jsx";

/**
 * Figma B8 "Opening vault (full screen, ~5 s)" (4496:245): both legs, the
 * hedge link between them and a progress bar that fills over `durationMs`.
 * Portalled above everything, tab bar and sheets included.
 */

function Leg({ dex }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="flex size-[72px] items-center justify-center rounded-full border border-[rgba(120,90,40,0.6)] bg-[#0c0a08] shadow-[0_0_12px_rgba(214,177,107,0.18)]">
        <VenueMark dex={dex} size={30} />
      </span>
      <span className="text-[13px] font-medium leading-4 text-[#e8d5b5]">{dex}</span>
    </div>
  );
}

export default function Dn2OpeningScreen({ open, venueA, venueB, durationMs = 5000 }) {
  const reduceMotion = useReducedMotion();
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dn2-opening"
          role="status"
          aria-live="polite"
          aria-label={`Opening delta neutral vault on ${venueA} and ${venueB}`}
          className="fixed inset-0 z-[200] overflow-hidden bg-black tablet:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Figma: a 420px glow centred ~100px under the top of the legs (B8 4496:256). */}
          <img
            alt=""
            src={appImages.dnOpeningGlow}
            className="pointer-events-none absolute left-1/2 top-[calc(31%+100px)] size-[420px] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
          <div className="absolute inset-x-0 top-[31%] flex flex-col items-center gap-[22px] px-5">
            <div className="flex items-center gap-2.5">
              <Leg dex={venueA} />
              <img alt="" src={appImages.dnHedgeLink} width={84} height={72} className="shrink-0" />
              <Leg dex={venueB} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[12px] font-semibold uppercase leading-4 tracking-[0.8px] text-[#d6b06a]">
                Opening delta neutral vault
              </p>
              <p className="text-[14px] leading-5 text-[#dcdce8]">
                Balancing exposure across {venueA} and {venueB}
              </p>
            </div>
            <div className="h-[3px] w-[180px] overflow-hidden rounded-[2px] bg-white/10">
              <motion.div
                className="h-full rounded-[2px] bg-[linear-gradient(90deg,#8f6a33_0%,#d6b06a_100%)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: durationMs / 1000, ease: "linear" }}
              />
            </div>
          </div>
          <p className="absolute inset-x-0 bottom-[calc(var(--app-safe-bottom)+40px)] mx-auto w-[310px] max-w-[calc(100%-40px)] text-center text-[12px] leading-[17px] text-[#8d8e99]">
            Legs are set at execution, based on live funding rates across venues and whichever side gives the
            best overall yield.
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
