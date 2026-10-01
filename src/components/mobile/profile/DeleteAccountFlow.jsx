import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppButton from "../AppButton.jsx";
import AppIcon from "../AppIcon.jsx";
import AppNavBar from "../AppNavBar.jsx";
import BottomSheet from "../BottomSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import { useHistoryBack } from "../appHistory.js";
import { truncateAddress } from "../../../lib/wallet.js";
import { useProfile } from "../../profile/ProfileContext.jsx";
import { createDeleteMessage, requestDeleteSignature } from "./deleteAccountMock.js";
import { Card, DividedRows, IconBadge, Section } from "./profileUi.jsx";

const CONFIRM_WORD = "DELETE";

/** Optional exit survey (Figma "Reason Card"). */
const LEAVE_REASONS = [
  "I don’t use HyprEarn anymore",
  "I have privacy concerns",
  "Trading didn’t go as expected",
  "I’m moving to another app",
  "Something else",
];

const KEPT = ["Your wallet and the funds in it", "Open positions on trading venues"];

const STEP_EASE = [0.32, 0.72, 0, 1];

/**
 * Figma "Delete Account / 1 Review" (1039:16649) → "2 Confirm" (1040:5490) →
 * "3 Sign in Wallet" (1040:5560, a sheet over step 2) → "4 Deleted" (1040:5668).
 *
 * Rules from the handoff notes (1041:16464): the delete button stays disabled
 * until DELETE is typed and the box is ticked; a rejected signature shows an
 * error toast and returns to step 2; the tab bar is hidden for the whole flow
 * (`App` drops it on this page); cancel is always one tap away.
 *
 * Back — the nav bar, Android back or an iOS swipe — steps back one screen
 * rather than leaving the flow, and from step 4 it finishes the flow the same
 * way "Back to HyprEarn" does: the account no longer exists to go back to.
 */
export default function DeleteAccountFlow() {
  const app = useMobileApp();
  const toast = useAppToast();
  const { socials, eraseProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [reason, setReason] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [signMessage, setSignMessage] = useState(null);
  const [signOpen, setSignOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const cancelSignRef = useRef(null);

  useEffect(() => () => cancelSignRef.current?.(), []);

  const needsWallet = !app.walletConnected && step !== 4;
  const address = truncateAddress(app.address, { head: 6, tail: 6 });

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const finish = () => {
    // Idempotent — the record was already erased when the signature landed.
    eraseProfile();
    app.disconnectWallet();
    app.navigate("copilot");
  };

  useHistoryBack(step === 2 && !needsWallet, () => go(1));
  useHistoryBack(step === 4, finish);

  const stopSigning = () => {
    cancelSignRef.current?.();
    cancelSignRef.current = null;
    setSigning(false);
  };

  const openSignSheet = () => {
    setSignMessage(createDeleteMessage(address));
    setSignOpen(true);
  };

  const cancelSignSheet = () => {
    stopSigning();
    setSignOpen(false);
  };

  const openWallet = () => {
    if (signing) return;
    setSigning(true);
    cancelSignRef.current = requestDeleteSignature({
      onSigned: () => {
        cancelSignRef.current = null;
        // The signature is the authorisation — this is the moment the backend
        // would erase the account, so the local record goes now.
        eraseProfile();
        setSigning(false);
        setSignOpen(false);
        go(4);
      },
      onRejected: () => {
        cancelSignRef.current = null;
        setSigning(false);
        setSignOpen(false);
        toast.show({
          tone: "error",
          title: "Signature rejected",
          message: "Your account was not deleted.",
        });
      },
    });
  };

  if (step === 4) return <DeletedScreen address={address} onDone={finish} />;

  const deleted = [
    socials.x ? "Your profile and linked X account" : "Your profile and linked accounts",
    "Points, tier and leaderboard rank",
    "Referral code and referral history",
    "Copilot history and saved preferences",
  ];

  return (
    <div className="flex h-dvh flex-col bg-app-bg">
      <AppNavBar
        title="Delete account"
        onBack={step === 2 && !needsWallet ? () => go(1) : app.goBack}
      />

      {step === 1 || needsWallet ? (
        <ReviewStep
          key="review"
          dir={dir}
          address={address}
          deleted={deleted}
          needsWallet={needsWallet}
          onContinue={() => go(2)}
          onConnect={app.connectWallet}
          onKeep={app.goBack}
        />
      ) : (
        <ConfirmStep
          key="confirm"
          dir={dir}
          reason={reason}
          onReason={setReason}
          confirmText={confirmText}
          onConfirmText={setConfirmText}
          acknowledged={acknowledged}
          onAcknowledged={setAcknowledged}
          onDelete={openSignSheet}
        />
      )}

      <SignSheet
        open={signOpen}
        address={address}
        message={signMessage}
        signing={signing}
        onOpenWallet={openWallet}
        onCancel={cancelSignSheet}
      />
    </div>
  );
}

/**
 * App toasts float 12px above the tab bar. The tab bar is hidden in this flow,
 * so while a footer is pinned, `--app-toast-bottom` lifts them above the footer
 * instead — otherwise the "Signature rejected" toast would sit on top of the
 * Delete button it is telling the user to press again.
 */
function useToastClearsFooter(footerRef) {
  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer || typeof ResizeObserver === "undefined") return undefined;
    const root = document.documentElement;
    const sync = () =>
      root.style.setProperty("--app-toast-bottom", `${footer.offsetHeight + 12}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(footer);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--app-toast-bottom");
    };
  }, [footerRef]);
}

/** Scrolling body + pinned footer; slides in from the side it came from. */
function StepFrame({ dir, footer, footerClassName = "gap-2", children }) {
  const reduceMotion = useReducedMotion();
  const footerRef = useRef(null);
  useToastClearsFooter(footerRef);
  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={reduceMotion ? false : { opacity: 0, x: 24 * dir }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.26, ease: STEP_EASE }}
    >
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</main>
      <footer
        ref={footerRef}
        className={`flex shrink-0 flex-col border-t border-app-line bg-app-bg px-4 pb-[var(--app-safe-bottom)] pt-3 ${footerClassName}`}
      >
        {footer}
      </footer>
    </motion.div>
  );
}

function CheckList({ items, icon, iconClassName }) {
  return (
    <Card as="ul" className="py-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 px-3.5 py-[9px]">
          <AppIcon src={icon} size={16} className={iconClassName} />
          <span className="min-w-0 flex-1 text-app-body leading-[normal] text-ink">{item}</span>
        </li>
      ))}
    </Card>
  );
}

/** Figma "Delete Account / 1 Review" — plus the no-wallet variant. */
function ReviewStep({ dir, address, deleted, needsWallet, onContinue, onConnect, onKeep }) {
  return (
    <StepFrame
      dir={dir}
      footer={
        <>
          {needsWallet ? (
            <AppButton variant="primary" onClick={onConnect}>
              Connect wallet
            </AppButton>
          ) : (
            <AppButton variant="destructive" onClick={onContinue}>
              Continue
            </AppButton>
          )}
          <AppButton variant="ghost" onClick={onKeep}>
            Keep my account
          </AppButton>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-4 pb-5 pt-4">
        <div className="flex flex-col items-center gap-2.5 pb-1 text-center">
          <IconBadge className="bg-app-negative-subtle text-app-sell">
            <AppIcon src={appIcons.trash24} size={24} />
          </IconBadge>
          <h2 className="text-[22px] font-semibold leading-[normal] text-ink">
            Delete your account?
          </h2>
          <p className="max-w-[320px] text-app-body leading-5 text-ink-muted">
            {needsWallet
              ? "Connect the wallet linked to your HyprEarn account to continue. Deleting it can’t be undone."
              : `This permanently erases the HyprEarn profile for ${address}. It can’t be undone.`}
          </p>
        </div>

        <Section label="WHAT GETS DELETED">
          <CheckList items={deleted} icon={appIcons.circleXLine16} iconClassName="text-app-sell" />
        </Section>

        <Section label="WHAT STAYS SAFE">
          <CheckList
            items={KEPT}
            icon={appIcons.circleCheckLine16}
            iconClassName="text-app-positive"
          />
        </Section>

        <div className="flex gap-2.5 rounded-xl border border-app-line-accent-subtle bg-app-accent-faint px-3.5 py-3">
          <AppIcon src={appIcons.moreRisk} size={16} className="text-app-accent" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-app-callout font-semibold leading-[normal] text-app-accent">
              Claim your rewards first
            </p>
            <p className="text-app-caption leading-[17px] text-ink-muted">
              Unclaimed referral rewards can’t be recovered once your account is deleted.
            </p>
          </div>
        </div>
      </div>
    </StepFrame>
  );
}

/** Figma "Delete Account / 2 Confirm". */
function ConfirmStep({
  dir,
  reason,
  onReason,
  confirmText,
  onConfirmText,
  acknowledged,
  onAcknowledged,
  onDelete,
}) {
  const headingId = useId();
  const inputId = useId();
  const ackId = useId();
  const typed = confirmText.trim() === CONFIRM_WORD;
  const canDelete = typed && acknowledged;

  return (
    <StepFrame
      dir={dir}
      footerClassName="items-center gap-2.5"
      footer={
        <>
          <AppButton variant="destructive" disabled={!canDelete} onClick={onDelete}>
            Delete account
          </AppButton>
          <p className="text-center text-app-caption leading-[17px] text-ink-faint">
            Next, you’ll sign a message in your wallet. It’s free and doesn’t move any funds.
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-6 px-4 py-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 pl-1">
            <h2 id={headingId} className="text-app-title font-semibold leading-[normal] text-ink">
              Why are you leaving?
            </h2>
            <p className="text-app-callout leading-[normal] text-ink-subtle">
              Optional — it helps us improve HyprEarn.
            </p>
          </div>
          <Card role="radiogroup" aria-labelledby={headingId}>
            <DividedRows>
              {LEAVE_REASONS.map((label) => {
                const checked = reason === label;
                return (
                  <label
                    key={label}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/[0.04]"
                  >
                    <input
                      type="radio"
                      name="delete-reason"
                      value={label}
                      checked={checked}
                      onChange={() => onReason(label)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-app-accent/40 ${
                        checked ? "border-2 border-app-accent" : "border-[1.5px] border-app-line-strong"
                      }`}
                    >
                      {checked ? <span className="size-2.5 rounded-full bg-app-accent" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 text-app-body leading-[normal] text-ink">
                      {label}
                    </span>
                  </label>
                );
              })}
            </DividedRows>
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={inputId}
            className="pl-1 text-app-callout font-medium leading-[normal] text-ink-muted"
          >
            Type <span className="font-semibold text-ink">{CONFIRM_WORD}</span> to confirm
          </label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-app-line-strong bg-app-surface pl-4 pr-3.5">
            {/* 16px, not Figma's 15px: anything smaller makes iOS zoom the page on focus. */}
            <input
              id={inputId}
              type="text"
              aria-label={`Type ${CONFIRM_WORD} to confirm`}
              value={confirmText}
              onChange={(e) => onConfirmText(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="h-full min-w-0 flex-1 bg-transparent font-app-mono text-[16px] font-medium leading-[normal] tracking-[1px] text-ink caret-app-accent outline-none"
            />
            {typed ? (
              <AppIcon
                src={appIcons.circleCheckLine16}
                size={16}
                className="text-app-positive"
                label="Confirmed"
              />
            ) : null}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 px-1 pt-2">
            <input
              type="checkbox"
              aria-labelledby={ackId}
              checked={acknowledged}
              onChange={(e) => onAcknowledged(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={`flex size-5 shrink-0 items-center justify-center rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-app-accent/40 ${
                acknowledged ? "bg-app-accent text-black" : "border-[1.5px] border-app-line-strong"
              }`}
            >
              {acknowledged ? <AppIcon src={appIcons.check12} size={12} /> : null}
            </span>
            <span id={ackId} className="min-w-0 flex-1 text-app-callout leading-[18px] text-ink-muted">
              I understand my profile, points and rewards will be permanently deleted and can’t be
              restored.
            </span>
          </label>
        </div>
      </div>
    </StepFrame>
  );
}

/** Figma "Sign Sheet" (1040:5631). */
function SignSheet({ open, address, message, signing, onOpenWallet, onCancel }) {
  return (
    <BottomSheet open={open} onClose={onCancel} title="Confirm in wallet">
      <div className="flex flex-col items-center gap-4 px-4 pt-5">
        <IconBadge className="border border-app-line bg-app-subtle text-ink">
          <AppIcon src={appIcons.penLine24} size={24} />
        </IconBadge>
        <div className="flex w-full flex-col items-center gap-1.5 text-center">
          <p className="text-[17px] font-semibold leading-[normal] text-ink">
            Sign to delete your account
          </p>
          <p className="text-app-body leading-5 text-ink-muted">
            Approve the signature request in your wallet to prove you own {address}.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 rounded-xl border border-app-line bg-app-bg px-3.5 py-3">
          <p className="text-app-label font-medium tracking-[0.04em] text-ink-faint">MESSAGE</p>
          <div className="font-app-mono text-app-caption font-normal leading-[18px] text-ink-muted">
            {message?.lines.map((line) => (
              <p key={line} className="break-words">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2" role="status">
          <AppIcon src={appIcons.loader16} size={16} className="animate-spin text-app-accent" />
          <span className="text-app-callout font-medium leading-[normal] text-ink-muted">
            Waiting for signature…
          </span>
        </div>

        <div className="flex w-full flex-col gap-2">
          <AppButton variant="primary" className="!h-12" onClick={onOpenWallet} aria-busy={signing}>
            {signing ? "Opening wallet…" : "Open wallet"}
          </AppButton>
          <AppButton variant="ghost" className="!h-12" onClick={onCancel}>
            Cancel
          </AppButton>
        </div>

        <p className="flex items-center gap-1.5 text-app-caption leading-[normal] text-ink-faint">
          <AppIcon src={appIcons.shieldCheck16} size={14} />
          Free — no transaction, no gas, no funds moved.
        </p>
      </div>
    </BottomSheet>
  );
}

/** Figma "Delete Account / 4 Deleted" — no nav bar, nothing to go back to. */
function DeletedScreen({ address, onDone }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex h-dvh flex-col bg-app-bg pt-[env(safe-area-inset-top)]">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 pb-10">
        <div className="m-auto flex w-full flex-col items-center gap-5 pt-6">
          <motion.span
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 260 }}
          >
            <IconBadge size={72} className="bg-app-positive-subtle text-app-positive">
              <AppIcon src={appIcons.circleCheckLine16} size={32} />
            </IconBadge>
          </motion.span>
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <h2 className="text-app-display font-semibold leading-[normal] text-ink">
              Account deleted
            </h2>
            <p className="text-app-body leading-5 text-ink-muted">
              Your HyprEarn profile, points and linked accounts have been erased, and your wallet
              has been disconnected.
            </p>
          </div>
          <Card>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <AppIcon src={appIcons.shieldCheck16} size={16} className="text-app-positive" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-app-body font-medium leading-[normal] text-ink">
                  Your funds are untouched
                </p>
                <p className="text-app-caption leading-[normal] text-ink-subtle">
                  They remain in <span className="font-app-mono font-medium">{address}</span>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <footer className="flex shrink-0 flex-col items-center gap-3 px-4 pb-[var(--app-safe-bottom)] pt-3">
        <AppButton variant="primary" onClick={onDone}>
          Back to HyprEarn
        </AppButton>
        <p className="text-center text-app-caption leading-[normal] text-ink-faint">
          You can start fresh anytime by connecting a wallet.
        </p>
      </footer>
    </div>
  );
}
