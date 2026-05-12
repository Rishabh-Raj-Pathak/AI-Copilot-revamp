import { driver } from "driver.js";

export const COPILOT_TOUR_STORAGE_KEY = "hyprearn_copilot_tour_completed";

export function isCopilotTourCompleted() {
  try {
    return localStorage.getItem(COPILOT_TOUR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markCopilotTourCompleted() {
  try {
    localStorage.setItem(COPILOT_TOUR_STORAGE_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

/** @type {import('driver.js').Driver | null} */
let activeTourDriver = null;

let suppressTourCompletionMark = false;

function destroyActiveTourDriverSilently() {
  if (!activeTourDriver) return;
  suppressTourCompletionMark = true;
  try {
    activeTourDriver.destroy();
  } catch {
    /* noop */
  } finally {
    suppressTourCompletionMark = false;
    activeTourDriver = null;
  }
}

function queryTourTarget(selector) {
  if (!selector) return null;
  return document.querySelector(selector);
}

/**
 * Builds driver.js steps from visible `[data-tour]` targets.
 * Steps without a selector use the library center target (no layout element).
 */
function buildCopilotTourSteps() {
  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      selector: '[data-tour="copilot-overview"]',
      popover: {
        title: "Meet AI Copilot",
        description:
          "AI Copilot turns live perp market signals into simple trade plans.",
        side: "bottom",
        align: "start",
      },
    },
    {
      selector: '[data-tour="dex-selector"]',
      popover: {
        title: "Choose your DEX",
        description: "Pick where you want to trade. Use Hyperliquid or Pacifica.",
        side: "bottom",
        align: "end",
      },
    },
    {
      selector: '[data-tour="wallet-connect"]',
      popover: {
        title: "Connect your wallet",
        description: "Your wallet links Copilot to your trading account.",
        side: "bottom",
        align: "end",
      },
    },
    {
      selector: null,
      popover: {
        title: "Enable execution",
        description:
          "This lets HyprEarn prepare trades you approve. Withdrawals are not enabled.",
        side: "over",
        align: "center",
      },
    },
    {
      selector: '[data-tour="ai-setup-card"]',
      popover: {
        title: "Review AI setups",
        description:
          "Each setup shows the idea, entry, stop-loss, targets, size and risk-reward.",
        side: "bottom",
        align: "start",
      },
    },
    {
      selector: '[data-tour="risk-details"]',
      popover: {
        title: "Check risk first",
        description:
          "Review max loss, stop-loss and leverage before placing a trade.",
        side: "left",
        align: "start",
      },
    },
    {
      selector: '[data-tour="trade-review"]',
      popover: {
        title: "Approve the trade",
        description:
          "Copilot prepares the plan. You review and approve before execution.",
        side: "top",
        align: "center",
      },
    },
    {
      selector: '[data-tour="position-tracking"]',
      popover: {
        title: "Track results",
        description:
          "After execution, track your position, targets, stop-loss and PnL here.",
        side: "top",
        align: "start",
      },
    },
    {
      selector: '[data-tour="copilot-overview"]',
      popover: {
        title: "You're ready",
        description:
          "Choose your DEX, connect your wallet and review your first AI-guided setup.",
        side: "bottom",
        align: "start",
        doneBtnText: "Done",
      },
    },
  ];

  const steps = [];
  for (const row of blueprint) {
    const el = row.selector ? queryTourTarget(row.selector) : null;
    if (row.selector && !el) continue;
    steps.push({
      element: el ?? undefined,
      popover: {
        ...row.popover,
        showButtons: ["next", "previous", "close"],
      },
    });
  }
  return steps;
}

/**
 * @returns {(() => void) | null} cleanup to destroy the active driver, or null if nothing started
 */
export function startCopilotProductTour() {
  destroyActiveTourDriverSilently();

  const steps = buildCopilotTourSteps();
  if (steps.length === 0) return null;

  const d = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.72,
    overlayColor: "#000",
    showProgress: true,
    progressText: "{{current}} of {{total}}",
    showButtons: ["next", "previous", "close"],
    popoverClass: "hyprearn-copilot-driver-popover",
    onPopoverRender: (popover) => {
      popover.closeButton.textContent = "Skip tour";
      popover.closeButton.setAttribute("aria-label", "Skip tour");
    },
    onCloseClick: (_el, _step, { driver: drv }) => {
      drv.destroy();
    },
    onDestroyed: () => {
      activeTourDriver = null;
      if (!suppressTourCompletionMark) {
        markCopilotTourCompleted();
      }
    },
    steps,
  });

  activeTourDriver = d;
  d.drive(0);
  return () => {
    destroyActiveTourDriverSilently();
  };
}
