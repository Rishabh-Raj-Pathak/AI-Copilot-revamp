import { useEffect, useRef } from "react";

/**
 * Hardware/gesture "back" for the phone shell.
 *
 * A native app closes the top sheet (or pops the pushed screen) when the user
 * presses Android back or swipes back on iOS. A web page would leave the site.
 * Each open layer pushes one anonymous history entry; a `popstate` pops the
 * top layer and calls its `onPop`.
 *
 * Closing a layer from the UI (X, scrim, drag) calls `history.back()` to drop
 * its entry. That back is asynchronous, so any layer opened before its
 * `popstate` lands is queued — otherwise the late `popstate` would be read as
 * a user back and close the layer that just opened (sheet A → sheet B swaps,
 * and React StrictMode's mount/unmount/mount, both hit this).
 */

/** @typedef {{ onPop: () => void }} Layer */

/** @type {Layer[]} */
const stack = [];
/** @type {Layer[]} */
const queue = [];
let pendingBacks = 0;
let listening = false;

function doPush(layer) {
  stack.push(layer);
  window.history.pushState(
    { ...(window.history.state ?? {}), __appLayer: stack.length },
    "",
  );
}

function flush() {
  while (pendingBacks === 0 && queue.length) doPush(queue.shift());
}

function onPopState() {
  if (pendingBacks > 0) {
    pendingBacks -= 1;
    flush();
    return;
  }
  const layer = stack.pop();
  layer?.onPop();
  flush();
}

function ensureListening() {
  if (listening || typeof window === "undefined") return;
  window.addEventListener("popstate", onPopState);
  listening = true;
}

/** @param {Layer} layer */
export function pushHistoryLayer(layer) {
  ensureListening();
  if (pendingBacks > 0) queue.push(layer);
  else doPush(layer);
  return layer;
}

/**
 * Drop a layer that was closed from the UI. A layer already popped by the
 * browser (it is the one that triggered the close) is a no-op.
 * @param {Layer} layer
 */
export function releaseHistoryLayer(layer) {
  const queued = queue.indexOf(layer);
  if (queued !== -1) {
    queue.splice(queued, 1);
    return;
  }
  const index = stack.indexOf(layer);
  if (index === -1) return;
  stack.splice(index, 1);
  // Entries are anonymous, so dropping the top one keeps the count right even
  // when the released layer sits lower in the stack.
  pendingBacks += 1;
  window.history.back();
}

/**
 * Keep one history entry alive while `active`; the browser's back closes it.
 *
 * The push is deferred a tick so StrictMode's throwaway first mount never
 * reaches the history stack.
 *
 * @param {boolean} active
 * @param {() => void} onBack
 */
export function useHistoryBack(active, onBack) {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") return undefined;
    let layer = null;
    const timer = window.setTimeout(() => {
      layer = pushHistoryLayer({ onPop: () => onBackRef.current?.() });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      if (layer) releaseHistoryLayer(layer);
    };
  }, [active]);
}
