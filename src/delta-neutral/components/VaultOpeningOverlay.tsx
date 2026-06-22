import React, { useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Activity, Check, Shield } from "lucide-react";
import { clsx } from "clsx";

export type VaultOpeningPhase = "idle" | "long" | "short" | "done";

type VaultOpeningOverlayProps = {
  longDex: string;
  shortDex: string;
  phase: VaultOpeningPhase;
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

/** Orchestrates open-vault motion: dual-leg routing → hedge lock. Colors use global vault tokens (muted sage / clay, not neon). */
export function VaultOpeningOverlay({
  longDex,
  shortDex,
  phase,
  variant = "default",
}: VaultOpeningOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const isV2 = variant === "v2";
  const uid = useId().replace(/:/g, "");

  const activePhase = phase === "idle" ? "long" : phase;

  const copy = useMemo(() => {
    switch (activePhase) {
      case "long":
        return {
          title: "Routing long leg",
          detail: `Posting delta on ${longDex}`,
        };
      case "short":
        return {
          title: "Hedging short leg",
          detail: `Mirroring exposure on ${shortDex}`,
        };
      case "done":
        return {
          title: "Delta locked",
          detail: "Cross-venue hedge online — opening vault",
        };
      default:
        return { title: "", detail: "" };
    }
  }, [activePhase, longDex, shortDex]);

  const spring = reduced
    ? { type: "tween" as const, duration: 0.12 }
    : { type: "spring" as const, stiffness: 380, damping: 28 };

  const glowLong =
    activePhase === "long" || activePhase === "done"
      ? "shadow-[0_0_0_1px_var(--vault-glow-long),0_0_26px_var(--vault-pulse-long)]"
      : "";

  const glowShort =
    activePhase === "short" || activePhase === "done"
      ? "shadow-[0_0_0_1px_var(--vault-glow-short),0_0_26px_var(--vault-pulse-short)]"
      : "";

  const longPulseKeyframes = [
    "0 0 0 0 rgba(95, 112, 98, 0)",
    "0 0 18px 2px rgba(95, 112, 98, 0.24)",
    "0 0 0 0 rgba(95, 112, 98, 0)",
  ];
  const shortPulseKeyframes = [
    "0 0 0 0 rgba(112, 82, 80, 0)",
    "0 0 18px 2px rgba(112, 82, 80, 0.22)",
    "0 0 0 0 rgba(112, 82, 80, 0)",
  ];

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
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={copy.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={reduced ? { duration: 0.1 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={clsx(
                "font-['Onest',sans-serif] text-[15px] font-semibold tracking-[0.18em] md:text-[16px]",
                isV2 ? "text-[#E8E2D2]" : "text-[#f5ecd8]",
              )}
            >
              {copy.title}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={copy.detail}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.08 : 0.22 }}
              className={clsx(
                "max-w-[340px] font-mono text-[11px] leading-relaxed md:text-[12px]",
                isV2 ? "text-[#888888]" : "text-[#9c9cac]",
              )}
            >
              {copy.detail}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mb-5 flex w-full max-w-[280px] items-center gap-2">
          {(["long", "short", "done"] as const).map(step => {
            const reached =
              step === "long"
                ? true
                : step === "short"
                  ? activePhase === "short" || activePhase === "done"
                  : activePhase === "done";
            const active =
              (step === "long" && activePhase === "long") ||
              (step === "short" && activePhase === "short") ||
              (step === "done" && activePhase === "done");
            return (
              <div key={step} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={clsx(
                    "h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]",
                    isV2 && "bg-[#1a1a1a]",
                  )}
                >
                  <motion.div
                    className={clsx(
                      "h-full origin-left rounded-full bg-gradient-to-r",
                      isV2 ? "from-[#9a8460] to-[#6b5a42]" : "from-[#b69b6a] to-[#7a6548]",
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: reached ? 1 : 0 }}
                    transition={reduced ? { duration: 0.05 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
                <span
                  className={clsx(
                    "text-[9px] font-semibold uppercase tracking-[0.14em]",
                    active
                      ? isV2
                        ? "text-[#c9a962]"
                        : "text-[#d6b06a]"
                      : "text-[#5c5d67]",
                  )}
                >
                  {step === "long" ? "Long" : step === "short" ? "Short" : "Lock"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex w-full max-w-[400px] items-center justify-center gap-1 md:gap-2">
          <motion.div
            className={clsx(
              "relative flex min-h-[168px] flex-1 flex-col items-center gap-2 rounded-[14px] border px-3 pb-3 pt-4 transition-shadow duration-300",
              isV2
                ? "border-[#2a2a2a] bg-[#0d0d0d]"
                : "border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,12,0.85)]",
              glowLong,
            )}
            initial={reduced ? false : { opacity: 0, x: -22, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={spring}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--vault-leg-long-fg)]">
              Long
            </span>
            <motion.div
              className={clsx(
                "flex h-11 w-11 items-center justify-center rounded-full border",
                isV2 ? "border-[color:var(--vault-check-long-border)] bg-[#080908]" : "border-[rgba(255,255,255,0.1)] bg-[#0a0a0a]",
              )}
              animate={
                reduced || activePhase !== "long"
                  ? {}
                  : { boxShadow: longPulseKeyframes }
              }
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity
                className="size-5 text-[color:var(--vault-leg-long-fg)]"
                strokeWidth={1.75}
                aria-hidden
              />
            </motion.div>
            <span
              className={clsx(
                "line-clamp-2 text-center font-mono text-[11px] leading-tight",
                isV2 ? "text-[#E8E2D2]" : "text-[#e8d5b5]",
              )}
            >
              {longDex}
            </span>
            <div className="min-h-[28px]">
              <AnimatePresence>
                {(activePhase === "long" || activePhase === "short" || activePhase === "done") && (
                  <motion.span
                    key="ck-long"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={reduced ? { duration: 0.08 } : { type: "spring", stiffness: 520, damping: 22 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--vault-check-long-border)] bg-[color:var(--vault-check-long-bg)] text-[color:var(--vault-check-long-fg)]"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="relative mx-0.5 flex h-[168px] w-[72px] shrink-0 flex-col items-center justify-center md:mx-1 md:w-[88px]">
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
                transition={{ duration: reduced ? 0.05 : 0.85, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id={`vaultBridge-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--vault-bridge-start)" />
                  <stop offset="50%" stopColor="var(--vault-bridge-mid)" />
                  <stop offset="100%" stopColor="var(--vault-bridge-end)" />
                </linearGradient>
              </defs>
            </svg>

            {!reduced && activePhase !== "done" && (
              <motion.div
                className={clsx(
                  "pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full",
                  isV2
                    ? "bg-[#b89a6e] shadow-[0_0_16px_rgba(184,154,110,0.55)]"
                    : "bg-[#c4a574] shadow-[0_0_16px_rgba(196,165,116,0.5)]",
                )}
                initial={{ left: "0%", x: "-50%" }}
                animate={
                  activePhase === "long"
                    ? { left: ["8%", "92%", "8%"] }
                    : activePhase === "short"
                      ? { left: ["92%", "8%", "92%"] }
                      : { left: "50%" }
                }
                transition={
                  activePhase === "long" || activePhase === "short"
                    ? { duration: 1.15, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              />
            )}

            <AnimatePresence>
              {activePhase === "done" && (
                <motion.div
                  key="shield"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0.1 } : { type: "spring", stiffness: 400, damping: 20 }}
                  className={clsx(
                    "absolute top-[46%] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2",
                    isV2
                      ? "border-[#c9a962]/80 bg-[#0a0a0a] text-[#c9a962]"
                      : "border-[#d6b06a]/80 bg-[#050505] text-[#d6b06a]",
                  )}
                >
                  <Shield className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className={clsx(
              "relative flex min-h-[168px] flex-1 flex-col items-center gap-2 rounded-[14px] border px-3 pb-3 pt-4 transition-shadow duration-300",
              isV2
                ? "border-[#2a2a2a] bg-[#0d0d0d]"
                : "border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,12,0.85)]",
              glowShort,
            )}
            initial={reduced ? false : { opacity: 0, x: 22, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...spring, delay: reduced ? 0 : 0.06 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--vault-leg-short-fg)]">
              Short
            </span>
            <motion.div
              className={clsx(
                "flex h-11 w-11 items-center justify-center rounded-full border",
                isV2 ? "border-[color:var(--vault-check-short-border)] bg-[#090808]" : "border-[rgba(255,255,255,0.1)] bg-[#0a0a0a]",
              )}
              animate={
                reduced || activePhase !== "short"
                  ? {}
                  : { boxShadow: shortPulseKeyframes }
              }
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity
                className="size-5 text-[color:var(--vault-leg-short-fg)]"
                strokeWidth={1.75}
                aria-hidden
              />
            </motion.div>
            <span
              className={clsx(
                "line-clamp-2 text-center font-mono text-[11px] leading-tight",
                isV2 ? "text-[#E8E2D2]" : "text-[#e8d5b5]",
              )}
            >
              {shortDex}
            </span>
            <div className="min-h-[28px]">
              <AnimatePresence>
                {(activePhase === "short" || activePhase === "done") && (
                  <motion.span
                    key="ck-short"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={reduced ? { duration: 0.08 } : { type: "spring", stiffness: 520, damping: 22 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--vault-check-short-border)] bg-[color:var(--vault-check-short-bg)] text-[color:var(--vault-check-short-fg)]"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.p
          className={clsx(
            "mt-6 max-w-[360px] text-center font-mono text-[10px] leading-relaxed md:text-[11px]",
            isV2 ? "text-[#666666]" : "text-[#717182]",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.15, duration: 0.35 }}
        >
          Parallel execution ties venues together — funding flows while spot exposure stays neutral.
        </motion.p>
      </motion.div>
    </div>
  );
}
