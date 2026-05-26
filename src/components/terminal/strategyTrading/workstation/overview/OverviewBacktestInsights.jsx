export default function OverviewBacktestInsights({ insights }) {
  if (!insights?.length) return null;
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <h4 className="text-xs font-medium text-[#929292]">AI insights</h4>
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
