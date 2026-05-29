import { Calendar, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Button } from "../../../ui/button.jsx";
import { Input } from "../../../ui/input.jsx";
import { Select } from "../../../ui/select.jsx";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { MARKET_OPTIONS } from "../strategyTradingMockData.js";
import {
  WORKSTATION_LEVERAGE_OPTIONS,
  WORKSTATION_TIMEFRAMES,
  formatLeverageValue,
  formatRangeShort,
  parseLeverageValue,
  resolveMarketId,
  resolveRangeDates,
} from "../strategyWorkstationSetup.js";

function ControlShell({ label, children, className = "", chipClass }) {
  return (
    <div
      className={`group/control relative flex h-full min-h-0 flex-col self-stretch overflow-visible px-2 py-1.5 ${chipClass} ${className}`}
      aria-label={label}
      title={label}
    >
      <span
        className="pointer-events-none absolute bottom-full left-2 z-[100] mb-1 whitespace-nowrap rounded-md border border-[#333] bg-[#0a0a0a] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#d4d4d4] opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.85)] transition-opacity duration-150 group-hover/control:opacity-100 group-focus-within/control:opacity-100"
      >
        {label}
      </span>
      <div className="flex min-h-6 flex-1 items-center">{children}</div>
    </div>
  );
}

const compactSelectClass =
  "!min-h-6 !h-6 !border-0 !bg-transparent !px-0 !pr-6 !text-[11px] !font-medium !text-[#bfbfbf] !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0";

const v2SelectClass =
  "!min-h-6 !h-6 !border-0 !bg-transparent !px-0 !pr-6 !text-[11px] !font-medium !text-white !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 [&+span]:!text-[#585858]";

const compactInputClass =
  "!min-h-6 !h-6 !w-10 !border-0 !bg-transparent !px-0 !text-[11px] !font-medium !text-[#bfbfbf] !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 tabular-nums";

function RangePickerV2({ rangeStart, rangeEnd, onPatch }) {
  const startRef = useRef(null);
  const endRef = useRef(null);

  return (
    <div className="flex h-full w-full items-center gap-1">
      <button
        type="button"
        className="shrink-0 text-[#585858] transition-colors hover:text-white"
        aria-label="Pick range start date"
        onClick={() => startRef.current?.showPicker?.()}
      >
        <Calendar className="size-3 shrink-0" aria-hidden />
      </button>
      <span className="min-w-0 flex-1 truncate text-[11px] font-medium tabular-nums text-white">
        {formatRangeShort(rangeStart)} — {formatRangeShort(rangeEnd)}
      </span>
      <button
        type="button"
        className="shrink-0 text-[#585858] transition-colors hover:text-white"
        aria-label="Pick range end date"
        onClick={() => endRef.current?.showPicker?.()}
      >
        <Calendar className="size-3 shrink-0" aria-hidden />
      </button>
      <input
        ref={startRef}
        type="date"
        value={rangeStart}
        onChange={(e) => onPatch({ rangeStart: e.target.value })}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
      <input
        ref={endRef}
        type="date"
        value={rangeEnd}
        min={rangeStart}
        onChange={(e) => onPatch({ rangeEnd: e.target.value })}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}

export default function StrategyWorkspaceControls({
  strategy,
  onSetupChange,
  onOptimize,
  optimizeLoading,
  embedded = false,
}) {
  const theme = useCopilotTheme();
  const setup = strategy?.setup;
  const marketId = resolveMarketId(strategy);
  const timeframe = setup?.timeframe ?? strategy?.timeframe ?? "15m";
  const { start: rangeStart, end: rangeEnd } = resolveRangeDates(setup);
  const leverage = formatLeverageValue(
    setup?.leverage ?? strategy?.config?.leverage ?? "3x",
  );

  const patch = (fields) => {
    if (!strategy || !onSetupChange) return;
    onSetupChange(fields);
  };

  return (
    <div
      className={`flex flex-wrap items-stretch justify-between gap-2 overflow-visible ${embedded ? theme.controlBar : `mt-3 overflow-visible px-3 py-2.5 ${theme.controlBar}`}`}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-wrap items-stretch gap-1.5 overflow-visible">
        <ControlShell
          label="Market"
          className="min-w-[5.5rem]"
          chipClass={theme.controlChip}
        >
          <Select
            value={marketId}
            onChange={(e) => patch({ marketId: e.target.value })}
            className={theme.isV2 ? v2SelectClass : compactSelectClass}
            aria-label="Market"
          >
            {MARKET_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </ControlShell>

        <ControlShell
          label="Timeframe"
          className="min-w-[4.25rem]"
          chipClass={theme.controlChip}
        >
          <Select
            value={timeframe}
            onChange={(e) => patch({ timeframe: e.target.value })}
            className={theme.isV2 ? v2SelectClass : compactSelectClass}
            aria-label="Timeframe"
          >
            {WORKSTATION_TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </Select>
        </ControlShell>

        <ControlShell
          label="Range"
          className="min-w-[12rem] flex-1 sm:max-w-[16rem]"
          chipClass={theme.controlChip}
        >
          {theme.isV2 ? (
            <RangePickerV2
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPatch={patch}
            />
          ) : (
            <div className="flex items-center gap-1">
              <Calendar className="size-3 shrink-0 text-[#585858]" aria-hidden />
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => patch({ rangeStart: e.target.value })}
                className="min-w-0 flex-1 border-0 bg-transparent text-[11px] font-medium text-[#bfbfbf] outline-none [color-scheme:dark]"
                aria-label="Range start"
              />
              <span className="shrink-0 text-[10px] text-[#585858]">→</span>
              <input
                type="date"
                value={rangeEnd}
                min={rangeStart}
                onChange={(e) => patch({ rangeEnd: e.target.value })}
                className="min-w-0 flex-1 border-0 bg-transparent text-[11px] font-medium text-[#bfbfbf] outline-none [color-scheme:dark]"
                aria-label="Range end"
              />
            </div>
          )}
        </ControlShell>

        <ControlShell
          label="Leverage"
          className="min-w-[3.5rem]"
          chipClass={theme.controlChip}
        >
          {theme.isV2 ? (
            <Select
              value={leverage}
              onChange={(e) => patch({ leverage: e.target.value })}
              className={v2SelectClass}
              aria-label="Leverage"
            >
              {WORKSTATION_LEVERAGE_OPTIONS.map((lev) => (
                <option key={lev} value={lev}>
                  {lev}
                </option>
              ))}
            </Select>
          ) : (
            <div className="flex items-center gap-0.5">
              <Input
                type="number"
                min={1}
                max={125}
                value={parseLeverageValue(leverage)}
                onChange={(e) =>
                  patch({ leverage: formatLeverageValue(e.target.value) })
                }
                className={compactInputClass}
                aria-label="Leverage"
              />
              <span className="text-[11px] font-medium text-[#585858]">x</span>
            </div>
          )}
        </ControlShell>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 self-center">
        <Button
          type="button"
          size="sm"
          variant={theme.isV2 ? "outline" : "default"}
          className={theme.optimizeBtn}
          onClick={onOptimize}
          loading={optimizeLoading}
          disabled={optimizeLoading}
        >
          <Sparkles
            className={`size-3.5 shrink-0 ${theme.isV2 ? "text-[#19E6A3]" : "text-black"}`}
            aria-hidden
          />
          Optimize
        </Button>
      </div>
    </div>
  );
}
