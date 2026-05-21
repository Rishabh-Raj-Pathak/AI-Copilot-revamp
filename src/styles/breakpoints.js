/**
 * HyprEarn layout breakpoints — aligned with Figma grid (mobile 402 / tablet 834).
 * Desktop layout (side-by-side panels) starts at `tablet` (834px).
 */

/** @type {834} */
export const TABLET_MIN_PX = 834;

/** @type {833} */
export const NARROW_VIEWPORT_MAX_PX = TABLET_MIN_PX - 1;

/** Media query for mobile-only JS (tour alignment, checklist visibility). */
export const NARROW_VIEWPORT_MEDIA = `(max-width: ${NARROW_VIEWPORT_MAX_PX}px)`;

/** @returns {boolean} True below the tablet breakpoint. */
export function isNarrowViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(NARROW_VIEWPORT_MEDIA).matches;
}

/**
 * Resolve a tour anchor when mobile + desktop shells both exist in the DOM.
 * `querySelector` would return the first match, often the hidden header copy.
 * @param {string} selector
 * @returns {Element | null}
 */
export function queryVisibleTourTarget(selector) {
  if (typeof document === "undefined") return null;
  const nodes = document.querySelectorAll(selector);
  for (const el of nodes) {
    if (!(el instanceof HTMLElement)) continue;
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) return el;
  }
  return nodes[0] ?? null;
}

/**
 * Scroll a tour highlight into view; mobile uses `center` so popovers clear the fold.
 * @param {Element | null | undefined} el
 */
export function scrollTourTarget(el) {
  if (!el || typeof el.scrollIntoView !== "function") return;
  el.scrollIntoView({
    behavior: "smooth",
    block: isNarrowViewport() ? "center" : "nearest",
    inline: "nearest",
  });
}
