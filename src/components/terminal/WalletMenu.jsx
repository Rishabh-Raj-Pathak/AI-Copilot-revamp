import { useEffect, useId, useRef, useState } from "react";
import { CircleUserRound, LogOut } from "lucide-react";
import { terminalAssets as a } from "../../figma/terminalAssets.js";
import { MOCK_WALLET_ADDRESS, truncateAddress } from "../../lib/wallet.js";
import ProfileProgressRing from "../profile/ProfileProgressRing.jsx";
import { useProfile } from "../profile/ProfileContext.jsx";

function NavChevron({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function WalletGlyph() {
  return (
    <span className="relative size-4 shrink-0">
      <img
        alt=""
        className="absolute inset-0 size-full max-w-none p-[16.67%]"
        src={a.walletIcon}
      />
    </span>
  );
}

const MENU_ITEM_CLASS =
  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-white/[0.06]";

/**
 * Connected-wallet trigger + menu (Profile, Disconnect) shown in the navbar
 * once a wallet session exists.
 *
 * @param {object} props
 * @param {string} [props.address]
 * @param {'desktop'|'mobile'} [props.variant]
 * @param {() => void} [props.onOpenProfile]
 * @param {() => void} [props.onDisconnect]
 */
export default function WalletMenu({
  address = MOCK_WALLET_ADDRESS,
  variant = "desktop",
  onOpenProfile,
  onDisconnect,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const isMobile = variant === "mobile";
  const { progress } = useProfile();
  /** The ring is a nudge, so it only appears while there's something to nudge about. */
  const showProgress = !progress.isComplete;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const pick = (action) => {
    setOpen(false);
    action?.();
  };

  const label = isMobile
    ? truncateAddress(address)
    : truncateAddress(address, { head: 5, tail: 6, separator: " ... " });

  const triggerClass = isMobile
    ? "flex max-w-[11rem] items-center gap-1.5 rounded-md border border-[#242424] px-2.5 py-2 text-xs font-medium text-white hover:bg-white/5"
    : "flex items-center gap-1.5 rounded-md border border-[#242424] px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label={`Wallet ${address}`}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        {showProgress ? (
          <ProfileProgressRing percent={progress.percent} size={22}>
            <WalletGlyph />
          </ProfileProgressRing>
        ) : (
          <WalletGlyph />
        )}
        <span className="truncate">{label}</span>
        <NavChevron
          className={`size-4 shrink-0 text-[#757575] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Wallet"
          className="absolute right-0 top-full z-[120] mt-1.5 min-w-[13rem] overflow-hidden rounded-lg border border-[#242424] bg-black py-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => pick(onOpenProfile)}
            className={MENU_ITEM_CLASS}
          >
            <CircleUserRound
              className="size-[18px] shrink-0 text-[#bfbfbf]"
              aria-hidden
            />
            Profile
            {showProgress ? (
              <span className="ml-auto shrink-0 rounded-full border border-[#3e2e00] bg-[#171200] px-1.5 py-0.5 text-[10px] font-semibold text-[#f2b500]">
                {progress.completedCount}/{progress.totalCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => pick(onDisconnect)}
            className={MENU_ITEM_CLASS}
          >
            <LogOut
              className="size-[18px] shrink-0 text-[#bfbfbf]"
              aria-hidden
            />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
