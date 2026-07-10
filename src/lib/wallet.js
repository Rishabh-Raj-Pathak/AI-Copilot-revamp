/**
 * Mock wallet session for the frontend prototype — there is no wallet SDK and no
 * backend behind any of this. Swap these constants for real account/chain data
 * when a provider gets wired in.
 */

export const MOCK_WALLET_ADDRESS =
  "0xbf47a3c2e91d6b8f45ca0e7d2b1f9c83ee4eedea";

export const WALLET_CHAIN = {
  id: "ink",
  label: "Ink",
  explorerName: "Ink Explorer",
  explorerBaseUrl: "https://explorer.inkonchain.com",
};

/**
 * `0xbf47a3…4eedea` — head/tail lengths count characters, `0x` included in `head`.
 * @param {string} address
 * @param {{ head?: number, tail?: number, separator?: string }} [options]
 */
export function truncateAddress(address, options = {}) {
  const { head = 6, tail = 6, separator = "…" } = options;
  if (!address) return "";
  if (address.length <= head + tail + separator.length) return address;
  return `${address.slice(0, head)}${separator}${address.slice(-tail)}`;
}

/** @param {string} address */
export function addressExplorerUrl(address, chain = WALLET_CHAIN) {
  return `${chain.explorerBaseUrl}/address/${address}`;
}
