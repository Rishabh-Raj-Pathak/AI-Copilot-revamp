import { useCallback, useEffect, useRef, useState } from "react";
import MobilePositionsPanel from "../positions/MobilePositionsPanel.jsx";
import { useMobileApp } from "../MobileAppContext.js";
import CopilotAboutSheet from "./CopilotAboutSheet.jsx";
import CopilotIdeasView from "./CopilotIdeasView.jsx";
import CopilotScreenHeader from "./CopilotScreenHeader.jsx";

/** Kept for callers that still reference the old scroll anchor. */
export const MOBILE_POSITIONS_ANCHOR_ID = "copilot-mobile-positions";

/** Fired (on `window`) to bring the Positions segment forward, e.g. from a toast's "View". */
export const SHOW_POSITIONS_EVENT = "copilot:show-positions";

/**
 * How long the refresh shows its "scanning" state. The prototype's refresh is
 * instant; without a beat of visible work the list swaps under the finger and
 * nothing confirms the tap. A real API replaces this with its own latency.
 */
const SCAN_MS = 650;

/**
 * Phone AI Copilot screen (mobile-native pilot — see
 * docs/mobile/HYPREARN_MOBILE_APP_UX.md).
 *
 *   ┌ global top bar (app shell) ─────────────┐
 *   │ AI strategy · risk      [share] [ring]  │  pinned header
 *   │ High Conviction ⌄                        │
 *   │ [ Ideas 2 | Positions 5 ]               │
 *   ├─────────────────────────────────────────┤
 *   │ chips · AI status · setups · disclaimer │  Ideas: own scroll, pull to refresh
 *   │   — or —                                │
 *   │ positions panel (sticky sub-tabs)       │  Positions: own scroll, keeps state
 *   └ global tab bar ─────────────────────────┘
 *
 * Both segments stay mounted so each keeps its scroll position and the
 * positions panel keeps closed/cancelled state across switches. All data and
 * handlers come from `TerminalCopilotPage`; this only arranges them.
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
  const app = useMobileApp();
  const [view, setView] = useState("ideas");
  const [scanning, setScanning] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [positionsCount, setPositionsCount] = useState(null);
  const ideasScrollRef = useRef(null);
  const scanTimer = useRef(null);

  useEffect(() => {
    const show = () => setView("positions");
    window.addEventListener(SHOW_POSITIONS_EVENT, show);
    return () => {
      window.removeEventListener(SHOW_POSITIONS_EVENT, show);
      window.clearTimeout(scanTimer.current);
    };
  }, []);

  const refresh = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    ideasScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.clearTimeout(scanTimer.current);
    scanTimer.current = window.setTimeout(() => {
      onRefresh?.();
      setScanning(false);
    }, SCAN_MS);
  }, [scanning, onRefresh]);

  const onCountsChange = useCallback((counts) => setPositionsCount(counts.positions), []);
  const refreshing = scanning || listRefreshing;
  const strategy = strategies?.find((s) => s.id === selectedStrategyId);
  const strategyName = strategy?.shortLabel ?? emptyStrategyName;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-app-bg">
      <CopilotScreenHeader
        strategies={strategies}
        selectedStrategyId={selectedStrategyId}
        onStrategySelect={onStrategySelect}
        expireSeconds={expireSeconds}
        refreshing={refreshing}
        onRefresh={refresh}
        onShare={onShare}
        view={view}
        onViewChange={setView}
        ideasCount={refreshing ? null : setups.length}
        positionsCount={positionsCount}
      />

      <CopilotIdeasView
        active={view === "ideas"}
        scrollRef={ideasScrollRef}
        setups={setups}
        selectedId={selectedId}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        strategyName={strategyName}
        expireSeconds={expireSeconds}
        refreshing={refreshing}
        onRefresh={refresh}
        onOpenIdea={onOpenIdea}
        onBacktest={onBacktest}
        onSwitchStrategy={onSwitchStrategy}
        onAbout={() => setAboutOpen(true)}
      />

      <div
        id={MOBILE_POSITIONS_ANCHOR_ID}
        hidden={view !== "positions"}
        role="tabpanel"
        aria-label="Positions"
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-app-bg pb-[var(--app-tab-bar-h)] app-fade-in"
      >
        <MobilePositionsPanel
          walletConnected={walletConnected}
          source="copilot"
          onCountsChange={onCountsChange}
          onPlaceOrder={() => setView("ideas")}
          className="border-t-0!"
        />
      </div>

      <CopilotAboutSheet
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        onRunTutorial={app.runCopilotTutorial}
      />
    </div>
  );
}
