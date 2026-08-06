import { Activity, Hexagon, Zap } from "lucide-react";
import {
  clampAmountStr,
  feePctFromShare,
  parseMaxUsdcFromLabel,
} from "./vaultUiUtils.js";
import VaultStrategySelector from "./VaultStrategySelector.jsx";
import { resolveVaultStrategies } from "./vaultStrategiesData.js";

const ICONS = {
  pulse: Activity,
  hex: Hexagon,
  bolt: Zap,
};

function Badge({ badge }) {
  if (!badge) return null;
  const { type, label } = badge;
  if (type === "popular") {
    return (
      <span className="inline-flex items-center rounded-full border border-[rgba(43,127,255,0.2)] bg-[rgba(43,127,255,0.1)] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] text-[#51a2ff] shadow-[inset_0_0_4px_#002e74]">
        {label}
      </span>
    );
  }
  if (type === "highApr") {
    return (
      <span className="inline-flex items-center rounded-full border border-[rgba(0,188,125,0.2)] bg-[rgba(0,188,125,0.1)] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] text-[#00d492] shadow-[inset_0_0_4px_#006c4a]">
        {label}
      </span>
    );
  }
  if (type === "highRisk") {
    return (
      <span className="relative inline-flex items-center rounded-full border border-[rgba(255,105,0,0.2)] bg-[rgba(255,105,0,0.1)] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] text-[#ff8904] shadow-[inset_0_0_4px_#5c3100]">
        {label}
      </span>
    );
  }
  return null;
}

function BronzeStrip() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 z-2 hidden w-[26px] flex-col items-center justify-center overflow-hidden rounded-l-[inherit] bg-[#785a28] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] tablet:flex"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-0 top-[20.6px] h-[37.67px] w-full blur-[1.5px]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.12) 55%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="relative flex h-full w-full items-center justify-center px-[6.5px]">
        <div className="-rotate-90 whitespace-nowrap">
          <span className="text-[9px] font-normal uppercase tracking-[0.5px] text-white">
            NO FEE
          </span>
        </div>
      </div>
    </div>
  );
}

const STAT_ROWS = [
  ["VOL", "Volume", "volume", "font-medium text-[#d4d4d8]"],
  ["APR", "APR", "apr", "font-bold text-[#ccb17f]"],
  ["USERS", "Users", "users", "font-medium text-[#717182]"],
];

/**
 * Figma: `4421:6264` outer shell + `4421:6266` inner row — interactive controls match `4421:6299`.
 */
export default function VaultRow({
  vault,
  ui,
  isFirst,
  onShareChange,
  onAmountStrChange,
  onMaxClick,
  onBacktest,
  onActivate,
  onStrategySelect,
  tourControlsDataTour,
}) {
  const {
    name,
    badge,
    subline,
    sublineTone,
    stats,
    maxLabel,
    bronzeStrip,
    iconKey,
  } = vault;

  const Icon = ICONS[iconKey] ?? Activity;
  const sharePct = ui.sharePct;
  const amountStr = ui.amountStr;
  const activated = ui.activated;
  const feeLabel = feePctFromShare(sharePct);
  const vaultMaxUsdc = parseMaxUsdcFromLabel(maxLabel);
  const strategies = resolveVaultStrategies(vault);
  const selectedStrategyId =
    ui.selectedStrategyId ?? strategies[0]?.id ?? null;

  const paddedForStrip = Boolean(bronzeStrip);

  return (
    <article
      className={`vaults-root relative w-full min-h-[72px] overflow-hidden shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] max-tablet:rounded-[14px] max-tablet:border max-tablet:border-[rgba(255,255,255,0.06)] ${
        isFirst
          ? ""
          : "border-t border-[rgba(255,255,255,0.03)] max-tablet:border-t"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(22, 20, 18, 0.6) 0%, rgba(14, 12, 10, 0.4) 100%), linear-gradient(90deg, rgb(12, 12, 12) 0%, rgb(12, 12, 12) 100%)",
      }}
    >
      {bronzeStrip ? <BronzeStrip /> : null}
      <div
        className={`relative z-1 flex w-full flex-col gap-4 px-4 py-4 tablet:flex-row tablet:items-center tablet:gap-0 tablet:py-0 tablet:pr-6 tablet:pl-4 ${
          paddedForStrip ? "tablet:pl-10" : ""
        }`}
      >
        <div className="flex min-w-0 items-start justify-between gap-3 tablet:w-[16%] tablet:min-w-[200px] tablet:max-w-[280px] tablet:flex-none tablet:justify-start tablet:py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-[#ccb17f] opacity-80">
              <Icon className="size-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-medium leading-5 text-[#e8d5b5]">
                  {name}
                </span>
                <Badge badge={badge} />
              </div>
              {subline ? (
                <p
                  className={`text-[11px] font-medium uppercase tracking-[0.275px] ${
                    sublineTone === "gold"
                      ? "text-[#ccb17f]"
                      : "text-[#717182]"
                  }`}
                >
                  {subline}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-[rgba(255,255,255,0.05)] tablet:mx-4 tablet:block" />

        {/* Mobile: row-pair stats */}
        <div className="flex flex-col gap-2.5 tablet:hidden">
          {STAT_ROWS.map(([mobileLabel, , key, valClass]) => (
            <div key={mobileLabel} className="flex items-center justify-between">
              <span className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#717182]">
                {mobileLabel}
              </span>
              <span className={`text-sm leading-5 ${valClass}`}>
                {stats[key]}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop: column stats */}
        <div className="hidden min-w-[240px] flex-1 gap-6 tablet:flex tablet:gap-10 tablet:py-4 lg:gap-12">
          {STAT_ROWS.map(([, label, key, valClass]) => (
            <div key={label} className="flex min-w-[72px] flex-col gap-0.5">
              <span className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#717182]">
                {label}
              </span>
              <span className={`text-sm leading-5 ${valClass}`}>
                {stats[key]}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-[rgba(255,255,255,0.05)] lg:mx-2 lg:block" />

        <div
          className="flex min-w-0 flex-1 flex-col gap-3 tablet:py-4 lg:min-w-[380px] lg:flex-row lg:items-center lg:justify-end lg:gap-4 lg:flex-[1.85]"
          {...(tourControlsDataTour
            ? { "data-tour": tourControlsDataTour }
            : {})}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2 tablet:flex-row tablet:items-center tablet:gap-4">
            <div className="flex min-w-[140px] flex-1 items-center gap-2">
              <div className="relative flex h-[18px] flex-1 items-center px-0.5">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#1e1b18] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" />
                <div
                  className="pointer-events-none absolute left-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-linear-to-b from-[#5a431e] via-[#694e23] to-[#785a28]"
                  style={{
                    width: `calc((100% - 8px) * ${sharePct / 100})`,
                  }}
                />
                <div
                  className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(232,213,181,0.2)] bg-[#ccb17f] shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
                  style={{
                    left: `calc(4px + (100% - 24px) * ${sharePct / 100})`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.25}
                  value={sharePct}
                  onChange={(e) => onShareChange(Number(e.target.value))}
                  className="vaults-range-input relative z-10"
                  aria-label={`${name} performance fee`}
                  aria-valuetext={feeLabel}
                />
              </div>
              <span className="w-[38px] shrink-0 text-right text-xs font-medium leading-[18px] text-white">
                {feeLabel}
              </span>
            </div>

            <div className="relative flex h-[34px] w-full max-w-none flex-1 items-center rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] px-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] tablet:min-w-[200px] tablet:max-w-[300px]">
              <span className="text-sm font-medium leading-[21px] text-[#ccb17f]">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => onAmountStrChange(e.target.value)}
                onBlur={() =>
                  onAmountStrChange(clampAmountStr(amountStr, vaultMaxUsdc))
                }
                className="ml-1 min-w-0 flex-1 bg-transparent text-right text-sm font-semibold leading-[21px] text-[#f0f0f0] outline-none"
                aria-label={`${name} USDC amount`}
              />
              <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">
                USDC
              </span>
              <span className="mx-2 h-5 w-px shrink-0 bg-[rgba(255,255,255,0.05)]" />
              <button
                type="button"
                onClick={onMaxClick}
                className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.225px] text-[#ccb17f] transition-opacity hover:opacity-90"
              >
                {maxLabel}
              </button>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 tablet:w-auto tablet:flex-row tablet:items-center">
            <VaultStrategySelector
              strategies={strategies}
              selectedId={selectedStrategyId}
              disabled={activated}
              onSelect={(id) => onStrategySelect?.(id)}
              inline
            />
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={onBacktest}
                className="h-[37px] min-w-0 flex-1 rounded-[10px] border border-[rgba(120,90,40,0.22)] bg-[rgba(255,255,255,0.02)] px-3 text-[13px] font-medium uppercase tracking-[0.35px] text-[#8a8a94] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:border-[#785a28] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#d4d4d8] tablet:w-[122px] tablet:flex-none"
              >
                Backtest
              </button>

              <button
                type="button"
                disabled={activated}
                onClick={onActivate}
                className={`h-[37px] min-w-0 flex-1 rounded-[10px] border px-3 text-[13px] font-medium uppercase tracking-[0.35px] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors tablet:w-[122px] tablet:flex-none ${
                  activated
                    ? "cursor-default border-[rgba(0,188,125,0.35)] bg-[rgba(0,188,125,0.12)] text-[#00d492]"
                    : "cursor-pointer border-[#785a28] bg-linear-to-b from-[#14100a] to-[#0a0805] text-[#bfbfbf] hover:border-[#ccb17f] hover:text-white"
                }`}
                style={
                  activated
                    ? undefined
                    : {
                        backgroundImage:
                          "linear-gradient(180deg, rgb(20, 16, 10) 0%, rgb(10, 8, 5) 100%)",
                      }
                }
              >
                {activated ? "Active" : selectedStrategyId ? "Activate" : "Pick strategy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
