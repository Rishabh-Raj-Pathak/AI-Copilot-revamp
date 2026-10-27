import { useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import CompetitionCard from "./CompetitionCard.jsx";
import { matchesQuery } from "./competeMockData.js";
import { LIVE_GREEN } from "./competeTheme.js";

/**
 * The hub's list, split into Live and Ended (Figma 4578:88, frames A/B/C/E).
 *
 * The season will hold far more settled competitions than running ones, so the
 * two cannot share one undifferentiated grid: the one you can still enter
 * would sink under the ones you can only read. Three tabs filter; the All view
 * groups. Each group opens with a heading, a count chip and a hairline.
 * The 64px between groups is three times the 20px card gap, so the break reads
 * as a section and not as another row.
 *
 * A filtered tab drops the group heading, because the tab already names what
 * you are looking at.
 */

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "ended", label: "Ended" },
];

/**
 * The production page's search (app.hyprearn.com/compete), right of the tabs:
 * the same 36.8px-inside-a-4px-track height as the tab switch so the two sit
 * on one line, the same #242424 edge. A clear button appears once there is
 * something to clear.
 */
function SearchField({ value, onChange }) {
  return (
    <label className="flex h-[46.8px] w-full items-center gap-2.5 rounded-[10px] border border-[#242424] px-3.5 text-ink-subtle transition-colors focus-within:border-[#3e3e3e] sm:w-[300px]">
      <Search className="size-4 shrink-0" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search competitions"
        aria-label="Search competitions"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-ink-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </label>
  );
}

/** Same pulse as the card's status pill — `ds-live-dot` in design-tokens.css. */
export function LiveDot({ className = "size-2" }) {
  return (
    <span
      aria-hidden
      className={`ds-live-dot shrink-0 rounded-full ${className}`}
      style={{
        backgroundColor: LIVE_GREEN,
        color: LIVE_GREEN,
        boxShadow: "0 0 8px rgba(74,232,127,0.55)",
      }}
    />
  );
}

function CardGrid({ competitions, enteredIds, onOpen }) {
  return (
    /* One up on a phone, two from `lg`, three from `xl`; the fourth column
       waits for `wide` (1800px), where the tile is wide enough again that
       the venue name and stat labels stop truncating. */
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 xl:gap-5 wide:grid-cols-4">
      {competitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          entered={enteredIds.has(competition.id)}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function Group({ id, title, count, live = false, children }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <header>
        {/* 24px, the Rewards section-heading size (`ReferralActivityPanel`):
            above the 20px card titles in the grid and below the 32px page
            title, so the three levels read in order. The count is a small
            chip beside it, and a hairline runs out to the edge so each group
            reads as its own band. */}
        <div className="flex items-center gap-2.5">
          {live ? <LiveDot /> : null}
          <h2 id={id} className="text-2xl font-semibold leading-[1.2] text-ink">
            {title}
          </h2>
          <span className="text-data rounded-md border border-[#242424] px-1.5 py-0.5 leading-none text-ink-subtle">
            {count}
          </span>
          <span aria-hidden className="ml-2 h-px flex-1 bg-[#242424]" />
        </div>
      </header>
      {children}
    </section>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-[#2e2e2e] px-6 text-center">
      <p className="text-copy font-medium text-ink">{title}</p>
      <p className="text-data text-ink-subtle">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-copy flex items-center gap-1 font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden />
    </button>
  );
}

/**
 * @param {object} props
 * @param {Array<object>} props.competitions
 * @param {Set<string>} props.enteredIds
 * @param {(id: string) => void} props.onOpen
 */
export default function CompeteListing({ competitions, enteredIds, onOpen }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  // Search narrows first; the tabs, groups and counts all read the result.
  const found = competitions.filter((item) => matchesQuery(item, query));
  const live = found.filter((item) => item.status === "live");
  const ended = found.filter((item) => item.status !== "live");
  const showEnded = () => setTab("ended");
  const searching = query.trim() !== "";

  const noMatches = (
    <EmptyState
      title={`No competitions match "${query.trim()}"`}
      message="Try a venue name, like Decibel or Lighter."
      action={<TextLink onClick={() => setQuery("")}>Clear search</TextLink>}
    />
  );

  const liveEmpty = (
    <EmptyState
      title="No live competitions right now"
      message="New ones show up here the moment they start."
      action={
        ended.length ? (
          <TextLink onClick={showEnded}>View ended competitions</TextLink>
        ) : null
      }
    />
  );

  return (
    <div className="flex flex-col gap-10">
      {/* The app's page-level segmented control, measured off the Rewards
          "Reward path" switch (`ReferralTiersPanel`): a 10px #242424-bordered
          track with 4px padding, 14px tabs at 10px radius and 20px side
          padding, 36.8px tall, inactive #bfbfbf. (The 2px-padded track in
          `TradeOrderPanel` is the dense in-panel variant.) Selection takes the
          header nav's #3e2e00 fill with #f2b500 text. No counts: the group
          headings below carry them. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter competitions"
          className="flex w-fit items-center rounded-[10px] border border-[#242424] p-1"
        >
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`compete-tab-${id}`}
                aria-selected={active}
                aria-controls="compete-panel"
                onClick={() => setTab(id)}
                className={`flex h-[36.8px] items-center gap-1.5 rounded-lg px-5 text-sm font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b500]/40 ${
                  active
                    ? "bg-[#3e2e00] text-[#f2b500]"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {id === "live" && live.length > 0 ? (
                  <LiveDot className="size-1.5" />
                ) : null}
                {/* Onest's ascent is taller than its descent, and Windows rounds
                  the two unevenly at small sizes, so a padded line box sat the
                  letters ~1.5px above centre. Trimming the box to cap height
                  lets the fixed-height flex row centre the glyphs themselves,
                  level with the live dot. */}
                <span className="[text-box:trim-both_cap_alphabetic]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <SearchField value={query} onChange={setQuery} />
      </div>

      <div
        id="compete-panel"
        role="tabpanel"
        aria-labelledby={`compete-tab-${tab}`}
      >
        {tab === "all" ? (
          <div className="flex flex-col gap-16">
            {/* Live always leads: it is the only group you can act on. An empty
                group is left out here rather than shown as a box, because the
                All view's job is to show what exists. The Live tab is where an
                empty state is useful. */}
            {live.length ? (
              <Group
                id="compete-live"
                title="Live now"
                count={live.length}
                live
              >
                <CardGrid
                  competitions={live}
                  enteredIds={enteredIds}
                  onOpen={onOpen}
                />
              </Group>
            ) : null}
            {ended.length ? (
              <Group id="compete-ended" title="Ended" count={ended.length}>
                <CardGrid
                  competitions={ended}
                  enteredIds={enteredIds}
                  onOpen={onOpen}
                />
              </Group>
            ) : null}
            {!live.length && !ended.length
              ? searching
                ? noMatches
                : liveEmpty
              : null}
          </div>
        ) : null}

        {tab === "live" ? (
          live.length ? (
            <CardGrid
              competitions={live}
              enteredIds={enteredIds}
              onOpen={onOpen}
            />
          ) : searching ? (
            noMatches
          ) : (
            liveEmpty
          )
        ) : null}

        {tab === "ended" ? (
          ended.length ? (
            <CardGrid
              competitions={ended}
              enteredIds={enteredIds}
              onOpen={onOpen}
            />
          ) : searching ? (
            noMatches
          ) : (
            <EmptyState
              title="No ended competitions yet"
              message="Results land here once a competition settles."
            />
          )
        ) : null}
      </div>
    </div>
  );
}
