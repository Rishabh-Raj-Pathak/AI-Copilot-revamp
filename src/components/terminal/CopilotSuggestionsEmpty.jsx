import { COPILOT_CATEGORY_LABELS } from "./copilotSetups.js";

export default function CopilotSuggestionsEmpty({
  strategyName,
  categoryId,
  onSwitchCategory,
  onSwitchStrategy,
}) {
  const categoryLabel =
    COPILOT_CATEGORY_LABELS[categoryId] ?? categoryId;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#242424] bg-[#0a0a0a] px-6 py-12 text-center">
      <p className="text-sm font-medium text-white">
        No {strategyName} setups in {categoryLabel} right now
      </p>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#757575]">
        Try a different market category or switch your AI strategy lens to see
        matching suggestions.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {categoryId !== "trending" ? (
          <button
            type="button"
            onClick={() => onSwitchCategory?.("trending")}
            className="rounded-md border border-[#242424] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#333333] hover:bg-white/5"
          >
            View Trending
          </button>
        ) : null}
        {categoryId !== "bluechip" ? (
          <button
            type="button"
            onClick={() => onSwitchCategory?.("bluechip")}
            className="rounded-md border border-[#242424] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#333333] hover:bg-white/5"
          >
            View Bluechip
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSwitchStrategy}
          className="rounded-md border border-[#3e2e00] bg-[#171200] px-3 py-1.5 text-xs font-medium text-[#f2b500] transition-colors hover:border-[#f7bb08]/40"
        >
          Switch strategy
        </button>
      </div>
    </div>
  );
}
