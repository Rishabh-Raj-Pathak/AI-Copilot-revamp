import { EMPTY_STATE_ACTIONS } from "./strategyTradingMockData.js";

export default function StrategyEmptyState({ onActionClick }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-white sm:text-lg">
          What do you want your AI trading desk to do?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#929292]">
          Pick a model, choose a strategy, or simply describe what you want to
          monitor.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {EMPTY_STATE_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onActionClick(action.prompt)}
            className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3.5 text-left transition-colors hover:border-[#454545] hover:bg-[#121212]"
          >
            <p className="text-sm font-semibold text-white">{action.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#929292]">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
