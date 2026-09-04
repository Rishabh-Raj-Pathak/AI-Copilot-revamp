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
 * The renders are squares — a disc on a flat pad — so `width` is the size
 * dial, not height. Measured against the card rather than the zone: the zone
 * grows when a title wraps to two lines, and a square that grew with it would
 * be a different size in every column of the grid. Off the width it holds one
 * size the whole way across.
 *
 * The coin is deliberately drawn taller than the zone that holds it. The zone
 * stops on the first rule and clips, so the disc is cut dead on that line and
 * reads as though it continues behind it. Everything here — the size, the two
 * offsets — exists to put the interesting part of the disc above that cut.
 *
 * `top` and `right` stay tuned per render because each file frames its disc a
 * little differently; the pair currently sits within a couple of pixels of
 * each other, which is coincidence rather than a rule to lean on.
 *
 * On the files themselves: the source squares are 1080x1080 RGBA with a real
 * alpha channel — nothing behind the disc — shipped here at 424, three times
 * the ~141 they draw at. Take them from the design's own SVG payload rather
 * than by rendering the frame: a render composites the disc onto whatever sits
 * behind it, which bakes a flat pad into the file, and an opaque pad on a black
 * card is a visible grey box with a hard edge — the one thing that breaks the
 * illusion the cut exists to create.
 */
export const COMPETITIONS = [
  {
    id: "lighter",
    venue: "Lighter",
    title: "Lighter Trading Competition",
    tagline:
      "Trade Lighter through HyprEarn. Every position counts toward your volume.",
    status: "live",
    art: { src: "/compete/lighter-coin.png", width: 32.6, top: 2.7, right: 1.85 },
    prizePool: { funded: 6240, total: 15000 },
    participants: 418,
    volume: 2140000,
    /**
     * Rank 1 on the live leaderboard, by volume — the rule the board itself
     * ranks on. Carried by address, which is the honest default: the board's
     * own column is "X Handle / Wallet", and linking X is what entering the
     * competition asks for, so a leader is a wallet until they have done it.
     * Add an optional `handle` and `formatTrader` names them instead.
     */
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
    art: { src: "/compete/pacifica-coin.png", width: 32.6, top: 4.7, right: 1.39 },
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

/**
 * How a trader is named anywhere they are shown as a person rather than as a
 * row of numbers: their X handle when they have linked one, their shortened
 * address when they have not. Same fallback the leaderboard column uses, so a
 * leader named on a card is named the same way on the board it links to.
 *
 * X caps a handle at 15 characters, so `@` plus a handle is 16 at worst and a
 * linked trader always fits the column the card gives them. The trim is for
 * names that did not come from X and would otherwise run past the address they
 * replaced; it ends in the same ellipsis `formatWallet` puts mid-address, for
 * the same reason — a name that visibly lost its tail still reads as a name.
 */
const HANDLE_MAX = 15;

export function formatTrader({ handle, wallet }) {
  if (!handle) return formatWallet(wallet);
  if (handle.length <= HANDLE_MAX) return `@${handle}`;
  return `@${handle.slice(0, HANDLE_MAX)}…`;
}

export function formatEndedOn(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
