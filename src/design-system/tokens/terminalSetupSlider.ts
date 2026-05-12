/**
 * Terminal details — margin % and leverage sliders (`CopilotSetupSlider` in `DetailsPanel`).
 *
 * Styling is driven by CSS variables and `@layer components` classes in `design-tokens.css`
 * (`--ds-brand-gradient-horizontal`, `--ds-terminal-slider-*`, `.ds-terminal-slider*`).
 */

export const terminalSetupSliderCssVars = {
  brandGradientHorizontal: '--ds-brand-gradient-horizontal',
  trackHeight: '--ds-terminal-slider-track-height',
  thumbTouch: '--ds-terminal-slider-thumb-touch',
  railOverlay: '--ds-terminal-slider-rail-overlay',
} as const

export const terminalSetupSlider = {
  root: 'ds-terminal-slider',
  well: 'ds-terminal-slider__well',
  input: 'ds-terminal-slider__input',
  trackRail: 'ds-terminal-slider__track-rail',
  trackFill: 'ds-terminal-slider__track-fill',
  thumbWrap: 'ds-terminal-slider__thumb-wrap',
  thumbHit: 'ds-terminal-slider__thumb-hit',
  value: 'ds-terminal-slider__value',
} as const
