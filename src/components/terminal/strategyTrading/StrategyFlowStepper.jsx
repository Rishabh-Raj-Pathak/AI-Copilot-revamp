export default function StrategyFlowStepper({ steps }) {
  if (!steps?.length) return null;

  return (
    <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 sm:p-4">
      <h4 className="text-xs font-semibold text-[#bfbfbf]">Strategy flow</h4>
      <ol className="mt-3 flex flex-col gap-3 max-tablet:gap-2.5 tablet:flex-row tablet:items-stretch tablet:gap-2">
        {steps.map((item, i) => (
          <li
            key={item.step}
            className="relative flex min-w-0 flex-1 flex-col tablet:px-2"
          >
            {i < steps.length - 1 ? (
              <span
                className="absolute right-0 top-4 hidden h-px w-2 translate-x-full bg-[#242424] tablet:block"
                aria-hidden
              />
            ) : null}
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#171200] text-[10px] font-semibold text-[#f2b500]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
                  {item.step}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#929292]">
                  {item.detail}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
