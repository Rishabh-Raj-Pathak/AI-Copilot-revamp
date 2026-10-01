import MobilePositionsPanel from "../positions/MobilePositionsPanel.jsx";
import CopilotSuggestionsEmpty from "../../terminal/CopilotSuggestionsEmpty.jsx";
import CopilotStrategyBar from "./CopilotStrategyBar.jsx";
import CopilotIdeaCard from "./CopilotIdeaCard.jsx";

/** Scroll target for the "position added" toast's View action. */
export const MOBILE_POSITIONS_ANCHOR_ID = "copilot-mobile-positions";

/**
 * Phone AI Copilot body — Figma "Copilot / Bluechip — Default" (939:1266):
 * Strategy Section, Trade Ideas, Positions Panel, in one scroll view that
 * clears the global tab bar.
 *
 * State lives in `TerminalCopilotPage`; this only lays it out. The tour
 * anchors (`copilot-suggestions-list`, `copilot-expanded-suggestion`,
 * `copilot-view-thesis`) sit on the same roles they had in the old phone feed.
 */
export default function MobileCopilotFeed({
  strategies,
  selectedStrategyId,
  onStrategySelect,
  activeFilter,
  onFilterChange,
  expireSeconds,
  onRefresh,
  onShare,
  setups,
  selectedId,
  listRefreshing = false,
  onOpenIdea,
  onBacktest,
  emptyStrategyName,
  onSwitchStrategy,
  walletConnected,
}) {
  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-app-bg pb-[var(--app-tab-bar-h)]"
      data-tour="copilot-suggestions-list"
    >
      <CopilotStrategyBar
        strategies={strategies}
        selectedStrategyId={selectedStrategyId}
        onStrategySelect={onStrategySelect}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        expireSeconds={expireSeconds}
        onRefresh={onRefresh}
        onShare={onShare}
      />

      <section
        aria-label="Trade ideas"
        aria-busy={listRefreshing || undefined}
        className={`flex flex-col gap-3 p-4 transition-opacity duration-300 ${
          listRefreshing ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        {setups.length === 0 ? (
          <CopilotSuggestionsEmpty
            strategyName={emptyStrategyName}
            categoryId={activeFilter}
            onSwitchCategory={onFilterChange}
            onSwitchStrategy={onSwitchStrategy}
          />
        ) : (
          setups.map((setup) => {
            const selected = setup.id === selectedId;
            return (
              <div
                key={setup.id}
                id={`copilot-setup-${setup.id}`}
                className="scroll-mt-4"
                data-tour={selected ? "copilot-expanded-suggestion" : undefined}
              >
                <CopilotIdeaCard
                  setup={setup}
                  selected={selected}
                  onOpen={onOpenIdea}
                  onBacktest={onBacktest}
                  backtestTourTarget={selected}
                />
              </div>
            );
          })
        )}
      </section>

      <div id={MOBILE_POSITIONS_ANCHOR_ID} className="scroll-mt-4">
        <MobilePositionsPanel walletConnected={walletConnected} source="copilot" />
      </div>
    </div>
  );
}
