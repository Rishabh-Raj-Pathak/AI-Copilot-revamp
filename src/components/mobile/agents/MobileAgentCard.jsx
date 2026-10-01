import { appImages } from "../mobileAssets.js";
import { useAppToast } from "../appToastContext.js";
import VaultStrategySelector from "../../vaults/VaultStrategySelector.jsx";
import { resolveVaultStrategies } from "../../vaults/vaultStrategiesData.js";
import { clampAmountStr, parseMaxUsdcFromLabel } from "../../vaults/vaultUiUtils.js";
import GoldRange from "./GoldRange.jsx";
import { AGENT_BADGE_CLASSES } from "./agentsTheme.js";

const CARD_FILL = {
  backgroundImage:
    "linear-gradient(90deg, rgba(22,20,18,0.6) 0%, rgba(14,12,10,0.4) 100%), linear-gradient(90deg, #0c0c0c 0%, #0c0c0c 100%)",
};

const STAT_ROWS = [
  ["Vol", "volume"],
  ["APR", "apr"],
  ["Users", "users"],
];

function Divider() {
  return (
    <span
      className="h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0)_100%)]"
      aria-hidden
    />
  );
}

/**
 * Figma "Agent / BlueChip" (950:4048) — one card in the Alpha / Prime agent
 * carousels. Values and handlers are the vault row's: `ui` is the page's
 * per-vault state and `onPatch` its single updater.
 *
 * `venueId` picks the mark beside the name: the venue being filtered on, or
 * the vault's first venue under "All Dexs".
 */
export default function MobileAgentCard({ vault, ui, venueId, onPatch, tourControls = false }) {
  const toast = useAppToast();
  const strategies = resolveVaultStrategies(vault);
  const selectedStrategyId = ui.selectedStrategyId ?? strategies[0]?.id ?? null;
  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId);
  const maxUsdc = parseMaxUsdcFromLabel(vault.maxLabel);
  const markVenue = venueId !== "all" && vault.venues?.includes(venueId) ? venueId : vault.venues?.[0];
  const mark = appImages.venue[markVenue];
  const share = Math.round(ui.sharePct);
  const patch = (partial) => onPatch(vault.id, partial);

  return (
    <article
      className="flex w-[280px] shrink-0 snap-start flex-col gap-2.5 rounded-2xl border border-[rgba(120,90,40,0.5)] px-[13px] pb-[17px] pt-[13px]"
      style={CARD_FILL}
      aria-label={`${vault.name} agent`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {mark ? <img alt="" src={mark} className="size-5 shrink-0 object-contain" /> : null}
          <h3 className="truncate text-[18px] font-medium leading-[30px] text-[#e8d5b5]">{vault.name}</h3>
        </div>
        {vault.badge ? (
          <span
            className={`shrink-0 rounded-full border px-[9px] py-[3px] text-[12px] font-medium uppercase leading-[15px] ${
              AGENT_BADGE_CLASSES[vault.badge.type] ?? AGENT_BADGE_CLASSES.popular
            }`}
          >
            {vault.badge.label}
          </span>
        ) : null}
      </header>

      <Divider />

      <dl className="flex flex-col gap-5 pt-px text-[12px] leading-[15px]">
        {STAT_ROWS.map(([label, key]) => (
          <div key={key} className="flex items-start justify-between gap-3">
            <dt className="font-medium uppercase tracking-[0.3px] text-[#717182]">{label}</dt>
            <dd className="text-[#d4d4d8]">{vault.stats[key]}</dd>
          </div>
        ))}
      </dl>

      <Divider />

      <div
        className="flex flex-col gap-2.5"
        {...(tourControls ? { "data-tour": "vaults-featured-tour-controls" } : {})}
      >
        <div className="flex items-center gap-[19px] pb-0.5 pt-px">
          <GoldRange
            size="sm"
            className="flex-1"
            value={ui.sharePct}
            step={0.25}
            disabled={ui.activated}
            onChange={(n) => patch({ sharePct: n })}
            ariaLabel={`${vault.name} allocation`}
            ariaValueText={`${share}%`}
          />
          <span className="w-[42px] shrink-0 text-right text-[14px] font-medium leading-5 text-ink">
            {share} %
          </span>
        </div>

        <div className="flex items-center gap-[9px] rounded-[10px] border border-white/[0.05] bg-[#0c0a08] px-3 py-2">
          <span className="text-[14px] font-medium leading-5 text-[#ccb17f]">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={ui.amountStr}
            onChange={(e) => patch({ amountStr: e.target.value })}
            onBlur={() => patch({ amountStr: clampAmountStr(ui.amountStr, maxUsdc) })}
            aria-label={`${vault.name} USDC amount`}
            className="min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-ink outline-none"
          />
          <span className="text-[14px] leading-5 text-[#717182]">USDC</span>
          <span className="h-4 w-px shrink-0 bg-white/[0.05]" aria-hidden />
          <button
            type="button"
            onClick={() => patch({ amountStr: String(maxUsdc) })}
            className="-my-2 flex min-h-11 shrink-0 items-center whitespace-nowrap text-[12px] font-medium leading-[15px] text-[#ccb17f] active:opacity-70"
          >
            {vault.maxLabel}
          </button>
        </div>

        <div className="pt-2.5">
          <VaultStrategySelector
            strategies={strategies}
            selectedId={selectedStrategyId}
            disabled={ui.activated}
            onSelect={(id) => patch({ selectedStrategyId: id })}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              patch({ backtestRequestedAt: Date.now() });
              toast.show({
                title: "Backtest started",
                message: `${vault.name}${selectedStrategy ? ` · ${selectedStrategy.name}` : ""}`,
                tone: "success",
              });
            }}
            className="app-pressable flex h-[42px] min-w-0 flex-1 items-center justify-center rounded-[10px] border border-[rgba(120,90,40,0.4)] text-[14px] font-medium uppercase leading-5 text-ink-muted"
          >
            Backtest
          </button>
          <button
            type="button"
            disabled={ui.activated}
            onClick={() => {
              patch({ activated: true, activatedAt: Date.now() });
              toast.show({
                title: "Agent activated",
                message: `${vault.name} is now trading${selectedStrategy ? ` with ${selectedStrategy.name}` : ""}.`,
                tone: "success",
              });
            }}
            className="app-pressable flex h-[42px] min-w-0 flex-1 items-center justify-center rounded-[10px] border border-[rgba(120,90,40,0.6)] bg-[linear-gradient(180deg,#1c1812_0%,#0f0d0a_100%)] text-[14px] font-medium uppercase leading-5 text-ink-muted disabled:opacity-60"
          >
            {selectedStrategyId ? "Activate" : "Pick strategy"}
          </button>
        </div>
      </div>
    </article>
  );
}
