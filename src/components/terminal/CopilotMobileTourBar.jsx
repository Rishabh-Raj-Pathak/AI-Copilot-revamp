import {
  COPILOT_MOBILE_TOUR_STEP_COUNT,
  getCopilotMobileTourStep,
} from "../../copilot/copilotMobileTourUi.js";

/**
 * Fixed bottom coach for mobile product tour (spotlight via driver.js).
 * Shell matches desktop `.hyprearn-copilot-driver-popover`; only copy/progress change per step.
 */
export default function CopilotMobileTourBar({
  stepIndex,
  tradeSheetStep = false,
  onNext,
  onPrevious,
  onSkip,
}) {
  const step = getCopilotMobileTourStep(stepIndex);
  if (!step) return null;

  const bottomClass = tradeSheetStep
    ? "bottom-[max(0.5rem,env(safe-area-inset-bottom))]"
    : "bottom-[calc(4.25rem+env(safe-area-inset-bottom)+0.375rem)]";

  return (
    <div
      className={`copilot-mobile-tour-bar pointer-events-auto fixed inset-x-0 z-[1000000002] flex max-tablet:flex tablet:hidden ${bottomClass}`}
      role="region"
      aria-live="polite"
      aria-label="Tutorial"
    >
      <div className="copilot-mobile-tour-card mx-3 w-[calc(100%-1.5rem)]">
        <div className="copilot-mobile-tour-card__header">
          <h2
            id="copilot-mobile-tour-title"
            className="copilot-mobile-tour-card__title"
            key={`title-${stepIndex}`}
          >
            {step.title}
          </h2>
          <button
            type="button"
            className="copilot-mobile-tour-card__skip"
            onClick={() => onSkip?.()}
          >
            Skip
          </button>
        </div>

        <p
          className="copilot-mobile-tour-card__description"
          key={`body-${stepIndex}`}
        >
          {step.body}
        </p>

        <div
          className="hyprearn-tour-step-segments copilot-mobile-tour-card__segments"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={COPILOT_MOBILE_TOUR_STEP_COUNT}
          aria-valuenow={stepIndex + 1}
          aria-label={`Tutorial step ${stepIndex + 1} of ${COPILOT_MOBILE_TOUR_STEP_COUNT}`}
        >
          {Array.from({ length: COPILOT_MOBILE_TOUR_STEP_COUNT }, (_, i) => (
            <span
              key={i}
              className={
                i === stepIndex
                  ? "hyprearn-tour-step-segment hyprearn-tour-step-segment--active"
                  : "hyprearn-tour-step-segment"
              }
              aria-hidden
            />
          ))}
        </div>

        <div className="copilot-mobile-tour-card__footer">
          <button
            type="button"
            className="copilot-mobile-tour-card__prev"
            onClick={() => onPrevious?.()}
            disabled={!step.showPrevious}
            aria-hidden={!step.showPrevious}
            tabIndex={step.showPrevious ? 0 : -1}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="copilot-mobile-tour-card__next ds-terminal-gradient-cta"
            onClick={() => onNext?.()}
            disabled={!step.showNext}
            aria-hidden={!step.showNext}
            tabIndex={step.showNext ? 0 : -1}
          >
            {step.nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
