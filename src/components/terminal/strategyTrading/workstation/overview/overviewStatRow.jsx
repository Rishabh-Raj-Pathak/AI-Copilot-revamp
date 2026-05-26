export function OverviewStatRow({ label, value, valueTone }) {
  const valueClass =
    valueTone === "positive"
      ? "text-[#00f3b6]"
      : valueTone === "negative"
        ? "text-[#d53d3d]"
        : "text-[#bfbfbf]";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-[#333] py-2.5 last:border-0 last:pb-0 first:pt-0">
      <dt className="text-[11px] text-[#757575]">{label}</dt>
      <dd className={`text-[11px] font-medium tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}

export function OverviewDetailCard({ title, children, className = "" }) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 ${className}`}
    >
      <h4 className="text-xs font-medium text-[#929292]">{title}</h4>
      <dl className="mt-1 flex flex-1 flex-col">{children}</dl>
    </div>
  );
}
