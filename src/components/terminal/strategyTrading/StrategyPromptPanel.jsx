import { Button } from "../../ui/button.jsx";
import { Textarea } from "../../ui/textarea.jsx";
import { QUICK_PROMPTS } from "./strategyTradingMockData.js";

export default function StrategyPromptPanel({
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  chatMessages,
  onQuickPrompt,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" data-strategy-prompt>
      <div className="minimal-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {chatMessages.length === 0 ? (
          <p className="text-xs text-[#757575]">
            Your prompts and AI responses appear here.
          </p>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "ml-4 border border-[#242424] bg-[#121212] text-white"
                  : "mr-2 border border-[#242424]/80 bg-[#0a0a0a] text-[#bfbfbf]"
              }`}
            >
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#757575]">
                {msg.role === "user" ? "You" : "Hyprearn"}
              </span>
              {msg.text}
            </div>
          ))
        )}
      </div>

      <div className="mt-3 shrink-0">
        <div className="minimal-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {QUICK_PROMPTS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onQuickPrompt(chip)}
              className="shrink-0 rounded-full border border-[#242424] px-2.5 py-1 text-[10px] font-medium text-[#bfbfbf] transition-colors hover:border-[#454545] hover:text-white"
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
          className="flex flex-col gap-2"
        >
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Ask Hyprearn to analyze, build, monitor, or improve a trading setup..."
            rows={3}
            className="!min-h-[4.5rem] text-sm"
          />
          <Button
            type="submit"
            variant="default"
            size="sm"
            loading={loading}
            disabled={!prompt.trim()}
            className="self-end"
          >
            Analyze setup
          </Button>
        </form>
      </div>
    </div>
  );
}
