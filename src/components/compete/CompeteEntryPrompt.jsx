import { EntryOffer, XMark } from "./competeCopy.jsx";

/**
 * The standing version of the entry invitation, for after the modal has been
 * closed.
 *
 * `CompeteEntryModal` greets you once and then stays shut for the session, so
 * without this the only remaining way in would be the CTA on one card — fine
 * if you noticed it, invisible if you scrolled past.
 *
 * One sentence in the page header, with the action set inside it as text. The
 * bordered chip this used to be cost a row of its own and had no shared edge
 * with the line above it, so it read as appended rather than placed; as a
 * dashed-underlined phrase it sits in the sentence's own baseline and the
 * header keeps its shape whether the offer is showing or not.
 *
 * Weight and the dashed rule carry the affordance, not a box. Solid underline
 * would read as a link to somewhere else — this opens a dialog over the page
 * you are already on.
 *
 * Rendered only while there is something to join, so it disappears the moment
 * you enter rather than sitting there advertising a thing you already did.
 *
 * @param {object} props
 * @param {() => void} props.onOpen
 */
export default function CompeteEntryPrompt({ onOpen }) {
  return (
    /* `text-ink` against the muted description above it: two muted lines in a
       row read as one long paragraph, and this is the one with something in it
       for the reader. Ink does the separating so the spacing does not have to. */
    <p className="text-copy mt-2 text-ink">
      <EntryOffer />{" "}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Connect X"
        /* A bottom border rather than `underline decoration-dashed`: the X mark
           is an inline-block, and text-decoration is not drawn through one, so
           the dashes stopped at the end of the word and left the glyph
           hanging. A border is on the button box, so it runs under both. */
        className="border-b border-dashed border-ink-faint font-medium leading-tight text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {"Connect "}
        <XMark />
      </button>
    </p>
  );
}
