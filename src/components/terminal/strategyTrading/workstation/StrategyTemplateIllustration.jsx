import { useId } from "react";

const WIDTH = 320;
const HEIGHT = 108;
const PAD_X = 12;
const PAD_Y = 14;

const LIME = "rgba(167,232,79,0.88)";
const LIME_MUTED = "rgba(167,232,79,0.72)";

const PATTERNS = {
  candles: {
    points: [
      [PAD_X, 54],
      [48, 54],
      [48, 48],
      [84, 48],
      [84, 56],
      [120, 56],
      [120, 50],
      [156, 50],
      [156, 57],
      [192, 57],
      [192, 51],
      [228, 51],
      [228, 56],
      [264, 56],
      [264, 52],
      [WIDTH - PAD_X, 52],
    ],
    bars: [
      { x: 48, top: 48 },
      { x: 84, top: 48 },
      { x: 120, top: 50 },
      { x: 156, top: 50 },
      { x: 192, top: 51 },
      { x: 228, top: 51 },
      { x: 264, top: 52 },
    ],
  },
  flow: {
    points: [
      [PAD_X, 76],
      [48, 76],
      [48, 68],
      [84, 68],
      [84, 60],
      [120, 60],
      [120, 52],
      [156, 52],
      [156, 44],
      [192, 44],
      [192, 36],
      [228, 36],
      [228, 28],
      [264, 28],
      [264, 22],
      [WIDTH - PAD_X, 22],
    ],
    bars: [
      { x: 48, top: 68 },
      { x: 84, top: 60 },
      { x: 120, top: 52 },
      { x: 156, top: 44 },
      { x: 192, top: 36 },
      { x: 228, top: 28 },
      { x: 264, top: 22 },
    ],
  },
  line: {
    points: [
      [PAD_X, 82],
      [48, 82],
      [48, 68],
      [84, 68],
      [84, 52],
      [120, 52],
      [120, 36],
      [156, 36],
      [156, 24],
      [192, 24],
      [192, 16],
      [228, 16],
      [228, 12],
      [264, 12],
      [264, PAD_Y + 2],
      [WIDTH - PAD_X, PAD_Y + 2],
    ],
    bars: [
      { x: 48, top: 68 },
      { x: 84, top: 52 },
      { x: 120, top: 36 },
      { x: 156, top: 24 },
      { x: 192, top: 16 },
      { x: 228, top: 12 },
      { x: 264, top: PAD_Y + 2 },
    ],
  },
  anchor: {
    points: [
      [PAD_X, 76],
      [48, 76],
      [48, 68],
      [84, 68],
      [84, 60],
      [120, 60],
      [120, 52],
      [156, 52],
      [156, 44],
      [192, 44],
      [192, 36],
      [228, 36],
      [228, 28],
      [264, 28],
      [264, 22],
      [WIDTH - PAD_X, 18],
    ],
    bars: [
      { x: 48, top: 68 },
      { x: 84, top: 60 },
      { x: 120, top: 52 },
      { x: 156, top: 44 },
      { x: 192, top: 36 },
      { x: 228, top: 28 },
    ],
  },
};

function toPath(points) {
  return points
    .map(([x, y], idx) => `${idx === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
}

function cornerIndices(points) {
  const indices = [0];
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const isCorner =
      (cx !== px || cy !== py) && (cx !== nx || cy !== ny);
    if (isCorner) indices.push(i);
  }
  indices.push(points.length - 1);
  return indices;
}

export default function StrategyTemplateIllustration({ type }) {
  const uid = useId().replace(/:/g, "");
  const pattern = PATTERNS[type] ?? PATTERNS.candles;
  const { points, bars } = pattern;
  const pathD = toPath(points);
  const nodes = cornerIndices(points);
  const barGradId = `barGrad-${uid}`;
  const lineGlowId = `lineGlow-${uid}`;
  const barGlowId = `barGlow-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      role="img"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={barGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(167,232,79,0.2)" />
          <stop offset="50%" stopColor="rgba(167,232,79,0.07)" />
          <stop offset="100%" stopColor="rgba(167,232,79,0)" />
        </linearGradient>
        <filter
          id={lineGlowId}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={barGlowId} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <g opacity="0.78" filter={`url(#${barGlowId})`}>
        {bars.map((bar) => (
          <rect
            key={`bar-${bar.x}`}
            x={bar.x - 10}
            y={bar.top}
            width={20}
            height={HEIGHT - bar.top}
            fill={`url(#${barGradId})`}
            rx={1}
          />
        ))}
      </g>

      <path
        d={pathD}
        fill="none"
        stroke={LIME}
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.22"
        filter={`url(#${lineGlowId})`}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={pathD}
        fill="none"
        stroke={LIME}
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        opacity="0.14"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={pathD}
        fill="none"
        stroke={LIME_MUTED}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />

      {nodes.map((idx) => {
        const [x, y] = points[idx];
        return (
          <g key={`node-${idx}`}>
            <circle cx={x} cy={y} r="2.8" fill={LIME} opacity="0.16" />
            <circle cx={x} cy={y} r="1.15" fill={LIME} />
          </g>
        );
      })}
    </svg>
  );
}
