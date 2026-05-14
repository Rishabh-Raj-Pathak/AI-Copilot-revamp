/** Mock rows — Figma Homepage `4421:6256` / `4421:6472` (Featured + Available stacks). */
import { VAULT_STATS_DEFAULT } from "./vaultsMockData.stats.js";

export { VAULT_STATS_DEFAULT };

export const featuredVaults = [
  {
    id: "bluechip",
    name: "BlueChip",
    strategyLabel: "Automated Strategy",
    activationDescriptor: "Cortex Alpha",
    badge: { type: "popular", label: "POPULAR" },
    stats: {
      volume: "$149,516",
      apr: "20.12%",
      users: "15",
      pnl: "-$0.7",
    },
    maxLabel: "MAX: 2,541",
    bronzeStrip: true,
    tall: false,
    iconKey: "pulse",
    venues: ["hyperliquid", "paradex", "nado"],
  },
  {
    id: "hip3-featured",
    name: "HIP-3",
    strategyLabel: "Automated Strategy",
    badge: { type: "highApr", label: "HIGH APR" },
    subline: "NO FEE",
    sublineTone: "gold",
    stats: VAULT_STATS_DEFAULT,
    maxLabel: "MAX: 10,000",
    bronzeStrip: true,
    tall: true,
    iconKey: "hex",
    venues: ["hyperliquid"],
  },
  {
    id: "trending",
    name: "Trending",
    strategyLabel: "Automated Strategy",
    badge: { type: "highRisk", label: "HIGH RISK" },
    stats: VAULT_STATS_DEFAULT,
    maxLabel: "MAX: 10,000",
    bronzeStrip: true,
    tall: false,
    iconKey: "bolt",
    venues: ["hyperliquid", "paradex", "nado"],
  },
];

export const availableVaults = [
  {
    id: "dependent",
    name: "Dependent",
    strategyLabel: "Automated Strategy",
    stats: VAULT_STATS_DEFAULT,
    maxLabel: "MAX: 10,000",
    bronzeStrip: false,
    tall: false,
    iconKey: "hex",
    venues: ["paradex", "nado"],
  },
  {
    id: "hip3-available",
    name: "HIP-3",
    strategyLabel: "Automated Strategy",
    subline: "NO FEE",
    sublineTone: "gold",
    stats: VAULT_STATS_DEFAULT,
    maxLabel: "MAX: 10,000",
    bronzeStrip: false,
    tall: true,
    iconKey: "pulse",
    venues: ["hyperliquid"],
  },
  {
    id: "hyperliquid-vault",
    name: "Hyperliquid",
    strategyLabel: "Automated Strategy",
    stats: VAULT_STATS_DEFAULT,
    maxLabel: "MAX: 10,000",
    bronzeStrip: false,
    tall: false,
    iconKey: "pulse",
    venues: ["hyperliquid"],
  },
];

export const dexTabs = [
  { id: "all", label: "All Dexs" },
  { id: "hyperliquid", label: "Hyperliquid" },
  { id: "paradex", label: "Paradex" },
  { id: "nado", label: "Nado" },
];
