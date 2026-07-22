# Design QA — compact KOL milestone progress cards

## Source visual truth

- Reference: `/var/folders/0d/zy2r9m5d46qgc62qt0dxbqm40000gn/T/codex-clipboard-7fd3d9ab-5de9-435e-ae9c-2b4d2561cab1.png`
- Source pixels: 1156 × 646. The focused card region is 1104 × 562.
- User-directed change: remove the bottom `Next up / You’ll unlock` panel, retain the `$60` reward message inside the same top-left card near the progress bar, and let the full three-card row become shorter.

## Implementation evidence

- Desktop full view: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-rewards-desktop-1440x900.png`
- Desktop focused card: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-progress-card-desktop-crop.png`
- Mobile view: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-rewards-mobile-390x844.png`
- Local page: `http://localhost:4173/`, Rewards > Gautam Rewards
- Desktop viewport: 1440 × 900 CSS px at device pixel ratio 1; implementation screenshot is 1440 × 900 px.
- Mobile viewport: 390 × 844 CSS px at device pixel ratio 1; implementation screenshot is 390 × 844 px.
- State: dark theme, Gautam KOL rewards, default progress state.

## Full-view comparison evidence

- The entire former bottom summary panel is absent.
- `You’ll unlock $60` is visible immediately below `Progress to Milestone 3`; `$60` retains the campaign amber emphasis.
- At 1440 px, all three hero cards measure 435 × 216 px, confirming the neighboring cards collapse to the shorter shared row height.
- At 390 px, the three cards stack at the full 358 px content width with no horizontal overflow; the progress card is 210 px tall.

## Focused region comparison evidence

- Source card normalized to the implementation width: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-progress-card-source-normalized.png` (435 × 221 px).
- Implementation focused card: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-progress-card-desktop-crop.png` (435 × 216 px).
- Both focused images were opened together for the final comparison. Typography, badge art, border, progress metrics, gradient rail, and alignment remain consistent; the requested panel is removed and its reward copy is relocated without clipping.

## Required fidelity surfaces

- Fonts and typography: Passed. Existing Onest hierarchy, weights, line heights, and amber `$60` emphasis remain consistent.
- Spacing and layout rhythm: Passed. Progress copy fits cleanly above the bar; the hero row is uniformly 216 px tall on desktop.
- Colors and visual tokens: Passed. Existing black surface, gold border, neutral text, and amber-to-aquamarine progress treatment are preserved.
- Image quality and asset fidelity: Passed. The existing Scout badge remains sharp, correctly scaled, and uncropped.
- Copy and content: Passed. `Progress to Milestone 3`, `$115.4K to M3`, `77%`, and `You’ll unlock $60` remain visible; `Next up` is absent.
- Accessibility and behavior: Passed. The progressbar accessible label names Milestone 3 and the remaining trading volume.
- Responsiveness: Passed at 1440 × 900 and 390 × 844 with no overlap, clipping, or horizontal overflow.

## Interactions and diagnostics verified

- Rewards navigation opens the Gautam Rewards state.
- Browser console: no errors.
- Automated checks: 46 tests passed, targeted lint passed, and the production build passed.

## Comparison history

1. Pass 1 compared the user reference and the rendered desktop/mobile implementation. No actionable P0, P1, or P2 mismatch remained after the scoped panel removal and copy relocation.

## Findings

- No remaining P0, P1, or P2 findings.

## Follow-up polish

- None required for this scoped change.

## Final result

passed
