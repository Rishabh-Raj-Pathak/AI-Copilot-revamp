import { Select } from "../../ui/select.jsx";
import { DEX_OPTIONS } from "./strategyTradingMockData.js";

const LEVERAGE = ["1x", "2x", "3x", "5x", "Custom"];
const TRADE_STYLES = [
  { id: "scalping", label: "Scalping" },
  { id: "intraday", label: "Intraday" },
  { id: "swing", label: "Swing" },
  { id: "funding", label: "Funding" },
  { id: "custom", label: "Custom" },
];
const EXECUTION = [
  { id: "explain-only", label: "Explain only" },
  { id: "suggest-only", label: "Suggest only" },
  { id: "manual-approval", label: "Manual approval" },
  { id: "paper-first", label: "Paper trade first" },
];
const EXPLANATION = [
  { id: "simple", label: "Simple" },
  { id: "detailed", label: "Detailed" },
  { id: "technical", label: "Technical" },
];

export default function TradingPreferencesPanel({ preferences, onChange }) {
  const update = (key, value) => {
    onChange({ ...preferences, [key]: value });
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <PrefSelect
        label="Risk preference"
        value={preferences.riskPreference}
        options={[
          { id: "low", label: "Low" },
          { id: "balanced", label: "Balanced" },
          { id: "high", label: "High" },
        ]}
        onChange={(v) => update("riskPreference", v)}
      />
      <PrefSelect
        label="Preferred market"
        value={preferences.preferredMarkets?.[0] ?? "btc"}
        options={[
          { id: "btc", label: "BTC" },
          { id: "eth", label: "ETH" },
          { id: "sol", label: "SOL" },
          { id: "hype", label: "HYPE" },
          { id: "custom", label: "Custom" },
        ]}
        onChange={(v) => update("preferredMarkets", [v])}
      />
      <PrefSelect
        label="Preferred DEX"
        value={preferences.preferredDexes?.[0] ?? "Hyperliquid"}
        options={DEX_OPTIONS.map((d) => ({ id: d, label: d }))}
        onChange={(v) => update("preferredDexes", [v])}
      />
      <PrefSelect
        label="Max leverage"
        value={preferences.maxLeverage}
        options={LEVERAGE.map((l) => ({ id: l, label: l }))}
        onChange={(v) => update("maxLeverage", v)}
      />
      <PrefSelect
        label="Trade style"
        value={preferences.tradeStyle}
        options={TRADE_STYLES}
        onChange={(v) => update("tradeStyle", v)}
      />
      <PrefSelect
        label="Execution preference"
        value={preferences.executionPreference}
        options={EXECUTION}
        onChange={(v) => update("executionPreference", v)}
      />
      <PrefSelect
        label="Explanation style"
        value={preferences.explanationStyle}
        options={EXPLANATION}
        onChange={(v) => update("explanationStyle", v)}
      />
    </div>
  );
}

function PrefSelect({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
        {label}
      </span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="!min-h-9 text-xs"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
