const BOTTOM_CLASS = {
  copilot: "max-tablet:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
  vaults: "max-tablet:bottom-[max(1rem,env(safe-area-inset-bottom))]",
  "delta-neutral-vaults": "max-tablet:bottom-[max(1rem,env(safe-area-inset-bottom))]",
};

function isVaultsPage(page) {
  return page === "vaults" || page === "delta-neutral-vaults";
}

export default function InstallAppButton({ page = "copilot", onClick }) {
  const bottomClass = BOTTOM_CLASS[page] ?? BOTTOM_CLASS.copilot;
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
