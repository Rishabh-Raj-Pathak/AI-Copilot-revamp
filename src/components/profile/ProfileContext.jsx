import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { MOCK_WALLET_ADDRESS } from "../../lib/wallet.js";
import { readProfile, writeProfile } from "../../lib/profileSession.js";
import { computeProfileProgress } from "./profileSteps.js";

const ProfileContext = createContext(null);

/**
 * Owns the profile record for this page load and derives progress from it.
 *
 * `walletConnected` stays in `App` — it drives routing, `sharedWalletProps` and
 * the tour autostart — and is passed in rather than owned here.
 *
 * Nothing survives a refresh (see `profileSession.js`), so the whole flow —
 * wallet, social, trading profile — replays from the top on every reload.
 */
export function ProfileProvider({
  walletConnected = false,
  address = MOCK_WALLET_ADDRESS,
  children,
}) {
  const [record, setRecord] = useState(() => readProfile(address));
  const [loadedAddress, setLoadedAddress] = useState(address);

  // A different wallet is a different profile. Re-read during render rather
  // than in an effect, so no frame ever paints one wallet's progress under
  // another wallet's address.
  if (loadedAddress !== address) {
    setLoadedAddress(address);
    setRecord(readProfile(address));
  }

  const patch = useCallback(
    (next) => setRecord(writeProfile(address, next)),
    [address],
  );

  /** Fills the single social slot — connecting the second provider replaces the first. */
  const connectSocial = useCallback(
    (account) => patch({ social: account }),
    [patch],
  );

  const disconnectSocial = useCallback(() => patch({ social: null }), [patch]);

  const saveTrading = useCallback(
    (trading) => patch({ trading: { ...trading, savedAt: new Date().toISOString() } }),
    [patch],
  );

  const dismissBanner = useCallback(
    () => patch({ bannerDismissedAt: new Date().toISOString() }),
    [patch],
  );

  const markCelebrated = useCallback(
    () => patch({ completionCelebrated: true }),
    [patch],
  );

  const progress = useMemo(
    () =>
      computeProfileProgress({
        walletConnected,
        social: record.social,
        trading: record.trading,
      }),
    [walletConnected, record.social, record.trading],
  );

  const value = useMemo(
    () => ({
      address,
      walletConnected,
      social: record.social,
      trading: record.trading,
      progress,
      /** Banner is a nudge; the checklist and ring stay visible after dismissal. */
      bannerDismissed: Boolean(record.bannerDismissedAt),
      /**
       * Derived from persisted facts, not from an effect firing — StrictMode's
       * double invoke can't fire the confetti twice or double-credit points.
       */
      shouldCelebrate: progress.isComplete && !record.completionCelebrated,
      connectSocial,
      disconnectSocial,
      saveTrading,
      dismissBanner,
      markCelebrated,
    }),
    [
      address,
      walletConnected,
      record.social,
      record.trading,
      record.bannerDismissedAt,
      record.completionCelebrated,
      progress,
      connectSocial,
      disconnectSocial,
      saveTrading,
      dismissBanner,
      markCelebrated,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
