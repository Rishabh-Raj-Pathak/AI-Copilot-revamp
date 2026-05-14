import { Activity, Hexagon, Pencil, X, Zap } from "lucide-react";
import { formatUsdcAmountDisplay } from "./vaultUiUtils.js";

const ICONS = {
  pulse: Activity,
  hex: Hexagon,
  bolt: Zap,
};

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
export default function ActivatedVaultRow({ vault, ui, isFirst, enterIndex, onPatch }) {
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
      className={`vaults-root vaults-activated-row-animate relative min-h-[72px] overflow-hidden ${
        isFirst ? "" : "border-t border-[rgba(255,255,255,0.04)]"
      }`}
      style={{
        animationDelay: `${(enterIndex ?? 0) * 55}ms`,
        backgroundImage:
          "linear-gradient(90deg, rgba(26, 22, 18, 0.75) 0%, rgba(12, 10, 8, 0.55) 100%), linear-gradient(90deg, rgb(14, 12, 11) 0%, rgb(10, 10, 10) 100%)",
      }}
    >
      <div className="relative z-1 flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-0 sm:py-0 sm:pr-4 sm:pl-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:max-w-[220px] sm:flex-none sm:py-4">
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold leading-5 text-white">
                {name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(8,8,10,0.65)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.45px] text-[#d4c4a0]">
                <span className="size-1.5 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.45)]" />
                Active
              </span>
            </div>
            {subline ? (
              <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.275px] text-[#717182]">
                {subline}
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-[rgba(255,255,255,0.06)] sm:mx-4 sm:block" />

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:max-w-[400px] sm:flex-nowrap sm:gap-8 sm:py-4">
          {[
            ["Volume", stats.volume, "font-medium text-white"],
            ["APR", stats.apr, "font-medium text-[#5eead4]"],
            ["Users", stats.users, "font-medium text-white"],
            ["PNL", pnlDisplay, "font-medium text-[#ccb17f]"],
          ].map(([label, val, valClass]) => (
            <div key={label} className="flex min-w-0 flex-col gap-0.5 sm:min-w-[72px]">
              <span className="text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#717182]">
                {label}
              </span>
              <span className={`text-sm leading-5 ${valClass}`}>{val}</span>
            </div>
          ))}
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-[rgba(255,255,255,0.06)] lg:mx-2 lg:block" />

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:py-4 lg:flex-row lg:items-center lg:justify-end lg:gap-4 lg:flex-[1.35]">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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

            <div className="flex min-w-[180px] max-w-[220px] flex-col gap-0.5">
              <div className="relative flex h-[34px] items-center rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0c0a08] px-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)]">
                <span className="text-sm font-medium leading-[21px] text-white">$</span>
                <span className="ml-1.5 min-w-0 flex-1 text-right text-sm font-semibold leading-[21px] tabular-nums text-white">
                  {formatUsdcAmountDisplay(amountStr)}
                </span>
                <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.5px] text-[#717182]">
                  USDC
                </span>
              </div>
              <p className="text-[9px] font-medium uppercase leading-3 tracking-[0.3px] text-[#52525b]">
                {maxLabel}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:pl-1">
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
    </article>
  );
}
