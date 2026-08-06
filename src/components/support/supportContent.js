/**
 * Support page content.
 *
 * Copy is drawn from the HyprEarn docs (Support & FAQ, Help & Support, Risk
 * Disclosure, Account Deletion, Eligibility) and deliberately written to be
 * platform-agnostic — this is the product's support page, not a mobile-app help
 * screen, so nothing here says "the app".
 *
 * The two outward-facing contact values live here on their own so a correction
 * is a one-line edit. Confirm both before shipping: the docs give this email and
 * a `t.me/hyprearnofficial` community handle, but the only Telegram link wired
 * into the app today is the `t.me/hyprearn_bot` *pairing* bot — the wrong
 * destination for "join the community".
 */

import { X_HANDLE, X_PROFILE_URL } from "../profile/simulatedOAuth.js";

// ⚠️ CONFIRM before ship — outward-facing, swap in the real values here.
export const SUPPORT_EMAIL = "abhay@hyprearn.com";
export const SUPPORT_TELEGRAM_URL = "https://t.me/hyprearnofficial";

/** Shown beneath the contact rows. */
export const SUPPORT_RESPONSE_NOTE =
  "We typically reply within 24–48 hours, Monday to Friday. For urgent security or transaction issues, put “URGENT” in the subject line.";

/**
 * Contact channels, in priority order. Icons are presentation and stay in the
 * page component (see `CHANNEL_ICONS`), matching how `MoreSheet` keeps its
 * `DOC_ICONS` out of the link data.
 */
export const SUPPORT_CHANNELS = [
  {
    id: "email",
    label: "Email support",
    sub: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    external: false,
  },
  {
    id: "telegram",
    label: "Telegram community",
    sub: "Join for updates and alerts",
    href: SUPPORT_TELEGRAM_URL,
    external: true,
  },
  {
    id: "x",
    label: "X (Twitter)",
    sub: X_HANDLE,
    href: X_PROFILE_URL,
    external: true,
  },
];

