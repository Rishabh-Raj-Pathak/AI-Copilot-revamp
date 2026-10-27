import { useState } from "react";
import { LiveDot } from "../../compete/CompeteListing.jsx";
import AppChip from "../AppChip.jsx";
import AppEmptyState from "../AppEmptyState.jsx";
import AppIcon from "../AppIcon.jsx";
import AppNavBar from "../AppNavBar.jsx";
import { useAppToast } from "../appToastContext.js";
import { appIcons } from "../mobileAssets.js";
import CompeteEntrySheet from "./CompeteEntrySheet.jsx";
import MobileCompetitionCard from "./MobileCompetitionCard.jsx";

/**
 * Phone Compete — Figma "Compete / Phone · All / Live / Ended" (HyprEarn
 * Mobile App, section 1431:2397).
 *
 * A pushed screen built like the other pushed screens (PnL Calendar): the
 * shared back nav with its centred title, a chip row under it, then the body
 * on the 20px gutter. The chips are the desktop's All / Live / Ended filter in
 * the app's Category Chip style; All groups the cards under "Live now" and
 * "Ended" headings with a count chip, as desktop does, and a filtered chip
 * drops the heading because the chip already names what you are looking at.
 *
 * State stays in `CompetePage` so desktop and phone share one entry flow;
 * entering opens `CompeteEntrySheet` from the bottom instead of the desktop's
 * centred dialog.
 */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "ended", label: "Ended" },
];

/** "● Live now [1] ———" — 17/22 heading, a count chip and a hairline to the edge. */
function GroupHeading({ title, count, live = false }) {
  return (
    <div className="flex items-center gap-2">
      {live ? <LiveDot /> : null}
      <h2 className="text-app-heading font-semibold text-ink">{title}</h2>
      <span className="rounded-md border border-app-line px-1.5 py-0.5 text-app-caption text-ink-subtle">
        {count}
      </span>
      <span aria-hidden className="h-px flex-1 bg-app-line" />
    </div>
  );
}

export default function MobileCompetePage({
  competitions,
  enteredIds,
  entryFor,
  onOpenEntry,
  onCloseEntry,
  onEntered,
}) {
  const toast = useAppToast();
  const [filter, setFilter] = useState("all");

  const live = competitions.filter((item) => item.status === "live");
  const ended = competitions.filter((item) => item.status !== "live");

  const showResults = (competition) =>
    toast.show({
      title: "Results coming soon",
      message: `Final ${competition.venue} standings will appear here once published.`,
    });

  const cards = (list) => (
    <div className="flex flex-col gap-4">
      {list.map((competition) => (
        <MobileCompetitionCard
          key={competition.id}
          competition={competition}
          entered={enteredIds.has(competition.id)}
          onEnter={onOpenEntry}
          onResults={showResults}
        />
      ))}
    </div>
  );

  const liveEmpty = (
    <AppEmptyState
      icon={<AppIcon src={appIcons.timer20} size={20} />}
      title="No live competitions right now"
      message="New ones show up here the moment they start."
      actions={ended.length ? [{ label: "View ended competitions", onClick: () => setFilter("ended") }] : []}
    />
  );

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-ink">
      <AppNavBar title="Compete" />

      {/* Figma "Filter Chips": the PnL Calendar chip row's spacing. */}
      <div
        role="radiogroup"
        aria-label="Filter competitions"
        className="flex shrink-0 items-center gap-2 px-5 pb-1 pt-3 max-[374px]:px-4"
      >
        {FILTERS.map(({ id, label }) => (
          <AppChip
            key={id}
            active={filter === id}
            label={label}
            leading={id === "live" && live.length ? <LiveDot className="size-1.5" /> : null}
            onClick={() => setFilter(id)}
          />
        ))}
      </div>

      <main className="app-no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-3 max-[374px]:px-4">
          <p className="text-app-callout text-[#b4b5c2]">
            Trade on a partner venue and climb its leaderboard for a share of the prize pool.
          </p>

          {filter === "all" ? (
            <>
              {/* Live leads: it is the only group you can act on. An empty
                  group is left out here; the Live chip is where an empty state
                  says so. */}
              {live.length ? (
                <section className="flex flex-col gap-3">
                  <GroupHeading title="Live now" count={live.length} live />
                  {cards(live)}
                </section>
              ) : null}
              {ended.length ? (
                <section className="flex flex-col gap-3">
                  <GroupHeading title="Ended" count={ended.length} />
                  {cards(ended)}
                </section>
              ) : null}
              {!live.length && !ended.length ? liveEmpty : null}
            </>
          ) : null}

          {filter === "live" ? (live.length ? cards(live) : liveEmpty) : null}

          {filter === "ended"
            ? ended.length
              ? cards(ended)
              : (
                  <AppEmptyState
                    icon={<AppIcon src={appIcons.calendar20} size={20} />}
                    title="No ended competitions yet"
                    message="Results land here once a competition settles."
                  />
                )
            : null}
        </div>
      </main>

      <CompeteEntrySheet competition={entryFor} onEntered={onEntered} onClose={onCloseEntry} />
    </div>
  );
}
