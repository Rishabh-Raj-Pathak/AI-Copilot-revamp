import { driver } from "driver.js";

export const VAULTS_TOUR_STORAGE_KEY = "hyprearn_vaults_tour_completed";

/** @readonly */
export const VAULTS_TOUR_STEP = Object.freeze({
  OVERVIEW: 0,
  DEX: 1,
  EXPLORE: 2,
  ACTIVATE: 3,
  ACTIVATED: 4,
});

/** Step index where the user must click Activate on the highlighted featured vault (no Next). */
const VAULTS_ACTIVATE_STEP_INDEX = VAULTS_TOUR_STEP.ACTIVATE;

/** Step index for multi-DEX filter — auto-advance after the user picks a different venue tab. */
const VAULTS_DEX_STEP_INDEX = VAULTS_TOUR_STEP.DEX;

/** Final step — activated vaults list. */
const VAULTS_ACTIVATED_STEP_INDEX = VAULTS_TOUR_STEP.ACTIVATED;

export function isVaultsTourCompleted() {
  try {
    return localStorage.getItem(VAULTS_TOUR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** @type {import('driver.js').Driver | null} */
let activeVaultsTourDriver = null;

export function refreshVaultsTourIfActive() {
  try {
    activeVaultsTourDriver?.refresh?.();
  } catch {
    /* noop */
  }
}

/**
 * Call when the vaults venue filter changes. When the tour is on the DEX step and the
 * id differs from the step baseline, advances automatically (mirrors copilot DEX step).
 * @param {string} dexId
 */
export function notifyVaultsTourDexChanged(dexId) {
  try {
    if (!activeVaultsTourDriver?.isActive?.()) return;
    const i = activeVaultsTourDriver.getActiveIndex();
    if (
      !shouldVaultsTourAutoAdvanceOnDexChange(
        i,
        tourVaultsDexBaselineId,
        dexId,
      )
    ) {
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          if (!activeVaultsTourDriver?.isActive?.()) return;
          if (activeVaultsTourDriver.getActiveIndex() !== VAULTS_DEX_STEP_INDEX)
            return;
          activeVaultsTourDriver.refresh?.();
          activeVaultsTourDriver.moveNext?.();
        } catch {
          /* noop */
        }
      });
    });
  } catch {
    /* noop */
  }
}

/**
 * Resolves how the tour should advance after the first featured vault is activated.
 * - On the tune/activate step: advance one step (activated section).
 * - On overview, DEX, or explore: skip tune/activate and jump to activated vaults.
 * - On activated or later: no advance.
 *
 * @param {number} activeIndex driver step index
 * @returns {{ type: 'next' } | { type: 'jump'; stepIndex: number } | null}
 */
export function getVaultsTourAdvanceTargetAfterFeaturedActivate(activeIndex) {
  if (typeof activeIndex !== "number" || activeIndex < 0) return null;
  if (activeIndex === VAULTS_ACTIVATE_STEP_INDEX) return { type: "next" };
  if (activeIndex < VAULTS_ACTIVATE_STEP_INDEX) {
    return { type: "jump", stepIndex: VAULTS_ACTIVATED_STEP_INDEX };
  }
  return null;
}

/**
 * True when a DEX change should auto-advance the tour (only on the DEX step, new id).
 * @param {number} activeIndex
 * @param {string | null | undefined} baselineDexId
 * @param {string} nextDexId
 */
export function shouldVaultsTourAutoAdvanceOnDexChange(
  activeIndex,
  baselineDexId,
  nextDexId,
) {
  if (activeIndex !== VAULTS_DEX_STEP_INDEX) return false;
  if (baselineDexId == null) return false;
  return nextDexId !== baselineDexId;
}

function runVaultsTourAdvance(target) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (!activeVaultsTourDriver?.isActive?.()) return;
        const cur = activeVaultsTourDriver.getActiveIndex();
        const expected = getVaultsTourAdvanceTargetAfterFeaturedActivate(cur);
        if (
          !expected ||
          expected.type !== target.type ||
          (expected.type === "jump" &&
            target.type === "jump" &&
            expected.stepIndex !== target.stepIndex)
        ) {
          return;
        }
        activeVaultsTourDriver.refresh?.();
        if (target.type === "next") {
          activeVaultsTourDriver.moveNext?.();
        } else {
          activeVaultsTourDriver.drive?.(target.stepIndex);
        }
      } catch {
        /* noop */
      }
    });
  });
}

/**
 * After the user activates the first featured vault row, advance the tour:
 * - From explore (or earlier): jump to activated vaults (skip tune/activate).
 * - From tune/activate: move to activated vaults.
 * @returns {boolean} true if the tour scheduled an advance
 */
export function advanceVaultsTourAfterFeaturedActivateClick() {
  if (!activeVaultsTourDriver?.isActive?.()) return false;
  const i = activeVaultsTourDriver.getActiveIndex();
  const target = getVaultsTourAdvanceTargetAfterFeaturedActivate(i);
  if (!target) return false;
  runVaultsTourAdvance(target);
  return true;
}

export function destroyVaultsProductTourIfStillActive() {
  if (!activeVaultsTourDriver?.isActive?.()) return;
  try {
    activeVaultsTourDriver.destroy();
  } catch {
    /* noop */
  }
}

function markVaultsTourCompleted() {
  try {
    localStorage.setItem(VAULTS_TOUR_STORAGE_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

let suppressVaultsTourCompletionMark = false;

/** @type {VaultsProductTourHandlers | null} */
let activeVaultsTourHandlers = null;

/** Venue filter id when the DEX tour step was entered — auto-advance only after a real change. */
let tourVaultsDexBaselineId = null;

function destroyActiveVaultsTourDriverSilently() {
  if (!activeVaultsTourDriver) return;
  suppressVaultsTourCompletionMark = true;
  try {
    activeVaultsTourDriver.destroy();
  } catch {
    /* noop */
  } finally {
    suppressVaultsTourCompletionMark = false;
    activeVaultsTourDriver = null;
  }
}

/** @param {import('driver.js').PopoverDOM} popover */
function removeHyprearnTourPopoverExtras(popover) {
  popover.wrapper
    .querySelectorAll("[data-hyprearn-tour-ui]")
    .forEach((n) => n.remove());
}

/**
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
  bar.setAttribute("aria-label", `Vaults tour step ${idx + 1} of ${total}`);

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
 * @typedef {object} VaultsProductTourHandlers
 * @property {(index: number) => void} [onStepIndexChange]
 * @property {() => string | null | undefined} [getVaultsDexId]
 */

/**
 * @param {VaultsProductTourHandlers} handlers
 * @returns {import('driver.js').DriveStep[]}
 */
function buildVaultsTourSteps(handlers) {
  const isNarrowViewport =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 1023px)").matches;

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
    {
      element: '[data-tour="vaults-overview"]',
      popover: {
        title: "Vaults",
        description:
          "Discover vault opportunities across Multiple DEXs. Choose a vault, set your allocation, and activate it in a clicks.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Let's go",
      },
    },
    {
      element: '[data-tour="vaults-dex-tabs"]',
      disableActiveInteraction: false,
      onHighlighted: (_el, _step, { driver: drv }) => {
        tourVaultsDexBaselineId = handlers.getVaultsDexId?.() ?? null;
        requestAnimationFrame(() => {
          if (drv.isActive()) drv.refresh();
        });
      },
      popover: {
        title: "Select DEX",
        description:
          "Filter vaults by DEX: All DEXs, Hyperliquid, Paradex, Pacifica and other DEXs. The vault workflow stays the same across venues.",
        side: "bottom",
        align: isNarrowViewport ? "start" : "end",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: '[data-tour="vaults-opportunities"]',
      disableActiveInteraction: false,
      onHighlighted: (el, _step, { driver: drv }) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        requestAnimationFrame(() => {
          if (drv.isActive()) drv.refresh();
        });
      },
      popover: {
        title: "Explore opportunities",
        description:
          "Browse featured and available vaults. Compare APR, volume, users and set margin before Activating.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="vaults-featured-tour-controls"]'),
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Tune and activate",
        description:
          "Set your Margin or enter your USDC size, then click Activate to add this vault to your active vaults.",
        side: isNarrowViewport ? "top" : "left",
        align: "center",
        showButtons: ["previous", "close"],
      },
    },
    {
      element: () =>
        document.querySelector('[data-tour="vaults-activated-section"]'),
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Activated vaults",
        description:
          "Your active vaults appear here. Review your PnL, status or deactivate a vault anytime.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Done",
      },
    },
  ];

  return blueprint.map((row) => {
    const { popover: rowPopover, ...rest } = row;
    return {
      ...rest,
      popover: {
        showButtons: ["next", "previous", "close"],
        ...rowPopover,
        onPopoverRender: (popover, opts) => {
          mountTourSkipLabel(popover.closeButton);
          popover.nextButton?.classList?.add("vaults-tour-next-cta");
          removeHyprearnTourPopoverExtras(popover);
          mountHyprearnTourStepSegments(popover, opts);
          rowPopover?.onPopoverRender?.(popover, opts);
        },
      },
    };
  });
}

/**
 * @param {VaultsProductTourHandlers} [handlers]
 * @returns {(() => void) | null} cleanup to destroy the active driver, or null if nothing started
 */
export function startVaultsProductTour(handlers = {}) {
  destroyActiveVaultsTourDriverSilently();
  tourVaultsDexBaselineId = null;
  activeVaultsTourHandlers = handlers;

  const steps = buildVaultsTourSteps(handlers);
  if (steps.length === 0) {
    activeVaultsTourHandlers = null;
    return null;
  }

  const controlsEl = document.querySelector(
    '[data-tour="vaults-featured-tour-controls"]',
  );
  if (!controlsEl) {
    activeVaultsTourHandlers = null;
    return null;
  }

  const d = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayClickBehavior: () => {},
    disableActiveInteraction: false,
    overlayOpacity: 0.66,
    overlayColor: "#000",
    showProgress: true,
    progressText: "Step {{current}} of {{total}}",
    showButtons: ["next", "previous", "close"],
    popoverClass: "hyprearn-vaults-driver-popover vaults-root",
    popoverOffset: 14,
    onCloseClick: (_el, _step, { driver: drv }) => {
      drv.destroy();
    },
    onHighlighted: (_el, _step, { driver: drv }) => {
      const i = drv.getActiveIndex();
      activeVaultsTourHandlers?.onStepIndexChange?.(
        typeof i === "number" ? i : -1,
      );
    },
    onDestroyed: () => {
      activeVaultsTourHandlers?.onStepIndexChange?.(-1);
      activeVaultsTourDriver = null;
      activeVaultsTourHandlers = null;
      if (!suppressVaultsTourCompletionMark) {
        markVaultsTourCompleted();
      }
    },
    steps,
  });

  activeVaultsTourDriver = d;
  d.drive(0);

  return () => {
    destroyActiveVaultsTourDriverSilently();
  };
}
