/** Elevation tokens — use `shadow-ds-sm`, `shadow-ds-md`, `shadow-ds-lg`, `shadow-ds-ring`. */

export const shadowVar = {
  sm: 'var(--ds-shadow-sm)',
  md: 'var(--ds-shadow-md)',
  lg: 'var(--ds-shadow-lg)',
  ring: 'var(--ds-shadow-ring)',
} as const

export type ShadowToken = keyof typeof shadowVar
