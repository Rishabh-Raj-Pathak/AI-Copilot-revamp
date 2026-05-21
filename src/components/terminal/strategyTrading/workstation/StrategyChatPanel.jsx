import { ChevronDown, Paperclip, Send, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../ui/button.jsx";
import { Select } from "../../../ui/select.jsx";
import { Textarea } from "../../../ui/textarea.jsx";
import { CHAT_QUICK_ACTIONS } from "../strategyWorkstationMockData.js";
import { STRATEGY_MODELS } from "../strategyTradingMockData.js";
import TradingPreferencesPanel from "../TradingPreferencesPanel.jsx";
import ChatRichCards from "./ChatRichCards.jsx";
import { StatusBadge } from "./statusBadge.jsx";

function ChatBubble({ msg, strategyName, cardHandlers }) {
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
          <span className="text-[10px] font-medium uppercase tracking-wide text-[#f2b500]">
            Hyprearn
          </span>
        ) : null}
        <p className={`text-xs leading-relaxed ${!isUser ? "mt-0.5" : ""}`}>{msg.text}</p>
        {msg.richCards?.length ? (
          <ChatRichCards
            cards={msg.richCards}
            strategyName={strategyName}
            {...cardHandlers}
          />
        ) : null}
        {msg.cards?.length && !msg.richCards?.length ? (
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
  onModelChange,
  preferences,
  onPreferencesChange,
  onQuickAction,
  onConfigPreset,
  onViewBacktest,
  onStartPaper,
  onReviewDeployment,
  onViewPaper,
}) {
  const [showPrefs, setShowPrefs] = useState(false);

  const cardHandlers = {
    onPreset: onConfigPreset,
    onViewBacktest,
    onStartPaper,
    onReview: onReviewDeployment,
    onViewPaper,
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-[#242424] bg-black tablet:w-[22rem] tablet:min-w-[22rem] tablet:max-w-[27rem] xl:w-[26rem]">
      <header className="shrink-0 border-b border-[#242424] px-3 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          AI Strategy Chat
        </p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              className="flex w-full items-center gap-1.5 rounded-md border border-[#242424] bg-[#0a0a0a] px-2 py-1.5 text-left hover:border-[#454545]"
            >
              <span className="truncate text-xs font-semibold text-white">
                {strategy?.name ?? "No strategy selected"}
              </span>
              {strategy ? <StatusBadge status={strategy.status} /> : null}
              <ChevronDown className="ml-auto size-3.5 shrink-0 text-[#585858]" aria-hidden />
            </button>
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
        <Select
          value={modelId}
          onChange={(e) => onModelChange(e.target.value)}
          className="mt-2 !min-h-8 !text-xs"
          aria-label="AI model"
        >
          {STRATEGY_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
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
            Ask AI to build, test, optimize, or paper trade a strategy. Responses
            include configuration cards, backtest summaries, and deployment review
            steps — manual approval is always required.
          </p>
        ) : (
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              msg={m}
              strategyName={strategy?.name}
              cardHandlers={cardHandlers}
            />
          ))
        )}
        {loading ? (
          <p className="text-xs text-[#929292]">Hyprearn is analyzing…</p>
        ) : null}
      </div>

      <footer className="shrink-0 border-t border-[#242424] p-3" data-strategy-chat-input>
        <div className="minimal-scrollbar mb-2 flex gap-1 overflow-x-auto pb-0.5">
          {CHAT_QUICK_ACTIONS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onQuickAction(chip)}
              className="shrink-0 rounded-md border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292] hover:border-[#454545] hover:text-white"
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
          className="rounded-xl border border-[#242424] bg-[#0a0a0a] p-2"
        >
          {strategy ? (
            <div className="mb-2 flex items-center gap-1">
              <span className="truncate text-[10px] font-medium text-white">
                {strategy.name}
              </span>
              <StatusBadge status={strategy.status} />
            </div>
          ) : null}
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Ask AI to build, test, optimize, or paper trade a strategy…"
            rows={3}
            className="!min-h-[3.5rem] !border-0 !bg-transparent !p-0 text-sm shadow-none focus-visible:!ring-0"
          />
          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              className="rounded-md p-1.5 text-[#585858] hover:text-white"
              aria-label="Attach context"
            >
              <Paperclip className="size-4" aria-hidden />
            </button>
            <Button
              type="submit"
              size="sm"
              variant="default"
              className="!size-8 !rounded-full !p-0"
              loading={loading}
              disabled={!prompt.trim()}
              aria-label="Send message"
            >
              <Send className="size-4" aria-hidden />
            </Button>
          </div>
        </form>
      </footer>
    </aside>
  );
}
