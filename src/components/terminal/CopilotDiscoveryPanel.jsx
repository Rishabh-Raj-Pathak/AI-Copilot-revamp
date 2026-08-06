import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * Discovery panel — two rows: strategy lens (primary), then market categories.
 */
export default function CopilotDiscoveryPanel({
  strategies,
  selectedId,
  onSelect,
  renderFilters,
  utilitiesSlot,
}) {
  if (!strategies?.length) return null;

  const selector = (
    <CopilotStrategySelector
      strategies={strategies}
      selectedId={selectedId}
      onSelect={onSelect}
      inline
    />
  );

  return (
    <div className="overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:gap-2.5 sm:px-3.5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{selector}</div>
          {utilitiesSlot ? (
            <div className="shrink-0">{utilitiesSlot}</div>
          ) : null}
        </div>

        {renderFilters ? (
          <div className="min-w-0 border-t border-[#1a1a1a] pt-2">
            {renderFilters()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
