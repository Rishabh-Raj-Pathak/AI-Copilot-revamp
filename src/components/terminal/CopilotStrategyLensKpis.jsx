import { terminalKpiBar } from "../../design-system/tokens/terminalKpiBar";
import {
  formatMobileCount,
  formatMobileRewardsUsd,
  formatMobileVolumeUsd,
} from "./copilotMobileFormat.js";

function KpiMetric({ label, value, align = "start" }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 whitespace-nowrap ${
        align === "end" ? "justify-end" : ""
      }`}
    >
      <span className={terminalKpiBar.labelClassName}>{label}</span>
      <span className={terminalKpiBar.valueClassName}>{value}</span>
    </div>
  );
}

function PlatformKpiMetrics({ stats, align = "start" }) {
  const rewards = stats.rewards ?? stats.volume * 0.0003;

  return (
    <>
      <KpiMetric
        label="Total Volume:"
        value={formatMobileVolumeUsd(stats.volume)}
        align={align}
      />
      <KpiMetric
        label="Trades Executed:"
        value={formatMobileCount(stats.trades)}
        align={align}
      />
      <KpiMetric
        label="Rewards Distributed:"
        value={formatMobileRewardsUsd(rewards)}
        align={align}
      />
    </>
  );
}

/**
 * Platform-wide KPI metrics — Total Volume, Trades Executed, Rewards Distributed.
 * @param {{ stats: object, mobile?: boolean, variant?: 'strip' | 'rail' | 'standalone' }} props
 */
export function CopilotPlatformKpis({
  stats,
  mobile = false,
  variant = "strip",
}) {
  if (!stats) return null;

  if (mobile) {
    const rewards = stats.rewards ?? stats.volume * 0.0003;

    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] leading-tight text-[#757575]">
            Total Volume
          </span>
          <span className="truncate text-[15px] font-semibold leading-tight text-white">
            {formatMobileVolumeUsd(stats.volume)}
          </span>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] leading-tight text-[#757575]">
            Trades Executed
          </span>
          <span className="truncate text-[15px] font-semibold leading-tight text-white">
            {formatMobileCount(stats.trades)}
          </span>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] leading-tight text-[#757575]">
            Rewards Distributed
          </span>
          <span className="truncate text-[15px] font-semibold leading-tight text-white">
            {formatMobileRewardsUsd(rewards)}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:gap-x-6 lg:gap-x-10">
        <PlatformKpiMetrics stats={stats} />
      </div>
    );
  }

  if (variant === "rail") {
    return (
      <div
        className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1.5 sm:gap-x-6 lg:gap-x-8"
        title="Platform-wide metrics across all strategies"
      >
        <PlatformKpiMetrics stats={stats} align="end" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#242424] bg-[#0a0a0a] px-3.5 py-2.5 sm:px-4 sm:py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:gap-x-6 lg:gap-x-10">
        <PlatformKpiMetrics stats={stats} />
      </div>
    </div>
  );
}
