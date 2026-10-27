/**
 * Full-bleed scene behind a competition card — a seasonal edition brings its
 * own (`backdrop` in competeMockData.js). The venue coin still sits on top of
 * it, cut by the first rule as on every card.
 *
 * The scene is drawn for a wider card than ours: its art sits in two opposite
 * corners (top-right and bottom-left) with empty dark between them, and any
 * single `cover` crop of it onto a narrower card loses one corner or the
 * other. So the file is laid twice at the card's height and cut along a
 * horizontal line the artist left empty: the half above the line is pinned
 * top-right, the half below it bottom-left. Each corner keeps every pixel of
 * its art at any card width; what the narrower card gives up is only the dark
 * middle. `split` is that line as a percentage of the file's height, chosen
 * on a row of flat background so the two halves meet without a visible seam.
 *
 * The two-point feather on either side of the line only absorbs sub-pixel
 * rounding; the row it lands on is a single flat colour in both halves.
 */
export default function CardBackdrop({ src, split }) {
  const image = {
    backgroundImage: `url("${src}")`,
    backgroundSize: "auto 100%",
    backgroundRepeat: "no-repeat",
  };
  const above = `linear-gradient(to bottom, #000 ${split - 1}%, transparent ${split + 1}%)`;
  const below = `linear-gradient(to bottom, transparent ${split - 1}%, #000 ${split + 1}%)`;

  return (
    // Dimmed to 70% over the black face: the scene is lit for a poster, and at
    // full strength the pumpkins out-shine the copy and stats sitting on it.
    <div className="pointer-events-none absolute inset-0 select-none opacity-70" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ ...image, backgroundPosition: "right top", WebkitMaskImage: above, maskImage: above }}
      />
      <div
        className="absolute inset-0"
        style={{ ...image, backgroundPosition: "left top", WebkitMaskImage: below, maskImage: below }}
      />
    </div>
  );
}
