const VAULTS_BOTTOM = "max-tablet:bottom-[max(1rem,env(safe-area-inset-bottom))]";

const BOTTOM_CLASS = {
  copilot: "max-tablet:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
  vaults: VAULTS_BOTTOM,
  // Every Delta Neutral version, matched by prefix rather than listed: these ids are
  // numbered now, and a v3 added to VAULT_VIEWS must not silently fall back to the
  // copilot offset -- which sits 3rem higher and would float the button mid-page.
  "dn-vaults-1": VAULTS_BOTTOM,
  "dn-vaults-2": VAULTS_BOTTOM,
};

function isVaultsPage(page) {
  return page === "vaults" || page?.startsWith("dn-vaults");
}

export default function InstallAppButton({ page = "copilot", onClick }) {
  const bottomClass =
    BOTTOM_CLASS[page] ?? (isVaultsPage(page) ? VAULTS_BOTTOM : BOTTOM_CLASS.copilot);
  const vaultsStyle = isVaultsPage(page)
      ? {
          bottom:
            "max(calc(var(--vault-strategy-sheet-height, 0px) + 0.75rem), max(1rem, env(safe-area-inset-bottom)))",
        }
      : undefined;

  return (
    <button
      type="button"
      className={`install-app-prompt-btn fixed right-4 left-auto z-[60] hidden max-tablet:flex items-center rounded-full border border-transparent px-3.5 py-2 text-xs font-semibold text-[#f2b500] transition-[bottom,filter] duration-200 hover:brightness-110 ${isVaultsPage(page) ? "" : bottomClass}`}
      style={vaultsStyle}
      onClick={onClick}
      aria-label="Install HyprEarn on your home screen"
    >
      <span className="relative z-[1]">Install app</span>
    </button>
  );
}
