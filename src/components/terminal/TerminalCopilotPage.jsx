import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HeaderTerminal from "./HeaderTerminal.jsx";
import MarketFiltersBar from "./MarketFiltersBar.jsx";
import SuggestionToolbar from "./SuggestionToolbar.jsx";
import CopilotSuggestionCard from "./suggestion/CopilotSuggestionCard.jsx";
import DetailsPanel from "./DetailsPanel.jsx";
import TradeSuccessModal from "./TradeSuccessModal.jsx";
import CopilotBottomActivityDock from "./CopilotBottomActivityDock.jsx";
import { AiCopilotThesisModal } from "./AiCopilotThesisModal.tsx";
import { COPILOT_SETUPS } from "./copilotSetups.js";
import {
  advanceCopilotTourMoveNextIfActive,
  advanceCopilotTourToPositionsFromOpenTradeClick,
  COPILOT_TOUR_VARIANT_1,
  COPILOT_TOUR_VARIANT_2,
  destroyCopilotProductTourIfStillActive,
  isCopilotTour2Completed,
  isCopilotTourOnViewThesisStep,
  notifyCopilotTourTerminalPlatformChanged,
  refreshCopilotTourIfActive,
  startCopilotProductTour,
} from "../../copilot/copilotTour.js";

const FIRST_SETUP_ID = COPILOT_SETUPS[0]?.id;

export default function TerminalCopilotPage({
  walletConnected: walletConnectedProp,
  onWalletConnected,
  terminalPlatform: terminalPlatformProp,
  onTerminalPlatformChange,
  onOpenVaults,
}) {
  const [localWallet, setLocalWallet] = useState(false);
  const [localPlatform, setLocalPlatform] = useState("hyperliquid");
  const walletConnected = walletConnectedProp ?? localWallet;
  const terminalPlatform = terminalPlatformProp ?? localPlatform;
  const terminalPlatformRef = useRef("hyperliquid");
  const [copilotTourStepIndex, setCopilotTourStepIndex] = useState(-1);
  const [copilotTourVariant, setCopilotTourVariant] = useState(
    /** @type {null | typeof COPILOT_TOUR_VARIANT_1 | typeof COPILOT_TOUR_VARIANT_2} */ (
      null
    ),
  );
  const [tourFirstTradeDemo, setTourFirstTradeDemo] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tradeSuccessOpen, setTradeSuccessOpen] = useState(false);
  const [thesisOpen, setThesisOpen] = useState(false);
  const [thesisInstrumentTitle, setThesisInstrumentTitle] =
    useState("BTC/USDC");
  const viewThesisModalOpenedOnTourStepRef = useRef(false);
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

  useEffect(() => {
    const onViewThesisStep =
      (copilotTourVariant === COPILOT_TOUR_VARIANT_1 &&
        copilotTourStepIndex === 3) ||
      (copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
        copilotTourStepIndex === 2);
    if (!onViewThesisStep) viewThesisModalOpenedOnTourStepRef.current = false;
  }, [copilotTourStepIndex, copilotTourVariant]);

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

  const ensureThesisClosedForTour = useCallback(
    () =>
      new Promise((resolve) => {
        setThesisOpen(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.setTimeout(resolve, 56);
          });
        });
      }),
    [],
  );

  const ensureThesisOpenForTour = useCallback(
    () =>
      new Promise((resolve) => {
        const id = selectedId ?? FIRST_SETUP_ID ?? null;
        const s = id
          ? (COPILOT_SETUPS.find((x) => x.id === id) ?? COPILOT_SETUPS[0])
          : COPILOT_SETUPS[0];
        if (s) setThesisInstrumentTitle(`${s.symbol}/USDC`);
        setThesisOpen(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.setTimeout(resolve, 80);
          });
        });
      }),
    [selectedId],
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

  const handleTourContextChange = useCallback((ctx) => {
    setCopilotTourStepIndex(ctx.stepIndex);
    setCopilotTourVariant(ctx.variant);
  }, []);

  const copilotTourHandlers = useMemo(
    () => ({
      onTourContextChange: handleTourContextChange,
      prepareSuggestionTourStep,
      ensureThesisClosedForTour,
      ensureThesisOpenForTour,
      getTerminalPlatformId: () => terminalPlatformRef.current,
    }),
    [
      handleTourContextChange,
      prepareSuggestionTourStep,
      ensureThesisClosedForTour,
      ensureThesisOpenForTour,
    ],
  );

  const resetTourPageState = useCallback(() => {
    setCopilotTourStepIndex(-1);
    setCopilotTourVariant(null);
    setTourFirstTradeDemo(false);
    setHighlightOpenedPositionRow(false);
    setSelectedId(null);
    setThesisOpen(false);
  }, []);

  const runProductTour1 = useCallback(() => {
    resetTourPageState();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startCopilotProductTour(copilotTourHandlers, COPILOT_TOUR_VARIANT_1);
      });
    });
  }, [copilotTourHandlers, resetTourPageState]);

  const runProductTour2 = useCallback(() => {
    resetTourPageState();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startCopilotProductTour(copilotTourHandlers, COPILOT_TOUR_VARIANT_2);
      });
    });
  }, [copilotTourHandlers, resetTourPageState]);

  const handleSuggestionSelect = useCallback(
    (id) => {
      const maxLockStep =
        copilotTourVariant === COPILOT_TOUR_VARIANT_1 ? 5 : 4;
      setSelectedId((cur) => {
        if (cur === id) {
          if (
            copilotTourStepIndex >= 2 &&
            copilotTourStepIndex <= maxLockStep
          )
            return cur;
          return null;
        }
        return id;
      });
      const refreshTour1 =
        copilotTourVariant === COPILOT_TOUR_VARIANT_1 &&
        copilotTourStepIndex >= 2 &&
        copilotTourStepIndex <= 4;
      const refreshTour2 =
        copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
        (copilotTourStepIndex === 2 || copilotTourStepIndex === 3);
      if (refreshTour1 || refreshTour2) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => refreshCopilotTourIfActive());
        });
      }
    },
    [copilotTourStepIndex, copilotTourVariant],
  );

  const handleWalletConnected = useCallback(() => {
    onWalletConnected?.();
    if (walletConnectedProp === undefined) setLocalWallet(true);
  }, [onWalletConnected, walletConnectedProp]);

  const handleTerminalPlatformChange = useCallback(
    (id) => {
      onTerminalPlatformChange?.(id);
      if (terminalPlatformProp === undefined) setLocalPlatform(id);
      notifyCopilotTourTerminalPlatformChanged(id);
      refreshCopilotTourIfActive();
    },
    [onTerminalPlatformChange, terminalPlatformProp],
  );

  useEffect(() => {
    if (!walletConnected || isCopilotTour2Completed()) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      startCopilotProductTour(copilotTourHandlers, COPILOT_TOUR_VARIANT_2);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [walletConnected, copilotTourHandlers]);

  const handleThesisOpenChange = useCallback((open) => {
    setThesisOpen(open);
    if (open) {
      if (isCopilotTourOnViewThesisStep()) {
        viewThesisModalOpenedOnTourStepRef.current = true;
      }
      return;
    }
    if (
      viewThesisModalOpenedOnTourStepRef.current &&
      isCopilotTourOnViewThesisStep()
    ) {
      viewThesisModalOpenedOnTourStepRef.current = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          advanceCopilotTourMoveNextIfActive();
          refreshCopilotTourIfActive();
        });
      });
    }
  }, []);

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
        onProductTour1={runProductTour1}
        onProductTour2={runProductTour2}
        activeNavItem="AI Copilot"
        onNavItemClick={(label) => {
          if (label === "Vaults") onOpenVaults?.();
        }}
        showProductTour
        walletConnected={walletConnected}
        onWalletConnected={handleWalletConnected}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={handleTerminalPlatformChange}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row"
        data-tour="copilot-suggestion-and-setup"
      >
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:h-full lg:flex-[3_1_0] lg:basis-0 lg:border-r lg:border-[#242424]">
          <MarketFiltersBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            stats={stats}
          />
          <div className="shrink-0 px-3 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5">
            <SuggestionToolbar
              expireSeconds={expireSec}
              onRefresh={handleRefresh}
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div
              className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 pb-4 sm:px-5 sm:pb-5"
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
                      onViewThesis={() => {
                        setThesisInstrumentTitle(`${setup.symbol}/USDC`);
                        setThesisOpen(true);
                      }}
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
        <div
          className={
            selectedSetup
              ? "flex min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden border-t border-[#242424] bg-black max-lg:h-[min(52vh,28rem)] max-lg:max-h-[60vh] lg:h-full lg:flex-[1_1_0] lg:basis-0 lg:border-t-0 lg:border-l"
              : "hidden min-h-0 w-full min-w-0 lg:flex lg:h-full lg:flex-[1_1_0] lg:basis-0 lg:border-l lg:border-[#242424]"
          }
        >
          <DetailsPanel
            setup={selectedSetup}
            openTradeCtaLabel={
              (copilotTourVariant === COPILOT_TOUR_VARIANT_1 &&
                copilotTourStepIndex === 5) ||
              (copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
                copilotTourStepIndex === 4)
                ? "Place my trade"
                : undefined
            }
            onOpenTradeCtaClick={handleOpenTradeCtaClick}
          />
        </div>
      </div>
      <TradeSuccessModal
        open={tradeSuccessOpen}
        onViewPortfolio={dismissTradeSuccessModal}
        onShareSetup={dismissTradeSuccessModal}
      />
      <AiCopilotThesisModal
        open={thesisOpen}
        onOpenChange={handleThesisOpenChange}
        instrumentTitle={thesisInstrumentTitle}
      />
    </div>
  );
}
