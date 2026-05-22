/**
 * Strategy card illustrations — editorial chart mockups (hand-tuned SVG, no generated assets).
 */

function IllustrationFrame({ children }) {
  return (
    <svg
      viewBox="0 0 160 96"
      className="h-full w-full"
      aria-hidden
      role="img"
    >
      <defs>
        <linearGradient id="tpl-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="tpl-band-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d4f5c" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3d4f5c" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="tpl-up" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#4a7c6a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6a9f8c" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="tpl-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5a5a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a86b6b" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="152"
        height="88"
        rx="6"
        fill="url(#tpl-panel)"
        stroke="#2a2a2a"
        strokeWidth="1"
      />
      {children}
    </svg>
  );
}

function Candle({ x, open, close, high, low, up }) {
  const bodyTop = Math.min(open, close);
  const bodyH = Math.max(Math.abs(close - open), 2);
  const fill = up ? "url(#tpl-up)" : "url(#tpl-down)";
  const stroke = up ? "#5a8f7a" : "#9a6a6a";
  return (
    <g>
      <line
        x1={x}
        y1={high}
        x2={x}
        y2={low}
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <rect
        x={x - 3.5}
        y={bodyTop}
        width="7"
        height={bodyH}
        rx="0.5"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />
    </g>
  );
}

function MeanReversionChart() {
  return (
    <IllustrationFrame>
      {/* grid */}
      {[28, 44, 60, 76].map((y) => (
        <line
          key={y}
          x1="14"
          y1={y}
          x2="146"
          y2={y}
          stroke="#252525"
          strokeWidth="0.75"
        />
      ))}
      {/* Bollinger envelope */}
      <path
        d="M14 32 Q48 22 80 28 T146 34 L146 68 Q110 78 80 72 T14 62 Z"
        fill="url(#tpl-band-fill)"
      />
      <path
        d="M14 32 Q48 22 80 28 T146 34"
        fill="none"
        stroke="#4a5a66"
        strokeWidth="1"
        strokeDasharray="3 2"
        opacity="0.85"
      />
      <path
        d="M14 62 Q48 72 80 66 T146 60"
        fill="none"
        stroke="#4a5a66"
        strokeWidth="1"
        strokeDasharray="3 2"
        opacity="0.85"
      />
      <path
        d="M14 48 Q52 44 88 46 T146 44"
        fill="none"
        stroke="#5c6b78"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* dip + reclaim candles */}
      <Candle x={36} open={52} close={48} high={46} low={56} up={false} />
      <Candle x={48} open={56} close={60} high={44} low={62} up={false} />
      <Candle x={60} open={62} close={54} high={52} low={64} up={false} />
      <Candle x={72} open={54} close={46} high={44} low={58} up={true} />
      <Candle x={84} open={46} close={42} high={40} low={50} up={true} />
      <Candle x={96} open={42} close={38} high={36} low={46} up={true} />
      <Candle x={108} open={38} close={44} high={36} low={48} up={false} />
      <Candle x={120} open={44} close={40} high={38} low={50} up={true} />
      {/* entry marker */}
      <circle cx="72" cy="64" r="3" fill="#f2b500" opacity="0.9" />
      <circle cx="72" cy="64" r="6" fill="none" stroke="#f2b500" strokeWidth="1" opacity="0.35" />
    </IllustrationFrame>
  );
}

function FundingFlowChart() {
  return (
    <IllustrationFrame>
      <rect x="16" y="18" width="42" height="22" rx="4" fill="#1a1a1a" stroke="#383838" />
      <rect x="22" y="24" width="20" height="3" rx="1" fill="#404040" />
      <rect x="22" y="30" width="28" height="2" rx="1" fill="#333" />

      <path
        d="M58 29 C68 29 72 34 82 38"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <polygon points="80,36 86,38 80,40" fill="#4a4a4a" />

      <rect x="88" y="14" width="56" height="24" rx="5" fill="#162218" stroke="#2a4030" />
      <rect x="96" y="22" width="22" height="8" rx="4" fill="#2d4a38" />
      <rect x="100" y="25" width="14" height="2" rx="1" fill="#6b9a7a" />

      <path
        d="M116 38 C116 48 108 52 98 56"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      <rect x="72" y="58" width="56" height="22" rx="5" fill="#221818" stroke="#403030" />
      <rect x="80" y="66" width="22" height="8" rx="4" fill="#4a3030" />
      <rect x="84" y="69" width="14" height="2" rx="1" fill="#a87a7a" />

      {/* rate bars */}
      <rect x="22" y="52" width="4" height="14" rx="1" fill="#3d5a4a" opacity="0.6" />
      <rect x="30" y="48" width="4" height="18" rx="1" fill="#4a6a58" opacity="0.7" />
      <rect x="38" y="54" width="4" height="12" rx="1" fill="#3d5a4a" opacity="0.5" />
    </IllustrationFrame>
  );
}

function BreakoutChart() {
  return (
    <IllustrationFrame>
      {[32, 48, 64].map((y) => (
        <line
          key={y}
          x1="14"
          y1={y}
          x2="146"
          y2={y}
          stroke="#252525"
          strokeWidth="0.75"
        />
      ))}
      {/* consolidation box */}
      <rect
        x="22"
        y="38"
        width="58"
        height="28"
        rx="2"
        fill="#1e1e1e"
        stroke="#353535"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <line x1="22" y1="38" x2="146" y2="38" stroke="#5a6a7a" strokeWidth="1.25" />
      {/* price line pre-breakout */}
      <path
        d="M26 58 L38 52 L50 54 L62 50 L74 52"
        fill="none"
        stroke="#6a7d8f"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* breakout impulse */}
      <path
        d="M74 52 L86 44 L98 36 L110 30 L122 26"
        fill="none"
        stroke="#7a9ab8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="98" cy="36" r="2.5" fill="#f2b500" opacity="0.85" />
      {/* volume */}
      {[30, 38, 46, 54, 62, 70, 78, 86, 94, 102, 110, 118].map((x, i) => {
        const h = i < 7 ? 6 + (i % 3) * 2 : 10 + (i - 6) * 3;
        return (
          <rect
            key={x}
            x={x}
            y={82 - h}
            width="5"
            height={h}
            rx="1"
            fill={i >= 7 ? "#4a6080" : "#333"}
            opacity={i >= 7 ? 0.85 : 0.5}
          />
        );
      })}
    </IllustrationFrame>
  );
}

function TrendAnchorChart() {
  return (
    <IllustrationFrame>
      {[30, 46, 62, 78].map((y) => (
        <line
          key={y}
          x1="14"
          y1={y}
          x2="146"
          y2={y}
          stroke="#252525"
          strokeWidth="0.75"
        />
      ))}
      {/* VWAP anchor */}
      <path
        d="M14 58 Q50 54 90 48 T146 40"
        fill="none"
        stroke="#6a5a7a"
        strokeWidth="1.25"
        strokeDasharray="4 3"
        opacity="0.7"
      />
      <rect x="16" y="56" width="18" height="6" rx="2" fill="#252228" stroke="#3a3540" />
      <rect x="19" y="58.5" width="12" height="1.5" rx="0.5" fill="#6a5a7a" opacity="0.7" />
      {/* trend line */}
      <path
        d="M18 72 L42 62 L66 54 L90 44 L114 36 L138 28"
        fill="none"
        stroke="#8a9ab0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* pullbacks to anchor */}
      <path
        d="M66 54 L72 50 L78 52"
        fill="none"
        stroke="#6a7d8f"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M114 36 L120 40 L126 38"
        fill="none"
        stroke="#6a7d8f"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* fade zone */}
      <path
        d="M14 78 L146 78 L146 86 L14 86 Z"
        fill="#2a2830"
        opacity="0.5"
      />
      <path
        d="M90 44 L100 52 L110 48 L120 56"
        fill="none"
        stroke="#7a6a8a"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity="0.45"
      />
    </IllustrationFrame>
  );
}

const CHARTS = {
  candles: MeanReversionChart,
  flow: FundingFlowChart,
  line: BreakoutChart,
  anchor: TrendAnchorChart,
};

export default function StrategyTemplateIllustration({ type }) {
  const Chart = CHARTS[type] ?? MeanReversionChart;
  return <Chart />;
}
