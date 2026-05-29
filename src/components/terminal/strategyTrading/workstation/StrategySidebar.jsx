import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { terminalGradientCta } from "../../../../design-system/tokens/terminalConnectWallet";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { SIDEBAR_FILTERS } from "../strategyWorkstationMockData.js";
import ScrollFade from "./ScrollFade.jsx";
import { StatusBadge } from "./statusBadge.jsx";

export default function StrategySidebar({
  strategies,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
  onNewStrategy,
}) {
  const [search, setSearch] = useState("");
  const theme = useCopilotTheme();

  const filtered = strategies.filter((s) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      !s.name.toLowerCase().includes(q) &&
      !s.market?.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (filter === "all") return true;
    if (filter === "draft") return s.status === "Draft";
    if (filter === "backtested") return s.status === "Backtested";
    if (filter === "paper") return s.status === "Paper Trading";
    if (filter === "ready") return s.status === "Ready";
    return true;
  });

  return (
    <aside
      className={`flex h-full w-full min-h-0 flex-col border-r ${theme.panel}`}
    >
      <div className={`shrink-0 border-b ${theme.panel} p-3`}>
        <button
          type="button"
          className={`${theme.isV2 ? theme.gradientCta : terminalGradientCta.componentClassName} ${theme.newStrategyBtn}`}
          onClick={onNewStrategy}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          New Strategy
        </button>
        <label className="relative mt-2.5 flex items-center">
          <Search
            className="pointer-events-none absolute left-2.5 size-3.5 text-[#585858]"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search strategies…"
            className={`w-full py-2 pl-8 pr-2 text-xs ${theme.input}`}
          />
        </label>
      </div>

      <ScrollFade
        axis="x"
        fadeColor="#0D100F"
        className={`shrink-0 border-b ${theme.panel}`}
        viewportClassName="flex gap-1.5 px-2 py-2.5"
      >
        {SIDEBAR_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={
              filter === f.id ? theme.filterActive : theme.filterIdle
            }
          >
            {f.label}
          </button>
        ))}
      </ScrollFade>

      <ScrollFade
        axis="y"
        fadeColor="#0D100F"
        className="min-h-0 flex-1"
        viewportClassName="space-y-2 p-2.5"
      >
        {filtered.length === 0 ? (
          <p className="px-1 py-4 text-center text-[10px] text-[#757575]">
            No strategies match.
          </p>
        ) : (
          filtered.map((s) => {
            const active = s.id === selectedId;
            const perf = s.performancePreview;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={`w-full text-left transition-colors ${
                  active ? theme.strategyCardActive : theme.strategyCard
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {s.name}
                  </p>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-1 text-[10px] text-[#757575]">
                  {s.market?.replace(" · ", " · ") ?? s.market}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-[#585858]">{s.lastUpdated}</span>
                  {perf ? (
                    <span
                      className={
                        perf.startsWith("+") || perf.startsWith("Sharpe")
                          ? "font-semibold text-[#00f3b6]"
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
      </ScrollFade>
    </aside>
  );
}
