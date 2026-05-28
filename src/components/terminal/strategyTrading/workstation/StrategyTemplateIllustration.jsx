const WIDTH = 160;
const HEIGHT = 96;

const PATTERNS = {
  candles: [
    [18, 52],
    [30, 52],
    [30, 44],
    [42, 44],
    [42, 54],
    [54, 54],
    [54, 47],
    [68, 47],
    [68, 58],
    [82, 58],
    [82, 48],
    [98, 48],
    [98, 53],
    [114, 53],
    [114, 45],
    [132, 45],
  ],
  flow: [
    [20, 58],
    [34, 58],
    [34, 50],
    [48, 50],
    [48, 56],
    [62, 56],
    [62, 44],
    [78, 44],
    [78, 52],
    [94, 52],
    [94, 39],
    [112, 39],
    [112, 30],
    [130, 30],
    [144, 30],
  ],
  line: [
    [16, 66],
    [32, 66],
    [32, 60],
    [50, 60],
    [50, 55],
    [68, 55],
    [68, 49],
    [88, 49],
    [88, 40],
    [108, 40],
    [108, 30],
    [126, 30],
    [126, 20],
    [144, 20],
  ],
  anchor: [
    [16, 62],
    [34, 62],
    [34, 56],
    [52, 56],
    [52, 50],
    [72, 50],
    [72, 44],
    [92, 44],
    [92, 38],
    [112, 38],
    [112, 33],
    [132, 33],
    [144, 28],
  ],
};

function toPath(points) {
  return points
    .map(([x, y], idx) => `${idx === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
}

export default function StrategyTemplateIllustration({ type }) {
  const pathPoints = PATTERNS[type] ?? PATTERNS.candles;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full"
      aria-hidden
      role="img"
    >
      <path
        d={toPath(pathPoints)}
        fill="none"
        stroke="rgba(176,234,92,0.74)"
        strokeWidth="0.72"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {pathPoints.map(([x, y], idx) => (
        <circle
          key={`node-${idx}`}
          cx={x}
          cy={y}
          r="0.92"
          fill="rgba(176,236,94,0.58)"
        />
      ))}
    </svg>
  );
}
