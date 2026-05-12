/**
 * Terminal — filled **gradient CTA** surface (yellow → mint, black label).
 *
 * Used by **Connect Wallet** (navbar) and **Refresh** (suggestions toolbar) — shared padding/radius
 * with **Deposit** (`py-1.5` / `px-3`, `rounded-md` → `--ds-radius-xs`).
 *
 * Figma Connect Wallet: [Terminal `1017:35291`](https://www.figma.com/design/kN9AkNRzaxmg4mhFVkt1Bo/Terminal?node-id=1017-35291)
 *
 * CSS: **`.ds-terminal-gradient-cta`** — variables `--ds-terminal-connect-wallet-*` in `design-tokens.css`.
 */

export const terminalGradientCta = {
  componentClassName: 'ds-terminal-gradient-cta',
} as const

/** Same surface as {@link terminalGradientCta} — semantic name for the wallet CTA. */
export const terminalConnectWallet = {
  componentClassName: terminalGradientCta.componentClassName,
} as const

export const terminalConnectWalletCssVars = {
  gradient: '--ds-terminal-connect-wallet-gradient',
  foreground: '--ds-terminal-connect-wallet-fg',
  paddingY: '--ds-terminal-connect-wallet-padding-y',
  paddingX: '--ds-terminal-connect-wallet-padding-x',
  fontSize: '--ds-terminal-connect-wallet-font-size',
  fontWeight: '--ds-terminal-connect-wallet-font-weight',
  radius: '--ds-terminal-connect-wallet-radius',
} as const
