/**
 * Typography roles aligned with Figma text styles → semantic names.
 * Prefer Tailwind + `ds-text-*` classes from design-tokens.css.
 *
 * Figma «Typography» (styles `0:1`): family **Onest**; weights **400 / 600 / 700** (Regular, Semibold, Bold).
 * Load weights in `index.html` to match used roles.
 */

export const typographyRoles = [
  'display',
  'heading-1',
  'heading-2',
  'heading-3',
  'heading-4',
  'body-lg',
  'body',
  'body-sm',
  'caption',
  'label',
  'button',
] as const

export type TypographyRole = (typeof typographyRoles)[number]

/** Maps to `ds-text-*` utility classes in CSS. */
export const typographyClassName: Record<TypographyRole, string> = {
  display: 'ds-text-display',
  'heading-1': 'ds-text-heading-1',
  'heading-2': 'ds-text-heading-2',
  'heading-3': 'ds-text-heading-3',
  'heading-4': 'ds-text-heading-4',
  'body-lg': 'ds-text-body-lg',
  body: 'ds-text-body',
  'body-sm': 'ds-text-body-sm',
  caption: 'ds-text-caption',
  label: 'ds-text-label',
  button: 'ds-text-button',
}
