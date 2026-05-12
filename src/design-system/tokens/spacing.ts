/**
 * Figma «Spacing» frame (styles canvas `0:1`): named steps → px.
 * These align with Tailwind’s default spacing scale at 1rem = 16px (use `p-2`, `gap-4`, …).
 */
export const figmaSpacingPx = {
  none: 0,
  xxxs: 2,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 56,
  '8xl': 64,
  '9xl': 72,
  '10xl': 80,
  '11xl': 96,
  '12xl': 128,
  '13xl': 160,
} as const

/** Tailwind spacing key that matches each Figma name (approximate for non-standard 10px = `2.5`). */
export const figmaToTailwindSpacing: Record<keyof typeof figmaSpacingPx, string> = {
  none: '0',
  xxxs: '0.5',
  xxs: '1',
  xs: '1.5',
  sm: '2',
  md: '2.5',
  lg: '3',
  xl: '4',
  '2xl': '5',
  '3xl': '6',
  '4xl': '8',
  '5xl': '10',
  '6xl': '12',
  '7xl': '14',
  '8xl': '16',
  '9xl': '18',
  '10xl': '20',
  '11xl': '24',
  '12xl': '32',
  '13xl': '40',
}

export const spacingScaleDescription = {
  ...figmaSpacingPx,
  btnXs: 'Figma button xs frame height (22px) → `min-h-btn-xs`',
  btnSm: 'Figma button sm (29px) → `min-h-btn-sm`',
  btnMd: 'Figma button md (40px) → `min-h-btn-md`',
  btnLg: 'Figma button lg (48px) → `min-h-btn-lg`',
} as const
