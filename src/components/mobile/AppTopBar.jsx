import { useState } from "react";
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
        <button
          type="button"
          aria-label="HyprEarn home"
          onClick={() => app.navigate("copilot")}
          className="app-pressable flex size-[25px] shrink-0 items-center justify-center"
          data-tour="copilot-overview"
        >
          <img alt="" src={appImages.hyprEarnMark} className="h-[25px] w-[19px]" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSheet("venue")}
            aria-label={`Venue: ${venue.label}. Change venue`}
            aria-haspopup="dialog"
            data-tour="dex-selector"
            className="app-pressable flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-app-surface py-[3px] pl-[3px] pr-2 text-ink"
          >
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-[rgba(0,239,168,0.5)] bg-app-raised">
              <img alt="" src={venue.logo} className="max-h-5 max-w-5 object-contain" />
            </span>
            <AppIcon src={appIcons.chevronDown16} size={16} />
          </button>

          <button
            type="button"
            onClick={() => setSheet("points")}
            aria-label="HyprEarn points"
            aria-haspopup="dialog"
            className="app-pressable flex shrink-0 items-center gap-1.5 rounded-full border border-app-line-points bg-app-points py-[3px] pl-[3px] pr-3"
          >
            <img alt="" src={appImages.coinBronze} className="size-7 rounded-full object-contain" />
            <span className="text-app-headline font-medium leading-none text-ink">
              {formatPoints(app.pointsBalance)}
            </span>
          </button>

          <div data-tour="wallet-connect" className="min-w-0 shrink">
            {app.walletConnected ? (
              <button
                type="button"
                onClick={() => setSheet("wallet")}
                aria-haspopup="dialog"
                className="app-pressable flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-app-line bg-app-surface px-2 text-ink"
              >
                <img alt="" src={appImages.walletAvatar} className="size-5 shrink-0" />
                <span className="truncate text-app-body font-medium leading-none">
                  {truncateAddress(app.address, { head: 3, tail: 3 })}
                </span>
                <AppIcon src={appIcons.chevronDown16} size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSheet("connect")}
                aria-haspopup="dialog"
                className="app-pressable app-gradient-brand flex h-9 items-center justify-center rounded-lg px-3.5 text-app-body font-medium leading-[17px] text-black"
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
