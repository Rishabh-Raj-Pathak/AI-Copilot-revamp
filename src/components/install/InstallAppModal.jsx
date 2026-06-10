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
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-[#242424] border-b-0 bg-[#0f0f0f] p-5 shadow-2xl max-h-[min(92dvh,36rem)] overflow-y-auto overscroll-y-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-[#454545]"
          aria-hidden
        />
        <h2
          id="install-app-title"
          className="text-lg font-semibold text-white max-tablet:text-base"
        >
          Add HyprEarn to your home screen
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#bfbfbf] max-tablet:mt-2 max-tablet:text-[13px]">
          Install the app for faster access to AI Copilot and your trade setups.
        </p>
        <ul className="mt-4 list-none space-y-2 text-sm text-[#bfbfbf] max-tablet:mt-3 max-tablet:space-y-1.5 max-tablet:text-[13px]">
          {steps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="text-[#f2b500]" aria-hidden>
                •
              </span>
              {step}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-6 w-full min-h-11 rounded-lg bg-[#269755] py-2.5 text-sm font-semibold text-white hover:brightness-110 max-tablet:mt-5"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
