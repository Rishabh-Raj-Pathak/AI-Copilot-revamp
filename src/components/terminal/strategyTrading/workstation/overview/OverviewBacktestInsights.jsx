import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";

export default function OverviewBacktestInsights({ insights }) {
  const theme = useCopilotTheme();
  if (!insights?.length) return null;

  if (theme.isV3) {
    return (
      <section className="border-b border-white/6 py-5">
        <h4 className={theme.overviewPanelTitle}>AI insights</h4>
        <ul className="mt-3 space-y-2.5">
          {insights.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-[13px] leading-relaxed text-[rgba(255,255,255,0.58)]"
            >
              <span
                className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-[var(--ds-copilot-v2-mint)]"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4">
      <h4 className={theme.overviewPanelTitle}>AI insights</h4>
      <ul className="mt-3 space-y-2.5">
        {insights.map((item) => (
          <li
            key={item}
            className="flex gap-2.5 text-[11px] leading-relaxed text-[#929292]"
          >
            <span
              className="mt-[0.4rem] size-1 shrink-0 rounded-full bg-[#585858]"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
