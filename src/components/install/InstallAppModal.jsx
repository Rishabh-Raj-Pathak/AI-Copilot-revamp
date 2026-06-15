const STEPS = {
  ios: [
    "Tap Share in your browser toolbar",
    "Choose Add to Home Screen",
    "Tap Add to confirm",
  ],
  android: [
    "Open the browser menu",
    "Tap Install app or Add to Home screen",
  ],
  other: [
    "Open your browser menu",
    "Select Add to Home Screen or Install app",
  ],
};

export default function InstallAppModal({ open, platform = "other", onClose }) {
  if (!open) return null;

  const steps = STEPS[platform] ?? STEPS.other;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#030504]/82 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-[3px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[image:var(--ds-terminal-copilot-tour-popover-border-gradient)] p-px shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)_inset] max-h-[min(88dvh,40rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex max-h-[min(88dvh,40rem)] flex-col overflow-hidden rounded-2xl bg-[#0D100F] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-app-title"
        >
          <div
            className="mx-auto mt-3.5 h-1 w-10 shrink-0 rounded-full bg-white/25"
            aria-hidden
          />

          <div className="minimal-scrollbar flex-1 overflow-y-auto overscroll-y-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <header className="border-b border-white/[0.06] pb-6 pt-5 text-center">
              <h2
                id="install-app-title"
                className="text-[1.125rem] font-semibold leading-[1.35] tracking-tight text-[rgba(255,255,255,0.92)] max-tablet:text-[17px]"
              >
                Add{" "}
                <span className="bg-[image:var(--ds-copilot-v2-gradient)] bg-clip-text text-transparent">
                  HyprEarn
                </span>{" "}
                to your home screen
              </h2>

              <p className="mx-auto mt-3 max-w-[17.5rem] text-sm leading-relaxed text-[rgba(255,255,255,0.58)] max-tablet:mt-2.5 max-tablet:text-[13px]">
                Install the app for faster access to AI Copilot and your trade
                setups.
              </p>
            </header>

            <ol className="list-none space-y-3 pt-6 max-tablet:space-y-2.5 max-tablet:pt-5">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
                >
                  <span
                    aria-hidden
                    className="install-app-modal__step-index flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#f2b500]"
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed text-[rgba(255,255,255,0.72)] max-tablet:text-[13px]">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              className="ds-copilot-v2-gradient-cta mt-7 w-full min-h-12 max-tablet:mt-6"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
