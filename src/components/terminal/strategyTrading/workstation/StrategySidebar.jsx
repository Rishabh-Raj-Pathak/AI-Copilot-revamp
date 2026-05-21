import { Plus, Search } from "lucide-react";
import { useState } from "react";
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
  const [search, setSearch] = useState("");

  const filtered = strategies.filter((s) => {
    const q = search.trim().toLowerCase();
    if (q && !s.name.toLowerCase().includes(q) && !s.market?.toLowerCase().includes(q)) {
      return false;
    }
    if (filter === "all") return true;
    if (filter === "draft") return s.status === "Draft";
    if (filter === "backtested") return s.status === "Backtested";
    if (filter === "paper") return s.status === "Paper Trading";
    if (filter === "ready") return s.status === "Ready";
    return true;
  });

  const dexList = preferences.preferredDexes?.join(", ") ?? "Hyperliquid";

  return (
    <aside className="flex h-full w-full flex-col border-r border-[#242424] bg-[#0a0a0a] tablet:w-[17rem] tablet:min-w-[17rem] tablet:max-w-[20rem] xl:w-[19rem]">
      <div className="shrink-0 border-b border-[#242424] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          Strategy Copilot
        </p>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="mt-2 w-full justify-center gap-1.5"
          onClick={onNewStrategy}
        >
          <Plus className="size-4" aria-hidden />
          New Strategy
        </Button>
        <label className="relative mt-2 flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-[#585858]" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search strategies…"
            className="w-full rounded-md border border-[#242424] bg-black py-1.5 pl-8 pr-2 text-xs text-white placeholder:text-[#585858] focus:border-[#454545] focus:outline-none"
          />
        </label>
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
        {filtered.length === 0 ? (
          <p className="px-1 py-4 text-center text-[10px] text-[#757575]">No strategies match.</p>
        ) : (
          filtered.map((s) => {
            const active = s.id === selectedId;
            const perf = s.performancePreview;
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
                <p className="mt-1 text-[10px] text-[#757575]">{s.market}</p>
                <div className="mt-1 flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-[#585858]">{s.lastUpdated}</span>
                  {perf ? (
                    <span
                      className={
                        perf.startsWith("+") || perf.startsWith("Sharpe")
                          ? "font-medium text-[#00f3b6]"
                          : "text-[#929292]"
                      }
                    >
                      {perf}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-[#242424] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#585858]">
          Your profile
        </p>
        <div className="mt-1.5 space-y-0.5 text-[10px] text-[#757575]">
          <p>
            Risk:{" "}
            <span className="capitalize text-[#929292]">{preferences.riskPreference}</span>
          </p>
          <p>
            Max leverage: <span className="text-[#929292]">{preferences.maxLeverage}</span>
          </p>
          <p>
            Execution:{" "}
            <span className="text-[#929292]">Manual approval</span>
          </p>
          <p className="truncate" title={dexList}>
            DEXes: <span className="text-[#929292]">{dexList}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
