import { useState } from "react";
import {
  DEFAULT_TRADING,
  LEVERAGE_OPTIONS,
  MARKET_OPTIONS,
  RISK_OPTIONS,
} from "./profileSteps.js";

/**
 * Step three: the three answers Copilot actually consumes.
 *
 * Deliberately not the seven-field `TradingPreferencesPanel` — execution and
 * explanation style are workstation concerns, and every extra field here costs
 * completions. The vocabulary is shared with that panel so the two can't drift.
 *
 * @param {object} props
 * @param {import('../../lib/profileSession.js').ProfileTrading|null} props.trading
 * @param {(trading: {risk: string, market: string, maxLeverage: string}) => void} props.onSave
 * @param {string} [props.submitLabel]
 */
export default function TradingProfileStep({
  trading,
  onSave,
  submitLabel = "Save trading profile",
}) {
  const [draft, setDraft] = useState(() => ({
    risk: trading?.risk ?? DEFAULT_TRADING.risk,
    market: trading?.market ?? DEFAULT_TRADING.market,
    maxLeverage: trading?.maxLeverage ?? DEFAULT_TRADING.maxLeverage,
  }));

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const activeRisk = RISK_OPTIONS.find((o) => o.id === draft.risk);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <Field label="Risk profile" hint={activeRisk?.hint}>
        <ChipGroup
          name="risk"
          options={RISK_OPTIONS}
          value={draft.risk}
          onChange={(v) => set("risk", v)}
        />
      </Field>

      <Field label="Preferred market">
        <ChipGroup
          name="market"
          options={MARKET_OPTIONS}
          value={draft.market}
          onChange={(v) => set("market", v)}
        />
      </Field>

      <Field label="Max leverage">
        <ChipGroup
          name="maxLeverage"
          options={LEVERAGE_OPTIONS.map((l) => ({ id: l, label: l }))}
          value={draft.maxLeverage}
          onChange={(v) => set("maxLeverage", v)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="ds-terminal-gradient-cta rounded-md px-4 py-2 text-sm font-semibold"
        >
          {submitLabel}
        </button>
        <span className="text-xs text-[#757575]">
          Copilot tunes its setups to these. Change them any time.
        </span>
      </div>
    </form>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          {label}
        </span>
        {hint ? <span className="text-xs text-[#454545]">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** Radio group styled as chips — one tap per answer, no dropdown to open. */
function ChipGroup({ name, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? "border-[#f2b500] bg-[#f2b500]/10 text-[#f2b500]"
                : "border-[#242424] bg-black text-[#bfbfbf] hover:border-[#454545] hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
