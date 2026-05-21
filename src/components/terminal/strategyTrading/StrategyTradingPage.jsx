import { useCallback, useMemo, useState } from "react";
import { Toast, ToastViewport } from "../../ui/toast.jsx";
import CreateAgentDialog from "./CreateAgentDialog.jsx";
import EditAgentPromptDialog from "./EditAgentPromptDialog.jsx";
import { useStrategyCopilot } from "./StrategyCopilotContext.jsx";
import { DEFAULT_PREFERENCES } from "./strategyTradingMockData.js";
import { buildAgentFromSetup } from "./strategyTradingEngine.js";
import DeployReviewModal from "./workstation/DeployReviewModal.jsx";
import StrategyCenterWorkspace from "./workstation/StrategyCenterWorkspace.jsx";
import StrategyChatPanel from "./workstation/StrategyChatPanel.jsx";
import StrategySidebar from "./workstation/StrategySidebar.jsx";
import {
  applyBacktest,
  applyPaperTrading,
  applySaferRules,
  buildChatResponse,
  createDraftStrategy,
} from "./strategyWorkstationEngine.js";

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
    setAgents,
    appendLog,
    setLastSetup,
  } = useStrategyCopilot();

  const [modelId, setModelId] = useState("conservative");
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
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
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

      let targetId = selectedStrategyId;
      let draft;

      if (selectedStrategy && selectedStrategy.status === "Draft") {
        draft = createDraftStrategy({
          prompt: trimmed,
          modelId,
          strategyId: strategyTypeId,
          marketId,
          preferences,
          terminalPlatform,
          name: selectedStrategy.name,
        });
        draft.id = selectedStrategy.id;
        draft.chatMessages = selectedStrategy.chatMessages;
        updateStrategy(selectedStrategy.id, () => ({
          ...draft,
          chatMessages: [
            ...selectedStrategy.chatMessages,
            { id: `u-${Date.now()}`, role: "user", text: trimmed },
            {
              id: `a-${Date.now() + 1}`,
              role: "assistant",
              text: `I updated ${draft.name}. It waits for price to reclaim the entry zone, confirms RSI recovery, and skips trades during high volatility.`,
              cards: ["Strategy updated", "Backtest available"],
            },
          ],
        }));
        targetId = selectedStrategy.id;
      } else {
        draft = createDraftStrategy({
          prompt: trimmed,
          modelId,
          strategyId: strategyTypeId,
          marketId,
          preferences,
          terminalPlatform,
        });
        draft.chatMessages = [
          { id: `u-${Date.now()}`, role: "user", text: trimmed },
          {
            id: `a-${Date.now() + 1}`,
            role: "assistant",
            text: `I created a ${draft.model.toLowerCase()} ${draft.name} draft. It waits for price to reclaim the entry zone, confirms RSI recovery, and skips trades during high volatility.`,
            cards: ["Strategy created", "Backtest available", "Paper trading available"],
          },
        ];
        setStrategies((prev) => [draft, ...prev]);
        targetId = draft.id;
        setSelectedStrategyId(draft.id);
      }

      setLastSetup(draft.setup);
      appendLog("Strategy draft created from prompt");
      setLoading(false);
      setMobilePanel("workspace");
      setWorkspaceTab("overview");
    },
    [
      prompt,
      selectedStrategy,
      selectedStrategyId,
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
    pushChat(selectedStrategy.id, "Run backtest", resp);
    setBacktestLoading(false);
    showToast("Backtest complete");
  }, [selectedStrategy, updateStrategy, pushChat, appendLog, showToast]);

  const handleStartPaper = useCallback(() => {
    if (!selectedStrategy) return;
    const updated = applyPaperTrading(selectedStrategy);
    updateStrategy(selectedStrategy.id, () => updated);
    const resp = buildChatResponse("Start paper trade", updated);
    pushChat(selectedStrategy.id, "Start paper trade", resp);
    setWorkspaceTab("paper");
    appendLog("Paper trading started");
    showToast("Paper trading active");
  }, [selectedStrategy, updateStrategy, pushChat, appendLog, showToast]);

  const handleQuickAction = useCallback(
    async (action) => {
      if (!selectedStrategy && action !== "Create watcher") {
        showToast("Select or create a strategy first.", "default");
        return;
      }

      if (action === "Run backtest") {
        await handleRunBacktest();
        return;
      }
      if (action === "Start paper trade") {
        handleStartPaper();
        return;
      }
      if (action === "Deploy with manual approval") {
        setDeployOpen(true);
        return;
      }
      if (action === "Create watcher") {
        setCreateAgentOpen(true);
        return;
      }

      const userText = action;
      let updated = selectedStrategy;

      if (action === "Make it safer") {
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
    ],
  );

  const handleNewStrategy = useCallback(() => {
    setSelectedStrategyId(null);
    setPrompt("");
    setMobilePanel("chat");
    document.querySelector("[data-strategy-chat-input] textarea")?.focus();
  }, [setSelectedStrategyId]);

  const handleTemplate = useCallback(
    (template) => {
      setModelId(template.modelId);
      setStrategyTypeId(template.strategyId);
      setMarketId(template.marketId);
      setPrompt(template.prompt);
      setMobilePanel("chat");
      runPrompt(template.prompt);
    },
    [runPrompt],
  );

  const handleCreateAgent = useCallback(
    (overrides) => {
      if (!selectedStrategy?.setup) return;
      const agent = buildAgentFromSetup(selectedStrategy.setup, preferences, overrides);
      setAgents((prev) => [agent, ...prev]);
      updateStrategy(selectedStrategy.id, (s) => ({
        ...s,
        status: "Watching",
        isAgent: true,
      }));
      pushChat(
        selectedStrategy.id,
        "Create watcher",
        buildChatResponse("Create watcher", selectedStrategy),
      );
      appendLog(`Agent created: ${agent.name}`);
      showToast(`Agent created: ${agent.name}`);
    },
    [
      selectedStrategy,
      preferences,
      setAgents,
      updateStrategy,
      pushChat,
      appendLog,
      showToast,
    ],
  );

  const handleSaveAgentEdit = useCallback(
    (agentId, updates) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? {
                ...a,
                ...updates,
                recentlyUpdated: true,
                updateLog: [...(a.updateLog ?? []), "Agent instructions updated."],
              }
            : a,
        ),
      );
      if (selectedStrategy) {
        pushChat(
          selectedStrategy.id,
          "Edit agent",
          {
            text: "I updated the watcher. It will now skip setups when funding is too high or volatility expands.",
            cards: ["Agent updated"],
          },
        );
      }
      showToast("Agent instructions updated.");
    },
    [setAgents, selectedStrategy, pushChat, showToast],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black text-white">
      {/* Mobile panel switcher */}
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
            onDeploy={() => setDeployOpen(true)}
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
            strategyId={strategyTypeId}
            onModelChange={setModelId}
            onStrategyChange={setStrategyTypeId}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            onQuickAction={handleQuickAction}
          />
        </div>
      </div>

      <DeployReviewModal
        open={deployOpen}
        onOpenChange={setDeployOpen}
        strategy={selectedStrategy}
        preferences={preferences}
        onConfirm={() => {
          setDeployOpen(false);
          showToast("Deployment is disabled in this prototype.", "default");
        }}
      />

      <CreateAgentDialog
        open={createAgentOpen}
        onOpenChange={setCreateAgentOpen}
        setup={selectedStrategy?.setup}
        onCreate={handleCreateAgent}
      />

      <EditAgentPromptDialog
        open={!!editAgent}
        onOpenChange={(open) => !open && setEditAgent(null)}
        agent={editAgent}
        onSave={handleSaveAgentEdit}
      />

      {toast ? (
        <ToastViewport>
          <Toast variant={toast.variant}>{toast.message}</Toast>
        </ToastViewport>
      ) : null}
    </div>
  );
}
