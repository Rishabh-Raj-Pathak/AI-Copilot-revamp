import { useCallback, useMemo, useState } from "react";
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
  applyPaperTrading,
  applySaferRules,
  buildChatResponse,
  createDraftStrategy,
} from "./strategyWorkstationEngine.js";
import { DEMO_CHAT_BTC_SNIPER } from "./strategyWorkstationMockData.js";

const MOBILE_PANELS = [
  { id: "strategies", label: "Strategies" },
  { id: "workspace", label: "Workspace" },
  { id: "chat", label: "Chat" },
];

export default function StrategyTradingPage({ terminalPlatform = "hyperliquid" }) {
  const {
    strategies,
    setStrategies,
    selectedStrategyId,
    setSelectedStrategyId,
    appendLog,
    setLastSetup,
  } = useStrategyCopilot();

  const [modelId, setModelId] = useState("quant");
  const [strategyTypeId, setStrategyTypeId] = useState("mean-reversion");
  const [marketId, setMarketId] = useState("btc");
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState("all");
  const [workspaceTab, setWorkspaceTab] = useState("overview");
  const [mobilePanel, setMobilePanel] = useState("workspace");
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [toast, setToast] = useState(null);

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
      setStrategies((prev) =>
        prev.map((s) => (s.id === id ? updater(s) : s)),
      );
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

  const runPrompt = useCallback(
    async (text) => {
      const trimmed = (text ?? prompt).trim();
      if (!trimmed) return;

      setLoading(true);
      setPrompt("");

      await new Promise((r) => window.setTimeout(r, 600));

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
            { id: `u-${Date.now()}`, role: "user", text: trimmed },
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
        const isBtcSniper = /lower band|bb lower|sniper/i.test(trimmed);
        draft.chatMessages = isBtcSniper
          ? [...DEMO_CHAT_BTC_SNIPER]
          : [
              { id: `u-${Date.now()}`, role: "user", text: trimmed },
              {
                id: `a-${Date.now() + 1}`,
                role: "assistant",
                text: `Draft created: ${draft.name}. Configure parameters, then run a backtest estimate before paper trading.`,
                richCards: [{ type: "config", data: draft.config }],
              },
            ];
        if (isBtcSniper) {
          draft.name = "BTC Lower Band Sniper";
          draft.market = "BTCUSDT · 15m";
        }
        setStrategies((prev) => [draft, ...prev]);
        setSelectedStrategyId(draft.id);
        setLastSetup(draft.setup);
        appendLog("Strategy draft created from prompt");
      }

      setLoading(false);
      setMobilePanel("workspace");
      setWorkspaceTab("overview");
    },
    [
      prompt,
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
    ],
  );

  const handleRunBacktest = useCallback(async () => {
    if (!selectedStrategy) return;
    setBacktestLoading(true);
    setWorkspaceTab("backtest");
    appendLog("Backtest started");
    await new Promise((r) => window.setTimeout(r, 800));
    const updated = applyBacktest(selectedStrategy);
    updateStrategy(selectedStrategy.id, () => updated);
    const resp = buildChatResponse("Run backtest", updated);
    pushChat(selectedStrategy.id, "Run backtest on this.", resp);
    setBacktestLoading(false);
    showToast("Backtest complete");
  }, [selectedStrategy, updateStrategy, pushChat, appendLog, showToast]);

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
        if (!selectedStrategy) {
          setSelectedStrategyId("strat-btc-sniper");
          setMobilePanel("workspace");
        }
        runPrompt(
          "I want to create a BTCUSDT 15m quantitative strategy based on the Lower Band Sniper strategy.",
        );
        return;
      }

      const userText = action;
      let updated = selectedStrategy;

      if (action === "Make this safer" || action === "Make it safer") {
        updated = applySaferRules(selectedStrategy);
        updateStrategy(selectedStrategy.id, () => updated);
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
      runPrompt,
      setSelectedStrategyId,
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

  const handleNewStrategy = useCallback(() => {
    setSelectedStrategyId(null);
    setPrompt("");
    setWorkspaceTab("overview");
    setMobilePanel("chat");
    window.setTimeout(() => {
      document.querySelector("[data-strategy-chat-input] textarea")?.focus();
    }, 50);
  }, [setSelectedStrategyId]);

  const handleTemplate = useCallback(
    (template) => {
      setModelId(template.modelId);
      setStrategyTypeId(template.strategyId);
      setMarketId(template.marketId);
      const mapId = {
        "btc-mean-reversion": "strat-btc-sniper",
        "eth-funding": "strat-eth-funding",
        "sol-breakout": "strat-sol-breakout",
        "hype-trend": "strat-hype-trend",
      };
      const sid = mapId[template.id];
      if (sid && strategies.some((s) => s.id === sid)) {
        setSelectedStrategyId(sid);
        setMobilePanel("workspace");
        return;
      }
      runPrompt(template.prompt);
    },
    [runPrompt, strategies, setSelectedStrategyId],
  );

  const handleSave = useCallback(() => {
    if (!selectedStrategy) return;
    updateStrategy(selectedStrategy.id, (s) => ({ ...s, saved: true }));
    appendLog(`Strategy saved: ${selectedStrategy.name}`);
    showToast("Strategy saved locally (prototype)");
  }, [selectedStrategy, updateStrategy, appendLog, showToast]);

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
    showToast("Manual review recorded — live deployment not enabled in prototype");
  }, [selectedStrategy, updateStrategy, showToast]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black text-white">
      <div className="flex shrink-0 border-b border-[#242424] tablet:hidden">
        {MOBILE_PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setMobilePanel(p.id)}
            className={`flex-1 py-2.5 text-xs font-medium ${
              mobilePanel === p.id
                ? "border-b-2 border-[#f2b500] text-[#f2b500]"
                : "text-[#929292]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`${
            mobilePanel === "strategies" ? "flex" : "hidden"
          } h-full min-h-0 w-full shrink-0 tablet:flex`}
        >
          <StrategySidebar
            strategies={strategies}
            selectedId={selectedStrategyId}
            filter={sidebarFilter}
            onFilterChange={setSidebarFilter}
            onSelect={(id) => {
              setSelectedStrategyId(id);
              setMobilePanel("workspace");
            }}
            onNewStrategy={handleNewStrategy}
            preferences={preferences}
          />
        </div>

        <div
          className={`min-h-0 min-w-0 flex-1 ${
            mobilePanel === "workspace" ? "flex" : "hidden"
          } flex-col tablet:flex`}
        >
          <StrategyCenterWorkspace
            strategy={selectedStrategy}
            activeTab={workspaceTab}
            onTabChange={setWorkspaceTab}
            onRunBacktest={handleRunBacktest}
            onStartPaper={handleStartPaper}
            onReviewDeployment={() => setDeployOpen(true)}
            onSave={handleSave}
            backtestLoading={backtestLoading}
            onTemplateClick={handleTemplate}
          />
        </div>

        <div
          className={`${
            mobilePanel === "chat" ? "flex" : "hidden"
          } h-full min-h-0 w-full shrink-0 tablet:flex`}
        >
          <StrategyChatPanel
            strategy={selectedStrategy}
            messages={chatMessages}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={() => runPrompt(prompt)}
            loading={loading}
            modelId={modelId}
            onModelChange={setModelId}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            onQuickAction={handleQuickAction}
            onConfigPreset={handleConfigPreset}
            onViewBacktest={() => setWorkspaceTab("backtest")}
            onStartPaper={handleStartPaper}
            onReviewDeployment={() => setDeployOpen(true)}
            onViewPaper={() => setWorkspaceTab("paper")}
          />
        </div>
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
