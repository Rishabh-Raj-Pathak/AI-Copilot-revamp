import { Check } from "lucide-react";
import { COPILOT_V2_GRADIENT_CSS } from "../strategyCopilotUi.js";

export const RECOMMENDED_FLOW_STEPS = [
  { id: "review", label: "Review Strategy" },
  { id: "backtest", label: "Run Backtest" },
  { id: "paper", label: "Paper Trade" },
  { id: "deploy", label: "Deploy" },
];

/** Derives recommended-flow step completion from strategy workstation state. */
export function getRecommendedFlowSteps(strategy) {
  const backtestDone = strategy?.backtest?.status === "complete";
  const paperDone = strategy?.paperTrading?.status === "active";
  const deployed = strategy?.deployment?.status === "active";

  return RECOMMENDED_FLOW_STEPS.map((step) => {
    let complete = false;
    if (step.id === "review") complete = Boolean(strategy);
    if (step.id === "backtest") complete = backtestDone;
    if (step.id === "paper") complete = paperDone;
    if (step.id === "deploy") complete = deployed;
    return { ...step, complete };
  });
}

function StepMarker({ complete }) {
  if (complete) {
    return (
      <span
        className="flex size-[22px] shrink-0 items-center justify-center rounded-full"
        style={{ background: COPILOT_V2_GRADIENT_CSS }}
        aria-hidden
      >
        <Check className="size-3 stroke-[2.5] text-[#030504]" />
      </span>
    );
  }

  return (
    <span
      className="size-[22px] shrink-0 rounded-full border border-[rgba(255,255,255,0.18)] bg-transparent"
      aria-hidden
    />
  );
}

function StepConnector() {
  return (
    <span
      className="mx-2 hidden h-px min-w-[1.25rem] flex-1 bg-[#2a2a2a] sm:block"
      aria-hidden
    />
  );
}

export default function RecommendedFlowStepper({ strategy, className = "" }) {
  const steps = getRecommendedFlowSteps(strategy);
  if (!steps.length) return null;

  return (
    <nav
      aria-label="Recommended flow"
      className={`flex flex-wrap items-center gap-y-2 ${className}`.trim()}
    >
      {steps.map((step, index) => (
        <div key={step.id} className="flex min-w-0 items-center">
          {index > 0 ? <StepConnector /> : null}
          <div className="flex shrink-0 items-center gap-2">
            <StepMarker complete={step.complete} />
            <span
              className={`whitespace-nowrap text-xs font-medium ${
                step.complete
                  ? "text-[rgba(255,255,255,0.92)]"
                  : "text-[rgba(255,255,255,0.38)]"
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </nav>
  );
}
