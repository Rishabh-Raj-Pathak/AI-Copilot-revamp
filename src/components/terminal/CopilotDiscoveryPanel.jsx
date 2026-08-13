import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * Discovery panel — strategy lens, market categories and utilities.
 * Single row from `tablet` up; stacks (lens + utilities / categories) below it.
 *
 * Frameless by design. This used to be a bordered, filled card sitting inside
 * `MarketFiltersBar`'s own bordered strip — a box in a box, with two paddings
 * stacked and two greys competing, which is what made the row read blocky. The
 * controls it holds are already self-outlined (amber lens pill, pill filters),
 * so the row needs separation, not a container: the toolbar's `border-b` closes
 * it off and one hairline divides lens from categories.
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
    <div className="flex min-w-0 flex-col gap-2 sm:gap-2.5 tablet:flex-row tablet:items-center tablet:gap-3">
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
        <div className="min-w-0 border-t border-[#1a1a1a] pt-2 tablet:order-2 tablet:flex-1 tablet:border-t-0 tablet:border-l tablet:border-[#242424] tablet:pt-0 tablet:pl-3">
          {renderFilters()}
        </div>
      ) : null}
    </div>
  );
}
