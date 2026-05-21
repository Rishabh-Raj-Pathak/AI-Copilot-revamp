import { useCallback, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs.jsx";
import { Toast, ToastViewport } from "../../ui/toast.jsx";
import AgentCard from "./AgentCard.jsx";
import CreateAgentDialog from "./CreateAgentDialog.jsx";
import EditAgentPromptDialog from "./EditAgentPromptDialog.jsx";
import GeneratedSetupCard from "./GeneratedSetupCard.jsx";
import StrategyControlsBar from "./StrategyControlsBar.jsx";
import StrategyEmptyState from "./StrategyEmptyState.jsx";
import StrategyPromptPanel from "./StrategyPromptPanel.jsx";
import TradingPreferencesPanel from "./TradingPreferencesPanel.jsx";
import {
  buildAgentFromSetup,
  generateStrategySetup,
} from "./strategyTradingEngine.js";
import {
  DEFAULT_PREFERENCES,
  INITIAL_AGENTS,
  STRATEGY_MODELS,
  STRATEGY_TYPES,
} from "./strategyTradingMockData.js";

export default function StrategyTradingPage({ terminalPlatform = "hyperliquid" }) {
  const [modelId, setModelId] = useState("conservative");
  const [strategyId, setStrategyId] = useState("mean-reversion");
  const [marketId, setMarketId] = useState("btc");
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [prompt, setPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [generatedSetup, setGeneratedSetup] = useState(null);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [loading, setLoading] = useState(false);
  const [rightTab, setRightTab] = useState("context");
  const [bottomTab, setBottomTab] = useState("ideas");
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [toast, setToast] = useState(null);

  const selectedModel = useMemo(
    () => STRATEGY_MODELS.find((m) => m.id === modelId) ?? STRATEGY_MODELS[0],
    [modelId],
  );
  const selectedStrategy = useMemo(
    () => STRATEGY_TYPES.find((s) => s.id === strategyId) ?? STRATEGY_TYPES[0],
    [strategyId],
  );

  const showToast = useCallback((message, variant = "success") => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const runPrompt = useCallback(
    async (text) => {
      const trimmed = (text ?? prompt).trim();
      if (!trimmed) return;

      const userMsg = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setPrompt("");
      setLoading(true);

      await new Promise((r) => window.setTimeout(r, 650));

      const setup = generateStrategySetup({
        prompt: trimmed,
        modelId,
        strategyId,
        marketId,
        preferences: {
          ...preferences,
          riskPreference: preferences.riskPreference,
        },
        terminalPlatform,
      });

      setGeneratedSetup(setup);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `Generated ${setup.title} — ${setup.direction} on ${setup.market} (${setup.confidence} confidence, ${setup.riskLevel} risk).`,
        },
      ]);
      setLoading(false);
      setBottomTab("ideas");
    },
    [prompt, modelId, strategyId, marketId, preferences, terminalPlatform],
  );

  const handleCreateAgent = useCallback(
    (overrides) => {
      if (!generatedSetup) return;
      const agent = buildAgentFromSetup(generatedSetup, preferences, overrides);
      setAgents((prev) => [agent, ...prev]);
      setBottomTab("agents");
      setRightTab("agents");
      showToast(`Watcher "${agent.name}" is now active.`);
    },
    [generatedSetup, preferences, showToast],
  );

  const handleSaveAgentEdit = useCallback(
    (agentId, updates) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? {
                ...a,
                ...updates,
                updateLog: [
                  ...(a.updateLog ?? []),
                  "Agent instructions updated.",
                ],
              }
            : a,
        ),
      );
      showToast("Agent instructions updated.");
    },
    [showToast],
  );

  const handlePauseAgent = useCallback((id) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Paused" } : a)),
    );
  }, []);

  const handleStopAgent = useCallback((id) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Completed" } : a)),
    );
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black text-white">
      <header className="shrink-0 border-b border-[#242424] px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white sm:text-lg">
              Strategy Trading
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#929292] sm:text-sm">
              Build personalized trading setups with AI models, strategy
              templates, and on-demand agents.
            </p>
          </div>
          <StrategyControlsBar
            modelId={modelId}
            strategyId={strategyId}
            marketId={marketId}
            riskPreference={preferences.riskPreference}
            onModelChange={setModelId}
            onStrategyChange={setStrategyId}
            onMarketChange={setMarketId}
            onRiskChange={(v) =>
              setPreferences((p) => ({ ...p, riskPreference: v }))
            }
            compact
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden tablet:flex-row">
        {/* Left — prompt / chat */}
        <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-[#242424] p-3 sm:p-4 tablet:h-full tablet:max-w-[17rem] tablet:flex-[0_0_17rem] tablet:border-b-0 tablet:border-r xl:max-w-[19rem] xl:flex-[0_0_19rem]">
          <p className="mb-2 text-xs font-semibold text-[#bfbfbf]">Prompt</p>
          <StrategyPromptPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={() => runPrompt(prompt)}
            loading={loading}
            chatMessages={chatMessages}
            onQuickPrompt={(chip) => {
              setPrompt(chip);
              runPrompt(chip);
            }}
          />
        </aside>

        {/* Center — workspace */}
        <main className="minimal-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 tablet:h-full">
          {!generatedSetup && !loading ? (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 hidden sm:block">
                <h2 className="text-lg font-semibold text-white">
                  Build personalized trading strategies with AI
                </h2>
                <p className="mt-2 text-sm text-[#929292]">
                  Choose a trading model, select a strategy style, and create
                  on-demand agents that analyze, monitor, and adapt to your
                  prompts.
                </p>
              </div>
              <StrategyEmptyState
                onActionClick={(p) => {
                  setPrompt(p);
                  runPrompt(p);
                }}
              />
            </div>
          ) : loading ? (
            <div className="flex min-h-[12rem] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="size-8 animate-spin rounded-full border-2 border-[#f2b500] border-t-transparent" />
                <p className="text-sm text-[#929292]">
                  Hyprearn is building your setup…
                </p>
              </div>
            </div>
          ) : (
            <GeneratedSetupCard
              setup={generatedSetup}
              onCreateAgent={() => setCreateAgentOpen(true)}
              onModifyPrompt={() => {
                setPrompt(generatedSetup?.promptEcho ?? "");
                document
                  .querySelector("[data-strategy-prompt]")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              onAskFollowUp={() => {
                setPrompt("Can you refine this setup with tighter risk?");
              }}
            />
          )}
        </main>

        {/* Right — context / agents / prefs */}
        <aside className="flex min-h-0 w-full shrink-0 flex-col border-t border-[#242424] tablet:h-full tablet:max-w-[15rem] tablet:flex-[0_0_15rem] tablet:border-t-0 tablet:border-l xl:max-w-[17rem] xl:flex-[0_0_17rem]">
          <Tabs value={rightTab} onValueChange={setRightTab} className="min-h-0 flex-1">
            <TabsList className="mx-3 mt-3 !flex w-auto flex-wrap gap-1 border-[#242424] bg-[#0a0a0a] p-1">
              <TabsTrigger value="context" size="sm" className="!text-xs">
                Context
              </TabsTrigger>
              <TabsTrigger value="agents" size="sm" className="!text-xs">
                Agents
              </TabsTrigger>
              <TabsTrigger value="prefs" size="sm" className="!text-xs">
                Prefs
              </TabsTrigger>
            </TabsList>

            <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              <TabsContent value="context" className="mt-3">
                <ContextCard title="Active model" subtitle={selectedModel.name}>
                  <p className="text-xs leading-relaxed text-[#929292]">
                    {selectedModel.description}
                  </p>
                  <p className="mt-2 text-[10px] text-[#757575]">
                    Best for: {selectedModel.bestFor.join(", ")}
                  </p>
                </ContextCard>
                <ContextCard
                  title="Active strategy"
                  subtitle={selectedStrategy.name}
                  className="mt-3"
                >
                  <p className="text-xs leading-relaxed text-[#929292]">
                    {selectedStrategy.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[#757575]">
                    <span>Risk: {selectedStrategy.risk}</span>
                    <span>·</span>
                    <span>{selectedStrategy.timeframe}</span>
                  </div>
                </ContextCard>
                <ContextCard title="Personal rules" className="mt-3">
                  <ul className="space-y-1 text-xs text-[#929292]">
                    <li>· Risk: {preferences.riskPreference}</li>
                    <li>· Max leverage: {preferences.maxLeverage}</li>
                    <li>· Execution: {preferences.executionPreference}</li>
                    {(agents[0]?.memoryRules ?? []).slice(0, 3).map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </ContextCard>
              </TabsContent>

              <TabsContent value="agents" className="mt-3 space-y-2">
                {agents.length === 0 ? (
                  <p className="text-xs text-[#757575]">
                    No active watchers. Create one from a setup.
                  </p>
                ) : (
                  agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onEditPrompt={setEditAgent}
                      onPause={handlePauseAgent}
                      onStop={handleStopAgent}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="prefs" className="mt-3">
                <TradingPreferencesPanel
                  preferences={preferences}
                  onChange={setPreferences}
                />
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>

      {/* Bottom tabs */}
      <footer className="shrink-0 border-t border-[#242424] bg-[#0a0a0a] px-3 py-2 sm:px-5">
        <Tabs value={bottomTab} onValueChange={setBottomTab}>
          <TabsList className="!inline-flex w-auto border-[#242424] bg-black">
            <TabsTrigger value="ideas" className="!text-xs">
              AI Copilot
            </TabsTrigger>
            <TabsTrigger value="agents" className="!text-xs">
              Active Agents ({agents.filter((a) => a.status === "Watching").length})
            </TabsTrigger>
            <TabsTrigger value="history" className="!text-xs">
              History
            </TabsTrigger>
            <TabsTrigger value="logs" className="!text-xs">
              Logs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ideas" className="mt-2 text-xs text-[#757575]">
            {generatedSetup
              ? `${generatedSetup.title} — ${generatedSetup.direction} (${generatedSetup.confidence} confidence)`
              : "Submit a prompt to generate structured trade ideas in the workspace above."}
          </TabsContent>
          <TabsContent value="agents" className="mt-2 text-xs text-[#757575]">
            {agents.length === 0
              ? "No watchers yet."
              : agents.map((a) => (
                  <p key={a.id}>
                    {a.name} — {a.status} · {a.market}
                  </p>
                ))}
          </TabsContent>
          <TabsContent value="history" className="mt-2 text-xs text-[#757575]">
            {chatMessages.length === 0
              ? "Prompt history will appear here after your first analysis."
              : chatMessages.map((m) => (
                  <p key={m.id} className="py-0.5">
                    [{m.role}] {m.text}
                  </p>
                ))}
          </TabsContent>
          <TabsContent value="logs" className="mt-2 text-xs text-[#757575]">
            {agents.flatMap((a) => a.updateLog ?? []).length === 0
              ? "Agent update logs will appear here."
              : agents.flatMap((a) =>
                  (a.updateLog ?? []).map((log, i) => (
                    <p key={`${a.id}-${i}`}>
                      {a.name}: {log}
                    </p>
                  )),
                )}
          </TabsContent>
        </Tabs>
      </footer>

      <CreateAgentDialog
        open={createAgentOpen}
        onOpenChange={setCreateAgentOpen}
        setup={generatedSetup}
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

function ContextCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 ${className}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-0.5 text-sm font-semibold text-white">{subtitle}</p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
