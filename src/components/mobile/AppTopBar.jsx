import { useState } from "react";
import { Wallet } from "lucide-react";
import AppScreenTitle from "./AppScreenTitle.jsx";
import { appImages } from "./mobileAssets.js";
import { useMobileApp } from "./MobileAppContext.js";
import { venueById } from "./venues.js";
import { truncateAddress } from "../../lib/wallet.js";
import VenueSheet from "./sheets/VenueSheet.jsx";
import PointsSheet from "./sheets/PointsSheet.jsx";
import { formatPoints } from "./pointsData.js";
import ConnectNetworkSheet from "./sheets/ConnectNetworkSheet.jsx";
import WalletSheet from "./sheets/WalletSheet.jsx";

/** 32px soft control (Figma "Venue" / "Points" / "Wallet"): #1c1c1f, 6% white edge. */
const CONTROL =
  "app-pressable relative flex h-8 shrink-0 items-center rounded-full border border-white/[0.06] bg-app-control text-ink before:absolute before:content-[''] active:bg-white/[0.1]";

/**
 * The one phone screen header — Figma "Copilot Header" signed out (1227:13431)
 * and signed in (1189:11730), used by every tab so they all read the same:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ Title ⌄                 (◉) (● 0) [Connect]│  56px, 20px gutters
 *   │ meta                                     │  signed in: (◉) (● 77.62) (▣)
 *   │ [children — e.g. header tabs]            │  optional row
 *   └──────────────────────────────────────────┘  1px hairline
 *
 * Left: `leading` (a custom title, e.g. Copilot's strategy menu), else
 * `title` + `meta` (+ `onTitlePress` makes it a title menu), else the brand
 * mark. Right: venue, points, then Connect — or, once connected, the Lucide
 * `Wallet` icon; the address is one tap away in the Wallet sheet. Each control
 * opens its bottom sheet. Gutters drop to 16px and the title to 15px under
 * 375px. Phone only — the desktop header is `HeaderTerminal`.
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
  title,
  meta,
  onTitlePress,
  titleExpanded = false,
  titleLabel,
  children = null,
}) {
  const app = useMobileApp();
  const [sheet, setSheet] = useState(null);
  const close = () => setSheet(null);
  const venue = venueById(app.terminalPlatform);
  const changeVenue = onTerminalPlatformChange ?? app.setTerminalPlatform;
  const connect = onWalletConnected ?? app.connectWallet;
  const disconnect = onWalletDisconnect ?? app.disconnectWallet;
  const openProfile = onOpenProfile ?? (() => app.navigate("profile"));

  const left =
    leading ??
    (title ? (
      <AppScreenTitle
        title={title}
        meta={meta}
        onPress={onTitlePress}
        expanded={titleExpanded}
        ariaLabel={titleLabel}
      />
    ) : (
      <button
        type="button"
        aria-label="HyprEarn home"
        onClick={() => app.navigate("copilot")}
        className="app-pressable flex size-[25px] shrink-0 items-center justify-center"
        data-tour="copilot-overview"
      >
        <img alt="" src={appImages.hyprEarnMark} className="h-[25px] w-[19px]" />
      </button>
    ));

  return (
    <>
      {/* proportional-nums: Figma's figures; without it the Copilot screen's
          trading scope makes the points pill wider than on every other tab. */}
      <header
        className={`shrink-0 border-b border-app-line bg-app-bg pt-[env(safe-area-inset-top)] proportional-nums tablet:hidden ${className}`}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-5 max-[374px]:px-4">
          {left}

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSheet("venue")}
              aria-label={`Venue: ${venue.label}. Change venue`}
              aria-haspopup="dialog"
              data-tour="dex-selector"
              className={`${CONTROL} w-8 justify-center before:-inset-1.5`}
            >
              <img alt="" src={venue.logo} className="max-h-4 max-w-4 object-contain" />
            </button>

            <button
              type="button"
              onClick={() => setSheet("points")}
              aria-label={`HyprEarn points: ${formatPoints(app.pointsBalance)}`}
              aria-haspopup="dialog"
              className={`${CONTROL} gap-[5px] pl-1 pr-2.5 before:inset-x-0 before:-inset-y-1.5`}
            >
              <img alt="" src={appImages.coinBronze} className="size-[22px] rounded-full object-contain" />
              <span className="text-app-callout font-medium leading-4">
                {formatPoints(app.pointsBalance)}
              </span>
            </button>

            <div data-tour="wallet-connect" className="shrink-0">
              {app.walletConnected ? (
                <button
                  type="button"
                  onClick={() => setSheet("wallet")}
                  aria-haspopup="dialog"
                  aria-label={`Wallet ${truncateAddress(app.address, { head: 3, tail: 3 })}. Open wallet`}
                  className={`${CONTROL} w-8 justify-center before:-inset-1.5`}
                >
                  <Wallet size={16} aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSheet("connect")}
                  aria-haspopup="dialog"
                  className="app-pressable app-gradient-brand relative flex h-8 items-center rounded-full px-3.5 text-app-callout font-medium leading-4 text-black before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {children}
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
