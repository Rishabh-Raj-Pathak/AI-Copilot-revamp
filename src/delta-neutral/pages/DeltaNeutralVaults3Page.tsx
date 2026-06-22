import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DeltaVaultBuilder, type DeltaVaultBuilderResult } from '../components/DeltaVaultBuilder';
import { ActiveVaultCard, type ActiveVaultCardModel } from '../components/ActiveVaultCard';
import { StrategyDeepDive } from '../components/StrategyDeepDive';
import { PerpBottomPanel } from '../components/PerpBottomPanel';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import { walletForDex } from '../utils/wallet';

type ActiveVaultTab = 'all' | 'category' | 'token';

function inferMarketType(pair: string): 'category' | 'token' {
  return pair.includes('/') ? 'token' : 'category';
}

function withVaultWallets(
  vault: Omit<ActiveVaultCardModel, 'longWallet' | 'shortWallet'>,
): ActiveVaultCardModel {
  return {
    ...vault,
    longWallet: walletForDex(vault.longAccount),
    shortWallet: walletForDex(vault.shortAccount),
  };
}

function resultToVaultModel(r: DeltaVaultBuilderResult): ActiveVaultCardModel {
  const half = r.notional / 2;
  const longPnl = 120 * (r.longNotional / Math.max(half, 1));
  const shortPnl = -120 * (r.shortNotional / Math.max(half, 1));
  const fundingEarned = 15.5 * (r.estAprPct / 24);
  return {
    id: `v3-${Date.now()}`,
    pair: r.pair,
    marketType: inferMarketType(r.pair),
    longAccount: r.longDex,
    shortAccount: r.shortDex,
    longWallet: r.longWallet,
    shortWallet: r.shortWallet,
    status: Math.abs(r.delta) < 1 ? 'balanced' : 'rebalancing',
    longPnl,
    shortPnl,
    fundingEarned,
    notional: r.notional,
    hedgeHealth: Math.abs(r.delta) < 1 ? 100 : 62,
  };
}

const seedVaults: Omit<ActiveVaultCardModel, 'longWallet' | 'shortWallet'>[] = [
  {
    id: 'v3-seed-0',
    pair: 'Bluechip',
    marketType: 'category',
    longAccount: 'Hyperliquid',
    shortAccount: 'Pacifica',
    status: 'rebalancing',
    longPnl: 93.5,
    shortPnl: -88.2,
    fundingEarned: 11.3,
    notional: 21200,
    hedgeHealth: 79,
  },
  {
    id: 'v3-seed-1',
    pair: 'Trending',
    marketType: 'category',
    longAccount: 'Hyperliquid',
    shortAccount: 'Nado',
    status: 'balanced',
    longPnl: 102.4,
    shortPnl: -97.5,
    fundingEarned: 12.7,
    notional: 20500,
    hedgeHealth: 96,
  },
  {
    id: 'v3-seed-2',
    pair: 'HIP-3',
    marketType: 'category',
    longAccount: 'Pacifica',
    shortAccount: 'Hyperliquid',
    status: 'balanced',
    longPnl: 88.1,
    shortPnl: -84.0,
    fundingEarned: 10.8,
    notional: 19200,
    hedgeHealth: 88,
  },
  {
    id: 'v3-seed-3',
    pair: 'Commodities',
    marketType: 'category',
    longAccount: 'Nado',
    shortAccount: 'Pacifica',
    status: 'rebalancing',
    longPnl: 71.2,
    shortPnl: -68.9,
    fundingEarned: 9.1,
    notional: 17600,
    hedgeHealth: 82,
  },
  {
    id: 'v3-seed-4',
    pair: 'Equities',
    marketType: 'category',
    longAccount: 'Hyperliquid',
    shortAccount: 'Nado',
    status: 'balanced',
    longPnl: 95.0,
    shortPnl: -91.2,
    fundingEarned: 12.1,
    notional: 22100,
    hedgeHealth: 93,
  },
  {
    id: 'v3-seed-5',
    pair: 'Perps',
    marketType: 'category',
    longAccount: 'Pacifica',
    shortAccount: 'Nado',
    status: 'balanced',
    longPnl: 76.9,
    shortPnl: -73.4,
    fundingEarned: 10.1,
    notional: 16800,
    hedgeHealth: 74,
  },
  {
    id: 'v3-seed-6',
    pair: 'Spot',
    marketType: 'category',
    longAccount: 'Hyperliquid',
    shortAccount: 'Pacifica',
    status: 'rebalancing',
    longPnl: 64.8,
    shortPnl: -62.1,
    fundingEarned: 8.6,
    notional: 15900,
    hedgeHealth: 77,
  },
  {
    id: 'v3-seed-7',
    pair: 'Meme',
    marketType: 'category',
    longAccount: 'Nado',
    shortAccount: 'Pacifica',
    status: 'balanced',
    longPnl: 68.3,
    shortPnl: -61.8,
    fundingEarned: 14.9,
    notional: 15400,
    hedgeHealth: 91,
  },
  {
    id: 'v3-seed-8',
    pair: 'FX',
    marketType: 'category',
    longAccount: 'Hyperliquid',
    shortAccount: 'Pacifica',
    status: 'balanced',
    longPnl: 55.4,
    shortPnl: -53.2,
    fundingEarned: 7.9,
    notional: 14100,
    hedgeHealth: 85,
  },
  {
    id: 'v3-seed-9',
    pair: 'BTC/USDC',
    marketType: 'token',
    longAccount: 'Hyperliquid',
    shortAccount: 'Pacifica',
    status: 'balanced',
    longPnl: 120,
    shortPnl: -120,
    fundingEarned: 15.5,
    notional: 24000,
    hedgeHealth: 100,
  },
  {
    id: 'v3-seed-10',
    pair: 'ETH/USDC',
    marketType: 'token',
    longAccount: 'Hyperliquid',
    shortAccount: 'Pacifica',
    status: 'rebalancing',
    longPnl: 84.2,
    shortPnl: -79.1,
    fundingEarned: 9.8,
    notional: 18200,
    hedgeHealth: 71,
  },
];

const PLATFORM_METRIC_EXPLANATIONS = [
  {
    title: 'Total Volume',
    body: 'Total money that has flowed through the vault system so far.',
  },
  {
    title: 'Yield Distributed',
    body: 'Total profit paid out to users from delta-neutral vault strategies.',
  },
  {
    title: 'Hedge Uptime',
    body: 'How often the hedge stayed active and protective. Higher means your position stayed neutral more consistently.',
  },
];

export function DeltaNeutralVaults3Page() {
  const [vaults, setVaults] = useState<ActiveVaultCardModel[]>(() => seedVaults.map(withVaultWallets));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [platformMetricsOpen, setPlatformMetricsOpen] = useState(false);
  const [activeVaultTab, setActiveVaultTab] = useState<ActiveVaultTab>('all');

  const filteredVaults =
    activeVaultTab === 'all'
      ? vaults
      : vaults.filter(v => v.marketType === activeVaultTab);
  const categoryVaults = filteredVaults.filter(v => v.marketType === 'category');
  const tokenVaults = filteredVaults.filter(v => v.marketType === 'token');

  const handleActivate = (payload: DeltaVaultBuilderResult) => {
    setVaults(prev => [resultToVaultModel(payload), ...prev].slice(0, 6));
    setExpandedId(null);
  };

  const handleStop = (id: string) => {
    setVaults(prev => prev.filter(v => v.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const categoryDexTokenMapByPair: Record<string, Partial<Record<ActiveVaultCardModel['longAccount'], string>>> = {
    Bluechip: { Hyperliquid: 'AAVE/USDC', Pacifica: 'AAVE/USDC' },
    Trending: { Hyperliquid: 'FET/USDC', Nado: 'FET/USDC' },
    'HIP-3': { Hyperliquid: 'INJ/USDC', Pacifica: 'INJ/USDC' },
    Commodities: { Nado: 'PAXG/USDC', Pacifica: 'PAXG/USDC' },
    Equities: { Pacifica: 'SPX/USDC', Hyperliquid: 'SPX/USDC' },
    Perps: { Pacifica: 'SOL/USDC', Hyperliquid: 'SOL/USDC' },
    Spot: { Hyperliquid: 'ETH/USDC', Pacifica: 'ETH/USDC' },
    Meme: { Nado: 'DOGE/USDC', Pacifica: 'DOGE/USDC' },
    FX: { Hyperliquid: 'EUR/USDC', Pacifica: 'EUR/USDC' },
  };

  const renderVaultRows = (items: ActiveVaultCardModel[]) =>
    items.map(v => (
      <div key={v.id} className="flex flex-col gap-0">
        <ActiveVaultCard
          vault={v}
          expanded={expandedId === v.id}
          onToggleExpand={() => setExpandedId(expandedId === v.id ? null : v.id)}
          onStop={() => handleStop(v.id)}
        />
        <AnimatePresence initial={false}>
          {expandedId === v.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <StrategyDeepDive
                pairLabel={v.pair}
                longDex={v.longAccount}
                shortDex={v.shortAccount}
                dexTokenLabelMap={v.marketType === 'category' ? categoryDexTokenMapByPair[v.pair] : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ));

  return (
    <>
      <main className="flex flex-1 mx-auto w-full max-w-[1280px] flex-col gap-5 md:gap-6 pb-[calc(138px+4.25rem+env(safe-area-inset-bottom))] md:pb-[164px]">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="vaults-hero-title-gradient w-fit text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Delta Neutral Vaults
          </h1>
          <p className="max-w-[680px] text-[15px] leading-6 text-white/90">
            Show the math, hide the mess — delta-neutral funding vaults with live hedge health and proof-of-neutrality.
          </p>
        </div>

        <div className="relative">
          <div className="absolute right-0 top-0 z-10 flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Explain platform metrics"
                  className="hidden h-7 w-7 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] text-[#8f90a1] transition-colors hover:border-[rgba(214,176,106,0.4)] hover:text-[#d6b06a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.5)] md:inline-flex"
                >
                  <CircleAlert className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[330px] border-[rgba(146,111,56,0.45)] bg-[linear-gradient(180deg,rgba(14,12,10,0.98)_0%,rgba(8,8,8,0.98)_100%)] p-3.5 text-[#e8d5b5]">
                <p className="text-[12px] font-semibold uppercase tracking-[1px] text-[#ccb17f]">Platform Metrics</p>
                <div className="mt-2 space-y-2">
                  {PLATFORM_METRIC_EXPLANATIONS.map(item => (
                    <div key={item.title} className="text-[11px] leading-relaxed">
                      <p className="font-semibold text-[#e8d5b5]">{item.title}</p>
                      <p className="text-[#9c9cac]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button
              type="button"
              aria-label="Explain platform metrics"
              onClick={() => setPlatformMetricsOpen(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] text-[#8f90a1] transition-colors hover:border-[rgba(214,176,106,0.4)] hover:text-[#d6b06a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(214,176,106,0.5)] md:hidden"
            >
              <CircleAlert className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard variant="vaults" title="Total Volume" value="$128.4M" subtext="Capital routed" />
            <StatCard variant="vaults" title="Yield Distributed" value="$6.2M" subtext="Paid to users" />
            <StatCard variant="vaults" title="Hedge Uptime" value="99.94%" subtext="Strategy reliability" />
          </div>
        </div>
        <Dialog open={platformMetricsOpen} onOpenChange={setPlatformMetricsOpen}>
          <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[14px] border border-[rgba(146,111,56,0.55)] bg-[linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(6,6,6,0.98)_100%)] p-4 text-[#f5f5f5]">
            <DialogTitle className="font-['Onest',sans-serif] text-[14px] text-[#e8d5b5]">Platform Metrics</DialogTitle>
            <DialogDescription className="mt-1 text-[12px] text-[#a5a6b3]">
              Core trust and reliability indicators for delta-neutral vault operations.
            </DialogDescription>
            <div className="mt-2 space-y-2">
              {PLATFORM_METRIC_EXPLANATIONS.map(item => (
                <div key={item.title} className="text-[12px] leading-relaxed">
                  <p className="font-semibold text-[#e8d5b5]">{item.title}</p>
                  <p className="text-[#9c9cac]">{item.body}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <DeltaVaultBuilder onActivate={handleActivate} />

      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap font-['Onest',sans-serif] text-[11px] font-semibold uppercase tracking-[1.4px] text-[#888994]">
            Active vaults
          </span>
          <div className="min-w-[40px] flex-1 h-px bg-gradient-to-r from-[rgba(214,176,106,0.25)] to-transparent" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.78)] p-1.5">
          {([
            { id: 'all', label: 'All' },
            { id: 'category', label: 'Categories' },
            { id: 'token', label: 'Tokens' },
          ] as const).map(tab => {
            const isActive = activeVaultTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveVaultTab(tab.id)}
                className={`h-[31px] rounded-[9px] px-3 text-[10px] font-semibold uppercase tracking-[0.85px] transition-colors ${
                  isActive
                    ? 'border border-[rgba(214,176,106,0.42)] bg-[linear-gradient(180deg,rgba(54,42,28,0.96)_0%,rgba(22,18,13,0.98)_100%)] text-[#f0ddb9]'
                    : 'text-[#9394a1] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#d9dae4]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-[#8d8e99]">
          {activeVaultTab === 'all' && 'All active vaults grouped by category and token.'}
          {activeVaultTab === 'category' && 'Showing category-based vaults only.'}
          {activeVaultTab === 'token' && 'Showing token-pair vaults only.'}
        </p>

        <div className="flex flex-col gap-3">
          {categoryVaults.length > 0 && (
            <div className="space-y-3">
              {renderVaultRows(categoryVaults)}
            </div>
          )}
          {tokenVaults.length > 0 && (
            <div className="space-y-3">
              {renderVaultRows(tokenVaults)}
            </div>
          )}
          {filteredVaults.length === 0 && (
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(14,14,16,0.88)] p-4 text-[13px] text-[#8f90a1]">
              No {activeVaultTab === 'category' ? 'category' : 'token'} vaults are active right now.
            </div>
          )}
        </div>
      </section>
      </main>
      <PerpBottomPanel />
    </>
  );
}
