import { driver } from "driver.js";

export const VAULTS_TOUR_STORAGE_KEY = "hyprearn_vaults_tour_completed";

/** Step index where the user must click Activate on the highlighted featured vault (no Next). */
const VAULTS_ACTIVATE_STEP_INDEX = 3;

/** Step index for multi-DEX filter — auto-advance after the user picks a different venue tab. */
const VAULTS_DEX_STEP_INDEX = 0;

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
    if (i !== VAULTS_DEX_STEP_INDEX) return;
    if (dexId === tourVaultsDexBaselineId) return;
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
 * After the user activates the first featured vault row while the tour is on the
 * activate step, advance to the Activated Vaults highlight.
 * @returns {boolean} true if the tour advanced from the activate step
 */
export function advanceVaultsTourAfterFeaturedActivateClick() {
  if (!activeVaultsTourDriver?.isActive?.()) return false;
  const i = activeVaultsTourDriver.getActiveIndex();
  if (typeof i !== "number" || i !== VAULTS_ACTIVATE_STEP_INDEX) return false;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (!activeVaultsTourDriver?.isActive?.()) return;
        if (activeVaultsTourDriver.getActiveIndex() !== VAULTS_ACTIVATE_STEP_INDEX)
          return;
        activeVaultsTourDriver.refresh?.();
        activeVaultsTourDriver.moveNext?.();
      } catch {
        /* noop */
      }
    });
  });

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
    window.matchMedia("(max-width: 1023px)").matches;

  /** @type {import('driver.js').DriveStep[]} */
  const blueprint = [
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
        title: "Multi-DEX vaults",
        description:
          "Filter opportunities by venue: All Dexs, Hyperliquid, Paradex, or Add DEX. The same vault workflow applies across supported venues.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: '[data-tour="vaults-featured-section"]',
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Featured opportunities",
        description:
          "Curated vaults with strong traction or standout terms. Open any row to adjust performance fee share, size, and activation.",
        side: "bottom",
        align: "start",
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next",
      },
    },
    {
      element: '[data-tour="vaults-available-section"]',
      disableActiveInteraction: false,
      onHighlighted: (el) => {
        el?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      },
      popover: {
        title: "Available vaults",
        description:
          "Browse the full catalog. Each row shows volume, APR, and community size so you can compare before you allocate.",
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
          "Drag the performance fee slider to set your share, edit USDC size, then tap Activate to move this vault into your active allocations.",
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
          "Active allocations live here so you can review fee share, size, and status at a glance. Remove a vault anytime to free the slot.",
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
          mountTourCloseIcon(popover.closeButton);
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
