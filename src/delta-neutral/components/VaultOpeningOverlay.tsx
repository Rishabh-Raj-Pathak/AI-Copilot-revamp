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

/** Lattice cell, in px. The drift below is derived from it, so they stay in step. */
const LATTICE = 22;

/**
 * Sliding the lattice this far horizontally advances each 45° hatch by exactly one
 * cell (LATTICE * √2 * cos45° = LATTICE), so the loop closes with no visible jump.
 */
const LATTICE_DRIFT = LATTICE * Math.SQRT2;

/** Holds the texture to the middle, where the venues are, and off the card's edges. */
const LATTICE_FADE =
  "radial-gradient(ellipse at 50% 45%, #000 0%, rgba(0,0,0,0.45) 48%, transparent 78%)";

/** One tile of a price walk, on a 0–80 scale about a neutral axis at 40. */
const TAPE_TILE_W = 600;
const TAPE_STEP = 50;
const TAPE_MID = 40;
/** First and last must match, or the tile seams when it wraps. */
const TAPE_WALK = [40, 27, 33, 18, 25, 12, 21, 31, 24, 37, 30, 45, 40];

/** Two tiles laid end to end, so translating by exactly one tile loops seamlessly. */
function tapePath(invert: boolean): string {
  const points: string[] = [];
  for (let tile = 0; tile < 2; tile += 1) {
    // Skip the repeated seam point on the second tile — it duplicates the first's last.
    const start = tile === 0 ? 0 : 1;
    for (let i = start; i < TAPE_WALK.length; i += 1) {
      const x = tile * TAPE_TILE_W + i * TAPE_STEP;
      const raw = TAPE_WALK[i];
      const y = invert ? 2 * TAPE_MID - raw : raw;
      points.push(`${points.length === 0 ? "M" : "L"} ${x} ${y}`);
    }
  }
  return points.join(" ");
}

/** Keeps the tape off the card's edges and out from under the copy. */
const TAPE_FADE =
  "linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%)";

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
 * *is*. Which venue takes which side is settled at execution by the funding rates (short
 * the venue paying the most, long the one costing the least — the spread is the yield),
 * so it is genuinely unknown here. The two halves are therefore deliberately symmetric:
 * no sides, no rates, no spread, nothing to read.
 */
export function VaultOpeningOverlay({
  venueA,
  venueB,
  variant = "default",
}: VaultOpeningOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const isV2 = variant === "v2";
  const uid = useId().replace(/:/g, "");

  /** Brand gold as raw channels, so every alpha step below stays on the same hue. */
  const gold = isV2 ? "201,169,98" : "214,176,106";

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
      <div className="relative flex h-[84px] w-[84px] items-center justify-center">
        <motion.div
          className="absolute -inset-2 rounded-full blur-md"
          style={{
            background: `radial-gradient(circle, rgba(${gold},0.30) 0%, transparent 70%)`,
          }}
          animate={reduced ? { opacity: 0.4 } : { opacity: [0.75, 0.2, 0.2] }}
          transition={reduced ? { duration: 0 } : { ...loop, times: [0, 0.45, 1] }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 210deg, rgba(${gold},0.9) 350deg, transparent 360deg)`,
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
          <DexLogo dex={venue} className="size-9" />
        </div>
      </div>

      <span
        className={clsx(
          "font-['Onest',sans-serif] text-[15px] font-medium leading-5 tracking-[0.01em]",
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
        "relative flex w-full flex-col items-center justify-center overflow-hidden px-6 py-9 shadow-[0_28px_80px_rgba(0,0,0,0.62)] md:px-10",
        isV2 ? "rounded-[14px]" : "rounded-[20px]",
      )}
      style={{
        // The brand's warm-black card gradient, same axis as the vault cards.
        background: isV2
          ? "linear-gradient(226.75deg, rgb(16,14,12) 0%, rgb(6,6,5) 100%)"
          : "linear-gradient(226.75deg, rgb(22,20,18) 0%, rgb(10,9,8) 100%)",
      }}
    >
      {/* Diamond lattice: the vault's own motif, tiled and drifting. Transform-only,
          so the whole texture rides on the compositor and costs nothing per frame. */}
      <motion.div
        className="pointer-events-none absolute -inset-[64px]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0px, transparent ${
            LATTICE - 1
          }px, rgba(${gold},0.055) ${LATTICE - 1}px, rgba(${gold},0.055) ${LATTICE}px), repeating-linear-gradient(-45deg, transparent 0px, transparent ${
            LATTICE - 1
          }px, rgba(${gold},0.055) ${LATTICE - 1}px, rgba(${gold},0.055) ${LATTICE}px)`,
          maskImage: LATTICE_FADE,
          WebkitMaskImage: LATTICE_FADE,
        }}
        animate={reduced ? {} : { x: [0, -LATTICE_DRIFT] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />

      {/* The tape: a long leg and its exact mirror, drifting about a neutral axis.
          Two equal and opposite price paths that cancel — the strategy, stated quietly
          in the background. Kept dim; the venues are what the eye should land on. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[150px] -translate-y-1/2 overflow-hidden"
        style={{ maskImage: TAPE_FADE, WebkitMaskImage: TAPE_FADE }}
        aria-hidden
      >
        {/* The neutral line the two legs mirror about — what the vault is aiming at. */}
        <div
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, rgba(${gold},0.18) 0px, rgba(${gold},0.18) 3px, transparent 3px, transparent 9px)`,
          }}
        />
        <motion.svg
          className="absolute left-0 top-0 h-full w-[200%]"
          viewBox={`0 0 ${TAPE_TILE_W * 2} 80`}
          preserveAspectRatio="none"
          fill="none"
          animate={reduced ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        >
          <path
            d={tapePath(false)}
            stroke={`rgba(${gold},0.16)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={tapePath(true)}
            stroke={`rgba(${gold},0.09)`}
            strokeWidth="1"
            strokeDasharray="4 5"
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
      </div>

      {/* Hairline frame: the seam of the door. Static, so it costs a single paint. */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 ring-1 ring-inset",
          isV2
            ? "rounded-[14px] ring-[#c9a962]/20"
            : "rounded-[20px] ring-[#d6b06a]/25",
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-12 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${gold},0.3), transparent)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-12 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${gold},0.18), transparent)`,
        }}
        aria-hidden
      />

      <motion.div
        className="relative z-[2] flex w-full max-w-[460px] flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className={clsx(
            "font-['Onest',sans-serif] text-center text-[14px] font-semibold uppercase tracking-[0.2em]",
            isV2 ? "text-[#c9a962]" : "text-[#d6b06a]",
          )}
        >
          Opening delta neutral vault
        </p>
        <p
          className={clsx(
            "mt-2.5 max-w-[360px] text-center font-['Onest',sans-serif] text-[15px] leading-[1.5]",
            isV2 ? "text-[#c4c4c4]" : "text-[#c9cad4]",
          )}
        >
          Balancing exposure across {venueA} and {venueB}
        </p>

        <div className="mt-9 flex items-start justify-center gap-3 md:gap-4">
          {renderVenue(venueA, "left")}

          {/* The bridge sits at medallion height; the spacer keeps it off the name row. */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex h-[84px] w-[96px] items-center justify-center md:w-[124px]">
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
                    <stop offset="0%" stopColor={`rgba(${gold},0.05)`} />
                    <stop offset="50%" stopColor={`rgba(${gold},0.55)`} />
                    <stop offset="100%" stopColor={`rgba(${gold},0.05)`} />
                  </linearGradient>
                </defs>
              </svg>

              {/* The neutral point the two legs cancel at — always present, quietly. */}
              <div
                className={clsx(
                  "absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rotate-45 border",
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
                        "pointer-events-none absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full",
                        isV2
                          ? "bg-[#e0c68d] shadow-[0_0_12px_rgba(224,198,141,0.85)]"
                          : "bg-[#f0dcae] shadow-[0_0_12px_rgba(240,220,174,0.8)]",
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
                      "pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border",
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

        {/* Says out loud why no side is shown, so the omission reads as intent — and
            what actually decides it: live funding rates, at execution. */}
        <motion.p
          className={clsx(
            "mt-8 max-w-[420px] text-balance text-center font-['Onest',sans-serif] text-[13px] leading-[1.6]",
            isV2 ? "text-[#9a9a9a]" : "text-[#9c9cac]",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.35, duration: 0.4 }}
        >
          Legs are set at execution, based on live funding rates across venues and
          whichever side gives the best overall yield.
        </motion.p>
      </motion.div>
    </div>
  );
}
