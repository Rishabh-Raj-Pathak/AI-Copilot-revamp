/**
 * Stand-ins for the two account links, shaped like the real thing.
 *
 * A typed-in handle can't be trusted to attribute a shared setup or to route a
 * liquidation alert, so both flows are modelled the way they'd actually ship —
 * X as an OAuth round-trip, Telegram as a bot deep-link pairing — and only the
 * network call is faked. Swap the bodies for the real calls; callers don't move.
 *
 * Each starter returns a cancel function so React 19 StrictMode's double-invoked
 * effects can't strand a timer or resolve into an unmounted component.
 */

export const X_AUTHORIZE_MS = 1100;
export const TELEGRAM_PAIRING_MS = 2200;

export const TELEGRAM_BOT_URL = "https://t.me/hyprearn_bot";

/** The account the fake OAuth consent screen hands back. */
const MOCK_X_ACCOUNT = {
  provider: "x",
  handle: "@0xleverage",
  name: "0xLeverage",
};

const MOCK_TELEGRAM_ACCOUNT = {
  provider: "telegram",
  handle: "@0xleverage",
  name: "0xLeverage",
};

const PAIRING_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Six unambiguous characters — no O/0, no I/1/l. */
export function createTelegramPairingCode() {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += PAIRING_ALPHABET[Math.floor(Math.random() * PAIRING_ALPHABET.length)];
  }
  return code;
}

/** @param {string} code */
export function telegramDeepLink(code) {
  return `${TELEGRAM_BOT_URL}?start=${code}`;
}

function stamp(account) {
  return { ...account, verifiedAt: new Date().toISOString() };
}

/**
 * Redirect to X, wait for the callback. Here: a timer.
 * @param {(account: object) => void} onAuthorized
 * @returns {() => void} cancel
 */
export function startXAuthorization(onAuthorized) {
  const id = window.setTimeout(
    () => onAuthorized(stamp(MOCK_X_ACCOUNT)),
    X_AUTHORIZE_MS,
  );
  return () => window.clearTimeout(id);
}

/**
 * Poll the backend until the user taps Start in the bot. Here: a timer.
 * @param {(account: object) => void} onPaired
 * @returns {() => void} cancel
 */
export function startTelegramPairing(onPaired) {
  const id = window.setTimeout(
    () => onPaired(stamp(MOCK_TELEGRAM_ACCOUNT)),
    TELEGRAM_PAIRING_MS,
  );
  return () => window.clearTimeout(id);
}

export const SOCIAL_PROVIDERS = {
  x: {
    id: "x",
    name: "X",
    connectLabel: "Connect with X",
    pendingLabel: "Authorizing on X…",
    /** Why a trader would hand this over. */
    benefit: "Share your setups in one tap and claim your referral link.",
  },
  telegram: {
    id: "telegram",
    name: "Telegram",
    connectLabel: "Connect Telegram",
    pendingLabel: "Waiting for Telegram…",
    benefit: "Get liquidation and agent alerts pushed to your phone.",
  },
};
