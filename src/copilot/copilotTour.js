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

  const drv = activeTourDriver;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (!drv.isActive?.()) return;
        drv.destroy();
      } catch {
        /* noop */
      }
    });
  });

  return true;
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

/**
 * @param {import('driver.js').PopoverDOM} popover
 * @param {CopilotProductTourHandlers} handlers
 * @param {{ driver: import('driver.js').Driver }} opts
 */
function mountSuggestionExploreAction(popover, handlers, opts) {
  const row = document.createElement("div");
  row.dataset.hyprearnTourUi = "1";
  row.className = "hyprearn-tour-popover-extra";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hyprearn-tour-secondary-action";
  btn.textContent = "Explore Other Suggestions";
  let busy = false;
  btn.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    void (async () => {
      try {
        await handlers.cycleTourSuggestion?.();
      } catch {
        /* graceful — keep tour usable */
      } finally {
        busy = false;
        btn.disabled = false;
        if (opts.driver.isActive()) opts.driver.refresh();
      }
    })();
  });
  row.appendChild(btn);
  popover.footer.insertBefore(row, popover.footer.firstChild);
}

/**
 * @param {import('driver.js').PopoverDOM} popover
 * @param {{ driver: import('driver.js').Driver }} opts
 */
function mountExploreMoreAction(popover, opts) {
  const row = document.createElement("div");
  row.dataset.hyprearnTourUi = "1";
  row.className = "hyprearn-tour-popover-extra";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hyprearn-tour-secondary-action";
  btn.textContent = "Explore More";
  btn.addEventListener("click", () => {
    opts.driver.destroy();
  });
  row.appendChild(btn);
  popover.footer.insertBefore(row, popover.footer.firstChild);
}

/**
 * @typedef {object} CopilotProductTourHandlers
 * @property {(index: number) => void} [onStepIndexChange]
 * Active step index while driving, or `-1` when the tour is not active.
 * @property {() => void | Promise<void>} [prepareSuggestionTourStep]
 * When entering the suggestions step: ensure a setup is opened and allow layout to settle.
 * @property {() => void | Promise<void>} [cycleTourSuggestion]
 * User-triggered: advance to the next real suggestion in UI order (deterministic).
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
        title: "Your AI Copilot",
        description:
          "Ideas for entries, targets, and risk—drafted for you. You choose what to use; nothing moves until you say so.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
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
        title: "Pick Your Venue",
        description:
          "Switch DEXs anytime—same workflow. Try another venue now, or continue when you are ready.",
        side: "bottom",
        align: "end",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: () => document.querySelector('[data-tour="copilot-suggestions-list"]'),
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
        title: "More Than One Idea",
        description:
          "Copilot surfaces multiple setups—each a different read on the market. Open one to preview details on the right.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: () => document.querySelector('[data-tour="copilot-trade-setup"]'),
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Make It Yours",
        description:
          "Tweak leverage, targets, stop, and size like you normally would. Nothing executes until you confirm.",
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
        title: "When You Are Ready",
        description:
          "There is no rush—review, adjust, or keep exploring. When you are ready, use Open trade to place the position; we will confirm it in a quick summary.",
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
          popover.closeButton.textContent = "Close";
          popover.closeButton.setAttribute("aria-label", "Close guided tour");
          removeHyprearnTourPopoverExtras(popover);
          if (stepIndex === 2) mountSuggestionExploreAction(popover, handlers, opts);
          if (stepIndex === 4) mountExploreMoreAction(popover, opts);
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
    /** Clicks on the dimmed overlay must not end the tour — only Close / Done / Explore More. */
    overlayClickBehavior: () => {},
    disableActiveInteraction: false,
    overlayOpacity: 0.66,
    overlayColor: "#000",
    showProgress: true,
    progressText: "{{current}} of {{total}}",
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
