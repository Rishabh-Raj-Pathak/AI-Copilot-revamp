/** @typedef {{ id: string, name: string, status: string, marketId?: string, market?: string, timeframe?: string, lastUpdated?: string, sortOrder?: number, deployment?: { status?: string } }} SidebarStrategy */

export const MARKET_TOKEN_ICONS = {
  btc: "/copilot-tokens/sol.png",
  eth: "/copilot-tokens/eth.png",
  sol: "/copilot-tokens/sol.png",
  hype: "/copilot-tokens/sui.png",
  custom: "/copilot-tokens/eth.png",
};

const DEFAULT_TOKEN_ICON = "/copilot-tokens/eth.png";

/** Sidebar sections in display order: Deployed → Backtested → Draft */
export const SIDEBAR_STATUS_SECTIONS = [
  {
    id: "deployed",
    label: "Deployed",
    match: (s) =>
      s.status === "Ready" ||
      s.status === "Paper Trading" ||
      s.deployment?.status === "active",
  },
  {
    id: "backtested",
    label: "Backtested",
    match: (s) => s.status === "Backtested",
  },
  {
    id: "draft",
    label: "Draft",
    match: (s) => s.status === "Draft",
  },
];

/**
 * @param {string} [marketId]
 */
export function getMarketTokenIcon(marketId) {
  if (!marketId) return DEFAULT_TOKEN_ICON;
  return MARKET_TOKEN_ICONS[marketId] ?? DEFAULT_TOKEN_ICON;
}

/**
 * @param {SidebarStrategy} strategy
 */
export function formatStrategyRowMeta(strategy) {
  const market = (strategy.market ?? "").trim();
  const tf = (strategy.timeframe ?? "").trim();
  const status = (strategy.status ?? "").trim();

  let marketPart = market;
  if (tf && market && !market.includes(tf)) {
    marketPart = `${market} · ${tf}`;
  } else if (!market && tf) {
    marketPart = tf;
  }

  const parts = [marketPart, status].filter(Boolean);
  return parts.join(" · ");
}

/**
 * @param {string} [lastUpdated]
 */
function recencyScore(lastUpdated) {
  if (!lastUpdated) return 9999;
  const s = lastUpdated.toLowerCase();
  if (s.includes("just now")) return 0;
  const min = s.match(/(\d+)\s*m/);
  if (min) return Number(min[1]);
  const hr = s.match(/(\d+)\s*h/);
  if (hr) return Number(hr[1]) * 60;
  const day = s.match(/(\d+)\s*d/);
  if (day) return Number(day[1]) * 60 * 24;
  return 5000;
}

/**
 * @param {SidebarStrategy[]} strategies
 * @param {string} search
 */
export function filterStrategiesBySearch(strategies, search) {
  const q = search.trim().toLowerCase();
  if (!q) return strategies;
  return strategies.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.market ?? "").toLowerCase().includes(q) ||
      (s.status ?? "").toLowerCase().includes(q),
  );
}

/**
 * @param {SidebarStrategy[]} items
 */
function sortByRecency(items) {
  return [...items].sort((a, b) => {
    const ao = a.sortOrder ?? recencyScore(a.lastUpdated);
    const bo = b.sortOrder ?? recencyScore(b.lastUpdated);
    return ao - bo;
  });
}

/**
 * @param {SidebarStrategy[]} strategies
 * @param {string} search
 * @returns {{ id: string, label: string, items: SidebarStrategy[] }[]}
 */
export function groupStrategiesForSidebar(strategies, search) {
  const filtered = filterStrategiesBySearch(strategies, search);
  const sections = [];

  for (const def of SIDEBAR_STATUS_SECTIONS) {
    const items = sortByRecency(filtered.filter(def.match));
    if (items.length === 0) continue;
    sections.push({
      id: def.id,
      label: def.label,
      items,
    });
  }

  return sections;
}
