/** Minimal strategy-card illustrations (reference-inspired). */
export default function StrategyTemplateIllustration({ type }) {
  if (type === "flow") {
    return (
      <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden>
        <rect x="8" y="10" width="36" height="18" rx="4" fill="#2a2a2a" stroke="#3d3d3d" />
        <path d="M44 19 H56 L68 32" stroke="#585858" fill="none" strokeWidth="1.5" />
        <rect x="68" y="26" width="44" height="20" rx="6" fill="#1a2e1a" stroke="#3d5c3d" />
        <text x="78" y="40" fill="#7cb87c" fontSize="9" fontFamily="system-ui">
          Buy
        </text>
        <rect x="68" y="50" width="44" height="16" rx="6" fill="#2e1a1a" stroke="#5c3d3d" />
        <text x="74" y="62" fill="#c87c7c" fontSize="9" fontFamily="system-ui">
          Sell
        </text>
      </svg>
    );
  }
  if (type === "line") {
    return (
      <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden>
        <path
          d="M8 48 Q30 20 52 38 T96 28"
          fill="none"
          stroke="#6b8cae"
          strokeWidth="2"
        />
        <line x1="8" y1="52" x2="112" y2="52" stroke="#3d3d3d" strokeDasharray="4 3" />
        <line x1="8" y1="36" x2="112" y2="36" stroke="#3d3d3d" strokeDasharray="4 3" />
        <circle cx="96" cy="28" r="4" fill="#f2b500" opacity="0.8" />
      </svg>
    );
  }
  if (type === "anchor") {
    return (
      <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden>
        <path
          d="M12 50 L40 30 L68 42 L100 22"
          fill="none"
          stroke="#9b8ec4"
          strokeWidth="2"
        />
        <line x1="12" y1="54" x2="108" y2="54" stroke="#454545" strokeWidth="1" />
        <line x1="40" y1="54" x2="40" y2="30" stroke="#454545" strokeWidth="1" strokeDasharray="3 2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden>
      <line x1="20" y1="12" x2="20" y2="58" stroke="#3d3d3d" strokeWidth="2" />
      <rect x="28" y="22" width="8" height="28" fill="#4a6fa5" rx="1" />
      <rect x="44" y="32" width="8" height="18" fill="#c45c5c" rx="1" />
      <rect x="60" y="18" width="8" height="32" fill="#4a6fa5" rx="1" />
      <rect x="76" y="28" width="8" height="22" fill="#5cb85c" rx="1" />
      <rect x="92" y="24" width="8" height="26" fill="#c45c5c" rx="1" />
      <path d="M16 48 H104" stroke="#585858" strokeWidth="1" strokeDasharray="3 2" />
    </svg>
  );
}
