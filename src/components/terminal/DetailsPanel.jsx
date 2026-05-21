import { useEffect, useState } from "react";
import { terminalSetupSlider } from "../../design-system/tokens/terminalSetupSlider";
import { terminalAssets as a } from "../../figma/terminalAssets.js";

/** Feather-style chevron (same path as FiChevronDown); inline SVG avoids react-icons resolve issues. */
function CollapseChevron({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Checkbox({ checked, onChange, className = "size-6 shrink-0" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative ${className}`}
    >
      {!checked ? (
        <span className="absolute inset-[16.67%] rounded-[2px] border-[1.5px] border-[#bfbfbf]" />
      ) : (
        <span className="absolute inset-[16.67%]">
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none"
            src={a.checkboxCheck}
          />
        </span>
      )}
    </button>
  );
}

/** Minimal % glyph for Gain % / Loss % fields (replaces fragile remote SVG asset). */
function PercentGlyph({ className = "size-4 shrink-0 text-[#bfbfbf]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <circle
        cx="16"
        cy="15"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M9.8 16.2 14.2 7.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Terminal setup sliders — tokens: `--ds-brand-gradient-horizontal`, `.ds-terminal-slider*` */
function CopilotSetupSlider({ value, min, max, onChange, valueLabel }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const s = terminalSetupSlider;
  return (
    <div className={s.root}>
      <div className={s.well}>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={s.input}
        />
        <div className={s.trackRail} aria-hidden />
        <div className={s.trackFill} style={{ width: `${pct}%` }} aria-hidden />
        <div className={s.thumbWrap} style={{ left: `${pct}%` }}>
          <div className={s.thumbHit}>
            <img
              alt=""
              className="block size-full max-w-none"
              src={a.sliderStop}
            />
          </div>
        </div>
      </div>
      <p className={s.value}>{valueLabel}</p>
    </div>
  );
}

function StepperField({
  label,
  value,
  onDelta,
  showArrows = true,
  percentIcon = false,
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs text-[#bfbfbf]">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-[#242424] bg-black px-3 py-2">
        {percentIcon ? (
          <span className="flex size-4 shrink-0 items-center justify-center">
            <PercentGlyph />
          </span>
        ) : (
          <span className="relative size-4 shrink-0">
            <img
              alt=""
              className="absolute inset-0 size-full max-w-none p-[12.5%_29.17%]"
              src={a.dollarIcon}
            />
          </span>
        )}
        <span className="min-w-0 flex-1 text-sm font-medium text-white">
          {value}
        </span>
        {showArrows ? (
          <span className="relative size-4 shrink-0">
            <button
              type="button"
              aria-label="Increase"
              onClick={() => onDelta(1)}
              className="absolute top-0 left-0 z-10 h-1/2 w-full cursor-pointer"
            />
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => onDelta(-1)}
              className="absolute bottom-0 left-0 z-10 h-1/2 w-full cursor-pointer"
            />
            <img
              alt=""
              className="pointer-events-none absolute inset-0 size-full max-w-none p-[12.5%_31.25%]"
              src={a.chevronPair}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CollapseHeading({ title, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="group flex w-full items-center justify-between gap-2 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#f2b500]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <span className="text-base font-medium text-[#d9d9d9]">{title}</span>
      <CollapseChevron
        className={`size-5 shrink-0 text-[#bfbfbf] transition-transform duration-200 ease-out group-hover:text-[#d9d9d9] ${open ? "rotate-180" : "rotate-0"}`}
      />
    </button>
  );
}

function DetailsPanelInner({ setup, openTradeCtaLabel, onOpenTradeCtaClick }) {
  const balanceNum = Number.parseFloat(setup.balance) || 0;

  const [direction, setDirection] = useState("short");
  const [marginMode, setMarginMode] = useState("isolated");
  const [orderType, setOrderType] = useState("market");
  const [marginPct, setMarginPct] = useState(10);
  const [leverage, setLeverage] = useState(10);
  const [size, setSize] = useState(20);
  const [takeProfitOpen, setTakeProfitOpen] = useState(true);
  const [additionalOpen, setAdditionalOpen] = useState(true);
  const [takeProfit, setTakeProfit] = useState(3.83);
  const [gainPct, setGainPct] = useState(20);
  const [stopLoss, setStopLoss] = useState(3.83);
  const [lossPct, setLossPct] = useState(20);
  const [earlyExit, setEarlyExit] = useState(true);
  const [openAtMark, setOpenAtMark] = useState(false);
  const [activeRow, setActiveRow] = useState(0);

  useEffect(() => {
    setDirection(setup.direction === "long" ? "long" : "short");
    setMarginPct(10);
    setLeverage(10);
    setSize(20);
    setTakeProfit(Math.round(Number(setup.price) * 0.96 * 100) / 100);
    setStopLoss(Math.round(Number(setup.price) * 1.02 * 100) / 100);
    setGainPct(20);
    setLossPct(20);
    setActiveRow(0);
  }, [setup.id, setup.direction, setup.price]);

  const marginDollar = Math.min(
    balanceNum,
    Math.max(0, (balanceNum * marginPct) / 100),
  );
  const marginDisplay = marginDollar.toFixed(2);

  const bumpMarginPct = (d) =>
    setMarginPct((p) => Math.min(100, Math.max(1, p + d)));
  const bumpSize = (d) =>
    setSize((x) => Math.min(100000, Math.max(1, x + d * 5)));
  const bumpTp = (d) =>
    setTakeProfit((x) => Math.round((x + d * 0.05) * 100) / 100);
  const bumpGain = (d) => setGainPct((x) => Math.min(200, Math.max(1, x + d)));
  const bumpSl = (d) =>
    setStopLoss((x) => Math.round((x + d * 0.05) * 100) / 100);
  const bumpLoss = (d) => setLossPct((x) => Math.min(200, Math.max(1, x + d)));

  const posMult = (size / 20) * (leverage / 10);
  const parseMoney = (s) =>
    Number.parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  const positionValue = `$${Math.round(parseMoney(setup.additional.positionValue) * posMult)}`;
  const marginReq = `$${Math.round(parseMoney(setup.additional.marginReq) * posMult * (marginPct / 10))}`;

  const dirLabel = direction === "long" ? "Long" : "Short";

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-black max-tablet:min-h-0 lg:border-l lg:border-[#242424]">
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#242424] px-3 py-4 max-tablet:py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
        <span className="text-lg font-semibold text-white">{setup.symbol}</span>
        <div className="flex flex-wrap items-end gap-1 text-base whitespace-nowrap">
          <span className="text-[#bfbfbf]">Current Price:</span>
          <span className="font-medium text-white">${setup.price}</span>
        </div>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        data-tour="copilot-trade-setup"
      >
        <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4 max-tablet:px-3 max-tablet:py-3 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3">
            <div
              className="flex items-start justify-between gap-3 rounded-lg border border-[#f2b500] p-3"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.85)), linear-gradient(90deg, #f2b500, #00f3b6)",
              }}
            >
              <span className="text-sm text-[#bfbfbf]">Available Balance:</span>
              <div className="flex items-center gap-2">
                <img alt="" className="size-5 shrink-0" src={a.usdc} />
                <span className="text-sm font-semibold text-white">
                  {setup.balance} USDC
                </span>
              </div>
            </div>
            <div className="flex gap-0 rounded-[10px] border border-[#242424] p-1">
              <button
                type="button"
                onClick={() => setDirection("long")}
                className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
                  direction === "long"
                    ? "bg-[#0e381f] font-semibold text-white"
                    : "text-[#bfbfbf] hover:bg-white/5"
                }`}
              >
                Buy / Long
              </button>
              <button
                type="button"
                onClick={() => setDirection("short")}
                className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
                  direction === "short"
                    ? "bg-[#5f1414] font-semibold text-white"
                    : "text-[#bfbfbf] hover:bg-white/5"
                }`}
              >
                Sell / Short
              </button>
            </div>
            <div className="flex gap-0 rounded-[10px] border border-[#242424] p-1">
              <button
                type="button"
                onClick={() => setMarginMode("cross")}
                className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
                  marginMode === "cross"
                    ? "bg-[#242424] font-semibold text-white"
                    : "text-[#bfbfbf] hover:bg-white/5"
                }`}
              >
                Cross
              </button>
              <button
                type="button"
                onClick={() => setMarginMode("isolated")}
                className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
                  marginMode === "isolated"
                    ? "bg-[#242424] font-semibold text-white"
                    : "text-[#bfbfbf] hover:bg-white/5"
                }`}
              >
                Isolated
              </button>
            </div>
            <div className="flex justify-center gap-5 border-b border-[#242424]">
              <button
                type="button"
                onClick={() => setOrderType("market")}
                className={`flex-1 py-3 text-sm ${
                  orderType === "market"
                    ? "border-b-[3px] border-[#f2b500] font-semibold text-white"
                    : "text-[#bfbfbf] hover:text-white"
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType("limit")}
                className={`flex-1 py-3 text-sm ${
                  orderType === "limit"
                    ? "border-b-[3px] border-[#f2b500] font-semibold text-white"
                    : "text-[#bfbfbf] hover:text-white"
                }`}
              >
                Limit
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <StepperField
                    label="Margin"
                    value={marginDisplay}
                    onDelta={(dir) => bumpMarginPct(dir)}
                  />
                  <StepperField
                    label="Size"
                    value={String(size)}
                    onDelta={(dir) => bumpSize(dir)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <CopilotSetupSlider
                    value={marginPct}
                    min={1}
                    max={100}
                    onChange={setMarginPct}
                    valueLabel={`${marginPct.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-xs text-[#bfbfbf]">
                  <span>Leverage</span>
                  <span>Max: 40x</span>
                </div>
                <div className="flex items-center gap-2">
                  <CopilotSetupSlider
                    value={leverage}
                    min={1}
                    max={40}
                    onChange={setLeverage}
                    valueLabel={`${leverage}x`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <CollapseHeading
                  title="Take Profit/Stop Loss"
                  open={takeProfitOpen}
                  onToggle={() => setTakeProfitOpen((o) => !o)}
                />
                {takeProfitOpen ? (
                  <>
                    <div className="flex gap-2">
                      <StepperField
                        label="Take Profit"
                        value={String(takeProfit)}
                        onDelta={(dir) => bumpTp(dir)}
                      />
                      <StepperField
                        label="Gain %"
                        value={String(gainPct)}
                        onDelta={(dir) => bumpGain(dir)}
                        percentIcon
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#bfbfbf]">
                          Early Exit Optimization
                        </span>
                        <Checkbox checked={earlyExit} onChange={setEarlyExit} />
                      </div>
                      <div className="minimal-scrollbar overflow-x-auto overflow-y-hidden rounded-lg border border-[#242424] max-tablet:-mx-0.5">
                        <div className="flex border-b border-[#242424] bg-[#121212] text-[10px] text-[#bfbfbf]">
                          <div className="flex min-w-0 flex-1 items-center justify-center px-3 py-3">
                            Take Profit
                          </div>
                          <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-3">
                            TP%
                          </div>
                          <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-3">
                            Winning %
                          </div>
                          <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-3">
                            Actions
                          </div>
                        </div>
                        {[0, 1, 2].map((row) => (
                          <div
                            key={row}
                            className={`flex border-b border-[#242424] last:border-b-0 ${
                              activeRow === row ? "bg-white/4" : ""
                            }`}
                          >
                            <div className="flex min-w-0 flex-1 items-center justify-center p-3 text-xs text-white">
                              $3.73
                            </div>
                            <div className="flex w-[75px] shrink-0 items-center justify-center p-3 text-xs text-white">
                              75%
                            </div>
                            <div className="flex w-[75px] shrink-0 items-center justify-center p-3 text-sm font-semibold text-white">
                              96%
                            </div>
                            <div className="flex w-[75px] shrink-0 items-center justify-center p-2">
                              <button
                                type="button"
                                onClick={() => setActiveRow(row)}
                                className="rounded border border-[#242424] px-2 py-1 text-xs font-medium text-white hover:bg-white/5"
                              >
                                Activate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 max-tablet:flex-col max-tablet:gap-2.5">
                      <StepperField
                        label="Stop Loss"
                        value={String(stopLoss)}
                        onDelta={(dir) => bumpSl(dir)}
                      />
                      <StepperField
                        label="Loss %"
                        value={String(lossPct)}
                        onDelta={(dir) => bumpLoss(dir)}
                        percentIcon
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <CollapseHeading
                title="Additional Info"
                open={additionalOpen}
                onToggle={() => setAdditionalOpen((o) => !o)}
              />
              {additionalOpen ? (
                <div className="rounded-lg border border-[#242424] p-5">
                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-[#bfbfbf]">Liquidation Price</dt>
                      <dd className="font-semibold text-white">
                        {setup.additional.liquidation}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#bfbfbf]">Position Value</dt>
                      <dd className="font-semibold text-white">
                        {positionValue}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#bfbfbf]">Margin Req.</dt>
                      <dd className="font-semibold text-white">{marginReq}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#bfbfbf]">Winning %</dt>
                      <dd className="font-semibold text-white">
                        {setup.additional.winning}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 border-t border-[#242424] bg-black px-3 py-4 max-tablet:sticky max-tablet:bottom-0 max-tablet:z-10 max-tablet:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-5">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 max-tablet:min-h-10">
            <Checkbox checked={openAtMark} onChange={setOpenAtMark} />
            <span className="text-sm font-medium text-white">
              Open Position at Current Price
            </span>
          </label>
          <button
            type="button"
            data-tour="trade-open-cta"
            onClick={() => onOpenTradeCtaClick?.()}
            className="w-full min-h-11 rounded-lg border border-[#d53d3d] bg-[#d53d3d] py-2.5 text-md font-medium text-white hover:brightness-110"
          >
            {openTradeCtaLabel ?? `Open ${setup.symbol} ${dirLabel}`}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function DetailsPanel({
  setup,
  openTradeCtaLabel,
  onOpenTradeCtaClick,
}) {
  if (!setup) {
    return (
      <aside className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-black max-tablet:min-h-[8rem] lg:border-l lg:border-[#242424]">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center max-tablet:py-4 sm:px-6">
          <p className="max-w-[280px] text-sm leading-relaxed text-[#757575]">
            When you select a trade, details will show up here.
          </p>
        </div>
      </aside>
    );
  }
  return (
    <DetailsPanelInner
      setup={setup}
      openTradeCtaLabel={openTradeCtaLabel}
      onOpenTradeCtaClick={onOpenTradeCtaClick}
    />
  );
}
