/**
 * HyprEarn **Homepage / Vaults** surface — Figma `4421:6149` (Homepage file).
 * Separate from terminal AI Copilot tokens in `design-tokens.css`.
 */
export const vaultsFont = "Onest, ui-sans-serif, system-ui, sans-serif";

export const vaultsColors = {
  bg: "#000000",
  surface: "#0c0a08",
  surfaceRaised: "#1e1b18",
  cream: "#e8d5b5",
  mutedLabel: "#717182",
  statMuted: "rgba(255,255,255,0.4)",
  zincValue: "#d4d4d8",
  gold: "#ccb17f",
  goldMid: "#e8d5b5",
  goldDeep: "#785a28",
  borderSubtle: "rgba(255,255,255,0.05)",
  borderHairline: "rgba(255,255,255,0.06)",
  popularText: "#51a2ff",
  popularBorder: "rgba(43,127,255,0.2)",
  popularBg: "rgba(43,127,255,0.1)",
  activateBorder: "rgba(120,90,40,0.2)",
  bronzeStrip: "#5a431e",
} as const;

export const vaultsGradients = {
  heroTitle:
    "linear-gradient(180deg, #ffffff 0%, #e8d5b5 50%, #785a28 100%)",
  statValue:
    "linear-gradient(180deg, #ffffff 0%, #e8d5b5 50%, #ccb17f 100%)",
  activateButton:
    "linear-gradient(180deg, rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)",
  sliderFill:
    "linear-gradient(180deg, #5a431e 0%, #694e23 50%, #785a28 100%)",
} as const;
