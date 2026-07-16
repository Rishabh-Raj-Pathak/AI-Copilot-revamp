import type { ManagedDexId } from '../components/ActiveVaultCard';

export function formatWalletAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const MOCK_DEX_WALLETS: Record<ManagedDexId, string> = {
  Hyperliquid: '0x7a3f8421c9f2e',
  Nado: '0x92bc18a4d7f1',
  Pacifica: '0x4d5e09b8c3a6',
  Variational: '0x6b1fa7d3e8c2',
};

export const MOCK_PARADEX_WALLET = '0x3c8f12e5b9a4';

export function walletForDex(dex: ManagedDexId): string {
  return MOCK_DEX_WALLETS[dex];
}
