import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useCopilotTheme } from "./StrategyCopilotContext.jsx";
import { COPILOT_V2_GRADIENT_CSS } from "./strategyCopilotUi.js";
import { v3SectionTitle } from "./workstation/V3TabLayout.jsx";

const STAGGER_DELAY_CHILDREN = 0.06;
const STAGGER_CHILDREN = 0.07;
const STEP_ACTIVE_MS = 680;
const LOOP_PAUSE_MS = 1100;
const ENTRANCE_TAIL_S = 0.24;

/** Silk spring for step states (marker, text, opacity). */
const FLOW_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.82,
};

const MARKER_GLOW =
  "0 0 12px rgba(0, 243, 182, 0.22), 0 0 4px rgba(242, 181, 0, 0.14)";

function entranceDelayMs(stepCount) {
  return (
    (STAGGER_DELAY_CHILDREN +
      Math.max(stepCount - 1, 0) * STAGGER_CHILDREN +
      ENTRANCE_TAIL_S) *
    1000
  );
}

function useFlowActiveIndex(stepCount, reducedMotion, enabled) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setActiveIndex(0);
      return undefined;
    }

    if (reducedMotion || stepCount < 1) return undefined;

    let timeoutId;
    let index = 0;

    const tick = () => {
      setActiveIndex(index);
      const isLast = index >= stepCount - 1;
      const delay = isLast ? STEP_ACTIVE_MS + LOOP_PAUSE_MS : STEP_ACTIVE_MS;
      index = isLast ? 0 : index + 1;
      timeoutId = window.setTimeout(tick, delay);
    };

    setActiveIndex(0);
    timeoutId = window.setTimeout(tick, entranceDelayMs(stepCount));
    return () => window.clearTimeout(timeoutId);
  }, [stepCount, reducedMotion, enabled]);

  return activeIndex;
}

function targetPercentForIndex(index, stepCount) {
  if (stepCount <= 1) return 100;
  return (index / (stepCount - 1)) * 100;
}

function stepIndexAtProgress(progressPercent, stepCount) {
  if (stepCount <= 1) return progressPercent > 0 ? 0 : -1;
  for (let i = stepCount - 1; i >= 0; i -= 1) {
    if (progressPercent >= targetPercentForIndex(i, stepCount) - 0.25) {
      return i;
    }
  }
  return -1;
}

function isStepTouched(stepIndex, progressPercent, stepCount) {
  if (stepCount <= 1) return stepIndex === 0 && progressPercent >= 99.5;
  return progressPercent >= targetPercentForIndex(stepIndex, stepCount) - 0.25;
}

/** Line height + marker fill share one linear progress value (frame-synced). */
function useLineProgress(stepCount, targetIndex, enabled, reducedMotion) {
  const [fillPercent, setFillPercent] = useState(0);
  const fillRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (!enabled || stepCount < 1) {
      fillRef.current = 0;
      setFillPercent(0);
      return undefined;
    }

    const target = targetPercentForIndex(targetIndex, stepCount);

    if (reducedMotion) {
      fillRef.current = target;
      setFillPercent(target);
      return undefined;
    }

    const start = fillRef.current;
    const startTime = performance.now();

    const frame = (now) => {
      const t = Math.min(1, (now - startTime) / STEP_ACTIVE_MS);
      const current = start + (target - start) * t;
      fillRef.current = current;
      setFillPercent(current);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetIndex, stepCount, enabled, reducedMotion]);

  const touchedIndex = stepIndexAtProgress(fillPercent, stepCount);

  return { fillPercent, touchedIndex };
}

function VerticalTimelineTrack({ fillPercent, reducedMotion }) {
  return (
    <div
      className="pointer-events-none absolute bottom-5 left-4 top-5 z-0 w-px -translate-x-1/2"
      aria-hidden
    >
      <div className="absolute inset-0 bg-white/6" />
      <div
        className="absolute left-0 top-0 w-full origin-top transition-none"
        style={{
          height: `${fillPercent}%`,
          background: COPILOT_V2_GRADIENT_CSS,
          opacity: reducedMotion ? 0.35 : 0.7,
        }}
      />
    </div>
  );
}

function StepMarker({ index, isActive, isFilled, reducedMotion }) {
  return (
    <motion.span
      className={`relative z-2 isolate flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
        isFilled ? "text-[#030504]" : "text-[rgba(255,255,255,0.36)]"
      }`}
      animate={{
        scale: 1,
        boxShadow: isActive && !reducedMotion ? MARKER_GLOW : "none",
      }}
      transition={FLOW_SPRING}
    >
      {isFilled ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: COPILOT_V2_GRADIENT_CSS }}
          initial={false}
          animate={{ opacity: isActive ? 1 : 0.88 }}
          transition={FLOW_SPRING}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-white/[0.07] bg-[#050706] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        />
      )}
      <span className="relative z-1">{index + 1}</span>
    </motion.span>
  );
}

function FlowTimeline({ steps, titleClassName, shellClassName = "" }) {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, {
    amount: 0.25,
    margin: "0px 0px -48px 0px",
  });
  const loopEnabled = isInView && !reducedMotion;
  const activeIndex = useFlowActiveIndex(
    steps.length,
    reducedMotion,
    loopEnabled,
  );
  const { fillPercent, touchedIndex } = useLineProgress(
    steps.length,
    activeIndex,
    loopEnabled,
    reducedMotion,
  );

  return (
    <section ref={sectionRef} className={shellClassName}>
      <h4 className={titleClassName}>Strategy flow</h4>

      <div className="relative mt-8 sm:mt-9">
        <VerticalTimelineTrack
          fillPercent={fillPercent}
          reducedMotion={reducedMotion}
        />

        <ol className="relative z-1 m-0 list-none p-0">
          {steps.map((item, i) => {
            const isFilled = isStepTouched(i, fillPercent, steps.length);
            const isActive = i === touchedIndex;
            const isPast = touchedIndex >= 0 && i < touchedIndex;

            return (
              <li
                key={`${item.step}-${i}`}
                className={`relative flex gap-5 sm:gap-6 ${
                  i < steps.length - 1 ? "pb-10 sm:pb-12" : ""
                }`}
              >
                <div className="relative z-2 flex shrink-0">
                <StepMarker
                  index={i}
                  isActive={isActive}
                  isFilled={isFilled}
                  reducedMotion={reducedMotion}
                />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <motion.p
                    className="text-[13px] font-semibold leading-snug tracking-tight sm:text-sm"
                    animate={{
                      color: isActive
                        ? "rgba(255, 255, 255, 0.96)"
                        : isPast
                          ? "rgba(255, 255, 255, 0.72)"
                          : "rgba(255, 255, 255, 0.68)",
                    }}
                    transition={FLOW_SPRING}
                  >
                    {item.step}
                  </motion.p>
                  <motion.p
                    className="mt-2 max-w-prose text-[12px] leading-relaxed sm:text-[13px] sm:leading-[1.65]"
                    animate={{
                      color: isActive
                        ? "rgba(255, 255, 255, 0.72)"
                        : isPast
                          ? "rgba(255, 255, 255, 0.48)"
                          : "rgba(255, 255, 255, 0.42)",
                    }}
                    transition={FLOW_SPRING}
                  >
                    {item.detail}
                  </motion.p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default function StrategyFlowStepper({ steps }) {
  const theme = useCopilotTheme();
  if (!steps?.length) return null;

  if (theme.isV3) {
    return (
      <FlowTimeline
        steps={steps}
        titleClassName={v3SectionTitle}
        shellClassName="border-b border-white/6 py-6 sm:py-8"
      />
    );
  }

  if (theme.isV2) {
    return (
      <FlowTimeline
        steps={steps}
        titleClassName="text-sm font-medium text-[rgba(255,255,255,0.88)]"
        shellClassName="py-6 sm:py-7"
      />
    );
  }

  return (
    <div className={theme.flowCard}>
      <h4 className="text-sm font-bold text-white">Strategy flow</h4>
      <ol className="relative mt-8 list-none space-y-0 p-0 pl-1">
        {steps.map((item, i) => (
          <li
            key={item.step}
            className={`relative flex gap-4 ${
              i < steps.length - 1 ? "pb-8" : ""
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#333] bg-[#0a0a0a] text-[10px] font-bold text-[#757575]">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#929292]">
                {item.step}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#757575]">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
