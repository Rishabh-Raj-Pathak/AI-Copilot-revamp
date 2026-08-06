import React, { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronDown } from 'lucide-react';
import svgPaths from '../../imports/svg-hyvz41orky';
import { playSound } from '../utils/sound';
import { DexLogo } from './DexLogo';
import { PnlCompositionCell } from './PnlCompositionCell';
import type { ManagedDexId } from './ActiveVaultCard';
import { WalletAddressLabel } from './WalletAddressLabel';
import { walletForDex } from '../utils/wallet';

// ─── Types ────────────────────────────────────────────────────────────────────
export type PositionLeg = {
  dex: ManagedDexId;
  wallet: string;
  leverage: number;
  size: string;
  positionValue: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlValue: number;
  roe: string;
  roeValue: number;
  liqPrice: string;
  margin: string;
  funding: string;
  fundingValue: number;
  tpPrice: string;
  slPrice: string;
  expProfit: string;
  expProfitPct: string;
  expLoss: string;
  expLossPct: string;
};

export type DeltaNeutralPosition = {
  coin: string;
  long: PositionLeg;
  short: PositionLeg;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const positionsData: DeltaNeutralPosition[] = [
  {
    coin: 'BTC/USDC',
    long: {
      dex: 'Hyperliquid',
      wallet: walletForDex('Hyperliquid'),
      leverage: 3,
      size: '0.035 BTC',
      positionValue: '$2,986.35',
      entryPrice: '$83,915',
      markPrice: '$85,895',
      pnl: '+$69.30',
      pnlValue: 69.3,
      roe: '+2.32%',
      roeValue: 2.32,
      liqPrice: '$76,280',
      margin: '$298.64',
      funding: '+$0.08',
      fundingValue: 0.08,
      tpPrice: '$92,000',
      slPrice: '$79,500',
      expProfit: '+$232.18',
      expProfitPct: '7.77%',
      expLoss: '-$298.64',
      expLossPct: '10%',
    },
    short: {
      dex: 'Nado',
      wallet: walletForDex('Nado'),
      leverage: 3,
      size: '0.035 BTC',
      positionValue: '$2,986.35',
      entryPrice: '$83,920',
      markPrice: '$85,895',
      pnl: '-$64.10',
      pnlValue: -64.1,
      roe: '-2.15%',
      roeValue: -2.15,
      liqPrice: '$91,420',
      margin: '$298.64',
      funding: '-$0.05',
      fundingValue: -0.05,
      tpPrice: '$78,000',
      slPrice: '$88,500',
      expProfit: '+$218.40',
      expProfitPct: '7.32%',
      expLoss: '-$298.64',
      expLossPct: '10%',
    },
  },
  {
    coin: 'ETH/USDC',
    long: {
      dex: 'Hyperliquid',
      wallet: walletForDex('Hyperliquid'),
      leverage: 5,
      size: '1.6 ETH',
      positionValue: '$4,064.00',
      entryPrice: '$2,540.00',
      markPrice: '$2,538.50',
      pnl: '-$2.40',
      pnlValue: -2.4,
      roe: '-0.06%',
      roeValue: -0.06,
      liqPrice: '$2,163.40',
      margin: '$203.20',
      funding: '+$0.22',
      fundingValue: 0.22,
      tpPrice: '$2,800',
      slPrice: '$2,380',
      expProfit: '+$406.40',
      expProfitPct: '10%',
      expLoss: '-$203.20',
      expLossPct: '5%',
    },
    short: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      leverage: 5,
      size: '1.6 ETH',
      positionValue: '$4,061.60',
      entryPrice: '$2,541.00',
      markPrice: '$2,538.50',
      pnl: '+$4.00',
      pnlValue: 4.0,
      roe: '+0.10%',
      roeValue: 0.1,
      liqPrice: '$2,918.00',
      margin: '$203.08',
      funding: '+$0.18',
      fundingValue: 0.18,
      tpPrice: '$2,280',
      slPrice: '$2,700',
      expProfit: '+$406.16',
      expProfitPct: '10%',
      expLoss: '-$203.08',
      expLossPct: '5%',
    },
  },
  {
    coin: 'SOL/USDC',
    long: {
      dex: 'Nado',
      wallet: walletForDex('Nado'),
      leverage: 5,
      size: '18 SOL',
      positionValue: '$2,175.30',
      entryPrice: '$120.85',
      markPrice: '$120.85',
      pnl: '+$18.00',
      pnlValue: 18.0,
      roe: '+0.83%',
      roeValue: 0.83,
      liqPrice: '$98.72',
      margin: '$435.06',
      funding: '+$0.02',
      fundingValue: 0.02,
      tpPrice: '$132.00',
      slPrice: '$112.00',
      expProfit: '+$217.53',
      expProfitPct: '10%',
      expLoss: '-$435.06',
      expLossPct: '20%',
    },
    short: {
      dex: 'Pacifica',
      wallet: walletForDex('Pacifica'),
      leverage: 5,
      size: '18 SOL',
      positionValue: '$2,175.30',
      entryPrice: '$122.89',
      markPrice: '$120.85',
      pnl: '+$36.72',
      pnlValue: 36.72,
      roe: '+1.69%',
      roeValue: 1.69,
      liqPrice: '$135.18',
      margin: '$435.06',
      funding: '-$0.03',
      fundingValue: -0.03,
      tpPrice: '$108.00',
      slPrice: '$130.00',
      expProfit: '+$238.28',
      expProfitPct: '10.95%',
      expLoss: '-$435.06',
      expLossPct: '20%',
    },
  },
];

function matchesDexFilter(pair: DeltaNeutralPosition, activeSource: string) {
  if (activeSource === 'All Dexs') return true;
  return pair.long.dex === activeSource || pair.short.dex === activeSource;
}

function netPnlValue(pair: DeltaNeutralPosition) {
  return pair.long.pnlValue + pair.short.pnlValue;
}


// ─── Design System ─────────────────────────────────────────────────────────────
const C = {
  live: '#dcdce8',
  primary: '#b0b0be',
  muted: '#7a7a8c',
  label: '#3e3e52',
  green: '#00d492',
  red: '#e5484d',
  gold: '#ccb17f',
  coin: '#e8d5b5',
  teal: '#2F9E85',
  longFg: 'var(--vault-leg-long-fg)',
  shortFg: 'var(--vault-leg-short-fg)',
};

const ROW_SHADOW =
  '0px 2px 6px rgba(0,0,0,0.3), 0px 4px 16px rgba(0,0,0,0.25), inset 0px 1px 0px rgba(255,255,255,0.03)';
const ROW_SHADOW_HOVER =
  '0px 4px 14px rgba(0,0,0,0.45), 0px 10px 30px rgba(0,0,0,0.28), inset 0px 1px 0px rgba(255,255,255,0.05)';

const GRID_COLS =
  'grid-cols-[118px_75px_82px_78px_82px_105px_76px_90px_62px_104px_108px_62px]';

const HEADERS = [
  'Market',
  'Size',
  'Pos. Value',
  'Entry Price',
  'Curr. Price',
  'P&L',
  'Liq. Price',
  'Margin',
  'Funding',
  'TP / SL',
  'Exp. P / L',
  'Action',
];

const SEPARATOR_AFTER = new Set([0, 2, 4, 5, 7, 10]);

const valueFont = {
  fontFamily: "'Onest',sans-serif",
  fontSize: '12px',
} as const;

// ─── SVG icon atoms ────────────────────────────────────────────────────────────
function EditIcon() {
  return (
    <div className="relative shrink-0 size-[13px]">
      <svg className="block size-full" fill="none" viewBox="0 0 14 14">
        <path d={svgPaths.p370bcb00} stroke={C.teal} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.17" />
      </svg>
    </div>
  );
}

function StopIcon() {
  return (
    <div className="relative shrink-0 size-[13px]">
      <svg className="block size-full" fill="none" viewBox="0 0 14 14">
        <path d={svgPaths.p27262e40} stroke={C.red} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.17" />
        <path d={svgPaths.pbe15480} stroke={C.red} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.17" />
      </svg>
    </div>
  );
}

function DirectionBadge({ dir }: { dir: 'Long' | 'Short' }) {
  const isLong = dir === 'Long';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 5px',
        borderRadius: '4px',
        fontSize: '9px',
        lineHeight: '13px',
        fontFamily: "'Onest',sans-serif",
        letterSpacing: '0.3px',
        color: isLong ? 'rgba(0,212,146,0.85)' : 'rgba(229,72,77,0.85)',
        backgroundColor: isLong ? 'rgba(0,212,146,0.07)' : 'rgba(229,72,77,0.07)',
        border: `1px solid ${isLong ? 'rgba(0,212,146,0.16)' : 'rgba(229,72,77,0.16)'}`,
        boxShadow: 'inset 0px 1px 0px rgba(255,255,255,0.06)',
      }}
    >
      {dir}
    </span>
  );
}

function LeverageBadge({ value }: { value: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 5px',
        borderRadius: '4px',
        fontSize: '9px',
        lineHeight: '13px',
        fontFamily: "'Onest',sans-serif",
        letterSpacing: '0.2px',
        color: 'rgba(196,168,112,0.85)',
        backgroundColor: 'rgba(196,168,112,0.07)',
        border: '1px solid rgba(196,168,112,0.16)',
      }}
    >
      {value}×
    </span>
  );
}

function IsolatedBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 5px',
        borderRadius: '4px',
        fontSize: '9px',
        lineHeight: '13px',
        fontFamily: "'Onest',sans-serif",
        letterSpacing: '0.4px',
        color: 'rgba(120,100,64,0.85)',
        backgroundColor: 'rgba(120,100,64,0.07)',
        border: '1px solid rgba(120,100,64,0.14)',
        textTransform: 'uppercase',
      }}
    >
      Isolated
    </span>
  );
}

function LegHeader({ side, leg }: { side: 'long' | 'short'; leg: PositionLeg }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div
        className="flex items-center gap-[5px] min-w-0"
        title={`${side === 'long' ? 'Long' : 'Short'} on ${leg.dex}`}
      >
        <DexLogo dex={leg.dex} className="h-[14px] w-[14px]" />
        <DirectionBadge dir={side === 'long' ? 'Long' : 'Short'} />
        <LeverageBadge value={leg.leverage} />
      </div>
      <WalletAddressLabel address={leg.wallet} className="pl-[19px]" />
    </div>
  );
}

function DualStack({
  longValue,
  shortValue,
  longColor = C.muted,
  shortColor = C.muted,
  longWeight = 400,
  shortWeight = 400,
}: {
  longValue: string;
  shortValue: string;
  longColor?: string;
  shortColor?: string;
  longWeight?: number;
  shortWeight?: number;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <span
        className="truncate border-l-2 pl-[6px]"
        style={{
          ...valueFont,
          fontWeight: longWeight,
          color: longColor,
          borderColor: 'rgba(0,212,146,0.35)',
        }}
      >
        {longValue}
      </span>
      <span
        className="truncate border-l-2 pl-[6px]"
        style={{
          ...valueFont,
          fontWeight: shortWeight,
          color: shortColor,
          borderColor: 'rgba(229,72,77,0.35)',
        }}
      >
        {shortValue}
      </span>
    </div>
  );
}

function ActionButtons() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-[6px]">
      {editing ? (
        <motion.button
          onClick={() => {
            setEditing(false);
            playSound('success');
          }}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.05 }}
          className="relative w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(180deg, #2a2012 0%, #15100a 100%)' }}
        >
          <div className="absolute inset-0 rounded-[8px] border border-[rgba(120,90,40,0.45)] pointer-events-none" />
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 4" stroke={C.gold} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      ) : (
        <motion.button
          onClick={() => {
            setEditing(true);
            playSound('stop');
          }}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.05 }}
          className="relative w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-[rgba(47,158,133,0.09)] transition-colors"
          onMouseEnter={() => playSound('hover')}
        >
          <div className="absolute inset-0 rounded-[8px] border-[0.83px] border-[rgba(47,158,133,0.38)] pointer-events-none" />
          <EditIcon />
        </motion.button>
      )}

      <motion.button
        onClick={() => playSound('stop')}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        className="relative w-[32px] h-[32px] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-[rgba(229,72,77,0.09)] transition-colors"
        onMouseEnter={() => playSound('hover')}
      >
        <div className="absolute inset-0 rounded-[8px] border-[0.83px] border-[rgba(229,72,77,0.38)] pointer-events-none" />
        <StopIcon />
      </motion.button>
    </div>
  );
}

function Cell({
  children,
  colIndex,
  className,
}: {
  children: React.ReactNode;
  colIndex: number;
  className?: string;
}) {
  return (
    <div className={clsx('relative', className)}>
      {children}
      {SEPARATOR_AFTER.has(colIndex) && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] rounded-full pointer-events-none"
          style={{
            height: '60%',
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
          }}
        />
      )}
    </div>
  );
}

function DesktopDeltaNeutralRow({ pair, idx }: { pair: DeltaNeutralPosition; idx: number }) {
  const net = netPnlValue(pair);
  const longFundColor = pair.long.fundingValue >= 0 ? C.green : C.red;
  const shortFundColor = pair.short.fundingValue >= 0 ? C.green : C.red;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.28, ease: [0.2, 0, 0.2, 1] }}
      whileHover={{
        y: -1,
        boxShadow: ROW_SHADOW_HOVER,
        borderColor: 'rgba(255,255,255,0.09)',
        transition: { duration: 0.15, ease: 'easeOut' },
      }}
      onMouseEnter={() => playSound('hover')}
      className={clsx(`grid ${GRID_COLS} items-center px-[16px] py-[18px] rounded-[13px] border`, 'border-[rgba(255,255,255,0.05)]')}
      style={{
        background: 'linear-gradient(180deg, #111116 0%, #0c0c10 100%)',
        boxShadow: ROW_SHADOW,
        willChange: 'transform',
      }}
    >
      {/* Market + legs */}
      <Cell colIndex={0} className="flex flex-col gap-[8px]">
        <span
          style={{
            fontFamily: "'Onest',sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: C.coin,
            letterSpacing: '0.1px',
          }}
        >
          {pair.coin}
        </span>
        <LegHeader side="long" leg={pair.long} />
        <LegHeader side="short" leg={pair.short} />
      </Cell>

      <Cell colIndex={1}>
        <DualStack longValue={pair.long.size} shortValue={pair.short.size} />
      </Cell>

      <Cell colIndex={2}>
        <DualStack
          longValue={pair.long.positionValue}
          shortValue={pair.short.positionValue}
          longColor={C.primary}
          shortColor={C.primary}
          longWeight={500}
          shortWeight={500}
        />
      </Cell>

      <Cell colIndex={3}>
        <DualStack longValue={pair.long.entryPrice} shortValue={pair.short.entryPrice} />
      </Cell>

      <Cell colIndex={4}>
        <DualStack longValue={pair.long.markPrice} shortValue={pair.short.markPrice} longColor={C.live} shortColor={C.live} longWeight={500} shortWeight={500} />
      </Cell>

      <Cell colIndex={5}>
        <PnlCompositionCell
          showAccent
          net={net}
          longPnl={pair.long.pnl}
          longPnlValue={pair.long.pnlValue}
          shortPnl={pair.short.pnl}
          shortPnlValue={pair.short.pnlValue}
        />
      </Cell>

      <Cell colIndex={6}>
        <DualStack longValue={pair.long.liqPrice} shortValue={pair.short.liqPrice} />
      </Cell>

      <Cell colIndex={7}>
        <div className="flex flex-col gap-[7px]">
          <DualStack
            longValue={pair.long.margin}
            shortValue={pair.short.margin}
            longColor={C.primary}
            shortColor={C.primary}
            longWeight={500}
            shortWeight={500}
          />
          <IsolatedBadge />
        </div>
      </Cell>

      <Cell colIndex={8}>
        <DualStack
          longValue={pair.long.funding}
          shortValue={pair.short.funding}
          longColor={longFundColor}
          shortColor={shortFundColor}
          longWeight={500}
          shortWeight={500}
        />
      </Cell>

      <Cell colIndex={9}>
        <div className="flex flex-col gap-[7px]">
          <div className="flex flex-col gap-[3px] border-l-2 pl-[6px]" style={{ borderColor: 'rgba(0,212,146,0.35)' }}>
            <span style={{ fontFamily: "'Onest',sans-serif", fontSize: '8.5px', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.label }}>
              TP
            </span>
            <span style={{ ...valueFont, fontSize: '11px', color: 'rgba(0,212,146,0.75)' }}>{pair.long.tpPrice}</span>
            <span style={{ ...valueFont, fontSize: '11px', color: 'rgba(0,212,146,0.75)' }}>{pair.short.tpPrice}</span>
          </div>
          <div className="flex flex-col gap-[3px] border-l-2 pl-[6px]" style={{ borderColor: 'rgba(229,72,77,0.35)' }}>
            <span style={{ fontFamily: "'Onest',sans-serif", fontSize: '8.5px', letterSpacing: '0.5px', textTransform: 'uppercase', color: C.label }}>
              SL
            </span>
            <span style={{ ...valueFont, fontSize: '11px', color: 'rgba(229,72,77,0.75)' }}>{pair.long.slPrice}</span>
            <span style={{ ...valueFont, fontSize: '11px', color: 'rgba(229,72,77,0.75)' }}>{pair.short.slPrice}</span>
          </div>
        </div>
      </Cell>

      <Cell colIndex={10}>
        <DualStack
          longValue={`${pair.long.expProfit} (${pair.long.expProfitPct})`}
          shortValue={`${pair.short.expProfit} (${pair.short.expProfitPct})`}
          longColor="rgba(0,212,146,0.72)"
          shortColor="rgba(0,212,146,0.72)"
        />
      </Cell>

      <Cell colIndex={11}>
        <ActionButtons />
      </Cell>
    </motion.div>
  );
}

function MobileDeltaNeutralCard({ pair }: { pair: DeltaNeutralPosition }) {
  const [isOpen, setIsOpen] = useState(false);
  const net = netPnlValue(pair);

  return (
    <div
      className="w-full relative overflow-hidden mb-[8px] rounded-[14px] border border-[rgba(255,255,255,0.05)]"
      style={{
        background: 'linear-gradient(180deg, #131318 0%, #0d0d11 100%)',
        boxShadow: ROW_SHADOW,
      }}
    >
      <div className="flex flex-col relative z-10">
        <div className="flex items-start justify-between p-4 gap-3">
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <span style={{ fontFamily: "'Onest',sans-serif", fontWeight: 600, fontSize: '16px', color: C.coin }}>{pair.coin}</span>
            <div className="flex flex-col gap-2">
              <LegHeader side="long" leg={pair.long} />
              <LegHeader side="short" leg={pair.short} />
            </div>
          </div>

          <div className="flex shrink-0 items-start justify-end">
            <PnlCompositionCell
              align="end"
              net={net}
              longPnl={pair.long.pnl}
              longPnlValue={pair.long.pnlValue}
              shortPnl={pair.short.pnl}
              shortPnlValue={pair.short.pnlValue}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-[4px]" style={{ fontFamily: "'Onest',sans-serif", fontSize: '12px' }}>
            <span style={{ color: C.label }}>Mark</span>
            <span style={{ color: C.live }}>{pair.long.markPrice}</span>
          </div>
          <div className="flex items-center gap-[4px]" style={{ fontFamily: "'Onest',sans-serif", fontSize: '12px' }}>
            <span style={{ color: C.label }}>Size</span>
            <span style={{ color: C.muted }}>{pair.long.size}</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center size-[22px] rounded-full hover:bg-white/5 transition-colors"
          >
            <ChevronDown size={14} className={clsx('transition-transform duration-200', isOpen && 'rotate-180')} style={{ color: C.label }} />
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="w-full h-[1px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6" style={{ background: 'rgba(255,255,255,0.015)' }}>
                {[
                  { label: 'Long margin', value: pair.long.margin },
                  { label: 'Short margin', value: pair.short.margin },
                  { label: 'Long funding', value: pair.long.funding },
                  { label: 'Short funding', value: pair.short.funding },
                  { label: 'Long liq.', value: pair.long.liqPrice },
                  { label: 'Short liq.', value: pair.short.liqPrice },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-[4px]">
                    <span style={{ fontFamily: "'Onest',sans-serif", fontSize: '10px', color: C.label }}>{label}</span>
                    <span style={{ fontFamily: "'Onest',sans-serif", fontSize: '12px', color: C.primary }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 pt-2 flex items-center">
                <ActionButtons />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function PositionsTable({ activeSource }: { activeSource: string }) {
  const filtered = positionsData.filter((p) => matchesDexFilter(p, activeSource));

  return (
    <>
      <div className="hidden md:block w-full">
        <div className="flex flex-col gap-0">
          <div className={`grid ${GRID_COLS} px-[16px] pb-[6px]`}>
            {HEADERS.map((h, i) => (
              <div
                key={i}
                aria-label={h === 'P&L' ? 'Profit and loss' : undefined}
                style={{
                  fontFamily: "'Onest',sans-serif",
                  fontWeight: 500,
                  fontSize: '10px',
                  lineHeight: '14px',
                  letterSpacing: '0.65px',
                  textTransform: 'uppercase',
                  color: C.label,
                }}
              >
                {h}
              </div>
            ))}
          </div>
          <p
            className="px-[16px] pb-[10px]"
            style={{
              fontFamily: "'Onest',sans-serif",
              fontSize: '10px',
              color: C.muted,
              letterSpacing: '0.2px',
            }}
          >
            One row per token — long leg (green bar) and short leg (red bar) hedged across DEXs.
          </p>

          <div
            className="w-full mb-3"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, transparent 100%)',
            }}
          />

          <div className="relative min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSource}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-[8px]"
              >
                {filtered.length > 0 ? (
                  filtered.map((pair, idx) => <DesktopDeltaNeutralRow key={pair.coin} pair={pair} idx={idx} />)
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
                    <div
                      className="size-[40px] rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <Zap size={17} style={{ color: C.label }} />
                    </div>
                    <span style={{ fontFamily: "'Onest',sans-serif", fontSize: '13px', color: C.muted }}>
                      No open delta-neutral positions for {activeSource}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="block md:hidden w-full">
        {filtered.length > 0 ? (
          <>
            <h3
              className="mb-3"
              style={{
                fontFamily: "'Onest',sans-serif",
                fontWeight: 500,
                fontSize: '11px',
                letterSpacing: '0.7px',
                textTransform: 'uppercase',
                color: C.label,
              }}
            >
              Open positions
            </h3>
            {filtered.map((pair) => (
              <MobileDeltaNeutralCard key={pair.coin} pair={pair} />
            ))}
          </>
        ) : (
          <div className="w-full py-12 flex items-center justify-center" style={{ fontFamily: "'Onest',sans-serif", fontSize: '13px', color: C.muted }}>
            No open delta-neutral positions for {activeSource}
          </div>
        )}
      </div>
    </>
  );
}
