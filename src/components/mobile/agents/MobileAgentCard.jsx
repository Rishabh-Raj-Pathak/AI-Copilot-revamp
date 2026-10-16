import { useState } from "react";
import { useAppToast } from "../appToastContext.js";
import VaultStrategySelector from "../../vaults/VaultStrategySelector.jsx";
import { resolveVaultStrategies } from "../../vaults/vaultStrategiesData.js";
import { clampAmountStr, parseMaxUsdcFromLabel } from "../../vaults/vaultUiUtils.js";
import { DataRow, Divider, Dn2Button } from "../dn2/Dn2Ui.jsx";
import { CARD, CARD_EDGE, CARD_FILL, FIELD } from "../dn2/dn2Theme.js";
import { AgentVenueMark } from "./AgentVenueSheet.jsx";
import GoldRange from "./GoldRange.jsx";
import { AGENT_BADGE_CLASSES } from "./agentsTheme.js";

/**
 * Alpha agent cards for the phone shelves — Figma "02 Agents - Alpha Agents"
 * (DoY28sP7SwidihlLGoGrEa, 1220:38293, A1 / A3). The fields are the ones the
 * proto card always had; the frame, rows, slider, fields and pills are the
 * Delta Neutral 2 ones, so both Agents tabs read as one product.
 */

const STAT_ROWS = [
  ["Vol", "volume"],
  ["APR", "apr"],
  ["Users", "users"],
];

const CARD_WIDTH = "w-[280px] shrink-0 snap-start";

/**
 * The venue mark beside the name: the venue being filtered on, or the agent's
 * first venue under "All Dexs".
 */
function markVenueOf(vault, venueId) {
  return venueId !== "all" && vault.venues?.includes(venueId) ? venueId : vault.venues?.[0];
}

function VenueDisc({ venueId }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0c0a08] bg-[#121212]">
      <AgentVenueMark id={venueId} size={16} />
    </span>
  );
}

function AgentBadge({ badge }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full border px-[7px] py-0.5 text-[10px] font-medium uppercase leading-[14px] tracking-[0.3px] ${
        AGENT_BADGE_CLASSES[badge.type] ?? AGENT_BADGE_CLASSES.popular
      }`}
    >
      {badge.label}
    </span>
  );
}

function ActivePill() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-[rgba(8,8,10,0.65)] px-2 py-0.5 text-[9px] font-semibold uppercase leading-[14px] tracking-[0.45px] text-[#d4c4a0]">
      <span className="size-1.5 shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.45)]" aria-hidden />
      Active
    </span>
  );
}

/** Figma "Header": venue disc, name (+ status and a strategy line), badge. */
function AgentHeader({ vault, venueId, status = null, subline = null, badge = null }) {
  return (
    <header className="flex items-center gap-2">
      <VenueDisc venueId={markVenueOf(vault, venueId)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-[16px] font-medium leading-5 text-[#e8d5b5]">{vault.name}</h3>
          {status}
        </div>
        {subline ? <p className="truncate text-[11px] leading-[14px] text-[#8f90a1]">{subline}</p> : null}
      </div>
      {badge}
    </header>
  );
}

/** Figma "Allocation": the DN2 slider with its share beside it. */
function AllocationRow({ vault, value, disabled, onChange }) {
  const share = Math.round(value);
  return (
    <div className="flex items-center gap-3">
      <GoldRange
        size="md"
        className="flex-1"
        value={value}
        step={0.25}
        disabled={disabled}
        onChange={onChange}
        ariaLabel={`${vault.name} allocation`}
        ariaValueText={`${share}%`}
      />
      <span className="w-[42px] shrink-0 text-right text-[14px] font-medium leading-5 text-[#f0f0f0]">
        {share} %
      </span>
    </div>
  );
}

/** Figma "Amount Input": a DN2 field — $, amount, USDC, then the Max shortcut. */
function AmountField({ vault, value, disabled, onChange, onCommit, onMax }) {
  return (
    <div className={`flex h-10 items-center gap-1.5 px-3 ${FIELD}`}>
      <span className="text-[14px] font-medium leading-5 text-[#d6b06a]">$</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        aria-label={`${vault.name} USDC amount`}
        // 16px: anything smaller makes iOS zoom the page on focus.
        className="min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-[#f0f0f0] outline-none"
      />
      <span className="text-[13px] leading-[18px] text-[#717182]">USDC</span>
      <span className="h-4 w-px shrink-0 bg-white/[0.08]" aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={onMax}
        className="-my-2 flex min-h-11 shrink-0 items-center whitespace-nowrap text-[10px] font-semibold uppercase leading-[14px] text-[#ccb17f] active:opacity-70"
      >
        {vault.maxLabel}
      </button>
    </div>
  );
}

function useAgentRow(vault, ui, onPatch) {
  const strategies = resolveVaultStrategies(vault);
  const selectedStrategyId = ui.selectedStrategyId ?? strategies[0]?.id ?? null;
  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId);
  const maxUsdc = parseMaxUsdcFromLabel(vault.maxLabel);
  const patch = (partial) => onPatch(vault.id, partial);
  return { strategies, selectedStrategyId, selectedStrategy, maxUsdc, patch };
}

/**
 * Figma "Agent Card" (A1): stats, then allocation, amount and strategy, then
 * Backtest + Activate. Values and handlers are the vault row's: `ui` is the
 * page's per-vault state and `onPatch` its single updater.
 */
export default function MobileAgentCard({ vault, ui, venueId, onPatch, tourControls = false }) {
  const toast = useAppToast();
  const { strategies, selectedStrategyId, selectedStrategy, maxUsdc, patch } = useAgentRow(vault, ui, onPatch);

  return (
    <article className={`${CARD} ${CARD_EDGE} ${CARD_WIDTH}`} style={CARD_FILL} aria-label={`${vault.name} agent`}>
      <AgentHeader vault={vault} venueId={venueId} badge={vault.badge ? <AgentBadge badge={vault.badge} /> : null} />
      <Divider />
      <dl className="flex flex-col gap-2.5">
        {STAT_ROWS.map(([label, key]) => (
          <DataRow key={key} label={label} value={vault.stats[key]} />
        ))}
      </dl>
      <Divider />
      <div className="flex flex-col gap-3" {...(tourControls ? { "data-tour": "vaults-featured-tour-controls" } : {})}>
        <AllocationRow vault={vault} value={ui.sharePct} onChange={(n) => patch({ sharePct: n })} />
        <AmountField
          vault={vault}
          value={ui.amountStr}
          onChange={(amountStr) => patch({ amountStr })}
          onCommit={() => patch({ amountStr: clampAmountStr(ui.amountStr, maxUsdc) })}
          onMax={() => patch({ amountStr: String(maxUsdc) })}
        />
        <VaultStrategySelector
          appearance="agent"
          strategies={strategies}
          selectedId={selectedStrategyId}
          onSelect={(id) => patch({ selectedStrategyId: id })}
        />
        <div className="flex gap-3">
          <Dn2Button
            className="flex-1"
            onClick={() => {
              patch({ backtestRequestedAt: Date.now() });
              toast.show({
                title: "Backtest started",
                message: `${vault.name}${selectedStrategy ? ` · ${selectedStrategy.name}` : ""}`,
                tone: "success",
                theme: "gold",
              });
            }}
          >
            Backtest
          </Dn2Button>
          <Dn2Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              patch({ activated: true, activatedAt: Date.now() });
              toast.show({
                title: "Agent activated",
                message: `${vault.name} is now trading${selectedStrategy ? ` with ${selectedStrategy.name}` : ""}.`,
                tone: "success",
                theme: "gold",
              });
            }}
          >
            {selectedStrategyId ? "Activate" : "Pick strategy"}
          </Dn2Button>
        </div>
      </div>
    </article>
  );
}

/**
 * Figma "Activated Card" (A3): an activated agent lifts out of its shelf into
 * Activated vaults. Its allocation, amount and strategy are locked until Edit;
 * Deactivate sends it back to its shelf.
 */
export function ActivatedAgentCard({ vault, ui, venueId, onPatch }) {
  const [editing, setEditing] = useState(false);
  const { strategies, selectedStrategyId, selectedStrategy, maxUsdc, patch } = useAgentRow(vault, ui, onPatch);
  const locked = !editing;

  return (
    <article className={`${CARD} ${CARD_EDGE} ${CARD_WIDTH}`} style={CARD_FILL} aria-label={`${vault.name} agent, active`}>
      <AgentHeader
        vault={vault}
        venueId={venueId}
        status={<ActivePill />}
        subline={selectedStrategy?.name ?? vault.strategyLabel}
      />
      <Divider />
      <dl className="flex flex-col gap-2.5">
        {STAT_ROWS.map(([label, key]) => (
          <DataRow key={key} label={label} value={vault.stats[key]} />
        ))}
        <DataRow label="PnL" value={vault.stats.pnl ?? "—"} tone="text-[#ccb17f]" />
      </dl>
      <Divider />
      <div className={`flex flex-col gap-3 transition-opacity ${locked ? "opacity-50" : ""}`}>
        <AllocationRow vault={vault} value={ui.sharePct} disabled={locked} onChange={(n) => patch({ sharePct: n })} />
        <AmountField
          vault={vault}
          value={ui.amountStr}
          disabled={locked}
          onChange={(amountStr) => patch({ amountStr })}
          onCommit={() => patch({ amountStr: clampAmountStr(ui.amountStr, maxUsdc) })}
          onMax={() => patch({ amountStr: String(maxUsdc) })}
        />
        <VaultStrategySelector
          appearance="agent"
          strategies={strategies}
          selectedId={selectedStrategyId}
          disabled={locked}
          onSelect={(id) => patch({ selectedStrategyId: id })}
        />
      </div>
      <div className="flex gap-3">
        <Dn2Button className="flex-1" aria-pressed={editing} onClick={() => setEditing((on) => !on)}>
          {editing ? "Done" : "Edit"}
        </Dn2Button>
        <Dn2Button
          variant="danger"
          className="flex-1"
          onClick={() => patch({ activated: false, activatedAt: null })}
        >
          Deactivate
        </Dn2Button>
      </div>
    </article>
  );
}
