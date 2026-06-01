import { ChevronRight } from "lucide-react";
import { useCopilotTheme } from "./StrategyCopilotContext.jsx";
import {
  v3DetailText,
  v3LabelText,
  v3SectionTitle,
} from "./workstation/V3TabLayout.jsx";

export default function StrategyFlowStepper({ steps }) {
  const theme = useCopilotTheme();
  if (!steps?.length) return null;

  if (theme.isV3) {
    return (
      <section className="border-b border-white/6 py-5">
        <h4 className={v3SectionTitle}>Strategy flow</h4>
        <ol className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-0">
          {steps.map((item, i) => (
            <li
              key={item.step}
              className="flex min-w-0 flex-1 items-start gap-2 lg:px-3 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <span
                  className={`mt-0.5 shrink-0 ${theme.flowStepNum}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={v3LabelText}>{item.step}</p>
                  <p className={`mt-1 ${v3DetailText}`}>{item.detail}</p>
                </div>
              </div>
              {i < steps.length - 1 ? (
                <ChevronRight
                  className="mx-1 mt-1 hidden size-3.5 shrink-0 text-[rgba(255,255,255,0.22)] lg:block"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <div className={theme.flowCard}>
      <h4 className="text-sm font-bold text-white">Strategy flow</h4>
      <ol
        className={`mt-4 flex flex-col gap-4 ${
          theme.isV2
            ? "tablet:flex-row tablet:items-start tablet:gap-1"
            : "tablet:flex-row tablet:items-stretch tablet:gap-2"
        }`}
      >
        {steps.map((item, i) => (
          <li key={item.step} className="flex min-w-0 flex-1 items-start gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <span className={theme.flowStepNum}>{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#757575]">
                  {item.step}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#929292]">
                  {item.detail}
                </p>
              </div>
            </div>
            {theme.isV2 && i < steps.length - 1 ? (
              <ChevronRight
                className="mx-0.5 mt-1 hidden size-4 shrink-0 text-[#585858] tablet:block"
                aria-hidden
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
