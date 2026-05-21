import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs.jsx";
import ActivityTimeline from "./ActivityTimeline.jsx";
import AgentCard from "./AgentCard.jsx";
import TradingPreferencesPanel from "./TradingPreferencesPanel.jsx";

function ContextBlock({ title, subtitle, children }) {
  return (
    <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
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

export default function StrategyRightPanel({
  rightTab,
  onRightTabChange,
  selectedModel,
  selectedStrategy,
  marketId,
  preferences,
  onPreferencesChange,
  agents,
  activityLog,
  compact,
  onEditAgent,
  onPauseAgent,
  onStopAgent,
}) {
  return (
    <Tabs
      value={rightTab}
      onValueChange={onRightTabChange}
      className={`flex min-h-0 flex-col ${compact ? "" : "flex-1"}`}
    >
      <TabsList className="mx-3 mt-3 !flex w-auto gap-1 border-[#242424] bg-black p-1">
        <TabsTrigger value="context" className="!min-h-8 !px-2.5 !text-xs">
          Context
        </TabsTrigger>
        <TabsTrigger value="agents" className="!min-h-8 !px-2.5 !text-xs">
          Agents
        </TabsTrigger>
        <TabsTrigger value="prefs" className="!min-h-8 !px-2.5 !text-xs">
          Prefs
        </TabsTrigger>
      </TabsList>

      <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <TabsContent value="context" className="mt-3 space-y-2.5">
          <ContextBlock title="Active model" subtitle={selectedModel.name}>
            <p className="text-xs leading-relaxed text-[#929292]">
              {selectedModel.description}
            </p>
          </ContextBlock>
          <ContextBlock title="Active strategy" subtitle={selectedStrategy.name}>
            <p className="text-xs leading-relaxed text-[#929292]">
              {selectedStrategy.description}
            </p>
            <p className="mt-2 text-[10px] text-[#757575]">
              {selectedStrategy.timeframe} · Risk {selectedStrategy.risk}
            </p>
          </ContextBlock>
          <ContextBlock title="Selected market" subtitle={marketId.toUpperCase()}>
            <p className="text-xs text-[#929292]">
              Output targets {marketId.toUpperCase()}-PERP on your preferred DEX.
            </p>
          </ContextBlock>
          <ContextBlock title="Personal rules">
            <ul className="space-y-1 text-xs text-[#929292]">
              <li>· Risk: {preferences.riskPreference}</li>
              <li>· Max leverage: {preferences.maxLeverage}</li>
              <li>· Execution: {preferences.executionPreference}</li>
              <li>· Style: {preferences.tradeStyle}</li>
              <li>· Avoid high-volatility setups</li>
              <li>· Prefer BTC and ETH when scanning</li>
            </ul>
            <p className="mt-2 text-[10px] text-[#757575]">
              Hyprearn adjusts setup suggestions using these rules.
            </p>
          </ContextBlock>
          {!compact ? (
            <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
                Recent activity
              </p>
              <ActivityTimeline
                entries={activityLog.slice(0, 6)}
                emptyMessage="Activity appears after you analyze or create agents."
                compact
              />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="agents" className="mt-3 space-y-2">
          {agents.length === 0 ? (
            <p className="text-xs text-[#757575]">
              No active agents. Create one from any generated setup.
            </p>
          ) : (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEditPrompt={onEditAgent}
                onPause={onPauseAgent}
                onStop={onStopAgent}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="prefs" className="mt-3">
          <TradingPreferencesPanel
            preferences={preferences}
            onChange={onPreferencesChange}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
