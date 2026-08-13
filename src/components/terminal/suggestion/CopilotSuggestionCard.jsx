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
  strategyLabel,
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
      className={`cursor-pointer rounded-lg border bg-[#0a0a0a] p-3.5 transition-colors duration-200 ${
        selected
          ? "border-[#6b5200]"
          : "border-[#242424] hover:border-[#333333]"
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
        <h2 className="min-w-0 flex-1 text-control font-medium text-ink">
          {setup.title}
        </h2>
        <ChevronRight className="size-[18px] shrink-0 text-ink-faint" />
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
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          {rrChip ? <SetupChip chip={rrChip} /> : null}
          {rangeChip ? (
            <span className="min-w-0 max-w-full truncate">
              <SetupChip chip={rangeChip} />
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Full-width here, and `py-2.5` keeps a 40px touch target — the desktop
          row's 28px is a pointer size, not a thumb size. */}
      <ViewThesisButton
        className="mt-3 w-full py-2.5"
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
        strategyLabel={strategyLabel}
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
      className={
        /*
          Selection is a hairline amber edge and nothing else — the fill stays
          the same black as every other card in the list. This has shed two
          signals: a 1px amber ring plus a 32px bloom on a full-strength
          #f7bb08 border (the bloom washed over the cards either side of it),
          and then a warm #0c0b08 panel, which tinted the chart's own black.
        */
        /*
          Expanded, the card takes one full screen of the feed and hands the
          leftover height to the chart — the next suggestion sits just below
          the fold rather than sharing the view.
        */
        `cursor-pointer rounded-xl border p-3.5 transition-colors duration-200 ${
          expanded ? "flex h-full flex-col overflow-hidden" : ""
        } ${
          selected
            ? "border-[#6b5200]"
            : "border-[#242424] hover:border-[#333333]"
        }`
      }
    >
      <div className="flex shrink-0 flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <img
            src={setup.tokenIcon}
            alt=""
            className="mt-0.5 size-5 shrink-0 rounded-full object-cover"
            width={20}
            height={20}
            draggable={false}
          />
          <div className="min-w-0 flex-1">
            {/*
              One size in both states. This used to jump 14px → 18px on select,
              which reflowed the card on a pure interaction change and put a
              list item at the same size as the pair title. Selection is already
              signalled by the border, background and radio.
            */}
            <h2 className="text-control font-medium text-ink">
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

      {expanded ? (
        <SuggestionPriceChart setup={setup} active={expanded} delayMs={3} />
      ) : null}
    </article>
  );
}
