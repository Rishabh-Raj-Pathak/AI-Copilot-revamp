/**
 * Floating "Install app" pill (phone only).
 *
 * The phone tab bar is now one global, fixed `AppTabBar` on every tab screen,
 * so the pill always rides 12px above it — the same gap Figma gives toasts —
 * instead of the old per-page offsets. On Agents it still lifts clear of an
 * open strategy sheet, which publishes its height as `--vault-strategy-sheet-height`.
 */
const ABOVE_TAB_BAR = "calc(var(--app-tab-bar-h) + 0.75rem)";

function isVaultsPage(page) {
  return page === "vaults" || page?.startsWith("dn-vaults");
}

/** Already running from the home screen — nothing left to install. */
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallAppButton({ page = "copilot", onClick }) {
  // The delete flow hides the tab bar and owns the whole screen.
  if (page === "delete-account" || isStandalone()) return null;

  const bottom = isVaultsPage(page)
    ? `max(calc(var(--vault-strategy-sheet-height, 0px) + 0.75rem), ${ABOVE_TAB_BAR})`
    : ABOVE_TAB_BAR;

  return (
    <button
      type="button"
      className="install-app-prompt-btn fixed right-4 left-auto z-[60] hidden max-tablet:flex items-center rounded-full border border-transparent px-3.5 py-2 text-xs font-semibold text-[#f2b500] transition-[bottom,filter] duration-200 hover:brightness-110"
      style={{ bottom }}
      onClick={onClick}
      aria-label="Install HyprEarn on your home screen"
    >
      <span className="relative z-[1]">Install app</span>
    </button>
  );
}
