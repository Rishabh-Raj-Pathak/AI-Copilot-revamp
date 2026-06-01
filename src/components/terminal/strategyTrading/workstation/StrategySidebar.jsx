import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { terminalGradientCta } from "../../../../design-system/tokens/terminalConnectWallet";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { SIDEBAR_FILTERS } from "../strategyWorkstationMockData.js";
import ScrollFade from "./ScrollFade.jsx";
import { StatusBadge } from "./statusBadge.jsx";
import StrategySidebarRow from "./StrategySidebarRow.jsx";
import StrategySidebarSection from "./StrategySidebarSection.jsx";
import { groupStrategiesForSidebar } from "./strategySidebarUtils.js";

function StrategySidebarV1List({
  strategies,
  selectedId,
  filter,
  onSelect,
  theme,
}) {
  const filtered = strategies.filter((s) => {
    if (filter === "all") return true;
    if (filter === "draft") return s.status === "Draft";
    if (filter === "backtested") return s.status === "Backtested";
    if (filter === "paper") return s.status === "Paper Trading";
    if (filter === "ready") return s.status === "Ready";
    return true;
  });

  if (filtered.length === 0) {
    return (
      <p
        className={`px-1 py-4 text-center text-[10px] ${theme.isV2 ? theme.textMuted : "text-[#757575]"}`}
      >
        No strategies match.
      </p>
    );
  }

  return filtered.map((s) => {
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
          <p className="truncate text-xs font-semibold text-white">{s.name}</p>
          <StatusBadge status={s.status} />
        </div>
        <p
          className={`mt-1 text-[10px] ${theme.isV2 ? theme.textSecondary : "text-[#757575]"}`}
        >
          {s.market?.replace(" · ", " · ") ?? s.market}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px]">
          <span className={theme.isV2 ? theme.textMuted : "text-[#585858]"}>
            {s.lastUpdated}
          </span>
          {perf ? (
            <span
              className={
                perf.startsWith("+") || perf.startsWith("Sharpe")
                  ? `font-semibold ${theme.isV2 ? theme.textPositive : "text-[#269755]"}`
                  : perf.startsWith("-")
                    ? `font-semibold ${theme.isV2 ? theme.textNegative : "text-[#d53d3d]"}`
                    : theme.isV2
                      ? theme.textMuted
                      : "text-[#929292]"
              }
            >
              {perf}
            </span>
          ) : null}
        </div>
      </button>
    );
  });
}

function StrategySidebarV2List({ strategies, selectedId, search, onSelect }) {
  const sections = useMemo(
    () => groupStrategiesForSidebar(strategies, search),
    [strategies, search],
  );

  if (sections.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-[10px] text-[rgba(255,255,255,0.45)]">
        No strategies match.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => (
        <StrategySidebarSection
          key={section.id}
          label={section.label}
          count={section.items.length}
          selectedId={selectedId}
          itemIds={section.items.map((s) => s.id)}
        >
          {section.items.map((s) => (
            <StrategySidebarRow
              key={`${section.id}-${s.id}`}
              strategy={s}
              active={s.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </StrategySidebarSection>
      ))}
    </div>
  );
}

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

  return (
    <aside
      className={`flex h-full w-full min-h-0 flex-col border-r ${theme.panel}`}
    >
      <div
        className={`shrink-0 border-b p-3 ${theme.panel} ${theme.isV2 ? "border-white/[0.04]" : ""}`}
      >
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
            className={`pointer-events-none absolute left-2.5 size-3.5 ${theme.isV2 ? theme.textMuted : "text-[#585858]"}`}
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

      {!theme.isV2 ? (
        <ScrollFade
          axis="x"
          fadeColor="#0D100F"
          className={`shrink-0 border-b ${theme.panel} ${theme.isV2 ? "border-white/[0.04]" : ""}`}
          viewportClassName="flex gap-1.5 px-2 py-2.5"
        >
          {SIDEBAR_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={filter === f.id ? theme.filterActive : theme.filterIdle}
            >
              {f.label}
            </button>
          ))}
        </ScrollFade>
      ) : null}

      <ScrollFade
        axis="y"
        fadeColor={theme.isV3 ? "#060807" : "#0D100F"}
        className="min-h-0 flex-1"
        viewportClassName={theme.isV3 ? "p-0" : theme.isV2 ? "p-2" : "space-y-2 p-2.5"}
      >
        {theme.isV2 ? (
          <StrategySidebarV2List
            strategies={strategies}
            selectedId={selectedId}
            search={search}
            onSelect={onSelect}
          />
        ) : (
          <StrategySidebarV1List
            strategies={strategies}
            selectedId={selectedId}
            filter={filter}
            onSelect={onSelect}
            theme={theme}
          />
        )}
      </ScrollFade>
    </aside>
  );
}
