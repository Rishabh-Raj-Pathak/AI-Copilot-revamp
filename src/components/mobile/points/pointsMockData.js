/**
 * Points leaderboard mock — Figma "More / Points — Full Page" (957:5421).
 * There is no points service in the prototype; the top ten All Time rows are
 * the artboard's own, the rest of each board is generated deterministically
 * so the pager has somewhere to go and every visit shows the same standings.
 */

/** Points earned in the current weekly cycle by the connected wallet. */
export const CURRENT_CYCLE_POINTS = 12.48;

/** Rows per leaderboard page (the artboard shows eight). */
export const LEADERBOARD_PAGE_SIZE = 8;

const ALL_TIME_TOP = [
  ["0xa69c41e2b07f3d9a5e18c6b24f0d9e73a1b5c007", 2192744.14],
  ["0x6af2d3b98e14c07a5f62e1d9b38c4a7f02e9ed05", 2162166.41],
  ["0x780e5c1a9d36b24f8e07a1c5d92b6e3f4a7c18a0", 1712459.05],
  ["0x7bf93a0d5e2c8b14f6a7e3d09c1b5f28e4a6d060", 859769.69],
  ["0xd58b2e7c04a9f13d6e8b5c2a7f09d4e1b36ca8c1", 475029.27],
  ["0x4ca7e19b3d05f2c8a6e4b7d1093f5c2e8ab17a6a", 404709.7],
  ["0x428d6f3b9e1c07a5d2e8f4b6c3a9105e7d2c847f", 314949.73],
  ["0x5e0c3b8a6f1d9e2b4c7a05f3d8e6b1c9a2f437c0", 310434.64],
  ["0x625f8a1e3c7b0d9f2e5a4c6b8d1e07f3a9c5eb60", 304752.02],
  ["ggrbe7Hq2xKfLp9VtN3mWcYd4sRa8JzUeB6oTkfjb", 284055.07],
];

/** Park–Miller PRNG, so the generated tail is identical on every load. */
function seeded(seed) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

function generateRows(count, startVolume, seed) {
  const rand = seeded(seed);
  const hex = "0123456789abcdef";
  const rows = [];
  let volume = startVolume;
  for (let i = 0; i < count; i += 1) {
    let address = "0x";
    for (let c = 0; c < 40; c += 1) address += hex[Math.floor(rand() * 16)];
    volume = Math.round(volume * (0.9 + rand() * 0.07) * 100) / 100;
    rows.push([address, volume]);
  }
  return rows;
}

function rank(rows) {
  return rows.map(([address, effVolume], i) => ({ rank: i + 1, address, effVolume }));
}

export const POINTS_LEADERBOARD = {
  allTime: rank([...ALL_TIME_TOP, ...generateRows(30, 284055.07, 7)]),
  currentWeek: rank(generateRows(24, 412380.55, 31)),
};

/** `$2,192,744.14` / `$404,709.7` — up to two decimals, as the artboard prints them. */
export function formatEffVolume(value) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** `0xa69 ... 007` — the artboard's head-5 / tail-3 truncation. */
export function formatLeaderAddress(address) {
  return `${address.slice(0, 5)} ... ${address.slice(-3)}`;
}

/**
 * The next weekly points distribution: Monday 00:00 UTC ("Coins are
 * distributed every Monday" — `pointsData.js`). At the stroke of Monday the
 * countdown rolls straight over to the following week.
 */
export function nextDistribution(now = Date.now()) {
  const date = new Date(now);
  const daysUntilMonday = (8 - date.getUTCDay()) % 7 || 7;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + daysUntilMonday);
}
