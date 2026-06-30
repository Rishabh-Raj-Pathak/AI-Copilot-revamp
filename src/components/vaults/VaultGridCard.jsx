import { Activity, Hexagon, Zap } from "lucide-react";
import {
  DEFAULT_MAX_USDC,
  clampAmountStr,
  feePctFromShare,
} from "./vaultUiUtils.js";
import VaultStrategySelector from "./VaultStrategySelector.jsx";
import { resolveVaultStrategies } from "./vaultStrategiesData.js";
import VaultAgentStatus from "./agentLogs/VaultAgentStatus.jsx";

const ICONS = {
  pulse: Activity,
  hex: Hexagon,
  bolt: Zap,
};

/**
 * Grid mode — same interactive primitives as list rows, compact layout.
 */
export default function VaultGridCard({
  vault,
  ui,
  onPatch,
  agentHealth,
  onOpenVaultLogs,
}) {
  const Icon = ICONS[vault.iconKey] ?? Activity;
  const sharePct = ui.sharePct;
  const feeLabel = feePctFromShare(sharePct);
  const activated = ui.activated;
  const strategies = resolveVaultStrategies(vault);
  const selectedStrategyId =
    ui.selectedStrategyId ?? strategies[0]?.id ?? null;

  return (
    <div
      className="vaults-root flex flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.35)]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(22, 20, 18, 0.55) 0%, rgba(14, 12, 10, 0.35) 100%), linear-gradient(90deg, rgb(12, 12, 12) 0%, rgb(12, 12, 12) 100%)",
      }}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <div className="text-[#ccb17f] opacity-80">
            <Icon className="size-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-[#e8d5b5]">
              {vault.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-[rgba(255,255,255,0.05)] pt-3 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5px] text-[#717182]">
              Vol
            </p>
            <p className="mt-0.5 font-medium text-[#d4d4d8]">
              {vault.stats.volume}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.5px] text-[#717182]">
              APR
            </p>
            <p className="mt-0.5 font-bold text-[#ccb17f]">{vault.stats.apr}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.5px] text-[#717182]">
              Users
            </p>
            <p className="mt-0.5 font-medium text-[#717182]">
              {vault.stats.users}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex h-[18px] flex-1 items-center px-0.5">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.05)] bg-[#1e1b18]" />
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
                onChange={(e) =>
                  onPatch(vault.id, { sharePct: Number(e.target.value) })
                }
                className="vaults-range-input relative z-10"
                aria-label={`${vault.name} performance fee`}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium text-white">
              {feeLabel}
            </span>
          </div>

          <div className="flex h-9 items-center rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0c0a08] px-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]">
            <span className="text-sm font-medium text-[#ccb17f]">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={ui.amountStr}
              onChange={(e) =>
                onPatch(vault.id, { amountStr: e.target.value })
              }
              onBlur={() =>
                onPatch(vault.id, {
                  amountStr: clampAmountStr(ui.amountStr, DEFAULT_MAX_USDC),
                })
              }
              className="min-w-0 flex-1 bg-transparent text-right text-sm font-semibold text-[#f0f0f0] outline-none"
              aria-label={`${vault.name} USDC amount`}
            />
            <span className="ml-1 text-[9px] font-medium uppercase tracking-wide text-[rgba(255,255,255,0.3)]">
              USDC
            </span>
            <button
              type="button"
              onClick={() =>
                onPatch(vault.id, { amountStr: String(DEFAULT_MAX_USDC) })
              }
              className="ml-2 shrink-0 text-[8px] font-semibold uppercase text-[#ccb17f]"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center">
          <VaultStrategySelector
            strategies={strategies}
            selectedId={selectedStrategyId}
            disabled={activated}
            onSelect={(id) => onPatch(vault.id, { selectedStrategyId: id })}
            inline
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onPatch(vault.id, { backtestRequestedAt: Date.now() })
              }
              className="h-9 min-w-0 flex-1 rounded-lg border border-[rgba(120,90,40,0.22)] bg-[rgba(255,255,255,0.02)] text-xs font-medium uppercase tracking-[0.35px] text-[#8a8a94] transition-colors hover:border-[#785a28] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#d4d4d8]"
            >
              Backtest
            </button>

            <button
              type="button"
              disabled={activated}
              onClick={() =>
                onPatch(vault.id, { activated: true, activatedAt: Date.now() })
              }
              className={`h-9 min-w-0 flex-1 rounded-lg border text-xs font-medium uppercase tracking-[0.35px] transition-colors ${
                activated
                  ? "cursor-default border-[rgba(0,188,125,0.35)] bg-[rgba(0,188,125,0.12)] text-[#00d492]"
                  : "cursor-pointer border-[#785a28] bg-linear-to-b from-[#14100a] to-[#0a0805] text-[#bfbfbf] hover:border-[#ccb17f] hover:text-white"
              }`}
            >
              {activated ? "Active" : selectedStrategyId ? "Activate" : "Pick strategy"}
            </button>
          </div>
        </div>
      </div>

      {activated && agentHealth && onOpenVaultLogs ? (
        <VaultAgentStatus
          health={agentHealth}
          onOpenLogs={onOpenVaultLogs}
          variant="strip"
        />
      ) : null}
    </div>
  );
}
