export function formatEquityTick(value) {
  if (value >= 1000) {
    const k = value / 1000;
    return Number.isInteger(k) ? `$${k}k` : `$${k.toFixed(1)}k`;
  }
  return `$${Math.round(value)}`;
}

export function formatChartDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function yAt(value, innerH, top, vmin, vmax) {
  return top + ((vmax - value) / (vmax - vmin)) * innerH;
}

function seriesCoords(points, chartW, innerH, top, vmin, vmax, padX = 8) {
  if (!points?.length) return [];
  const n = points.length;
  const xStep = n > 1 ? (chartW - padX * 2) / (n - 1) : 0;
  return points.map((p, i) => ({
    x: padX + i * xStep,
    y: yAt(p.value, innerH, top, vmin, vmax),
  }));
}

export function buildSeriesPath(points, chartW, innerH, top, vmin, vmax, padX = 8) {
  const coords = seriesCoords(points, chartW, innerH, top, vmin, vmax, padX);
  if (!coords.length) return "";
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    d += ` L ${coords[i].x} ${coords[i].y}`;
  }
  return d;
}

/** Smooth cubic-bezier path through equity points (Catmull-Rom style control points). */
export function buildSmoothSeriesPath(
  points,
  chartW,
  innerH,
  top,
  vmin,
  vmax,
  padX = 8,
) {
  const coords = seriesCoords(points, chartW, innerH, top, vmin, vmax, padX);
  if (!coords.length) return "";
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] ?? coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function buildSeriesAreaPath(
  points,
  chartW,
  innerH,
  top,
  vmin,
  vmax,
  bottomY,
  padX = 8,
  smooth = false,
) {
  const line = smooth
    ? buildSmoothSeriesPath(points, chartW, innerH, top, vmin, vmax, padX)
    : buildSeriesPath(points, chartW, innerH, top, vmin, vmax, padX);
  if (!line || !points?.length) return "";
  const coords = seriesCoords(points, chartW, innerH, top, vmin, vmax, padX);
  const lastX = coords[coords.length - 1]?.x ?? padX;
  const firstX = coords[0]?.x ?? padX;
  return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
}

export function computeValueBounds(strategyPts, buyHoldPts) {
  const all = [...(strategyPts ?? []), ...(buyHoldPts ?? [])].map((p) => p.value);
  if (!all.length) return { vmin: 0, vmax: 100 };
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = (max - min) * 0.08 || 500;
  return { vmin: min - pad, vmax: max + pad };
}

export function buildYTicks(vmin, vmax, count = 4) {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    ticks.push(vmax - t * (vmax - vmin));
  }
  return ticks;
}
