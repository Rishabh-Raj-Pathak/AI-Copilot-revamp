import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HeaderTerminal from "./HeaderTerminal.jsx";
import MarketFiltersBar from "./MarketFiltersBar.jsx";
import SuggestionToolbar from "./SuggestionToolbar.jsx";
import CopilotSuggestionCard from "./suggestion/CopilotSuggestionCard.jsx";
import DetailsPanel from "./DetailsPanel.jsx";
import TradeSuccessModal from "./TradeSuccessModal.jsx";
import CopilotBottomActivityDock from "./CopilotBottomActivityDock.jsx";
import { COPILOT_SETUPS } from "./copilotSetups.js";
import {
  advanceCopilotTourToPositionsFromOpenTradeClick,
  destroyCopilotProductTourIfStillActive,
  isCopilotTourCompleted,
  notifyCopilotTourTerminalPlatformChanged,
  refreshCopilotTourIfActive,
  startCopilotProductTour,
} from "../../copilot/copilotTour.js";

const FIRST_SETUP_ID = COPILOT_SETUPS[0]?.id;

export default function TerminalCopilotPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [terminalPlatform, setTerminalPlatform] = useState("hyperliquid");
  const terminalPlatformRef = useRef("hyperliquid");
  const [copilotTourStepIndex, setCopilotTourStepIndex] = useState(-1);
  const [tourFirstTradeDemo, setTourFirstTradeDemo] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tradeSuccessOpen, setTradeSuccessOpen] = useState(false);
  const [highlightOpenedPositionRow, setHighlightOpenedPositionRow] =
    useState(false);
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

  const prepareSuggestionTourStep = useCallback(
    () =>
      new Promise((resolve) => {
        setSelectedId((id) => id ?? FIRST_SETUP_ID ?? null);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.setTimeout(resolve, 56);
          });
        });
      }),
    [],
  );

  useEffect(() => {
    terminalPlatformRef.current = terminalPlatform;
  }, [terminalPlatform]);

  const selectedSetup = useMemo(
    () =>
      selectedId
        ? (COPILOT_SETUPS.find((s) => s.id === selectedId) ?? null)
        : null,
    [selectedId],
  );

  const tourDemoPosition = useMemo(() => {
    if (!tourFirstTradeDemo) return null;
    const s = selectedSetup ?? COPILOT_SETUPS[0];
    if (!s) return null;
    const entry = Number(s.price);
    const mark = Math.round((entry - 0.02) * 100) / 100;
    return {
      symbol: s.symbol,
      side: s.direction === "short" ? "Short" : "Long",
      sizeLabel: `120 ${s.symbol}`,
      entry: `$${entry.toFixed(2)}`,
      mark: `$${mark.toFixed(2)}`,
      upnl: "+$2.40",
      openedAt: "Just now",
    };
  }, [tourFirstTradeDemo, selectedSetup]);

  const copilotTourHandlers = useMemo(
    () => ({
      onStepIndexChange: setCopilotTourStepIndex,
      prepareSuggestionTourStep,
      getTerminalPlatformId: () => terminalPlatformRef.current,
    }),
    [prepareSuggestionTourStep],
  );

  const runProductTour = useCallback(() => {
    setCopilotTourStepIndex(-1);
    setTourFirstTradeDemo(false);
    setHighlightOpenedPositionRow(false);
    setSelectedId(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startCopilotProductTour(copilotTourHandlers);
      });
    });
  }, [copilotTourHandlers]);

  const handleSuggestionSelect = useCallback(
    (id) => {
      setSelectedId((cur) => {
        if (cur === id) {
          if (copilotTourStepIndex >= 2 && copilotTourStepIndex <= 4)
            return cur;
          return null;
        }
        return id;
      });
      if (copilotTourStepIndex === 2) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => refreshCopilotTourIfActive());
        });
      }
    },
    [copilotTourStepIndex],
  );

  const handleTerminalPlatformChange = useCallback((id) => {
    setTerminalPlatform(id);
    notifyCopilotTourTerminalPlatformChanged(id);
    refreshCopilotTourIfActive();
  }, []);

  useEffect(() => {
    if (!walletConnected || isCopilotTourCompleted()) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      startCopilotProductTour(copilotTourHandlers);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [walletConnected, copilotTourHandlers]);

  const dismissTradeSuccessModal = useCallback(() => {
    setTradeSuccessOpen(false);
    if (!tourFirstTradeDemo) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHighlightOpenedPositionRow(true);
        window.setTimeout(() => setHighlightOpenedPositionRow(false), 2800);
      });
    });
  }, [tourFirstTradeDemo]);

  const handleOpenTradeCtaClick = useCallback(() => {
    advanceCopilotTourToPositionsFromOpenTradeClick();
    destroyCopilotProductTourIfStillActive();
    setTradeSuccessOpen(true);
    setTourFirstTradeDemo(true);
  }, []);

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
      <HeaderTerminal
        onProductTour={runProductTour}
        walletConnected={walletConnected}
        onWalletConnected={() => setWalletConnected(true)}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={handleTerminalPlatformChange}
      />
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
            <div
              className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-5"
              data-tour="copilot-suggestions-list"
            >
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
                    />
                  );
                })}
              </div>
            </div>
            <CopilotBottomActivityDock
              tourDemoPosition={tourDemoPosition}
              highlightOpenedPositionRow={highlightOpenedPositionRow}
            />
          </div>
        </main>
        <DetailsPanel
          setup={selectedSetup}
          openTradeCtaLabel={
            copilotTourStepIndex >= 3 && copilotTourStepIndex <= 4
              ? "Open your first trade"
              : undefined
          }
          onOpenTradeCtaClick={handleOpenTradeCtaClick}
        />
      </div>
      <TradeSuccessModal
        open={tradeSuccessOpen}
        onViewPortfolio={dismissTradeSuccessModal}
        onShareSetup={dismissTradeSuccessModal}
      />
    </div>
  );
}
