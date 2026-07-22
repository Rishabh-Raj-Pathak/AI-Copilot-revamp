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
export const X_POST_MS = 1400;

export const TELEGRAM_BOT_URL = "https://t.me/hyprearn_bot";

export const X_HANDLE = "@hyprearn";
export const X_PROFILE_URL = "https://x.com/hyprearn";

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
  // A link is either made or it isn't — one moment to record, and nothing held
  // back for a later "activation". The share that follows the X link is a step
  // of its own with its own timestamp on the record, not a second state of this
  // one. See `computeProfileProgress`.
  return { ...account, verifiedAt: new Date().toISOString() };
}

/**
 * Redirect to X, wait for the callback. Here: a timer.
 *
 * The authorization is what performs the follow — the scope we ask for includes
 * it, so there's no second trip to x.com and nothing to confirm afterwards. It
 * also carries write access, which is what makes the share step one tap instead
 * of another consent screen.
 *
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
 *
 * Joining is the entire Telegram step — the points land on this resolving, with
 * nothing held back for a first alert. Alerts are the reason to join, not a
 * second toll on the way in.
 *
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

/**
 * The closed position used by the prototype share action.
 *
 * Production supplies these values only after a position has been opened and
 * closed. The fixture keeps the share intent functional without rendering a
 * made-up trade preview in the profile checklist.
 */
export const SAMPLE_PNL_CARD = {
  coin: "ETH",
  side: "Long",
  leverage: "5x",
  pnlPercent: "+34.2%",
  pnl: "+$1,284",
};

/**
 * Post the card and wait for X to hand back a post id. Here: a timer.
 *
 * The authorization from step three already carries write scope, so this needs
 * no second consent — which is the whole reason the share can be a one-tap step
 * instead of another round trip.
 *
 * @param {() => void} onPosted
 * @returns {() => void} cancel
 */
export function startPnlCardShare(onPosted) {
  const id = window.setTimeout(onPosted, X_POST_MS);
  return () => window.clearTimeout(id);
}

export const SOCIAL_PROVIDERS = {
  x: {
    id: "x",
    name: "X",
    connectLabel: "Connect X",
    pendingLabel: "Authorizing on X…",
    /**
     * Why a trader would hand this over. One line, and it has to survive
     * truncation on a narrow row, so it names the payoff and leaves the detail
     * to `perk` below.
     */
    benefit: `Follow ${X_HANDLE} for alpha drops. Share PnL after you close a trade.`,
    /** The settled row's one-word status — "Linked" undersells what happened. */
    settledLabel: "Following",
  },
  telegram: {
    id: "telegram",
    name: "Telegram",
    connectLabel: "Join Telegram",
    pendingLabel: "Waiting for Telegram…",
    benefit: "Get pinged the moment a position is at risk, and when an agent acts.",
    settledLabel: "Joined",
  },
};
