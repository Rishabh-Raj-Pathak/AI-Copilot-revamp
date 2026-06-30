import {
  SEVERITY_CONFIG,
  VAULT_LOG_ROW_GRADIENT,
  formatRelativeTime,
} from "./agentLogsUtils.js";

export default function AgentLogRow({ log, onMarkRead, onCtaClick }) {
  const severity = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG.info;
  const unread = !log.readAt;

  const handleClick = () => {
    if (unread) onMarkRead?.(log.id);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="vaults-root relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.05)] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.45)] transition-[border-color] hover:border-[rgba(120,90,40,0.22)]"
      style={{ backgroundImage: VAULT_LOG_ROW_GRADIENT }}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] ${severity.badgeClass}`}
            >
              {severity.label}
            </span>
            {unread ? (
              <span
                className="size-1.5 shrink-0 rounded-full bg-[#ccb17f]"
                aria-label="Unread"
              />
            ) : null}
          </div>
          <time
            className="shrink-0 text-[11px] font-medium uppercase tracking-[0.04em] text-[#717182]"
            dateTime={log.lastOccurredAt}
          >
            {formatRelativeTime(log.lastOccurredAt)}
          </time>
        </div>

        <h3 className="mt-2.5 text-[14px] font-semibold leading-snug text-[#e8d5b5]">
          {log.title}
          {log.symbol ? (
            <span className="font-medium text-[#717182]"> — {log.symbol}</span>
          ) : null}
        </h3>

        <p className="mt-1.5 text-[13px] leading-[1.45] text-[rgba(255,255,255,0.55)]">
          {log.body}
        </p>

        {log.occurrenceCount > 1 ? (
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.06em] text-[#717182]">
            {log.occurrenceCount} occurrences
          </p>
        ) : null}

        {log.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {log.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] text-[#717182]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {log.cta?.label ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCtaClick?.(log);
            }}
            className="mt-3 h-[34px] rounded-[10px] border border-[#785a28] px-3.5 text-[12px] font-medium uppercase tracking-[0.35px] text-[#bfbfbf] shadow-[0_4px_10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-[#ccb17f] hover:text-white"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)",
            }}
          >
            {log.cta.label}
          </button>
        ) : null}
      </div>
    </article>
  );
}
