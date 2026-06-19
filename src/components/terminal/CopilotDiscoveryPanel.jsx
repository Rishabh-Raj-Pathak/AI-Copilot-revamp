import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * Discovery panel — strategy + filters + utilities in one responsive card.
 * Mobile: two rows (strategy + utilities, then scrollable filters).
 * Desktop: single row.
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
      <div className="flex flex-col gap-2.5 px-3 py-2.5 sm:px-3.5 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-x-4 tablet:gap-y-0">
        {/* Mobile row 1 / desktop left cluster */}
        <div className="flex min-w-0 items-center justify-between gap-2 tablet:min-w-0 tablet:flex-1 tablet:justify-start tablet:gap-2.5">
          <div className="shrink-0">{selector}</div>
          {utilitiesSlot ? (
            <div className="shrink-0 tablet:hidden">{utilitiesSlot}</div>
          ) : null}
          {renderFilters ? (
            <>
              <div
                className="hidden h-6 w-px shrink-0 bg-[#242424] tablet:block"
                aria-hidden
              />
              <div className="hidden min-w-0 tablet:block">{renderFilters("desktop")}</div>
            </>
          ) : null}
        </div>

        {/* Mobile row 2 — scrollable category pills */}
        {renderFilters ? (
          <div className="min-w-0 tablet:hidden">{renderFilters("mobile")}</div>
        ) : null}

        {/* Desktop utilities */}
        {utilitiesSlot ? (
          <div className="hidden shrink-0 tablet:block">{utilitiesSlot}</div>
        ) : null}
      </div>
    </div>
  );
}
