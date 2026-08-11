# Perp DEX order-panel audit

## Verdict

Across Hyperliquid, Variational, Lighter, and VOOI, the order panel protects a short “decision spine”: direction → size → optional risk flags → commit. Read-only estimates and account diagnostics follow the CTA. HyperEarn contained the same building blocks, but its expanded TP/SL ladder and emphasized balance row interrupted this spine.

## Captured steps

1. **Hyperliquid — healthy.** The CTA is visually dominant and precedes liquidation, value, margin, slippage, and fees. TP/SL is optional and collapsed in the captured state.
2. **Variational — healthy.** The CTA follows size and optional risk controls; quoted price, slippage, fees, and portfolio data are secondary below it.
3. **Lighter — healthy.** The order action remains in the upper half of the right rail; consequences are grouped underneath.
4. **VOOI — healthy.** Direction, leverage/type, size, allocation, optional risk controls, and CTA form one compact block; cost information follows.
5. **HyperEarn before change — needs improvement.** The primary action followed an expanded TP/SL form and optimization table, increasing search and scroll cost at the moment of commitment.
6. **HyperEarn after change — healthy.** The CTA now follows the minimum trade inputs, remains visible on desktop and mobile, and optional/risk and outcome content no longer competes with it.

## Highest-impact decisions

- Keep the CTA in a stable position after size and leverage so repeated traders build spatial memory.
- Default optional TP/SL detail to collapsed, preserving capability without making every trade feel long.
- Reduce visual emphasis on available balance; it informs the decision but should not look actionable.
- Show “Open Position at Current Price” only for Limit orders, avoiding a redundant Market-order decision.
- Preserve side-specific CTA color and explicit instrument/direction copy to reduce costly slips.

## Accessibility notes and limits

The updated segmented controls expose pressed state and the primary button retains a large target. Screenshots support a contrast and hierarchy review, but they cannot establish full keyboard, focus-order, or screen-reader compliance. Those need a dedicated accessibility test.
