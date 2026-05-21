import { Select } from "../../ui/select.jsx";
import {
  MARKET_OPTIONS,
  STRATEGY_MODELS,
  STRATEGY_TYPES,
} from "./strategyTradingMockData.js";

const RISK_OPTIONS = [
  { id: "low", label: "Low risk" },
  { id: "balanced", label: "Balanced" },
  { id: "high", label: "High risk" },
];

export default function StrategyControlsBar({
  modelId,
  strategyId,
  marketId,
  riskPreference,
  onModelChange,
  onStrategyChange,
  onMarketChange,
  onRiskChange,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "sm:gap-3"}`}
    >
      <label className="flex min-w-[7.5rem] flex-1 flex-col gap-1 sm:min-w-[9rem] sm:max-w-[11rem]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          Model
        </span>
        <Select
          value={modelId}
          onChange={(e) => onModelChange(e.target.value)}
          className="!min-h-9 text-xs sm:text-sm"
        >
          {STRATEGY_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex min-w-[7.5rem] flex-1 flex-col gap-1 sm:min-w-[9rem] sm:max-w-[11rem]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          Strategy
        </span>
        <Select
          value={strategyId}
          onChange={(e) => onStrategyChange(e.target.value)}
          className="!min-h-9 text-xs sm:text-sm"
        >
          {STRATEGY_TYPES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex min-w-[5rem] flex-1 flex-col gap-1 sm:max-w-[7rem]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          Market
        </span>
        <Select
          value={marketId}
          onChange={(e) => onMarketChange(e.target.value)}
          className="!min-h-9 text-xs sm:text-sm"
        >
          {MARKET_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex min-w-[5rem] flex-1 flex-col gap-1 sm:max-w-[8rem]">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#757575]">
          Risk profile
        </span>
        <Select
          value={riskPreference}
          onChange={(e) => onRiskChange(e.target.value)}
          className="!min-h-9 text-xs sm:text-sm"
        >
          {RISK_OPTIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
