import React, { useState } from 'react';
import { ExternalLink, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { TabSwitch, TabItem } from './TabSwitch';
import { Pagination } from './Pagination';
import { MobileHistoryItem, type HistoryPairRow } from './MobileHistoryItem';
import { PositionsTable } from './PositionsTable';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/sound';
import { DexLogo } from './DexLogo';
import type { ManagedDexId } from './ActiveVaultCard';
import { WalletAddressLabel } from './WalletAddressLabel';
import { walletForDex } from '../utils/wallet';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const historyData: HistoryPairRow[] = [
  {
    time: '30/01/2026 - 17:12:15',
    coin: 'ARB/USDC',
    event: 'Close',
    long: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      action: 'Close Long',
      price: '0.15510',
      size: '119.6 ARB',
      tradeValue: '18.5504 USDC',
      fee: '0.03 USDC',
      closedPnl: '-0.28 USDC',
      pnlValue: -0.28,
    },
    short: {
      dex: 'Hyperliquid',
      wallet: walletForDex('Hyperliquid'),
      action: 'Close Short',
      price: '0.15529',
      size: '119.6 ARB',
      tradeValue: '18.5726 USDC',
      fee: '0.03 USDC',
      closedPnl: '-0.31 USDC',
      pnlValue: -0.31,
    },
  },
  {
    time: '30/01/2026 - 12:32:18',
    coin: 'ARB/USDC',
    event: 'Open',
    long: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      action: 'Open Long',
      price: '0.15270',
      size: '119.6 ARB',
      tradeValue: '18.2629 USDC',
      fee: '0.03 USDC',
      closedPnl: '0 USDC',
      pnlValue: 0,
    },
    short: {
      dex: 'Hyperliquid',
      wallet: walletForDex('Hyperliquid'),
      action: 'Open Short',
      price: '0.15283',
      size: '119.6 ARB',
      tradeValue: '18.2784 USDC',
      fee: '0.03 USDC',
      closedPnl: '-0.01 USDC',
      pnlValue: -0.01,
    },
  },
  {
    time: '30/01/2026 - 07:07:59',
    coin: 'BTC/USDC',
    event: 'Close',
    long: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      action: 'Close Long',
      price: '83,185',
      size: '0.00012 BTC',
      tradeValue: '9.9822 USDC',
      fee: '0.01 USDC',
      closedPnl: '-0.09 USDC',
      pnlValue: -0.09,
    },
    short: {
      dex: 'Nado',
      wallet: walletForDex('Nado'),
      action: 'Close Short',
      price: '83,190',
      size: '0.00012 BTC',
      tradeValue: '9.9828 USDC',
      fee: '0.01 USDC',
      closedPnl: '-0.08 USDC',
      pnlValue: -0.08,
    },
  },
  {
    time: '30/01/2026 - 02:05:40',
    coin: 'BTC/USDC',
    event: 'Open',
    long: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      action: 'Open Long',
      price: '83,913',
      size: '0.00012 BTC',
      tradeValue: '10.0695 USDC',
      fee: '0.01 USDC',
      closedPnl: '0 USDC',
      pnlValue: 0,
    },
    short: {
      dex: 'Nado',
      wallet: walletForDex('Nado'),
      action: 'Open Short',
      price: '83,920',
      size: '0.00012 BTC',
      tradeValue: '10.0704 USDC',
      fee: '0.01 USDC',
      closedPnl: '0 USDC',
      pnlValue: 0,
    },
  },
  {
    time: '29/01/2026 - 18:10:22',
    coin: 'SOL/USDC',
    event: 'Close',
    long: {
      dex: 'Nado',
      wallet: walletForDex('Nado'),
      action: 'Close Long',
      price: '122.41',
      size: '0.09 SOL',
      tradeValue: '11.0169 USDC',
      fee: '0.02 USDC',
      closedPnl: '-0.1 USDC',
      pnlValue: -0.1,
    },
    short: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      action: 'Close Short',
      price: '122.38',
      size: '0.09 SOL',
      tradeValue: '11.0142 USDC',
      fee: '0.02 USDC',
      closedPnl: '-0.08 USDC',
      pnlValue: -0.08,
    },
  },
  {
    time: '29/01/2026 - 12:20:38',
    coin: 'SOL/USDC',
    event: 'Open',
    long: {
      dex: 'Nado',
      wallet: walletForDex('Nado'),
      action: 'Open Long',
      price: '123.43',
      size: '0.09 SOL',
      tradeValue: '11.1087 USDC',
      fee: '0.02 USDC',
      closedPnl: '-0.01 USDC',
      pnlValue: -0.01,
    },
    short: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      action: 'Open Short',
      price: '123.45',
      size: '0.09 SOL',
      tradeValue: '11.1105 USDC',
      fee: '0.02 USDC',
      closedPnl: '0 USDC',
      pnlValue: 0,
    },
  },
];

const COLORS = {
  headerText: '#d4c8b5',
  green: '#00d492',
  red: '#e5484d',
  coin: '#e8d5b5',
  muted: '#717182',
};

const GRID_COLS = 'grid-cols-[200px_90px_200px_120px_130px_150px_90px_120px]';

type MainTab = 'Positions' | 'History';

function matchesDexFilter(row: HistoryPairRow, activeSource: string) {
  if (activeSource === 'All Dexs') return true;
  return row.long.dex === activeSource || row.short.dex === activeSource;
}

function netPnl(row: HistoryPairRow) {
  return row.long.pnlValue + row.short.pnlValue;
}

function formatNetPnl(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} USDC`;
}

function HistoryLegLine({ side, leg }: { side: 'long' | 'short'; leg: HistoryPairRow['long'] }) {
  const isLong = side === 'long';
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <DexLogo dex={leg.dex} className="h-[14px] w-[14px]" />
        <span
          className="font-['Onest',sans-serif] text-[12px] font-medium truncate"
          style={{ color: isLong ? 'var(--vault-leg-long-fg)' : 'var(--vault-leg-short-fg)' }}
        >
          {leg.action}
        </span>
      </div>
      <WalletAddressLabel address={leg.wallet} className="pl-[22px]" />
    </div>
  );
}

function DualHistoryValues({ longVal, shortVal }: { longVal: string; shortVal: string }) {
  return (
    <div className="flex flex-col gap-[6px] items-end">
      <span
        className="font-['Onest',sans-serif] text-[12px] text-[#d4d4d4] border-r-2 pr-2"
        style={{ borderColor: 'rgba(0,212,146,0.35)' }}
      >
        {longVal}
      </span>
      <span
        className="font-['Onest',sans-serif] text-[12px] text-[#d4d4d4] border-r-2 pr-2"
        style={{ borderColor: 'rgba(229,72,77,0.35)' }}
      >
        {shortVal}
      </span>
    </div>
  );
}

function DesktopHistoryPairRow({ row, idx }: { row: HistoryPairRow; idx: number }) {
  const net = netPnl(row);
  const pnlColor = net >= 0 ? COLORS.green : COLORS.red;
  const isEven = idx % 2 === 0;
  const bgClass = isEven ? 'bg-[#0a0a0a]' : 'bg-[rgba(255,255,255,0.05)]';

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{
        scale: 1.002,
        backgroundColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0px 4px 20px -5px rgba(0,0,0,0.5)',
        transition: { duration: 0.1, ease: 'easeOut' },
      }}
      onMouseEnter={() => playSound('hover')}
      className={clsx(
        `grid ${GRID_COLS} items-center px-[16px] py-[22px] rounded-[12px] border transition-colors`,
        bgClass,
        'border-[0.83px] border-[rgba(255,255,255,0.05)]',
      )}
    >
      <div className="font-['Onest',sans-serif] font-medium text-[13px] text-[#d4d4d4]">{row.time}</div>

      <div className="flex flex-col gap-1">
        <span className="font-['Onest',sans-serif] font-semibold text-[14px]" style={{ color: COLORS.coin }}>
          {row.coin}
        </span>
      </div>

      <div className="flex flex-col gap-[8px]">
        <HistoryLegLine side="long" leg={row.long} />
        <HistoryLegLine side="short" leg={row.short} />
      </div>

      <DualHistoryValues longVal={row.long.price} shortVal={row.short.price} />
      <DualHistoryValues longVal={row.long.size} shortVal={row.short.size} />
      <DualHistoryValues longVal={row.long.tradeValue} shortVal={row.short.tradeValue} />
      <DualHistoryValues longVal={row.long.fee} shortVal={row.short.fee} />

      <div
        className="font-['Onest',sans-serif] font-medium text-[13px] text-right flex items-center justify-end gap-2"
        style={{ color: pnlColor }}
      >
        {formatNetPnl(net)}
        <ExternalLink size={14} className="opacity-80" strokeWidth={1.5} />
      </div>
    </motion.div>
  );
}

function MainTabSwitcher({ active, onChange }: { active: MainTab; onChange: (t: MainTab) => void }) {
  return (
    <div className="relative flex items-end gap-0 border-b border-[rgba(255,255,255,0.06)] mb-6 md:mb-8">
      {(['Positions', 'History'] as MainTab[]).map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={clsx(
              'relative px-5 py-[11px] transition-colors duration-150 outline-none select-none',
              "font-['Onest',sans-serif] font-medium text-[15px] leading-[22px] tracking-[0.15px]",
              isActive ? 'text-[#e0d5c2]' : 'text-[#4a4a5c] hover:text-[#7a7a90]',
            )}
          >
            {tab}
            {isActive && (
              <motion.div
                layoutId="tradingMainTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg, #785a28 0%, #ccb17f 100%)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DexTabIcon({ dex }: { dex: ManagedDexId }) {
  return <DexLogo dex={dex} className="h-4 w-4" />;
}

export function HistoryTable() {
  const dexTabs: TabItem[] = [
    { id: 'All Dexs', label: 'All Dexs', icon: <Layers size={16} strokeWidth={1.5} /> },
    { id: 'Hyperliquid', label: 'Hyperliquid', icon: <DexTabIcon dex="Hyperliquid" /> },
    { id: 'Pacifica', label: 'Pacifica', icon: <DexTabIcon dex="Pacifica" /> },
    { id: 'Nado', label: 'Nado', icon: <DexTabIcon dex="Nado" /> },
  ];

  const [mainTab, setMainTab] = useState<MainTab>('Positions');
  const [activeSource, setActiveSource] = useState('All Dexs');
  const [page] = useState(1);

  const filteredHistory = historyData.filter((row) => matchesDexFilter(row, activeSource));

  const HISTORY_HEADERS = ['Time', 'Market', 'Long / Short', 'Price', 'Size', 'Trade Value', 'Fee', 'Net PNL'];

  return (
    <div className="w-full flex flex-col mt-12 pb-20">
      <div className="w-full rounded-[24px] border-[0.83px] border-[rgba(255,255,255,0.06)] p-4 md:p-8 bg-[#050505]">
        <MainTabSwitcher active={mainTab} onChange={setMainTab} />

        <div className="flex items-center overflow-x-auto pb-2 md:pb-0 mb-6 md:mb-8">
          <TabSwitch tabs={dexTabs} activeTab={activeSource} onTabChange={setActiveSource} />
        </div>

        <AnimatePresence mode="wait">
          {mainTab === 'Positions' && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <PositionsTable activeSource={activeSource} />
            </motion.div>
          )}

          {mainTab === 'History' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col gap-6 md:gap-8"
            >
              <p
                className="hidden md:block font-['Onest',sans-serif] text-[12px] text-[#717182] -mt-2 mb-1"
              >
                Each row is one vault action — long and short legs executed together on their DEXs.
              </p>

              <div className="hidden md:block w-full overflow-x-auto">
                <div className="min-w-[1140px] flex flex-col gap-2">
                  <div className={`grid ${GRID_COLS} px-[16px] mb-2 items-center`}>
                    {HISTORY_HEADERS.map((header, idx) => (
                      <div
                        key={header}
                        className={clsx(
                          "font-['Onest',sans-serif] font-medium text-[13px] leading-[16.5px] tracking-[0.55px] uppercase text-[#d4c8b5]",
                          idx >= 3 ? 'text-right' : 'text-left',
                        )}
                      >
                        {header}
                      </div>
                    ))}
                  </div>

                  <div className="relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeSource}-${page}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="flex flex-col gap-2"
                      >
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((row, idx) => (
                            <DesktopHistoryPairRow key={`${row.time}-${row.coin}-${row.event}`} row={row} idx={idx} />
                          ))
                        ) : (
                          <div className="w-full py-12 flex items-center justify-center text-[#717182] font-['Onest',sans-serif] text-[14px]">
                            No history found for {activeSource}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="block md:hidden w-full">
                <p className="font-['Onest',sans-serif] text-[11px] text-[#717182] mb-3">
                  Paired long + short fills per vault open/close.
                </p>
                <div className="mb-4">
                  <h3 className="text-[#717182] text-[12px] uppercase tracking-[0.6px] font-medium mb-3">Today</h3>
                  {filteredHistory.slice(0, 3).map((row) => (
                    <MobileHistoryItem key={`${row.time}-${row.coin}`} row={row} />
                  ))}
                </div>
                <div className="mb-4">
                  <h3 className="text-[#717182] text-[12px] uppercase tracking-[0.6px] font-medium mb-3">Yesterday</h3>
                  {filteredHistory.slice(3).map((row) => (
                    <MobileHistoryItem key={`${row.time}-${row.coin}-y`} row={row} />
                  ))}
                </div>
              </div>

              <div className="mt-2 flex justify-center md:justify-end">
                <Pagination />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
