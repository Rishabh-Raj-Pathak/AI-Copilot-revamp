import { useEffect, useRef, useState } from "react";
import { APP_VENUES } from "../mobile/venues.js";

/**
 * Per-DEX trading approval on the profile: the desktop `DexTradingCard` and the
 * phone profile's DEX section both render from here.
 *
 * "Enable trading" approves HyprEarn's agent wallet on that DEX, the same
 * approval the agent logs and trade alerts ask for when it's missing. "Revoke"
 * takes it back. The approval can place orders but never withdraw.
 *
 * Venues are the phone's venue list (`APP_VENUES`): same ids, same order and
 * the only set with a logo for every DEX.
 */
export const DEX_TRADING_VENUES = APP_VENUES;

export const DEX_ENABLE_MS = 1200;
export const DEX_REVOKE_MS = 900;

/**
 * Stand-ins for the wallet signature each action needs. Here: a timer. Each
 * returns a cancel function so an unmounted row can't resolve into the store.
 *
 * @param {() => void} onDone
 * @returns {() => void} cancel
 */
export function startDexEnable(onDone) {
  const id = window.setTimeout(onDone, DEX_ENABLE_MS);
  return () => window.clearTimeout(id);
}

/** @param {() => void} onDone @returns {() => void} cancel */
export function startDexRevoke(onDone) {
  const id = window.setTimeout(onDone, DEX_REVOKE_MS);
  return () => window.clearTimeout(id);
}

/**
 * One row's in-flight action. `pending` is `'enable'`, `'revoke'` or `null`;
 * a row runs one action at a time.
 *
 * @param {object} args
 * @param {{ id: string, label: string }} args.venue
 * @param {(venueId: string) => void} args.onEnable
 * @param {(venueId: string) => void} args.onRevoke
 * @param {(message: string, variant?: 'success'|'error') => void} [args.onNotify]
 */
export function useDexTradingAction({ venue, onEnable, onRevoke, onNotify }) {
  const [pending, setPending] = useState(null);
  const cancelRef = useRef(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const run = (kind) => {
    if (pending) return;
    setPending(kind);
    const start = kind === "enable" ? startDexEnable : startDexRevoke;
    cancelRef.current = start(() => {
      cancelRef.current = null;
      setPending(null);
      if (kind === "enable") {
        onEnable(venue.id);
        onNotify?.(`Trading enabled on ${venue.label}`, "success");
      } else {
        onRevoke(venue.id);
        onNotify?.(`Trading revoked on ${venue.label}`, "success");
      }
    });
  };

  return {
    pending,
    enable: () => run("enable"),
    revoke: () => run("revoke"),
  };
}
