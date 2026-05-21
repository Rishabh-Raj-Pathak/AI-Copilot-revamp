import { Plus } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import { SIDEBAR_FILTERS } from "../strategyWorkstationMockData.js";
import { StatusBadge } from "./statusBadge.jsx";

export default function StrategySidebar({
  strategies,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
  onNewStrategy,
  preferences,
}) {
  const filtered = strategies.filter((s) => {
    if (filter === "all") return true;
    if (filter === "drafts") return s.status === "Draft";
    if (filter === "agents") return s.isAgent || s.status === "Watching";
    if (filter === "paper") return s.status === "Paper Trading";
    if (filter === "deployed") return s.status === "Ready to Deploy";
    return true;
  });

  return (
    <aside className="flex h-full w-full flex-col border-r border-[#242424] bg-[#0a0a0a] tablet:w-[17rem] tablet:min-w-[17rem] tablet:max-w-[20rem] xl:w-[19rem]">
      <div className="shrink-0 border-b border-[#242424] p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center gap-1.5"
          onClick={onNewStrategy}
        >
          <Plus className="size-4" aria-hidden />
          New Strategy
        </Button>
      </div>

      <div className="minimal-scrollbar flex gap-1 overflow-x-auto border-b border-[#242424] px-2 py-2">
        {SIDEBAR_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium ${
              filter === f.id
                ? "bg-[#3e2e00] text-[#f2b500]"
                : "text-[#929292] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="minimal-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        {filtered.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                active
                  ? "border-[#f2b500]/35 bg-[#121212] shadow-[inset_0_0_0_1px_rgba(242,181,0,0.15)]"
                  : "border-[#242424] bg-black hover:border-[#313131] hover:bg-[#0a0a0a]"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="truncate text-xs font-semibold text-white">{s.name}</p>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-1 text-[10px] text-[#757575]">
                {s.market} · {s.strategy}
              </p>
              <p className="text-[10px] text-[#585858]">
                {s.model} · {s.timeframe} · {s.lastUpdated}
              </p>
            </button>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-[#242424] p-3 text-[10px] text-[#757575]">
        <p>
          Risk: <span className="text-[#929292] capitalize">{preferences.riskPreference}</span>
        </p>
        <p className="mt-0.5">
          Max leverage: <span className="text-[#929292]">{preferences.maxLeverage}</span>
        </p>
        <p className="mt-0.5">
          Execution: <span className="text-[#929292]">{preferences.executionPreference}</span>
        </p>
      </div>
    </aside>
  );
}
