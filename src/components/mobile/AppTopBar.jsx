import { useState } from "react";
import { Wallet } from "lucide-react";
import AppIcon from "./AppIcon.jsx";
import { appIcons, appImages } from "./mobileAssets.js";
import { useMobileApp } from "./MobileAppContext.js";
import { venueById } from "./venues.js";
import { truncateAddress } from "../../lib/wallet.js";
import VenueSheet from "./sheets/VenueSheet.jsx";
import PointsSheet from "./sheets/PointsSheet.jsx";
import { formatPoints } from "./pointsData.js";
import ConnectNetworkSheet from "./sheets/ConnectNetworkSheet.jsx";
import WalletSheet from "./sheets/WalletSheet.jsx";

/**
 * Figma "Top Bar" (936:1112) / "Top Bar / Connected" (1036:5080).
 *
 * Brand mark on the left; venue switcher, points and Connect (or the wallet
 * chip once connected) on the right. Each control opens its bottom sheet.
 * 56px tall under the status-bar safe area; the device draws the status bar.
 *
 * Phone only — the desktop header is `HeaderTerminal`.
 *
 * `leading` swaps the brand mark for a screen's own title (the Copilot screen
 * puts its strategy picker there, so the top bar and screen header read as one
 * bar). `compact` trims the right cluster to make room for it: the venue chip
 * drops its chevron, points shrink, and the wallet chip becomes just its
 * icon — the full address is one tap away in the Wallet sheet.
 *
 * Connected state shows the Lucide `Wallet` icon (not the gradient avatar,
 * which stays as the identity picture in the Wallet sheet and Profile).
 *
 * Session state comes from the shell context. A page that needs its own side
 * effects on a change (the copilot tour re-anchors on a venue switch) passes
 * the matching handler, which is called instead of the context default.
 */
export default function AppTopBar({
  className = "",
  onTerminalPlatformChange,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  leading = null,
  compact = false,
}) {
  const app = useMobileApp();
  const [sheet, setSheet] = useState(null);
  const close = () => setSheet(null);
  const venue = venueById(app.terminalPlatform);
  const changeVenue = onTerminalPlatformChange ?? app.setTerminalPlatform;
  const connect = onWalletConnected ?? app.connectWallet;
  const disconnect = onWalletDisconnect ?? app.disconnectWallet;
  const openProfile = onOpenProfile ?? (() => app.navigate("profile"));

  return (
    <>
      <header
        className={`flex h-[var(--app-top-bar-h)] shrink-0 items-center justify-between gap-2 border-b border-app-line bg-app-bg px-4 pt-[env(safe-area-inset-top)] tablet:hidden ${className}`}
      >
        {leading ?? (
          <button
            type="button"
            aria-label="HyprEarn home"
            onClick={() => app.navigate("copilot")}
            className="app-pressable flex size-[25px] shrink-0 items-center justify-center"
            data-tour="copilot-overview"
          >
            <img alt="" src={appImages.hyprEarnMark} className="h-[25px] w-[19px]" />
          </button>
        )}

        <div className={`flex min-w-0 shrink-0 items-center ${compact ? "gap-1.5" : "gap-2"}`}>
          <button
            type="button"
            onClick={() => setSheet("venue")}
            aria-label={`Venue: ${venue.label}. Change venue`}
            aria-haspopup="dialog"
            data-tour="dex-selector"
            className={
              compact
                ? "app-pressable relative flex size-8 shrink-0 items-center justify-center rounded-full border border-app-line bg-app-surface before:absolute before:-inset-1.5 before:content-['']"
                : "app-pressable flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-app-surface py-[3px] pl-[3px] pr-2 text-ink"
            }
          >
            <span
              className={`flex items-center justify-center overflow-hidden rounded-full bg-app-raised ${
                compact ? "size-[26px]" : "size-7 border border-[rgba(0,239,168,0.5)]"
              }`}
            >
              <img alt="" src={venue.logo} className={compact ? "max-h-4 max-w-4 object-contain" : "max-h-5 max-w-5 object-contain"} />
            </span>
            {compact ? null : <AppIcon src={appIcons.chevronDown16} size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setSheet("points")}
            aria-label={`HyprEarn points: ${formatPoints(app.pointsBalance)}`}
            aria-haspopup="dialog"
            className={
              compact
                ? "app-pressable relative flex h-8 shrink-0 items-center gap-1 rounded-full border border-app-line bg-app-surface pl-1 pr-2.5 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']"
                : "app-pressable flex shrink-0 items-center gap-1.5 rounded-full border border-app-line-points bg-app-points py-[3px] pl-[3px] pr-3"
            }
          >
            <img
              alt=""
              src={appImages.coinBronze}
              className={`rounded-full object-contain ${compact ? "size-[22px]" : "size-7"}`}
            />
            <span
              className={`font-medium leading-none text-ink ${compact ? "text-app-callout" : "text-app-headline"}`}
            >
              {formatPoints(app.pointsBalance)}
            </span>
          </button>

          <div data-tour="wallet-connect" className="min-w-0 shrink">
            {app.walletConnected ? (
              compact ? (
                <button
                  type="button"
                  onClick={() => setSheet("wallet")}
                  aria-haspopup="dialog"
                  aria-label={`Wallet ${truncateAddress(app.address, { head: 3, tail: 3 })}. Open wallet`}
                  className="app-pressable relative flex size-8 items-center justify-center rounded-full border border-app-line bg-app-surface text-ink before:absolute before:-inset-1.5 before:content-['']"
                >
                  <Wallet size={16} aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSheet("wallet")}
                  aria-haspopup="dialog"
                  className="app-pressable flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-app-line bg-app-surface px-2 text-ink"
                >
                  <Wallet size={16} aria-hidden className="shrink-0" />
                  <span className="truncate text-app-body font-medium leading-none">
                    {truncateAddress(app.address, { head: 3, tail: 3 })}
                  </span>
                  <AppIcon src={appIcons.chevronDown16} size={16} />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => setSheet("connect")}
                aria-haspopup="dialog"
                className={`app-pressable app-gradient-brand flex items-center justify-center font-medium text-black ${
                  compact
                    ? "relative h-8 rounded-full px-3.5 text-app-callout before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']"
                    : "h-9 rounded-lg px-3.5 text-app-body leading-[17px]"
                }`}
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </header>

      <VenueSheet
        open={sheet === "venue"}
        onClose={close}
        value={venue.id}
        onChange={changeVenue}
      />
      <PointsSheet open={sheet === "points"} onClose={close} balance={app.pointsBalance} />
      <ConnectNetworkSheet
        open={sheet === "connect"}
        onClose={close}
        onSelect={() => {
          close();
          connect();
        }}
      />
      <WalletSheet
        open={sheet === "wallet"}
        onClose={close}
        address={app.address}
        onOpenProfile={openProfile}
        onDisconnect={disconnect}
      />
    </>
  );
}
