import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Coins, LineChart, Shield } from 'lucide-react';

type StatCardVariant = 'default' | 'v2' | 'vaults';

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  variant?: StatCardVariant;
  /** Shorter label for narrow mobile layouts */
  mobileTitle?: string;
}

export function StatCard({ title, value, subtext, variant = 'default', mobileTitle }: StatCardProps) {
  const StatIcon = title === 'Total Volume' ? Coins : title === 'Yield Distributed' ? LineChart : Shield;
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const prefix = value.startsWith('$') ? '$' : '';
  const suffix = value.endsWith('%') ? '%' : '';

  const count = useMotionValue(0);

  const rounded = useTransform(count, (latest) => {
    const hasDecimals = value.includes('.');
    const decimals = hasDecimals ? (value.split('.')[1]?.length || 2) : 0;
    const formattedNumber = latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${prefix}${formattedNumber}${suffix}`;
  });

  useEffect(() => {
    animate(count, numericValue, {
      duration: 1.5,
      ease: [0.25, 0.1, 0.25, 1],
    });
  }, [numericValue, count]);

  const isV2 = variant === 'v2';
  const isVaults = variant === 'vaults';

  if (isVaults) {
    const narrowTitle = mobileTitle ?? title;
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] max-tablet:rounded-lg max-tablet:px-3 max-tablet:py-2.5"
      >
        <div className="flex flex-col gap-2 max-tablet:gap-1">
          <p className="text-[12px] font-bold uppercase leading-[18px] tracking-[0.08em] text-[#717182] max-tablet:text-[10px] max-tablet:leading-tight max-tablet:tracking-[0.06em]">
            <span className="max-tablet:hidden">{title}</span>
            <span className="hidden max-tablet:inline">{narrowTitle}</span>
          </p>
          <motion.p className="vaults-stat-value-gradient text-[32px] font-bold leading-[35px] max-tablet:text-[1.1875rem] max-tablet:leading-tight">
            {rounded}
          </motion.p>
          <p className="text-[12px] leading-[18px] text-[rgba(255,255,255,0.4)] max-tablet:hidden">
            {subtext}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={clsx(
        'relative w-full overflow-hidden p-4 transition-colors md:p-5',
        isV2
          ? 'rounded-[10px] border border-[#3d3428] bg-[#121212] shadow-none hover:border-[#5c4d38]'
          : 'rounded-[14px] border border-[rgba(214,176,106,0.26)] bg-[linear-gradient(180deg,rgba(14,14,14,0.94)_0%,rgba(10,10,10,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-8px_20px_rgba(0,0,0,0.35)] hover:border-[rgba(214,176,106,0.38)]',
      )}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0',
          !isV2 && 'bg-[radial-gradient(circle_at_96%_10%,rgba(214,176,106,0.11),transparent_46%)]',
        )}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p
            className={clsx(
              "font-['Onest',sans-serif] text-[10px] font-semibold uppercase tracking-[1.15px] leading-[16px]",
              isV2 ? 'text-[#888888]' : 'text-[#8f9098]',
            )}
          >
            {title}
          </p>
          <motion.p
            className={clsx(
              "font-['Onest',sans-serif] text-[37px] font-bold leading-[38px] tracking-[-0.6px]",
              isV2 ? 'text-[#E8E2D2]' : 'text-[#f1dfbf]',
            )}
          >
            {rounded}
          </motion.p>
          <p
            className={clsx(
              "font-['Onest',sans-serif] text-[11px] leading-[16px]",
              isV2 ? 'text-[#6b6b6b]' : 'text-[#787983]',
            )}
          >
            {subtext}
          </p>
        </div>
        <div
          className={clsx(
            'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border',
            isV2
              ? 'border-[#c9a962] bg-[#0d0d0d] text-[#c9a962]'
              : 'border-[rgba(214,176,106,0.3)] bg-[linear-gradient(180deg,rgba(23,19,14,0.98)_0%,rgba(12,10,8,0.98)_100%)] text-[#d6b06a]',
          )}
        >
          <StatIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  );
}
