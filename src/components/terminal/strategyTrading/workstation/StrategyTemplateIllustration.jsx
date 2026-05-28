const WIDTH = 160;
const HEIGHT = 96;
const GRID_X = 15;
const GRID_Y = 12;
const GRID_STEP_X = 10;
const GRID_STEP_Y = 9;
const HOVER_RADIUS = 34;

const GRID_DOTS = Array.from({ length: GRID_Y }).flatMap((_, row) =>
  Array.from({ length: GRID_X }, (_, col) => {
    const x = 12 + col * GRID_STEP_X;
    const y = 10 + row * GRID_STEP_Y;
    const base = 0.24;
    return { x, y, base };
  }),
);

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

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function dotStyle(dot, pointer, hoverActive) {
  const baseOpacity = dot.base;
  if (!hoverActive) {
    return {
      fill: `rgba(156,164,160,${baseOpacity})`,
      opacity: 1,
    };
  }

  const d = distance(dot, pointer);
  if (d >= HOVER_RADIUS) {
    return {
      fill: `rgba(156,164,160,${baseOpacity})`,
      opacity: 1,
    };
  }

  const t = 1 - d / HOVER_RADIUS;
  if (t > 0.66) {
    const alpha = Math.min(0.95, 0.42 + t * 0.44);
    return {
      fill: `rgba(181,240,100,${alpha})`,
      opacity: 1,
    };
  }

  const alpha = Math.min(0.8, 0.3 + t * 0.42);
  return {
    fill: `rgba(157,218,92,${alpha})`,
    opacity: 1,
  };
}

export default function StrategyTemplateIllustration({
  type,
  pointerX = WIDTH / 2,
  pointerY = HEIGHT / 2,
  hoverActive = false,
}) {
  const pathPoints = PATTERNS[type] ?? PATTERNS.candles;
  const pointer = { x: pointerX, y: pointerY };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full"
      aria-hidden
      role="img"
    >
      {GRID_DOTS.map((dot, idx) => {
        const style = dotStyle(dot, pointer, hoverActive);
        return (
          <rect
            key={`grid-dot-${idx}`}
            x={dot.x}
            y={dot.y}
            width="1"
            height="1"
            fill={style.fill}
            opacity={style.opacity}
            shapeRendering="crispEdges"
            style={{ transition: "fill 180ms ease, opacity 180ms ease" }}
          />
        );
      })}

      <path
        d={toPath(pathPoints)}
        fill="none"
        stroke="rgba(176,234,92,0.74)"
        strokeWidth="0.72"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {pathPoints.map(([x, y], idx) => {
        const d = Math.hypot(x - pointerX, y - pointerY);
        const t = hoverActive ? Math.max(0, 1 - d / 16) : 0;
        const nodeFill =
          t > 0.52
            ? `rgba(200,246,126,${0.64 + t * 0.18})`
            : `rgba(176,236,94,${0.58 + t * 0.16})`;
        return (
          <g key={`node-${idx}`}>
            <circle
              cx={x}
              cy={y}
              r="0.92"
              fill={nodeFill}
              style={{ transition: "fill 180ms ease" }}
            />
            {t > 0.45 ? (
              <circle
                cx={x}
                cy={y}
                r="1.7"
                fill={`rgba(177,239,99,${0.08 + t * 0.12})`}
                style={{ transition: "fill 180ms ease" }}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
