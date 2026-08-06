# Design QA — active Gautam milestone border

## Source visual truth

- Reference: `/var/folders/0d/zy2r9m5d46qgc62qt0dxbqm40000gn/T/codex-clipboard-3d3c7cb0-9fb7-4bfa-9946-395e33e5a783.png`
- Source pixels: 2048 × 503.
- User-directed change: Milestone 2, the current tier marked `You’re here`, must be the only tier card with a yellow border. Inactive tier fills, badges, and non-yellow tier accents should remain unchanged.

## Implementation evidence

- Desktop focused milestone section: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-tier-borders-section.png` (1952 × 411 px).
- Mobile focused cards: `/Users/dapplooker/Documents/Codex/2026-07-22/in/work/kol-tier-borders-mobile-cards-focused-390x844.png` (390 × 844 px).
- Local page: `http://localhost:4173/`, Rewards > Gautam Rewards.
- Desktop viewport: 2048 × 900 CSS px at device pixel ratio 1.
- Mobile viewport: 390 × 844 CSS px at device pixel ratio 1.
- State: dark theme, Gautam rewards, Milestone 2 current and Milestone 3 next.

## Full-view comparison evidence

- The source and rendered desktop milestone sections were opened together for comparison.
- Milestone 2 retains its 2 px yellow border, gradient-backed current-tier fill, and `You’re here` badge.
- Milestone 3 now uses the neutral 1 px border instead of the duplicate yellow border.
- Milestones 1, 4, and 5 retain their established neutral, brown, and blue non-yellow border treatments.
- Card sizing, grid layout, badges, typography, rewards, and next-milestone callout remain unchanged.

## Focused region evidence

- Computed desktop border colors: M1 `rgb(36, 36, 36)`, M2 `rgb(242, 181, 0)`, M3 `rgb(36, 36, 36)`, M4 `rgb(102, 78, 0)`, M5 `rgb(0, 79, 128)`.
- Only M2 exposes `aria-current="step"` and a 2 px border; every inactive milestone has a 1 px border.
- The same border colors and current-state semantics were verified at the 390 px mobile viewport.
- Mobile document width equals the 390 px viewport, confirming no horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: Passed. Existing Onest hierarchy, weights, wrapping, and copy are unchanged.
- Spacing and layout rhythm: Passed. Desktop five-column and mobile two-column card grids retain their original dimensions, gaps, radii, and padding.
- Colors and visual tokens: Passed. Yellow is now exclusive to the current card border; inactive cards retain their intended non-yellow treatments.
- Image quality and asset fidelity: Passed. All five existing milestone badges remain sharp, correctly scaled, and uncropped.
- Copy and content: Passed. Milestone names, volumes, rewards, totals, and `You’re here` copy are unchanged.
- Accessibility and behavior: Passed. The current card remains identified with `aria-current="step"`.
- Responsiveness: Passed at 2048 × 900 and 390 × 844 with no overlap, clipping, or horizontal overflow.

## Interactions and diagnostics verified

- Rewards navigation opens Gautam Rewards.
- Browser console: no errors.
- Automated checks: 46 tests passed, targeted lint passed, and the production build passed.

## Comparison history

1. Pass 1 compared the source screenshot with the rendered desktop and mobile implementation. The duplicate yellow border on inactive Milestone 3 was removed; no actionable P0, P1, or P2 mismatch remained.

## Findings

- No remaining P0, P1, or P2 findings.

## Follow-up polish

- None required for this scoped change.

## Final result

passed
