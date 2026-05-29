import { useCallback, useEffect, useState } from "react";

const THRESHOLD = 4;

/**
 * Tracks whether a scroll container overflows and has room to scroll on each edge.
 * @param {import('react').RefObject<HTMLElement | null>} ref
 * @param {'x' | 'y'} axis
 */
export function useScrollEdges(ref, axis = "y") {
  const [edges, setEdges] = useState({
    start: false,
    end: false,
    overflow: false,
  });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    if (axis === "y") {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      setEdges({
        overflow,
        start: overflow && el.scrollTop > THRESHOLD,
        end:
          overflow &&
          el.scrollTop + el.clientHeight < el.scrollHeight - THRESHOLD,
      });
      return;
    }

    const overflow = el.scrollWidth > el.clientWidth + 1;
    setEdges({
      overflow,
      start: overflow && el.scrollLeft > THRESHOLD,
      end:
        overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - THRESHOLD,
    });
  }, [ref, axis]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  return edges;
}
