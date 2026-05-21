import { Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../ui/button.jsx";
import { Select } from "../../../ui/select.jsx";
import { Textarea } from "../../../ui/textarea.jsx";
import { CHAT_QUICK_ACTIONS } from "../strategyWorkstationMockData.js";
import { STRATEGY_MODELS, STRATEGY_TYPES } from "../strategyTradingMockData.js";
import TradingPreferencesPanel from "../TradingPreferencesPanel.jsx";
import { StatusBadge } from "./statusBadge.jsx";

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[95%] rounded-lg px-3 py-2 ${
          isUser
            ? "bg-[#171200] text-white"
            : "border border-[#242424] bg-[#0a0a0a] text-[#bfbfbf]"
        }`}
      >
        {!isUser ? (
          <span className="text-[10px] font-medium text-[#f2b500]">Hyprearn</span>
        ) : null}
        <p className={`text-xs leading-relaxed ${!isUser ? "mt-0.5" : ""}`}>
          {msg.text}
        </p>
        {msg.cards?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {msg.cards.map((c) => (
              <span
                key={c}
                className="rounded border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292]"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function StrategyChatPanel({
  strategy,
  messages,
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  modelId,
  strategyId,
  onModelChange,
  onStrategyChange,
  preferences,
  onPreferencesChange,
  onQuickAction,
}) {
  const [showPrefs, setShowPrefs] = useState(false);

  return (
    <aside className="flex h-full w-full flex-col border-l border-[#242424] bg-black tablet:w-[22rem] tablet:min-w-[22rem] tablet:max-w-[27rem] xl:w-[26rem]">
      <header className="shrink-0 border-b border-[#242424] px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {strategy?.name ?? "Strategy Copilot"}
            </p>
            {strategy ? <StatusBadge status={strategy.status} className="mt-1" /> : null}
          </div>
          <button
            type="button"
            aria-label="Preferences"
            className="rounded-md p-1.5 text-[#929292] hover:bg-white/5 hover:text-white"
            onClick={() => setShowPrefs((v) => !v)}
          >
            <Settings2 className="size-4" />
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Select
            value={modelId}
            onChange={(e) => onModelChange(e.target.value)}
            className="!min-h-8 !text-xs"
          >
            {STRATEGY_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Select
            value={strategyId}
            onChange={(e) => onStrategyChange(e.target.value)}
            className="!min-h-8 !text-xs"
          >
            {STRATEGY_TYPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        {showPrefs ? (
          <div className="mt-3 rounded-lg border border-[#242424] bg-[#0a0a0a] p-3">
            <TradingPreferencesPanel
              preferences={preferences}
              onChange={onPreferencesChange}
            />
          </div>
        ) : null}
      </header>

      <div className="minimal-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-xs leading-relaxed text-[#757575]">
            Describe a strategy, run a backtest, start paper trading, or create a
            watcher. Hyprearn structures your idea into a tradable workflow.
          </p>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} msg={m} />)
        )}
        {loading ? (
          <p className="text-xs text-[#929292]">Hyprearn is thinking…</p>
        ) : null}
      </div>

      <footer className="shrink-0 border-t border-[#242424] p-3" data-strategy-chat-input>
        <div className="minimal-scrollbar mb-2 flex gap-1 overflow-x-auto pb-0.5">
          {CHAT_QUICK_ACTIONS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onQuickAction(chip)}
              className="shrink-0 rounded-md border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292] hover:text-white"
            >
              {chip}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Ask Hyprearn to build, modify, backtest, paper trade, or deploy..."
            rows={3}
            className="!min-h-[4rem] text-sm"
          />
          <Button
            type="submit"
            size="sm"
            variant="default"
            className="mt-2 w-full"
            loading={loading}
            disabled={!prompt.trim()}
          >
            Send
          </Button>
        </form>
      </footer>
    </aside>
  );
}
