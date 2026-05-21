import { Button } from "../../ui/button.jsx";
import { Textarea } from "../../ui/textarea.jsx";
import { QUICK_PROMPTS } from "./strategyTradingMockData.js";

export default function StrategyCentralPrompt({
  prompt,
  onPromptChange,
  onSubmit,
  onCreateAgent,
  loading,
  onQuickPrompt,
  large = true,
}) {
  return (
    <div className="flex flex-col gap-3" data-strategy-prompt>
      <div className="minimal-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
        {QUICK_PROMPTS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onQuickPrompt(chip)}
            className="shrink-0 rounded-md border border-[#242424] px-2.5 py-1 text-[10px] font-medium text-[#bfbfbf] transition-colors hover:border-[#454545] hover:text-white"
          >
            {chip}
          </button>
        ))}
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Describe a trading idea, market condition, or agent you want to create..."
        rows={large ? 4 : 3}
        className={`text-sm ${large ? "!min-h-[5.5rem]" : "!min-h-[4rem]"}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          loading={loading}
          disabled={!prompt.trim()}
          onClick={onSubmit}
        >
          Analyze setup
        </Button>
        {onCreateAgent ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateAgent}
          >
            Create agent
          </Button>
        ) : null}
      </div>
    </div>
  );
}
