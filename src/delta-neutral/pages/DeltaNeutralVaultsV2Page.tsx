/*
 * Delta Neutral 2.
 *
 * A copy of DeltaNeutralVaults3Page (Delta Neutral 1), forked so that v2 can be
 * changed without touching the version in use. The two are byte-identical apart from
 * the export name and the seed ids -- every difference between them is meant to be
 * written here, not merged back.
 *
 * The fork is at the page level only: both still import the same builder, cards and
 * utils out of ../components and ../utils. A v2 change that reaches into one of those
 * will land on v1 as well, so that component has to be forked or given a variant prop
 * at the point it happens -- DeltaVaultBuilder already takes a `variant` for exactly
 * this reason.
 */
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { UserStatsStrip } from '../components/UserStatsStrip';
import { DeltaVaultBuilder, type DeltaVaultBuilderResult } from '../components/DeltaVaultBuilder';
import { ActiveVaultCard, type ActiveVaultCardModel, type VaultSettings } from '../components/ActiveVaultCard';
import { StrategyDeepDive } from '../components/StrategyDeepDive';
import { PerpBottomPanel } from '../components/PerpBottomPanel';
import { walletForDex } from '../utils/wallet';
import { carryOver, INITIAL_LEDGER, recordClose, recordTrade, userVaultStats } from '../utils/userStats';
import useIsMobile from '../../components/mobile/useIsMobile.js';
import Dn2Screen from '../../components/mobile/dn2/Dn2Screen.jsx';

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
    id: 'v2ui-seed-0',
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
    totalVolumeUsd: 262900,
    volume7dUsd: 36800,
  },
  {
    id: 'v2ui-seed-1',
    pair: 'Trending',
    marketType: 'category',
    longAccount: 'Nado',
    shortAccount: 'Hyperliquid',
    status: 'balanced',
    longPnl: 102.4,
    shortPnl: -97.5,
    fundingEarned: 12.7,
    notional: 20500,
    hedgeHealth: 96,
    totalVolumeUsd: 139400,
    volume7dUsd: 12500,
  },
  {
    id: 'v2ui-seed-2',
    pair: 'HIP-3',
    marketType: 'category',
    longAccount: 'Hyperliquid',
    shortAccount: 'Pacifica',
    status: 'balanced',
    longPnl: 88.1,
    shortPnl: -84.0,
    fundingEarned: 10.8,
    notional: 19200,
    hedgeHealth: 88,
    totalVolumeUsd: 347500,
    volume7dUsd: 73000,
  },
  {
    id: 'v2ui-seed-3',
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
    totalVolumeUsd: 73900,
    volume7dUsd: 3000,
  },
  {
    id: 'v2ui-seed-4',
    pair: 'Equities',
    marketType: 'category',
    longAccount: 'Nado',
    shortAccount: 'Hyperliquid',
    status: 'balanced',
    longPnl: 95.0,
    shortPnl: -91.2,
    fundingEarned: 12.1,
    notional: 22100,
    hedgeHealth: 93,
    totalVolumeUsd: 212200,
    volume7dUsd: 25500,
  },
  {
    id: 'v2ui-seed-5',
    pair: 'Perps',
    marketType: 'category',
    longAccount: 'Nado',
    shortAccount: 'Pacifica',
    status: 'balanced',
    longPnl: 76.9,
    shortPnl: -73.4,
    fundingEarned: 10.1,
    notional: 16800,
    hedgeHealth: 74,
    totalVolumeUsd: 257000,
    volume7dUsd: 46300,
  },
  {
    id: 'v2ui-seed-6',
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
    totalVolumeUsd: 112900,
    volume7dUsd: 7900,
  },
  {
    id: 'v2ui-seed-7',
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
    totalVolumeUsd: 181700,
    volume7dUsd: 29100,
  },
  {
    id: 'v2ui-seed-8',
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
    totalVolumeUsd: 76100,
    volume7dUsd: 3800,
  },
  {
    id: 'v2ui-seed-9',
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
    totalVolumeUsd: 520800,
    volume7dUsd: 125000,
  },
  {
    id: 'v2ui-seed-10',
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
    totalVolumeUsd: 294800,
    volume7dUsd: 56000,
  },
];

export function DeltaNeutralVaultsV2Page() {
  const [vaults, setVaults] = useState<ActiveVaultCardModel[]>(() => seedVaults.map(withVaultWallets));
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeVaultTab, setActiveVaultTab] = useState<ActiveVaultTab>('all');
  const isMobile = useIsMobile();

  const filteredVaults =
    activeVaultTab === 'all'
      ? vaults
      : vaults.filter(v => v.marketType === activeVaultTab);
  const categoryVaults = filteredVaults.filter(v => v.marketType === 'category');
  const tokenVaults = filteredVaults.filter(v => v.marketType === 'token');
  const userStats = userVaultStats(vaults, ledger);

  const handleActivate = (payload: DeltaVaultBuilderResult) => {
    const next = [resultToVaultModel(payload), ...vaults];
    setVaults(next.slice(0, 6));
    // Vaults pushed off the six-row list still count toward the lifetime stats.
    setLedger(prev => recordTrade(carryOver(prev, next.slice(6))));
    setExpandedId(null);
  };

  /*
   * Phone: a new vault joins the list rather than replacing the oldest six, and it
   * carries what it was sized with -- the card quotes Margin, the editor starts from
   * it, and notional is margin x leverage, as handleSaveSettings writes it. It has
   * traded nothing yet, so its volume reads $0 rather than "--".
   */
  const addPhoneVault = (payload: DeltaVaultBuilderResult): ActiveVaultCardModel => {
    const base = resultToVaultModel(payload);
    const marginUsd = payload.marginUsd ? Math.round(payload.marginUsd) : undefined;
    const model: ActiveVaultCardModel = {
      ...base,
      marginUsd,
      leverage: payload.leverage,
      notional: marginUsd && payload.leverage ? Math.round(marginUsd * payload.leverage) : base.notional,
      totalVolumeUsd: 0,
      volume7dUsd: 0,
    };
    setVaults(prev => [model, ...prev]);
    setLedger(recordTrade);
    return model;
  };

  /*
   * Notional is recomputed rather than carried: it is margin x leverage by definition,
   * and leaving the old figure in place would leave the card reporting a NAV and a
   * capital-used figure that no longer describe the position the user just resized.
   */
  const handleSaveSettings = (id: string, next: VaultSettings) => {
    setVaults(prev =>
      prev.map(v =>
        v.id === id
          ? {
              ...v,
              marginUsd: next.marginUsd,
              leverage: next.leverage,
              notional: Math.round(next.marginUsd * next.leverage),
            }
          : v,
      ),
    );
  };

  const handleStop = (id: string) => {
    const stopped = vaults.find(v => v.id === id);
    setVaults(prev => prev.filter(v => v.id !== id));
    if (stopped) setLedger(prev => recordClose(prev, stopped));
    if (expandedId === id) setExpandedId(null);
  };

  // Keys the builder can produce, plus the legacy names still carried by the seeded vaults above.
  const categoryDexTokenMapByPair: Record<string, Partial<Record<ActiveVaultCardModel['longAccount'], string>>> = {
    'Top Picks': { Hyperliquid: 'BTC/USDC', Pacifica: 'BTC/USDC' },
    Stocks: { Pacifica: 'NVDA/USDC', Hyperliquid: 'NVDA/USDC' },
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
          onSaveSettings={next => handleSaveSettings(v.id, next)}
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

  /*
    Phone: Figma "Delta Neutral 2 · Mobile-native (390)" (kN9AkNRzaxmg4mhFVkt1Bo, 4476:2).
    Same vault state and handlers as below. The builder becomes a Cross-DEX setup card
    that opens a "New vault" page, and the bottom Positions / History panel becomes
    two sub-tabs beside Vaults -- so no PerpBottomPanel here. The stat strip is not
    shown on the phone. Signed out, the lists are empty states (Figma A4).
  */
  if (isMobile) {
    return (
      <Dn2Screen
        vaults={vaults}
        onAddVault={addPhoneVault}
        onSaveSettings={handleSaveSettings}
        onStop={handleStop}
        renderBuilder={(heroVisible: boolean, onActivate: (payload: DeltaVaultBuilderResult) => void) => (
          <DeltaVaultBuilder onActivate={onActivate} phoneLayout="page" phoneHeroVisible={heroVisible} />
        )}
      />
    );
  }

  return (
    <>
      <main className="flex flex-1 mx-auto w-full max-w-[1280px] flex-col gap-5 max-tablet:gap-4 tablet:gap-6 pb-[calc(128px+env(safe-area-inset-bottom))] tablet:pb-[164px]">
      <section className="flex flex-col gap-4 max-tablet:gap-3">
        <div className="flex flex-col gap-2 max-tablet:gap-1 pr-8">
          <h1 className="vaults-hero-title-gradient w-fit text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.02em] max-tablet:text-[clamp(1.625rem,5vw,2rem)] max-tablet:leading-[1.1]">
            Delta Neutral
          </h1>
          <p className="max-w-[680px] text-[15px] leading-6 text-white/90 max-tablet:line-clamp-2 max-tablet:text-[13px] max-tablet:leading-5">
            Funding yield, engineered to be directionless. HyprEarn continuously routes into the highest-volume pair between your two venues to tighten execution and maximize funding capture.
          </p>
        </div>

        <UserStatsStrip stats={userStats} />
      </section>

      <DeltaVaultBuilder onActivate={handleActivate} />

      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3 max-tablet:flex tablet:hidden">
          <div className="vaults-section-hairline" />
          <h2 className="shrink-0 font-['Onest',sans-serif] text-[18px] font-medium leading-[1.35] text-[#e8d5b5]">
            Active vaults
          </h2>
          <div className="vaults-section-hairline" />
        </div>
        <div className="hidden items-center gap-3 tablet:flex">
          <span className="whitespace-nowrap font-['Onest',sans-serif] text-[11px] font-semibold uppercase tracking-[1.4px] text-[#888994]">
            Active vaults
          </span>
          <div className="min-w-[40px] flex-1 h-px bg-gradient-to-r from-[rgba(214,176,106,0.25)] to-transparent" />
        </div>

        <div className="flex flex-wrap items-center gap-1 max-tablet:gap-1 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.78)] p-1.5">
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
                className={`h-[31px] max-tablet:min-h-[44px] max-tablet:flex-1 rounded-[9px] px-3 text-[10px] font-semibold uppercase tracking-[0.85px] transition-colors ${
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
      {/*
        v2 only. Positions shows how long each pair has been open and History how long
        each trade was held; v1 keeps the panel without the Duration column.
      */}
      <PerpBottomPanel showTradeDuration />
    </>
  );
}
