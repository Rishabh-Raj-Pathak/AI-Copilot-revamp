import BottomSheet from "../BottomSheet.jsx";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";

const NETWORKS = [
  {
    id: "evm",
    label: "EVM",
    description: "MetaMask, Backpack, Coinbase Wallet and other EVM wallets",
    icon: appIcons.networkEvm,
  },
  {
    id: "solana",
    label: "Solana",
    description: "Phantom, Backpack, Solflare and other Solana wallets",
    icon: appIcons.networkSolana,
  },
  {
    id: "aptos",
    label: "Aptos",
    description: "Petra, Martian and other Aptos wallets",
    icon: appIcons.networkAptos,
  },
];

/**
 * Figma "Copilot / Connect — Choose Network" (944:2942).
 *
 * The prototype has no wallet SDK, so picking a network completes the mock
 * connection — the same thing the desktop Connect button does.
 */
export default function ConnectNetworkSheet({ open, onClose, onSelect }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Choose a network">
      <div className="flex flex-col gap-3 px-4 pt-4">
        <p className="text-app-callout leading-[19.2px] tracking-[0.16px] text-ink-muted">
          Select the network of the wallet you want to connect.
        </p>
        <div className="flex flex-col gap-2">
          {NETWORKS.map((network) => (
            <button
              key={network.id}
              type="button"
              onClick={() => onSelect?.(network.id)}
              className="app-pressable flex w-full items-center gap-3 rounded-xl border border-app-line bg-app-bg px-4 py-3.5 text-left active:bg-white/[0.03]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-app-line">
                <img alt="" src={network.icon} className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-app-headline font-semibold text-ink">{network.label}</span>
                <span className="text-app-caption text-ink-muted">{network.description}</span>
              </span>
              <AppIcon src={appIcons.chevronRight16} size={16} className="text-ink-subtle" />
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
