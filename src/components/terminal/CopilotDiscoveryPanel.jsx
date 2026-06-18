import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CopilotStrategyDetailStrip from "./CopilotStrategyDetailStrip.jsx";
import { CopilotPlatformKpis } from "./CopilotStrategyLensKpis.jsx";
import CopilotStrategySegments from "./CopilotStrategySegments.jsx";
import { markCopilotStrategyDetailsIntroSeen } from "./copilotStrategies.js";

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
  const panelRef = useRef(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lensExpanded, setLensExpanded] = useState(false);

  useEffect(() => {
    if (detailsOpen) {
      markCopilotStrategyDetailsIntroSeen();
    }
  }, [detailsOpen]);

  useEffect(() => {
    if (mobile || !detailsOpen) return undefined;

    const onPointerDown = (e) => {
      const t = e.target;
      if (panelRef.current?.contains(t)) return;
      if (t instanceof Element && t.closest('[aria-label="More AI strategies"]')) {
        return;
      }
      setDetailsOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setDetailsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [detailsOpen, mobile]);

  const active =
    strategies?.find((s) => s.id === selectedId) ?? strategies?.[0] ?? null;

  if (mobile) {
    return (
      <div className="py-0.5">
        <button
          type="button"
          onClick={() => setLensExpanded((open) => !open)}
          aria-expanded={lensExpanded}
          className="flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-[#242424] px-2.5 py-1.5 text-left"
        >
          <span className="min-w-0 truncate text-xs font-medium text-white">
            {active?.shortLabel ?? active?.name ?? "AI strategy"}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {active ? (
              <span className="text-[10px] text-[#757575]">
                {active.risk} risk
              </span>
            ) : null}
            <ChevronDown
              className={`size-3.5 shrink-0 text-[#757575] transition-transform ${
                lensExpanded ? "rotate-180" : ""
              }`}
              strokeWidth={2}
              aria-hidden
            />
          </span>
        </button>

        {lensExpanded ? (
          <div className="mt-2">
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
        ) : null}
      </div>
    );
  }

  if (!strategies?.length) return null;

  return (
    <div
      ref={panelRef}
      className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]"
    >
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
