import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";

export function OverviewStatRow({ label, value, valueTone }) {
  const theme = useCopilotTheme();
  const valueClass =
    valueTone === "positive"
      ? theme.textPositive
      : valueTone === "negative"
        ? theme.textNegative
        : theme.textSecondary;
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2.5 last:border-0 last:pb-0 first:pt-0 ${
        theme.isV3
          ? "border-b border-white/[0.05]"
          : "border-b border-dotted border-white/[0.06]"
      }`}
    >
      <dt
        className={`text-xs ${theme.isV3 ? theme.textMuted : "text-[var(--ds-copilot-v2-text-muted)]"}`}
      >
        {label}
      </dt>
      <dd className={`text-xs font-medium tabular-nums ${valueClass}`}>
        {value}
      </dd>
    </div>
  );
}

export function OverviewDetailCard({ title, children, className = "" }) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-[#242424] bg-[var(--ds-copilot-v2-elevated)] p-4 ${className}`}
    >
      <h4 className="text-xs font-medium text-[var(--ds-copilot-v2-text-secondary)]">
        {title}
      </h4>
      <dl className="mt-1 flex flex-1 flex-col">{children}</dl>
    </div>
  );
}
