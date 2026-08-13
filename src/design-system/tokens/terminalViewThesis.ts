/**
 * Terminal Copilot — «Backtest» control (opens strategy write-up).
 *
 * Visual spec: secondary outline control in the suggestion card's own family —
 * `#0f0f0f` fill, 1px `#242424` hairline (`#333333` on hover), 6px corner radius,
 * 4×10px padding / 28px min-height, 6px gap, 13px label in white, Lucide
 * **`ScanSearch`** only — no custom SVG — at 14px in brand amber.
 *
 * The brand amber→aquamarine ramp is reserved for hero surfaces (KPI values,
 * setup sliders, Connect Wallet, tour frame); do not put it back on this stroke.
 *
 * Implementation: CSS variables `--ds-terminal-view-thesis-*` and
 * `.ds-terminal-view-thesis-button` in `src/styles/design-tokens.css`.
 */

export const terminalViewThesisButtonCssVars = {
  background: '--ds-terminal-view-thesis-bg',
  foreground: '--ds-terminal-view-thesis-fg',
  backgroundHover: '--ds-terminal-view-thesis-bg-hover',
  border: '--ds-terminal-view-thesis-border',
  borderHover: '--ds-terminal-view-thesis-border-hover',
  iconColor: '--ds-terminal-view-thesis-icon-color',
  radius: '--ds-terminal-view-thesis-radius',
  paddingY: '--ds-terminal-view-thesis-padding-y',
  paddingX: '--ds-terminal-view-thesis-padding-x',
  minHeight: '--ds-terminal-view-thesis-min-height',
  gap: '--ds-terminal-view-thesis-gap',
  fontSize: '--ds-terminal-view-thesis-font-size',
  lineHeight: '--ds-terminal-view-thesis-line-height',
  fontWeight: '--ds-terminal-view-thesis-font-weight',
  iconSize: '--ds-terminal-view-thesis-icon-size',
} as const

export const terminalViewThesisButton = {
  /** Apply to `<button type="button">` (see design-tokens.css `@layer components`). */
  componentClassName: 'ds-terminal-view-thesis-button',
  /** Lucide component name — do not substitute other icons for this product control. */
  lucideIcon: 'ScanSearch' as const,
  iconSizePx: 14,
  iconStrokeWidth: 1.75,
} as const
