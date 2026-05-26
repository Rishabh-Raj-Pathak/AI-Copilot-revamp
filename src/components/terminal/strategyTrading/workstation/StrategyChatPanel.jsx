import { Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import {
  CHAT_EMPTY_EXAMPLES,
  CHAT_QUICK_ACTIONS,
} from "../strategyWorkstationMockData.js";
import TradingPreferencesPanel from "../TradingPreferencesPanel.jsx";
import ChatRichCards from "./ChatRichCards.jsx";
import StrategyPromptBox from "./StrategyPromptBox.jsx";

function ChatBubble({ msg, strategyName, cardHandlers }) {
  const theme = useCopilotTheme();
  const isUser = msg.role === "user";

  if (theme.isV2) {
    return (
      <div className="w-full">
        <div className={isUser ? theme.chatUserBubble : theme.chatAiBubble}>
          {!isUser ? (
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#f2b500]">
              Hyprearn
            </span>
          ) : null}
          <p
            className={`text-xs leading-relaxed ${
              isUser ? "" : "mt-1.5 text-[#a3a3a3]"
            }`}
          >
            {msg.text}
          </p>
          {msg.attachments?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {msg.attachments.map((a) => (
                <span
                  key={`${a.type}-${a.label}`}
                  className="rounded border border-[#2a2a2a] px-2 py-0.5 text-[10px] text-[#929292]"
                >
                  {a.label}
                </span>
              ))}
            </div>
          ) : null}
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
                  className="rounded border border-[#2a2a2a] px-2 py-0.5 text-[10px] text-[#929292]"
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

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`max-w-[92%] ${isUser ? "text-right" : ""}`}>
        <div className={isUser ? theme.chatUserBubble : theme.chatAiBubble}>
          {!isUser ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#f2b500]">
              Hyprearn
            </span>
          ) : null}
          <p className={`text-xs leading-relaxed ${!isUser ? "mt-0.5" : ""}`}>
            {msg.text}
          </p>
          {msg.attachments?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {msg.attachments.map((a) => (
                <span
                  key={`${a.type}-${a.label}`}
                  className="rounded border border-[#242424] px-2 py-0.5 text-[10px] text-[#929292]"
                >
                  {a.label}
                </span>
              ))}
            </div>
          ) : null}
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
  chatModelId,
  onChatModelChange,
  attachments,
  onAttachmentsChange,
  preferences,
  onPreferencesChange,
  onQuickAction,
  onConfigPreset,
  onViewBacktest,
  onOptimize,
  optimizeLoading,
  onStartPaper,
  onReviewDeployment,
  onViewPaper,
  onExamplePrompt,
}) {
  const [showPrefs, setShowPrefs] = useState(false);
  const theme = useCopilotTheme();
  const scrollRef = useRef(null);

  const cardHandlers = {
    onPreset: onConfigPreset,
    onViewBacktest,
    onStartPaper,
    onReview: onReviewDeployment,
    onViewPaper,
    onOptimize,
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, optimizeLoading, loading]);

  const quickActions = theme.isV2 ? [] : CHAT_QUICK_ACTIONS;

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col border-l ${theme.chatPanel}`}
    >
      {!theme.isV2 ? (
        <header className={`shrink-0 border-b px-3 py-2.5 ${theme.panel}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
              AI Strategy Chat
            </p>
            <button
              type="button"
              aria-label="Preferences"
              className="rounded-md p-1.5 text-[#929292] hover:bg-white/5 hover:text-white"
              onClick={() => setShowPrefs((v) => !v)}
            >
              <Settings2 className="size-4" />
            </button>
          </div>

          {showPrefs ? (
            <div className={`mt-2.5 p-3 ${theme.card}`}>
              <TradingPreferencesPanel
                preferences={preferences}
                onChange={onPreferencesChange}
              />
            </div>
          ) : null}
        </header>
      ) : null}

      <div
        ref={scrollRef}
        className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto"
      >
        <div className={theme.isV2 ? "space-y-4 p-3.5 pb-5" : "space-y-3 p-3"}>
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#929292]">
                Tell Strategy Copilot what you want to build.
              </p>
              <div className="space-y-1.5">
                {CHAT_EMPTY_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => onExamplePrompt?.(ex)}
                    className={`block w-full ${theme.chatExampleBtn}`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
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
          {optimizeLoading ? (
            <p className="text-xs text-[#f2b500]">Optimizing strategy parameters…</p>
          ) : null}
        </div>

      </div>

      <footer
        className={`relative shrink-0 ${
          theme.isV2
            ? "z-20 -mt-5 bg-black px-3 pb-3 pt-0"
            : `z-20 border-t p-3 ${theme.panel}`
        }`}
      >
        {theme.isV2 ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-full z-10 h-5 overflow-hidden"
            aria-hidden
          >
            <div className="absolute inset-0 backdrop-blur-[10px] [mask-image:linear-gradient(to_top,black_30%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_30%,transparent)]" />
          </div>
        ) : null}
        {quickActions.length > 0 ? (
          <div className="minimal-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
            {quickActions.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onQuickAction(chip)}
                className={theme.chatQuickChip}
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}
        <div className={theme.isV2 ? "relative z-20" : undefined}>
          <StrategyPromptBox
            value={prompt}
            onChange={onPromptChange}
            onSubmit={onSubmit}
            loading={loading}
            chatModelId={chatModelId}
            onChatModelChange={onChatModelChange}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
            enableSuggestions
            placeholder="Ask AI to build, test, optimize, or paper trade a strategy…"
          />
        </div>
      </footer>
    </aside>
  );
}
