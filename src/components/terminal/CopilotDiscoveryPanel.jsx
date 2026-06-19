import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * Discovery panel — strategy lens + category filters (left), utilities (right).
 */
export default function CopilotDiscoveryPanel({
  strategies,
  selectedId,
  onSelect,
  mobile = false,
  filtersSlot,
  utilitiesSlot,
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
    return <div>{selector}</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div className="flex items-center justify-between gap-x-3 px-3 py-2.5 sm:gap-x-4 sm:px-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <div className="shrink-0">{selector}</div>
          {filtersSlot ? (
            <>
              <div
                className="hidden h-6 w-px shrink-0 bg-[#242424] sm:block"
                aria-hidden
              />
              {filtersSlot}
            </>
          ) : null}
        </div>
        {utilitiesSlot ? (
          <div className="shrink-0">{utilitiesSlot}</div>
        ) : null}
      </div>
    </div>
  );
}
