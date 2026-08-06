import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DexLogo } from './DexLogo';
import type { ManagedDexId } from './ActiveVaultCard';
import { WalletAddressLabel } from './WalletAddressLabel';

export type HistoryLegFill = {
  dex: ManagedDexId;
  wallet: string;
  action: 'Open Long' | 'Close Long' | 'Open Short' | 'Close Short';
  price: string;
  size: string;
  tradeValue: string;
  fee: string;
  closedPnl: string;
  pnlValue: number;
};

export type HistoryPairRow = {
  time: string;
  coin: string;
  event: 'Open' | 'Close';
  long: HistoryLegFill;
  short: HistoryLegFill;
};

function netPnl(pair: HistoryPairRow) {
  return pair.long.pnlValue + pair.short.pnlValue;
}

function LegChip({ side, leg }: { side: 'long' | 'short'; leg: HistoryLegFill }) {
  const isLong = side === 'long';
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <DexLogo dex={leg.dex} className="h-4 w-4" />
        <span
          className="font-['Onest',sans-serif] text-[12px] font-medium truncate"
          style={{ color: isLong ? 'var(--vault-leg-long-fg)' : 'var(--vault-leg-short-fg)' }}
        >
          {leg.action}
        </span>
      </div>
      <WalletAddressLabel address={leg.wallet} className="pl-[24px]" />
    </div>
  );
}

export function MobileHistoryItem({ row }: { row: HistoryPairRow }) {
  const [isOpen, setIsOpen] = useState(false);
  const net = netPnl(row);
  const pnlColor = net >= 0 ? '#00d492' : '#ff6467';

  return (
    <div className="bg-[#141414] rounded-[14px] w-full relative overflow-hidden mb-3">
      <div
        aria-hidden
        className="absolute border-[1.199px] border-[rgba(255,255,255,0.1)] inset-0 pointer-events-none rounded-[14px]"
      />

      <div className="flex flex-col relative z-10">
        <div className="flex flex-col p-4 gap-3">
          <div className="flex items-start justify-between w-full gap-3">
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <span className="font-['Onest',sans-serif] font-semibold text-[15px] text-[#e8d5b5]">{row.coin}</span>
              <LegChip side="long" leg={row.long} />
              <LegChip side="short" leg={row.short} />
              <span className="font-['Consolas',monospace] text-[#717182] text-[11px]">{row.time.split(' - ')[1]}</span>
            </div>

            <div className="flex flex-col gap-1 items-end shrink-0">
              <span className="font-['Onest',sans-serif] text-[10px] uppercase text-[#717182]">Net PNL</span>
              <div className="flex items-center gap-1">
                <span className="font-['Onest',sans-serif] font-medium text-[14px]" style={{ color: pnlColor }}>
                  {net >= 0 ? '+' : ''}
                  {net.toFixed(2)} USDC
                </span>
                <ExternalLink size={10} className="text-[#717182]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="font-['Onest',sans-serif] text-[#717182] text-[12px]">
              L @ {row.long.price} · S @ {row.short.price}
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center size-[24px] rounded-full hover:bg-white/5 transition-colors"
            >
              <ChevronDown size={16} className={clsx('text-[#717182] transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full"
            >
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.05)]" />
              <div className="bg-[rgba(26,26,26,0.5)] p-4 grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[#717182] text-[12px]">Long trade value</span>
                  <span className="font-['Consolas',monospace] text-[#d4d4d4] text-[13px]">{row.long.tradeValue}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#717182] text-[12px]">Short trade value</span>
                  <span className="font-['Consolas',monospace] text-[#d4d4d4] text-[13px]">{row.short.tradeValue}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#717182] text-[12px]">Long fee</span>
                  <span className="font-['Consolas',monospace] text-[#d4d4d4] text-[13px]">{row.long.fee}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#717182] text-[12px]">Short fee</span>
                  <span className="font-['Consolas',monospace] text-[#d4d4d4] text-[13px]">{row.short.fee}</span>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[#717182] text-[12px]">Full time</span>
                  <span className="font-['Consolas',monospace] text-[#d4d4d4] text-[13px]">{row.time}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
