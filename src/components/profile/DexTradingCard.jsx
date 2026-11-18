import { Check, Loader2 } from "lucide-react";
import { useProfile } from "./ProfileContext.jsx";
import { DEX_TRADING_VENUES, useDexTradingAction } from "./dexTrading.js";

/**
 * Every DEX HyprEarn trades on, and whether the user has enabled trading there.
 *
 * Built on `ConnectionsCard`'s frame (header band over the rows), and the rows
 * are `ConnectRow`'s black hairline boxes. Two columns from `xl`: one column
 * there strands each row's buttons a screen away from the DEX they act on, and
 * a narrow single column leaves the card's right half empty under the
 * full-width Wallet & X card above it.
 *
 * Right side of a row, per the brief: not enabled → "Enable trading"; enabled →
 * "Revoke" plus a "Connected" badge where the enable button was. A DEX with
 * nothing approved has nothing to revoke, so it gets no Revoke button.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} [props.onNotify]
 */
export default function DexTradingCard({ onNotify }) {
  const { dexTrading, enableDexTrading, revokeDexTrading } = useProfile();

  return (
    <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
      <header className="border-b border-[#242424] pb-3.5 sm:pb-4">
        <h2 className="text-base font-semibold text-white">DEX trading</h2>
        <p className="mt-1 max-w-2xl text-sm text-[#929292]">
          Enabling trading approves HyprEarn&apos;s agent wallet on that DEX, so your
          copilot can place orders there. It can&apos;t withdraw funds, and you can
          revoke it at any time.
        </p>
      </header>

      <ul className="mt-4 grid gap-2 sm:mt-5 xl:grid-cols-2">
        {DEX_TRADING_VENUES.map((venue) => (
          <DexRow
            key={venue.id}
            venue={venue}
            enabled={Boolean(dexTrading[venue.id])}
            onEnable={enableDexTrading}
            onRevoke={revokeDexTrading}
            onNotify={onNotify}
          />
        ))}
      </ul>
    </section>
  );
}

function DexRow({ venue, enabled, onEnable, onRevoke, onNotify }) {
  const { pending, enable, revoke } = useDexTradingAction({
    venue,
    onEnable,
    onRevoke,
    onNotify,
  });
  const busy = pending !== null;

  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-[#242424] bg-black py-2 pr-2 pl-3">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#242424] bg-[#0f0f0f]">
        <img alt="" src={venue.logo} className="max-h-[18px] max-w-[18px] object-contain" />
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {venue.label}
      </span>

      {enabled ? (
        <>
          <button
            type="button"
            onClick={revoke}
            disabled={busy}
            aria-busy={pending === "revoke" || undefined}
            aria-label={`Revoke trading on ${venue.label}`}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-[#242424] bg-[#0f0f0f] px-3 text-sm font-medium text-white transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === "revoke" ? (
              <>
                <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                Revoking…
              </>
            ) : (
              "Revoke"
            )}
          </button>

          <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#1e5a3f] bg-[#0d2019] px-2.5 py-0.5 text-xs font-medium text-[#00f3b6]">
            <Check className="size-3" strokeWidth={2.5} aria-hidden />
            Connected
          </span>
        </>
      ) : (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          aria-busy={pending === "enable" || undefined}
          aria-label={`Enable trading on ${venue.label}`}
          className="flex h-8 min-w-32 shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#242424] bg-[#0f0f0f] px-3 text-sm font-medium text-white transition-colors hover:border-[#454545] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "enable" ? (
            <>
              <Loader2 className="size-3.5 shrink-0 animate-spin text-[#00f3b6]" aria-hidden />
              Enabling…
            </>
          ) : (
            "Enable trading"
          )}
        </button>
      )}
    </li>
  );
}
