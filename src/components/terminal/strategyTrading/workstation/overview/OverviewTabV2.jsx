import StrategyFlowStepper from "../../StrategyFlowStepper.jsx";
import StrategyLogicCard from "../StrategyLogicCard.jsx";
import OverviewBacktestInsights from "./OverviewBacktestInsights.jsx";
import OverviewEquityChart from "./OverviewEquityChart.jsx";
import OverviewKpiStrip from "./OverviewKpiStrip.jsx";
import OverviewPerformancePanel from "./OverviewPerformancePanel.jsx";
import OverviewTradesAnalysis from "./OverviewTradesAnalysis.jsx";

export default function OverviewTabV2({ strategy, setup, statusPanel, aiNotesPanel }) {
  const bt = strategy?.backtest?.results;
  const showPerf = strategy?.backtest?.status === "complete" && bt;

  return (
    <div className="flex flex-col gap-4">
      <StrategyLogicCard setup={setup} />

      {showPerf ? (
        <>
          <OverviewKpiStrip bt={bt} />
          <OverviewEquityChart bt={bt} range={setup} />
          <OverviewPerformancePanel bt={bt} />
          <OverviewTradesAnalysis bt={bt} />
          <OverviewBacktestInsights insights={bt.insights} />
        </>
      ) : null}

      {setup?.flowSteps ? <StrategyFlowStepper steps={setup.flowSteps} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {statusPanel}
        {aiNotesPanel}
      </div>
    </div>
  );
}
