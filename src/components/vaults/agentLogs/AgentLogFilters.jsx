import { Search } from "lucide-react";
import { VAULT_ACTIVE_TAB_GRADIENT } from "../VaultsDexTabs.jsx";

export default function AgentLogFilters({
  filterTabs,
  activeFilter,
  filterCounts,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onMarkAllRead,
}) {
  return (
    <div className="vaults-root flex flex-col gap-3 border-b border-[rgba(255,255,255,0.05)] px-5 pb-4 pt-2">
      <div className="flex items-center gap-2.5">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-[#717182]"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search logs"
            className="h-8 w-full rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] py-1.5 pl-8 pr-2.5 text-[12px] text-[#e8d5b5] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] placeholder:text-[#717182] focus:border-[rgba(120,90,40,0.35)] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-[#717182] transition-colors hover:text-[#ccb17f]"
        >
          Mark read
        </button>
      </div>

      <div className="vaults-minimal-scrollbar flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filterTabs.map((tab) => {
          const active = activeFilter === tab.id;
          const count = filterCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.3px] transition-colors ${
                active
                  ? "border-[#785a28] text-[#e8d5b5] shadow-[inset_0_0_3px_rgba(0,0,0,0.45)]"
                  : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#717182] hover:border-[rgba(120,90,40,0.2)] hover:text-[#e8d5b5]/85"
              }`}
              style={
                active ? { backgroundImage: VAULT_ACTIVE_TAB_GRADIENT } : undefined
              }
            >
              <span>{tab.label}</span>
              {count > 0 ? (
                <span
                  className={`tabular-nums ${
                    active ? "text-[#ccb17f]" : "text-[#585858]"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
