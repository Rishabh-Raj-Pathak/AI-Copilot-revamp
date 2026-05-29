export function OverviewStatRow({ label, value, valueTone }) {
  const valueClass =
    valueTone === "positive"
      ? "text-[var(--ds-copilot-v2-positive)]"
      : valueTone === "negative"
        ? "text-[var(--ds-copilot-v2-negative)]"
        : "text-[var(--ds-copilot-v2-text-secondary)]";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-white/[0.06] py-2.5 last:border-0 last:pb-0 first:pt-0">
      <dt className="text-[11px] text-[var(--ds-copilot-v2-text-muted)]">{label}</dt>
      <dd className={`text-[11px] font-medium tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}

export function OverviewDetailCard({ title, children, className = "" }) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-white/6 bg-[var(--ds-copilot-v2-elevated)] p-4 ${className}`}
    >
      <h4 className="text-xs font-medium text-[var(--ds-copilot-v2-text-secondary)]">
        {title}
      </h4>
      <dl className="mt-1 flex flex-1 flex-col">{children}</dl>
    </div>
  );
}
