/**
 * Terminal iconography, exported from Figma and vendored into `/public/terminal`.
 *
 * These were previously `figma.com/api/mcp/asset/*` URLs, which Figma expires after
 * ~7 days — every one of them had gone 404, so the logo, slider thumbs and field
 * icons rendered as broken images. Keep these as local paths.
 *
 * Source: Terminal `kN9AkNRzaxmg4mhFVkt1Bo` (header 880:10843, details panel 882:15627,
 * slider 882:20500). Venue logos live with the other brand marks in
 * `src/delta-neutral/assets` and are imported directly by `TerminalPlatformSelect`.
 */
export const terminalAssets = {
  /** Header/mobile-nav brand mark — amber→aquamarine gradient (Figma 4:13). */
  logoMark: '/terminal/logo-mark.svg',
  walletIcon: '/terminal/wallet.svg',
  checkboxCheck: '/terminal/checkbox-check.svg',
  /** Round amber knob for the margin/leverage sliders (Figma 39:9365). */
  sliderStop: '/terminal/slider-stop.svg',
  usdc: '/terminal/usdc.svg',
  dollarIcon: '/terminal/dollar.svg',
  /** Up/down stepper arrows inside `StepperField` (Figma 35:1547). */
  chevronPair: '/terminal/chevron-pair.svg',
  /** Figma node 1017:37097 — icon/check-rosette-filled */
  tradeSuccessCheckRosette: '/terminal/check-rosette.svg',
  /** Figma Share Setup leading icon (1017:37102) */
  tradeSuccessShareLeadingIcon: '/terminal/share.svg',
}

/** Figma node 4039:11895 — full Price Chart export (static asset in /public). */
export const copilotPriceChart = '/copilot-price-chart.png'
