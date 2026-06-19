import { useEffect, useState } from "react";
import CopilotStrategyDetailStrip from "./CopilotStrategyDetailStrip.jsx";
import CopilotStrategySelector from "./CopilotStrategySelector.jsx";
import {
  getInitialCopilotStrategyDetailsOpen,
  markCopilotStrategyDetailsIntroSeen,
} from "./copilotStrategies.js";

/**
 * AI strategy lens — dropdown selector + optional details accordion.
 */
export default function CopilotStrategySegments({
  strategies,
  selectedId,
  onSelect,
  mobile = false,
  layout = "default",
  showDetails = true,
  embedded = false,
  renderDetailsPanel = true,
  detailsOpen: detailsOpenProp,
  onDetailsOpenChange,
}) {
  const [detailsOpenInternal, setDetailsOpenInternal] = useState(
    getInitialCopilotStrategyDetailsOpen,
  );
  const detailsOpen = detailsOpenProp ?? detailsOpenInternal;
  const setDetailsOpen = onDetailsOpenChange ?? setDetailsOpenInternal;
  const isControlled = detailsOpenProp !== undefined;

  useEffect(() => {
    if (!isControlled && detailsOpenInternal) {
      markCopilotStrategyDetailsIntroSeen();
    }
  }, [detailsOpenInternal, isControlled]);

  useEffect(() => {
    if (isControlled && detailsOpen) {
      markCopilotStrategyDetailsIntroSeen();
    }
  }, [detailsOpen, isControlled]);

  const active =
    strategies?.find((s) => s.id === selectedId) ?? strategies?.[0] ?? null;

  if (!strategies?.length || !active) return null;

  const handleSelect = (id) => {
    if (id === active.id && showDetails) {
      setDetailsOpen(!detailsOpen);
      return;
    }
    onSelect(id);
    if (showDetails) {
      setDetailsOpen(true);
    }
  };

  const isToolbar = layout === "toolbar" && !mobile;

  const selector = (
    <CopilotStrategySelector
      strategies={strategies}
      selectedId={selectedId}
      onSelect={handleSelect}
      inline={isToolbar}
      onViewDetails={
        showDetails ? () => setDetailsOpen(true) : undefined
      }
    />
  );

  if (isToolbar) {
    return selector;
  }

  if (mobile) {
    const mobileBody = (
      <>
        <div
          className={
            embedded
              ? undefined
              : `px-3 py-2.5 ${
                  showDetails && detailsOpen ? "border-b border-[#242424]" : ""
                }`
          }
        >
          {selector}
        </div>

        {showDetails && detailsOpen && renderDetailsPanel ? (
          <div
            id="copilot-strategy-details"
            className={
              embedded
                ? "mt-2.5 border-t border-[#242424] pt-2.5"
                : "px-3 py-2.5"
            }
          >
            <CopilotStrategyDetailStrip strategy={active} compact />
          </div>
        ) : null}
      </>
    );

    if (embedded) {
      return mobileBody;
    }

    return (
      <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
        {mobileBody}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div
        className={`px-3.5 py-2.5 sm:px-4 ${
          showDetails && detailsOpen ? "border-b border-[#242424]" : ""
        }`}
      >
        {selector}
      </div>

      {showDetails && detailsOpen && renderDetailsPanel ? (
        <div id="copilot-strategy-details" className="px-3.5 py-3 sm:px-4 sm:py-3.5">
          <CopilotStrategyDetailStrip strategy={active} />
        </div>
      ) : null}
    </div>
  );
}
