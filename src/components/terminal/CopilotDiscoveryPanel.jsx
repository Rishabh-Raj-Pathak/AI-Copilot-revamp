import { useEffect, useState } from "react";
import CopilotStrategyDetailStrip from "./CopilotStrategyDetailStrip.jsx";
import { CopilotPlatformKpis } from "./CopilotStrategyLensKpis.jsx";
import CopilotStrategySegments from "./CopilotStrategySegments.jsx";
import {
  getInitialCopilotStrategyDetailsOpen,
  markCopilotStrategyDetailsIntroSeen,
} from "./copilotStrategies.js";

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
  const [detailsOpen, setDetailsOpen] = useState(() =>
    mobile ? false : getInitialCopilotStrategyDetailsOpen(),
  );

  useEffect(() => {
    if (detailsOpen) {
      markCopilotStrategyDetailsIntroSeen();
    }
  }, [detailsOpen]);

  const active =
    strategies?.find((s) => s.id === selectedId) ?? strategies?.[0] ?? null;

  if (mobile) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
        <div className="border-b border-[#242424] px-3 py-2.5">
          <CopilotPlatformKpis stats={stats} mobile />
        </div>

        <div className="px-3 py-2.5">
          <CopilotStrategySegments
            strategies={strategies}
            selectedId={selectedId}
            onSelect={onSelect}
            mobile
            embedded
            detailsOpen={detailsOpen}
            onDetailsOpenChange={setDetailsOpen}
            renderDetailsPanel={false}
          />
        </div>

        {detailsOpen && active ? (
          <div
            id="copilot-strategy-details"
            className="border-t border-[#242424] px-3 py-2.5"
          >
            <CopilotStrategyDetailStrip strategy={active} compact />
          </div>
        ) : null}
      </div>
    );
  }

  if (!strategies?.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div
        className={`flex items-center justify-between gap-x-3 px-3 py-2 sm:gap-x-4 sm:px-3.5 sm:py-2.5 ${
          detailsOpen ? "border-b border-[#242424]" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <CopilotStrategySegments
            strategies={strategies}
            selectedId={selectedId}
            onSelect={onSelect}
            layout="toolbar"
            detailsOpen={detailsOpen}
            onDetailsOpenChange={setDetailsOpen}
          />
        </div>

        <div
          className="hidden h-8 w-px shrink-0 bg-[#242424] md:block"
          aria-hidden
        />

        <div className="shrink-0 max-md:w-full max-md:border-t max-md:border-[#242424] max-md:pt-2">
          <CopilotPlatformKpis stats={stats} variant="rail" />
        </div>
      </div>

      {detailsOpen && active ? (
        <div
          id="copilot-strategy-details"
          className="border-t border-[#242424] px-3.5 py-3 sm:px-4"
        >
          <CopilotStrategyDetailStrip strategy={active} />
        </div>
      ) : null}
    </div>
  );
}
