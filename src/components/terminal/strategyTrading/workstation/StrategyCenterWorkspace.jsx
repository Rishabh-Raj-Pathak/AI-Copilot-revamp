import { Save, Shield } from "lucide-react";
import { Button } from "../../../ui/button.jsx";
import { CENTER_TEMPLATES } from "../strategyWorkstationMockData.js";
import { StatusBadge } from "./statusBadge.jsx";
import StrategyChartPanel from "./StrategyChartPanel.jsx";
import StrategyLogicCard from "./StrategyLogicCard.jsx";
import StrategyWorkspaceControls from "./StrategyWorkspaceControls.jsx";
import StrategyWorkspaceTabs from "./StrategyWorkspaceTabs.jsx";

export default function StrategyCenterWorkspace({
  strategy,
  activeTab,
  onTabChange,
  onRunBacktest,
  onStartPaper,
  onReviewDeployment,
  onSave,
  backtestLoading,
  onTemplateClick,
}) {
  if (!strategy) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Build or select a strategy</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#929292]">
          Start from a prompt, use a predefined strategy, or ask Strategy Copilot to
          generate a setup based on your market, timeframe, and risk profile.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {CENTER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTemplateClick(t)}
              className="rounded-lg border border-[#242424] bg-[#0a0a0a] p-3 text-left transition-colors hover:border-[#454545] hover:bg-[#121212]"
            >
              <p className="text-sm font-semibold text-white">{t.title}</p>
              <p className="mt-1 text-xs text-[#757575]">Opens in workspace + chat →</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const canReview =
    strategy.backtest?.status === "complete" ||
    strategy.paperTrading?.status === "active" ||
    strategy.status === "Ready";

  return (
    <div className="minimal-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
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
