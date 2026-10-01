import { useEffect, useRef } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import CopilotIdeaCard from "./CopilotIdeaCard.jsx";
import { COPILOT_CATEGORY_CHIPS, formatClock } from "./copilotIdeaData.js";
import usePullToRefresh from "./usePullToRefresh.js";

/**
 * Market category chips — a horizontal selector for four peer filters (a
 * sheet would hide them, a segmented control can't fit them). 32px visual,
 * 44px hit area via the transparent ::before.
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
      className="app-no-scrollbar flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-1.5"
    >
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <button
            key={chip.id}
            type="button"
            role="radio"
            aria-checked={active}
            data-active={active || undefined}
            onClick={() => onChange(chip.id)}
            className={`app-pressable relative flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-app-callout font-medium before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] ${
              active
                ? "border-app-line-accent bg-app-accent-subtle text-app-accent"
                : "border-app-line bg-app-bg text-ink-muted active:bg-white/[0.05]"
            }`}
          >
            <AppIcon src={chip.icon} size={14} />
            <span className="whitespace-nowrap">{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-app-line-accent-subtle p-3.5" aria-hidden>
      <div className="flex items-center gap-2.5">
        <span className="app-skeleton size-7 rounded-full" />
        <span className="app-skeleton h-4 w-24 rounded" />
        <span className="ml-auto app-skeleton h-4 w-16 rounded" />
      </div>
      <span className="app-skeleton h-3.5 w-4/5 rounded" />
      <div className="grid grid-cols-4 gap-4 border-t border-app-line pt-3">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="app-skeleton h-8 rounded" />
        ))}
      </div>
      <div className="flex gap-2">
        <span className="app-skeleton h-10 flex-1 rounded-lg" />
        <span className="app-skeleton h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

/** Phone empty state: what happened, and two one-tap ways out (44px each). */
function EmptyIdeas({ strategyName, categoryLabel, onSwitchCategory, onSwitchStrategy, categoryId }) {
  const alt = categoryId === "trending" ? { id: "bluechip", label: "Bluechip" } : { id: "trending", label: "Trending" };
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-app-line px-5 py-8 text-center">
      <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-app-subtle text-ink-subtle">
        <AppIcon src={appIcons.search19} size={18} />
      </span>
      <p className="text-app-body font-medium text-ink">
        No {strategyName} setups in {categoryLabel}
      </p>
      <p className="max-w-[17rem] text-app-callout text-ink-subtle">
        Nothing passed this strategy's filters right now. Try another market or a looser strategy.
      </p>
      <div className="mt-4 flex w-full gap-2">
        <button
          type="button"
          onClick={() => onSwitchCategory(alt.id)}
          className="app-pressable h-11 flex-1 rounded-lg border border-app-line text-app-callout font-medium text-ink active:bg-white/[0.05]"
        >
          View {alt.label}
        </button>
        <button
          type="button"
          onClick={onSwitchStrategy}
          className="app-pressable h-11 flex-1 rounded-lg border border-app-line-accent-subtle bg-app-accent-faint text-app-callout font-medium text-app-accent"
        >
          Switch strategy
        </button>
      </div>
    </div>
  );
}

/**
 * The Ideas segment of the phone AI Copilot: chips, an AI status line, the
 * setups, and a disclaimer — one scroll view with pull-to-refresh.
 *
 * States: refreshing (skeletons + what the AI is doing), expired (list dims,
 * an inline banner offers the refresh), empty (phone empty state), normal.
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
  onAbout,
}) {
  const { pull, armed } = usePullToRefresh(scrollRef, onRefresh, { disabled: !active || refreshing });
  const expired = expireSeconds <= 0;
  const chip = COPILOT_CATEGORY_CHIPS.find((c) => c.id === activeFilter);
  const categoryLabel = chip?.label ?? "this market";

  return (
    <div
      ref={scrollRef}
      hidden={!active}
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-app-bg pb-[calc(var(--app-tab-bar-h)+1rem)] app-fade-in"
      data-tour="copilot-suggestions-list"
      role="tabpanel"
      aria-label="Ideas"
    >
      {/* Pull-to-refresh indicator: grows with the pull, spins once committed. */}
      <div
        className="flex items-end justify-center overflow-hidden text-ink-subtle"
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

      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-1.5">
        <p className="flex min-w-0 items-center gap-1.5 text-app-label font-medium text-ink-subtle" aria-live="polite">
          <AppIcon src={appIcons.navCopilot} size={12} className="shrink-0 text-app-accent" />
          {refreshing ? (
            <span className="truncate">Scanning {categoryLabel} with {strategyName}…</span>
          ) : setups.length === 0 ? (
            <span className="truncate">AI-generated · no matches for this filter</span>
          ) : expired ? (
            <span className="truncate text-app-negative">Expired · prices may have moved</span>
          ) : (
            <span className="truncate">
              AI-generated · {setups.length} {setups.length === 1 ? "setup" : "setups"} · valid{" "}
              {formatClock(expireSeconds)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onAbout}
          className="app-pressable -my-2 -mr-2 flex h-11 shrink-0 items-center gap-1 px-2 text-app-label font-medium text-ink-subtle active:text-ink"
        >
          <AppIcon src={appIcons.info14} size={14} />
          How it works
        </button>
      </div>

      <section aria-label="Trade ideas" aria-busy={refreshing || undefined} className="flex flex-col gap-3 px-4">
        {expired && !refreshing ? (
          <div className="flex items-center gap-3 rounded-xl border border-app-line-accent-subtle bg-app-accent-faint px-3.5 py-3">
            <AppIcon src={appIcons.timer20} size={18} className="shrink-0 text-app-accent" />
            <p className="min-w-0 flex-1 text-app-callout text-ink-muted">
              These setups expired. Refresh for a new batch.
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="app-pressable h-9 shrink-0 rounded-lg bg-app-accent px-3 text-app-callout font-medium text-black"
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

      <p className="px-6 pt-5 text-center text-app-label text-ink-faint">
        AI setups can be wrong and are not financial advice. Review size and risk in the ticket
        before you trade.
      </p>
    </div>
  );
}
