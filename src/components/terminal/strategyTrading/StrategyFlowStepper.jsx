import { useCopilotTheme } from "./StrategyCopilotContext.jsx";
import { v3SectionTitle } from "./workstation/V3TabLayout.jsx";

function FlowStepList({ steps, titleClassName, shellClassName = "" }) {
  return (
    <section className={shellClassName}>
      <h4 className={titleClassName}>Strategy flow</h4>
      <ol className="mt-3.5 flex flex-col tablet:mt-4 tablet:flex-row tablet:items-stretch">
        {steps.map((item, i) => (
          <li
            key={item.step}
            className={`min-w-0 flex-1 py-3.5 first:pt-0 last:pb-0 tablet:px-4 tablet:py-0 ${
              i > 0
                ? "border-t border-white/[0.06] tablet:border-t-0 tablet:border-l"
                : ""
            } ${i === 0 ? "tablet:pl-0" : ""} ${
              i === steps.length - 1 ? "tablet:pr-0" : ""
            }`}
          >
            <p className="flex items-baseline gap-2 text-[10px] font-medium uppercase tracking-wide">
              <span className="tabular-nums text-[#47B881]">{i + 1}</span>
              <span className="min-w-0 truncate text-[rgba(255,255,255,0.42)]">
                {item.step}
              </span>
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-[rgba(255,255,255,0.72)]">
              {item.detail}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function StrategyFlowStepper({ steps }) {
  const theme = useCopilotTheme();
  if (!steps?.length) return null;

  if (theme.isV3) {
    return (
      <FlowStepList
        steps={steps}
        titleClassName={v3SectionTitle}
        shellClassName="border-b border-white/6 py-5"
      />
    );
  }

  if (theme.isV2) {
    return (
      <FlowStepList
        steps={steps}
        titleClassName="text-sm font-medium text-[rgba(255,255,255,0.88)]"
        shellClassName="rounded-xl border border-[#242424] bg-[#121212] px-4 py-4 sm:px-5"
      />
    );
  }

  return (
    <div className={theme.flowCard}>
      <h4 className="text-sm font-bold text-white">Strategy flow</h4>
      <ol className="mt-3 flex flex-col gap-3 tablet:flex-row tablet:gap-0 tablet:divide-x tablet:divide-[#242424]">
        {steps.map((item, i) => (
          <li
            key={item.step}
            className={`min-w-0 flex-1 ${i > 0 ? "tablet:pl-3" : ""} ${
              i < steps.length - 1 ? "tablet:pr-3" : ""
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#757575]">
              {i + 1}. {item.step}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#929292]">
              {item.detail}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
