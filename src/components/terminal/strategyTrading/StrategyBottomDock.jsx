import { Button } from "../../ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs.jsx";
import ActivityTimeline from "./ActivityTimeline.jsx";

function Empty({ children }) {
  return (
    <p className="py-4 text-center text-xs text-[#757575]">{children}</p>
  );
}

export default function StrategyBottomDock({
  bottomTab,
  onBottomTabChange,
  tradeIdeas,
  agents,
  chatMessages,
  activityLog,
  onOpenSetup,
}) {
  const watching = agents.filter((a) => a.status === "Watching").length;

  return (
    <footer className="shrink-0 border-t border-[#242424] bg-[#0a0a0a]">
      <Tabs value={bottomTab} onValueChange={onBottomTabChange} className="px-3 py-2 sm:px-5">
        <TabsList className="!inline-flex w-auto gap-1 border-[#242424] bg-black p-1">
          <TabsTrigger value="ideas" className="!min-h-8 !text-xs">
           AI Copilot
          </TabsTrigger>
          <TabsTrigger value="agents" className="!min-h-8 !text-xs">
            Active Agents ({watching})
          </TabsTrigger>
          <TabsTrigger value="history" className="!min-h-8 !text-xs">
            History
          </TabsTrigger>
          <TabsTrigger value="logs" className="!min-h-8 !text-xs">
            Logs
          </TabsTrigger>
        </TabsList>

        <div className="minimal-scrollbar max-h-36 overflow-y-auto">
          <TabsContent value="ideas" className="mt-2">
            {tradeIdeas.length === 0 ? (
              <Empty>
                No trade ideas yet. Submit a prompt to generate your first setup.
              </Empty>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {tradeIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-[#242424] bg-[#0a0a0a] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">
                        {idea.title}
                      </p>
                      <p className="text-[10px] text-[#757575]">
                        {idea.direction} · {idea.market} · {idea.confidence}{" "}
                        confidence · Risk {idea.riskLevel}
                      </p>
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onOpenSetup?.(idea)}
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents" className="mt-2">
            {agents.length === 0 ? (
              <Empty>
                No active agents. Create an agent from any setup.
              </Empty>
            ) : (
              <div className="space-y-1.5">
                {agents.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#242424] px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-white">{a.name}</span>
                    <span className="text-[#757575]">
                      {a.status} · {a.market} · {a.expiry} · {a.lastChecked}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-2">
            {chatMessages.length === 0 ? (
              <Empty>No history yet.</Empty>
            ) : (
              <ul className="space-y-1 text-xs text-[#929292]">
                {chatMessages.map((m) => (
                  <li key={m.id}>
                    <span className="text-[#757575]">
                      [{m.role === "user" ? "You" : "Hyprearn"}]
                    </span>{" "}
                    {m.text}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-2 px-1">
            <ActivityTimeline
              entries={activityLog}
              emptyMessage="Logs will appear after actions."
            />
          </TabsContent>
        </div>
      </Tabs>
    </footer>
  );
}
