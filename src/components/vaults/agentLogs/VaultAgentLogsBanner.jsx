import { AlertTriangle, X } from "lucide-react";

export default function VaultAgentLogsBanner({ blocker, onViewLogs, onDismiss }) {
  if (!blocker) return null;

  const isCritical = blocker.severity === "critical";

  return (
    <div
      className={`vaults-root relative rounded-[14px] border px-4 py-3.5 pr-11 sm:pr-12 ${
        isCritical
          ? "border-[rgba(229,72,77,0.28)] bg-[rgba(229,72,77,0.06)]"
          : "border-[rgba(255,105,0,0.22)] bg-[rgba(255,105,0,0.06)]"
      }`}
      role="status"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss alert"
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-lg text-[#717182] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#e8d5b5]"
      >
        <X className="size-4" strokeWidth={1.75} />
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <AlertTriangle
            className={`mt-0.5 size-4 shrink-0 ${isCritical ? "text-[#e5484d]" : "text-[#ff8904]"}`}
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="min-w-0">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${isCritical ? "text-[#e5484d]" : "text-[#ff8904]"}`}
            >
              {isCritical ? "Critical" : "Action required"}
            </p>
            <p className="mt-1 text-[13px] font-medium leading-snug text-[#e8d5b5]">
              {blocker.title}
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#717182]">
              {blocker.body}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-2">
          {blocker.cta?.label ? (
            <button
              type="button"
              className="h-[34px] rounded-[10px] border border-[#785a28] px-3.5 text-[11px] font-medium uppercase tracking-[0.35px] text-[#bfbfbf] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#ccb17f] hover:text-white"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)",
              }}
            >
              {blocker.cta.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onViewLogs}
            className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#ccb17f] underline decoration-[rgba(204,177,127,0.45)] underline-offset-[3px] hover:text-[#e8d5b5]"
          >
            View in Agent Logs
          </button>
        </div>
      </div>
    </div>
  );
}
