import { MessageSquare, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import {
  CHAT_EMPTY_EXAMPLES,
  CHAT_QUICK_ACTIONS,
} from "../strategyWorkstationMockData.js";
import TradingPreferencesPanel from "../TradingPreferencesPanel.jsx";
import ChatRichCards from "./ChatRichCards.jsx";
import ScrollFade from "./ScrollFade.jsx";
import StrategyPromptBox from "./StrategyPromptBox.jsx";

function ChatTypingIndicator() {
  const theme = useCopilotTheme();
  return (
    <div className="copilot-chat-message-in flex justify-start">
      <div
        className={
          theme.isV2
            ? "inline-flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/6 bg-[var(--ds-copilot-v2-elevated)] px-4 py-3"
            : "inline-flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.08] bg-[#141414] px-4 py-3"
        }
        role="status"
        aria-live="polite"
        aria-label="Hyprearn is analyzing"
      >
        <span className="copilot-chat-typing-dot size-1.5 rounded-full bg-[#8a8a8a]" />
        <span className="copilot-chat-typing-dot size-1.5 rounded-full bg-[#8a8a8a]" />
        <span className="copilot-chat-typing-dot size-1.5 rounded-full bg-[#8a8a8a]" />
      </div>
    </div>
  );
}

function ChatBubble({ msg, strategyName, cardHandlers }) {
  const theme = useCopilotTheme();
  const isUser = msg.role === "user";

  if (theme.isV2) {
    const hasRichContent = Boolean(msg.richCards?.length);
    const bubbleMax = isUser
      ? "max-w-[min(88%,20rem)]"
      : hasRichContent
        ? "max-w-[min(100%,26rem)]"
        : "max-w-[min(92%,24rem)]";

    return (
      <article
        className={`copilot-chat-message-in flex w-full ${isUser ? "justify-end" : "justify-start"}`}
        data-chat-role={msg.role}
      >
        <div
          className={`${bubbleMax} ${isUser ? theme.chatUserBubble : theme.chatAiBubble}`}
        >
          <p
            className={`text-[13px] leading-[1.6] ${
              isUser ? "text-[#f4f4f4]" : "text-[#d4d4d4]"
            } ${isUser ? "text-right" : "text-left"}`}
          >
            {msg.text}
          </p>
          {msg.attachments?.length ? (
            <div
              className={`mt-2.5 flex flex-wrap gap-1.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {msg.attachments.map((a) => (
                <span
                  key={`${a.type}-${a.label}`}
                  className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-0.5 text-[10px] text-[#a0a0a0]"
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
            <div
              className={`mt-2.5 flex flex-wrap gap-1.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {msg.cards.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-0.5 text-[10px] text-[#a0a0a0]"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`max-w-[92%] ${isUser ? "text-right" : ""}`}>
        <div className={isUser ? theme.chatUserBubble : theme.chatAiBubble}>
          <p className="text-xs leading-relaxed">{msg.text}</p>
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

function ChatEmptyState({ onExamplePrompt, theme }) {
  const suggestions = CHAT_EMPTY_EXAMPLES.slice(0, 3);

  if (theme.isV2) {
    return (
      <div className="flex min-h-[min(320px,50vh)] flex-col items-center justify-center px-2 py-8 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#141414] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
          <MessageSquare className="size-5 text-[#8a8a8a]" aria-hidden />
        </div>
        <h3 className="mt-4 text-sm font-semibold tracking-tight text-[#f4f4f4]">
          Build or inspect a strategy
        </h3>
        <p className="mt-2 max-w-[16rem] text-[12px] leading-relaxed text-[#8a8a8a]">
          Ask AI to create, backtest, optimize, or paper trade — configuration
          and results appear here.
        </p>
        <div className="mt-5 flex w-full max-w-[18rem] flex-col gap-2">
          {suggestions.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onExamplePrompt?.(ex)}
              className={theme.chatExampleBtn}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
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
            className={theme.chatExampleBtn}
          >
            {ex}
          </button>
        ))}
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
      className={`relative flex h-full min-h-0 w-full flex-col border-l ${theme.chatPanel}`}
      data-strategy-chat-panel
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

      <ScrollFade
        ref={scrollRef}
        axis="y"
        fadeColor="var(--ds-copilot-v2-bg)"
        className="min-h-0 flex-1"
        viewportClassName={`${theme.chatScrollArea ?? ""}`.trim()}
      >
        <div
          className={
            theme.isV3
              ? "space-y-5 px-4 py-4 pb-56"
              : theme.isV2
                ? "space-y-5 px-4 py-4 pb-32"
                : "space-y-3 p-3 pb-24"
          }
        >
          {messages.length === 0 ? (
            <ChatEmptyState onExamplePrompt={onExamplePrompt} theme={theme} />
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
          {loading ? <ChatTypingIndicator /> : null}
          {optimizeLoading ? (
            <p className="copilot-chat-message-in text-left text-[12px] text-[#8a8a8a]">
              Optimizing strategy parameters…
            </p>
          ) : null}
        </div>
      </ScrollFade>

      <footer
        className={
          theme.isV3
            ? theme.chatComposerFooter
            : theme.isV2
              ? "relative z-20 shrink-0 px-3.5 pb-3.5 pt-2"
              : `relative shrink-0 z-20 border-t p-3 ${theme.panel}`
        }
      >
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
        {theme.isV2 ? (
          <div
            className="ds-strategy-composer-stage relative z-0 w-full"
            style={{ "--ds-strategy-composer-shell-width": "100%" }}
          >
            <StrategyPromptBox
              className="w-full"
              variant="composer"
              composerShell="chat"
              value={prompt}
              onChange={onPromptChange}
              onSubmit={onSubmit}
              loading={loading}
              chatModelId={chatModelId}
              onChatModelChange={onChatModelChange}
              attachments={attachments}
              onAttachmentsChange={onAttachmentsChange}
              enableSuggestions
              placeholder={
                theme.isV3
                  ? "Describe your trading idea in plain language, upload an image, a video, or code."
                  : "Ask AI to build, test, optimize, or paper trade…"
              }
            />
          </div>
        ) : (
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
            placeholder="Ask AI to build, test, optimize, or paper trade…"
          />
        )}
      </footer>
    </aside>
  );
}
