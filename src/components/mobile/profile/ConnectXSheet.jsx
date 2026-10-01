import { useEffect, useRef, useState } from "react";
import AppButton from "../AppButton.jsx";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { SOCIAL_PROVIDERS, startXAuthorization } from "../../profile/simulatedOAuth.js";
import { IconBadge } from "./profileUi.jsx";

const X = SOCIAL_PROVIDERS.x;

/**
 * The X link as a phone sheet: the same simulated OAuth round-trip the desktop
 * `ProfileSimpleCard` runs, with the "Authorizing on X…" wait shown in a sheet
 * instead of inline. Closing the sheet mid-flight cancels the authorization so
 * nothing resolves into the store afterwards.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(account: object) => void} props.onAuthorized
 */
export default function ConnectXSheet({ open, onClose, onAuthorized }) {
  const [pending, setPending] = useState(false);
  const cancelRef = useRef(null);

  const stop = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setPending(false);
  };

  // StrictMode double-invokes effects and the sheet can unmount mid-flight;
  // either way the timer must not outlive the component.
  useEffect(() => () => cancelRef.current?.(), []);

  const close = () => {
    stop();
    onClose?.();
  };

  const begin = () => {
    if (pending) return;
    setPending(true);
    cancelRef.current = startXAuthorization((account) => {
      cancelRef.current = null;
      setPending(false);
      onAuthorized?.(account);
    });
  };

  return (
    <BottomSheet open={open} onClose={close} title={X.connectLabel}>
      <div className="flex flex-col items-center gap-4 px-4 pb-2 pt-5">
        <IconBadge className="border border-app-line bg-app-subtle text-ink">
          <AppIcon src={appIcons.socialX16} size={22} />
        </IconBadge>
        <div className="flex w-full flex-col items-center gap-1.5 text-center">
          <p className="text-[17px] font-semibold leading-[normal] text-ink">Link your X account</p>
          <p className="text-app-body leading-5 text-ink-muted">{X.benefit}</p>
        </div>

        <div
          className={`flex items-center gap-2 ${pending ? "" : "invisible"}`}
          role="status"
          aria-live="polite"
        >
          <AppIcon src={appIcons.loader16} size={16} className="animate-spin text-app-accent" />
          <span className="text-app-callout font-medium leading-[normal] text-ink-muted">
            {pending ? X.pendingLabel : ""}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2">
          <AppButton variant="primary" className="!h-12" onClick={begin} aria-busy={pending}>
            {pending ? "Waiting for X…" : "Continue to X"}
          </AppButton>
          <AppButton variant="ghost" className="!h-12" onClick={close}>
            Cancel
          </AppButton>
        </div>
      </div>
    </BottomSheet>
  );
}
