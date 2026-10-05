import { useState } from "react";
import AppButton from "../AppButton.jsx";
import AppIcon from "../AppIcon.jsx";
import AppNavBar from "../AppNavBar.jsx";
import { appIcons, appImages } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import { copyText } from "../../../lib/clipboard.js";
import { WALLET_CHAIN, addressExplorerUrl, truncateAddress } from "../../../lib/wallet.js";
import { useProfile } from "../../profile/ProfileContext.jsx";
import ConnectXSheet from "./ConnectXSheet.jsx";
import { ActionRow, Card, DividedRows, Pill, Section } from "./profileUi.jsx";

/**
 * Figma "Profile / Connected" (1037:5109) and "Profile / Connected · X Not
 * Linked" (1039:5378). Reached from the wallet chip → Wallet sheet → Profile.
 *
 * Wallet and chain come from the shell; the X link from `ProfileContext`, so it
 * is the same record the desktop profile and checklist read.
 */
export default function MobileProfilePage() {
  const app = useMobileApp();
  const toast = useAppToast();
  const { socials, connectSocial } = useProfile();
  const [sheet, setSheet] = useState(null);
  const closeSheet = () => setSheet(null);

  const notify = (message, variant = "success") =>
    toast.show({ title: message, tone: variant === "error" ? "error" : "success" });

  return (
    <div className="flex h-dvh flex-col bg-app-bg">
      <AppNavBar title="My Profile" />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        {app.walletConnected ? (
          <ConnectedProfile
            address={app.address}
            x={socials.x}
            onCopied={(ok) =>
              toast.show(
                ok ? { title: "Address copied" } : { title: "Couldn't copy address", tone: "error" },
              )
            }
            onConnectX={() => setSheet("x")}
            onDisconnect={app.disconnectWallet}
            onDelete={() => app.navigate("delete-account")}
          />
        ) : (
          <DisconnectedProfile onConnect={app.connectWallet} />
        )}
      </main>

      <ConnectXSheet
        open={sheet === "x"}
        onClose={closeSheet}
        onAuthorized={(account) => {
          closeSheet();
          connectSocial(account);
          notify(`X connected as ${account.handle}`);
        }}
      />
    </div>
  );
}

function ConnectedProfile({ address, x, onCopied, onConnectX, onDisconnect, onDelete }) {
  const xProfileUrl = x ? `https://x.com/${x.handle.replace(/^@/, "")}` : null;

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Identity */}
      <div className="flex w-full flex-col items-center gap-3">
        <span className="flex size-[82px] shrink-0 items-center justify-center rounded-full border border-app-line-strong">
          <img alt="" src={appImages.walletAvatar} className="size-[72px]" />
        </span>
        <div className="flex flex-col items-center gap-2">
          <p className="font-app-mono text-app-title font-medium leading-[normal] text-ink">
            {truncateAddress(address, { head: 6, tail: 6 })}
          </p>
          <Pill>{WALLET_CHAIN.label}</Pill>
        </div>
        <div className="flex w-full gap-2 pt-2">
          <QuickAction
            icon={appIcons.copy16}
            label="Copy address"
            onClick={async () => onCopied(await copyText(address))}
          />
          <QuickAction
            icon={appIcons.external16}
            label={`View on ${WALLET_CHAIN.explorerName}`}
            href={addressExplorerUrl(address)}
          />
        </div>
      </div>

      <Section label="LINKED ACCOUNTS">
        <Card>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-app-line bg-app-bg text-ink">
              <AppIcon src={appIcons.socialX16} size={16} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-app-body font-medium leading-[normal] text-ink">
                {x ? x.handle : "Connect X"}
              </p>
              <p className="truncate text-app-caption leading-[normal] text-ink-subtle">
                {x ? "X account" : "Link your X account"}
              </p>
            </div>
            {x ? (
              <>
                <Pill tone="positive">Connected</Pill>
                <a
                  href={xProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${x.handle} on X`}
                  className="-m-3.5 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-faint active:bg-white/[0.06]"
                >
                  <AppIcon src={appIcons.external16} size={16} />
                </a>
              </>
            ) : (
              <button
                type="button"
                onClick={onConnectX}
                aria-haspopup="dialog"
                className="app-pressable relative flex h-8 shrink-0 items-center rounded-lg border border-app-line-strong bg-app-subtle px-3.5 text-app-callout font-medium leading-[normal] text-ink before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-['']"
              >
                Connect
              </button>
            )}
          </div>
        </Card>
      </Section>

      <Section label="ACCOUNT">
        <Card>
          <DividedRows>
            <ActionRow icon={appIcons.logout20} label="Disconnect wallet" onClick={onDisconnect} />
            <ActionRow
              icon={appIcons.moreDelete}
              label="Delete account"
              destructive
              chevron
              onClick={onDelete}
            />
          </DividedRows>
        </Card>
        <p className="px-1 text-app-caption leading-[17px] text-ink-faint">
          Deleting your account permanently erases your HyprEarn profile, points and rewards.
          Funds in your wallet are never touched.
        </p>
      </Section>
    </div>
  );
}

/** Figma "Action / Copy address", "Action / View on Arbiscan". */
function QuickAction({ icon, label, onClick, href }) {
  const cls =
    "app-pressable flex min-w-0 flex-1 flex-col items-center gap-2 rounded-xl border border-app-line bg-app-surface px-2 py-3.5 active:bg-app-raised";
  const body = (
    <>
      <AppIcon src={icon} size={16} className="text-ink" />
      <span className="max-w-full truncate text-app-caption font-medium leading-[normal] text-ink-muted">
        {label}
      </span>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/** No session: the profile describes a wallet, so offer to connect one. */
function DisconnectedProfile({ onConnect }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
      <span className="flex size-[82px] items-center justify-center rounded-full border border-app-line-strong bg-app-subtle text-ink-subtle">
        <AppIcon src={appIcons.wallet20} size={28} />
      </span>
      <p className="text-app-headline font-semibold text-ink">No wallet connected</p>
      <p className="text-app-body leading-5 text-ink-muted">
        Connect a wallet to see your profile and linked accounts.
      </p>
      <AppButton variant="primary" className="mt-2" onClick={onConnect}>
        Connect wallet
      </AppButton>
    </div>
  );
}
