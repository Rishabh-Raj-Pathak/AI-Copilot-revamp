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
 * @typedef {object} ProfileTrading
 * @property {string} risk
 * @property {string} market
 * @property {string} maxLeverage
 * @property {string} savedAt
 *
 * @typedef {object} ProfileRecord
 * @property {string} address
 * @property {string|null} updatedAt
 * @property {ProfileSocial|null} social  Single slot — X *or* Telegram, never both.
 * @property {ProfileTrading|null} trading
 * @property {string|null} bannerDismissedAt
 * @property {boolean} completionCelebrated
 */

/** @param {string} address @returns {ProfileRecord} */
export function emptyProfile(address) {
  return {
    address: normalize(address),
    updatedAt: null,
    social: null,
    trading: null,
    bannerDismissedAt: null,
    completionCelebrated: false,
  };
}

/** @param {string} address @returns {ProfileRecord} */
export function readProfile(address) {
  return sessions.get(normalize(address)) ?? emptyProfile(address);
}

/**
 * Merge `patch` over the current record and keep it for this page load.
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
