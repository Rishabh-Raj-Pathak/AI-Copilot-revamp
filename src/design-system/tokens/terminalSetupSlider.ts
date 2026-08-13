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
  /** Column wrapper — rail + milestone row (`milestones` prop). */
  stack: 'ds-terminal-slider__stack',
  well: 'ds-terminal-slider__well',
  input: 'ds-terminal-slider__input',
  trackRail: 'ds-terminal-slider__track-rail',
  trackFill: 'ds-terminal-slider__track-fill',
  thumbWrap: 'ds-terminal-slider__thumb-wrap',
  thumb: 'ds-terminal-slider__thumb',
  marks: 'ds-terminal-slider__marks',
  mark: 'ds-terminal-slider__mark',
  value: 'ds-terminal-slider__value',
} as const
