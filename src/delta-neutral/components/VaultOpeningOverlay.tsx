import React, { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { Activity } from "lucide-react";
import { clsx } from "clsx";

type VaultOpeningOverlayProps = {
  /** The two venues the user picked. Sides are not known here, so none are shown. */
  venueA: string;
  venueB: string;
  variant?: "default" | "v2";
};

/** One full breath of the loop: legs leave their venues, meet, and cancel. */
const CYCLE_S = 1.9;

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

  const spring = reduced
    ? { type: "tween" as const, duration: 0.12 }
    : { type: "spring" as const, stiffness: 380, damping: 28 };

  const loop = {
    duration: CYCLE_S,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  const renderVenue = (venue: string, position: "left" | "right") => (
    <motion.div
      className={clsx(
        "relative flex min-h-[132px] flex-1 flex-col items-center justify-center gap-3 rounded-[14px] border px-3 py-4",
        isV2
          ? "border-[#2a2a2a] bg-[#0d0d0d]"
          : "border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,12,0.85)]",
      )}
      initial={
        reduced
          ? false
          : { opacity: 0, x: position === "left" ? -22 : 22, scale: 0.96 }
      }
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={
        position === "left" ? spring : { ...spring, delay: reduced ? 0 : 0.06 }
      }
    >
      {/* Kicks at the top of each cycle — the venue "firing" its leg down the bridge. */}
      <motion.div
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full border",
          isV2
            ? "border-[rgba(255,255,255,0.08)] bg-[#080908]"
            : "border-[rgba(255,255,255,0.1)] bg-[#0a0a0a]",
        )}
        animate={
          reduced
            ? {}
            : {
                boxShadow: [
                  "0 0 22px 2px rgba(182,155,106,0.28)",
                  "0 0 0 0 rgba(182,155,106,0)",
                  "0 0 0 0 rgba(182,155,106,0)",
                ],
                scale: [1.06, 1, 1],
              }
        }
        transition={{ ...loop, times: [0, 0.45, 1] }}
      >
        <Activity className="size-5 text-[#b69b6a]" strokeWidth={1.75} aria-hidden />
      </motion.div>
      <span
        className={clsx(
          "line-clamp-2 text-center font-mono text-[12px] leading-tight",
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
        "flex h-full min-h-[280px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8 backdrop-blur-md md:px-8",
        isV2
          ? "rounded-[12px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,98,0.12)_0%,rgba(0,0,0,0.92)_55%,rgba(0,0,0,0.96)_100%)]"
          : "rounded-[18px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(214,176,106,0.14)_0%,rgba(0,0,0,0.88)_55%,rgba(0,0,0,0.94)_100%)]",
      )}
    >
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(182,155,106,0.06) 90deg, transparent 180deg)",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.div
        className="relative z-[2] flex w-full max-w-[440px] flex-col items-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
          <p
            className={clsx(
              "font-['Onest',sans-serif] text-[15px] font-semibold tracking-[0.18em] md:text-[16px]",
              isV2 ? "text-[#E8E2D2]" : "text-[#f5ecd8]",
            )}
          >
            Opening vault
          </p>
          <p
            className={clsx(
              "max-w-[340px] font-mono text-[11px] leading-relaxed md:text-[12px]",
              isV2 ? "text-[#888888]" : "text-[#9c9cac]",
            )}
          >
            Balancing your exposure across {venueA} and {venueB}
          </p>
        </div>

        <div className="flex w-full max-w-[400px] items-center justify-center gap-1 md:gap-2">
          {renderVenue(venueA, "left")}

          <div className="relative mx-0.5 flex h-[132px] w-[72px] shrink-0 items-center justify-center md:mx-1 md:w-[88px]">
            <svg
              className="absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 overflow-visible"
              viewBox="0 0 88 32"
              fill="none"
              aria-hidden
            >
              <motion.path
                d="M 4 16 L 84 16"
                stroke={`url(#vaultBridge-${uid})`}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: reduced ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduced ? 0.05 : 0.85,
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
                  <stop offset="0%" stopColor="var(--vault-bridge-start)" />
                  <stop offset="50%" stopColor="var(--vault-bridge-mid)" />
                  <stop offset="100%" stopColor="var(--vault-bridge-end)" />
                </linearGradient>
              </defs>
            </svg>

            {/* The neutral point the two legs cancel at — always present, quietly. */}
            <div
              className={clsx(
                "absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border",
                isV2
                  ? "border-[#c9a962]/60 bg-[#0a0a0a]"
                  : "border-[#d6b06a]/60 bg-[#050505]",
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
                      "pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full",
                      isV2
                        ? "bg-[#b89a6e] shadow-[0_0_16px_rgba(184,154,110,0.55)]"
                        : "bg-[#c4a574] shadow-[0_0_16px_rgba(196,165,116,0.5)]",
                    )}
                    style={{ x: "-50%" }}
                    animate={{
                      left:
                        from === "left"
                          ? ["4%", "50%", "50%"]
                          : ["96%", "50%", "50%"],
                      opacity: [0, 1, 0],
                      scale: [0.7, 1, 0.4],
                    }}
                    transition={{ ...loop, times: [0, 0.5, 0.62] }}
                  />
                ))}

                {/* ...and where they meet, they cancel — the ring is the hedge going neutral. */}
                <motion.div
                  className={clsx(
                    "pointer-events-none absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border",
                    isV2 ? "border-[#c9a962]" : "border-[#d6b06a]",
                  )}
                  style={{ left: "50%", x: "-50%" }}
                  animate={{
                    scale: [0.15, 0.15, 1.5, 1.5],
                    opacity: [0, 0.75, 0, 0],
                  }}
                  transition={{
                    duration: CYCLE_S,
                    repeat: Infinity,
                    ease: "easeOut",
                    times: [0, 0.52, 0.92, 1],
                  }}
                />
              </>
            )}
          </div>

          {renderVenue(venueB, "right")}
        </div>

        {/* Loading affordance — motion only, nothing to read off it. */}
        <div
          className={clsx(
            "mt-6 h-[2px] w-full max-w-[220px] overflow-hidden rounded-full",
            isV2 ? "bg-[#1a1a1a]" : "bg-[rgba(255,255,255,0.06)]",
          )}
        >
          <motion.div
            className={clsx(
              "h-full w-1/3 rounded-full bg-gradient-to-r from-transparent",
              isV2 ? "via-[#c9a962] to-transparent" : "via-[#d6b06a] to-transparent",
            )}
            animate={reduced ? { opacity: 0.6 } : { x: ["-100%", "300%"] }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>
      </motion.div>
    </div>
  );
}
