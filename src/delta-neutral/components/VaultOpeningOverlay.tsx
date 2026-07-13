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
 * Single-beat open-vault motion. Which venue takes the long leg and which takes the
 * short leg is not settled at this point, so the overlay deliberately shows only the
 * two venues being wired together — no sides, no rates, no spread.
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

  const pulseKeyframes = [
    "0 0 0 0 rgba(182, 155, 106, 0)",
    "0 0 18px 2px rgba(182, 155, 106, 0.26)",
    "0 0 0 0 rgba(182, 155, 106, 0)",
  ];

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
      <motion.div
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full border",
          isV2
            ? "border-[rgba(255,255,255,0.08)] bg-[#080908]"
            : "border-[rgba(255,255,255,0.1)] bg-[#0a0a0a]",
        )}
        animate={reduced ? {} : { boxShadow: pulseKeyframes }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
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
            Setting up your hedge across {venueA} and {venueB}
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

            {!reduced && (
              <motion.div
                className={clsx(
                  "pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full",
                  isV2
                    ? "bg-[#b89a6e] shadow-[0_0_16px_rgba(184,154,110,0.55)]"
                    : "bg-[#c4a574] shadow-[0_0_16px_rgba(196,165,116,0.5)]",
                )}
                initial={{ left: "8%", x: "-50%" }}
                animate={{ left: ["8%", "92%", "8%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          {renderVenue(venueB, "right")}
        </div>
      </motion.div>
    </div>
  );
}
