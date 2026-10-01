import { appImages } from "./mobileAssets.js";

/**
 * Venues in the mobile "Select venue" sheet, in Figma order (944:2832).
 *
 * The desktop `TerminalPlatformSelect` still lists its own four. Ids for the
 * shared four (hyperliquid, nado, pacifica, paradex) match it, so a venue
 * picked on the phone survives a resize to desktop.
 */
export const APP_VENUES = [
  { id: "hyperliquid", label: "Hyperliquid" },
  { id: "zklighter", label: "zkLighter" },
  { id: "lighter-robinhood", label: "Lighter@Robinhood" },
  { id: "arcus", label: "Arcus" },
  { id: "decibel", label: "Decibel" },
  { id: "pacifica", label: "Pacifica" },
  { id: "nado", label: "Nado" },
  { id: "avantis", label: "Avantis" },
  { id: "paradex", label: "Paradex" },
].map((v) => ({ ...v, logo: appImages.venue[v.id] }));

export function venueById(id) {
  return APP_VENUES.find((v) => v.id === id) ?? APP_VENUES[0];
}
