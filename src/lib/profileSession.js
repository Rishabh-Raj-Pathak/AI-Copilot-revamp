/**
 * Per-address profile state for the frontend prototype.
 *
 * Deliberately in-memory only: a refresh wipes it and the connect flow starts
 * over, which is what you want while demoing. Nothing is written to
 * localStorage, sessionStorage or cookies.
 *
 * The wallet session (`walletConnected`) resets on refresh too, so the two stay
 * consistent — you never land on a page claiming a social is linked to a wallet
 * that isn't connected.
 *
 * To make profiles survive a reload, swap the `sessions` Map for a
 * `localStorage` read/write here. No caller changes.
 */

/** @type {Map<string, ProfileRecord>} */
const sessions = new Map();

const normalize = (address) => String(address ?? "").toLowerCase();

/**
 * @typedef {object} ProfileSocial
 * @property {'x'|'telegram'} provider
 * @property {string} handle
 * @property {string} name
 * @property {string} verifiedAt
 *
 * @typedef {object} ProfileSocials
 * @property {ProfileSocial|null} x
 * @property {ProfileSocial|null} telegram
 *
 * @typedef {object} ProfileRecord
 * @property {string} address
 * @property {string|null} updatedAt
 * @property {ProfileSocials} socials  One slot per provider; both are required steps.
 * @property {string|null} pnlSharedAt  When the first PnL card was posted — the second half of the X step.
 * @property {string|null} bannerDismissedAt
 * @property {boolean} completionCelebrated
 */

/** @param {string} address @returns {ProfileRecord} */
export function emptyProfile(address) {
  return {
    address: normalize(address),
    updatedAt: null,
    socials: { x: null, telegram: null },
    /**
     * A timestamp rather than a boolean because it's the one thing on the
     * checklist the user can repeat — every later card is another share, but
     * only the first one pays, and this is what says the toll has been taken.
     */
    pnlSharedAt: null,
    bannerDismissedAt: null,
    completionCelebrated: false,
  };
}

/** @param {string} address @returns {ProfileRecord} */
export function readProfile(address) {
  return sessions.get(normalize(address)) ?? emptyProfile(address);
}

/**
 * Merge `patch` over the current record and keep it for this page load. The
 * merge is one level deep, so a `socials` patch must carry both slots.
 * @param {string} address
 * @param {Partial<ProfileRecord>} patch
 * @returns {ProfileRecord} the merged record
 */
export function writeProfile(address, patch) {
  const next = {
    ...readProfile(address),
    ...patch,
    address: normalize(address),
    updatedAt: new Date().toISOString(),
  };
  sessions.set(next.address, next);
  return next;
}

/** @param {string} address */
export function clearProfile(address) {
  sessions.delete(normalize(address));
  return emptyProfile(address);
}
