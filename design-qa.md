# Design QA — KOL linked referral and Redeem state

## Source visual truth

- Linked-code reference: `/var/folders/0d/zy2r9m5d46qgc62qt0dxbqm40000gn/T/codex-clipboard-03d56fbc-d97a-4675-a349-4298b15c3e69.png`
- Previous KOL code-entry state: `/var/folders/0d/zy2r9m5d46qgc62qt0dxbqm40000gn/T/codex-clipboard-9f89656c-106c-4565-8dec-379298df28ef.png`
- User-directed deviation from the linked-code reference: retain GAUTAM and use a Redeem button instead of the verified badge.

## Implementation evidence

- Desktop: `/private/tmp/kol-rewards-linked-referral-desktop.png`
- Mobile: `/private/tmp/kol-rewards-linked-referral-mobile.png`
- Local page: `http://127.0.0.1:5175/`, Rewards > KOL
- Viewports: 1280 × 720 desktop and 390 × 844 mobile
- State: dark theme, Gautam KOL view, Linked Referral Code card visible

## Full-view comparison evidence

- The KOL right-hand hero card now uses the reference heading `Linked Referral Code` and status copy `You are getting back 8% of your trading fees`.
- GAUTAM remains the linked code, matching the KOL campaign rather than the ALFRED placeholder in the generic reference.
- The former Edit/Save interaction is replaced with the requested one-step Redeem action and existing amber-to-aquamarine CTA treatment.
- The URL-prefix label is removed from the KOL state to match the simpler linked-code reference. The standard Rewards view still shows Enter a Code, the URL prefix, 4%, and Edit.
- All other KOL hero, statistics, milestone, claim, timer, and leaderboard content remains unchanged.

## Focused region evidence

- Desktop capture verifies equal hero-card height, correct copy, GAUTAM field alignment, and the Redeem action without clipping.
- Mobile capture verifies the Linked Referral Code card stacks cleanly below Your Referral Code and keeps the field/action on one row.
- Browser measurements confirm a 390 px viewport and 390 px document scroll width.

## Required fidelity surfaces

- Fonts and typography: Passed. Existing Onest hierarchy and amber 8% emphasis align with both references and surrounding cards.
- Spacing and layout rhythm: Passed. Existing card padding, header/body separation, input height, CTA height, and responsive gaps are preserved.
- Colors and visual tokens: Passed. Existing black surface, neutral border, white/muted text, amber emphasis, and CTA gradient are reused.
- Image quality and asset fidelity: Passed. No raster asset was required; the existing Check icon is used in the requested Redeem control.
- Copy and content: Passed. Linked Referral Code, 8% status, GAUTAM, and Redeem are all present; the old Gautam instruction sentence and Edit label are absent from KOL.
- Accessibility and behavior: Passed. GAUTAM is exposed as a read-only textbox, Redeem is a semantic button, and activation produces visible confirmation feedback.
- Responsiveness: Passed at 1280 × 720 and 390 × 844 with no overlap, clipping, or horizontal overflow.

## Interactions and diagnostics verified

- Rewards dropdown opens the KOL view on desktop and mobile.
- Redeem produces `Referral code GAUTAM redeemed — 8% cashback active` feedback.
- Standard Rewards remains `Enter a Code`, 4%, and Edit.
- Browser console: no warnings or errors.
- Automated checks: 44 tests passed, targeted lint passed, and production build passed.

## Comparison history

1. Pass 1 compared both user references with desktop and mobile implementation captures in one visual review. No actionable P0, P1, or P2 mismatch was found.

## Findings

- No remaining P0, P1, or P2 findings.

## Follow-up polish

- None required for this scoped state change.

## Final result

passed
