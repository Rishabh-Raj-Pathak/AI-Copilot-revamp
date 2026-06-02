import { Play, Plus, Save } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { formatStrategyHeaderMeta } from "../strategyCopilotUi.js";
import { StatusBadge } from "./statusBadge.jsx";
import StrategyChartPanel from "./StrategyChartPanel.jsx";
import StrategyNewStrategyView from "./StrategyNewStrategyView.jsx";
import StrategyLogicCard from "./StrategyLogicCard.jsx";
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
  onOptimize,
  onStartPaper,
  onReviewDeployment,
  onSave,
  onSetupChange,
  backtestLoading,
  optimizeLoading,
}) {
  const theme = useCopilotTheme();

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
      <div
        className={`flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 ${theme.shell}`}
      >
        <h2 className="text-lg font-semibold text-white">
          Build or select a strategy
        </h2>
        <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-[#929292]">
          Create a new strategy from templates and a prompt, or pick an existing
          one from the sidebar.
        </p>
        <button
          type="button"
          className={`${theme.gradientCta} mt-6 gap-1.5 px-4`}
          onClick={onNewStrategy}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          New Strategy
        </button>
      </div>
    );
  }

  const isDeployed = strategy.deployment?.status === "active";
  const hasBacktestOrPaper =
    strategy.backtest?.status === "complete" ||
    strategy.paperTrading?.status === "active" ||
    strategy.status === "Ready";
  /** v2: deploy from draft without backtest; v1/v3: require backtest or paper first */
  const canDeploy =
    theme.isV2 && !theme.isV3 ? !isDeployed : hasBacktestOrPaper;
  const backtestComplete = strategy.backtest?.status === "complete";

  const scrollShellClass = theme.isV2
    ? `ds-scrollbar-hidden flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto ${theme.shell}`
    : `minimal-scrollbar flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto ${theme.shell}`;

  return (
    <div className={scrollShellClass}>
      <header
        className={`shrink-0 border-b border-b-[#242424] bg-[#121212] px-4 py-4 sm:px-5 ${theme.workspaceHeader}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className={theme.headerTitle}>{strategy.name}</h2>
              <StatusBadge status={strategy.status} />
            </div>
            <p className={`mt-1.5 ${theme.headerMeta}`}>
              {formatStrategyHeaderMeta(strategy)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {theme.isV2 ? (
              <>
                <button
                  type="button"
                  className={`${theme.secondaryActionBtn} gap-1.5`}
                  onClick={onSave}
                >
                  <Save className="size-3.5" aria-hidden />
                  Save
                </button>
                {!theme.isV3 ? (
                  <button
                    type="button"
                    className={`${theme.runBacktestBtn} inline-flex min-h-8 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={onRunBacktest}
                    disabled={backtestLoading}
                    aria-busy={backtestLoading}
                  >
                    {backtestLoading ? (
                      <span
                        className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white/80"
                        aria-hidden
                      />
                    ) : (
                      <Play className="size-3.5 shrink-0" aria-hidden />
                    )}
                    {backtestComplete ? "Re-run Backtest" : "Backtest"}
                  </button>
                ) : null}
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className={`gap-1.5 ${theme.outlineBtn}`}
                onClick={onSave}
              >
                <Save className="size-3.5" aria-hidden />
                Save
              </Button>
            )}
            <button
              type="button"
              className={`${theme.gradientCta} gap-1.5 text-xs font-medium ${theme.isV2 ? "" : "px-4 sm:text-sm"} ${!canDeploy ? "pointer-events-none opacity-50" : ""}`}
              onClick={onReviewDeployment}
              disabled={!canDeploy}
              title={
                !canDeploy
                  ? theme.isV2 && !theme.isV3
                    ? isDeployed
                      ? "Strategy is already deployed"
                      : undefined
                    : "Run backtest or paper trading before deployment"
                  : undefined
              }
            >
              Deploy
            </button>
          </div>
        </div>
      </header>

      <div className={theme.workspaceBody}>
        {theme.isV2 ? (
          <div
            className={`${theme.chartSection} ${theme.isV3 ? "mx-4 mt-4 sm:mx-5 sm:mt-5" : ""}`}
          >
            <StrategyChartPanel strategy={strategy} embedded />
            <StrategyWorkspaceControls
              strategy={strategy}
              onSetupChange={onSetupChange}
              onOptimize={onOptimize}
              optimizeLoading={optimizeLoading}
              embedded
            />
          </div>
        ) : (
          <>
            <StrategyChartPanel strategy={strategy} />
            <StrategyWorkspaceControls
              strategy={strategy}
              onSetupChange={onSetupChange}
              onOptimize={onOptimize}
              optimizeLoading={optimizeLoading}
            />
          </>
        )}

        {!theme.isV2 ? <StrategyLogicCard setup={strategy.setup} /> : null}

        <div className={theme.isV3 ? "border-t border-white/[0.06]" : undefined}>
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
    </div>
  );
}
