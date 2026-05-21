export default function OnboardingOverlay({ open, onDismiss }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm max-tablet:pb-0 tablet:items-center tablet:p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-[#242424] border-b-0 bg-[#121212] p-5 shadow-2xl max-tablet:max-h-[min(92dvh,36rem)] max-tablet:overflow-y-auto max-tablet:overscroll-y-contain max-tablet:pb-[max(1.25rem,env(safe-area-inset-bottom))] tablet:rounded-xl tablet:border-b tablet:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="copilot-welcome-title"
      >
        <div
          className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-[#454545] max-tablet:flex tablet:hidden"
          aria-hidden
        />
        <h2
          id="copilot-welcome-title"
          className="text-lg font-semibold text-white max-tablet:text-base"
        >
          Welcome to AI Copilot
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#bfbfbf] max-tablet:mt-2 max-tablet:text-[13px]">
          This demo shows AI-suggested trade setups alongside execution controls.
          Browse filters, review the highlighted setup and chart, then adjust the
          order panel before simulating execution.
        </p>
        <ul className="mt-4 list-none space-y-2 text-sm text-[#bfbfbf] max-tablet:mt-3 max-tablet:space-y-1.5 max-tablet:text-[13px]">
          <li className="flex gap-2">
            <span className="text-[#f2b500]" aria-hidden>
              •
            </span>
            Pick a market filter (Trending is active by default)
          </li>
          <li className="flex gap-2">
            <span className="text-[#f2b500]" aria-hidden>
              •
            </span>
            Compare suggestions and metrics in the list
          </li>
          <li className="flex gap-2">
            <span className="text-[#f2b500]" aria-hidden>
              •
            </span>
            <span>
              On phone, open the setup sheet to tune size, leverage, and risk
            </span>
          </li>
        </ul>
        <button
          type="button"
          className="mt-6 w-full min-h-11 rounded-lg bg-[#269755] py-2.5 text-sm font-semibold text-white hover:brightness-110 max-tablet:mt-5"
          onClick={() => onDismiss?.()}
        >
          Start demo
        </button>
      </div>
    </div>
  );
}
