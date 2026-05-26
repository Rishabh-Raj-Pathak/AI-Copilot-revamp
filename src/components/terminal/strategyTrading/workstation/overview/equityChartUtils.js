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

export function buildSeriesPath(points, chartW, innerH, top, vmin, vmax, padX = 8) {
  if (!points?.length) return "";
  const n = points.length;
  const xStep = n > 1 ? (chartW - padX * 2) / (n - 1) : 0;
  let d = `M ${padX} ${yAt(points[0].value, innerH, top, vmin, vmax)}`;
  for (let i = 1; i < n; i++) {
    d += ` L ${padX + i * xStep} ${yAt(points[i].value, innerH, top, vmin, vmax)}`;
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
) {
  const line = buildSeriesPath(points, chartW, innerH, top, vmin, vmax, padX);
  if (!line || !points?.length) return "";
  const n = points.length;
  const xStep = n > 1 ? (chartW - padX * 2) / (n - 1) : 0;
  const lastX = padX + (n - 1) * xStep;
  return `${line} L ${lastX} ${bottomY} L ${padX} ${bottomY} Z`;
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
