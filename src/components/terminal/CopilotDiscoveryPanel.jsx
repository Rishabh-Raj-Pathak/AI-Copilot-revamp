import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * Discovery panel — strategy lens, market categories and utilities.
 * Single row from `tablet` up; stacks (lens + utilities / categories) below it.
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
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:gap-2.5 sm:px-3.5 tablet:flex-row tablet:items-center tablet:gap-3">
        {/* `contents` at tablet+ hoists the lens and utilities into the single row */}
        <div className="flex min-w-0 items-center justify-between gap-3 tablet:contents">
          <div className="min-w-0 max-tablet:flex-1 tablet:order-1 tablet:shrink-0">
            {selector}
          </div>
          {utilitiesSlot ? (
            <div className="shrink-0 tablet:order-3">{utilitiesSlot}</div>
          ) : null}
        </div>

        {renderFilters ? (
          <div className="min-w-0 border-t border-[#1a1a1a] pt-2 tablet:order-2 tablet:flex-1 tablet:border-t-0 tablet:pt-0">
            {renderFilters()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
