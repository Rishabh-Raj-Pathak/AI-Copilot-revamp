# Design QA — Simplified AI Copilot trade setup

- Source visual truth: `.product-design/leverage-audit/01-hyperliquid.png`, `02-variational.png`, `03-lighter.png`, and `04-vooi.png`.
- Implementation screenshots: `.product-design/leverage-audit/05-hyprearn-simplified-desktop.png` and `06-hyprearn-simplified-mobile.png`.
- Focused comparison input: `.product-design/leverage-audit/07-control-comparison.png`.
- Desktop viewport: 1280 × 720 CSS px, device scale factor 1.
- Mobile viewport: 390 × 844 CSS px, device scale factor 1.
- Source and desktop implementation pixels: 1280 × 720. Mobile implementation pixels: 390 × 844. No density normalization was needed.
- State: dark theme, wallet disconnected, ARB short setup selected, Market order, Isolated margin, 10x leverage, TP/SL collapsed.

## Full-view comparison evidence

The implementation now follows the repeated perp-order sequence: compact account settings, order type, direction, available balance, one size input, allocation slider, optional TP/SL, CTA, and read-only outcomes. The CTA remains visible without scrolling at desktop and mobile sizes, and the panel has substantially fewer competing controls.

## Focused region comparison evidence

The combined panel comparison shows that Variational and VOOI consistently present leverage as a compact selector near margin/order configuration. Hyperliquid, Variational, Lighter, and VOOI use one primary size/amount input rather than separate editable size and margin fields. HyperEarn now matches that learned structure while retaining its gold, red, and green tokens.

## Required fidelity surfaces

- Fonts and typography: existing HyperEarn typography, optical weights, and tabular numerals are preserved. Compact selectors use the same 14 px control typography as adjacent tabs.
- Spacing and layout rhythm: duplicate margin and leverage rows were removed; the top configuration row uses two equal tracks; the core order stack fits comfortably above the fold.
- Colors and visual tokens: existing black surfaces, gold active indicator, red short CTA, and muted borders remain consistent.
- Image quality and asset fidelity: existing USDC and slider assets remain unchanged and sharp. No new raster or approximation assets were introduced.
- Copy and content: existing trade terms were retained. Leverage and margin mode moved into standard selectors; Margin is derived from Size and leverage instead of being a second visible input.

## Findings

No actionable P0, P1, or P2 visual or interaction issues remain for this simplification pass.

## Comparison history

- Initial P1: editable Margin and Size fields created two ways to express the same exposure, increasing hesitation and mismatch risk.
- Initial P1: a full-width leverage slider visually competed with the allocation slider even though leverage is normally an account setting.
- Initial P2: optional TP/SL appeared after the CTA, differing from the familiar pre-commit risk-control order.
- Fixes: replaced margin mode and leverage with compact selectors; reduced the trade form to one Size input; preserved the familiar allocation slider; moved collapsed TP/SL before the CTA; defaulted Early Exit Optimization to off.
- Post-fix evidence: desktop/mobile screenshots show the simplified hierarchy without scrolling. Live checks confirmed Cross mode, 20x leverage, Limit, TP/SL expansion, and size preservation all work.

## Primary interactions tested

- Changed Isolated to Cross.
- Changed leverage from 10x to 20x and confirmed explicit Size remained unchanged.
- Switched Market to Limit and confirmed the existing current-price option appeared.
- Expanded TP/SL and confirmed its fields remained available.
- Checked local browser logs; no localhost warnings or errors were present.

## Follow-up polish

The native selectors intentionally favor reliability and keyboard support. A branded popover could be considered later only if it preserves the same compact interaction model.

final result: passed
