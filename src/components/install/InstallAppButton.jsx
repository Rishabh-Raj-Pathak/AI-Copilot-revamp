/**
 * Floating "Install app" pill (phone only).
 *
 * Shown on the Copilot home screen only. The phone screens are now dense,
 * Figma-built layouts (Rewards pager, Agents carousels, Trade ticket CTA) and a
 * pill floating over their bottom-right corner covered real buttons. It rides
 * 12px above the global tab bar — the gap Figma gives toasts.
 */
const ABOVE_TAB_BAR = "calc(var(--app-tab-bar-h) + 0.75rem)";

/** Already running from the home screen — nothing left to install. */
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallAppButton({ page = "copilot", onClick }) {
  if (page !== "copilot" || isStandalone()) return null;

  return (
    <button
      type="button"
      className="install-app-prompt-btn fixed right-4 left-auto z-[60] hidden max-tablet:flex items-center rounded-full border border-transparent px-3.5 py-2 text-xs font-semibold text-[#f2b500] transition-[bottom,filter] duration-200 hover:brightness-110"
      style={{ bottom: ABOVE_TAB_BAR }}
      onClick={onClick}
      aria-label="Install HyprEarn on your home screen"
    >
      <span className="relative z-[1]">Install app</span>
    </button>
  );
}
