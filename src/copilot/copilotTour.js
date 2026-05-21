import { driver } from "driver.js";
import {
  isNarrowViewport,
  queryVisibleTourTarget,
  scrollTourTarget,
} from "../styles/breakpoints.js";

/** @typedef {'copilot-tour-1' | 'copilot-tour-2'} CopilotProductTourVariant */

export const COPILOT_TOUR_VARIANT_1 = "copilot-tour-1";
export const COPILOT_TOUR_VARIANT_2 = "copilot-tour-2";

export const COPILOT_TOUR_1_STORAGE_KEY = "hyprearn_copilot_tour_1_completed";
export const COPILOT_TOUR_2_STORAGE_KEY = "hyprearn_copilot_tour_2_completed";

/** @deprecated Use {@link COPILOT_TOUR_2_STORAGE_KEY}; kept for older localStorage reads. */
export const COPILOT_TOUR_STORAGE_KEY = "hyprearn_copilot_tour_completed";

export const COPILOT_TUTORIAL_STATUS_KEY = "hyprearn_copilot_tutorial_status";
export const COPILOT_TUTORIAL_DISMISS_COUNT_KEY =
  "hyprearn_copilot_tutorial_dismiss_count";
export const COPILOT_TUTORIAL_ENGAGEMENT_KEY = "hyprearn_copilot_tutorial_engagement";
export const COPILOT_TUTORIAL_SESSION_DISMISSED_KEY =
  "hyprearn_copilot_tutorial_dismissed_session";

/** Max automatic tutorial retries after the user skips (across sessions). */
export const COPILOT_TUTORIAL_MAX_AUTO_DISMISS_RETRIES = 3;

/** @typedef {'never_seen' | 'dismissed' | 'completed'} CopilotTutorialStatus */
/** @typedef {'completed' | 'dismissed'} CopilotTutorialEndReason */

let legacyTutorialStorageMigrated = false;

function migrateLegacyTutorialStorage() {
  if (legacyTutorialStorageMigrated) return;
  legacyTutorialStorageMigrated = true;
  try {
    const status = localStorage.getItem(COPILOT_TUTORIAL_STATUS_KEY);
    if (
      status === "never_seen" ||
      status === "dismissed" ||
      status === "completed"
    ) {
      return;
    }
    if (
      localStorage.getItem(COPILOT_TOUR_2_STORAGE_KEY) === "1" ||
      localStorage.getItem(COPILOT_TOUR_STORAGE_KEY) === "1"
    ) {
      localStorage.setItem(COPILOT_TUTORIAL_STATUS_KEY, "completed");
    }
  } catch {
    /* ignore quota / private mode */
  }
}

/** @returns {CopilotTutorialStatus} */
export function getCopilotTutorialStatus() {
  migrateLegacyTutorialStorage();
  try {
    const status = localStorage.getItem(COPILOT_TUTORIAL_STATUS_KEY);
    if (status === "dismissed" || status === "completed") return status;
  } catch {
    /* noop */
  }
  return "never_seen";
}

export function isCopilotTutorialCompleted() {
  return getCopilotTutorialStatus() === "completed";
}

/** @returns {boolean} Whether the tutorial should auto-start after wallet connect. */
export function shouldAutoStartCopilotTutorial() {
  if (isCopilotTutorialCompleted()) return false;
  const status = getCopilotTutorialStatus();
  if (status === "never_seen") return true;
  if (status === "dismissed") {
    try {
      if (
        sessionStorage.getItem(COPILOT_TUTORIAL_SESSION_DISMISSED_KEY) === "1"
      ) {
        return false;
      }
      const count = Number.parseInt(
        localStorage.getItem(COPILOT_TUTORIAL_DISMISS_COUNT_KEY) ?? "0",
        10,
      );
      if (
        Number.isFinite(count) &&
        count >= COPILOT_TUTORIAL_MAX_AUTO_DISMISS_RETRIES
      ) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }
  return false;
}

/** @returns {{ stepIndex: number; variant: CopilotProductTourVariant } | null} */
export function getCopilotTutorialEngagement() {
  migrateLegacyTutorialStorage();
  try {
    const raw = localStorage.getItem(COPILOT_TUTORIAL_ENGAGEMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.stepIndex !== "number" ||
      (parsed.variant !== COPILOT_TOUR_VARIANT_1 &&
        parsed.variant !== COPILOT_TOUR_VARIANT_2)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Clears same-session dismiss guard so a manual restart from More can run immediately. */
export function clearCopilotTutorialSessionDismissed() {
  try {
    sessionStorage.removeItem(COPILOT_TUTORIAL_SESSION_DISMISSED_KEY);
  } catch {
    /* noop */
  }
}

function markCopilotTutorialCompleted() {
  try {
    localStorage.setItem(COPILOT_TUTORIAL_STATUS_KEY, "completed");
    localStorage.removeItem(COPILOT_TUTORIAL_ENGAGEMENT_KEY);
  } catch {
    /* noop */
  }
}

/** @param {{ stepIndex: number; variant: CopilotProductTourVariant | null }} engagement */
function markCopilotTutorialDismissed(engagement) {
  try {
    localStorage.setItem(COPILOT_TUTORIAL_STATUS_KEY, "dismissed");
    const count = Number.parseInt(
      localStorage.getItem(COPILOT_TUTORIAL_DISMISS_COUNT_KEY) ?? "0",
      10,
    );
    localStorage.setItem(
      COPILOT_TUTORIAL_DISMISS_COUNT_KEY,
      String(Number.isFinite(count) ? count + 1 : 1),
    );
    sessionStorage.setItem(COPILOT_TUTORIAL_SESSION_DISMISSED_KEY, "1");
    if (engagement?.variant) {
      localStorage.setItem(
        COPILOT_TUTORIAL_ENGAGEMENT_KEY,
        JSON.stringify(engagement),
      );
    }
  } catch {
    /* noop */
  }
}

export function isCopilotTour1Completed() {
  try {
    return localStorage.getItem(COPILOT_TOUR_1_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isCopilotTour2Completed() {
  return isCopilotTutorialCompleted();
}

/** @returns {boolean} Legacy helper: same as {@link isCopilotTutorialCompleted}. */
export function isCopilotTourCompleted() {
  return isCopilotTutorialCompleted();
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

/** @returns {boolean} */
export function isCopilotProductTourActive() {
  try {
    return Boolean(activeTourDriver?.isActive?.());
  } catch {
    return false;
  }
}

/** Push driver active index into React (mobile bar reads `onTourContextChange`). */
function syncCopilotTourContextFromDriver() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (!activeTourDriver?.isActive?.()) return;
        const i = activeTourDriver.getActiveIndex();
        const stepIndex = typeof i === "number" ? i : -1;
        activeTourHandlers?.onStepIndexChange?.(stepIndex);
        activeTourHandlers?.onTourContextChange?.({
          stepIndex,
          variant:
            stepIndex >= 0 && activeTourVariant ? activeTourVariant : null,
        });
      } catch {
        /* noop */
      }
    });
  });
}

/** Mobile coach bar: advance (mirrors desktop onNext for steps that need prep). */
export function copilotTourMobileMoveNext() {
  try {
    if (!activeTourDriver?.isActive?.()) return;
    const i = activeTourDriver.getActiveIndex();
    if (typeof i !== "number" || i >= 5) return;

    if (i === 1) {
      void (async () => {
        try {
          if (typeof activeTourHandlers?.prepareSuggestionTourStep === "function") {
            await activeTourHandlers.prepareSuggestionTourStep();
          }
        } catch {
          /* keep tour alive */
        } finally {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (activeTourDriver?.isActive?.()) {
                activeTourDriver.moveNext?.();
                syncCopilotTourContextFromDriver();
              }
            });
          });
        }
      })();
      return;
    }

    activeTourDriver.moveNext?.();
    syncCopilotTourContextFromDriver();
  } catch {
    /* noop */
  }
}

/** Mobile coach bar: go back one step. */
export function copilotTourMobileMovePrevious() {
  try {
    if (!activeTourDriver?.isActive?.()) return;
    activeTourDriver.movePrevious?.();
    syncCopilotTourContextFromDriver();
  } catch {
    /* noop */
  }
}

/** Mobile coach bar: skip / dismiss tutorial. */
export function copilotTourMobileSkip() {
  try {
    if (!activeTourDriver?.isActive?.()) return;
    pendingTutorialEndReason = "dismissed";
    activeTourDriver.destroy();
  } catch {
    /* noop */
  }
}

/** Driver index of the Backtest spotlight (highlights the control; modal opens only if the user clicks). */
const VIEW_THESIS_STEP_INDEX_TOUR1 = 3;
const VIEW_THESIS_STEP_INDEX_TOUR2 = 3;

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
    syncCopilotTourContextFromDriver();
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
const OPEN_TRADE_TOUR_STEP_INDEX_TOUR2 = 5;

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

  pendingTutorialEndReason = "completed";
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
 * @param {{ skipCompletionMark?: boolean; markCompleted?: boolean }} [opts]
 */
export function destroyCopilotProductTourIfStillActive(opts = {}) {
  if (!activeTourDriver?.isActive?.()) return;
  if (opts.skipCompletionMark) suppressTourCompletionMark = true;
  else if (opts.markCompleted) pendingTutorialEndReason = "completed";
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

/** @type {CopilotTutorialEndReason | null} */
let pendingTutorialEndReason = null;

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
    document.body.classList.remove("copilot-mobile-tour-active");
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
  bar.setAttribute("aria-label", `Tutorial step ${idx + 1} of ${total}`);

  for (let i = 0; i < total; i++) {
    const seg = document.createElement("span");
    seg.className =
      i === idx
        ? "hyprearn-tour-step-segment hyprearn-tour-step-segment--active"
        : "hyprearn-tour-step-segment";
    bar.appendChild(seg);
  }

  if (isNarrowViewport()) {
    const count = document.createElement("span");
    count.className = "hyprearn-tour-step-count";
    count.setAttribute("data-hyprearn-tour-ui", "");
    count.textContent = `${idx + 1}/${total}`;
    bar.appendChild(count);
    popover.wrapper?.classList?.add(
      "hyprearn-copilot-driver-popover--mobile-coach",
    );
  } else {
    popover.wrapper?.classList?.remove(
      "hyprearn-copilot-driver-popover--mobile-coach",
    );
  }

  wrapper.insertBefore(bar, footer);
}

/** @param {HTMLButtonElement} closeButton */
function mountTourSkipLabel(closeButton) {
  closeButton.replaceChildren();
  closeButton.textContent = "Skip";
  closeButton.setAttribute("aria-label", "Skip tutorial");
}

function collectTutorialEngagement() {
  try {
    const i = activeTourDriver?.getActiveIndex?.();
    return {
      stepIndex: typeof i === "number" && i >= 0 ? i : 0,
      variant: activeTourVariant,
    };
  } catch {
    return { stepIndex: 0, variant: activeTourVariant };
  }
}

function applyTutorialEndState(variant) {
  const reason = pendingTutorialEndReason ?? "dismissed";
  pendingTutorialEndReason = null;
  if (reason === "completed") {
    markCopilotTutorialCompleted();
    if (variant) markTourVariantCompleted(variant);
  } else {
    markCopilotTutorialDismissed(collectTutorialEngagement());
  }
  const engagement = getCopilotTutorialEngagement();
  activeTourHandlers?.onTutorialEnded?.({ reason, engagement });
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
 * @property {(payload: { reason: CopilotTutorialEndReason; engagement: ReturnType<typeof getCopilotTutorialEngagement> }) => void} [onTutorialEnded]
 * Fired when the tutorial ends (skip, complete, or trade CTA on final step).
 * @property {() => void | Promise<void>} [ensureMobileTradeSheetForTour]
 * On narrow viewports, selects a setup and opens the fullscreen trade setup sheet.
 * @property {() => void | Promise<void>} [ensureMobileFeedVisibleForTour]
 * On narrow viewports, closes the trade sheet so list steps (2–3) stay visible.
 */

/** @typedef {'reviewSetup' | 'backtest' | 'customize'} TourStepCopyKey */

const TOUR_STEP_COPY = {
  reviewSetup: {
    desktop: {
      title: "Review Trade Setup",
      description:
        "Every card is a live AI suggested setup. Tap to expand and review the full chart context before committing.",
    },
    narrow: {
      title: "Review setup",
      description: "Tap a setup card in the list to select it.",
    },
  },
  backtest: {
    desktop: {
      title: "Backtest",
      description:
        "Read the backtest behind every trade. Understand the reasoning before you execute.",
    },
    narrow: {
      title: "Backtest",
      description: "Tap Backtest on the selected card.",
    },
  },
  customize: {
    desktop: {
      title: "Customize Your Trade",
      description:
        "Dial in your leverage, size, and exits to fit your risk appetite. Nothing executes without your confirmation.",
    },
    narrow: {
      title: "Customize trade",
      description: "Tune size, leverage, and exits here.",
    },
  },
};

/** @param {TourStepCopyKey} key @param {boolean} narrow */
function getTourStepCopy(key, narrow) {
  const block = TOUR_STEP_COPY[key];
  return narrow ? block.narrow : block.desktop;
}

/**
 * @param {CopilotProductTourHandlers} handlers
 * @param {Element | undefined} el
 * @param {{ driver: import('driver.js').Driver }} opts
 */
async function prepareFeedTourHighlight(handlers, el, { driver: drv }) {
  const ensureThesisClosedForTour = handlers.ensureThesisClosedForTour;
  try {
    if (typeof handlers.ensureMobileFeedVisibleForTour === "function") {
      await handlers.ensureMobileFeedVisibleForTour();
    }
    if (typeof ensureThesisClosedForTour === "function") {
      await ensureThesisClosedForTour();
    }
  } catch {
    /* keep tour alive */
  } finally {
    scrollTourTarget(el);
    if (drv.isActive()) drv.refresh();
  }
}

/**
 * @param {CopilotProductTourHandlers} handlers
 * @param {Element | undefined} el
 * @param {{ driver: import('driver.js').Driver }} opts
 */
async function prepareTradeSetupTourHighlight(handlers, el, { driver: drv }) {
  const ensureThesisClosedForTour = handlers.ensureThesisClosedForTour;
  try {
    if (typeof handlers.ensureMobileTradeSheetForTour === "function") {
      await handlers.ensureMobileTradeSheetForTour();
    }
    if (typeof ensureThesisClosedForTour === "function") {
      await ensureThesisClosedForTour();
    }
  } catch {
    /* keep tour alive */
  } finally {
    if (drv.isActive()) {
      scrollTourTarget(el);
      drv.refresh();
    }
  }
}

/**
 * @param {CopilotProductTourHandlers} handlers
 * @returns {import('driver.js').DriveStep[]}
 */
function buildCopilotTour1Steps(handlers) {
  const prepareSuggestionTourStep = handlers.prepareSuggestionTourStep;
  const ensureThesisClosedForTour = handlers.ensureThesisClosedForTour;
  const narrow = isNarrowViewport();

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      element: () => queryVisibleTourTarget('[data-tour="copilot-overview"]'),
      popover: {
        title: "AI-Copilot",
        description:
          "AI-Copilot builds complete trade setups, entry, target, and stop loss included. You stay in control, always.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Let's go",
      },
    },
    {
      element: () => queryVisibleTourTarget('[data-tour="dex-selector"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        tourDexBaselinePlatformId = handlers.getTerminalPlatformId?.() ?? null;
        scrollTourTarget(el);
        requestAnimationFrame(() => {
          if (drv.isActive()) drv.refresh();
        });
      },
      popover: {
        title: "Select Dex",
        description:
          "One workflow, multiple DEXs. Switch exchanges instantly, your trading experience never changes.",
        side: "bottom",
        align: narrow ? "start" : "end",
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
        queryVisibleTourTarget('[data-tour="copilot-expanded-suggestion"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareFeedTourHighlight(handlers, el, opts);
      },
      popover: {
        ...getTourStepCopy("reviewSetup", narrow),
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
        queryVisibleTourTarget('[data-tour="copilot-view-thesis"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareFeedTourHighlight(handlers, el, opts);
      },
      popover: {
        ...getTourStepCopy("backtest", narrow),
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
        queryVisibleTourTarget('[data-tour="copilot-trade-setup"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareTradeSetupTourHighlight(handlers, el, opts);
      },
      popover: {
        ...getTourStepCopy("customize", narrow),
        side: narrow ? "top" : "left",
        align: narrow ? "center" : "start",
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
      element: () => queryVisibleTourTarget('[data-tour="trade-open-cta"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareTradeSetupTourHighlight(handlers, el, opts);
      },
      popover: {
        title: "Place your first trade",
        description: narrow
          ? "Tap the red button below to place your demo trade."
          : "You're all set. Hit the button and place your first trade.",
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
  const narrow = isNarrowViewport();

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      element: () => queryVisibleTourTarget('[data-tour="copilot-overview"]'),
      popover: {
        title: "AI-Copilot",
        description:
          "AI-Copilot builds complete trade setups - entry, target, and stop loss included. You stay in control, always.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Let's go",
      },
    },
    {
      element: () => queryVisibleTourTarget('[data-tour="dex-selector"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        tourDexBaselinePlatformId = handlers.getTerminalPlatformId?.() ?? null;
        scrollTourTarget(el);
        requestAnimationFrame(() => {
          if (drv.isActive()) drv.refresh();
        });
      },
      popover: {
        title: "Select Dex",
        description:
          "One workflow, multiple DEXs. Switch exchanges instantly, your trading experience never changes.",
        side: "bottom",
        align: narrow ? "start" : "end",
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
        queryVisibleTourTarget('[data-tour="copilot-expanded-suggestion"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareFeedTourHighlight(handlers, el, opts);
      },
      popover: {
        ...getTourStepCopy("reviewSetup", narrow),
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
        queryVisibleTourTarget('[data-tour="copilot-view-thesis"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareFeedTourHighlight(handlers, el, opts);
      },
      popover: {
        ...getTourStepCopy("backtest", narrow),
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
        queryVisibleTourTarget('[data-tour="copilot-trade-setup"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareTradeSetupTourHighlight(handlers, el, opts);
      },
      popover: {
        ...getTourStepCopy("customize", narrow),
        side: narrow ? "top" : "left",
        align: narrow ? "center" : "start",
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
      element: () => queryVisibleTourTarget('[data-tour="trade-open-cta"]'),
      disableActiveInteraction: false,
      onHighlighted: (el, _step, opts) => {
        void prepareTradeSetupTourHighlight(handlers, el, opts);
      },
      popover: {
        title: "Place your first trade",
        description: narrow
          ? "Tap the red button below to place your demo trade."
          : "You're all set. Hit the button and place your first trade.",
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
  const narrow = isNarrowViewport();
  return blueprint.map((row) => {
    const { popover: rowPopover, ...rest } = row;
    const desktopButtons = rowPopover?.showButtons ?? [
      "next",
      "previous",
      "close",
    ];
    return {
      ...rest,
      popover: {
        ...rowPopover,
        showButtons: narrow ? [] : desktopButtons,
        onPopoverRender: (popover, opts) => {
          if (narrow) {
            popover.wrapper?.style?.setProperty("display", "none", "important");
            return;
          }
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
 * @typedef {object} StartCopilotProductTourOptions
 * @property {number} [startStep] driver step index to open on (for resume after dismiss).
 */

/**
 * @param {CopilotProductTourHandlers} [handlers]
 * @param {CopilotProductTourVariant} [variant]
 * @param {StartCopilotProductTourOptions} [options]
 * @returns {(() => void) | null} cleanup to destroy the active driver, or null if nothing started
 */
export function startCopilotProductTour(
  handlers = {},
  variant = COPILOT_TOUR_VARIANT_2,
  options = {},
) {
  destroyActiveTourDriverSilently();
  tourDexBaselinePlatformId = null;
  pendingTutorialEndReason = null;
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
    overlayOpacity: isNarrowViewport() ? 0.38 : 0.66,
    overlayColor: "#000",
    showProgress: !isNarrowViewport(),
    progressText: "Tutorial {{current}} of {{total}}",
    showButtons: isNarrowViewport()
      ? []
      : ["next", "previous", "close"],
    popoverClass: "hyprearn-copilot-driver-popover",
    popoverOffset: isNarrowViewport() ? 0 : 14,
    onCloseClick: (_el, _step, { driver: drv }) => {
      pendingTutorialEndReason = "dismissed";
      drv.destroy();
    },
    onHighlighted: (_el, _step, { driver: drv }) => {
      const i = drv.getActiveIndex();
      emitContext(typeof i === "number" ? i : -1);
      syncCopilotTourContextFromDriver();
    },
    onDestroyed: () => {
      document.body.classList.remove("copilot-mobile-tour-active");
      const v = activeTourVariant;
      activeTourHandlers?.onStepIndexChange?.(-1);
      activeTourHandlers?.onTourContextChange?.({ stepIndex: -1, variant: null });
      activeTourDriver = null;
      activeTourHandlers = null;
      activeTourVariant = null;
      if (!suppressTourCompletionMark && v) {
        applyTutorialEndState(v);
      }
    },
    steps,
  });

  activeTourDriver = d;
  if (isNarrowViewport()) {
    document.body.classList.add("copilot-mobile-tour-active");
  }
  const rawStart = options.startStep ?? 0;
  const startStep = Math.max(0, Math.min(rawStart, steps.length - 1));
  d.drive(startStep);
  syncCopilotTourContextFromDriver();
  return () => {
    document.body.classList.remove("copilot-mobile-tour-active");
    destroyActiveTourDriverSilently();
  };
}
