import { ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  healthy: {
    dot: "bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.45)]",
    label: "text-[#717182]",
    border: "border-[rgba(255,255,255,0.06)]",
    bg: "bg-[rgba(6,6,8,0.85)]",
    accent: "rgba(255,255,255,0.04)",
  },
  warning: {
    dot: "bg-[#ff8904] shadow-[0_0_6px_rgba(255,137,4,0.4)]",
    label: "text-[#ff8904]",
    border: "border-[rgba(255,105,0,0.2)]",
    bg: "bg-[rgba(255,105,0,0.05)]",
    accent: "rgba(255,105,0,0.12)",
  },
  critical: {
    dot: "bg-[#e5484d] shadow-[0_0_6px_rgba(229,72,77,0.45)]",
    label: "text-[#e5484d]",
    border: "border-[rgba(229,72,77,0.24)]",
    bg: "bg-[rgba(229,72,77,0.05)]",
    accent: "rgba(229,72,77,0.14)",
  },
};

/**
 * Bottom drawer strip for activated vault rows — extends below the main row.
 */
export default function VaultAgentStatus({ health, onOpenLogs, variant = "strip" }) {
  const style = STATUS_STYLES[health.status] ?? STATUS_STYLES.healthy;
  const hasSummary = Boolean(health.issueSummary);
  const isStrip = variant === "strip";

  return (
    <button
      type="button"
      onClick={onOpenLogs}
      className={`vaults-root vaults-agent-status-strip group w-full text-left transition-colors hover:brightness-105 ${
        isStrip
          ? `border-t px-4 py-2.5 ${style.border} ${style.bg}`
          : `flex flex-col gap-1 rounded-[10px] border px-3 py-2 ${style.border} ${style.bg}`
      }`}
      style={
        isStrip
          ? {
              boxShadow: `inset 0 1px 0 ${style.accent}`,
            }
          : undefined
      }
    >
      <span
        className={`flex w-full items-center gap-3 ${
          isStrip ? "justify-between" : "flex-col items-stretch gap-1"
        }`}
      >
        <span
          className={`flex min-w-0 items-center gap-2 ${
            isStrip ? "flex-1" : "w-full justify-between"
          }`}
        >
          <span className="flex min-w-0 shrink-0 items-center gap-2">
            <span
              className={`size-1.5 shrink-0 rounded-full ${style.dot}`}
              aria-hidden
            />
            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.45px] ${style.label}`}
            >
              {health.statusLabel}
            </span>
          </span>
          {hasSummary && isStrip ? (
            <span className="hidden min-w-0 truncate text-[11px] font-medium text-[#717182] tablet:block">
              {health.issueSummary}
            </span>
          ) : null}
          {!isStrip ? (
            <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.35px] text-[#ccb17f]">
              {health.actionLabel}
              <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
            </span>
          ) : null}
        </span>

        {hasSummary && isStrip ? (
          <span className="min-w-0 truncate text-[11px] font-medium text-[#717182] tablet:hidden">
            {health.issueSummary}
          </span>
        ) : hasSummary && !isStrip ? (
          <p className="line-clamp-1 text-[11px] font-medium leading-snug text-[#717182]">
            {health.issueSummary}
          </p>
        ) : null}

        {isStrip ? (
          <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.35px] text-[#ccb17f] group-hover:text-[#e8d5b5]">
            {health.actionLabel}
            <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
          </span>
        ) : null}
      </span>
    </button>
  );
}
