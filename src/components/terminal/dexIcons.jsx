/**
 * Shared DEX identity — logo + label for the four venues wired into the
 * navbar selector (`terminalPlatforms`). Single source so the navbar dropdown,
 * the Trade page's per-dex connect cards, and position-table row logos all
 * render the same mark for a given dex id.
 */
import hyperliquidLogo from "@/assets/hyperliquid-logo.png";
import nadoLogo from "@/assets/nado-logo.png";
import pacificaLogo from "@/assets/pacifica-logo.png";

const DEX_LOGO_SRC = {
  hyperliquid: hyperliquidLogo,
  nado: nadoLogo,
  pacifica: pacificaLogo,
};

/** Paradex has no brand asset yet, so it falls back to a geometric mark. */
function ParadexMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 5l7 7-7 7-7-7 7-7z"
      />
    </svg>
  );
}

/** DEX mark for `id` (one of `terminalPlatforms`) — image, or a fallback glyph. */
export function DexIcon({ id, className = "size-[18px]" }) {
  const logo = DEX_LOGO_SRC[id];
  if (logo) {
    return (
      <img alt="" className={`${className} max-w-none object-contain`} src={logo} />
    );
  }
  if (id === "paradex") {
    return <ParadexMark className={`${className} text-[#c4b5fd]`} />;
  }
  return null;
}
