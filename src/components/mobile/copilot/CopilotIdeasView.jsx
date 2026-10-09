import { useEffect, useRef } from "react";
import AppChip from "../AppChip.jsx";
import AppEmptyState from "../AppEmptyState.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import CopilotIdeaCard from "./CopilotIdeaCard.jsx";
import { COPILOT_CATEGORY_CHIPS } from "./copilotIdeaData.js";
import usePullToRefresh from "./usePullToRefresh.js";

/**
 * Market category chips — a horizontal selector for four peer filters (a
 * sheet would hide them, a segmented control can't fit them). 32px visual,
 * 44px hit area via the transparent ::before. Idle chips are outline only;
 * the active one takes the soft control fill.
 */
function CategoryChips({ value, onChange, chips = COPILOT_CATEGORY_CHIPS }) {
  const rowRef = useRef(null);

  // Keep the active chip on screen when the category changes from elsewhere.
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector("[data-active]");
    if (!row || !chip) return;
    const left = chip.offsetLeft - 16;
    const right = chip.offsetLeft + chip.offsetWidth + 16 - row.clientWidth;
    if (row.scrollLeft > left) row.scrollTo({ left, behavior: "smooth" });
    else if (row.scrollLeft < right) row.scrollTo({ left: right, behavior: "smooth" });
  }, [value]);

  return (
    <div
      ref={rowRef}
      role="radiogroup"
      aria-label="Market category"
      className="app-no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain px-5 py-1 max-[374px]:px-4"
    >
      {chips.map((chip) => (
        <AppChip
          key={chip.id}
          active={chip.id === value}
          icon={chip.icon}
          label={chip.label}
          onClick={() => onChange(chip.id)}
        />
      ))}
    </div>
  );
}

/** Loading placeholder with the card's own outline and layout. */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-app-line-accent-subtle p-3.5" aria-hidden>
      <div className="flex items-center gap-2.5">
        <span className="app-skeleton size-8 rounded-full" />
        <span className="app-skeleton h-4 w-24 rounded" />
        <span className="ml-auto app-skeleton size-4 rounded" />
      </div>
      <span className="app-skeleton h-3.5 w-4/5 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="app-skeleton h-8 rounded" />
        ))}
      </div>
      <div className="flex gap-2">
        <span className="app-skeleton h-[38px] flex-1 rounded-full" />
        <span className="app-skeleton h-[38px] flex-1 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Phone empty state (Figma A5): what happened, and two one-tap ways out —
 * stacked, primary first. Fills the list area so it centres above the tab bar.
 */
function EmptyIdeas({ strategyName, categoryLabel, onSwitchCategory, onSwitchStrategy, categoryId }) {
  const alt = categoryId === "trending" ? { id: "bluechip", label: "Bluechip" } : { id: "trending", label: "Trending" };
  return (
    <AppEmptyState
      className="px-3"
      icon={<AppIcon src={appIcons.search19} size={20} />}
      title={`No setups in ${categoryLabel}`}
      message={`Nothing passes ${strategyName}'s filters right now. Try another market or a looser strategy.`}
      actions={[
        { label: "Switch strategy", onClick: onSwitchStrategy, primary: true },
        { label: `View ${alt.label}`, onClick: () => onSwitchCategory(alt.id) },
      ]}
    />
  );
}

/**
 * The Strategies segment of the phone AI Copilot: chips and the setups — one
 * scroll view with pull-to-refresh. Batch freshness lives on the header's
 * refresh button, so there is no status line here.
 *
 * States: refreshing (outline skeletons), expired (list dims, an inline banner
 * offers the refresh), empty (phone empty state), normal.
 */
export default function CopilotIdeasView({
  active,
  scrollRef,
  setups,
  selectedId,
  activeFilter,
  onFilterChange,
  strategyName,
  expireSeconds,
  refreshing,
  onRefresh,
  onOpenIdea,
  onBacktest,
  onSwitchStrategy,
}) {
  const { pull, armed } = usePullToRefresh(scrollRef, onRefresh, { disabled: !active || refreshing });
  const expired = expireSeconds <= 0;
  const chip = COPILOT_CATEGORY_CHIPS.find((c) => c.id === activeFilter);
  const categoryLabel = chip?.label ?? "this market";
  const empty = !refreshing && setups.length === 0;

  return (
    <div
      ref={scrollRef}
      hidden={!active}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-app-bg pb-[calc(var(--app-tab-bar-h)+1rem)] app-fade-in"
      data-tour="copilot-suggestions-list"
      role="tabpanel"
      aria-label="Strategies"
    >
      {/* Pull-to-refresh indicator: grows with the pull, spins once committed. */}
      <div
        className="flex shrink-0 items-end justify-center overflow-hidden text-ink-subtle"
        style={{ height: refreshing && pull === 0 ? 0 : pull, transition: pull ? "none" : "height 200ms ease-out" }}
        aria-hidden
      >
        <span
          className={`mb-2 flex size-8 items-center justify-center rounded-full bg-app-subtle ${armed ? "text-app-accent" : ""}`}
          style={{ transform: `rotate(${pull * 3}deg)` }}
        >
          <AppIcon src={appIcons.refresh14} size={14} />
        </span>
      </div>

      <div className="pt-2">
        <CategoryChips value={activeFilter} onChange={onFilterChange} />
      </div>

      {/* The visible freshness cue is the header's countdown; this announces changes. */}
      <p className="sr-only" aria-live="polite">
        {refreshing
          ? `Scanning ${categoryLabel} with ${strategyName}`
          : expired && setups.length
            ? "Setups expired. Prices may have moved."
            : ""}
      </p>

      <section
        aria-label="Trade ideas"
        aria-busy={refreshing || undefined}
        className={`flex flex-col gap-3 px-5 pt-3 max-[374px]:px-4 ${empty ? "flex-1" : ""}`}
      >
        {expired && !refreshing ? (
          <div className="flex items-center gap-2.5 rounded-[14px] border border-app-line-accent-subtle py-3 pl-3.5 pr-3">
            <AppIcon src={appIcons.timer20} size={16} className="shrink-0 text-app-accent" />
            <p className="min-w-0 flex-1 text-app-callout text-ink-muted">
              These setups expired. Refresh for a new batch.
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="app-pressable app-gradient-brand relative h-8 shrink-0 rounded-full px-3.5 text-app-callout font-medium text-black before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']"
            >
              Refresh
            </button>
          </div>
        ) : null}

        {refreshing ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : setups.length === 0 ? (
          <EmptyIdeas
            strategyName={strategyName}
            categoryLabel={categoryLabel}
            categoryId={activeFilter}
            onSwitchCategory={onFilterChange}
            onSwitchStrategy={onSwitchStrategy}
          />
        ) : (
          setups.map((setup) => {
            const selected = setup.id === selectedId;
            return (
              <div
                key={setup.id}
                id={`copilot-setup-${setup.id}`}
                className="scroll-mt-4"
                data-tour={selected ? "copilot-expanded-suggestion" : undefined}
              >
                <CopilotIdeaCard
                  setup={setup}
                  selected={selected}
                  dimmed={expired}
                  onOpen={onOpenIdea}
                  onBacktest={onBacktest}
                  backtestTourTarget={selected}
                />
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
