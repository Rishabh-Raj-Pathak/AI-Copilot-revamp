/** Compact stat formatting — Figma mobile Copilot KPI row (1017:24652). */

export function formatMobileVolumeUsd(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toLocaleString("en-US")}`;
}

export function formatMobileCount(n) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString("en-US");
}

export function formatMobileRewardsUsd(n) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}
