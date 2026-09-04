import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Calendar,
  Check,
  Coins,
  Timer,
  User,
} from "lucide-react";
import VenueLockup from "./VenueLockup.jsx";
import {
  formatEndedOn,
  formatRemaining,
  formatUsdCompact,
} from "./competeMockData.js";
import {
  CTA_SWEEP,
  EDGE_ENDED,
  EDGE_SWEEP,
  INK_FAINT,
  INK_MUTED,
  LIVE_GREEN,
  LIVE_ICON,
  SETTLED_BG,
  SETTLED_BORDER,
  SETTLED_GREEN,
} from "./competeTheme.js";

/**
 * One competition, built to the Figma section (7101:3 live, 7106:2 ended).
 *
 * Live and ended are the same component in two states, not two layouts: same
 * geometry, same stat row, same footer rail — separated by colour. The live
 * card carries the HyprEarn sweep on its edge, its stat icons and its CTA; the
 * ended one drops to neutral grey. Nothing else differs between them now:
 * same title, same three stats, same rail.
 *
 * Neither state names a trader any more. Standings and payouts belong to the
 * leaderboard the card opens, not to the tile — `leader` and `winner` stay in
 * the data for that view. What is left is the pitch: whose competition it is,
 * what the pool is worth, how many are in, and how long you have.
 *
 * `entered` is a third footer state rather than a fourth card: joining changes
 * what you can do with a competition, not what it is, so only the CTA moves.
 * The card stays live — it is still running, and its countdown still ticks.
 *
 * Sized as a tile in a grid that grows: the hub will hold a season of these,
 * so the card is cut to survive three across rather than to fill a half-row.
 * The Figma section is a two-up marketing layout — its proportions are kept,
 * its absolute sizes are not.
 *
 * Cards stretch to the tallest in the row and bottom-anchor the stat row
 * (`mt-auto`), so dividers, stats and CTAs line up across the whole grid however
 * many land in it and however their titles wrap.
 *
 * Type is the section scale — `text-headline` / `text-figure` / `text-copy` /
 * `text-tag`, each fluid between 375px and 1536px — so no size is restated per
 * breakpoint. Icons and the gaps beside them are sized in `em` against whichever
 * step owns their row, which keeps every cluster proportional as the type moves.
 * Emphasis is the ink ladder first; see src/design-system/TYPE-SCALE.md.
 */

/**
 * Key art reads as background, not as a picture pasted on top: it bleeds off the
 * card's right edge and dissolves downward and to the left, so copy can sit over
 * it without a scrim and without ever meeting a hard edge.
 *
 * The zone runs from the card's top edge down to the first rule, and the
 * render is clipped to it. That clip is the effect: the coin is drawn taller
 * than the space it is given, so it stops dead on the rule and reads as though
 * it carries on behind it. Nothing below the rule is ever touched, however the
 * card is shaped. That matters because the content above the
 * stats swings between 43%% and 57%% of card height depending on state and
 * column count, so no single card-relative fade clears it everywhere.
 *
 * Inside the zone it fills the top-right corner, including the band beside the
 * lockup — which is the only way to give it real size without covering a
 * number. The status pill sits on it and carries a backdrop to stay legible.
 *
 * Two masks intersected rather than one diagonal: a diagonal leaves the
 * bottom-right corner opaque, and white copy over a lit coin is the one kind of
 * overlap that does not work.
 *
 * The vertical mask fades the render IN at the top and part of the way OUT at
 * the foot: solid to 78%, then down to 0.65 where it meets the rule. Not to
 * zero — the coin has to still be there when the clip cuts it, or there is no
 * cut to see — but not solid either, which left it stopping on the line like a
 * sticker. Two thirds visible at the join is the design's own figure, and it
 * is what makes the disc read as passing behind the rule rather than butting
 * against it (Figma 7435:1111 / 7435:1140). Both crops were taken
 * tight against the reference's status pills, so their glow starts on the first
 * row of the file — sat flush to the card edge that reads as a slice through the
 * coin. Dissolving the top edge is the fix; there are no spare pixels above it.
 */
const ART_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 9%, #000 78%, rgba(0,0,0,0.65) 100%), linear-gradient(to right, transparent 30%, #000 68%)";
const ART_MASK = {
  WebkitMaskImage: ART_FADE,
  maskImage: ART_FADE,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

function StatusPill({ live }) {
  return (
    <span
      className="text-tag flex shrink-0 items-center gap-[0.35em] rounded-full border bg-black/45 px-[1.3em] py-[0.51em] backdrop-blur-[3px]"
      style={{ borderColor: live ? "rgba(74,222,128,0.5)" : "#555555" }}
    >
      {/* Only the running state animates — see `ds-live-dot` in
          design-tokens.css. `color` is set alongside the background because
          the pulse ring is a `::after` painted in `currentColor`: one value
          feeds the dot and the ring it grows out of, so they cannot drift. */}
      <span
        className={`size-[0.78em] shrink-0 rounded-full${live ? " ds-live-dot" : ""}`}
        style={{
          backgroundColor: live ? LIVE_GREEN : INK_FAINT,
          color: live ? LIVE_GREEN : undefined,
          boxShadow: live ? "0 0 8px rgba(74,232,127,0.55)" : undefined,
        }}
      />
      <span
        className={live ? undefined : "text-ink-muted"}
        style={live ? { color: LIVE_GREEN } : undefined}
      >
        {live ? "LIVE" : "ENDED"}
      </span>
    </span>
  );
}

function StatCell({ icon: Icon, tint, value, label, className = "" }) {
  return (
    <div
      className={`text-figure flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-[0.85em] ${className}`}
    >
      <Icon
        className="size-[1.45em] shrink-0"
        style={{ color: tint }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="leading-[1.2] text-ink">{value}</p>
        <p className="text-copy truncate leading-[1.3] text-ink-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

/** Ticks once a second so the live card reads as running, not rendered once. */
function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(() => endsAt - Date.now());
  useEffect(() => {
    if (!endsAt) return undefined;
    const id = window.setInterval(() => setRemaining(endsAt - Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);
  return remaining;
}

export default function CompetitionCard({ competition, entered = false, onOpen }) {
  const {
    id,
    venue,
    title,
    status,
    art,
    prizePool,
    participants,
    volume,
    endsAt,
    endedAt,
  } = competition;

  const live = status === "live";
  const remaining = useCountdown(live ? endsAt : null);
  const tint = live ? LIVE_ICON : INK_MUTED;

  const ctaBase =
    "text-figure flex h-[2.3em] w-[6.2em] shrink-0 items-center justify-center gap-[0.5em] rounded-lg sm:w-[7.4em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    // A 1px gradient edge cannot be a border, so the card is a padded sweep
    // with a black face sitting inside it.
    <article
      className="h-full rounded-[14px] p-px"
      style={{ background: live ? EDGE_SWEEP : EDGE_ENDED }}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[13px] bg-black p-4 xl:p-5">
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-x-4 -bottom-4 -top-4 select-none overflow-hidden xl:-inset-x-5 xl:-bottom-5 xl:-top-5"
            style={ART_MASK}
            aria-hidden
          >
            {/* Sized off WIDTH now, not height. The renders are squares, and
                a square measured against a zone that grows when a title wraps
                would swell with it; measured against the card it holds one
                size down the whole grid. Height follows the aspect ratio, and
                it comes out taller than the zone on purpose — that overhang is
                what the clip turns into the cut at the rule. */}
            <img
              src={art.src}
              alt=""
              className="absolute h-auto max-w-none"
              style={{
                width: `${art.width}%`,
                top: `${art.top}%`,
                right: `${art.right}%`,
              }}
            />
          </div>

          <header className="relative flex items-center justify-between gap-3">
            <VenueLockup venueId={id} venue={venue} />
            <StatusPill live={live} />
          </header>

          {/* The title is the whole block now. It keeps the 72% cap: it is
              still the one run of copy that has to clear the art's solid
              core, and it may cross the render's faded left edge but never
              the coin itself.

              What used to sit under it — the live standings, the settled
              payout — has moved to the leaderboard each card links to. A
              tile answers "what is this and is it worth entering"; the stat
              row under this already does that in three numbers, and a fourth
              line naming one wallet was the card telling you about somebody
              else. */}
          <div className="relative mt-4 w-[72%]">
            <h2 className="text-headline text-ink">{title}</h2>
          </div>
        </div>

        {/* The face's vertical rhythm tracks its own inset: `p-4 xl:p-5`, so
            `mt-4 xl:mt-5`. Gap equal to padding is what keeps a short card
            reading as one block rather than as rows stacked in a box — and it
            means the rhythm tightens on a phone exactly where the inset does,
            instead of holding a desktop gap inside a 16px frame.

            The step into the footer stays at 16: that rule and the row under
            it are one unit, and the CTA is tall enough that a wider gap above
            it opens a hole in the bottom of the card. */}
        <div className="relative mt-4 h-px w-full shrink-0 bg-[#262626] xl:mt-5" />

        <div className="relative mt-auto grid grid-cols-3 divide-x divide-[#262626] pt-4 xl:pt-5">
          <StatCell
            icon={Coins}
            tint={tint}
            value={formatUsdCompact(prizePool.total)}
            label="Pool"
            className="pr-2"
          />
          <StatCell
            icon={User}
            tint={tint}
            value={participants.toLocaleString("en-US")}
            label="Traders"
            className="pl-2.5 pr-2 xl:pl-4"
          />
          <StatCell
            icon={Activity}
            tint={tint}
            value={formatUsdCompact(volume)}
            label="Volume"
            className="pl-2.5 xl:pl-4"
          />
        </div>

        <div className="relative mt-4 h-px w-full shrink-0 bg-[#262626] xl:mt-5" />

        <footer className="relative mt-4 flex items-center justify-between gap-3">
          <p className="text-copy flex min-w-0 items-center gap-[0.9em] text-ink-muted">
            {live ? (
              <Timer
                className="size-[1.7em] shrink-0"
                style={{ color: LIVE_ICON }}
                aria-hidden
              />
            ) : (
              <Calendar
                className="size-[1.7em] shrink-0"
                style={{ color: INK_MUTED }}
                aria-hidden
              />
            )}
            <span className="truncate">
              {live ? (
                <>
                  {"Ends in "}
                  <span style={{ color: LIVE_GREEN }}>
                    {formatRemaining(remaining)}
                  </span>
                </>
              ) : (
                `Closed ${formatEndedOn(endedAt)}`
              )}
            </span>
          </p>

          {/* Entered is a fact, not an action — the button stops being one.
              It keeps the CTA's box so the footer rail doesn't reflow when a
              card in the middle of a row settles. */}
          {entered ? (
            <span
              className={`${ctaBase} border`}
              style={{
                borderColor: SETTLED_BORDER,
                backgroundColor: SETTLED_BG,
                color: SETTLED_GREEN,
              }}
            >
              <Check className="size-[1.1em]" aria-hidden />
              Entered
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onOpen?.(id)}
              className={
                live
                  ? `${ctaBase} text-[#0a0a0a]`
                  : `${ctaBase} border border-[#3e3e3e] text-ink hover:border-[#5a5a5a]`
              }
              style={live ? { backgroundImage: CTA_SWEEP } : undefined}
            >
              {live ? "Enter" : "Results"}
              <ArrowRight className="size-[1.1em]" aria-hidden />
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
