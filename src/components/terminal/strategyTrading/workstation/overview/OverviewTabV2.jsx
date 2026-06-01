import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import StrategyFlowStepper from "../../StrategyFlowStepper.jsx";
import StrategyLogicCard from "../StrategyLogicCard.jsx";
import { V3TabShell } from "../V3TabLayout.jsx";
import OverviewBacktestInsights from "./OverviewBacktestInsights.jsx";
import OverviewEquityChart from "./OverviewEquityChart.jsx";
import OverviewKpiStrip from "./OverviewKpiStrip.jsx";
import OverviewPerformancePanel from "./OverviewPerformancePanel.jsx";
import OverviewTradesAnalysis from "./OverviewTradesAnalysis.jsx";

export default function OverviewTabV2({ strategy, setup }) {
  const theme = useCopilotTheme();
  const bt = strategy?.backtest?.results;
  const showPerf = strategy?.backtest?.status === "complete" && bt;

  if (theme.isV3) {
    return (
      <V3TabShell>
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

        {setup?.flowSteps ? (
          <StrategyFlowStepper steps={setup.flowSteps} />
        ) : null}
      </V3TabShell>
    );
  }

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

      {setup?.flowSteps ? (
        <StrategyFlowStepper steps={setup.flowSteps} />
      ) : null}
    </div>
  );
}
