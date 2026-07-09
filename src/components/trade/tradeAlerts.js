/**
 * Account-level blockers surfaced at the top of the trade page.
 * Shape mirrors the agent-logs log object (`src/components/vaults/agentLogs/agentLogsMockData.js`)
 * so this can be swapped for a live feed without touching TradeAlertsBar.
 *
 * `cta.type` reuses the agent-logs action vocabulary: renew_hl_agent | deposit |
 * approve_pacifica_agent | view_position | view_vault.
 *
 * Order is priority order — index 0 is the alert shown on top of the collapsed stack.
 */
export const TRADE_ALERTS = [
  {
    id: "hl-api-wallet-expired",
    title: "Hyperliquid API wallet expired",
    body: "Your Hyperliquid API wallet authorization has expired. Renew it to restore automated vault trading.",
    cta: { type: "renew_hl_agent", label: "Renew API wallet" },
  },
  {
    id: "low-pacifica-balance",
    title: "Low Pacifica balance",
    body: "Your Pacifica balance is below $1. Deposit USDC so activated vaults can keep trading.",
    cta: { type: "deposit", label: "Deposit funds" },
  },
  {
    id: "pacifica-agent-not-approved",
    title: "Pacifica agent not approved",
    body: "Your Pacifica agent wallet is awaiting approval. Approve it to let the copilot place orders on your behalf.",
    cta: { type: "approve_pacifica_agent", label: "Approve agent" },
  },
  {
    id: "margin-ratio-critical",
    title: "Margin ratio approaching liquidation",
    body: "Your BTC/USDC position is within 8% of its liquidation price. Add margin or reduce size to stay open.",
    cta: { type: "view_position", label: "Review position" },
  },
  {
    id: "delta-neutral-leg-mismatch",
    title: "Delta-neutral legs out of sync",
    body: "The hedge leg on HIP-3 Vault failed to fill, leaving the strategy directionally exposed.",
    cta: { type: "view_vault", label: "View vault" },
  },
  {
    id: "dex-api-failure",
    title: "Pacifica connectivity degraded",
    body: "Order acknowledgements from Pacifica are delayed. Fills may take longer than usual to appear.",
    cta: { type: "view_vault", label: "View status" },
  },
];
