/**
 * Terminal Copilot — «Backtest» control (opens strategy write-up).
 *
 * Visual spec: black fill, 1px brand horizontal gradient border, ~6px corner radius,
 * 8×16px padding, 8px gap, 12px medium label, Lucide **`ScanSearch`** only — no custom SVG.
 *
 * Implementation: CSS variables `--ds-terminal-view-thesis-*` and
 * `.ds-terminal-view-thesis-button` in `src/styles/design-tokens.css`.
 */

export const terminalViewThesisButtonCssVars = {
  background: '--ds-terminal-view-thesis-bg',
  foreground: '--ds-terminal-view-thesis-fg',
  border: '--ds-terminal-view-thesis-border',
  radius: '--ds-terminal-view-thesis-radius',
  paddingY: '--ds-terminal-view-thesis-padding-y',
  paddingX: '--ds-terminal-view-thesis-padding-x',
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
  iconSizePx: 16,
  iconStrokeWidth: 2,
} as const
