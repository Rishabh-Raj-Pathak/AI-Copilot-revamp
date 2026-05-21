import StrategyCentralPrompt from "./StrategyCentralPrompt.jsx";
import StrategyTemplateCards from "./StrategyTemplateCards.jsx";

export default function StrategyLandingView({
  prompt,
  onPromptChange,
  onSubmit,
  onCreateAgent,
  loading,
  onQuickPrompt,
  onTemplateSelect,
  selectedTemplateId,
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          What do you want your AI trading desk to do?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#929292]">
          Pick a model, choose a strategy, or describe what you want Hyprearn to
          analyze, build, or monitor.
        </p>
      </div>

      <StrategyTemplateCards
        onSelect={onTemplateSelect}
        selectedId={selectedTemplateId}
      />

      <div className="rounded-xl border border-[#242424] bg-[#0a0a0a] p-4 sm:p-5">
        <StrategyCentralPrompt
          prompt={prompt}
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          onCreateAgent={onCreateAgent}
          loading={loading}
          onQuickPrompt={onQuickPrompt}
          large
        />
      </div>

      <p className="text-center text-[10px] leading-relaxed text-[#585858]">
        AI-generated setups are for analysis and decision support only. Review
        risk before taking any trade.
      </p>
    </div>
  );
}
