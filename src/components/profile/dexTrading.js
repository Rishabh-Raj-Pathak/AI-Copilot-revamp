import { useEffect, useRef, useState } from "react";
import { APP_VENUES } from "../mobile/venues.js";

/**
 * Per-DEX connection on the profile: the desktop `DexTradingCard` and the
 * phone profile's DEX section both render from here.
 *
 * "Connect" approves HyprEarn's API key (the agent wallet) on that DEX, so the
 * copilot can place orders there. The key can place orders but never withdraw.
 *
 * A row is in one of three states (`dexState`):
 * - `connected`     key approved and in use → Disconnect
 * - `disconnected`  HyprEarn stopped using it, but the key is still approved
 *                   on the DEX → Connect again, or Revoke API key
 * - `none`          no key: never connected, or revoked → Connect
 *
 * Venues are the phone's venue list (`APP_VENUES`): same ids, same order and
 * the only set with a logo for every DEX.
 */
export const DEX_TRADING_VENUES = APP_VENUES;

/**
 * Stand-in for the positions API: open positions per venue. Hyperliquid has
 * some, so its disconnect shows the "close them first" block; every other
 * venue has none, so its disconnect goes through.
 */
export const DEX_OPEN_POSITIONS = {
  hyperliquid: [
    { market: "BTC-PERP", side: "Long", size: "$12,400" },
    { market: "HYPE-PERP", side: "Short", size: "$3,150" },
  ],
};

/** @param {string} venueId */
export const openPositionsOn = (venueId) => DEX_OPEN_POSITIONS[venueId] ?? [];

/** How long each simulated wallet / backend round trip takes. */
export const DEX_ACTION_MS = { connect: 1200, disconnect: 1000, revoke: 1200 };

/**
 * @param {{ connected: boolean } | undefined} access the venue's `dexTrading` entry
 * @returns {'connected'|'disconnected'|'none'}
 */
export function dexState(access) {
  if (!access) return "none";
  return access.connected ? "connected" : "disconnected";
}

/**
 * Words for the three dialogs, shared by the desktop dialog and the phone sheet.
 *
 * @param {'blocked'|'disconnect'|'revoke'} kind
 * @param {{ label: string }} venue
 * @param {Array<object>} positions
 */
export function dexDialogCopy(kind, venue, positions = []) {
  if (kind === "blocked") {
    const n = positions.length;
    return {
      sheetTitle: "Can't disconnect yet",
      title: `Close your ${venue.label} positions first`,
      body: `You have ${n} open position${n === 1 ? "" : "s"} on ${venue.label}. Close ${n === 1 ? "it" : "them"}, then you can disconnect.`,
      confirm: "Got it",
    };
  }
  if (kind === "revoke") {
    return {
      sheetTitle: "Revoke API key",
      title: `Revoke the ${venue.label} API key?`,
      body: `HyprEarn's key on ${venue.label} stops working for good. To trade there again, you'll connect and sign a new key.`,
      confirm: "Revoke API key",
      pendingLabel: "Revoking…",
    };
  }
  return {
    sheetTitle: "Disconnect",
    title: `Disconnect ${venue.label}?`,
    body: `HyprEarn will stop placing orders on ${venue.label}. Your funds stay there, and the API key stays active until you revoke it.`,
    confirm: "Disconnect",
    pendingLabel: "Disconnecting…",
  };
}

/**
 * One row's actions and its dialog. A row runs one action at a time.
 *
 * Connect runs straight away. Disconnect and Revoke API key open a dialog
 * first; the confirm button carries the loader, and the dialog closes when the
 * action lands. Disconnect with open positions opens the "blocked" dialog
 * instead, which only explains.
 *
 * @param {object} args
 * @param {{ id: string, label: string }} args.venue
 * @param {(venueId: string) => void} args.onConnect
 * @param {(venueId: string) => void} args.onDisconnect
 * @param {(venueId: string) => void} args.onRevoke
 * @param {(message: string, variant?: 'success'|'error') => void} [args.onNotify]
 */
export function useDexConnection({ venue, onConnect, onDisconnect, onRevoke, onNotify }) {
  /** @type {['connect'|'disconnect'|'revoke'|null, Function]} */
  const [pending, setPending] = useState(null);
  /** @type {['blocked'|'disconnect'|'revoke'|null, Function]} */
  const [dialog, setDialog] = useState(null);
  const cancelRef = useRef(null);

  // An unmounted row must not resolve into the store.
  useEffect(() => () => cancelRef.current?.(), []);

  const run = (kind, done) => {
    if (pending) return;
    setPending(kind);
    const id = window.setTimeout(() => {
      cancelRef.current = null;
      setPending(null);
      done();
    }, DEX_ACTION_MS[kind]);
    cancelRef.current = () => window.clearTimeout(id);
  };

  const inDialog = pending === "disconnect" || pending === "revoke";

  return {
    pending,
    dialog,
    positions: openPositionsOn(venue.id),
    connect: () =>
      run("connect", () => {
        onConnect(venue.id);
        onNotify?.(`${venue.label} connected`, "success");
      }),
    requestDisconnect: () => {
      if (pending) return;
      setDialog(openPositionsOn(venue.id).length ? "blocked" : "disconnect");
    },
    requestRevoke: () => {
      if (pending) return;
      setDialog("revoke");
    },
    confirm: () => {
      if (dialog === "disconnect") {
        run("disconnect", () => {
          setDialog(null);
          onDisconnect(venue.id);
          onNotify?.(`${venue.label} disconnected`, "success");
        });
      } else if (dialog === "revoke") {
        run("revoke", () => {
          setDialog(null);
          onRevoke(venue.id);
          onNotify?.(`${venue.label} API key revoked`, "success");
        });
      } else {
        setDialog(null);
      }
    },
    /** Closing is ignored while the confirm is in flight. */
    closeDialog: () => {
      if (!inDialog) setDialog(null);
    },
  };
}
