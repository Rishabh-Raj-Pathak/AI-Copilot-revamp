import { useCallback, useEffect, useMemo, useState } from "react";
import HeaderTerminal from "./HeaderTerminal.jsx";
import MarketFiltersBar from "./MarketFiltersBar.jsx";
import SuggestionToolbar from "./SuggestionToolbar.jsx";
import CopilotSuggestionCard from "./suggestion/CopilotSuggestionCard.jsx";
import DetailsPanel from "./DetailsPanel.jsx";
import CopilotBottomActivityDock from "./CopilotBottomActivityDock.jsx";
import { COPILOT_SETUPS } from "./copilotSetups.js";
import {
  isCopilotTourCompleted,
  startCopilotProductTour,
} from "../../copilot/copilotTour.js";

const FIRST_SETUP_ID = COPILOT_SETUPS[0]?.id;

/** First paint must include right-panel tour targets; avoids building steps before React commits. */
function initialSelectedIdForCopilot() {
  if (typeof window === "undefined") return null;
  if (isCopilotTourCompleted()) return null;
  return FIRST_SETUP_ID ?? null;
}

export default function TerminalCopilotPage() {
  const [selectedId, setSelectedId] = useState(initialSelectedIdForCopilot);
  const [activeFilter, setActiveFilter] = useState("trending");
  const [expireSec, setExpireSec] = useState(630);
  const [stats, setStats] = useState({
    volume: 45_000_000,
    trades: 812,
    winPct: 63,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setExpireSec((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const runProductTour = useCallback(() => {
    setSelectedId((prev) => prev ?? FIRST_SETUP_ID ?? null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startCopilotProductTour();
      });
    });
  }, []);

  useEffect(() => {
    if (isCopilotTourCompleted()) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      startCopilotProductTour();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  const selectedSetup = useMemo(
    () =>
      selectedId
        ? (COPILOT_SETUPS.find((s) => s.id === selectedId) ?? null)
        : null,
    [selectedId],
  );

  const handleSuggestionSelect = (id) => {
    setSelectedId((cur) => (cur === id ? null : id));
  };

  const handleRefresh = () => {
    setExpireSec(630);
    setStats((prev) => ({
      volume: prev.volume + Math.floor(Math.random() * 120_000),
      trades: prev.trades + Math.floor(Math.random() * 6),
      winPct: Math.min(
        99,
        Math.max(55, prev.winPct + (Math.random() > 0.5 ? 1 : -1)),
      ),
    }));
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white">
      <HeaderTerminal onProductTour={runProductTour} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
        <main className="flex h-full min-h-0 min-w-0 flex-[3_1_0] basis-0 flex-col overflow-hidden border-r border-[#242424]">
          <MarketFiltersBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            stats={stats}
          />
          <div className="shrink-0 px-5 pt-5 pb-5">
            <SuggestionToolbar
              expireSeconds={expireSec}
              onRefresh={handleRefresh}
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-5">
              <div className="flex flex-col gap-4">
                {COPILOT_SETUPS.map((setup) => {
                  const isSelected = setup.id === selectedId;
                  return (
                    <CopilotSuggestionCard
                      key={setup.id}
                      setup={setup}
                      expanded={isSelected}
                      selected={isSelected}
                      onSelect={handleSuggestionSelect}
                      dataTour={
                        setup.id === FIRST_SETUP_ID ? "ai-setup-card" : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
            <CopilotBottomActivityDock />
          </div>
        </main>
        <DetailsPanel setup={selectedSetup} />
      </div>
    </div>
  );
}
