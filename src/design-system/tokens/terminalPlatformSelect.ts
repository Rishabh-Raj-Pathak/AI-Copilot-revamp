/**
 * Terminal — **platform / venue** pill trigger + dropdown menu (navbar, beside Deposit).
 *
 * Surfaces: pill `rounded-full`, `--palette-neutral-10` border, compact type matching nav CTAs.
 */

export const terminalPlatforms = [
  { id: "hyperliquid", label: "Hyperliquid" },
  { id: "nado", label: "Nado" },
  { id: "pacifica", label: "Pacifica" },
  { id: "paradex", label: "Paradex" },
] as const;

export type TerminalPlatformId = (typeof terminalPlatforms)[number]["id"];

export const terminalPlatformSelect = {
  /** Outer wrapper — `relative` for menu positioning. */
  root: "relative",
  /** Pill trigger — icon + label + chevron. */
  trigger:
    "flex items-center gap-2 rounded-full border border-[#242424] bg-black py-1.5 pr-2.5 pl-2 text-sm font-semibold text-white shadow-none outline-none transition-colors hover:bg-[#0d0d0d] focus-visible:ring-2 focus-visible:ring-[#f2b500]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  /** Circular frame around venue mark (mint ring for HL-style refs). */
  iconFrame:
    "flex size-7 shrink-0 items-center justify-center rounded-full border border-[#3ae8c4]/55 bg-[#050807] p-1",
  chevron: "size-4 shrink-0 text-[#bfbfbf]",
  menu: "absolute top-[calc(100%+6px)] right-0 z-50 min-w-[11.5rem] overflow-hidden rounded-lg border border-[#242424] bg-black py-1 shadow-lg",
  menuItem:
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-white/[0.06]",
  menuItemActive: "bg-[#3e2e00]/80 text-[#f2b500]",
  menuItemIconFrame:
    "flex size-7 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#0a0a0a] p-1",
} as const;
