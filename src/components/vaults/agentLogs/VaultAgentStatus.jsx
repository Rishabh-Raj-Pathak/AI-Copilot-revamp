import { ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  healthy: {
    dot: "bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.45)]",
    label: "text-[#717182]",
    border: "border-[rgba(255,255,255,0.08)]",
    bg: "bg-[rgba(8,8,10,0.65)]",
  },
  warning: {
    dot: "bg-[#ff8904] shadow-[0_0_6px_rgba(255,137,4,0.4)]",
    label: "text-[#ff8904]",
    border: "border-[rgba(255,105,0,0.22)]",
    bg: "bg-[rgba(255,105,0,0.06)]",
  },
  critical: {
    dot: "bg-[#e5484d] shadow-[0_0_6px_rgba(229,72,77,0.45)]",
    label: "text-[#e5484d]",
    border: "border-[rgba(229,72,77,0.28)]",
    bg: "bg-[rgba(229,72,77,0.06)]",
  },
};

export default function VaultAgentStatus({ health, onOpenLogs }) {
  const style = STATUS_STYLES[health.status] ?? STATUS_STYLES.healthy;

  return (
    <button
      type="button"
      onClick={onOpenLogs}
      className={`vaults-root flex w-full items-center justify-between gap-2 rounded-[10px] border px-3 py-2 text-left transition-colors hover:brightness-105 tablet:w-auto tablet:min-w-[168px] ${style.border} ${style.bg}`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${style.dot}`}
          aria-hidden
        />
        <span className={`truncate text-[10px] font-semibold uppercase tracking-[0.45px] ${style.label}`}>
          {health.statusLabel}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.35px] text-[#ccb17f]">
        {health.actionLabel}
        <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
      </span>
    </button>
  );
}
