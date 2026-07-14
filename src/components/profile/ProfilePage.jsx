import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import CopilotMobileHeader from "../terminal/CopilotMobileHeader.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import { Toast, ToastViewport } from "../ui/toast.jsx";
import ConnectionsCard from "./ConnectionsCard.jsx";
import ProfileChecklistCard from "./ProfileChecklistCard.jsx";
import ProfileCompleteModal from "./ProfileCompleteModal.jsx";
import ProfileIdentityCard from "./ProfileIdentityCard.jsx";
import { useProfile } from "./ProfileContext.jsx";

const FEEDBACK_MS = 2000;

/** Wallet session detail + profile completion. No backend behind any of it. */
export default function ProfilePage({
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
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify = useCallback((message, variant = "success") => {
    setToast({ message, variant });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), FEEDBACK_MS);
  }, []);

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

      {/* Full-bleed, on the gutter scale every other page uses (see `VaultsPage`):
          16px on mobile, stepping up to 48px on a wide desktop. The title bar
          shares it, so the back arrow sits on the same line as the card edges. */}
      <main className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="border-b border-[#242424]">
          <div className="flex w-full items-center gap-4 px-5 py-4 max-tablet:gap-2 max-tablet:px-4 max-tablet:py-3.5 sm:px-8 lg:px-10 xl:px-12">
            <button
              type="button"
              onClick={() => onBack?.()}
              aria-label="Back"
              className="-ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white sm:size-9"
            >
              <ChevronLeft className="size-6" strokeWidth={2} aria-hidden />
            </button>
            <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">
              My Profile
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 px-5 py-8 pb-16 max-tablet:gap-4 max-tablet:px-4 max-tablet:py-5 max-tablet:pb-4 sm:px-8 lg:px-10 xl:px-12">
          <ProfileIdentityCard onNotify={notify} />
          <ProfileChecklistCard onNotify={notify} />

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
