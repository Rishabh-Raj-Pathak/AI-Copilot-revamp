import { useCallback, useEffect, useRef, useState } from "react";
import MobilePositionsPanel from "../positions/MobilePositionsPanel.jsx";
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
 *   ┌─────────────────────────────────────────┐
 *   │ High Conviction ⌄     (venue)(pts)(wal) │  pinned header — replaces the
 *   │ Strategy · Medium risk                  │  app top bar on this screen
 *   │ Strategies 2  Portfolio 5    ⇪  ⟳ 9:50 │
 *   ├─────────────────────────────────────────┤
 *   │ chips · setups                          │  Strategies: own scroll, pull to refresh
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
  onWalletConnected,
  onWalletDisconnect,
  onTerminalPlatformChange,
}) {
  const [view, setView] = useState("ideas");
  const [scanning, setScanning] = useState(false);
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

  // `counts` is null while signed out — the Portfolio tab then shows no count.
  const onCountsChange = useCallback((counts) => setPositionsCount(counts?.positions ?? null), []);
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
        onWalletConnected={onWalletConnected}
        onWalletDisconnect={onWalletDisconnect}
        onTerminalPlatformChange={onTerminalPlatformChange}
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
      />

      <div
        id={MOBILE_POSITIONS_ANCHOR_ID}
        hidden={view !== "positions"}
        role="tabpanel"
        aria-label="Positions"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-app-bg pb-[var(--app-tab-bar-h)] app-fade-in"
      >
        {/* `grow` lets the signed-out empty state centre in the free space. */}
        <MobilePositionsPanel
          walletConnected={walletConnected}
          source="copilot"
          onCountsChange={onCountsChange}
          onPlaceOrder={() => setView("ideas")}
          className="grow border-t-0!"
        />
      </div>
    </div>
  );
}
