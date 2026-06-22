import React from 'react';
import { clsx } from 'clsx';

export function pnlTextClass(value: number) {
  return value >= 0 ? 'text-[#00d492]' : 'text-[#e5484d]';
}

export function formatSignedUsd(value: number, decimals = 0) {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(value).toFixed(decimals)}`;
}

function pnlBorderColor(value: number) {
  return value >= 0 ? 'rgba(0,212,146,0.45)' : 'rgba(229,72,77,0.45)';
}

function PnlLegRow({
  display,
  value,
  compact,
  alignEnd,
}: {
  display: string;
  value: number;
  compact: boolean;
  alignEnd: boolean;
}) {
  return (
    <span
      className={clsx(
        'block min-w-0 truncate tabular-nums font-[\'Onest\',sans-serif] leading-tight opacity-90',
        alignEnd ? 'border-r-2 pr-1.5 text-right' : 'border-l-2 pl-1.5',
        compact ? 'text-[10px]' : 'text-[11px]',
        pnlTextClass(value),
      )}
      style={{ borderColor: pnlBorderColor(value) }}
    >
      {display}
    </span>
  );
}

export type PnlCompositionVariant = 'default' | 'v2' | 'compact';

export type PnlCompositionCellProps = {
  net: number;
  longPnl: string;
  longPnlValue: number;
  shortPnl: string;
  shortPnlValue: number;
  variant?: PnlCompositionVariant;
  showAccent?: boolean;
  align?: 'start' | 'end';
  className?: string;
};

export function PnlCompositionCell({
  net,
  longPnl,
  longPnlValue,
  shortPnl,
  shortPnlValue,
  variant = 'default',
  showAccent = false,
  align = 'start',
  className,
}: PnlCompositionCellProps) {
  const compact = variant === 'compact';
  const decimals = compact ? 0 : 2;
  const netPositive = net >= 0;
  const alignEnd = align === 'end';

  const ariaLabel = `Combined profit and loss ${formatSignedUsd(net, decimals)}; long leg ${longPnl}; short leg ${shortPnl}`;

  return (
    <div
      className={clsx('relative flex min-h-[34px] flex-col justify-center pr-2', showAccent && 'pl-[10px]', className)}
      aria-label={ariaLabel}
    >
      {showAccent && (
        <>
          <div
            className="pointer-events-none absolute inset-0 rounded-[8px]"
            style={{
              background: netPositive
                ? 'radial-gradient(ellipse at 0% 50%, rgba(0,212,146,0.07) 0%, transparent 65%)'
                : 'radial-gradient(ellipse at 0% 50%, rgba(229,72,77,0.07) 0%, transparent 65%)',
            }}
          />
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-[55%] w-[2px] -translate-y-1/2 rounded-full"
            style={{
              backgroundColor: netPositive ? 'rgba(0,212,146,0.4)' : 'rgba(229,72,77,0.4)',
            }}
          />
        </>
      )}

      <div
        className={clsx(
          'relative flex flex-col',
          compact ? 'gap-[3px]' : 'gap-[5px]',
          alignEnd && 'items-end text-right',
        )}
      >
        <span
          className={clsx(
            "font-['Onest',sans-serif] font-semibold tabular-nums",
            pnlTextClass(net),
            compact ? 'text-[12px] leading-[16px]' : 'text-[13px] leading-[18px]',
            alignEnd && 'text-[16px] leading-[20px]',
          )}
        >
          {formatSignedUsd(net, decimals)}
        </span>

        <div
          className="h-px w-full shrink-0"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          aria-hidden
        />

        <div className={clsx('flex flex-col', compact ? 'gap-[3px]' : 'gap-[4px]', alignEnd && 'items-end')}>
          <PnlLegRow display={longPnl} value={longPnlValue} compact={compact} alignEnd={alignEnd} />
          <PnlLegRow display={shortPnl} value={shortPnlValue} compact={compact} alignEnd={alignEnd} />
        </div>
      </div>
    </div>
  );
}
