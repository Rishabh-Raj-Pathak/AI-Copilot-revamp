import { CopilotPlatformKpis } from "./CopilotStrategyLensKpis.jsx";
import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * Discovery panel — strategy lens (left) + platform KPIs (right).
 */
export default function CopilotDiscoveryPanel({
  strategies,
  selectedId,
  onSelect,
  stats,
  mobile = false,
}) {
  if (!strategies?.length) return null;

  const selector = (
    <CopilotStrategySelector
      strategies={strategies}
      selectedId={selectedId}
      onSelect={onSelect}
      inline={!mobile}
    />
  );

  if (mobile) {
    return <div className="py-0.5">{selector}</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div className="flex items-center justify-between gap-x-3 px-3 py-2 sm:gap-x-4 sm:px-3.5 sm:py-2.5">
        <div className="min-w-0 flex-1">{selector}</div>

        <div
          className="hidden h-8 w-px shrink-0 bg-[#242424] md:block"
          aria-hidden
        />

        <div className="shrink-0">
          <CopilotPlatformKpis stats={stats} variant="rail" />
        </div>
      </div>
    </div>
  );
}
