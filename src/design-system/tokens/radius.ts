/**
 * Corner radius — Figma «Corner Radius» on styles canvas (`0:1`).
 * CSS vars `--ds-radius-*` in `design-tokens.css`; Tailwind `rounded-*` maps to the ladder (see README).
 */

export const radiusVar = {
  none: 'var(--ds-radius-none)',
  xxxs: 'var(--ds-radius-xxxs)',
  xxs: 'var(--ds-radius-xxs)',
  xs: 'var(--ds-radius-xs)',
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
  '2xl': 'var(--ds-radius-2xl)',
  '3xl': 'var(--ds-radius-3xl)',
  full: 'var(--ds-radius-full)',
} as const

export type RadiusToken = keyof typeof radiusVar
