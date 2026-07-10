/**
 * Share-to-X for an opened setup.
 *
 * This is what connecting X buys the user. Until it existed, "Share Setup" in
 * `TradeSuccessModal` closed the modal and did nothing, and step two of the
 * profile was an ask with no payoff behind it.
 */

const APP_URL = "https://app.hyprearn.com";

/** @param {{ coin?: string }} [opts] */
export function setupShareText({ coin } = {}) {
  const market = coin ? `${coin} ` : "";
  return `Just opened a ${market}setup with the HyprEarn AI Copilot — entry, target and stop in one tap.`;
}

/** @param {{ coin?: string }} [opts] */
export function setupShareUrl(opts) {
  const params = new URLSearchParams({
    text: setupShareText(opts),
    url: APP_URL,
  });
  return `https://x.com/intent/post?${params}`;
}

/** @param {{ coin?: string }} [opts] */
export function openSetupShare(opts) {
  window.open(setupShareUrl(opts), "_blank", "noopener,noreferrer");
}
