import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import { useProfile } from "../../profile/ProfileContext.jsx";
import { DEX_TRADING_VENUES, useDexTradingAction } from "../../profile/dexTrading.js";
import { Card, DividedRows, Pill, Section } from "./profileUi.jsx";

/**
 * Phone counterpart of the desktop `DexTradingCard`: same venues, same record
 * (`ProfileContext.dexTrading`), laid out as a "LINKED ACCOUNTS"-style card.
 *
 * Not enabled → "Enable trading" (the X row's Connect button).
 * Enabled → "Revoke" plus the positive "Connected" pill where that button was.
 *
 * @param {object} props
 * @param {(message: string, variant?: 'success'|'error') => void} props.onNotify
 */
export default function MobileDexTrading({ onNotify }) {
  const { dexTrading, enableDexTrading, revokeDexTrading } = useProfile();

  return (
    <Section label="DEX TRADING">
      <Card>
        {/* Inset to the name: 16px row padding + 36px logo + 12px gap. */}
        <DividedRows inset="pl-16">
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
        </DividedRows>
      </Card>
      <p className="px-1 text-app-caption leading-[17px] text-ink-faint">
        Enabling trading approves HyprEarn&apos;s agent wallet on that DEX, so your copilot
        can place orders there. It can&apos;t withdraw funds.
      </p>
    </Section>
  );
}

/**
 * Both buttons share the X row's 32px height and the hit-area bleed, and both
 * carry its outlined Connect look: a bare-text Revoke read as disabled.
 */
const BUTTON =
  "app-pressable relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-app-callout font-medium leading-[normal] before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-[''] disabled:pointer-events-none disabled:opacity-60";

function DexRow({ venue, enabled, onEnable, onRevoke, onNotify }) {
  const { pending, enable, revoke } = useDexTradingAction({
    venue,
    onEnable,
    onRevoke,
    onNotify,
  });
  const busy = pending !== null;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-app-line bg-app-raised">
        <img alt="" src={venue.logo} className="max-h-[22px] max-w-[22px] object-contain" />
      </span>

      <p className="min-w-0 flex-1 truncate text-app-body font-medium leading-[normal] text-ink">
        {venue.label}
      </p>

      {enabled ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={revoke}
            disabled={busy}
            aria-busy={pending === "revoke" || undefined}
            aria-label={`Revoke trading on ${venue.label}`}
            className={`${BUTTON} border border-app-line-strong bg-app-subtle text-ink`}
          >
            {pending === "revoke" ? (
              <AppIcon src={appIcons.loader16} size={14} className="animate-spin" />
            ) : null}
            Revoke
          </button>
          <Pill tone="positive">Connected</Pill>
        </div>
      ) : (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          aria-busy={pending === "enable" || undefined}
          aria-label={`Enable trading on ${venue.label}`}
          className={`${BUTTON} border border-app-line-strong bg-app-subtle text-ink`}
        >
          {pending === "enable" ? (
            <AppIcon src={appIcons.loader16} size={14} className="animate-spin" />
          ) : null}
          Enable trading
        </button>
      )}
    </div>
  );
}
