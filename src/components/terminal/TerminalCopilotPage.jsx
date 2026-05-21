import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HeaderTerminal from "./HeaderTerminal.jsx";
import CopilotMobileHeader from "./CopilotMobileHeader.jsx";
import CopilotBottomNav from "./CopilotBottomNav.jsx";
import MarketFiltersBar from "./MarketFiltersBar.jsx";
import SuggestionToolbar from "./SuggestionToolbar.jsx";
import CopilotSuggestionCard from "./suggestion/CopilotSuggestionCard.jsx";
import DetailsPanel from "./DetailsPanel.jsx";
import TradeSuccessModal from "./TradeSuccessModal.jsx";
import CopilotBottomActivityDock from "./CopilotBottomActivityDock.jsx";
import { AiCopilotThesisModal } from "./AiCopilotThesisModal.tsx";
import CopilotTutorialToast from "./CopilotTutorialToast.jsx";
import CopilotMobileTourBar from "./CopilotMobileTourBar.jsx";
import OnboardingOverlay from "./OnboardingOverlay.jsx";
import CopilotViewTabs from "./strategyTrading/CopilotViewTabs.jsx";
import {
  StrategyCopilotProvider,
  useStrategyCopilot,
} from "./strategyTrading/StrategyCopilotContext.jsx";
import StrategyTradingPage from "./strategyTrading/StrategyTradingPage.jsx";
import {
  hasSeenCopilotWelcome,
  markCopilotWelcomeSeen,
} from "../../copilot/copilotWelcome.js";
import {
  NARROW_VIEWPORT_MEDIA,
  queryVisibleTourTarget,
} from "../../styles/breakpoints.js";
import { COPILOT_SETUPS } from "./copilotSetups.js";
import {
  advanceCopilotTourMoveNextIfActive,
  advanceCopilotTourToPositionsFromOpenTradeClick,
  clearCopilotTutorialSessionDismissed,
  COPILOT_TOUR_VARIANT_2,
  destroyCopilotProductTourIfStillActive,
  getCopilotTutorialEngagement,
  isCopilotTourOnViewThesisStep,
  notifyCopilotTourTerminalPlatformChanged,
  refreshCopilotTourIfActive,
  shouldAutoStartCopilotTutorial,
  copilotTourMobileMoveNext,
  copilotTourMobileMovePrevious,
  copilotTourMobileSkip,
  getActiveCopilotTourStepIndex,
  isCopilotProductTourActive,
  startCopilotProductTour,
} from "../../copilot/copilotTour.js";

const FIRST_SETUP_ID = COPILOT_SETUPS[0]?.id;

function StrategyCopilotViews({ copilotView, terminalPlatform }) {
  if (copilotView === "strategy-trading") {
    return <StrategyTradingPage terminalPlatform={terminalPlatform} />;
  }
  return null;
}

export default function TerminalCopilotPage({
  walletConnected: walletConnectedProp,
  onWalletConnected,
  terminalPlatform: terminalPlatformProp,
  onTerminalPlatformChange,
  onOpenVaults,
  onOpenVaultTutorial,
  runProductTourOnEnter = false,
  onProductTourEnterConsumed,
}) {
  const [localWallet, setLocalWallet] = useState(false);
  const [localPlatform, setLocalPlatform] = useState("hyperliquid");
  const walletConnected = walletConnectedProp ?? localWallet;
  const terminalPlatform = terminalPlatformProp ?? localPlatform;
  const terminalPlatformRef = useRef("hyperliquid");
  const [copilotTourStepIndex, setCopilotTourStepIndex] = useState(-1);
  const [copilotTourVariant, setCopilotTourVariant] = useState(
    /** @type {null | typeof COPILOT_TOUR_VARIANT_2} */ (null),
  );
  const [tutorialToastOpen, setTutorialToastOpen] = useState(false);
  const [mobilePositionToastOpen, setMobilePositionToastOpen] = useState(false);
  const [highlightMoreForTutorial, setHighlightMoreForTutorial] =
    useState(false);
  const [showMoreTutorialHint, setShowMoreTutorialHint] = useState(false);
  const [tourFirstTradeDemo, setTourFirstTradeDemo] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tradeSuccessOpen, setTradeSuccessOpen] = useState(false);
  const [thesisOpen, setThesisOpen] = useState(false);
  const [thesisInstrumentTitle, setThesisInstrumentTitle] =
    useState("BTC/USDC");
  const viewThesisModalOpenedOnTourStepRef = useRef(false);
  const [highlightOpenedPositionRow, setHighlightOpenedPositionRow] =
    useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => !hasSeenCopilotWelcome());
  const [isNarrowViewport, setIsNarrowViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(NARROW_VIEWPORT_MEDIA).matches;
  });
  const [mobileDetailsSheetDismissed, setMobileDetailsSheetDismissed] =
    useState(false);
  const [copilotView, setCopilotView] = useState("suggestions");
  const [activeFilter, setActiveFilter] = useState("trending");
  const [expireSec, setExpireSec] = useState(0);
  const [stats, setStats] = useState({
    volume: 27_960_000,
    trades: 10_180,
    rewards: 8_580,
    winPct: 63,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setExpireSec((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_VIEWPORT_MEDIA);
    const update = () => setIsNarrowViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_VIEWPORT_MEDIA);
    const onLayoutChange = () => refreshCopilotTourIfActive();
    mq.addEventListener("change", onLayoutChange);
    return () => mq.removeEventListener("change", onLayoutChange);
  }, []);

  /** Keep mobile coach bar in sync when driver advances (hidden popover may skip handlers). */
  useEffect(() => {
    if (!isNarrowViewport) return undefined;
    const syncFromDriver = () => {
      if (!isCopilotProductTourActive()) return;
      const idx = getActiveCopilotTourStepIndex();
      if (idx < 0) return;
      setCopilotTourStepIndex((cur) => (cur === idx ? cur : idx));
      setCopilotTourVariant(COPILOT_TOUR_VARIANT_2);
    };
    syncFromDriver();
    const id = window.setInterval(syncFromDriver, 200);
    return () => window.clearInterval(id);
  }, [isNarrowViewport]);

  useEffect(() => {
    const active =
      isNarrowViewport &&
      copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
      copilotTourStepIndex >= 4 &&
      copilotTourStepIndex <= 5;
    document.body.classList.toggle("copilot-tour-mobile-trade-steps", active);
    return () => document.body.classList.remove("copilot-tour-mobile-trade-steps");
  }, [isNarrowViewport, copilotTourVariant, copilotTourStepIndex]);

  useEffect(() => {
    const onViewThesisStep =
      copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
      copilotTourStepIndex === 3;
    if (!onViewThesisStep) viewThesisModalOpenedOnTourStepRef.current = false;
  }, [copilotTourStepIndex, copilotTourVariant]);

  useEffect(() => {
    if (!isNarrowViewport) return;
    if (copilotTourVariant !== COPILOT_TOUR_VARIANT_2) return;
    if (copilotTourStepIndex < 4) return;
    if (!selectedId && FIRST_SETUP_ID) setSelectedId(FIRST_SETUP_ID);
    setMobileDetailsSheetDismissed(false);
  }, [
    isNarrowViewport,
    copilotTourVariant,
    copilotTourStepIndex,
    selectedId,
  ]);

  const prepareSuggestionTourStep = useCallback(
    () =>
      new Promise((resolve) => {
        const setupId = FIRST_SETUP_ID ?? null;
        setSelectedId((id) => id ?? setupId);
        if (isNarrowViewport) {
          setMobileDetailsSheetDismissed(true);
        } else {
          setMobileDetailsSheetDismissed(false);
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (setupId) {
              document
                .getElementById(`copilot-setup-${setupId}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            if (!isNarrowViewport) {
              queryVisibleTourTarget('[data-tour="trade-open-cta"]')?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
            window.setTimeout(resolve, 120);
          });
        });
      }),
    [isNarrowViewport],
  );

  const ensureMobileFeedVisibleForTour = useCallback(
    () =>
      new Promise((resolve) => {
        if (!isNarrowViewport) {
          resolve();
          return;
        }
        setMobileDetailsSheetDismissed(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.setTimeout(resolve, 60);
          });
        });
      }),
    [isNarrowViewport],
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

  const ensureMobileTradeSheetForTour = useCallback(
    () =>
      new Promise((resolve) => {
        if (!isNarrowViewport) {
          resolve();
          return;
        }
        setSelectedId((id) => id ?? FIRST_SETUP_ID ?? null);
        setMobileDetailsSheetDismissed(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.setTimeout(resolve, 80);
          });
        });
      }),
    [isNarrowViewport],
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

  const handleTutorialEnded = useCallback(({ reason }) => {
    if (reason !== "dismissed") return;
    setTutorialToastOpen(true);
    setHighlightMoreForTutorial(true);
    setShowMoreTutorialHint(true);
    window.setTimeout(() => setHighlightMoreForTutorial(false), 2600);
  }, []);

  const copilotTourHandlers = useMemo(
    () => ({
      onTourContextChange: handleTourContextChange,
      onTutorialEnded: handleTutorialEnded,
      prepareSuggestionTourStep,
      ensureThesisClosedForTour,
      ensureThesisOpenForTour,
      ensureMobileFeedVisibleForTour,
      ensureMobileTradeSheetForTour,
      getTerminalPlatformId: () => terminalPlatformRef.current,
    }),
    [
      handleTourContextChange,
      handleTutorialEnded,
      prepareSuggestionTourStep,
      ensureThesisClosedForTour,
      ensureThesisOpenForTour,
      ensureMobileFeedVisibleForTour,
      ensureMobileTradeSheetForTour,
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

  const runCopilotTutorial = useCallback(() => {
    clearCopilotTutorialSessionDismissed();
    setTutorialToastOpen(false);
    setShowMoreTutorialHint(false);
    setHighlightMoreForTutorial(false);
    resetTourPageState();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startCopilotProductTour(copilotTourHandlers, COPILOT_TOUR_VARIANT_2, {
          startStep: 0,
        });
      });
    });
  }, [copilotTourHandlers, resetTourPageState]);

  useEffect(() => {
    if (!runProductTourOnEnter) return;
    onProductTourEnterConsumed?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runCopilotTutorial();
      });
    });
  }, [runProductTourOnEnter, onProductTourEnterConsumed, runCopilotTutorial]);

  const handleSuggestionSelect = useCallback(
    (id) => {
      const maxLockStep = 5;
      setSelectedId((cur) => {
        if (cur === id) {
          if (
            copilotTourStepIndex >= 2 &&
            copilotTourStepIndex <= maxLockStep
          )
            return cur;
          return null;
        }
        const onMobileFeedTourStep =
          isNarrowViewport &&
          copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
          copilotTourStepIndex >= 2 &&
          copilotTourStepIndex <= 3;
        if (!onMobileFeedTourStep) {
          setMobileDetailsSheetDismissed(false);
        }
        return id;
      });
      const refreshTutorial =
        copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
        (copilotTourStepIndex === 2 ||
          copilotTourStepIndex === 3 ||
          copilotTourStepIndex === 4);
      if (refreshTutorial) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => refreshCopilotTourIfActive());
        });
      }
    },
    [copilotTourStepIndex, copilotTourVariant, isNarrowViewport],
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
    if (!walletConnected || welcomeOpen || !shouldAutoStartCopilotTutorial())
      return;
    let cancelled = false;
    const engagement = getCopilotTutorialEngagement();
    const startStep =
      engagement?.variant === COPILOT_TOUR_VARIANT_2
        ? Math.max(0, engagement.stepIndex)
        : 0;

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      void (async () => {
        if (startStep >= 2) {
          await prepareSuggestionTourStep();
          if (cancelled) return;
        }
        requestAnimationFrame(() => {
          if (cancelled) return;
          startCopilotProductTour(copilotTourHandlers, COPILOT_TOUR_VARIANT_2, {
            startStep,
          });
        });
      })();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [walletConnected, welcomeOpen, copilotTourHandlers, prepareSuggestionTourStep]);

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
        if (isNarrowViewport) {
          setMobilePositionToastOpen(true);
          window.setTimeout(() => setMobilePositionToastOpen(false), 6000);
        } else {
          setHighlightOpenedPositionRow(true);
          window.setTimeout(() => setHighlightOpenedPositionRow(false), 2800);
        }
      });
    });
  }, [tourFirstTradeDemo, isNarrowViewport]);

  const handleOpenTradeCtaClick = useCallback(() => {
    advanceCopilotTourToPositionsFromOpenTradeClick();
    destroyCopilotProductTourIfStillActive({ markCompleted: true });
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
    <div className="flex h-dvh min-h-0 flex-col overflow-x-hidden bg-black text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <CopilotMobileHeader
        walletConnected={walletConnected}
        onWalletConnected={handleWalletConnected}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={handleTerminalPlatformChange}
      />
      <HeaderTerminal
        onCopilotTutorial={runCopilotTutorial}
        onVaultTutorial={onOpenVaultTutorial}
        activeNavItem="AI Copilot"
        onNavItemClick={(label) => {
          if (label === "Vaults") onOpenVaults?.();
        }}
        showCopilotTutorial
        highlightMoreForTutorial={highlightMoreForTutorial}
        showMoreTutorialHint={showMoreTutorialHint}
        onDismissMoreTutorialHint={() => setShowMoreTutorialHint(false)}
        walletConnected={walletConnected}
        onWalletConnected={handleWalletConnected}
        terminalPlatform={terminalPlatform}
        onTerminalPlatformChange={handleTerminalPlatformChange}
      />
      <StrategyCopilotProvider>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CopilotViewTabs activeView={copilotView} onViewChange={setCopilotView} />
          <StrategyCopilotViews
            copilotView={copilotView}
            terminalPlatform={terminalPlatform}
          />
          {copilotView !== "strategy-trading" ? (
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden tablet:flex-row"
        data-tour="copilot-suggestion-and-setup"
      >
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden tablet:h-full tablet:flex-[3_1_0] tablet:basis-0 tablet:border-r tablet:border-[#242424]">
          <div className="hidden shrink-0 flex-col tablet:flex">
            <MarketFiltersBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              stats={stats}
            />
            <div className="px-3 py-2 sm:px-5 sm:pt-5 sm:pb-5">
              <SuggestionToolbar
                variant="desktop"
                expireSeconds={expireSec}
                onRefresh={handleRefresh}
              />
            </div>
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div
              className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 sm:pb-5"
              data-tour="copilot-suggestions-list"
            >
              <div className="tablet:hidden">
                <MarketFiltersBar
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  stats={stats}
                  expireSeconds={expireSec}
                  onRefresh={handleRefresh}
                />
              </div>
              <div className="flex flex-col gap-3 px-3 max-tablet:gap-2.5 max-tablet:pt-3 sm:px-5 tablet:gap-4">
                {COPILOT_SETUPS.map((setup) => {
                  const isSelected = setup.id === selectedId;
                  return (
                    <div
                      key={setup.id}
                      id={`copilot-setup-${setup.id}`}
                      className="scroll-mt-4"
                      data-tour={
                        isSelected ? "copilot-expanded-suggestion" : undefined
                      }
                    >
                      <CopilotSuggestionCard
                        setup={setup}
                        expanded={isSelected && !isNarrowViewport}
                        selected={isSelected}
                        mobileFeed={isNarrowViewport}
                        onSelect={handleSuggestionSelect}
                        onViewThesis={() => {
                          setThesisInstrumentTitle(`${setup.symbol}/USDC`);
                          setThesisOpen(true);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="max-tablet:hidden">
            <CopilotBottomActivityDock
              tourDemoPosition={tourDemoPosition}
              highlightOpenedPositionRow={highlightOpenedPositionRow}
              compact={
                !!selectedSetup && !mobileDetailsSheetDismissed
              }
            />
            </div>
          </div>
        </main>
        {selectedSetup && mobileDetailsSheetDismissed ? (
          <button
            type="button"
            className="fixed left-1/2 z-40 max-tablet:flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#3e2e00] bg-[#171200] px-4 py-3 text-sm font-semibold text-[#f2b500] shadow-lg max-tablet:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] tablet:hidden tablet:bottom-4"
            onClick={() => setMobileDetailsSheetDismissed(false)}
            data-tour="copilot-mobile-details-reopen"
          >
            View trade setup — {selectedSetup.symbol}
          </button>
        ) : null}
        <div
          className={
            selectedSetup && !mobileDetailsSheetDismissed
              ? "flex min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden border-t border-[#242424] bg-black max-tablet:fixed max-tablet:inset-0 max-tablet:z-[55] max-tablet:h-dvh max-tablet:max-h-none max-tablet:border-t-0 tablet:h-full tablet:flex-[1_1_0] tablet:basis-0 tablet:border-t-0 tablet:border-l"
              : "hidden min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden border-t border-[#242424] bg-black tablet:flex tablet:h-full tablet:flex-[1_1_0] tablet:basis-0 tablet:border-t-0 tablet:border-l tablet:border-[#242424]"
          }
        >
          {selectedSetup && !mobileDetailsSheetDismissed ? (
            <div className="flex shrink-0 flex-col border-b border-[#242424] max-tablet:flex tablet:hidden">
              <div
                className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#454545]"
                aria-hidden
              />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-sm font-semibold text-white">
                  {selectedSetup.symbol} setup
                </span>
                <button
                  type="button"
                  aria-label="Close trade setup panel"
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg text-[#bfbfbf] hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileDetailsSheetDismissed(true)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
          <DetailsPanel
            setup={selectedSetup}
            onSelectFirstSetup={() => {
              if (FIRST_SETUP_ID) setSelectedId(FIRST_SETUP_ID);
            }}
            openTradeCtaLabel={
              copilotTourVariant === COPILOT_TOUR_VARIANT_2 &&
              copilotTourStepIndex === 5
                ? "Place my trade"
                : undefined
            }
            onOpenTradeCtaClick={handleOpenTradeCtaClick}
          />
        </div>
      </div>
      ) : null}
        </div>
      </StrategyCopilotProvider>
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
      {isNarrowViewport &&
      isCopilotProductTourActive() &&
      copilotTourStepIndex >= 0 ? (
        <CopilotMobileTourBar
          stepIndex={copilotTourStepIndex}
          tradeSheetStep={copilotTourStepIndex >= 4}
          onNext={copilotTourMobileMoveNext}
          onPrevious={copilotTourMobileMovePrevious}
          onSkip={copilotTourMobileSkip}
        />
      ) : null}
      <CopilotTutorialToast
        open={tutorialToastOpen}
        onDismiss={() => setTutorialToastOpen(false)}
      />
      <CopilotTutorialToast
        open={mobilePositionToastOpen}
        variant="position-added"
        onDismiss={() => setMobilePositionToastOpen(false)}
      />
      <OnboardingOverlay
        open={welcomeOpen}
        onDismiss={() => {
          markCopilotWelcomeSeen();
          setWelcomeOpen(false);
          if (!selectedId && FIRST_SETUP_ID) {
            setSelectedId(FIRST_SETUP_ID);
          }
          if (isNarrowViewport) {
            setMobileDetailsSheetDismissed(true);
          } else {
            setMobileDetailsSheetDismissed(false);
          }
        }}
      />
      <CopilotBottomNav
        activeId="copilot"
        onNavClick={(id) => {
          if (id === "vaults") onOpenVaults?.();
        }}
        onCopilotTutorial={runCopilotTutorial}
        onVaultTutorial={onOpenVaultTutorial}
      />
    </div>
  );
}
