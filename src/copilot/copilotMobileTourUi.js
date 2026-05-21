/**
 * Mobile-only tour coach bar content (variant 2, steps 0–5).
 * Titles match desktop driver popover; bodies use narrow/mobile-friendly copy.
 */

export const COPILOT_MOBILE_TOUR_STEP_COUNT = 6;

/** @type {readonly { title: string; body: string; nextLabel: string; showNext: boolean; showPrevious: boolean }[]} */
export const COPILOT_MOBILE_TOUR_STEPS = [
  {
    title: "AI-Copilot",
    body: "AI-Copilot builds complete trade setups—entry, target, and stop loss included. You stay in control, always.",
    nextLabel: "Let's go",
    showNext: true,
    showPrevious: false,
  },
  {
    title: "Select Dex",
    body: "One workflow, multiple DEXs. Switch exchanges instantly without changing how you trade.",
    nextLabel: "Next",
    showNext: true,
    showPrevious: true,
  },
  {
    title: "Review Trade Setup",
    body: "Tap a setup card in the list to select it.",
    nextLabel: "Next",
    showNext: true,
    showPrevious: true,
  },
  {
    title: "Backtest",
    body: "Tap Backtest on the selected card.",
    nextLabel: "Next",
    showNext: true,
    showPrevious: true,
  },
  {
    title: "Customize Your Trade",
    body: "Tune size, leverage, and exits here.",
    nextLabel: "Next",
    showNext: true,
    showPrevious: true,
  },
  {
    title: "Place your first trade",
    body: "Tap the highlighted button below to place your demo trade.",
    nextLabel: "Next",
    showNext: false,
    showPrevious: true,
  },
];

/**
 * @param {number} stepIndex
 * @returns {typeof COPILOT_MOBILE_TOUR_STEPS[number] | null}
 */
export function getCopilotMobileTourStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= COPILOT_MOBILE_TOUR_STEPS.length) {
    return null;
  }
  return COPILOT_MOBILE_TOUR_STEPS[stepIndex];
}
