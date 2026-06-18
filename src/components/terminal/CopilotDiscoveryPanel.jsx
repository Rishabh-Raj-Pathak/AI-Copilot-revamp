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
      <div className="border-b border-[#242424] px-3 py-2.5">
        <div className="mb-2 flex min-w-0 items-baseline justify-between gap-2">
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.35px] text-[#757575]">
            AI strategy
          </span>
          {active ? (
            <span className="min-w-0 truncate text-right text-[10px] leading-snug text-[#757575]">
              {active.shortLabel ?? active.name} · {active.risk} risk
            </span>
          ) : null}
        </div>

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

        {detailsOpen && active ? (
          <div
            id="copilot-strategy-details"
            className="mt-2.5 border-t border-[#242424] pt-2.5"
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
