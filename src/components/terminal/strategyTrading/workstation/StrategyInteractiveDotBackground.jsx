import { useEffect, useMemo, useRef } from "react";

const DOT_STEP_X = 10;
const DOT_STEP_Y = 10;
const HOVER_HALF_SIZE = 150;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getDotFill(dot, pointer, active) {
  const baseAlpha = dot.baseAlpha;
  if (!active) return `rgba(168,176,172,${baseAlpha})`;

  const dx = dot.x - pointer.x;
  const dy = dot.y - pointer.y;
  const d = Math.max(Math.abs(dx), Math.abs(dy));
  if (d >= HOVER_HALF_SIZE) return `rgba(168,176,172,${baseAlpha})`;

  const t = 1 - d / HOVER_HALF_SIZE;
  const intensity = clamp(t * 1.25, 0, 1);
  const r = Math.round(lerp(168, 235, intensity));
  const g = Math.round(lerp(176, 255, intensity));
  const b = Math.round(lerp(172, 142, intensity));
  const alpha = clamp(lerp(baseAlpha, 1, intensity), 0, 1);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function StrategyInteractiveDotBackground({
  width,
  height,
  pointerX,
  pointerY,
  hoverActive,
}) {
  const canvasRef = useRef(null);
  const dots = useMemo(() => {
    const cols = Math.ceil(width / DOT_STEP_X) + 2;
    const rows = Math.ceil(height / DOT_STEP_Y) + 2;
    return Array.from({ length: rows }).flatMap((_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        x: col * DOT_STEP_X + 7,
        y: row * DOT_STEP_Y + 7,
        // Constant base alpha keeps the field visually uniform at idle.
        baseAlpha: 0.44,
      })),
    );
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(
      width * 0.5,
      0,
      width * 0.08,
      width * 0.5,
      0,
      Math.max(width, height) * 1.2,
    );
    gradient.addColorStop(0, "#070909");
    gradient.addColorStop(0.46, "#040607");
    gradient.addColorStop(1, "#020405");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const pointer = { x: pointerX ?? width / 2, y: pointerY ?? height / 2 };
    dots.forEach((dot) => {
      ctx.fillStyle = getDotFill(dot, pointer, hoverActive);
      ctx.fillRect(dot.x, dot.y, 1, 1);
    });
  }, [dots, width, height, pointerX, pointerY, hoverActive]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
