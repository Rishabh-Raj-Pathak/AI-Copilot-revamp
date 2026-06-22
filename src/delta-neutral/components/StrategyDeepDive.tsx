import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import {
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ManagedDexId = 'Hyperliquid' | 'Pacifica' | 'Nado';
type Point = { t: string; value: number };

const DEX_SERIES: Record<ManagedDexId, Point[]> = {
  Hyperliquid: [
    { t: '00:00', value: 0.018 },
    { t: '04:00', value: 0.021 },
    { t: '08:00', value: 0.024 },
    { t: '12:00', value: 0.022 },
    { t: '16:00', value: 0.026 },
    { t: '20:00', value: 0.023 },
    { t: '24:00', value: 0.025 },
  ],
  Pacifica: [
    { t: '00:00', value: 0.012 },
    { t: '04:00', value: 0.014 },
    { t: '08:00', value: 0.013 },
    { t: '12:00', value: 0.016 },
    { t: '16:00', value: 0.015 },
    { t: '20:00', value: 0.017 },
    { t: '24:00', value: 0.014 },
  ],
  Nado: [
    { t: '00:00', value: 0.010 },
    { t: '04:00', value: 0.012 },
    { t: '08:00', value: 0.011 },
    { t: '12:00', value: 0.013 },
    { t: '16:00', value: 0.012 },
    { t: '20:00', value: 0.014 },
    { t: '24:00', value: 0.012 },
  ],
};

const DEX_ACCENT: Record<ManagedDexId, string> = {
  Hyperliquid: '#8fa3b8',
  Pacifica: '#b89aa8',
  Nado: '#8f9f91',
};

type StrategyDeepDiveVariant = 'default' | 'v2';

type StrategyDeepDiveProps = {
  pairLabel: string;
  longDex: ManagedDexId;
  shortDex: ManagedDexId;
  dexTokenLabelMap?: Partial<Record<ManagedDexId, string>>;
  variant?: StrategyDeepDiveVariant;
};

function DexFundingChart({
  dex,
  pairLabel,
  tokenLabel,
  variant = 'default',
}: {
  dex: ManagedDexId;
  pairLabel: string;
  tokenLabel?: string;
  variant?: StrategyDeepDiveVariant;
}) {
  const isV2 = variant === 'v2';
  const rows = DEX_SERIES[dex];
  const latest = rows[rows.length - 1]?.value ?? 0;
  const tone = DEX_ACCENT[dex];
  const instrumentLabel = tokenLabel || pairLabel;

  return (
    <div
      className={clsx(
        'rounded-[12px] border p-3 md:p-4',
        isV2 ? 'border-[#2a2418] bg-[#0a0a0a]' : 'border-[rgba(255,255,255,0.1)] bg-[#070707]',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-['Onest',sans-serif] text-[14px] font-semibold text-[#f5f5f5]">{dex} · {instrumentLabel}</p>
          <p className="text-[11px] text-[#717182]">Funding trajectory (24h)</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.7px] text-[#9c9cac]">Latest</p>
          <p className="font-mono text-[13px] font-semibold" style={{ color: tone }}>
            +{(latest * 100).toFixed(3)}%
          </p>
        </div>
      </div>
      <div className="h-[220px] w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: '#717182', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#717182', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${(v * 100).toFixed(2)}%`}
              domain={['dataMin - 0.003', 'dataMax + 0.003']}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Point;
                return (
                  <div className="rounded-md border border-[rgba(146,111,56,0.5)] bg-[#0a0a0a] px-2.5 py-2 font-mono text-[11px] shadow-lg">
                    <p className="mb-1.5 text-[#e8d5b5]">{label}</p>
                    <p style={{ color: tone }}>{dex} · {(row.value * 100).toFixed(3)}%</p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="value" stroke={tone} strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StrategyDeepDive({
  pairLabel,
  longDex,
  shortDex,
  dexTokenLabelMap,
  variant = 'default',
}: StrategyDeepDiveProps) {
  const dedupedDexes = useMemo(() => {
    return longDex === shortDex ? [longDex] : [longDex, shortDex];
  }, [longDex, shortDex]);
  return (
    <div className="font-['Onest',sans-serif] mt-4 grid grid-cols-1 gap-5 xl:grid-cols-2">
      {dedupedDexes.map(dex => (
        <DexFundingChart
          key={`${pairLabel}-${dex}`}
          dex={dex}
          pairLabel={pairLabel}
          tokenLabel={dexTokenLabelMap?.[dex]}
          variant={variant}
        />
      ))}
    </div>
  );
}
