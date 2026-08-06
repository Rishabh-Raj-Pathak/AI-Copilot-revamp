import confetti from "canvas-confetti";

/** Brand-aligned confetti (terminal gradient CTA ramp + light highlights). */
export const CELEBRATION_COLORS = [
  "#f2b500",
  "#00f3b6",
  "#fefce8",
  "#f7bb08",
  "#2fffce",
];

/**
 * Two side bursts, a centre burst, then a 360° pop.
 *
 * @param {(opts: import('canvas-confetti').Options) => void} fire
 * @returns {() => void} cancels the trailing pop if the caller unmounts first
 */
export function runBrandCelebration(fire) {
  const shared = {
    colors: CELEBRATION_COLORS,
    disableForReducedMotion: true,
    ticks: 220,
    gravity: 1.05,
    decay: 0.91,
  };

  fire({
    ...shared,
    particleCount: 52,
    angle: 60,
    spread: 58,
    origin: { x: 0, y: 0.58 },
    startVelocity: 38,
    scalar: 0.95,
  });
  fire({
    ...shared,
    particleCount: 52,
    angle: 120,
    spread: 58,
    origin: { x: 1, y: 0.58 },
    startVelocity: 38,
    scalar: 0.95,
  });
  fire({
    ...shared,
    particleCount: 42,
    spread: 70,
    origin: { x: 0.5, y: 0.42 },
    startVelocity: 32,
    scalar: 0.88,
  });

  const popId = window.setTimeout(() => {
    fire({
      ...shared,
      particleCount: 28,
      spread: 360,
      origin: { x: 0.5, y: 0.48 },
      startVelocity: 22,
      scalar: 0.75,
      ticks: 160,
    });
  }, 160);

  return () => window.clearTimeout(popId);
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Run the celebration on a scoped canvas. No-ops under reduced motion.
 *
 * @param {HTMLCanvasElement|null} canvas
 * @returns {() => void} cleanup — safe to call from an effect teardown
 */
export function startCanvasCelebration(canvas) {
  if (!canvas || prefersReducedMotion()) return () => {};

  const fire = confetti.create(canvas, { resize: true, useWorker: true });
  let cancelPop = () => {};
  const frame = window.requestAnimationFrame(() => {
    cancelPop = runBrandCelebration(fire);
  });

  return () => {
    window.cancelAnimationFrame(frame);
    cancelPop();
  };
}
