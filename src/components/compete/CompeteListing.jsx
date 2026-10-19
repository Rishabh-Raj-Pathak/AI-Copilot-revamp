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
 * groups. The groups are separated by whitespace and a heading, not a rule.
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
 * How many ended competitions the All view shows before deferring to the
 * Ended tab. Two rows at the three-up width. Live is never capped: it is the
 * group you came for.
 */
const ENDED_PREVIEW = 6;

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

function Group({ id, title, count, live = false, action, children }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <header>
        {/* 24px, the Rewards section-heading size (`ReferralActivityPanel`):
            above the 20px card titles in the grid and below the 32px page
            title, so the three levels read in order. */}
        <div className="flex items-center gap-2.5">
          {live ? <LiveDot /> : null}
          <h2 id={id} className="text-2xl font-semibold leading-[1.2] text-ink">
            {title}
          </h2>
          <span className="text-2xl leading-[1.2] text-ink-faint">{count}</span>
          {action ? <div className="ml-auto">{action}</div> : null}
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
  const counts = { all: competitions.length, live: live.length, ended: ended.length };

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
      {/* The same segmented control as the Rewards page's "Reward path"
          switch (`ReferralTiersPanel`): a #242424 track, the active tab filled
          in the same grey. Weight tops out at 500, so the fill carries the
          selection rather than a bolder label.

          The radii are nested: a tab sits 5px in from the track's outer edge
          (1px border + 4px padding), so the track is the tab's 8px + 5 = 13px.
          Equal radii pinch the gap at the corners. */}
      <div
        role="tablist"
        aria-label="Filter competitions"
        className="flex w-fit items-center rounded-[13px] border border-[#242424] p-1"
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
              className={`text-copy flex items-center gap-1.5 rounded-[8px] px-5 py-2.5 leading-[1.2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                active
                  ? "bg-[#242424] font-medium text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {id === "live" && counts.live > 0 ? <LiveDot className="size-1.5" /> : null}
              {label}
              <span className={`text-data leading-[1.2] ${active ? "text-ink-muted" : "text-ink-faint"}`}>
                {counts[id]}
              </span>
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
              <Group
                id="compete-ended"
                title="Ended"
                count={ended.length}
                action={<TextLink onClick={showEnded}>View all ended</TextLink>}
              >
                <CardGrid
                  competitions={ended.slice(0, ENDED_PREVIEW)}
                  enteredIds={enteredIds}
                  onOpen={onOpen}
                />
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
