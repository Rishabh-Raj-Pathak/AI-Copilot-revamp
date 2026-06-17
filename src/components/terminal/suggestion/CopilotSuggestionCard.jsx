import { getCopilotStrategyById } from "../copilotStrategies.js";
import SetupChip from "./SetupChip.jsx";
import SetupRadio from "./SetupRadio.jsx";
import SuggestionPriceChart from "./SuggestionPriceChart.jsx";
import ViewThesisButton from "./ViewThesisButton.jsx";

function ChevronRight({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function MobileCopilotCard({
  setup,
  selected,
  onSelect,
  onViewThesis,
}) {
  const tagChips = setup.chips.filter(
    (c) => c.kind === "side" || c.kind === "win",
  );
  const rrChip = setup.chips.find((c) => c.kind === "rr");
  const rangeChip = setup.chips.find((c) => c.kind === "range");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(setup.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(setup.id);
        }
      }}
      className={`cursor-pointer rounded-lg border bg-[#0a0a0a] p-3.5 transition-[border-color,box-shadow] ${
        selected
          ? "border-[#f7bb08] shadow-[0_0_0_1px_rgba(247,187,8,0.35)]"
          : "border-[#242424]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <img
          src={setup.tokenIcon}
          alt=""
          className="size-6 shrink-0 rounded-full object-cover"
          width={24}
          height={24}
          draggable={false}
        />
        <h2 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-white">
          {setup.title}
        </h2>
        <ChevronRight className="size-[18px] shrink-0 text-[#757575]" />
      </div>

      {tagChips.length > 0 || strategyLabel ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {strategyLabel ? (
            <SetupChip chip={{ kind: "muted", label: strategyLabel }} />
          ) : null}
          {tagChips.map((c, i) => (
            <SetupChip key={`${setup.id}-tag-${i}`} chip={c} />
          ))}
        </div>
      ) : null}

      {rrChip || rangeChip ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {rrChip ? <SetupChip chip={rrChip} /> : null}
          {rangeChip ? <SetupChip chip={rangeChip} /> : null}
        </div>
      ) : null}

      <ViewThesisButton
        className="mt-3 w-full justify-center py-2.5"
        dataTour={selected ? "copilot-view-thesis" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onViewThesis?.();
        }}
      />
    </article>
  );
}

/**
 * Copilot setup row — collapsed (header only) vs expanded (chart + thesis).
 * Desktop: Figma 4039:11883. Mobile feed: Figma 1017:24652 (list cards, no inline chart).
 */
export default function CopilotSuggestionCard({
  setup,
  expanded,
  selected,
  onSelect,
  onViewThesis,
  mobileFeed = false,
}) {
  const strategyLabel = setup.strategyId
    ? getCopilotStrategyById(setup.strategyId)?.shortLabel
    : null;

  if (mobileFeed) {
    return (
      <MobileCopilotCard
        setup={setup}
        selected={selected}
        onSelect={onSelect}
        onViewThesis={onViewThesis}
      />
    );
  }

  return (
    <article
      data-tour={
        selected && expanded ? "copilot-expanded-suggestion" : undefined
      }
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(setup.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(setup.id);
        }
      }}
      className={`cursor-pointer rounded-xl border p-5 transition-[box-shadow,border-color] duration-200 ${
        selected
          ? "border-[#f7bb08] shadow-[0_0_0_1px_rgba(247,187,8,0.35),0_0_32px_rgba(247,187,8,0.12)]"
          : "border-[#242424] hover:border-[#333333]"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <img
            src={setup.tokenIcon}
            alt=""
            className="mt-0.5 size-5 shrink-0 rounded-full object-cover"
            width={20}
            height={20}
            draggable={false}
          />
          <div className="min-w-0 flex-1">
            <h2
              className={`font-semibold leading-snug text-white ${
                expanded ? "text-lg" : "text-sm"
              }`}
            >
              {setup.title}
            </h2>
          </div>
          <SetupRadio selected={selected} />
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {strategyLabel ? (
              <SetupChip chip={{ kind: "muted", label: strategyLabel }} />
            ) : null}
            {setup.chips.map((c, i) => (
              <SetupChip key={`${setup.id}-${i}-${c.label}`} chip={c} />
            ))}
          </div>
          <ViewThesisButton
            dataTour={
              selected && expanded ? "copilot-view-thesis" : undefined
            }
            onClick={(e) => {
              e.stopPropagation();
              onViewThesis?.();
            }}
          />
        </div>
      </div>

      {expanded ? <SuggestionPriceChart active={expanded} delayMs={3} /> : null}
    </article>
  );
}
