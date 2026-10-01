import { useSyncExternalStore } from "react";
import { NARROW_VIEWPORT_MEDIA } from "../../styles/breakpoints.js";

/**
 * `true` below the tablet breakpoint (834px) — the phone app shell.
 *
 * One shared `matchMedia` subscription instead of the per-component copies the
 * older mobile code carries. `useSyncExternalStore` keeps every consumer on the
 * same answer within a render, so a resize can't paint half the tree as phone
 * and half as desktop.
 */
function subscribe(onChange) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(NARROW_VIEWPORT_MEDIA);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(NARROW_VIEWPORT_MEDIA).matches;
}

function getServerSnapshot() {
  return false;
}

export default function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
