import React, { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { DexLogo } from "./DexLogo";
import type { ManagedDexId } from "./ActiveVaultCard";

type VaultOpeningOverlayProps = {
  /** The two venues the user picked. Sides are not known here, so none are shown. */
  venueA: ManagedDexId;
  venueB: ManagedDexId;
  variant?: "default" | "v2";
};

/** One full breath of the loop: legs leave their venues, meet, and cancel. */
const CYCLE_S = 2.1;

/** Ring mask that turns a conic gradient into a hairline arc — the medallion spinner. */
const RING_MASK =
  "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Single-beat open-vault motion, built on one idea: two equal and opposite legs leave
 * their venues, meet in the middle, and cancel into neutrality — which is what the vault
 * *is*. Which venue takes which side is not settled at this point, so the two halves are
 * deliberately symmetric: no sides, no rates, no spread, nothing to read.
 */
export function VaultOpeningOverlay({
  venueA,
  venueB,
  variant = "default",
}: VaultOpeningOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const isV2 = variant === "v2";
  const uid = useId().replace(/:/g, "");

  const loop = {
    duration: CYCLE_S,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  /** Venue medallion: the real brand mark, a hairline sweep, and a glow that beats. */
  const renderVenue = (venue: ManagedDexId, position: "left" | "right") => (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={
        reduced ? false : { opacity: 0, x: position === "left" ? -18 : 18 }
      }
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: reduced ? 0 : position === "left" ? 0 : 0.08,
      }}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <motion.div
          className="absolute -inset-1.5 rounded-full blur-md"
          style={{
            background:
              "radial-gradient(circle, rgba(214,176,106,0.30) 0%, transparent 70%)",
          }}
          animate={reduced ? { opacity: 0.4 } : { opacity: [0.75, 0.2, 0.2] }}
          transition={reduced ? { duration: 0 } : { ...loop, times: [0, 0.45, 1] }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 210deg, ${
              isV2 ? "rgba(201,169,98,0.85)" : "rgba(214,176,106,0.9)"
            } 350deg, transparent 360deg)`,
            maskImage: RING_MASK,
            WebkitMaskImage: RING_MASK,
          }}
          animate={reduced ? {} : { rotate: 360 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
        />

        <div
          className={clsx(
            "absolute inset-[3px] flex items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
            isV2
              ? "border-[#242424] bg-[#0a0a0a]"
              : "border-[rgba(255,255,255,0.09)] bg-[#080808]",
          )}
        >
          <DexLogo dex={venue} className="size-7" />
        </div>
      </div>

      <span
        className={clsx(
          "font-['Onest',sans-serif] text-[14px] font-medium leading-5 tracking-[0.01em]",
          isV2 ? "text-[#E8E2D2]" : "text-[#e8d5b5]",
        )}
      >
        {venue}
      </span>
    </motion.div>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={clsx(
        "relative flex h-full min-h-[320px] w-full flex-col items-center justify-center overflow-hidden px-5 py-8 backdrop-blur-md md:px-8",
        isV2
          ? "rounded-[12px] bg-[radial-gradient(ellipse_at_50%_40%,rgba(201,169,98,0.10)_0%,rgba(0,0,0,0.94)_58%,rgba(0,0,0,0.97)_100%)]"
          : "rounded-[18px] bg-[radial-gradient(ellipse_at_50%_40%,rgba(214,176,106,0.12)_0%,rgba(0,0,0,0.92)_58%,rgba(0,0,0,0.96)_100%)]",
      )}
    >
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(182,155,106,0.05) 90deg, transparent 180deg)",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.div
        className="relative z-[2] flex w-full max-w-[420px] flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className={clsx(
            "font-['Onest',sans-serif] text-[14px] font-semibold uppercase tracking-[0.2em]",
            isV2 ? "text-[#c9a962]" : "text-[#d6b06a]",
          )}
        >
          Opening vault
        </p>
        <p
          className={clsx(
            "mt-2.5 max-w-[360px] text-center font-['Onest',sans-serif] text-[15px] leading-[1.5]",
            isV2 ? "text-[#c4c4c4]" : "text-[#c9cad4]",
          )}
        >
          Balancing exposure across {venueA} and {venueB}
        </p>

        <div className="mt-8 flex items-start justify-center gap-3 md:gap-4">
          {renderVenue(venueA, "left")}

          {/* The bridge sits at medallion height; the spacer keeps it off the name row. */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex h-16 w-[84px] items-center justify-center md:w-[104px]">
              <svg
                className="absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 overflow-visible"
                viewBox="0 0 104 24"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden
              >
                <motion.path
                  d="M 2 12 L 102 12"
                  stroke={`url(#vaultBridge-${uid})`}
                  strokeWidth="1"
                  strokeLinecap="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: reduced ? 0.05 : 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
                <defs>
                  <linearGradient
                    id={`vaultBridge-${uid}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(214,176,106,0.05)" />
                    <stop offset="50%" stopColor="rgba(214,176,106,0.55)" />
                    <stop offset="100%" stopColor="rgba(214,176,106,0.05)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* The neutral point the two legs cancel at — always present, quietly. */}
              <div
                className={clsx(
                  "absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rotate-45 border",
                  isV2
                    ? "border-[#c9a962]/70 bg-[#0a0a0a]"
                    : "border-[#d6b06a]/70 bg-[#050505]",
                )}
                aria-hidden
              />

              {!reduced && (
                <>
                  {/* Equal and opposite: each leg runs in from its own venue... */}
                  {(["left", "right"] as const).map(from => (
                    <motion.div
                      key={from}
                      className={clsx(
                        "pointer-events-none absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full",
                        isV2
                          ? "bg-[#e0c68d] shadow-[0_0_10px_rgba(224,198,141,0.85)]"
                          : "bg-[#f0dcae] shadow-[0_0_10px_rgba(240,220,174,0.8)]",
                      )}
                      style={{ x: "-50%" }}
                      animate={{
                        left:
                          from === "left"
                            ? ["0%", "50%", "50%"]
                            : ["100%", "50%", "50%"],
                        opacity: [0, 1, 0],
                        scale: [0.6, 1, 0.3],
                      }}
                      transition={{ ...loop, times: [0, 0.5, 0.62] }}
                    />
                  ))}

                  {/* ...and where they meet, they cancel — the ring is the hedge going neutral. */}
                  <motion.div
                    className={clsx(
                      "pointer-events-none absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border",
                      isV2 ? "border-[#c9a962]" : "border-[#d6b06a]",
                    )}
                    animate={{
                      scale: [0.2, 0.2, 1.6, 1.6],
                      opacity: [0, 0.7, 0, 0],
                    }}
                    transition={{
                      duration: CYCLE_S,
                      repeat: Infinity,
                      ease: "easeOut",
                      times: [0, 0.52, 0.94, 1],
                    }}
                  />
                </>
              )}
            </div>
            <span className="h-4" aria-hidden />
          </div>

          {renderVenue(venueB, "right")}
        </div>

        {/* Says out loud why no side is shown, so the omission reads as intent. */}
        <motion.p
          className={clsx(
            "mt-8 max-w-[400px] text-balance text-center font-['Onest',sans-serif] text-[13px] leading-[1.6]",
            isV2 ? "text-[#9a9a9a]" : "text-[#9c9cac]",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.35, duration: 0.4 }}
        >
          Legs are assigned at execution. You'll see which venue is long and which is
          short as soon as your vault is live.
        </motion.p>
      </motion.div>
    </div>
  );
}
