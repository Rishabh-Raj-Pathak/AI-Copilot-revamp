import { useEffect, useRef, useState } from "react";
import CopilotStrategyDetailStrip from "./CopilotStrategyDetailStrip.jsx";
import { CopilotPlatformKpis } from "./CopilotStrategyLensKpis.jsx";
import CopilotStrategySegments from "./CopilotStrategySegments.jsx";
import CopilotStrategySelector from "./CopilotStrategySelector.jsx";
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
      if (
        t instanceof Element &&
        (t.closest('[aria-label="Select AI strategy"]') ||
          t.closest('[role="listbox"][aria-label="Select AI strategy"]'))
      ) {
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

  const handleSelect = (id) => {
    if (id === active?.id) {
      setDetailsOpen((open) => !open);
      return;
    }
    onSelect(id);
    setDetailsOpen(true);
  };

  if (mobile) {
    return (
      <div className="py-0.5">
        <CopilotStrategySelector
          strategies={strategies}
          selectedId={selectedId}
          onSelect={handleSelect}
          onViewDetails={() => setDetailsOpen(true)}
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
