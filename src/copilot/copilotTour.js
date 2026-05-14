import { driver } from "driver.js";

/** @typedef {'copilot-tour-1' | 'copilot-tour-2'} CopilotProductTourVariant */

export const COPILOT_TOUR_VARIANT_1 = "copilot-tour-1";
export const COPILOT_TOUR_VARIANT_2 = "copilot-tour-2";

export const COPILOT_TOUR_1_STORAGE_KEY = "hyprearn_copilot_tour_1_completed";
export const COPILOT_TOUR_2_STORAGE_KEY = "hyprearn_copilot_tour_2_completed";

/** @deprecated Use {@link COPILOT_TOUR_2_STORAGE_KEY}; kept for older localStorage reads. */
export const COPILOT_TOUR_STORAGE_KEY = "hyprearn_copilot_tour_completed";

export function isCopilotTour1Completed() {
  try {
    return localStorage.getItem(COPILOT_TOUR_1_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isCopilotTour2Completed() {
  try {
    if (localStorage.getItem(COPILOT_TOUR_2_STORAGE_KEY) === "1") return true;
    return localStorage.getItem(COPILOT_TOUR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** @returns {boolean} Legacy helper: same as {@link isCopilotTour2Completed}. */
export function isCopilotTourCompleted() {
  return isCopilotTour2Completed();
}

/** @returns {CopilotProductTourVariant | null} */
export function getActiveCopilotTourVariant() {
  return activeTourVariant;
}

/** @returns {number} Active driver step index, or `-1` if no tour. */
export function getActiveCopilotTourStepIndex() {
  try {
    const i = activeTourDriver?.getActiveIndex?.();
    return typeof i === "number" ? i : -1;
  } catch {
    return -1;
  }
}

/** Driver index of the Backtest spotlight (highlights the control; modal opens only if the user clicks). */
const VIEW_THESIS_STEP_INDEX_TOUR1 = 3;
const VIEW_THESIS_STEP_INDEX_TOUR2 = 2;

/**
 * True when the active tour is on the step that spotlights **Backtest** (the button).
 * - User can press tour **Next** without opening the modal.
 * - If they open the modal then close it, the page should call {@link advanceCopilotTourMoveNextIfActive}.
 */
export function isCopilotTourOnViewThesisStep() {
  if (!activeTourDriver?.isActive?.()) return false;
  const i = activeTourDriver.getActiveIndex();
  if (activeTourVariant === COPILOT_TOUR_VARIANT_1)
    return i === VIEW_THESIS_STEP_INDEX_TOUR1;
  if (activeTourVariant === COPILOT_TOUR_VARIANT_2)
    return i === VIEW_THESIS_STEP_INDEX_TOUR2;
  return false;
}

/** Advance one driver step while the tour is active (after thesis modal closes on the Backtest step). */
export function advanceCopilotTourMoveNextIfActive() {
  try {
    if (!activeTourDriver?.isActive?.()) return false;
    activeTourDriver.moveNext?.();
    return true;
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
        void (async () => {
          try {
            if (!activeTourDriver?.isActive?.()) return;
            if (activeTourDriver.getActiveIndex() !== 1) return;
            activeTourDriver.refresh?.();
            const h = activeTourHandlers;
            if (typeof h?.prepareSuggestionTourStep === "function") {
              await h.prepareSuggestionTourStep();
            }
          } catch {
            /* noop */
          } finally {
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
          }
        })();
      });
    });
  } catch {
    /* noop */
  }
}

const OPEN_TRADE_TOUR_STEP_INDEX_TOUR1 = 5;
const OPEN_TRADE_TOUR_STEP_INDEX_TOUR2 = 4;

/**
 * When the user clicks the primary open-trade CTA on the final tour step, end the
 * guided tour (success modal + dock row are handled by the page).
 * @returns {boolean} true if the tour was active on the open-trade step
 */
export function advanceCopilotTourToPositionsFromOpenTradeClick() {
  if (!activeTourDriver?.isActive?.()) return false;
  const i = activeTourDriver.getActiveIndex();
  if (typeof i !== "number") return false;
  const expected =
    activeTourVariant === COPILOT_TOUR_VARIANT_1
      ? OPEN_TRADE_TOUR_STEP_INDEX_TOUR1
      : OPEN_TRADE_TOUR_STEP_INDEX_TOUR2;
  if (i !== expected) return false;

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
 *
 * @param {{ skipCompletionMark?: boolean }} [opts]
 */
export function destroyCopilotProductTourIfStillActive(opts = {}) {
  if (!activeTourDriver?.isActive?.()) return;
  if (opts.skipCompletionMark) suppressTourCompletionMark = true;
  try {
    activeTourDriver.destroy();
  } catch {
    /* noop */
  } finally {
    if (opts.skipCompletionMark) suppressTourCompletionMark = false;
  }
}

/**
 * @param {CopilotProductTourVariant} variant
 */
function markTourVariantCompleted(variant) {
  try {
    if (variant === COPILOT_TOUR_VARIANT_1) {
      localStorage.setItem(COPILOT_TOUR_1_STORAGE_KEY, "1");
    } else if (variant === COPILOT_TOUR_VARIANT_2) {
      localStorage.setItem(COPILOT_TOUR_2_STORAGE_KEY, "1");
      localStorage.removeItem(COPILOT_TOUR_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

/** @type {import('driver.js').Driver | null} */
let activeTourDriver = null;

let suppressTourCompletionMark = false;

/** @type {CopilotProductTourHandlers | null} */
let activeTourHandlers = null;

/** @type {CopilotProductTourVariant | null} */
let activeTourVariant = null;

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
  popover.wrapper
    .querySelectorAll("[data-hyprearn-tour-ui]")
    .forEach((n) => n.remove());
}

/**
 * Capsule segment bar below description, above footer (step count + nav). Rebuilt each popover render.
 * @param {import('driver.js').PopoverDOM} popover
 * @param {{ driver?: import('driver.js').Driver }} opts
 */
function mountHyprearnTourStepSegments(popover, opts) {
  const drv = opts?.driver;
  const steps = drv?.getConfig?.()?.steps;
  const total = Array.isArray(steps) ? steps.length : 0;
  const rawIdx = drv?.getActiveIndex?.();
  const idx =
    typeof rawIdx === "number" && rawIdx >= 0 ? Math.min(rawIdx, total - 1) : 0;

  const wrapper = popover.wrapper;
  const footer = popover.footer;
  if (!wrapper || !footer || total <= 0) return;

  const bar = document.createElement("div");
  bar.className = "hyprearn-tour-step-segments";
  bar.setAttribute("data-hyprearn-tour-ui", "");
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-valuemin", "1");
  bar.setAttribute("aria-valuemax", String(total));
  bar.setAttribute("aria-valuenow", String(idx + 1));
  bar.setAttribute("aria-label", `Guided tour step ${idx + 1} of ${total}`);

  for (let i = 0; i < total; i++) {
    const seg = document.createElement("span");
    seg.className =
      i === idx
        ? "hyprearn-tour-step-segment hyprearn-tour-step-segment--active"
        : "hyprearn-tour-step-segment";
    bar.appendChild(seg);
  }

  wrapper.insertBefore(bar, footer);
}

/** @param {HTMLButtonElement} closeButton */
function mountTourSkipLabel(closeButton) {
  closeButton.replaceChildren();
  closeButton.textContent = "Skip";
  closeButton.setAttribute("aria-label", "Skip guided tour");
}

/**
 * @typedef {object} CopilotProductTourHandlers
 * @property {(index: number) => void} [onStepIndexChange]
 * Active step index while driving, or `-1` when the tour is not active.
 * @property {(ctx: { stepIndex: number; variant: CopilotProductTourVariant | null }) => void} [onTourContextChange]
 * Fired on each highlight with active variant, and on destroy with `{ stepIndex: -1, variant: null }`.
 * @property {() => void | Promise<void>} [prepareSuggestionTourStep]
 * Selects the first setup when none is selected.
 * @property {() => void | Promise<void>} [ensureThesisOpenForTour]
 * Opens the thesis modal and allows layout to settle.
 * @property {() => void | Promise<void>} [ensureThesisClosedForTour]
 * Closes the thesis modal and allows layout to settle.
 * @property {() => void | Promise<void>} [onSimulateFirstTrade]
 * Reserved for tour flows that need to stage UI before advancing.
 * @property {() => string | null | undefined} [getTerminalPlatformId]
 * Current venue id (for DEX step baseline and auto-advance).
 */

/**
 * @param {CopilotProductTourHandlers} handlers
 * @returns {import('driver.js').DriveStep[]}
 */
function buildCopilotTour1Steps(handlers) {
  const prepareSuggestionTourStep = handlers.prepareSuggestionTourStep;
  const ensureThesisClosedForTour = handlers.ensureThesisClosedForTour;
  const isNarrowViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      element: '[data-tour="copilot-overview"]',
      popover: {
        title: "AI copilot",
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
        title: "Select Dex",
        description:
          "Switch venues anytime without changing your workflow. Copilot works the same way across supported DEXs.",
        side: "bottom",
        align: isNarrowViewport ? "start" : "end",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onNextClick: (_el, _step, { driver: drv }) => {
          void (async () => {
            try {
              if (typeof prepareSuggestionTourStep === "function") {
                await prepareSuggestionTourStep();
              }
            } catch {
              /* keep tour alive */
            } finally {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (drv.isActive()) drv.moveNext();
                });
              });
            }
          })();
        },
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="copilot-expanded-suggestion"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        void (async () => {
          try {
            if (typeof ensureThesisClosedForTour === "function") {
              await ensureThesisClosedForTour();
            }
          } catch {
            /* keep tour alive */
          } finally {
            if (drv.isActive()) drv.refresh();
          }
        })();
      },
      popover: {
        title: "Open a setup",
        description:
          "Each card is an AI-suggested setup. The selected card expands so you can review context before opening thesis.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onNextClick: (_el, _step, { driver: drv }) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (drv.isActive()) drv.moveNext();
            });
          });
        },
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="copilot-view-thesis"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        void (async () => {
          try {
            if (typeof ensureThesisClosedForTour === "function") {
              await ensureThesisClosedForTour();
            }
          } catch {
            /* keep tour alive */
          } finally {
            if (drv.isActive()) drv.refresh();
          }
        })();
      },
      popover: {
        title: "Backtest",
        description:
          "This opens the full strategy write-up. Tap Backtest to read it, or press Next to continue without opening.",
        side: "bottom",
        align: "center",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onPrevClick: (_el, _step, { driver: drv }) => {
          void (async () => {
            try {
              if (typeof ensureThesisClosedForTour === "function") {
                await ensureThesisClosedForTour();
              }
            } catch {
              /* keep tour alive */
            } finally {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (drv.isActive()) drv.movePrevious();
                });
              });
            }
          })();
        },
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="copilot-trade-setup"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        void (async () => {
          try {
            if (typeof ensureThesisClosedForTour === "function") {
              await ensureThesisClosedForTour();
            }
          } catch {
            /* keep tour alive */
          } finally {
            if (drv.isActive()) {
              el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
              drv.refresh();
            }
          }
        })();
      },
      popover: {
        title: "Tune the trade",
        description:
          "Adjust leverage, size, stops and targets to match your risk profile. Nothing goes live until you confirm it.",
        side: isNarrowViewport ? "bottom" : "left",
        align: isNarrowViewport ? "center" : "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onPrevClick: (_el, _step, { driver: drv }) => {
          void (async () => {
            try {
              if (typeof ensureThesisClosedForTour === "function") {
                await ensureThesisClosedForTour();
              }
            } catch {
              /* keep tour alive */
            } finally {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (drv.isActive()) drv.movePrevious();
                });
              });
            }
          })();
        },
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

  return mapPopoverBlueprint(blueprint);
}

/**
 * @param {CopilotProductTourHandlers} handlers
 * @returns {import('driver.js').DriveStep[]}
 */
function buildCopilotTour2Steps(handlers) {
  const prepareSuggestionTourStep = handlers.prepareSuggestionTourStep;
  const ensureThesisClosedForTour = handlers.ensureThesisClosedForTour;
  const isNarrowViewport =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      element: '[data-tour="copilot-overview"]',
      popover: {
        title: "Ai copilot",
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
        title: "Select Dex",
        description:
          "Switch venues anytime without changing your workflow. Copilot works the same way across supported DEXs.",
        side: "bottom",
        align: isNarrowViewport ? "start" : "end",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onNextClick: (_el, _step, { driver: drv }) => {
          void (async () => {
            try {
              if (typeof prepareSuggestionTourStep === "function") {
                await prepareSuggestionTourStep();
              }
            } catch {
              /* keep tour alive */
            } finally {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (drv.isActive()) drv.moveNext();
                });
              });
            }
          })();
        },
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="copilot-view-thesis"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        void (async () => {
          try {
            if (typeof ensureThesisClosedForTour === "function") {
              await ensureThesisClosedForTour();
            }
          } catch {
            /* keep tour alive */
          } finally {
            if (drv.isActive()) drv.refresh();
          }
        })();
      },
      popover: {
        title: "Backtest",
        description:
          "This opens the full strategy write-up. Tap Backtest to read it, or press Next to continue without opening.",
        side: "bottom",
        align: "center",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onPrevClick: (_el, _step, { driver: drv }) => {
          void (async () => {
            try {
              if (typeof ensureThesisClosedForTour === "function") {
                await ensureThesisClosedForTour();
              }
            } catch {
              /* keep tour alive */
            } finally {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (drv.isActive()) drv.movePrevious();
                });
              });
            }
          })();
        },
      },
    },
    {
      element: '[data-tour="copilot-suggestion-and-setup"]',
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        void (async () => {
          try {
            if (typeof ensureThesisClosedForTour === "function") {
              await ensureThesisClosedForTour();
            }
          } catch {
            /* keep tour alive */
          } finally {
            if (drv.isActive()) {
              el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
              drv.refresh();
            }
          }
        })();
      },
      popover: {
        title: "Suggestions and setup",
        description:
          "You have the AI suggestion on one side and execution controls on the other. Tune leverage, size, stops, and targets—nothing goes live until you confirm.",
        side: isNarrowViewport ? "bottom" : "top",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
        onPrevClick: (_el, _step, { driver: drv }) => {
          void (async () => {
            try {
              if (typeof ensureThesisClosedForTour === "function") {
                await ensureThesisClosedForTour();
              }
            } catch {
              /* keep tour alive */
            } finally {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (drv.isActive()) drv.movePrevious();
                });
              });
            }
          })();
        },
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

  return mapPopoverBlueprint(blueprint);
}

/** @param {import('driver.js').DriveStep[]} blueprint */
function mapPopoverBlueprint(blueprint) {
  return blueprint.map((row) => {
    const { popover: rowPopover, ...rest } = row;
    return {
      ...rest,
      popover: {
        showButtons: ["next", "previous", "close"],
        ...rowPopover,
        onPopoverRender: (popover, opts) => {
          mountTourSkipLabel(popover.closeButton);
          popover.nextButton?.classList?.add("ds-terminal-gradient-cta");
          removeHyprearnTourPopoverExtras(popover);
          mountHyprearnTourStepSegments(popover, opts);
          rowPopover?.onPopoverRender?.(popover, opts);
        },
      },
    };
  });
}

/**
 * @param {CopilotProductTourHandlers} [handlers]
 * @param {CopilotProductTourVariant} [variant]
 * @returns {(() => void) | null} cleanup to destroy the active driver, or null if nothing started
 */
export function startCopilotProductTour(
  handlers = {},
  variant = COPILOT_TOUR_VARIANT_2,
) {
  destroyActiveTourDriverSilently();
  tourDexBaselinePlatformId = null;
  activeTourHandlers = handlers;
  activeTourVariant = variant;

  const steps =
    variant === COPILOT_TOUR_VARIANT_1
      ? buildCopilotTour1Steps(handlers)
      : buildCopilotTour2Steps(handlers);
  if (steps.length === 0) {
    activeTourHandlers = null;
    activeTourVariant = null;
    return null;
  }

  const emitContext = (stepIndex) => {
    const v = activeTourVariant;
    activeTourHandlers?.onStepIndexChange?.(stepIndex);
    activeTourHandlers?.onTourContextChange?.({
      stepIndex,
      variant:
        typeof stepIndex === "number" && stepIndex >= 0 && v ? v : null,
    });
  };

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
      emitContext(typeof i === "number" ? i : -1);
    },
    onDestroyed: () => {
      const v = activeTourVariant;
      activeTourHandlers?.onStepIndexChange?.(-1);
      activeTourHandlers?.onTourContextChange?.({ stepIndex: -1, variant: null });
      activeTourDriver = null;
      activeTourHandlers = null;
      activeTourVariant = null;
      if (!suppressTourCompletionMark && v) {
        markTourVariantCompleted(v);
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
