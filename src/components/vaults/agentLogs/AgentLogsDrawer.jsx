import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Settings, X } from "lucide-react";
import AgentLogFilters from "./AgentLogFilters.jsx";
import AgentLogRow from "./AgentLogRow.jsx";
import AgentLogSettings from "./AgentLogSettings.jsx";
import {
  VAULT_LOG_PANEL_GRADIENT,
  groupLogsByDay,
} from "./agentLogsUtils.js";

const PANEL_TRANSITION = {
  type: "spring",
  damping: 34,
  stiffness: 380,
  mass: 0.92,
};

function DaySectionHeader({ label }) {
  return (
    <div className="vaults-section-title-centered mb-3">
      <div className="vaults-section-hairline" />
      <h3 className="shrink-0 text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] text-[rgba(113,113,130,0.6)]">
        {label}
      </h3>
      <div className="vaults-section-hairline" />
    </div>
  );
}

export default function AgentLogsDrawer({
  open,
  onClose,
  logs,
  unreadCount,
  settingsOpen,
  onToggleSettings,
  filterTabs,
  activeFilter,
  filterCounts,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onMarkAllRead,
  onMarkRead,
  categories,
  disabledCategories,
  onToggleCategory,
  hasMore,
  onLoadMore,
  vaultFilterName,
  onClearVaultFilter,
  isVaultScoped = false,
}) {
  const reduceMotion = useReducedMotion();
  const groups = groupLogsByDay(logs);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleCtaClick = (log) => {
    console.info("[Agent Logs proto] CTA clicked:", log.cta?.type, log.id);
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="agent-logs-backdrop"
          className="fixed inset-0 z-[70] bg-black/65"
          role="presentation"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onClick={onClose}
        >
          <motion.aside
            key="agent-logs-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-logs-title"
            className="vaults-root fixed inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-[rgba(120,90,40,0.28)] shadow-[-16px_0_48px_rgba(0,0,0,0.55)] max-tablet:max-w-none"
            style={{
              backgroundColor: "#0c0a08",
              backgroundImage: VAULT_LOG_PANEL_GRADIENT,
            }}
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%" }}
            transition={reduceMotion ? { duration: 0 } : PANEL_TRANSITION}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.05)] px-5 py-4 shadow-[inset_0_-1px_0_rgba(255,255,255,0.02)]">
              <div className="flex min-w-0 items-center gap-2.5">
                <h2
                  id="agent-logs-title"
                  className="text-[15px] font-semibold tracking-[0.01em] text-[#e8d5b5]"
                >
                  Agent Logs
                </h2>
                {unreadCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[rgba(120,90,40,0.35)] bg-[rgba(120,90,40,0.15)] px-1.5 text-[10px] font-semibold text-[#ccb17f]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleSettings}
                  aria-label="Log settings"
                  aria-pressed={settingsOpen}
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    settingsOpen
                      ? "border border-[#785a28] bg-[rgba(120,90,40,0.12)] text-[#ccb17f]"
                      : "text-[#717182] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e8d5b5]"
                  }`}
                >
                  <Settings className="size-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close agent logs"
                  className="flex size-8 items-center justify-center rounded-lg text-[#717182] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e8d5b5]"
                >
                  <X className="size-4" strokeWidth={1.75} />
                </button>
              </div>
            </header>

            {isVaultScoped && vaultFilterName ? (
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(120,90,40,0.08)] px-5 py-2.5">
                <p className="min-w-0 text-[12px] leading-snug text-[#e8d5b5]">
                  <span className="text-[#717182]">Showing logs for: </span>
                  <span className="font-semibold">{vaultFilterName}</span>
                </p>
                <button
                  type="button"
                  onClick={onClearVaultFilter}
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#ccb17f] underline decoration-[rgba(204,177,127,0.45)] underline-offset-[3px] hover:text-[#e8d5b5]"
                >
                  View all
                </button>
              </div>
            ) : null}

            {settingsOpen ? (
              <AgentLogSettings
                categories={categories}
                disabledCategories={disabledCategories}
                onToggleCategory={onToggleCategory}
              />
            ) : (
              <AgentLogFilters
                filterTabs={filterTabs}
                activeFilter={activeFilter}
                filterCounts={filterCounts}
                searchQuery={searchQuery}
                onFilterChange={onFilterChange}
                onSearchChange={onSearchChange}
                onMarkAllRead={onMarkAllRead}
              />
            )}

            <div className="vaults-minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-6 py-14 text-center">
                  <p className="text-[13px] font-medium text-[#717182]">
                    No logs match your filters
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange("all");
                      onSearchChange("");
                    }}
                    className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#ccb17f] underline decoration-[rgba(204,177,127,0.45)] underline-offset-[3px] hover:text-[#e8d5b5]"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {groups.map((group) => (
                    <section key={group.label}>
                      <DaySectionHeader label={group.label} />
                      <ul className="space-y-2.5">
                        {group.logs.map((log) => (
                          <li key={log.id}>
                            <AgentLogRow
                              log={log}
                              onMarkRead={onMarkRead}
                              onCtaClick={handleCtaClick}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}

              {hasMore && logs.length > 0 ? (
                <div className="mt-8 flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="h-[37px] rounded-[10px] border border-[rgba(120,90,40,0.22)] bg-[rgba(255,255,255,0.02)] px-5 text-[12px] font-medium uppercase tracking-[0.35px] text-[#8a8a94] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:border-[#785a28] hover:text-[#d4d4d8]"
                  >
                    Load more
                  </button>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
