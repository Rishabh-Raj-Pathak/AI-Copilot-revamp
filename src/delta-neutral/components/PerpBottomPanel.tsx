import React, { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { DexLogo } from './DexLogo';
import { formatSignedUsd, PnlCompositionCell, pnlTextClass } from './PnlCompositionCell';
import type { ManagedDexId } from './ActiveVaultCard';
import { WalletAddressLabel } from './WalletAddressLabel';
import { walletForDex } from '../utils/wallet';
import type { InstrumentType } from '../utils/markets';

type BottomTab = 'positions' | 'history';

/**
 * A spot leg has no funding stream and cannot be liquidated, so those cells hold
 * nothing rather than a zero — a zero would read as "flat right now" when the
 * truth is "this leg never has one". Rendered dimmed, with a hover explanation.
 */
const NOT_APPLICABLE = '—';
const NOT_APPLICABLE_TITLE = 'Not applicable to a spot leg';

/**
 * The same green and red the P&L legs and the DualCell rules already use. The
 * side label used to sit on the muted --vault-leg-*-fg pair, which left the row
 * saying "long" in sage while the rule beside it said long in green.
 */
/**
 * The wallet hangs under the side label rather than under the venue logo, so
 * both lines of a leg share one left edge. DexLogo renders at its own h-4 (16px)
 * — clsx concatenates rather than merges, so a smaller size passed in here is
 * silently dropped — which puts that edge at 16px of logo plus the 4px gap.
 */
const LEG_INDENT = 'pl-[20px]';

const LONG_INK = 'text-[#00d492]';
const SHORT_INK = 'text-[#e5484d]';

const POSITIONS_COLUMNS = [
  'Market',
  'Size',
  'Position Value',
  'Entry Price',
  'Current Price',
  'P&L',
  'Liq. Price',
  'Margin',
  'Funding',
  'TP/SL',
  'Exp. P/L',
  'Action',
];

const HISTORY_COLUMNS = ['Time', 'Market', 'Long / Short', 'Price', 'Size', 'Trade Value', 'Fee', 'Net PNL'];

const POSITIONS_GRID =
  'grid grid-cols-[minmax(148px,1.35fr)_repeat(11,minmax(88px,1fr))]';

const HISTORY_GRID =
  'grid grid-cols-[minmax(88px,0.9fr)_minmax(100px,1fr)_minmax(148px,1.35fr)_repeat(5,minmax(88px,1fr))]';

type PositionLeg = {
  dex: ManagedDexId;
  instrument: InstrumentType;
  wallet: string;
  leverage: number;
  size: string;
  positionValue: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  pnlValue: number;
  liqPrice: string;
  margin: string;
  funding: string;
  tpSl: string;
  expected: string;
};

type DeltaNeutralPosition = {
  coin: string;
  category?: string;
  long: PositionLeg;
  short: PositionLeg;
};

type HistoryLeg = {
  dex: ManagedDexId;
  instrument: InstrumentType;
  wallet: string;
  action: string;
  price: string;
  size: string;
  tradeValue: string;
  fee: string;
  closedPnl: string;
  pnlValue: number;
};

type HistoryPair = {
  time: string;
  coin: string;
  category?: string;
  event: 'Open' | 'Close';
  long: HistoryLeg;
  short: HistoryLeg;
};

const POSITION_PAIRS: DeltaNeutralPosition[] = [
  {
    coin: 'BTC/USDC',
    long: {
      dex: 'Hyperliquid',
      // Cash-and-carry: the long leg is held on the spot book, so it is
      // unlevered and has neither a funding stream nor a liquidation price.
      instrument: 'Spot',
      wallet: walletForDex('Hyperliquid'),
      leverage: 1,
      size: '0.24 BTC',
      positionValue: '$16,560',
      entryPrice: '$68,940',
      currentPrice: '$69,140',
      pnl: '+$48',
      pnlValue: 48,
      liqPrice: NOT_APPLICABLE,
      margin: '$16,560',
      funding: NOT_APPLICABLE,
      tpSl: '72k / 66.8k',
      expected: '+6.8% / -3.4%',
    },
    short: {
      dex: 'Nado',
      instrument: 'Perp',
      wallet: walletForDex('Nado'),
      leverage: 3,
      size: '0.24 BTC',
      positionValue: '$16,560',
      entryPrice: '$68,955',
      currentPrice: '$69,140',
      pnl: '-$32',
      pnlValue: -32,
      liqPrice: '$74,800',
      margin: '$5,520',
      funding: '-$2.1',
      tpSl: '65k / 71k',
      expected: '+5.9% / -3.1%',
    },
  },
  {
    coin: 'ETH/USDC',
    category: 'Bluechip',
    long: {
      dex: 'Hyperliquid',
      instrument: 'Perp',
      wallet: walletForDex('Hyperliquid'),
      leverage: 5,
      size: '1.85 ETH',
      positionValue: '$6,434',
      entryPrice: '$3,478',
      currentPrice: '$3,492',
      pnl: '+$26',
      pnlValue: 26,
      liqPrice: '$2,940',
      margin: '$1,287',
      funding: '+$1.8',
      tpSl: '3.7k / 3.2k',
      expected: '+5.2% / -2.6%',
    },
    short: {
      dex: 'Pacifica',
      instrument: 'Perp',
      wallet: walletForDex('Pacifica'),
      leverage: 5,
      size: '1.85 ETH',
      positionValue: '$6,460',
      entryPrice: '$3,481',
      currentPrice: '$3,492',
      pnl: '+$20',
      pnlValue: 20,
      liqPrice: '$3,980',
      margin: '$1,292',
      funding: '+$1.2',
      tpSl: '3.2k / 3.65k',
      expected: '+4.8% / -2.4%',
    },
  },
  {
    coin: 'SOL/USDC',
    category: 'Trending',
    long: {
      dex: 'Nado',
      instrument: 'Perp',
      wallet: walletForDex('Nado'),
      leverage: 5,
      size: '39.6 SOL',
      positionValue: '$6,431',
      entryPrice: '$162.4',
      currentPrice: '$163.1',
      pnl: '+$28',
      pnlValue: 28,
      liqPrice: '$138.2',
      margin: '$1,286',
      funding: '+$0.9',
      tpSl: '175 / 152',
      expected: '+7.1% / -3.8%',
    },
    short: {
      dex: 'Pacifica',
      instrument: 'Perp',
      wallet: walletForDex('Pacifica'),
      leverage: 5,
      size: '39.6 SOL',
      positionValue: '$6,459',
      entryPrice: '$163.0',
      currentPrice: '$163.1',
      pnl: '-$4',
      pnlValue: -4,
      liqPrice: '$182.4',
      margin: '$1,292',
      funding: '-$0.4',
      tpSl: '150 / 170',
      expected: '+6.4% / -3.2%',
    },
  },
];

const HISTORY_PAIRS: HistoryPair[] = [
  {
    time: '19:42:11',
    coin: 'ETH/USDC',
    event: 'Close',
    long: {
      dex: 'Hyperliquid',
      instrument: 'Perp',
      wallet: walletForDex('Hyperliquid'),
      action: 'Close Long',
      price: '$3,478',
      size: '1.85 ETH',
      tradeValue: '$6,434',
      fee: '$2.57',
      closedPnl: '+$28',
      pnlValue: 28,
    },
    short: {
      dex: 'Pacifica',
      instrument: 'Perp',
      wallet: walletForDex('Pacifica'),
      action: 'Close Short',
      price: '$3,479',
      size: '1.85 ETH',
      tradeValue: '$6,436',
      fee: '$2.58',
      closedPnl: '+$22',
      pnlValue: 22,
    },
  },
  {
    time: '18:59:47',
    coin: 'SOL/USDC',
    category: 'Equities',
    event: 'Open',
    long: {
      dex: 'Nado',
      instrument: 'Perp',
      wallet: walletForDex('Nado'),
      action: 'Open Long',
      price: '$162.4',
      size: '39.6 SOL',
      tradeValue: '$6,431',
      fee: '$2.46',
      closedPnl: '$0',
      pnlValue: 0,
    },
    short: {
      dex: 'Pacifica',
      instrument: 'Perp',
      wallet: walletForDex('Pacifica'),
      action: 'Open Short',
      price: '$162.5',
      size: '39.6 SOL',
      tradeValue: '$6,435',
      fee: '$2.47',
      closedPnl: '$0',
      pnlValue: 0,
    },
  },
  {
    time: '17:24:09',
    coin: 'BTC/USDC',
    category: 'Bluechip',
    event: 'Close',
    long: {
      dex: 'Hyperliquid',
      instrument: 'Spot',
      wallet: walletForDex('Hyperliquid'),
      action: 'Close Long',
      price: '$68,940',
      size: '0.12 BTC',
      tradeValue: '$8,273',
      fee: '$3.31',
      closedPnl: '-$19',
      pnlValue: -19,
    },
    short: {
      dex: 'Nado',
      instrument: 'Perp',
      wallet: walletForDex('Nado'),
      action: 'Close Short',
      price: '$68,950',
      size: '0.12 BTC',
      tradeValue: '$8,274',
      fee: '$3.31',
      closedPnl: '-$12',
      pnlValue: -12,
    },
  },
];

function DualCell({
  longVal,
  shortVal,
  longClassName,
  shortClassName,
  longTitle,
  shortTitle,
}: {
  longVal: string;
  shortVal: string;
  longClassName?: string;
  shortClassName?: string;
  longTitle?: string;
  shortTitle?: string;
}) {
  return (
    <div className="flex min-h-[34px] flex-col justify-center gap-[5px] pr-2">
      <span
        title={longTitle ?? (longVal === NOT_APPLICABLE ? NOT_APPLICABLE_TITLE : undefined)}
        className={clsx(
          'border-l-2 pl-1.5 text-[11px] leading-tight',
          longClassName ?? (longVal === NOT_APPLICABLE ? 'text-[#5f6070]' : undefined),
        )}
        style={{ borderColor: 'rgba(0,212,146,0.4)' }}
      >
        {longVal}
      </span>
      <span
        title={shortTitle ?? (shortVal === NOT_APPLICABLE ? NOT_APPLICABLE_TITLE : undefined)}
        className={clsx(
          'border-l-2 pl-1.5 text-[11px] leading-tight',
          shortClassName ?? (shortVal === NOT_APPLICABLE ? 'text-[#5f6070]' : undefined),
        )}
        style={{ borderColor: 'rgba(229,72,77,0.4)' }}
      >
        {shortVal}
      </span>
    </div>
  );
}

/**
 * Which book the leg actually trades on.
 *
 * Both values share one ink. Colour in this row is already spoken for and means
 * something specific — green is long, red is short, gold is the pair and its
 * category — so giving spot a colour of its own cast it as a status, some state
 * the leg had got into, when it is a plain attribute of the market. Neither book
 * is the exceptional one.
 *
 * What separates them instead is the word and its position: the fixed-width side
 * label above holds every instrument at the same offset, so the two of them stack
 * into a column you read straight down. It sits on the row's own text ink, the
 * same as the numbers in the cells beside it, because that is what it is — a
 * value in the row, not a badge on it.
 *
 * Chrome-less for the same reason. As a filled chip this was a third boxed object
 * in a 148px cell that already holds a gold category pill. Title case against the
 * all-caps side label is what marks it as a qualifier of the leg rather than a
 * second label competing with it.
 */
function InstrumentTag({ instrument }: { instrument: InstrumentType }) {
  return (
    <span
      title={
        instrument === 'Spot'
          ? 'Spot leg — held 1:1 on the spot book. No leverage, no funding, no liquidation price.'
          : 'Perpetual leg — leveraged, pays or earns funding, carries a liquidation price.'
      }
      className="shrink-0 text-[10px] font-medium leading-tight text-[#c8c9d5]"
    >
      {instrument}
    </span>
  );
}

/**
 * Spot cannot be levered, so that leg is funded with the whole notional while the
 * perp leg opposite it posts a fraction of the same number. The margin column is
 * where that asymmetry actually shows up, so the explanation lives on the cell.
 */
function marginTitle(leg: PositionLeg) {
  return leg.instrument === 'Spot'
    ? `Spot cannot be levered — this leg is funded with the full ${leg.positionValue} notional.`
    : `${leg.margin} posted at ${leg.leverage}× to carry ${leg.positionValue} of notional.`;
}

/** Funding is signed on a perp leg and absent on a spot one. */
function fundingClass(value: string) {
  if (value === NOT_APPLICABLE) return 'text-[#5f6070]';
  return value.startsWith('-')
    ? 'text-[color:var(--vault-pnl-negative)]'
    : 'text-[color:var(--vault-pnl-positive)]';
}

function LegChip({
  side,
  dex,
  instrument,
  leverage,
  wallet,
}: {
  side: 'long' | 'short';
  dex: ManagedDexId;
  instrument: InstrumentType;
  leverage: number;
  wallet: string;
}) {
  const isLong = side === 'long';
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      {/* gap-1, not gap-1.5: it is the 4px half of LEG_INDENT. */}
      <div className="flex items-center gap-1 min-w-0">
        <DexLogo dex={dex} />
        {/* w-[38px] holds the wider of the two words. Ragged side labels were
            pushing "Spot" and "Perp" to different offsets on the two rows of a
            cell, and that misalignment — more than the words themselves — was
            what made the column look busy. Fixed, they stack into a column the
            eye can run straight down. */}
        <span
          className={clsx(
            'w-[38px] shrink-0 text-[10px] font-semibold uppercase tracking-wide',
            isLong ? LONG_INK : SHORT_INK,
          )}
        >
          {isLong ? 'Long' : 'Short'}
        </span>
        <InstrumentTag instrument={instrument} />
        {/* Shown on both legs, spot included, where it is always 1×. Spot carrying
            no multiplier at all left the margin column looking arbitrary: the two
            legs of a cash-and-carry hold the same notional but post very different
            capital, and nothing on screen said why. With the multiplier on every
            line the row explains itself — margin × multiplier is the position
            value on both legs, so the reader can see the hedge is balanced even
            though one side ties up three times the cash. */}
        <span className="text-[9px] text-[#63646f]">{leverage}×</span>
      </div>
      <WalletAddressLabel address={wallet} className={LEG_INDENT} />
    </div>
  );
}

function MarketCell({
  coin,
  category,
  longDex,
  shortDex,
  longInstrument,
  shortInstrument,
  longLev,
  shortLev,
  longWallet,
  shortWallet,
}: {
  coin: string;
  category?: string;
  longDex: ManagedDexId;
  shortDex: ManagedDexId;
  longInstrument: InstrumentType;
  shortInstrument: InstrumentType;
  longLev: number;
  shortLev: number;
  longWallet: string;
  shortWallet: string;
}) {
  return (
    <div className="flex min-h-[52px] flex-col justify-center gap-1.5 pr-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium text-[#e8d5b5]">{coin}</span>
        {category && (
          <span className="inline-flex rounded-full border border-[rgba(204,177,127,0.4)] bg-[rgba(204,177,127,0.12)] px-1.5 py-px text-[8px] uppercase tracking-[0.6px] text-[#d8bf92]">
            {category}
          </span>
        )}
      </div>
      <LegChip
        side="long"
        dex={longDex}
        instrument={longInstrument}
        leverage={longLev}
        wallet={longWallet}
      />
      <LegChip
        side="short"
        dex={shortDex}
        instrument={shortInstrument}
        leverage={shortLev}
        wallet={shortWallet}
      />
    </div>
  );
}

type PerpPanelVariant = 'default' | 'v2';

export function PerpBottomPanel({ variant = 'default' }: { variant?: PerpPanelVariant }) {
  const isV2 = variant === 'v2';
  const [activeTab, setActiveTab] = useState<BottomTab>('positions');
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  const [isNarrow, setIsNarrow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 833px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 833px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleWheel: React.WheelEventHandler<HTMLElement> = event => {
    if (event.deltaY > 8) {
      setExpanded(true);
      return;
    }
    if (event.deltaY < -8) {
      setExpanded(false);
    }
  };

  const handleHeaderToggle = () => {
    if (isNarrow) setExpanded(prev => !prev);
  };

  useEffect(() => {
    const scrollEl = document.querySelector('.delta-neutral-minimal-scrollbar');
    if (!scrollEl) return;

    let lastY = scrollEl.scrollTop;
    let ticking = false;

    const onScroll = () => {
      if (isNarrow) return;
      const currentY = scrollEl.scrollTop;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const delta = currentY - lastY;
        if (currentY <= 24 || delta < -6) {
          setHiddenByScroll(false);
        } else if (delta > 6) {
          setHiddenByScroll(true);
        }
        lastY = currentY;
        ticking = false;
      });
    };

    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [isNarrow]);

  const rowBorder = isV2 ? 'border-[#141414]' : 'border-[rgba(255,255,255,0.05)]';
  const rowText = isV2 ? 'text-[#c8c8c8]' : 'text-[#c8c9d5]';
  const headerBg = isV2 ? 'bg-[#0a0a0a]' : 'bg-[rgba(7,7,8,0.98)]';
  const headerBorder = isV2 ? 'border-[#1f1f1f]' : 'border-[rgba(255,255,255,0.08)]';
  const headerText = isV2 ? 'text-[#6a6a6a]' : 'text-[#838492]';

  const minTableWidth = useMemo(
    () => (activeTab === 'positions' ? 'min-w-[1580px]' : 'min-w-[1080px]'),
    [activeTab],
  );

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-[var(--delta-neutral-panel-bottom,0px)] z-[70] transition-transform duration-300 ease-out max-tablet:bottom-[var(--delta-neutral-panel-bottom-mobile,calc(4.25rem+env(safe-area-inset-bottom)))] tablet:bottom-[var(--delta-neutral-panel-bottom,0px)] ${
        hiddenByScroll && !hovered && !isNarrow ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <section
        onWheel={handleWheel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          'pointer-events-auto w-full overflow-hidden border-t shadow-[0_-10px_34px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.03)]',
          isV2
            ? 'border-[#3d3428] bg-[#000000]'
            : 'border-[rgba(214,176,106,0.26)] bg-[linear-gradient(180deg,rgba(10,10,10,0.98)_0%,rgba(6,6,6,0.99)_100%)]',
        )}
      >
        <div
          className={clsx(
            'flex items-center justify-between gap-3 border-b px-3 py-2.5 max-tablet:cursor-pointer tablet:px-5',
            isV2 ? 'border-[#1f1f1f]' : 'border-[rgba(255,255,255,0.08)]',
          )}
          onClick={handleHeaderToggle}
          onKeyDown={event => {
            if (isNarrow && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              setExpanded(prev => !prev);
            }
          }}
          role={isNarrow ? 'button' : undefined}
          tabIndex={isNarrow ? 0 : undefined}
          aria-expanded={isNarrow ? expanded : undefined}
        >
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveTab('positions')}
              className={clsx(
                'rounded-[8px] px-3 text-[11px] font-semibold uppercase tracking-[0.8px] transition-colors max-tablet:min-h-[44px] max-tablet:px-4',
                activeTab === 'positions'
                  ? isV2
                    ? 'h-[30px] border border-[#c9a962] bg-transparent text-[#c9a962]'
                    : 'h-[30px] bg-[rgba(214,176,106,0.14)] text-[#f0ddb9]'
                  : isV2
                    ? 'h-[30px] border border-transparent text-[#888888] hover:bg-[#141414] hover:text-[#c4c4c4]'
                    : 'h-[30px] text-[#9a9ba8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#dadbe5]',
              )}
            >
              Positions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={clsx(
                'rounded-[8px] px-3 text-[11px] font-semibold uppercase tracking-[0.8px] transition-colors max-tablet:min-h-[44px] max-tablet:px-4',
                activeTab === 'history'
                  ? isV2
                    ? 'h-[30px] border border-[#c9a962] bg-transparent text-[#c9a962]'
                    : 'h-[30px] bg-[rgba(214,176,106,0.14)] text-[#f0ddb9]'
                  : isV2
                    ? 'h-[30px] border border-transparent text-[#888888] hover:bg-[#141414] hover:text-[#c4c4c4]'
                    : 'h-[30px] text-[#9a9ba8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#dadbe5]',
              )}
            >
              History
            </button>
          </div>
          <div className="flex items-center gap-2">
            <p className={clsx('hidden text-[10px] tablet:block', headerText)}>
              {activeTab === 'positions'
                ? 'One row per token — each leg tagged spot or perp, hedged across DEXs'
                : 'Paired long + short fills per vault action'}
            </p>
            <ChevronDown
              className={clsx(
                'h-4 w-4 text-[#8f90a1] transition-transform max-tablet:block tablet:hidden',
                expanded && 'rotate-180',
              )}
              aria-hidden
            />
          </div>
        </div>

        <div
          className={`transition-[height] duration-300 ease-out ${
            expanded ? 'h-[42vh]' : 'h-[140px] max-tablet:h-[120px]'
          }`}
        >
          <div className="h-full overflow-x-auto overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className={minTableWidth}>
              <div
                className={clsx(
                  'sticky top-0 z-[2] border-b px-3 py-2.5 tablet:px-4',
                  activeTab === 'positions' ? POSITIONS_GRID : HISTORY_GRID,
                  headerBorder,
                  headerBg,
                )}
              >
                {(activeTab === 'positions' ? POSITIONS_COLUMNS : HISTORY_COLUMNS).map(column => (
                  <span
                    key={column}
                    className={clsx('pr-2 text-[10px] uppercase tracking-[0.75px]', headerText)}
                    aria-label={column === 'P&L' ? 'Profit and loss' : undefined}
                  >
                    {column}
                  </span>
                ))}
              </div>

              <div className="px-3 py-1.5 tablet:px-4">
                {activeTab === 'positions' &&
                  POSITION_PAIRS.map(pair => {
                    const net = pair.long.pnlValue + pair.short.pnlValue;
                    return (
                      <div
                        key={pair.coin}
                        className={clsx(POSITIONS_GRID, 'border-b py-2.5 text-[12px]', rowBorder, rowText)}
                      >
                        <MarketCell
                          coin={pair.coin}
                          category={pair.category}
                          longDex={pair.long.dex}
                          shortDex={pair.short.dex}
                          longInstrument={pair.long.instrument}
                          shortInstrument={pair.short.instrument}
                          longLev={pair.long.leverage}
                          shortLev={pair.short.leverage}
                          longWallet={pair.long.wallet}
                          shortWallet={pair.short.wallet}
                        />
                        <DualCell longVal={pair.long.size} shortVal={pair.short.size} />
                        <DualCell longVal={pair.long.positionValue} shortVal={pair.short.positionValue} />
                        <DualCell longVal={pair.long.entryPrice} shortVal={pair.short.entryPrice} />
                        <DualCell longVal={pair.long.currentPrice} shortVal={pair.short.currentPrice} />
                        <PnlCompositionCell
                          variant={isV2 ? 'v2' : 'compact'}
                          net={net}
                          longPnl={pair.long.pnl}
                          longPnlValue={pair.long.pnlValue}
                          shortPnl={pair.short.pnl}
                          shortPnlValue={pair.short.pnlValue}
                        />
                        <DualCell longVal={pair.long.liqPrice} shortVal={pair.short.liqPrice} />
                        <DualCell
                          longVal={pair.long.margin}
                          shortVal={pair.short.margin}
                          longTitle={marginTitle(pair.long)}
                          shortTitle={marginTitle(pair.short)}
                        />
                        <DualCell
                          longVal={pair.long.funding}
                          shortVal={pair.short.funding}
                          longClassName={fundingClass(pair.long.funding)}
                          shortClassName={fundingClass(pair.short.funding)}
                        />
                        <DualCell longVal={pair.long.tpSl} shortVal={pair.short.tpSl} />
                        <DualCell longVal={pair.long.expected} shortVal={pair.short.expected} />
                        <div className="flex min-h-[34px] items-center pr-2">
                          <span className={clsx('text-[11px] font-medium', isV2 ? 'text-[#c9a962]' : 'text-[#d6b06a]')}>
                            Close pair
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {activeTab === 'history' &&
                  HISTORY_PAIRS.map(row => {
                    const net = row.long.pnlValue + row.short.pnlValue;
                    return (
                      <div
                        key={`${row.time}-${row.coin}-${row.event}`}
                        className={clsx(HISTORY_GRID, 'border-b py-2.5 text-[12px]', rowBorder, rowText)}
                      >
                        <span className="flex min-h-[52px] items-center pr-2">{row.time}</span>
                        <div className="flex min-h-[52px] flex-col justify-center gap-1 pr-2">
                          <span className="font-medium text-[#e8d5b5]">{row.coin}</span>
                          {row.category && (
                            <span className="inline-flex w-fit rounded-full border border-[rgba(204,177,127,0.4)] bg-[rgba(204,177,127,0.12)] px-1.5 py-px text-[8px] uppercase text-[#d8bf92]">
                              {row.category}
                            </span>
                          )}
                        </div>
                        <div className="flex min-h-[52px] flex-col justify-center gap-2 pr-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                              <DexLogo dex={row.long.dex} />
                              <span
                                className={clsx(
                                  'w-[62px] shrink-0 text-[10px] font-medium',
                                  LONG_INK,
                                )}
                              >
                                {row.long.action}
                              </span>
                              <InstrumentTag instrument={row.long.instrument} />
                            </div>
                            <WalletAddressLabel address={row.long.wallet} className={LEG_INDENT} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                              <DexLogo dex={row.short.dex} />
                              <span
                                className={clsx(
                                  'w-[62px] shrink-0 text-[10px] font-medium',
                                  SHORT_INK,
                                )}
                              >
                                {row.short.action}
                              </span>
                              <InstrumentTag instrument={row.short.instrument} />
                            </div>
                            <WalletAddressLabel address={row.short.wallet} className={LEG_INDENT} />
                          </div>
                        </div>
                        <DualCell longVal={row.long.price} shortVal={row.short.price} />
                        <DualCell longVal={row.long.size} shortVal={row.short.size} />
                        <DualCell longVal={row.long.tradeValue} shortVal={row.short.tradeValue} />
                        <DualCell longVal={row.long.fee} shortVal={row.short.fee} />
                        <div className="flex min-h-[34px] flex-col justify-center pr-2">
                          <span
                            className={clsx(
                              'text-[12px] font-semibold',
                              pnlTextClass(net),
                            )}
                          >
                            {formatSignedUsd(net, 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
