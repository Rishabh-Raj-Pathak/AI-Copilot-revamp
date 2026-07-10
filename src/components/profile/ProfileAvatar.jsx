/** Brand-family gradients — picked by handle so an avatar never changes on rerender. */
const GRADIENTS = [
  "from-[#2fffce] via-[#7ee787] to-[#f7bb08]",
  "from-[#f7bb08] via-[#f2b500] to-[#2fffce]",
  "from-[#00f3b6] via-[#2fffce] to-[#7ee787]",
  "from-[#7ee787] via-[#00f3b6] to-[#f2b500]",
];

function hash(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function initials(name, handle) {
  const source = (name || handle || "").replace(/^@/, "").trim();
  if (!source) return "";
  const words = source.split(/[\s_-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Generated locally rather than fetched — the prototype has no network, and a
 * remote avatar URL would be the one thing here that can 404.
 *
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} [props.handle] falls back to seeding the gradient
 * @param {string} [props.seed] use the wallet address when there's no social yet
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.className]
 */
export default function ProfileAvatar({
  name,
  handle,
  seed,
  size = "md",
  className = "",
}) {
  const key = handle || name || seed || "";
  const gradient = GRADIENTS[hash(key) % GRADIENTS.length];
  const label = initials(name, handle);

  const sizeClass =
    size === "lg"
      ? "size-14 text-lg"
      : size === "sm"
        ? "size-5 text-[8px]"
        : "size-9 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-black/70 ${gradient} ${sizeClass} ${className}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
