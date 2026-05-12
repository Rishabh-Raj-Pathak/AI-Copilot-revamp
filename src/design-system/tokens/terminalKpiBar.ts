/**
 * Terminal — market filters bar KPI row (`MarketFiltersBar`).
 *
 * Labels use `--ds-terminal-kpi-label-color` (neutral ramp).
 * Numeric values use `--ds-terminal-kpi-value-gradient` (= shared `--ds-brand-gradient-horizontal`)
 * via `background-clip: text` (see `design-tokens.css`).
 */

export const terminalKpiBarCssVars = {
  labelColor: '--ds-terminal-kpi-label-color',
  labelFontSize: '--ds-terminal-kpi-label-font-size',
  valueFontSize: '--ds-terminal-kpi-value-font-size',
  valueGradient: '--ds-terminal-kpi-value-gradient',
} as const

export const terminalKpiBar = {
  labelClassName: 'ds-terminal-kpi-label',
  valueClassName: 'ds-terminal-kpi-value',
} as const
