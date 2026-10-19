import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CompetitionCard from "./CompetitionCard.jsx";
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

  const live = competitions.filter((item) => item.status === "live");
  const ended = competitions.filter((item) => item.status !== "live");
  const showEnded = () => setTab("ended");

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
      {/* The app's one selector: the header nav item (`VaultsNavDropdown`,
          `HeaderTerminal`) — 6px radius, the active option filled #3e2e00 with
          #f2b500 text, the rest plain ink that greys on hover. No track and no
          counts: the group headings below carry the counts. */}
      <div
        role="tablist"
        aria-label="Filter competitions"
        className="flex w-fit items-center gap-1"
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
              className={`text-control flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2b500]/40 ${
                active
                  ? "bg-[#3e2e00] text-[#f2b500]"
                  : "text-ink-muted hover:bg-white/5 hover:text-ink"
              }`}
            >
              {id === "live" && live.length > 0 ? <LiveDot className="size-1.5" /> : null}
              {label}
            </button>
          );
        })}
      </div>

      <div id="compete-panel" role="tabpanel" aria-labelledby={`compete-tab-${tab}`}>
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
                <CardGrid competitions={live} enteredIds={enteredIds} onOpen={onOpen} />
              </Group>
            ) : null}
            {ended.length ? (
              <Group id="compete-ended" title="Ended" count={ended.length}>
                <CardGrid competitions={ended} enteredIds={enteredIds} onOpen={onOpen} />
              </Group>
            ) : null}
            {!live.length && !ended.length ? liveEmpty : null}
          </div>
        ) : null}

        {tab === "live" ? (
          live.length ? (
            <CardGrid competitions={live} enteredIds={enteredIds} onOpen={onOpen} />
          ) : (
            liveEmpty
          )
        ) : null}

        {tab === "ended" ? (
          ended.length ? (
            <CardGrid competitions={ended} enteredIds={enteredIds} onOpen={onOpen} />
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
