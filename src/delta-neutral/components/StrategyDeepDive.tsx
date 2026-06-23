import React, { useMemo, useState } from 'react';
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
        'rounded-[12px] border p-3 max-tablet:p-2.5 tablet:p-4',
        isV2 ? 'border-[#2a2418] bg-[#0a0a0a]' : 'border-[rgba(255,255,255,0.1)] bg-[#070707]',
      )}
    >
      <div className="mb-2 flex items-center justify-between max-tablet:mb-1.5 tablet:mb-3">
        <div className="min-w-0">
          <p className="truncate font-['Onest',sans-serif] text-[13px] font-semibold text-[#f5f5f5] max-tablet:text-[13px] tablet:text-[14px]">
            {dex} · {instrumentLabel}
          </p>
          <p className="text-[10px] text-[#717182] tablet:text-[11px]">Funding trajectory (24h)</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[9px] uppercase tracking-[0.7px] text-[#9c9cac] tablet:text-[10px]">Latest</p>
          <p className="font-mono text-[12px] font-semibold tablet:text-[13px]" style={{ color: tone }}>
            +{(latest * 100).toFixed(3)}%
          </p>
        </div>
      </div>
      <div className="h-[220px] w-full min-h-[200px] max-tablet:h-[160px] max-tablet:min-h-[140px]">
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
  const [mobileDex, setMobileDex] = useState<ManagedDexId>(longDex);

  const mobileActiveDex = dedupedDexes.includes(mobileDex) ? mobileDex : dedupedDexes[0];

  return (
    <div className="font-['Onest',sans-serif] mt-4 max-tablet:mt-2">
      {dedupedDexes.length > 1 ? (
        <div className="mb-2 flex gap-1.5 max-tablet:flex tablet:hidden">
          {dedupedDexes.map(dex => (
            <button
              key={dex}
              type="button"
              onClick={() => setMobileDex(dex)}
              className={clsx(
                'h-9 flex-1 rounded-[8px] border px-2 text-[10px] font-semibold uppercase tracking-[0.06em] transition-colors',
                mobileActiveDex === dex
                  ? 'border-[rgba(214,176,106,0.42)] bg-[rgba(54,42,28,0.5)] text-[#f0ddb9]'
                  : 'border-[rgba(255,255,255,0.08)] text-[#9394a1]',
              )}
            >
              {dex}
            </button>
          ))}
        </div>
      ) : null}

      <div className="hidden grid-cols-1 gap-5 max-tablet:gap-3 tablet:grid xl:grid-cols-2">
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

      <div className="max-tablet:block tablet:hidden">
        <DexFundingChart
          dex={mobileActiveDex}
          pairLabel={pairLabel}
          tokenLabel={dexTokenLabelMap?.[mobileActiveDex]}
          variant={variant}
        />
      </div>
    </div>
  );
}
