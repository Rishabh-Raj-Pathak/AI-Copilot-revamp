import { Smartphone } from "lucide-react";

const BOTTOM_CLASS = {
  copilot: "max-tablet:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
  vaults: "max-tablet:bottom-[max(1rem,env(safe-area-inset-bottom))]",
};

export default function InstallAppButton({ page = "copilot", onClick }) {
  const bottomClass = BOTTOM_CLASS[page] ?? BOTTOM_CLASS.copilot;

  return (
    <button
      type="button"
      className={`install-app-prompt-btn fixed right-4 z-[60] hidden max-tablet:inline-flex items-center gap-1.5 rounded-full border border-transparent bg-[image:var(--ds-copilot-v2-gradient)] px-4 py-2.5 text-sm font-semibold text-[var(--ds-copilot-v2-gradient-fg)] shadow-[0_8px_28px_rgba(242,181,0,0.38),0_0_0_1px_rgba(255,255,255,0.12)_inset] transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] ${bottomClass}`}
      onClick={onClick}
      aria-label="Install app"
    >
      <Smartphone className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
      Install app
    </button>
  );
}
