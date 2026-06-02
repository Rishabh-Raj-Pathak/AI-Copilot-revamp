/**
 * Semantic color tokens — values resolve via CSS variables in `src/styles/design-tokens.css`.
 * Use Tailwind utilities (`bg-primary`, `text-muted-foreground`, …) in components.
 */

/** Figma «styles» canvas (0:1) — Global Swatches / ramps (reference only; prefer semantic tokens in UI). */
export const rawPalette = {
  neutral: {
    0: '#000000',
    5: '#121212',
    10: '#242424',
    12: '#333333',
    15: '#313131',
    20: '#454545',
    30: '#585858',
    35: '#656565',
    40: '#757575',
    45: '#858585',
    50: '#929292',
    55: '#aaaaaa',
    60: '#bfbfbf',
    65: '#d6d6d6',
    70: '#e6e6e6',
    75: '#f2f2f2',
    100: '#ffffff',
  },
  amber: { 70: '#f2b500', 5: '#171200' },
  aquamarine: { 80: '#00f3b6', 5: '#001610' },
  /** Figma Terminal `1017:35291` — navbar Connect Wallet pill gradient */
  terminalConnectWallet: { start: '#f2b500', end: '#00f3b6' },
  semantic: { red: '#d53d3d', green: '#269755' },
} as const

export const colorVar = {
  background: 'var(--ds-background)',
  foreground: 'var(--ds-foreground)',
  surface: 'var(--ds-surface)',
  surfaceMuted: 'var(--ds-surface-muted)',
  surfaceElevated: 'var(--ds-surface-elevated)',
  border: 'var(--ds-border)',
  borderStrong: 'var(--ds-border-strong)',
  ring: 'var(--ds-ring)',
  primary: 'var(--ds-primary)',
  primaryForeground: 'var(--ds-primary-foreground)',
  secondary: 'var(--ds-secondary)',
  secondaryForeground: 'var(--ds-secondary-foreground)',
  accent: 'var(--ds-accent)',
  accentForeground: 'var(--ds-accent-foreground)',
  muted: 'var(--ds-muted)',
  mutedForeground: 'var(--ds-muted-foreground)',
  destructive: 'var(--ds-destructive)',
  destructiveForeground: 'var(--ds-destructive-foreground)',
  success: 'var(--ds-success)',
  successForeground: 'var(--ds-success-foreground)',
  warning: 'var(--ds-warning)',
  warningForeground: 'var(--ds-warning-foreground)',
  info: 'var(--ds-info)',
  infoForeground: 'var(--ds-info-foreground)',
  input: 'var(--ds-input)',
  inputBorder: 'var(--ds-input-border)',
  inputPlaceholder: 'var(--ds-input-placeholder)',
} as const

export type ColorToken = keyof typeof colorVar
