import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, Copy, ExternalLink } from "lucide-react";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import CopilotMobileHeader from "../terminal/CopilotMobileHeader.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import { Toast, ToastViewport } from "../ui/toast.jsx";
import { copyText } from "../../lib/clipboard.js";
import {
  MOCK_WALLET_ADDRESS,
  WALLET_CHAIN,
  addressExplorerUrl,
  truncateAddress,
} from "../../lib/wallet.js";
import ConnectionsCard from "./ConnectionsCard.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileChecklistCard from "./ProfileChecklistCard.jsx";
import ProfileCompleteModal from "./ProfileCompleteModal.jsx";
import ProfileHeaderCard from "./ProfileHeaderCard.jsx";
import { useProfile } from "./ProfileContext.jsx";

const FEEDBACK_MS = 2000;

/** Wallet session detail + profile completion. No backend behind any of it. */
export default function ProfilePage({
  address = MOCK_WALLET_ADDRESS,
  onBack,
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
  onOpenTrade,
  onVaultViewChange,
}) {
  const { progress } = useProfile();
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const resetTimer = useRef(null);
  const toastTimer = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
      window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const notify = useCallback((message, variant = "success") => {
    setToast({ message, variant });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), FEEDBACK_MS);
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(address);
    setCopied(ok);
    notify(
      ok ? "Wallet address copied" : "Couldn't copy address",
      ok ? "success" : "error",
    );
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), FEEDBACK_MS);
  };

  const short = truncateAddress(address);
  const walletHeaderProps = {
    walletConnected,
    onWalletConnected,
    onWalletDisconnect,
    onOpenProfile,
    terminalPlatform,
    onTerminalPlatformChange,
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <CopilotMobileHeader {...walletHeaderProps} />
      <HeaderTerminal
        {...walletHeaderProps}
        activeNavItem="Profile"
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Trade") onOpenTrade?.();
        }}
        showCopilotTutorial={false}
      />

      <main className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="flex items-center gap-3 border-b border-[#242424] px-3 py-4 sm:gap-4 sm:px-5">
          <button
            type="button"
            onClick={() => onBack?.()}
            aria-label="Back"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="size-6" strokeWidth={2} aria-hidden />
          </button>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">
            My Profile
          </h1>
        </div>

        <div className="flex flex-col gap-4 px-3 py-5 sm:px-5">
          <ProfileHeaderCard />
          <ProfileChecklistCard onNotify={notify} />

          <section className="rounded-xl border border-[#242424] bg-[#0f0f0f] p-4 sm:p-5">
            <h2 className="text-base font-semibold text-white">
              Wallet Address
            </h2>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <ProfileAvatar seed={address} size="sm" />
                <span className="truncate text-sm text-white sm:text-base">
                  {short}
                </span>
                <span className="shrink-0 rounded-full border border-[#454545] px-2.5 py-0.5 text-xs text-[#bfbfbf]">
                  {WALLET_CHAIN.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {short}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy wallet address"
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {copied ? (
                      <Check
                        className="size-4 text-[#00f3b6]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : (
                      <Copy className="size-4" strokeWidth={2} aria-hidden />
                    )}
                  </button>
                </div>

                <span
                  className="hidden h-5 w-px bg-[#242424] sm:block"
                  aria-hidden
                />

                <a
                  href={addressExplorerUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                >
                  View on {WALLET_CHAIN.explorerName}
                  <ExternalLink
                    className="size-4 shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                </a>
              </div>
            </div>
          </section>

          {/* Until the checklist is done it hosts the connect step inline;
              showing the card as well would duplicate the same controls. */}
          {progress.isComplete ? <ConnectionsCard onNotify={notify} /> : null}
        </div>
      </main>

      <CopilotBottomNav
        activeId="profile"
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onNavClick={(id) => {
          if (id === "copilot") onOpenCopilot?.();
          if (id === "trade") onOpenTrade?.();
        }}
      />

      <ProfileCompleteModal />

      {toast ? (
        <ToastViewport>
          <Toast variant={toast.variant}>{toast.message}</Toast>
        </ToastViewport>
      ) : null}
    </div>
  );
}
