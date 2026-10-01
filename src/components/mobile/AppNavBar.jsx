import AppIcon from "./AppIcon.jsx";
import { appIcons } from "./mobileAssets.js";
import { useMobileApp } from "./MobileAppContext.js";

/**
 * Figma "Nav Bar / Back" (994:16833): back chevron, centred 16px title,
 * 44px balancing slot on the right. Used on pushed screens (Compete, Points,
 * Profile, Delete account) instead of the top bar.
 *
 * `onBack` defaults to the shell's back stack, so it returns to whichever
 * screen the user came from.
 */
export default function AppNavBar({ title, onBack, trailing = null, className = "" }) {
  const app = useMobileApp();
  return (
    <header
      className={`flex h-[var(--app-top-bar-h)] shrink-0 items-center border-b border-app-line bg-app-bg px-2 pt-[env(safe-area-inset-top)] tablet:hidden ${className}`}
    >
      <button
        type="button"
        onClick={onBack ?? app.goBack}
        aria-label="Back"
        className="app-pressable flex size-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-white/[0.06]"
      >
        <AppIcon src={appIcons.back24} size={24} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-center text-app-headline font-semibold text-ink">
        {title}
      </h1>
      <div className="flex size-11 shrink-0 items-center justify-center">{trailing}</div>
    </header>
  );
}
