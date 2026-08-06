/**
 * Legal, policy and support documents surfaced in the mobile "More" sheet.
 *
 * These are the pages the app stores expect to be reachable from inside the
 * app itself — Apple 5.1.1(v) in particular requires an in-app route to account
 * deletion, so `account-deletion` is not optional dressing.
 *
 * Everything lives on the docs site rather than in-app: the copy is reviewed by
 * legal on its own cadence and must not need an app release to change.
 */

const DOCS_BASE_URL =
  "https://docs.hyprearn.com/HnETD1HQdaN5QhTwmV4l/others/mobile-app";

/**
 * Order is the order shown in the sheet: the three legal documents a user is
 * agreeing to, then the two account/eligibility escape hatches.
 *
 * These are external legal/policy documents only. Help & Support is now an
 * in-app page (`SupportPage`) reached via `onOpenSupport`, not an external doc
 * link — that page links back out to the full docs itself.
 */
export const DOC_LINKS = [
  {
    id: "privacy-policy",
    label: "Privacy Policy",
    href: `${DOCS_BASE_URL}/privacy-policy`,
  },
  {
    id: "terms-of-service",
    label: "Terms of Service",
    href: `${DOCS_BASE_URL}/terms-of-service`,
  },
  {
    id: "risk-disclosure",
    label: "Risk Disclosure",
    href: `${DOCS_BASE_URL}/risk-disclosure`,
  },
  {
    id: "account-deletion",
    label: "Account Deletion",
    href: `${DOCS_BASE_URL}/account-deletion-apple-5.1.1-v`,
  },
  {
    id: "restricted-regions",
    label: "Restricted Regions & Eligibility",
    href: `${DOCS_BASE_URL}/restricted-regions-and-eligibility`,
  },
];
