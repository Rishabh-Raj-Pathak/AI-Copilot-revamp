import pacificaLogo from "@/assets/pacifica-logo.png";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

/**
 * `HyprEarn × Venue` — the co-brand lockup at the head of every competition
 * card (Figma 7109:1055).
 *
 * The HyprEarn mark is the shipped one from `/public/terminal`, and Pacifica
 * reuses the brand PNG already vendored for the delta-neutral venue pickers, so
 * a venue the app already knows about costs nothing new here. Lighter has no
 * vendored asset, so its mark is inlined from the Figma vector (7101:8) —
 * `currentColor` rather than a baked fill, so it can dim with the card.
 *
 * Marks and gaps are sized in `em` against the `text-figure` step on the
 * wrapper, so the whole lockup rides the fluid type scale as one object rather
 * than being re-pinned at every breakpoint.
 */

function LighterMark({ className }) {
  return (
    <svg viewBox="0 0 26 44" className={className} fill="currentColor" aria-hidden>
      <path d="M12.5 0V32L0 43.5V9.5L12.5 0Z" />
      <path d="M25.5 20V33L13 44V32L25.5 20Z" />
    </svg>
  );
}

/**
 * Each venue mark carries its own box: Lighter's is a tall pair of bars and
 * Pacifica's pinwheel is square, so sizing them identically would shrink one
 * and crop the other. Both run taller than the wordmark, as in the design.
 */
const VENUE_MARKS = {
  lighter: {
    render: (cls) => <LighterMark className={cls} />,
    className: "h-[1.83em] w-[1.08em] shrink-0 text-ink",
  },
  pacifica: {
    render: (cls) => <img src={pacificaLogo} alt="" aria-hidden className={cls} />,
    className: "size-[1.79em] shrink-0 object-contain",
  },
};

/**
 * @param {object} props
 * @param {string} props.venueId
 * @param {string} props.venue
 * @param {boolean} [props.compact] Drop the HyprEarn wordmark on narrow
 *   viewports. True on a card, whose header also carries a status pill; false
 *   in the entry modal, where the row holds nothing but this and a close
 *   button — there, hiding the word leaves a leading `×` with nothing before it.
 */
export default function VenueLockup({ venueId, venue, compact = true }) {
  const mark = VENUE_MARKS[venueId];

  return (
    <div className="text-figure flex min-w-0 items-center gap-[0.5em] leading-none">
      <img
        src={a.logoMark}
        alt=""
        aria-hidden
        className="h-[1.33em] w-[1em] shrink-0"
      />
      {/* Below `sm` a compact row cannot carry both names and the status pill.
          The mark is still right there, so the word is what gives way. */}
      <span className={compact ? "hidden text-ink sm:inline" : "text-ink"}>
        HyprEarn
      </span>
      <span className="text-copy text-ink-subtle" aria-hidden>
        ×
      </span>
      {mark ? mark.render(mark.className) : null}
      <span className="truncate text-ink">{venue}</span>
    </div>
  );
}
