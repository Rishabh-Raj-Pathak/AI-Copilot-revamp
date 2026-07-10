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
 * wallet, social, follow — replays from the top on every reload.
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

  /** Latched, like a linked account: the profile never un-follows. */
  const markFollowedX = useCallback(() => patch({ followedX: true }), [patch]);

  const dismissBanner = useCallback(
    () => patch({ bannerDismissedAt: new Date().toISOString() }),
    [patch],
  );

  const markCelebrated = useCallback(
    () => patch({ completionCelebrated: true }),
    [patch],
  );

  /**
   * The step needs one account, not a specific one. `social` is whichever
   * account speaks for the user's identity — X first, because it carries the
   * display name the avatar and header render.
   */
  const social = record.socials.x ?? record.socials.telegram;

  const progress = useMemo(
    () =>
      computeProfileProgress({
        walletConnected,
        hasSocial: Boolean(social),
        followedX: record.followedX,
      }),
    [walletConnected, social, record.followedX],
  );

  const value = useMemo(
    () => ({
      address,
      walletConnected,
      socials: record.socials,
      social,
      followedX: record.followedX,
      progress,
      /** Banner is a nudge; the checklist and ring stay visible after dismissal. */
      bannerDismissed: Boolean(record.bannerDismissedAt),
      /**
       * Derived from persisted facts, not from an effect firing — StrictMode's
       * double invoke can't fire the confetti twice or double-credit points.
       */
      shouldCelebrate: progress.isComplete && !record.completionCelebrated,
      connectSocial,
      markFollowedX,
      dismissBanner,
      markCelebrated,
    }),
    [
      address,
      walletConnected,
      record.socials,
      social,
      record.followedX,
      record.bannerDismissedAt,
      record.completionCelebrated,
      progress,
      connectSocial,
      markFollowedX,
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
