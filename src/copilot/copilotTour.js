import { driver } from "driver.js";

export const COPILOT_TOUR_STORAGE_KEY = "hyprearn_copilot_tour_completed";

export function isCopilotTourCompleted() {
  try {
    return localStorage.getItem(COPILOT_TOUR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Re-query highlight geometry after async UI (DEX switch, suggestion change, form edits). */
export function refreshCopilotTourIfActive() {
  try {
    activeTourDriver?.refresh?.();
  } catch {
    /* noop */
  }
}

/**
 * Call after the terminal venue id updates from user input.
 * When the tour is on the multi-DEX step and the id differs from the step baseline, advances automatically.
 */
export function notifyCopilotTourTerminalPlatformChanged(platformId) {
  try {
    if (!activeTourDriver?.isActive?.()) return;
    const i = activeTourDriver.getActiveIndex();
    if (i !== 1) return;
    if (platformId === tourDexBaselinePlatformId) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          if (!activeTourDriver?.isActive?.()) return;
          if (activeTourDriver.getActiveIndex() !== 1) return;
          activeTourDriver.refresh?.();
          activeTourDriver.moveNext?.();
        } catch {
          /* noop */
        }
      });
    });
  } catch {
    /* noop */
  }
}

const OPEN_TRADE_TOUR_STEP_INDEX = 4;

/**
 * When the user clicks the primary open-trade CTA on the final tour step, end the
 * guided tour (success modal + dock row are handled by the page).
 * @returns {boolean} true if the tour was active on the open-trade step
 */
export function advanceCopilotTourToPositionsFromOpenTradeClick() {
  if (!activeTourDriver?.isActive?.()) return false;
  const i = activeTourDriver.getActiveIndex();
  if (typeof i !== "number" || i !== OPEN_TRADE_TOUR_STEP_INDEX) return false;

  try {
    if (activeTourDriver.isActive?.()) activeTourDriver.destroy();
  } catch {
    /* noop */
  }

  return true;
}

/**
 * If the guided tour is still active when the trade-success modal is shown (e.g. user
 * was not on the final step), tear it down so `body.driver-active` is cleared.
 * driver.js sets `pointer-events: none` on almost the whole page while active, which
 * blocks taps on the success overlay until the driver is destroyed.
 */
export function destroyCopilotProductTourIfStillActive() {
  if (!activeTourDriver?.isActive?.()) return;
  try {
    activeTourDriver.destroy();
  } catch {
    /* noop */
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

/** @type {CopilotProductTourHandlers | null} */
let activeTourHandlers = null;

/** Venue id when DEX tour step (index 1) was entered — auto-advance only after a real change. */
let tourDexBaselinePlatformId = null;

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

/** @param {import('driver.js').PopoverDOM} popover */
function removeHyprearnTourPopoverExtras(popover) {
  popover.footer
    .querySelectorAll("[data-hyprearn-tour-ui]")
    .forEach((n) => n.remove());
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** @param {HTMLButtonElement} closeButton */
function mountTourCloseIcon(closeButton) {
  closeButton.textContent = "";
  closeButton.replaceChildren();
  closeButton.setAttribute("aria-label", "Close guided tour");
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "12");
  svg.setAttribute("height", "12");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const p1 = document.createElementNS(SVG_NS, "path");
  p1.setAttribute("d", "M18 6 6 18");
  const p2 = document.createElementNS(SVG_NS, "path");
  p2.setAttribute("d", "m6 6 12 12");
  svg.append(p1, p2);
  closeButton.appendChild(svg);
}

/** @param {HTMLElement} wrapper @param {import('driver.js').Popover | undefined} popoverConfig */
function setHyprearnTourPopoverBeakDataset(wrapper, popoverConfig) {
  const s = popoverConfig?.side;
  if (s === "top" || s === "bottom" || s === "left" || s === "right") {
    wrapper.dataset.hyprearnArrowSide = s;
  } else if (s === "over") {
    delete wrapper.dataset.hyprearnArrowSide;
  } else {
    wrapper.dataset.hyprearnArrowSide = "bottom";
  }
}

/**
 * @typedef {object} CopilotProductTourHandlers
 * @property {(index: number) => void} [onStepIndexChange]
 * Active step index while driving, or `-1` when the tour is not active.
 * @property {() => void | Promise<void>} [prepareSuggestionTourStep]
 * When entering the suggestions step: ensure a setup is opened and allow layout to settle.
 * @property {() => void | Promise<void>} [onSimulateFirstTrade]
 * Reserved for tour flows that need to stage UI before advancing (unused on the final open-trade step).
 * @property {() => string | null | undefined} [getTerminalPlatformId]
 * Current venue id (for DEX step baseline and auto-advance).
 */

/**
 * @param {CopilotProductTourHandlers} handlers
 * @returns {import('driver.js').DriveStep[]}
 */
function buildCopilotTourSteps(handlers) {
  const prepareSuggestionTourStep = handlers.prepareSuggestionTourStep;

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      element: '[data-tour="copilot-overview"]',
      popover: {
        title: "Meet HyprEarn Copilot",
        description:
          "Copilot trade setups with entries, targets and risk levels. You approve every trade before it goes live.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Let's go",
      },
    },
    {
      element: '[data-tour="dex-selector"]',
      disableActiveInteraction: false,
      onHighlighted: (_el, _step, { driver: drv }) => {
        tourDexBaselinePlatformId = handlers.getTerminalPlatformId?.() ?? null;
        requestAnimationFrame(() => {
          if (drv.isActive()) drv.refresh();
        });
      },
      popover: {
        title: "Trade across DEXs",
        description:
          "Switch venues anytime without changing your workflow. Copilot works the same way across supported DEXs.",
        side: "bottom",
        align: "end",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="copilot-suggestions-list"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        void (async () => {
          try {
            if (typeof prepareSuggestionTourStep === "function") {
              await prepareSuggestionTourStep();
            }
          } catch {
            /* keep tour alive */
          } finally {
            if (drv.isActive()) drv.refresh();
          }
        })();
      },
      popover: {
        title: "Review suggested setups",
        description:
          "Each card is a different AI setup. Open one to inspect and customize the trade.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="copilot-trade-setup"]'),
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Tune the trade",
        description:
          "Adjust leverage, size, stops and targets to match your risk profile. Nothing goes live until you confirm it.",
        side: "left",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: () => document.querySelector('[data-tour="trade-open-cta"]'),
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Place your first trade",
        description: "Congrats, your setup is ready. Place your first trade.",
        side: "top",
        align: "center",
        showButtons: ["previous", "close"],
      },
    },
  ];

  return blueprint.map((row, stepIndex) => {
    const { popover: rowPopover, ...rest } = row;
    return {
      ...rest,
      popover: {
        showButtons: ["next", "previous", "close"],
        ...rowPopover,
        onPopoverRender: (popover, opts) => {
          mountTourCloseIcon(popover.closeButton);
          popover.nextButton?.classList?.add("ds-terminal-gradient-cta");
          removeHyprearnTourPopoverExtras(popover);
          setHyprearnTourPopoverBeakDataset(popover.wrapper, rowPopover);
          rowPopover?.onPopoverRender?.(popover, opts);
        },
      },
    };
  });
}

/**
 * @param {CopilotProductTourHandlers} [handlers]
 * @returns {(() => void) | null} cleanup to destroy the active driver, or null if nothing started
 */
export function startCopilotProductTour(handlers = {}) {
  destroyActiveTourDriverSilently();
  tourDexBaselinePlatformId = null;
  activeTourHandlers = handlers;

  const steps = buildCopilotTourSteps(handlers);
  if (steps.length === 0) {
    activeTourHandlers = null;
    return null;
  }

  const d = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    /** Clicks on the dimmed overlay must not end the tour — only Close / footer actions. */
    overlayClickBehavior: () => {},
    disableActiveInteraction: false,
    overlayOpacity: 0.66,
    overlayColor: "#000",
    showProgress: true,
    progressText: "Step {{current}} of {{total}}",
    showButtons: ["next", "previous", "close"],
    popoverClass: "hyprearn-copilot-driver-popover",
    popoverOffset: 14,
    onCloseClick: (_el, _step, { driver: drv }) => {
      drv.destroy();
    },
    onHighlighted: (_el, _step, { driver: drv }) => {
      const i = drv.getActiveIndex();
      activeTourHandlers?.onStepIndexChange?.(typeof i === "number" ? i : -1);
    },
    onDestroyed: () => {
      activeTourHandlers?.onStepIndexChange?.(-1);
      activeTourDriver = null;
      activeTourHandlers = null;
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
