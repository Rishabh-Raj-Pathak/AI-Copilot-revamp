import { useState } from "react";
import GoldRange from "../agents/GoldRange.jsx";
import { InfoButton } from "./Dn2Ui.jsx";
import { FIELD } from "./dn2Theme.js";

/**
 * Margin and Leverage — Figma "Margin" / "Leverage" (4493:169, 4493:190), used
 * by the New vault page and the Edit position sheet. Web parity: a gold slider
 * with % / $ / MAX for margin, a slider plus a typed multiple for leverage.
 *
 * Inputs are 16px, not Figma's 14: below 16 iOS zooms the page on focus (the
 * kit's trade fields follow the same rule).
 */

const HEAD_LABEL = "text-[11px] font-medium uppercase leading-[14px] tracking-[0.6px] text-[#9c9cac]";
const MAX_LABEL = "text-[10px] font-semibold uppercase leading-[14px] tracking-[0.3px] text-[#ccb17f]";
const SYMBOL = "text-[14px] font-medium leading-5 text-[#d6b06a]";
const INPUT = "min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-[#f0f0f0] outline-none";

/** Digits typed into a clamped field: the draft lets the user clear it mid-edit. */
function useDraft() {
  const [draft, setDraft] = useState(null);
  return { draft, edit: setDraft, reset: () => setDraft(null) };
}

function grouped(value) {
  const n = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n) || String(value) === "") return "";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Head({ label, infoLabel, onInfo, aside }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <p className={HEAD_LABEL}>{label}</p>
        {onInfo ? <InfoButton label={infoLabel} onPress={onInfo} /> : null}
      </div>
      {aside}
    </div>
  );
}

export function MarginField({
  percent,
  amount,
  maxAmount,
  onPercentChange,
  onAmountChange,
  disabled = false,
  onInfo,
}) {
  const pct = useDraft();
  const usd = useDraft();
  const maxText = Number(maxAmount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <section className="flex flex-col gap-2.5" aria-label="Margin">
      <Head
        label="Margin"
        infoLabel="About margin"
        onInfo={onInfo}
        aside={
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAmountChange(String(maxAmount))}
            aria-label={`Use max margin, ${maxText}`}
            className={`relative ${MAX_LABEL} after:absolute after:-inset-3 disabled:opacity-50`}
          >
            Max: {maxText}
          </button>
        }
      />
      {/* Full width, as in Figma: at 0 / 100 the thumb overhangs into the card padding. */}
      <GoldRange
        size="md"
        value={percent}
        onChange={onPercentChange}
        disabled={disabled}
        ariaLabel="Margin, percent of max"
        ariaValueText={`${percent}%`}
      />
      <div className={`flex h-11 items-center ${FIELD} ${disabled ? "opacity-40" : ""}`}>
        <label className="flex min-w-0 flex-1 items-center gap-1.5 px-3">
          <span className={SYMBOL}>%</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="done"
            disabled={disabled}
            value={pct.draft ?? String(percent)}
            aria-label="Margin, percent of max"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 3);
              pct.edit(v);
              if (v !== "") onPercentChange(Math.min(100, Number(v)));
            }}
            onBlur={pct.reset}
            className={INPUT}
          />
        </label>
        <span className="h-5 w-px shrink-0 bg-white/[0.08]" aria-hidden />
        <label className="flex min-w-0 flex-1 items-center gap-1.5 px-3">
          <span className={SYMBOL}>$</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            disabled={disabled}
            value={usd.draft ?? grouped(amount)}
            placeholder="0"
            aria-label="Margin in USD"
            onFocus={() => usd.edit(String(amount ?? ""))}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              usd.edit(v);
              onAmountChange(v);
            }}
            onBlur={usd.reset}
            className={`${INPUT} placeholder:text-[#717182]`}
          />
        </label>
      </div>
    </section>
  );
}

export function LeverageField({ leverage, min, max, onChange, disabled = false, onInfo }) {
  const lev = useDraft();
  return (
    <section className="flex flex-col gap-2.5" aria-label="Leverage">
      <Head label="Leverage" infoLabel="About leverage" onInfo={onInfo} aside={<p className={MAX_LABEL}>Max: {max}x</p>} />
      <div className="flex items-center gap-3">
        <GoldRange
          size="md"
          className="flex-1"
          value={leverage}
          min={min}
          max={max}
          onChange={onChange}
          disabled={disabled}
          ariaLabel="Leverage"
          ariaValueText={`${leverage}x`}
        />
        <label
          className={`flex h-11 w-[84px] shrink-0 items-center justify-center gap-1 px-3 ${FIELD} ${disabled ? "opacity-40" : ""}`}
        >
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="done"
            disabled={disabled}
            value={lev.draft ?? String(leverage)}
            aria-label="Leverage multiple"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              lev.edit(v);
              const n = Number(v);
              if (v !== "" && n >= min) onChange(Math.min(max, n));
            }}
            onBlur={lev.reset}
            className="w-[2.4ch] min-w-0 bg-transparent text-right text-[16px] leading-5 text-[#f0f0f0] outline-none"
          />
          <span className={SYMBOL}>x</span>
        </label>
      </div>
    </section>
  );
}
