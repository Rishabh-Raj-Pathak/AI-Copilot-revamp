import { useCopilotTheme } from "../../StrategyCopilotContext.jsx";
import StrategyFlowStepper from "../../StrategyFlowStepper.jsx";
import StrategyLogicCard from "../StrategyLogicCard.jsx";
import { V3TabShell } from "../V3TabLayout.jsx";

export default function OverviewTabV2({ setup }) {
  const theme = useCopilotTheme();

  if (theme.isV3) {
    return (
      <V3TabShell>
        <StrategyLogicCard setup={setup} />
        {setup?.flowSteps ? (
          <StrategyFlowStepper steps={setup.flowSteps} />
        ) : null}
      </V3TabShell>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <StrategyLogicCard setup={setup} />
      {setup?.flowSteps ? (
        <StrategyFlowStepper steps={setup.flowSteps} />
      ) : null}
    </div>
  );
}
