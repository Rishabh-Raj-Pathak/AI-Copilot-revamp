import { useCallback, useEffect, useMemo, useState } from "react";
import { Toast, ToastViewport } from "../../ui/toast.jsx";
import { useStrategyCopilot } from "./StrategyCopilotContext.jsx";
import { DEFAULT_PREFERENCES } from "./strategyTradingMockData.js";
import DeployReviewModal from "./workstation/DeployReviewModal.jsx";
import StrategyCenterWorkspace from "./workstation/StrategyCenterWorkspace.jsx";
import StrategyChatPanel from "./workstation/StrategyChatPanel.jsx";
import StrategySidebar from "./workstation/StrategySidebar.jsx";
import {
  applyBacktest,
  applyConfigPreset,
  applyOptimization,
  applyPaperTrading,
  applySaferRules,
  buildChatResponse,
  createDraftStrategy,
  OPTIMIZE_CHAT_PROGRESS,
} from "./strategyWorkstationEngine.js";
import { applyWorkstationSetupChange } from "./strategyWorkstationSetup.js";
import {
  CENTER_TEMPLATES,
  DEFAULT_CHAT_LLM_MODEL_ID,
  DEMO_CHAT_BTC_SNIPER,
} from "./strategyWorkstationMockData.js";

const MOBILE_PANELS = [
  { id: "strategies", label: "Strategies" },
  { id: "workspace", label: "Workspace" },
  { id: "chat", label: "Chat" },
];

/** Desktop: all three columns visible. Mobile: one panel at a time. */
function panelVisibility(panelId, mobilePanel) {
  const active = mobilePanel === panelId;
  return [
    "min-h-0 h-full overflow-hidden flex-col",
    active ? "flex" : "hidden",
    "tablet:flex",
  ].join(" ");
}

export default function StrategyTradingPage({
  terminalPlatform = "hyperliquid",
}) {
  const {
    copilotView,
    strategies,
    setStrategies,
    selectedStrategyId,
    setSelectedStrategyId,
    appendLog,
    setLastSetup,
    theme,
    uiVersion,
  } = useStrategyCopilot();

  const isV2StrategyView = copilotView === "strategy-trading-v2";
  const defaultTemplate = CENTER_TEMPLATES[0];

  const [modelId, setModelId] = useState(
    () => defaultTemplate?.modelId ?? "quant",
  );
  const [chatModelId, setChatModelId] = useState(DEFAULT_CHAT_LLM_MODEL_ID);
  const [strategyTypeId, setStrategyTypeId] = useState(
    () => defaultTemplate?.strategyId ?? "mean-reversion",
  );
  const [marketId, setMarketId] = useState(
    () => defaultTemplate?.marketId ?? "btc",
  );
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [prompt, setPrompt] = useState(
    () => (isV2StrategyView ? (defaultTemplate?.prompt ?? "") : ""),
  );
  const [loading, setLoading] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState("all");
  const [workspaceTab, setWorkspaceTab] = useState("overview");
  const [mobilePanel, setMobilePanel] = useState("workspace");
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [composerMode, setComposerMode] = useState(() => isV2StrategyView);
  const [activeTemplateId, setActiveTemplateId] = useState(
    CENTER_TEMPLATES[0]?.id ?? "btc-mean-reversion",
  );
  const [attachments, setAttachments] = useState([]);
  const [chatAttachments, setChatAttachments] = useState([]);

  const selectedStrategy = useMemo(
    () => strategies.find((s) => s.id === selectedStrategyId) ?? null,
    [strategies, selectedStrategyId],
  );

  const chatMessages = selectedStrategy?.chatMessages ?? [];

  const showToast = useCallback((message, variant = "success") => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const updateStrategy = useCallback(
    (id, updater) => {
      setStrategies((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
    },
    [setStrategies],
  );

  const pushChat = useCallback(
    (strategyId, userText, aiPayload) => {
      updateStrategy(strategyId, (s) => ({
        ...s,
        chatMessages: [
          ...s.chatMessages,
          { id: `u-${Date.now()}`, role: "user", text: userText },
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: aiPayload.text,
            cards: aiPayload.cards,
            richCards: aiPayload.richCards,
          },
        ],
      }));
    },
    [updateStrategy],
  );

  const appendChatMessage = useCallback(
    (strategyId, message) => {
      updateStrategy(strategyId, (s) => ({
        ...s,
        chatMessages: [...s.chatMessages, message],
      }));
    },
    [updateStrategy],
  );

  const handleSelectStrategy = useCallback(
    (id) => {
      setComposerMode(false);
      setSelectedStrategyId(id);
      setMobilePanel("workspace");
      setWorkspaceTab("overview");
    },
    [setSelectedStrategyId],
  );

  const buildUserMessage = useCallback((text, msgAttachments) => {
    const base = { id: `u-${Date.now()}`, role: "user", text };
    if (msgAttachments?.length) {
      return {
        ...base,
        attachments: msgAttachments.map((a) => ({
          type: a.type,
          label: a.label,
        })),
      };
    }
    return base;
  }, []);

  const runPrompt = useCallback(
    async (text, options = {}) => {
      const trimmed = (text ?? prompt).trim();
      if (!trimmed) return;

      const msgAttachments = options.attachments ?? attachments;
      const fromComposer = options.fromComposer ?? composerMode;

      setLoading(true);
      setPrompt("");
      setAttachments([]);
      setChatAttachments([]);
      if (fromComposer) setComposerMode(false);

      await new Promise((r) => window.setTimeout(r, 600));

      const userMsg = buildUserMessage(trimmed, msgAttachments);

      if (selectedStrategy && selectedStrategy.status === "Draft") {
        const draft = createDraftStrategy({
          prompt: trimmed,
          modelId,
          strategyId: strategyTypeId,
          marketId,
          preferences,
          terminalPlatform,
          name: selectedStrategy.name,
        });
        draft.id = selectedStrategy.id;
        updateStrategy(selectedStrategy.id, (s) => ({
          ...draft,
          chatMessages: [
            ...s.chatMessages,
            userMsg,
            {
              id: `a-${Date.now() + 1}`,
              role: "assistant",
              text: `I updated ${draft.name}. Review configuration in the workspace, then run a backtest estimate.`,
              richCards: [{ type: "config", data: draft.config }],
            },
          ],
        }));
        setLastSetup(draft.setup);
      } else {
        const draft = createDraftStrategy({
          prompt: trimmed,
          modelId,
          strategyId: strategyTypeId,
          marketId,
          preferences,
          terminalPlatform,
        });
        const isBtcSniper =
          /lower band|bb lower|bollinger.*mean reversion|btc.*mean reversion/i.test(
            trimmed,
          );
        draft.chatMessages = isBtcSniper
          ? [...DEMO_CHAT_BTC_SNIPER]
          : [
              userMsg,
              {
                id: `a-${Date.now() + 1}`,
                role: "assistant",
                text: `Draft created: ${draft.name}. Configure parameters, then run a backtest estimate before paper trading.`,
                richCards: [{ type: "config", data: draft.config }],
              },
            ];
        if (isBtcSniper) {
          draft.name = "BTC Mean Reversion";
          draft.market = "BTCUSDT · 15m";
          draft.id = "strat-btc-sniper";
        }
        setStrategies((prev) => {
          const without = isBtcSniper
            ? prev.filter((s) => s.id !== "strat-btc-sniper")
            : prev;
          return [draft, ...without];
        });
        setSelectedStrategyId(isBtcSniper ? "strat-btc-sniper" : draft.id);
        setLastSetup(draft.setup);
        appendLog("Strategy draft created from prompt");
      }

      setLoading(false);
      setMobilePanel("workspace");
      setWorkspaceTab("overview");
    },
    [
      prompt,
      attachments,
      composerMode,
      selectedStrategy,
      modelId,
      strategyTypeId,
      marketId,
      preferences,
      terminalPlatform,
      updateStrategy,
      setStrategies,
      setSelectedStrategyId,
      setLastSetup,
      appendLog,
      buildUserMessage,
    ],
  );

  const handleRunBacktest = useCallback(async () => {
    if (!selectedStrategy) return;
    setBacktestLoading(true);
    setWorkspaceTab("backtest");
    if (uiVersion === "v2") setMobilePanel("chat");
    appendLog("Backtest started");
    pushChat(selectedStrategy.id, "Run backtest on this.", {
      text: "Running backtest estimate on your current market, timeframe, and date range…",
    });
    await new Promise((r) => window.setTimeout(r, 800));
    const updated = applyBacktest(selectedStrategy);
    updateStrategy(selectedStrategy.id, () => updated);
    const resp = buildChatResponse("Run backtest", updated);
    appendChatMessage(selectedStrategy.id, {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: resp.text,
      richCards: resp.richCards,
    });
    setBacktestLoading(false);
    showToast("Backtest complete");
  }, [
    selectedStrategy,
    updateStrategy,
    pushChat,
    appendChatMessage,
    appendLog,
    showToast,
    uiVersion,
  ]);

  const handleOptimizeStrategy = useCallback(async () => {
    if (!selectedStrategy || optimizeLoading) return;
    setOptimizeLoading(true);
    setMobilePanel("chat");
    const strategyId = selectedStrategy.id;
    const userText =
      "Optimize strategy parameters for better risk-adjusted returns.";

    appendChatMessage(strategyId, {
      id: `u-${Date.now()}`,
      role: "user",
      text: userText,
    });

    for (const text of OPTIMIZE_CHAT_PROGRESS) {
      await new Promise((r) => window.setTimeout(r, 750));
      appendChatMessage(strategyId, {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "assistant",
        text,
      });
    }

    await new Promise((r) => window.setTimeout(r, 500));
    const updated = applyOptimization(selectedStrategy);
    updateStrategy(strategyId, () => updated);
    setWorkspaceTab("backtest");
    appendLog("Strategy optimization completed");

    const resp = buildChatResponse("Optimize strategy", updated);
    appendChatMessage(strategyId, {
      id: `a-${Date.now()}-done`,
      role: "assistant",
      text: resp.text,
      richCards: resp.richCards,
    });

    setOptimizeLoading(false);
    showToast("Optimization complete");
  }, [
    selectedStrategy,
    optimizeLoading,
    updateStrategy,
    appendChatMessage,
    appendLog,
    showToast,
  ]);

  const handleStartPaper = useCallback(() => {
    if (!selectedStrategy) return;
    const updated = applyPaperTrading(selectedStrategy);
    updateStrategy(selectedStrategy.id, () => updated);
    const resp = buildChatResponse("Start paper trading", updated);
    pushChat(selectedStrategy.id, "Start paper trading.", resp);
    setWorkspaceTab("paper");
    appendLog("Paper trading started");
    showToast("Paper trading simulation active");
  }, [selectedStrategy, updateStrategy, pushChat, appendLog, showToast]);

  const handleQuickAction = useCallback(
    async (action) => {
      if (!selectedStrategy && action !== "Build BTC mean reversion") {
        showToast("Select or create a strategy first.", "default");
        return;
      }

      if (action === "Run backtest") {
        await handleRunBacktest();
        return;
      }
      if (action === "Start paper trading") {
        handleStartPaper();
        return;
      }
      if (action === "Review risk") {
        setDeployOpen(true);
        return;
      }
      if (action === "Build BTC mean reversion") {
        handleSelectStrategy("strat-btc-sniper");
        return;
      }

      const userText =
        action === "Make this safer" ? "Make this safer." : action;
      let updated = selectedStrategy;

      if (action === "Make this safer" || action === "Make it safer") {
        updated = applySaferRules(selectedStrategy);
        updateStrategy(selectedStrategy.id, () => updated);
        const resp = {
          text: "I reduced the risk profile by keeping leverage capped at 3x, requiring stronger RSI confirmation, and keeping manual approval enabled before any real trade.",
          richCards: [{ type: "config", data: updated.config }],
        };
        pushChat(selectedStrategy.id, userText, resp);
        return;
      }

      const resp = buildChatResponse(action, updated);
      pushChat(selectedStrategy.id, userText, resp);
      setPrompt("");
    },
    [
      selectedStrategy,
      handleRunBacktest,
      handleStartPaper,
      updateStrategy,
      pushChat,
      showToast,
      handleSelectStrategy,
    ],
  );

  const handleConfigPreset = useCallback(
    (preset) => {
      if (!selectedStrategy) return;
      const updated = applyConfigPreset(selectedStrategy, preset);
      updateStrategy(selectedStrategy.id, () => updated);
      pushChat(selectedStrategy.id, `Apply ${preset} preset`, {
        text: `Configuration updated (${preset}). Manual approval remains required.`,
        richCards: [{ type: "config", data: updated.config }],
      });
    },
    [selectedStrategy, updateStrategy, pushChat],
  );

  const applyTemplatePrefs = useCallback((template) => {
    setModelId(template.modelId);
    setStrategyTypeId(template.strategyId);
    setMarketId(template.marketId);
  }, []);

  const enterComposerLanding = useCallback(() => {
    const first = CENTER_TEMPLATES[0];
    setComposerMode(true);
    setSelectedStrategyId(null);
    setActiveTemplateId(first?.id ?? "btc-mean-reversion");
    if (first) {
      applyTemplatePrefs(first);
      setPrompt(first.prompt);
    } else {
      setPrompt("");
    }
    setAttachments([]);
    setWorkspaceTab("overview");
    setMobilePanel("workspace");
  }, [setSelectedStrategyId, applyTemplatePrefs]);

  useEffect(() => {
    if (copilotView === "strategy-trading-v2") {
      enterComposerLanding();
      return;
    }
    if (copilotView === "strategy-trading-v1") {
      setComposerMode(false);
      setSelectedStrategyId((id) => id ?? "strat-btc-sniper");
    }
  }, [copilotView, enterComposerLanding, setSelectedStrategyId]);

  const handleNewStrategy = useCallback(() => {
    enterComposerLanding();
    window.setTimeout(() => {
      document.querySelector("[data-strategy-chat-input] textarea")?.focus();
    }, 50);
  }, [enterComposerLanding]);

  const handleTemplateApply = useCallback(
    (template) => {
      applyTemplatePrefs(template);
      setPrompt(template.prompt);
    },
    [applyTemplatePrefs],
  );

  const handleComposerSubmit = useCallback(() => {
    runPrompt(prompt, { attachments, fromComposer: true });
  }, [runPrompt, prompt, attachments]);

  const handleTemplate = useCallback(
    (template) => {
      applyTemplatePrefs(template);
      const mapId = {
        "btc-mean-reversion": "strat-btc-sniper",
        "eth-funding": "strat-eth-funding",
        "sol-breakout": "strat-sol-breakout",
        "hype-trend": "strat-hype-trend",
      };
      const sid = mapId[template.id];
      if (sid && strategies.some((s) => s.id === sid)) {
        handleSelectStrategy(sid);
        return;
      }
      runPrompt(template.prompt);
    },
    [runPrompt, strategies, handleSelectStrategy, applyTemplatePrefs],
  );

  const handleSave = useCallback(() => {
    if (!selectedStrategy) return;
    updateStrategy(selectedStrategy.id, (s) => ({ ...s, saved: true }));
    appendLog(`Strategy saved: ${selectedStrategy.name}`);
    showToast("Strategy saved locally (prototype)");
  }, [selectedStrategy, updateStrategy, appendLog, showToast]);

  const handleSetupChange = useCallback(
    (patch) => {
      if (!selectedStrategy) return;
      updateStrategy(selectedStrategy.id, (s) =>
        applyWorkstationSetupChange(s, patch),
      );
      appendLog("Strategy setup updated");
    },
    [selectedStrategy, updateStrategy, appendLog],
  );

  const handleConfirmReview = useCallback(() => {
    if (!selectedStrategy) return;
    updateStrategy(selectedStrategy.id, (s) => ({
      ...s,
      status: "Ready",
      logs: [
        {
          id: `l-${Date.now()}`,
          message: "Manual deployment review confirmed",
          at: new Date().toISOString(),
        },
        ...s.logs,
      ],
    }));
    showToast(
      "Manual review recorded — live deployment not enabled in prototype",
    );
  }, [selectedStrategy, updateStrategy, showToast]);

  return (
    <div
      className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden text-white ${theme.shell}`}
    >
      <div className="flex shrink-0 border-b border-[#242424] tablet:hidden">
        {MOBILE_PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setMobilePanel(p.id)}
            className={`flex-1 py-2.5 text-xs font-medium ${
              mobilePanel === p.id
                ? `border-b-2 ${theme.isV2 ? "border-[#f2b500] text-[#f2b500]" : "border-[#f2b500] text-[#f2b500]"}`
                : "text-[#929292]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        className={`grid min-h-0 flex-1 grid-cols-1 overflow-hidden ${
          composerMode
            ? "tablet:grid-cols-[17.5rem_minmax(0,1fr)]"
            : theme.isV2
              ? "tablet:grid-cols-[17.5rem_minmax(0,1fr)_28rem]"
              : "tablet:grid-cols-[17.5rem_minmax(0,1fr)_26rem]"
        }`}
        data-strategy-copilot-layout
        data-ui-version={uiVersion}
      >
        <div className={panelVisibility("strategies", mobilePanel)}>
          <StrategySidebar
            strategies={strategies}
            selectedId={selectedStrategyId}
            filter={sidebarFilter}
            onFilterChange={setSidebarFilter}
            onSelect={handleSelectStrategy}
            onNewStrategy={handleNewStrategy}
          />
        </div>

        <div className={panelVisibility("workspace", mobilePanel)}>
          <StrategyCenterWorkspace
            strategy={selectedStrategy}
            composerMode={composerMode}
            activeTemplateId={activeTemplateId}
            onTemplateChange={setActiveTemplateId}
            onTemplateApply={handleTemplateApply}
            prompt={prompt}
            onPromptChange={setPrompt}
            onComposerSubmit={handleComposerSubmit}
            composerLoading={loading}
            chatModelId={chatModelId}
            onChatModelChange={setChatModelId}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onExamplePrompt={(text) => {
              setPrompt(text);
              setComposerMode(true);
            }}
            onNewStrategy={handleNewStrategy}
            activeTab={workspaceTab}
            onTabChange={setWorkspaceTab}
            onRunBacktest={handleRunBacktest}
            onOptimize={handleOptimizeStrategy}
            onStartPaper={handleStartPaper}
            onReviewDeployment={() => setDeployOpen(true)}
            onSave={handleSave}
            onSetupChange={handleSetupChange}
            backtestLoading={backtestLoading}
            optimizeLoading={optimizeLoading}
          />
        </div>

        {!composerMode ? (
          <div className={panelVisibility("chat", mobilePanel)}>
            <StrategyChatPanel
              strategy={selectedStrategy}
              messages={chatMessages}
              prompt={prompt}
              onPromptChange={setPrompt}
              onSubmit={() =>
                runPrompt(prompt, { attachments: chatAttachments })
              }
              loading={loading}
              chatModelId={chatModelId}
              onChatModelChange={setChatModelId}
              attachments={chatAttachments}
              onAttachmentsChange={setChatAttachments}
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onQuickAction={handleQuickAction}
              onConfigPreset={handleConfigPreset}
              onViewBacktest={() => {
                setMobilePanel("workspace");
                setWorkspaceTab("backtest");
              }}
              onOptimize={handleOptimizeStrategy}
              optimizeLoading={optimizeLoading}
              onStartPaper={handleStartPaper}
              onReviewDeployment={() => setDeployOpen(true)}
              onViewPaper={() => {
                setMobilePanel("workspace");
                setWorkspaceTab("paper");
              }}
              onExamplePrompt={(text) => runPrompt(text)}
            />
          </div>
        ) : null}
      </div>

      <DeployReviewModal
        open={deployOpen}
        onOpenChange={setDeployOpen}
        strategy={selectedStrategy}
        preferences={preferences}
        onConfirmReview={handleConfirmReview}
        onKeepPaper={() => {
          setDeployOpen(false);
          handleStartPaper();
        }}
      />

      {toast ? (
        <ToastViewport>
          <Toast variant={toast.variant}>{toast.message}</Toast>
        </ToastViewport>
      ) : null}
    </div>
  );
}
