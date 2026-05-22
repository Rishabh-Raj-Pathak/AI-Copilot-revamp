import { useState } from "react";
import { Button } from "../../ui/button.jsx";
import AgentCard from "./AgentCard.jsx";
import ActivityTimeline from "./ActivityTimeline.jsx";
import EditAgentPromptDialog from "./EditAgentPromptDialog.jsx";
import { useStrategyCopilot } from "./StrategyCopilotContext.jsx";

export default function StrategyAgentsHub({
  onOpenStrategyCopilot,
}) {
  const { strategies, agents, setAgents, activityLog, appendLog } =
    useStrategyCopilot();
  const [editAgent, setEditAgent] = useState(null);

  const watchingStrategies = strategies.filter(
    (s) => s.status === "Watching" || s.isAgent,
  );
  const allAgents = [
    ...agents,
    ...watchingStrategies.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      market: s.market,
      model: s.model,
      strategy: s.strategy,
      condition: "Monitoring strategy conditions",
      riskRule: "Per strategy rules",
      expiry: "Until stopped",
      lastChecked: s.lastUpdated,
    })),
  ];

  const handlePause = (id) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Paused" } : a)),
    );
    appendLog("Agent paused");
  };

  const handleStop = (id) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Completed" } : a)),
    );
    appendLog("Agent stopped");
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-black text-white">
      <header className="shrink-0 border-b border-[#242424] px-4 py-4 sm:px-5">
        <h1 className="text-lg font-semibold">Agents</h1>
        <p className="mt-1 text-sm text-[#929292]">
          On-demand watchers from Strategy Builder — monitor conditions and get
          notified when setups become valid.
        </p>
        <Button
          size="sm"
          variant="default"
          className="mt-3"
          onClick={onOpenStrategyCopilot}
        >
          Open Strategy Builder
        </Button>
      </header>

      <div className="minimal-scrollbar flex min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          {allAgents.length === 0 ? (
            <p className="text-sm text-[#757575]">No agents yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEditPrompt={setEditAgent}
                  onPause={handlePause}
                  onStop={handleStop}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="w-full shrink-0 sm:max-w-xs">
          <p className="text-xs font-medium text-[#bfbfbf]">Activity</p>
          <div className="mt-2 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
            <ActivityTimeline entries={activityLog} emptyMessage="No activity yet." />
          </div>
        </aside>
      </div>

      <EditAgentPromptDialog
        open={!!editAgent}
        onOpenChange={(open) => !open && setEditAgent(null)}
        agent={editAgent}
        onSave={() => setEditAgent(null)}
      />
    </div>
  );
}
