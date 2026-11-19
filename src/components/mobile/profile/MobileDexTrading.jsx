import { useState } from "react";
import { KeyRound, TriangleAlert } from "lucide-react";
import AppButton from "../AppButton.jsx";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { useProfile } from "../../profile/ProfileContext.jsx";
import {
  DEX_TRADING_VENUES,
  dexDialogCopy,
  dexState,
  useDexConnection,
} from "../../profile/dexTrading.js";
import { Card, DividedRows, IconBadge, Section } from "./profileUi.jsx";

/**
 * Phone counterpart of the desktop `DexTradingCard`: same venues, same record
 * (`ProfileContext.dexTrading`), laid out as a "LINKED ACCOUNTS"-style card.
 *
 * Same flow as desktop, in a fixed order so a row never moves:
 * - connected     → Disconnect
 * - disconnected  → Revoke API key in Disconnect's place; Connect and an amber
 *                   "API key still active" note on a second line
 * - none          → Connect
 * Status (Connected / Disconnected) sits under each name. The right-hand
 * button is one fixed width, so those buttons line up down the card.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} props.onNotify
 */
export default function MobileDexTrading({ onNotify }) {
  const { dexTrading, connectDex, disconnectDex, revokeDexKey } = useProfile();
  const connectedCount = DEX_TRADING_VENUES.filter(
    (venue) => dexState(dexTrading[venue.id]) === "connected",
  ).length;

  return (
    <Section label={`DEX TRADING · ${connectedCount} CONNECTED`}>
      <Card>
        {/* Inset to the name: 16px row padding + 36px logo + 12px gap. */}
        <DividedRows inset="pl-16">
          {DEX_TRADING_VENUES.map((venue) => (
            <DexRow
              key={venue.id}
              venue={venue}
              state={dexState(dexTrading[venue.id])}
              onConnect={connectDex}
              onDisconnect={disconnectDex}
              onRevoke={revokeDexKey}
              onNotify={onNotify}
            />
          ))}
        </DividedRows>
      </Card>
      <p className="flex gap-1.5 px-1 text-app-caption leading-[17px] text-ink-faint">
        <AppIcon src={appIcons.shieldCheck16} size={14} className="mt-px shrink-0" />
        HyprEarn&apos;s API key can place orders but never withdraw funds.
      </p>
    </Section>
  );
}

/**
 * The X row's 32px outlined button with its hit-area bleed. Shape only: each
 * use adds one border, fill and text colour.
 */
const BUTTON =
  "app-pressable relative flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-app-callout font-medium leading-[normal] before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-[''] disabled:pointer-events-none disabled:opacity-60";

/** One width for the right-hand slot: Connect, Connecting…, Disconnect, Revoke API key. */
const ACTION = `${BUTTON} w-[8rem]`;
const CONNECT_LOOK = "border-app-line-strong bg-app-subtle text-ink";

function DexRow({ venue, state, onConnect, onDisconnect, onRevoke, onNotify }) {
  const c = useDexConnection({ venue, onConnect, onDisconnect, onRevoke, onNotify });
  const busy = c.pending !== null;
  const connected = state === "connected";

  const connectButton = (
    <button
      type="button"
      onClick={c.connect}
      disabled={busy}
      aria-busy={c.pending === "connect" || undefined}
      aria-label={`Connect ${venue.label}`}
      className={`${ACTION} ${CONNECT_LOOK}`}
    >
      {c.pending === "connect" ? (
        <AppIcon src={appIcons.loader16} size={14} className="animate-spin text-app-accent" />
      ) : null}
      {c.pending === "connect" ? "Connecting…" : "Connect"}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-app-line bg-app-raised">
        <img alt="" src={venue.logo} className="max-h-[22px] max-w-[22px] object-contain" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-app-body font-medium leading-[normal] text-ink">
          {venue.label}
        </p>
        <p
          className={`text-app-caption leading-[normal] ${connected ? "text-app-positive" : "text-ink-faint"}`}
        >
          {connected ? "Connected" : "Disconnected"}
        </p>
      </div>

      {/* The fixed slot: Disconnect, then Revoke API key in the same place. */}
      {connected ? (
        <button
          type="button"
          onClick={c.requestDisconnect}
          disabled={busy}
          aria-label={`Disconnect ${venue.label}`}
          className={`${ACTION} border-app-line bg-transparent text-ink-muted`}
        >
          Disconnect
        </button>
      ) : state === "disconnected" ? (
        <button
          type="button"
          onClick={c.requestRevoke}
          disabled={busy}
          aria-label={`Revoke the ${venue.label} API key`}
          className={`${ACTION} border-app-line-strong bg-transparent text-app-sell`}
        >
          Revoke API key
        </button>
      ) : (
        connectButton
      )}

      {state === "disconnected" ? (
        <div className="flex basis-full items-center gap-3 pl-12">
          {connectButton}
          <span className="flex items-center gap-1 text-app-caption leading-[normal] text-app-accent">
            <KeyRound size={12} className="shrink-0" aria-hidden />
            API key still active
          </span>
        </div>
      ) : null}

      <DexSheet
        kind={c.dialog}
        venue={venue}
        positions={c.positions}
        busy={c.pending === "disconnect" || c.pending === "revoke"}
        onConfirm={c.confirm}
        onClose={c.closeDialog}
      />
    </div>
  );
}

/**
 * Phone version of `DexConnectionDialog`, laid out like the Delete Account
 * "Sign Sheet": the DEX's logo (or an amber warning) in a centred badge, the
 * question as the headline, stacked full-width buttons. While the confirm is
 * in flight it can't be dismissed.
 */
function DexSheet({ kind, venue, positions, busy, onConfirm, onClose }) {
  // Keep the last kind so the sheet keeps its words while it slides away.
  const [shown, setShown] = useState(kind);
  if (kind && kind !== shown) setShown(kind);

  const copy = shown ? dexDialogCopy(shown, venue, positions) : null;
  const blocked = shown === "blocked";

  return (
    <BottomSheet open={Boolean(kind)} onClose={onClose} title={copy?.sheetTitle} showClose={!busy}>
      {copy ? (
        <div className="flex flex-col items-center gap-4 px-4 pb-4 pt-5">
          {blocked ? (
            <IconBadge className="border border-app-accent-subtle bg-app-accent-faint text-app-accent">
              <TriangleAlert size={24} strokeWidth={1.75} />
            </IconBadge>
          ) : (
            <IconBadge className="overflow-hidden border border-app-line bg-app-subtle">
              <img alt="" src={venue.logo} className="max-h-7 max-w-7 object-contain" />
            </IconBadge>
          )}

          <div className="flex w-full flex-col items-center gap-1.5 text-center">
            <p className="text-[17px] font-semibold leading-[normal] text-ink">{copy.title}</p>
            <p className="text-app-body leading-5 text-ink-muted">{copy.body}</p>
          </div>

          {blocked && positions.length ? (
            <ul className="flex w-full flex-col overflow-hidden rounded-xl border border-app-line bg-app-bg">
              {positions.map((p) => {
                const long = p.side === "Long";
                return (
                  <li
                    key={p.market}
                    className="flex items-center gap-2 border-t border-app-line px-3.5 py-3 first:border-t-0"
                  >
                    <span className="text-app-body font-medium text-ink">{p.market}</span>
                    <span
                      className={`rounded px-1.5 py-px text-app-label font-medium ${
                        long
                          ? "bg-app-positive-subtle text-app-positive"
                          : "bg-app-negative-subtle text-app-sell"
                      }`}
                    >
                      {p.side}
                    </span>
                    <span className="ml-auto text-app-body font-medium text-ink">{p.size}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {blocked ? (
            <AppButton variant="secondary" className="!h-12" onClick={onConfirm}>
              {copy.confirm}
            </AppButton>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <AppButton
                variant="destructive"
                className="!h-12"
                onClick={onConfirm}
                aria-busy={busy || undefined}
              >
                {busy ? <AppIcon src={appIcons.loader16} size={16} className="animate-spin" /> : null}
                {busy ? copy.pendingLabel : copy.confirm}
              </AppButton>
              {/* Not `disabled`: AppButton paints that as a grey fill. Closing
                  is ignored while busy anyway (`closeDialog`). */}
              <AppButton
                variant="ghost"
                className={`!h-12 ${busy ? "pointer-events-none opacity-50" : ""}`}
                onClick={onClose}
                aria-disabled={busy || undefined}
              >
                Cancel
              </AppButton>
            </div>
          )}
        </div>
      ) : null}
    </BottomSheet>
  );
}
