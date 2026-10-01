import { useEffect, useRef, useState } from "react";

const TRIGGER = 64; // px of (damped) pull that commits a refresh
const MAX = 96;

/**
 * Pull-to-refresh for a phone scroll view.
 *
 * An accelerator only: every screen that uses it also shows a visible refresh
 * control, so nothing depends on discovering the gesture. Arms only when the
 * view is scrolled to the very top and the finger moves down; any upward or
 * sideways intent hands the gesture back to normal scrolling.
 *
 * Returns `{ pull, armed }` for the indicator: `pull` is the damped distance
 * in px, `armed` is true once releasing would refresh.
 *
 * @param {React.RefObject<HTMLElement>} scrollRef
 * @param {() => void} onRefresh
 * @param {{ disabled?: boolean }} [options]
 */
export default function usePullToRefresh(scrollRef, onRefresh, { disabled = false } = {}) {
  const [pull, setPull] = useState(0);
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || disabled) return undefined;
    let startY = null;
    let startX = 0;
    let current = 0;

    const onStart = (e) => {
      if (el.scrollTop > 0 || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };
    const onMove = (e) => {
      if (startY == null) return;
      const dy = e.touches[0].clientY - startY;
      const dx = Math.abs(e.touches[0].clientX - startX);
      if (dy <= 0 || dx > dy || el.scrollTop > 0) {
        startY = null;
        current = 0;
        setPull(0);
        return;
      }
      // Rubber-band damping: the further you pull, the less it follows.
      current = Math.min(MAX, dy * 0.45);
      setPull(current);
      if (e.cancelable) e.preventDefault();
    };
    const onEnd = () => {
      if (startY != null && current >= TRIGGER) onRefreshRef.current?.();
      startY = null;
      current = 0;
      setPull(0);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [scrollRef, disabled]);

  return { pull, armed: pull >= TRIGGER };
}
