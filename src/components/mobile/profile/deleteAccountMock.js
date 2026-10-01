/**
 * Stand-in for the wallet signature that authorises an account deletion.
 *
 * Shaped like the real thing — an off-chain message (SIWE-style) with a nonce
 * and an issued-at stamp, signed in the user's wallet — and only the wallet
 * round-trip is faked. Swap `requestDeleteSignature`'s body for the provider's
 * `personal_sign` and the backend call; callers don't move.
 *
 * Returns a cancel function, like `simulatedOAuth.js`, so a closed sheet or an
 * unmounted screen can't resolve into state afterwards.
 */

/** How long the fake wallet takes to hand back a signature. */
export const SIGNATURE_DELAY_MS = 1200;

/**
 * Flip to exercise the rejection path (error toast, back to step 2) — the
 * equivalent of the user tapping "Reject" in their wallet.
 */
export const SIMULATE_SIGNATURE_REJECTION = false;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (n) => String(n).padStart(2, "0");

/** `28 Sep 2026, 14:32 UTC` — the format in the Figma message preview. */
export function formatIssuedAt(date) {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())} UTC`;
}

/** Eight hex characters, from the CSPRNG when there is one. */
export function createNonce() {
  const bytes = new Uint8Array(4);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * @param {string} displayAddress  already truncated for the preview
 * @returns {{ nonce: string, issuedAt: string, lines: string[] }}
 */
export function createDeleteMessage(displayAddress, now = new Date()) {
  const nonce = createNonce();
  const issuedAt = formatIssuedAt(now);
  return {
    nonce,
    issuedAt,
    lines: [
      "HyprEarn wants you to delete your account",
      `Wallet: ${displayAddress}`,
      `Nonce: ${nonce}`,
      `Issued: ${issuedAt}`,
    ],
  };
}

/**
 * Ask the wallet to sign the deletion message. Here: a timer.
 *
 * @param {{ onSigned: (signature: string) => void, onRejected: (error: Error) => void }} handlers
 * @returns {() => void} cancel
 */
export function requestDeleteSignature({ onSigned, onRejected }) {
  const id = window.setTimeout(() => {
    if (SIMULATE_SIGNATURE_REJECTION) {
      const error = new Error("User rejected the request.");
      error.code = 4001;
      onRejected(error);
      return;
    }
    onSigned(`0x${createNonce()}${createNonce()}`);
  }, SIGNATURE_DELAY_MS);
  return () => window.clearTimeout(id);
}
