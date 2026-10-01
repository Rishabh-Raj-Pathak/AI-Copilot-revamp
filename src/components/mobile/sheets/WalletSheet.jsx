import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { AppListGroup, AppListRow } from "../AppList.jsx";
import { appIcons, appImages } from "../mobileAssets.js";
import { useAppToast } from "../appToastContext.js";
import { copyText } from "../../../lib/clipboard.js";
import { truncateAddress, WALLET_CHAIN } from "../../../lib/wallet.js";

/** Figma "Profile / Wallet Menu — Open" → Wallet Sheet (1038:5189). */
export default function WalletSheet({ open, onClose, address, onOpenProfile, onDisconnect }) {
  const toast = useAppToast();
  return (
    <BottomSheet open={open} onClose={onClose} title="Wallet">
      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="flex w-full items-center gap-3 rounded-xl border border-app-line bg-app-bg py-3.5 pl-4 pr-3">
          <img alt="" src={appImages.walletAvatar} className="size-10 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate font-app-mono text-app-button font-medium text-ink">
              {truncateAddress(address, { head: 6, tail: 6 })}
            </p>
            <p className="text-app-caption text-ink-subtle">{WALLET_CHAIN.label} · Connected</p>
          </div>
          <button
            type="button"
            aria-label="Copy address"
            onClick={async () => {
              const copied = await copyText(address);
              toast.show(
                copied
                  ? { title: "Address copied" }
                  : { title: "Couldn't copy address", tone: "error" },
              );
            }}
            className="app-pressable flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-app-subtle text-ink"
          >
            <AppIcon src={appIcons.copy16} size={16} />
          </button>
        </div>
        <AppListGroup>
          <AppListRow
            icon={appIcons.userRound20}
            label="Profile"
            showChevron
            onClick={() => {
              onClose?.();
              onOpenProfile?.();
            }}
          />
          <AppListRow
            icon={appIcons.logout20}
            label="Disconnect"
            onClick={() => {
              onClose?.();
              onDisconnect?.();
            }}
          />
        </AppListGroup>
      </div>
    </BottomSheet>
  );
}
