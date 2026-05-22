import { ExternalLink } from "lucide-react";
import { CENTER_TEMPLATES } from "../strategyWorkstationMockData.js";
import StrategyPromptBox from "./StrategyPromptBox.jsx";
import StrategyTemplateIllustration from "./StrategyTemplateIllustration.jsx";

function TemplateTag({ children, tone = "neutral" }) {
  const tones = {
    kind: "bg-[#1a2e1a] text-[#8fbc8f] ring-1 ring-[#2d4a2d]",
    asset: "bg-[#1a2438] text-[#8eb4e8] ring-1 ring-[#2a3a52]",
    tf: "bg-[#1e1e1e] text-[#a8a8a8] ring-1 ring-[#333]",
    risk: "bg-transparent text-[#e8a85c] ring-0",
    neutral: "bg-[#1e1e1e] text-[#929292] ring-1 ring-[#333]",
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tones[tone] ?? tones.neutral}`}
    >
      {children}
    </span>
  );
}

function StrategyTemplateCard({ template, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className={`group flex flex-col overflow-hidden rounded-xl border bg-[#0f0f0f] text-left transition-all hover:border-[#454545] hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)] ${
        selected
          ? "border-[#f2b500]/50 shadow-[0_0_0_1px_rgba(242,181,0,0.25)]"
          : "border-[#2a2a2a]"
      }`}
    >
      <div className="flex h-[4.75rem] items-center justify-center border-b border-[#1f1f1f] bg-[#111] px-2.5 pt-2.5 sm:h-[5.5rem]">
        <div className="h-[3.25rem] w-full max-w-[9.5rem] transition-transform duration-200 group-hover:scale-[1.02] sm:h-[3.75rem]">
          <StrategyTemplateIllustration type={template.illustration ?? "candles"} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        <h3 className="font-serif text-[15px] font-semibold leading-snug tracking-tight text-white sm:text-base">
          {template.cardTitle ?? template.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <TemplateTag tone="kind">{template.strategyKind}</TemplateTag>
          <TemplateTag tone="asset">{template.asset}</TemplateTag>
          <TemplateTag tone="tf">{template.timeframe}</TemplateTag>
          <TemplateTag tone="risk">{template.risk}</TemplateTag>
        </div>
      </div>
    </button>
  );
}

export default function StrategyNewStrategyView({
  activeTemplateId,
  onTemplateChange,
  onTemplateApply,
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  chatModelId,
  onChatModelChange,
  attachments,
  onAttachmentsChange,
}) {
  const handleSelect = (template) => {
    onTemplateChange(template.id);
    onTemplateApply(template);
  };

  return (
    <div className="minimal-scrollbar flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-[#080808]">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            Turn Ideas Into Strategies
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#757575]">
            Start from a template or describe your setup in the prompt below.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {CENTER_TEMPLATES.map((t) => (
            <StrategyTemplateCard
              key={t.id}
              template={t}
              selected={t.id === activeTemplateId}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="mt-8 sm:mt-10">
          <StrategyPromptBox
            variant="composer"
            value={prompt}
            onChange={onPromptChange}
            onSubmit={onSubmit}
            loading={loading}
            chatModelId={chatModelId}
            onChatModelChange={onChatModelChange}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
            enableSuggestions
            placeholder="Describe your trading idea in plain language, upload an image, a video, or code."
          />
        </div>

        <div className="mt-6 flex justify-center sm:mt-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#121212] px-4 py-2 text-xs font-medium text-[#bfbfbf] transition-colors hover:border-[#454545] hover:text-white"
            onClick={() => {
              window.open("https://www.tradingview.com/scripts/", "_blank", "noopener,noreferrer");
            }}
          >
            <span className="flex size-5 items-center justify-center rounded bg-[#1e3a5f] text-[9px] font-bold text-white">
              TV
            </span>
            Browse Enhanced TradingView Strategies
            <ExternalLink className="size-3 opacity-60" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
