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
 * wallet, Telegram, X — replays from the top on every reload.
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

  /**
   * Fills that provider's slot. Both can be linked at once, and there is no
   * unlink — a connected account is only ever added to.
   *
   * Reads the store rather than the render's `record` so two connects in the
   * same tick can't drop each other's slot.
   */
  const connectSocial = useCallback(
    (account) =>
      patch({
        socials: {
          ...readProfile(address).socials,
          [account.provider]: account,
        },
      }),
    [patch, address],
  );

  /**
   * The last thing on the checklist: the first PnL card posted from the linked
   * X account, which is what finishes the step that linked it.
   *
   * Idempotent on the first stamp — the trade surfaces call this every time a
   * card goes out, and only the first one is a step. Keeping the original
   * timestamp also keeps `progress` stable, so re-sharing can't re-fire the
   * completion celebration.
   */
  const sharePnl = useCallback(() => {
    if (readProfile(address).pnlSharedAt) return;
    patch({ pnlSharedAt: new Date().toISOString() });
  }, [patch, address]);

  const dismissBanner = useCallback(
    () => patch({ bannerDismissedAt: new Date().toISOString() }),
    [patch],
  );

  const markCelebrated = useCallback(
    () => patch({ completionCelebrated: true }),
    [patch],
  );

  /**
   * Whichever account speaks for the user's identity — X first, because it
   * carries the display name the avatar and header render. Both are required
   * steps now, but they don't land at the same time, so this still has to cope
   * with only one of them existing.
   */
  const social = record.socials.x ?? record.socials.telegram;

  const pnlShared = Boolean(record.pnlSharedAt);

  const progress = useMemo(
    () =>
      computeProfileProgress({
        walletConnected,
        socials: record.socials,
        pnlShared,
      }),
    [walletConnected, record.socials, pnlShared],
  );

  const value = useMemo(
    () => ({
      address,
      walletConnected,
      socials: record.socials,
      social,
      pnlShared,
      progress,
      /** Banner is a nudge; the checklist and ring stay visible after dismissal. */
      bannerDismissed: Boolean(record.bannerDismissedAt),
      /**
       * Derived from persisted facts, not from an effect firing — StrictMode's
       * double invoke can't fire the confetti twice or double-credit points.
       */
      shouldCelebrate: progress.isComplete && !record.completionCelebrated,
      connectSocial,
      sharePnl,
      dismissBanner,
      markCelebrated,
    }),
    [
      address,
      walletConnected,
      record.socials,
      social,
      pnlShared,
      sharePnl,
      record.bannerDismissedAt,
      record.completionCelebrated,
      progress,
      connectSocial,
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
