/**
 * Competition hub data — no backend behind any of it (same posture as
 * `rewardsMockData.js`).
 *
 * Dates are derived from load time rather than hardcoded so the proto always
 * demos in the same state: Lighter perpetually mid-flight with a live
 * countdown, Pacifica perpetually settled. A hardcoded ISO date would quietly
 * turn the "live" card into an expired one a few weeks from now.
 */

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

/**
 * Key art — the 3D venue coin that sits top-right of each card.
 *
 * `height` is a percentage of the card's ART ZONE (header + title block),
 * tuned per render rather than shared:
 * the Lighter coin is a wide ellipse and the Pacifica one is nearly square, so
 * a single number makes the first sprawl and the second look lost. These two
 * give both roughly the same AREA, which is the honest way to match mass across
 * different aspect ratios — matching width would shrink the square one to a
 * sticker (Figma 7107:30 / 7107:31).
 *
 * Zone-relative rather than card-relative, because a tile is short and wide at
 * one column and tall and narrow at three. Width follows the aspect ratio; the
 * zone masks and clips the result, so copy may cross its faded edge but the
 * funding bar and stat row below are never touched.
 */
export const COMPETITIONS = [
  {
    id: "lighter",
    venue: "Lighter",
    title: "Lighter Trading Competition",
    tagline:
      "Trade Lighter through HyprEarn. Every position counts toward your volume.",
    status: "live",
    art: { src: "/compete/lighter-coin.png", height: 92 },
    prizePool: { funded: 6240, total: 15000 },
    participants: 418,
    volume: 2140000,
    /** Ranked by volume, highest first — matches the live leaderboard rules. */
    leader: { wallet: "0x0ef…09284071f", volume: 486210, share: 0.25 },
    startedAt: NOW - 3 * DAY,
    endsAt: NOW + 4.5 * DAY,
    windowLabel: "14 days · top 10 split the pool",
  },
  {
    id: "pacifica",
    venue: "Pacifica",
    title: "Pacifica Trading Competition",
    tagline:
      "Our first venue competition. Settled and paid out to the top 10 wallets.",
    status: "ended",
    art: { src: "/compete/pacifica-coin.png", height: 102 },
    prizePool: { funded: 10000, total: 10000 },
    participants: 1284,
    volume: 8410000,
    winner: { wallet: "0xc08…bb865f6f9", volume: 1284400, prize: 2500 },
    endedAt: NOW - 11 * DAY,
    windowLabel: "14 days · fully distributed",
  },
];

/**
 * `$2.1M` / `$15K` / `$508` — compact enough for a stat cell. A whole number
 * drops its decimal, so a round pool reads `$15K` rather than `$15.0K`.
 */
export function formatUsdCompact(value) {
  const scale = (n, suffix) =>
    `$${Number.isInteger(n) ? n : n.toFixed(1)}${suffix}`;
  if (value >= 1_000_000) return scale(round1(value / 1_000_000), "M");
  if (value >= 1_000) return scale(round1(value / 1_000), "K");
  return `$${value.toLocaleString("en-US")}`;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function formatUsd(value) {
  return `$${value.toLocaleString("en-US")}`;
}

/** `4d 12h` while days remain, then `12h 04m`, then `04m 21s` in the last hour. */
export function formatRemaining(ms) {
  if (ms <= 0) return "Ended";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((ms % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

/**
 * `0xc08…f6f9` — a winner line has to sit on one row of a tile, and the stored
 * value carries a nine-character tail that pushes it into a wrap. Nobody reads
 * the middle of an address; four characters either side is the convention.
 */
export function formatWallet(wallet) {
  const [head, tail] = wallet.split("…");
  if (tail === undefined) return `${wallet.slice(0, 5)}…${wallet.slice(-4)}`;
  return `${head}…${tail.slice(-4)}`;
}

export function formatEndedOn(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
