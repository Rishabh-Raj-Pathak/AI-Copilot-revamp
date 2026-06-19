import CopilotStrategySelector from "./CopilotStrategySelector.jsx";

/**
 * AI strategy lens — dropdown selector.
 */
export default function CopilotStrategySegments({
  strategies,
  selectedId,
  onSelect,
  mobile = false,
  layout = "default",
}) {
  const active =
    strategies?.find((s) => s.id === selectedId) ?? strategies?.[0] ?? null;

  if (!strategies?.length || !active) return null;

  const isToolbar = layout === "toolbar" && !mobile;

  const selector = (
    <CopilotStrategySelector
      strategies={strategies}
      selectedId={selectedId}
      onSelect={onSelect}
      inline={isToolbar}
    />
  );

  if (isToolbar || mobile) {
    return selector;
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#242424] bg-[#0a0a0a]">
      <div className="px-3.5 py-2.5 sm:px-4">{selector}</div>
    </div>
  );
}
