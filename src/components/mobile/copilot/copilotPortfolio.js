/** Fired (on `window`) to bring the Positions segment forward, e.g. from a toast's "View". */
export const SHOW_POSITIONS_EVENT = "copilot:show-positions";

/** Set when Portfolio is asked for while no feed is mounted (another tab is showing). */
let pending = false;

/**
 * Bring Copilot's Portfolio segment forward from anywhere, e.g. the More
 * sheet. A mounted feed hears the event; one that mounts next (the caller then
 * navigates to Copilot) opens on Portfolio instead of Strategies.
 */
export function showCopilotPortfolio() {
  pending = true;
  window.dispatchEvent(new Event(SHOW_POSITIONS_EVENT));
}

/** For the feed's initial state: was Portfolio asked for before it mounted? */
export const isPortfolioPending = () => pending;

/** For the feed: the request has been honoured. */
export function clearPortfolioRequest() {
  pending = false;
}
