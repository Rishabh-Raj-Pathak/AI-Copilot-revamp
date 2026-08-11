# Local typography verification

Checked `http://localhost:5173/` at 1280x800, 834x900, and 402x874 on the Copilot and Trade surfaces.

## Verdict

The new scale is active on the rendered Copilot surface, with two exceptions/limits:

1. `Connect Wallet` still renders at 14px through `.ds-terminal-gradient-cta`, outside the stated 10/11/12/13/18px scale.
2. The 834px desktop header collides: PnL Calendar, Leaderboard, and Rewards overlap the Hyperliquid and Connect Wallet actions.

The Trade surface still visibly contains its documented, not-yet-migrated typography (14px/16px and weight 600). This matches the ESLint ignore list, but it is not on the new five-size/500-cap system yet.

## Confirmed

- Copilot rendered `text-anchor` at 18px/500, `text-control` at 13px, `text-data` at 12px, `ds-eyebrow` at 11px/500, and `text-meta` at 10px.
- No rendered Copilot text exceeded weight 500 except the two 18px/600 HyprEarn wordmark spans.
- Suggestion titles remained 13px/500 before and after selection; their rendered height did not change.
- The body has `data-type-scale="terminal"` and inherited `font-variant-numeric: tabular-nums`.
- Rendered Onest digits at 12px all measured about 8.07px wide; the total projected width difference between `0123456789` and `1111111111` was only about 0.034px (subpixel rounding), confirming the `tnum` feature is working.
- No browser console warnings or errors were observed during the audited Copilot state.
- The typography `no-restricted-syntax` rules produced zero violations on `src/components/terminal` and `src/components/trade` after configured ignores.

## Tooling result

The full repository lint command still fails with 43 existing errors and 6 warnings from other rules (React hook state-in-effect, Fast Refresh export shape, unused variables, and related issues). No `no-restricted-syntax` typography violations were present.

## Screenshots

- `01-copilot-1280.png`
- `02-copilot-834.png`
- `03-copilot-402.png`
- `04-trade-1280.png`
- `05-trade-834.png`
- `06-trade-402.png`

## Evidence limits

This pass checked visible layout, computed typography, selection stability, responsive reflow, browser console output, and rendered numeral widths. It did not establish full WCAG compliance or exhaustively keyboard-test every control.

## Remediation applied

The two actionable findings were fixed and re-verified locally:

- `Connect Wallet` now reads `--ds-type-control-size` and renders at 13px/500.
- From 834px through 1279px, `HeaderTerminal` now uses its existing compact navigation menu. The full navigation starts at 1280px. This removed the header collisions while keeping every destination accessible.

Post-fix checks:

- 834px Copilot: no element overlaps, no horizontal overflow, compact menu present.
- 834px Trade: no element overlaps, no horizontal overflow, compact menu present.
- Compact menu navigation to Trade works.
- 1280px: full navigation present with no overlaps.
- 402px: mobile header unchanged, no horizontal overflow, Connect Wallet at 13px/500.
- No browser console warnings or errors.
- Production build and targeted `HeaderTerminal.jsx` lint pass.

Post-fix screenshots:

- `08-fixed-copilot-834.png`
- `09-fixed-trade-834.png`
- `10-fixed-copilot-402.png`
