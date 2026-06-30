import { Activity, Hexagon, Pencil, X, Zap } from "lucide-react";
import { formatUsdcAmountDisplay } from "./vaultUiUtils.js";
import VaultAgentStatus from "./agentLogs/VaultAgentStatus.jsx";

const ICONS = {
  pulse: Activity,
  hex: Hexagon,
  bolt: Zap,
};

const STAT_ROWS = [
  ["VOL", "Volume", "volume", "font-medium text-white"],
  ["APR", "APR", "apr", "font-medium text-[#5eead4]"],
  ["USERS", "Users", "users", "font-medium text-white"],
  ["PNL", "PNL", "pnl", "font-medium text-[#ccb17f]"],
];

function TealOverlappingCircles() {
  return (
    <svg
      width={22}
      height={20}
      viewBox="0 0 22 20"
      className="shrink-0 text-[#2dd4bf]"
      aria-hidden
    >
      <circle cx="8" cy="10" r="5.5" fill="currentColor" opacity={0.92} />
      <circle cx="14" cy="10" r="5.5" fill="currentColor" opacity={0.92} />
    </svg>
  );
}

/**
 * List row for activated allocations — metrics + allocation % + edit/remove.
 */
export default function ActivatedVaultRow({
  vault,
  ui,
  isFirst,
  enterIndex,
  onPatch,
  agentHealth,
  onOpenVaultLogs,
}) {
  const {
    name,
    strategyLabel,
    stats,
    maxLabel,
    iconKey,
    activationDescriptor,
  } = vault;

  const Icon = ICONS[iconKey] ?? Activity;
  const sharePct = ui?.sharePct ?? 0;
  const amountStr = ui?.amountStr ?? "0";
  const sublineRaw = activationDescriptor?.trim() || strategyLabel || "";
  const subline = sublineRaw ? sublineRaw.toUpperCase() : "";
  const useCirclesBrand = iconKey === "pulse";

  const pnlDisplay = stats?.pnl ?? "—";

  return (
    <article
      className={`vaults-root vaults-activated-row-animate relative min-h-[72px] overflow-hidden max-tablet:rounded-[14px] max-tablet:border max-tablet:border-[rgba(120,90,40,0.22)] max-tablet:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] ${
        isFirst
          ? ""
          : "border-t border-[rgba(255,255,255,0.04)] max-tablet:border-t"
      }`}
      style={{
        animationDelay: `${(enterIndex ?? 0) * 55}ms`,
        backgroundImage:
          "linear-gradient(90deg, rgba(26, 22, 18, 0.75) 0%, rgba(12, 10, 8, 0.55) 100%), linear-gradient(90deg, rgb(14, 12, 11) 0%, rgb(10, 10, 10) 100%)",
      }}
    >
      <div className="relative z-1 flex w-full flex-col gap-4 px-4 py-4 tablet:flex-row tablet:items-center tablet:gap-0 tablet:py-0 tablet:pr-6 tablet:pl-4">
        <div className="flex min-w-0 items-start justify-between gap-3 tablet:w-[16%] tablet:min-w-[200px] tablet:max-w-[280px] tablet:flex-none tablet:justify-start tablet:py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {useCirclesBrand ? (
                <TealOverlappingCircles />
              ) : (
                <div className="flex size-5 items-center justify-center text-[#2dd4bf]">
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <span className="text-base font-semibold leading-5 text-white">
                {name}
              </span>
              {subline ? (
                <p className="hidden text-[11px] font-medium uppercase leading-4 tracking-[0.275px] text-[#717182] tablet:block">
                  {subline}
                </p>
              ) : null}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(8,8,10,0.65)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] text-[#d4c4a0]">
            <span className="size-1.5 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.45)]" />
            Active
          </span>
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-[rgba(255,255,255,0.06)] tablet:mx-4 tablet:block" />

        {/* Mobile: row-pair stats */}
        <div className="flex flex-col gap-2.5 tablet:hidden">
          {STAT_ROWS.map(([mobileLabel, , key, valClass]) => (
            <div key={mobileLabel} className="flex items-center justify-between">
              <span className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#717182]">
                {mobileLabel}
              </span>
              <span className={`text-sm leading-5 ${valClass}`}>
                {key === "pnl" ? pnlDisplay : stats[key]}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop: column stats */}
        <div className="hidden min-w-[240px] flex-1 flex-nowrap gap-10 tablet:flex tablet:py-4 lg:gap-12">
          {STAT_ROWS.map(([, label, key, valClass]) => (
            <div key={label} className="flex min-w-[72px] flex-col gap-0.5">
              <span className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#717182]">
                {label}
              </span>
              <span className={`text-sm leading-5 ${valClass}`}>
                {key === "pnl" ? pnlDisplay : stats[key]}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-[rgba(255,255,255,0.06)] lg:mx-2 lg:block" />

        <div className="flex min-w-0 flex-1 flex-col gap-3 tablet:py-4 lg:min-w-[320px] lg:flex-row lg:items-center lg:justify-end lg:gap-4 lg:flex-[1.5]">
          <div className="flex min-w-0 flex-1 flex-col gap-2 tablet:flex-row tablet:items-center tablet:gap-4">
            <div className="flex min-w-[140px] flex-1 items-center gap-2">
              <div className="relative flex h-[18px] flex-1 items-center px-0.5">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#1e1b18] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" />
                <div
                  className="pointer-events-none absolute left-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-linear-to-b from-[#5a431e] via-[#694e23] to-[#785a28]"
                  style={{
                    width: `calc((100% - 8px) * ${sharePct / 100})`,
                  }}
                />
                <div
                  className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(232,213,181,0.25)] bg-[#ccb17f] shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
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
                  onChange={(e) =>
                    onPatch(vault.id, { sharePct: Number(e.target.value) })
                  }
                  className="vaults-range-input relative z-10"
                  aria-label={`${name} allocation`}
                  aria-valuetext={`${Math.round(sharePct)} percent`}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-medium leading-[18px] text-[#717182]">
                {Math.round(sharePct)}%
              </span>
            </div>

            <div className="flex w-full max-w-none flex-col gap-0.5 tablet:min-w-[200px] tablet:max-w-[300px]">
              <div className="relative flex h-[34px] items-center rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0c0a08] px-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]">
                <span className="text-sm font-medium leading-[21px] text-white">$</span>
                <span className="ml-1.5 min-w-0 flex-1 text-right text-sm font-semibold leading-[21px] tabular-nums text-white">
                  {formatUsdcAmountDisplay(amountStr)}
                </span>
                <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.5px] text-[#717182]">
                  USDC
                </span>
                <span className="mx-2 h-5 w-px shrink-0 bg-[rgba(255,255,255,0.05)] max-tablet:block tablet:hidden" />
                <span className="hidden text-[9px] font-medium uppercase tracking-[0.3px] text-[#52525b] tablet:block">
                  {maxLabel}
                </span>
                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.225px] text-[#717182] max-tablet:inline tablet:hidden">
                  {maxLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile: text action buttons */}
          <div className="flex gap-2 tablet:hidden">
            <button
              type="button"
              className="h-[37px] min-w-0 flex-1 rounded-[10px] border border-[rgba(52,211,153,0.42)] bg-[#0f0f0f] text-[13px] font-medium uppercase tracking-[0.35px] text-[#34d399] transition-colors hover:border-[rgba(52,211,153,0.65)] hover:bg-[rgba(52,211,153,0.08)]"
            >
              Edit
            </button>
            <button
              type="button"
              className="h-[37px] min-w-0 flex-1 rounded-[10px] border border-[rgba(248,113,113,0.42)] bg-[#0f0f0f] text-[13px] font-medium uppercase tracking-[0.35px] text-[#f87171] transition-colors hover:border-[rgba(248,113,113,0.6)] hover:bg-[rgba(248,113,113,0.08)]"
              onClick={() =>
                onPatch(vault.id, { activated: false, activatedAt: null })
              }
            >
              Deactivate
            </button>
          </div>

          {/* Desktop: icon buttons */}
          <div className="hidden shrink-0 items-center gap-2 tablet:flex tablet:pl-1">
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(52,211,153,0.42)] bg-[#0f0f0f] text-[#34d399] transition-colors hover:border-[rgba(52,211,153,0.65)] hover:bg-[rgba(52,211,153,0.08)]"
              aria-label={`Edit ${name} allocation`}
            >
              <Pencil className="size-4" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(248,113,113,0.42)] bg-[#0f0f0f] text-[#f87171] transition-colors hover:border-[rgba(248,113,113,0.6)] hover:bg-[rgba(248,113,113,0.08)]"
              aria-label={`Remove ${name} from activated vaults`}
              onClick={() =>
                onPatch(vault.id, { activated: false, activatedAt: null })
              }
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {agentHealth && onOpenVaultLogs ? (
        <VaultAgentStatus
          health={agentHealth}
          onOpenLogs={onOpenVaultLogs}
          variant="strip"
        />
      ) : null}
    </article>
  );
}
