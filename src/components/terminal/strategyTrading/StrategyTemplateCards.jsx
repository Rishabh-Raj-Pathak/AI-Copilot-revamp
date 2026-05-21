import { TEMPLATE_CARDS } from "./strategyTradingMockData.js";

export default function StrategyTemplateCards({ onSelect, selectedId }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATE_CARDS.map((card) => {
        const active = selectedId === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card)}
            className={`group rounded-lg border p-3 text-left transition-all ${
              active
                ? "border-[#f2b500]/40 bg-[#121212] shadow-[0_0_0_1px_rgba(242,181,0,0.2)]"
                : "border-[#242424] bg-[#0a0a0a] hover:border-[#454545] hover:bg-[#121212]"
            }`}
          >
            <h3 className="text-sm font-semibold text-white group-hover:text-[#f2b500]">
              {card.title}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium text-[#929292] ring-1 ring-[#242424]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#757575]">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
