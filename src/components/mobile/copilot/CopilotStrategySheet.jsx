import BottomSheet from "../BottomSheet.jsx";
import { useHistoryBack } from "../appHistory.js";

/** Figma "Risk Badge" (942:2459 Low · 942:2462 Medium); High mirrors the desktop palette. */
const RISK_TONES = {
  Low: "border-[#0a2917] bg-app-positive-subtle text-app-positive",
  Medium: "border-app-accent-subtle bg-app-accent-faint text-app-accent",
  High: "border-[#470f0f] bg-app-negative-subtle text-app-negative",
};

function RiskBadge({ risk }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-app-micro font-semibold uppercase leading-3 tracking-[0.35px] ${
        RISK_TONES[risk] ?? RISK_TONES.Medium
      }`}
    >
      {risk} risk
    </span>
  );
}

/** Figma "Strategy Option" (942:2464 default · 942:2473 selected). */
function StrategyOption({ strategy, selected, onSelect, onDetails }) {
  return (
    <li
      className={`overflow-hidden rounded-xl border ${
        selected ? "border-app-accent-subtle bg-app-accent-faint" : "border-app-line bg-[#050505]"
      }`}
    >
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(strategy.id)}
        className="flex w-full flex-col gap-2 p-4 text-left transition-colors active:bg-white/[0.03]"
      >
        <span className="flex w-full items-center justify-between gap-3">
          <span className="min-w-0 truncate text-app-body font-semibold leading-5 text-ink">
            {strategy.shortLabel ?? strategy.name}
          </span>
          <RiskBadge risk={strategy.risk} />
        </span>
        <span className="text-app-caption font-normal leading-[18.6px] text-ink-faint">
          {strategy.description}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDetails(strategy.id)}
        aria-label={`${strategy.shortLabel ?? strategy.name} details`}
        className="flex w-full items-center justify-end border-t border-app-line px-4 py-3 transition-colors active:bg-white/[0.03]"
      >
        <span className="text-app-label font-medium uppercase leading-[14px] tracking-[0.35px] text-app-accent">
          Details
        </span>
      </button>
    </li>
  );
}

/** Figma "Strategy Card" (943:2557). */
function StrategyDetails({ strategy }) {
  if (!strategy) return null;
  const specs = [
    ["Timeframe", strategy.timeframe],
    ["Best for", strategy.bestFor],
  ].filter(([, value]) => value);

  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-app-line bg-[#050505] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-app-body font-semibold leading-5 text-ink">
          {strategy.shortLabel ?? strategy.name}
        </p>
        <RiskBadge risk={strategy.risk} />
      </div>
      <p className="text-app-caption font-normal leading-[18.6px] text-[#999]">
        {strategy.description}
      </p>
      {specs.length ? (
        <dl className="flex flex-col gap-2 border-t border-app-line pt-3 text-app-label leading-[15px]">
          {specs.map(([term, value]) => (
            <div key={term} className="flex gap-2">
              <dt className="shrink-0 font-medium uppercase text-ink-faint">{term}</dt>
              <dd className="min-w-0 font-normal text-[#d4d4d4]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/**
 * Figma "Strategy Sheet — Choose Strategy" (943:2495) and "— Details"
 * (943:2545). One sheet, two modes, so Details → Back is a content swap rather
 * than a second sheet sliding over the first.
 *
 * Selection logic stays in `CopilotStrategySelector`; this only draws it.
 * Opened from the picker, Details pushes its own history entry, so the
 * hardware/gesture back returns to the list before it closes the sheet.
 */
export default function CopilotStrategySheet({
  open,
  mode,
  strategies,
  highlightId,
  selectedId,
  returnToPicker,
  onViewDetails,
  onBackToPicker,
  onClose,
  onConfirm,
}) {
  const isPicker = mode === "picker";
  const canGoBack = !isPicker && returnToPicker;
  useHistoryBack(open && canGoBack, onBackToPicker);

  const highlighted = strategies.find((s) => s.id === highlightId) ?? strategies[0];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isPicker ? "Choose strategy" : "Strategy details"}
      onBack={canGoBack ? onBackToPicker : undefined}
    >
      <div className="flex flex-col gap-3 px-4 pt-4">
        {isPicker ? (
          <>
            <p className="text-app-caption font-normal leading-[19.5px] text-ink-faint">
              Tap a strategy to select it, or open Details to read more first.
            </p>
            <ul className="flex flex-col gap-3" role="listbox" aria-label="AI strategies">
              {strategies.map((strategy) => (
                <StrategyOption
                  key={strategy.id}
                  strategy={strategy}
                  selected={strategy.id === selectedId}
                  onSelect={onConfirm}
                  onDetails={onViewDetails}
                />
              ))}
            </ul>
          </>
        ) : (
          <StrategyDetails strategy={highlighted} />
        )}
      </div>
    </BottomSheet>
  );
}
