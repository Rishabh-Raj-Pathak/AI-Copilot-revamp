import { Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useProfile } from "./ProfileContext.jsx";
import DexConnectionDialog from "./DexConnectionDialog.jsx";
import { DEX_TRADING_VENUES, dexState, useDexConnection } from "./dexTrading.js";

/**
 * Every DEX HyprEarn trades on, and whether the user is connected there.
 *
 * Visual language from the Wallet & X card (`ProfileSimpleCard`): 36px logo
 * discs, and the status badge sits beside the name. Every row carries one:
 * green Connected or grey Disconnected.
 *
 * The flow, row by row (order never changes, so a row stays put while its
 * buttons change):
 * - connected     → Disconnect
 * - disconnected  → Revoke API key in Disconnect's place, with Connect beside
 *                   it; the key is still approved, which the amber note says
 * - none          → Connect
 * The right-hand slot is one fixed width, so those buttons line up down the
 * card and Disconnect turns into Revoke API key without the row shifting.
 *
 * Disconnect and Revoke API key confirm in a dialog first (loader in the
 * confirm button), and open positions block a disconnect
 * (`DexConnectionDialog`).
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function DexTradingCard({ onNotify }) {
  const { dexTrading, connectDex, disconnectDex, revokeDexKey } = useProfile();
  const connectedCount = DEX_TRADING_VENUES.filter(
    (venue) => dexState(dexTrading[venue.id]) === "connected",
  ).length;

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-[#242424] pb-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white">DEX trading</h2>
          <p className="mt-1 text-sm text-[#929292]">
            Choose the DEXs your copilot can place orders on.
          </p>
        </div>
        <p className="shrink-0 text-sm text-[#929292]">
          <span className="font-medium text-white">{connectedCount}</span> of{" "}
          {DEX_TRADING_VENUES.length} connected
        </p>
      </header>

      <ul className="mt-5 grid gap-2 xl:grid-cols-2">
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
      </ul>

      <p className="mt-5 flex items-start gap-2 border-t border-[#242424] pt-4 text-xs leading-5 text-[#757575]">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        HyprEarn&apos;s API key can place orders but never withdraw funds. Disconnecting
        pauses it; revoking the key removes access for good.
      </p>
    </section>
  );
}

/**
 * Shape only. Colours come from `DEX_BUTTON` so no class string carries two
 * border or text colours: `cn` is a plain join, and Tailwind would pick one by
 * stylesheet order, not by which came last.
 */
const ROW_SHAPE =
  "flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

/** The DEX card's row buttons. */
const DEX_BUTTON = {
  /** The row's main action when it isn't connected. */
  connect: `${ROW_SHAPE} border-[#2e2e2e] bg-[#161616] text-white hover:border-[#454545] hover:bg-[#1c1c1c]`,
  /** Disconnect: available, but not what the row is asking you to do. */
  quiet: `${ROW_SHAPE} border-[#242424] bg-transparent text-[#bfbfbf] hover:border-[#454545] hover:bg-white/[0.03] hover:text-white`,
  /** Revoke API key. Outlined: a bare red label read as disabled. */
  danger: `${ROW_SHAPE} border-[#242424] bg-transparent text-[#e0484a] hover:border-[#5c2626] hover:bg-[#e0484a]/[0.06]`,
};

/** One width for the right-hand slot: Connect, Connecting…, Disconnect, Revoke API key. */
const ACTION_WIDTH = "w-[8.5rem]";

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
      className={`${DEX_BUTTON.connect} ${ACTION_WIDTH}`}
    >
      {c.pending === "connect" ? (
        <>
          <Loader2 className="size-3.5 shrink-0 animate-spin text-[#00f3b6]" aria-hidden />
          Connecting…
        </>
      ) : (
        "Connect"
      )}
    </button>
  );

  return (
    <li className="flex min-h-[3.625rem] items-center gap-3 rounded-lg border border-[#242424] bg-black py-2 pr-2 pl-3">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#242424] bg-[#0f0f0f]">
        <img alt="" src={venue.logo} className="max-h-5 max-w-5 object-contain" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-white">{venue.label}</span>
          <StatusBadge connected={connected} />
        </div>
        {state === "disconnected" ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#f2b500]">
            <KeyRound className="size-3 shrink-0" aria-hidden />
            API key still active
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {state === "disconnected" ? connectButton : null}

        {/* The fixed slot: Disconnect, then Revoke API key in the same place. */}
        {connected ? (
          <button
            type="button"
            onClick={c.requestDisconnect}
            disabled={busy}
            aria-label={`Disconnect ${venue.label}`}
            className={`${DEX_BUTTON.quiet} ${ACTION_WIDTH}`}
          >
            Disconnect
          </button>
        ) : state === "disconnected" ? (
          <button
            type="button"
            onClick={c.requestRevoke}
            disabled={busy}
            aria-label={`Revoke the ${venue.label} API key`}
            className={`${DEX_BUTTON.danger} ${ACTION_WIDTH}`}
          >
            Revoke API key
          </button>
        ) : (
          connectButton
        )}
      </div>

      <DexConnectionDialog
        kind={c.dialog}
        venue={venue}
        positions={c.positions}
        busy={c.pending === "disconnect" || c.pending === "revoke"}
        onConfirm={c.confirm}
        onClose={c.closeDialog}
      />
    </li>
  );
}

/** Every row says where it stands: green Connected or grey Disconnected. */
function StatusBadge({ connected }) {
  return connected ? (
    <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#1e5a3f] bg-[#0d2019] px-2.5 py-0.5 text-xs font-medium text-[#00f3b6]">
      <Check className="size-3" strokeWidth={2.5} aria-hidden />
      Connected
    </span>
  ) : (
    <span className="flex shrink-0 items-center rounded-full border border-[#2e2e2e] bg-[#141414] px-2.5 py-0.5 text-xs font-medium text-[#8f8f8f]">
      Disconnected
    </span>
  );
}
