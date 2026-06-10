const BOTTOM_CLASS = {
  copilot: "max-tablet:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
  vaults: "max-tablet:bottom-[max(1rem,env(safe-area-inset-bottom))]",
};

export default function InstallAppButton({ page = "copilot", onClick }) {
  const bottomClass = BOTTOM_CLASS[page] ?? BOTTOM_CLASS.copilot;

  return (
    <button
      type="button"
      className={`fixed right-4 z-[60] hidden max-tablet:flex items-center rounded-full border border-[#3e2e00] bg-[#171200] px-3.5 py-2 text-xs font-semibold text-[#f2b500] ${bottomClass}`}
      onClick={onClick}
      aria-label="Install app"
    >
      Install app
    </button>
  );
}
