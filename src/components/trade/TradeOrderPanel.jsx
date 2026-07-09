import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  AmountField,
  Checkbox,
  CollapseHeading,
  CopilotSetupSlider,
} from "../terminal/detailsPanelParts.jsx";
import { terminalAssets as a } from "../../figma/terminalAssets.js";
import { AVAILABLE_BALANCE, getMarket } from "./tradeMockData.js";

const toNum = (v) => {
  const n = Number.parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const usd = (n) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TradeOrderPanel({ coin, onSubmit }) {
  const market = getMarket(coin);

  const [direction, setDirection] = useState("long");
  const [marginMode, setMarginMode] = useState("isolated");
  const [orderType, setOrderType] = useState("market");
  const [margin, setMargin] = useState("0");
  const [size, setSize] = useState("0");
  const [leverage, setLeverage] = useState(Math.min(33, market.maxLeverage));
  const [tpslOpen, setTpslOpen] = useState(true);
  const [additionalOpen, setAdditionalOpen] = useState(true);
  const [tpPrice, setTpPrice] = useState("0");
  const [gainPct, setGainPct] = useState("0");
  const [slPrice, setSlPrice] = useState("0");
  const [lossPct, setLossPct] = useState("0");
  const [openAtMark, setOpenAtMark] = useState(false);

  const marginNum = toNum(margin);
  const marginPct = AVAILABLE_BALANCE
    ? Math.min(100, (marginNum / AVAILABLE_BALANCE) * 100)
    : 0;

  const onMarginPctChange = (pct) => {
    const next = (AVAILABLE_BALANCE * pct) / 100;
    setMargin(next.toFixed(4));
    setSize((next * leverage).toFixed(4));
  };

  const { positionValue, liqPrice, marginReq } = useMemo(() => {
    const notional = marginNum * leverage;
    const px = market.markPx;
    const liq =
      direction === "long"
        ? px * (1 - 1 / Math.max(leverage, 1))
        : px * (1 + 1 / Math.max(leverage, 1));
    return {
      positionValue: usd(notional),
      liqPrice: notional > 0 ? usd(liq) : "—",
      marginReq: usd(marginNum),
    };
  }, [marginNum, leverage, direction, market.markPx]);

  const dirLabel = direction === "long" ? "Long" : "Short";
  const canSubmit = marginNum > 0;

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-black lg:border-l lg:border-[#242424]">
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#242424] px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
        <span className="text-lg font-semibold text-white">{market.symbol}</span>
        <div className="flex flex-wrap items-end gap-1 whitespace-nowrap text-base">
          <span className="text-[#bfbfbf]">Current Price:</span>
          <span className="font-medium text-white tabular-nums">
            $
            {market.markPx.toLocaleString("en-US", {
              minimumFractionDigits: market.pxDecimals,
              maximumFractionDigits: market.pxDecimals,
            })}
          </span>
        </div>
      </div>

      <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-black transition-[filter] hover:brightness-110"
            style={{
              backgroundImage: "linear-gradient(90deg, #f2b500, #00f3b6)",
            }}
          >
            <Sparkles className="size-4" aria-hidden />
            Optimize Setup
          </button>

          <div className="flex rounded-[10px] border border-[#242424] p-1">
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

          <div className="flex rounded-[10px] border border-[#242424] p-1">
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
                {AVAILABLE_BALANCE.toFixed(4)} USDC
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <AmountField
              label="Margin"
              value={margin}
              onChange={(v) => {
                setMargin(v);
                setSize((toNum(v) * leverage).toFixed(4));
              }}
            />
            <AmountField
              label="Size"
              value={size}
              onChange={(v) => {
                setSize(v);
                setMargin((toNum(v) / Math.max(leverage, 1)).toFixed(4));
              }}
            />
          </div>

          <CopilotSetupSlider
            value={Math.round(marginPct)}
            min={0}
            max={100}
            ticks={5}
            ariaLabel="Percent of available balance"
            onChange={onMarginPctChange}
            valueLabel={`${marginPct.toFixed(1)}%`}
          />

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#bfbfbf]">Leverage</span>
              <span className="text-xs text-[#787878]">
                Max: {market.maxLeverage}x
              </span>
            </div>
            <CopilotSetupSlider
              value={leverage}
              min={1}
              max={market.maxLeverage}
              ariaLabel="Leverage"
              onChange={(v) => {
                setLeverage(v);
                setSize((marginNum * v).toFixed(4));
              }}
              valueLabel={`${leverage}x`}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-[#242424] pt-3">
            <CollapseHeading
              title="Take Profit/Stop Loss"
              open={tpslOpen}
              onToggle={() => setTpslOpen((o) => !o)}
            />
            {tpslOpen ? (
              <div className="flex flex-col gap-2">
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
                    hint="$0"
                  />
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
                    hint="$0"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-[#242424] pt-3">
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
                    <dd className="font-semibold text-white tabular-nums">
                      {liqPrice}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#bfbfbf]">Position Value</dt>
                    <dd className="font-semibold text-white tabular-nums">
                      {positionValue}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#bfbfbf]">Margin Req.</dt>
                    <dd className="font-semibold text-white tabular-nums">
                      {marginReq}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#bfbfbf]">Order Type</dt>
                    <dd className="font-semibold text-white capitalize">
                      {orderType} / {marginMode}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-[#242424] bg-black px-3 py-4 max-tablet:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-5">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 max-tablet:min-h-10">
          <Checkbox checked={openAtMark} onChange={setOpenAtMark} />
          <span className="text-sm font-medium text-white">
            Open Position at Current Price
          </span>
        </label>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit?.({ coin, direction, marginMode, orderType, margin: marginNum, leverage })}
          className={`min-h-11 w-full rounded-lg py-2.5 text-base font-medium transition-[filter] ${
            canSubmit
              ? direction === "long"
                ? "bg-[#0e6b3a] text-white hover:brightness-110"
                : "bg-[#d53d3d] text-white hover:brightness-110"
              : "cursor-not-allowed bg-[#12291d] text-[#5f7a6c]"
          }`}
        >
          Open {market.symbol} {dirLabel}
        </button>
      </div>
    </aside>
  );
}
