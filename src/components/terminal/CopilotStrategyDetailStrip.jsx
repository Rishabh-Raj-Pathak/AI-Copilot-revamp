const RISK_STYLES = {
  Low: "border-[#0a2917] bg-[#05150c] text-[#269755]",
  Medium: "border-[#3e2e00] bg-[#171200] text-[#f2b500]",
  High: "border-[#470f0f] bg-[#260808] text-[#d53d3d]",
};

function StrategyRiskBadge({ risk, compact = false }) {
  const riskClass = RISK_STYLES[risk] ?? RISK_STYLES.Medium;
  return (
    <span
      className={`shrink-0 rounded-full border font-semibold uppercase tracking-[0.35px] ${riskClass} ${
        compact
          ? "px-1.5 py-px text-[8px]"
          : "px-2 py-0.5 text-[9px]"
      }`}
    >
      {risk} risk
    </span>
  );
}

function StrategyFact({ label, value, compact }) {
  return (
    <div className="min-w-0">
      <dt
        className={`font-medium uppercase tracking-[0.3px] text-[#757575] ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        {label}
      </dt>
      <dd
        className={`mt-0.5 leading-snug text-[#d4d4d4] ${
          compact ? "text-[10px]" : "text-[11px] sm:text-xs"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Active strategy summary — embeds inside CopilotStrategyLensPanel on desktop.
 */
export default function CopilotStrategyDetailStrip({
  strategy,
  compact = false,
}) {
  if (!strategy) return null;

  const facts = (
    <aside
      className={
        compact
          ? "mt-2 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#242424] pt-2"
          : "grid gap-3 rounded-md border border-[#1a1a1a] bg-[#050505] px-3 py-2.5 sm:gap-2.5 sm:self-start"
      }
    >
      <StrategyFact
        label="Timeframe"
        value={strategy.timeframe}
        compact={compact}
      />
      <StrategyFact
        label="Best for"
        value={strategy.bestFor}
        compact={compact}
      />
    </aside>
  );

  return (
    <div aria-live="polite">
      <div
        className={
          compact
            ? "grid gap-2"
            : "grid gap-3 sm:grid-cols-[minmax(0,1fr)_10.5rem] sm:items-start lg:grid-cols-[minmax(0,1fr)_12rem]"
        }
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`font-semibold text-[#f2b500] ${
                compact ? "text-[11px]" : "text-xs"
              }`}
            >
              {strategy.shortLabel ?? strategy.name}
            </span>
            <StrategyRiskBadge risk={strategy.risk} compact={compact} />
          </div>

          <p
            className={`mt-1.5 leading-relaxed text-[#bfbfbf] ${
              compact
                ? "line-clamp-2 text-[11px]"
                : "text-xs sm:text-[13px] sm:leading-[1.55]"
            }`}
          >
            {strategy.description}
          </p>

          {compact ? facts : null}
        </div>

        {!compact ? facts : null}
      </div>
    </div>
  );
}
