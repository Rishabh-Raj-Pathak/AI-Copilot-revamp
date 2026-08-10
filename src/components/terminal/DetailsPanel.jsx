import { useEffect, useState } from "react";
import { terminalAssets as a } from "../../figma/terminalAssets.js";
import {
  AmountField,
  Checkbox,
  CollapseHeading,
  CopilotSetupSlider,
} from "./detailsPanelParts.jsx";

const MAX_LEVERAGE = 40;

const toNum = (v) => {
  const n = Number.parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const usd = (n) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 })}`;

/** `chips` carry the copy-ready strings ("R/R: 1:1.2") — strip the prefix. */
const chipValue = (setup, kind) => {
  const chip = setup.chips?.find((c) => c.kind === kind);
  if (!chip) return null;
  const [, rest] = chip.label.split(/:(.+)/);
  return (rest ?? chip.label).trim();
};

function DetailsPanelInner({ setup, openTradeCtaLabel, onOpenTradeCtaClick }) {
  const balanceNum = Number.parseFloat(setup.balance) || 0;
  const priceNum = Number(setup.price) || 0;

  const [direction, setDirection] = useState("short");
  const [marginMode, setMarginMode] = useState("isolated");
  const [orderType, setOrderType] = useState("market");
  const [margin, setMargin] = useState("0");
  const [size, setSize] = useState("0");
  const [leverage, setLeverage] = useState(10);
  const [takeProfitOpen, setTakeProfitOpen] = useState(true);
  const [additionalOpen, setAdditionalOpen] = useState(true);
  const [tpPrice, setTpPrice] = useState("0");
  const [gainPct, setGainPct] = useState("20");
  const [slPrice, setSlPrice] = useState("0");
  const [lossPct, setLossPct] = useState("20");
  const [earlyExit, setEarlyExit] = useState(true);
  const [openAtMark, setOpenAtMark] = useState(false);
  const [activeRow, setActiveRow] = useState(0);

  useEffect(() => {
    const seedMargin = (Number.parseFloat(setup.balance) || 0) * 0.1;
    setDirection(setup.direction === "long" ? "long" : "short");
    setLeverage(10);
    setMargin(seedMargin.toFixed(2));
    setSize((seedMargin * 10).toFixed(2));
    setTpPrice(String(Math.round(Number(setup.price) * 0.96 * 10000) / 10000));
    setSlPrice(String(Math.round(Number(setup.price) * 1.02 * 10000) / 10000));
    setGainPct("20");
    setLossPct("20");
    setActiveRow(0);
  }, [setup.id, setup.direction, setup.price, setup.balance]);

  const marginNum = toNum(margin);
  const sizeNum = toNum(size);
  const marginPct = balanceNum
    ? Math.min(100, (marginNum / balanceNum) * 100)
    : 0;

  const onMarginPctChange = (pct) => {
    const next = (balanceNum * pct) / 100;
    setMargin(next.toFixed(2));
    setSize((next * leverage).toFixed(2));
  };

  const onLeverageChange = (next) => {
    setLeverage(next);
    setSize((marginNum * next).toFixed(2));
  };

  const dirLabel = direction === "long" ? "Long" : "Short";

  /* Additional Info — mirrors the live order panel's four rows. */
  const assetSize = priceNum
    ? `${(sizeNum / priceNum).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${setup.symbol}`
    : `0 ${setup.symbol}`;
  const riskReward = chipValue(setup, "rr") ?? "—";
  const winningPct = chipValue(setup, "win") ?? setup.additional.winning;
  const gainAmount = usd((sizeNum * toNum(gainPct)) / 100);
  const lossAmount = usd((sizeNum * toNum(lossPct)) / 100);

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
                    ? "bg-[#3e2e00] font-semibold text-white"
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
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-[#f2b500] p-3"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.85)), linear-gradient(90deg, #f2b500, #00f3b6)",
              }}
            >
              <span className="text-sm text-[#bfbfbf]">Available Balance</span>
              <div className="flex items-center gap-2">
                <img alt="" className="size-5 shrink-0" src={a.usdc} />
                <span className="text-sm font-semibold text-white tabular-nums">
                  {setup.balance} USDC
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <AmountField
                    label="Margin"
                    value={margin}
                    onChange={(v) => {
                      setMargin(v);
                      setSize((toNum(v) * leverage).toFixed(2));
                    }}
                  />
                  <AmountField
                    label="Size"
                    value={size}
                    onChange={(v) => {
                      setSize(v);
                      setMargin((toNum(v) / Math.max(leverage, 1)).toFixed(2));
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <CopilotSetupSlider
                    value={Math.round(marginPct)}
                    min={0}
                    max={100}
                    ticks={5}
                    ariaLabel="Percent of available balance"
                    onChange={onMarginPctChange}
                    valueLabel={`${marginPct.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[#bfbfbf]">Leverage</span>
                  <span className="text-xs text-[#787878]">
                    Max: {MAX_LEVERAGE}x
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CopilotSetupSlider
                    value={leverage}
                    min={1}
                    max={MAX_LEVERAGE}
                    ariaLabel="Leverage"
                    onChange={onLeverageChange}
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
                      <AmountField
                        label="TP Price"
                        value={tpPrice}
                        onChange={setTpPrice}
                      />
                      <AmountField
                        label="Gain %"
                        value={gainPct}
                        onChange={setGainPct}
                        percent
                        hint={gainAmount}
                        hintTone="gain"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <Checkbox
                          checked={earlyExit}
                          onChange={setEarlyExit}
                          className="size-4 shrink-0"
                        />
                        <span className="text-xs text-[#bfbfbf]">
                          Early Exit Optimization
                        </span>
                      </label>
                      <div className="minimal-scrollbar overflow-x-auto overflow-y-hidden rounded-lg border border-[#242424] max-tablet:-mx-0.5">
                        <div className="flex border-b border-[#242424] bg-[#0f0f0f] text-[10px] text-[#bfbfbf]">
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
                    <div className="flex gap-2">
                      <AmountField
                        label="SL Price"
                        value={slPrice}
                        onChange={setSlPrice}
                      />
                      <AmountField
                        label="Loss %"
                        value={lossPct}
                        onChange={setLossPct}
                        percent
                        hint={lossAmount}
                        hintTone="loss"
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
                    {[
                      ["Liquidation Price", setup.additional.liquidation],
                      ["Asset Size", assetSize],
                      ["Risk:Reward", riskReward],
                      ["Winning %", winningPct],
                    ].map(([term, value]) => (
                      <div key={term} className="flex justify-between gap-3">
                        <dt className="text-[#bfbfbf]">{term}</dt>
                        <dd className="font-semibold text-[#f2b500] tabular-nums">
                          {value}
                        </dd>
                      </div>
                    ))}
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
