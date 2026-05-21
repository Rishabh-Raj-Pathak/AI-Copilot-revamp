const VIEWS = [
  { id: "suggestions", label: "AI Copilot" },
  { id: "strategy-trading", label: "Strategy Copilot" },
];

export default function CopilotViewTabs({ activeView, onViewChange }) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 border-b border-[#242424] bg-black px-3 py-2 sm:px-5"
      role="tablist"
      aria-label="AI Copilot views"
    >
      {VIEWS.map((v) => {
        const active = v.id === activeView;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onViewChange(v.id)}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              active
                ? "bg-[#3e2e00] text-[#f2b500]"
                : "text-[#bfbfbf] hover:bg-white/5 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
