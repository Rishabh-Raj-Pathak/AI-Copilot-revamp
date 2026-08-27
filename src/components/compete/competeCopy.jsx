import { XGlyph } from "../profile/SocialGlyphs.jsx";
import { GOLD } from "./competeTheme.js";

/**
 * The offer, written once. The hub header and the entry modal say the same
 * sentence, and a sentence kept in two files drifts the first time one of them
 * is edited.
 */

/**
 * The X mark used as a word inside running text — "Connect your ✕ and…" —
 * rather than as an icon beside a label.
 *
 * Sized in `em` so it tracks whatever step it is set in, and nudged down
 * because the glyph's box is its cap height: sat flush on the baseline it
 * rides high against the lowercase letters either side.
 *
 * Nudged with `relative`, not `vertical-align`. Vertical-align drops the
 * inline box below the baseline and drags the whole line box down with it,
 * which pushes any bottom border on an ancestor — the dashed rule under the
 * header's action — a visible step further from the text. Relative offsets
 * paint without touching layout.
 *
 * The `sr-only` twin restores the word, since the mark itself is decorative to
 * a screen reader and the sentence would otherwise be read with a hole in it.
 */
export function XMark() {
  return (
    <span className="relative top-[0.09em] inline-block">
      <XGlyph className="size-[0.95em]" />
      <span className="sr-only">X</span>
    </span>
  );
}

/**
 * Gold lands on the threshold and nowhere else: it is the one number a trader
 * has to weigh, and a second gold object would make it compete with itself.
 *
 * A fragment rather than a paragraph — the header sets it inline with the
 * action that follows it, the modal centres it on its own — so the caller owns
 * the element and the measure.
 */
export function EntryOffer() {
  return (
    <>
      {"Connect your "}
      <XMark />
      {" and qualify for a prize with just "}
      <span style={{ color: GOLD }}>$50K</span>
      {" in trading volume."}
    </>
  );
}
