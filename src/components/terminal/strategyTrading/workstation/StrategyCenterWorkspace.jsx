import { Plus, Save, Shield } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import { StatusBadge } from "./statusBadge.jsx";
import StrategyChartPanel from "./StrategyChartPanel.jsx";
import StrategyLogicCard from "./StrategyLogicCard.jsx";
import StrategyNewStrategyView from "./StrategyNewStrategyView.jsx";
import StrategyWorkspaceControls from "./StrategyWorkspaceControls.jsx";
import StrategyWorkspaceTabs from "./StrategyWorkspaceTabs.jsx";

export default function StrategyCenterWorkspace({
  strategy,
  composerMode,
  activeTemplateId,
  onTemplateChange,
  onTemplateApply,
  prompt,
  onPromptChange,
  onComposerSubmit,
  composerLoading,
  chatModelId,
  onChatModelChange,
  attachments,
  onAttachmentsChange,
  onExamplePrompt,
  onNewStrategy,
  activeTab,
  onTabChange,
  onRunBacktest,
  onStartPaper,
  onReviewDeployment,
  onSave,
  backtestLoading,
}) {
  if (composerMode) {
    return (
      <StrategyNewStrategyView
        activeTemplateId={activeTemplateId}
        onTemplateChange={onTemplateChange}
        onTemplateApply={onTemplateApply}
        prompt={prompt}
        onPromptChange={onPromptChange}
        onSubmit={onComposerSubmit}
        loading={composerLoading}
        chatModelId={chatModelId}
        onChatModelChange={onChatModelChange}
        attachments={attachments}
        onAttachmentsChange={onAttachmentsChange}
      />
    );
  }

  if (!strategy) {
    return (
      <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-black p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Build or select a strategy</h2>
        <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-[#929292]">
          Create a new strategy from templates and a prompt, or pick an existing one from
          the sidebar.
        </p>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="mt-6 gap-1.5"
          onClick={onNewStrategy}
        >
          <Plus className="size-4" aria-hidden />
          New Strategy
        </Button>
      </div>
    );
  }

  const canReview =
    strategy.backtest?.status === "complete" ||
    strategy.paperTrading?.status === "active" ||
    strategy.status === "Ready";

  return (
    <div className="minimal-scrollbar flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-black">
      <header className="shrink-0 border-b border-[#242424] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-white">{strategy.name}</h2>
              <StatusBadge status={strategy.status} />
            </div>
            <p className="mt-1 text-xs text-[#757575]">
              {strategy.market} · {strategy.timeframe} · {strategy.strategy} ·{" "}
              {strategy.model} Model
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={onSave}>
              <Save className="size-3.5" aria-hidden />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onRunBacktest} loading={backtestLoading}>
              Run Backtest
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStartPaper}
              disabled={strategy.paperTrading?.status === "active"}
            >
              Start Paper Trading
            </Button>
            <Button
              size="sm"
              variant="default"
              className="gap-1"
              onClick={onReviewDeployment}
              disabled={!canReview}
              title={
                !canReview
                  ? "Run backtest or paper trading before deployment review"
                  : undefined
              }
            >
              <Shield className="size-3.5" aria-hidden />
              Review Deployment
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <StrategyChartPanel strategy={strategy} />
        <StrategyWorkspaceControls
          strategy={strategy}
          onRunBacktest={onRunBacktest}
          onStartPaper={onStartPaper}
          backtestLoading={backtestLoading}
        />
        <StrategyLogicCard setup={strategy.setup} />
        <StrategyWorkspaceTabs
          strategy={strategy}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onRunBacktest={onRunBacktest}
          onStartPaper={onStartPaper}
          backtestLoading={backtestLoading}
        />
      </div>
    </div>
  );
}
