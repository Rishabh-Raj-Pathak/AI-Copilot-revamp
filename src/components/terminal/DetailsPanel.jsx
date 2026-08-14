import { useEffect, useState } from "react";
import { terminalAssets as a } from "../../figma/terminalAssets.js";
import {
  AmountField,
  CheckboxRow,
  CopilotSetupSlider,
  Segmented,
  TriggerField,
} from "./detailsPanelParts.jsx";
import { LeverageModal, MarginModeModal } from "./setupConfigModals.jsx";

const MAX_LEVERAGE = 40;

/** Gain/Loss unit — absolute USD or percent of position size. */
const AMOUNT_UNITS = [
  { value: "usd", label: "$" },
  { value: "pct", label: "%" },
];

const toNum = (v) => {
  const n = Number.parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

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
  const [limitPrice, setLimitPrice] = useState("0");
  const [leverage, setLeverage] = useState(10);
  const [takeProfitOpen, setTakeProfitOpen] = useState(false);
  const [tpPrice, setTpPrice] = useState("0");
  const [gainPct, setGainPct] = useState("20");
  const [gainUsd, setGainUsd] = useState("0");
  const [gainUnit, setGainUnit] = useState("pct");
  const [slPrice, setSlPrice] = useState("0");
  const [lossPct, setLossPct] = useState("20");
  const [lossUsd, setLossUsd] = useState("0");
  const [lossUnit, setLossUnit] = useState("pct");
  const [earlyExit, setEarlyExit] = useState(false);
  const [openAtMark, setOpenAtMark] = useState(false);
  const [activeRow, setActiveRow] = useState(0);
  const [marginModeOpen, setMarginModeOpen] = useState(false);
  const [leverageOpen, setLeverageOpen] = useState(false);

  useEffect(() => {
    const seedMargin = (Number.parseFloat(setup.balance) || 0) * 0.1;
    const seedSize = seedMargin * 10;
    setDirection(setup.direction === "long" ? "long" : "short");
    setLeverage(10);
    setMargin(seedMargin.toFixed(2));
    setSize(seedSize.toFixed(2));
    setLimitPrice(String(setup.price));
    setTpPrice(String(Math.round(Number(setup.price) * 0.96 * 10000) / 10000));
    setSlPrice(String(Math.round(Number(setup.price) * 1.02 * 10000) / 10000));
    setGainPct("20");
    setLossPct("20");
    /* Seed both units so switching $ ⇄ % never starts from an empty field. */
    setGainUsd((seedSize * 0.2).toFixed(2));
    setLossUsd((seedSize * 0.2).toFixed(2));
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
    setMargin((sizeNum / Math.max(next, 1)).toFixed(2));
  };

  const dirLabel = direction === "long" ? "Long" : "Short";

  /* Additional Info — mirrors the live order panel's four rows. */
  const assetSize = priceNum
    ? `${(sizeNum / priceNum).toLocaleString("en-US", { maximumFractionDigits: 4 })} ${setup.symbol}`
    : `0 ${setup.symbol}`;
  const riskReward = chipValue(setup, "rr") ?? "—";
  const winningPct = chipValue(setup, "win") ?? setup.additional.winning;

  /*
    Gain/Loss accept either unit. Each unit keeps its own draft rather than one
    value converted on every keystroke — a shared value re-formats the field
    mid-typing ("1." → "0.10") and fights the caret.
  */
  const pctToUsd = (pct) => (sizeNum * toNum(pct)) / 100;
  const usdToPct = (amount) => (sizeNum ? (toNum(amount) / sizeNum) * 100 : 0);

  return (
    <aside className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-black max-tablet:min-h-0 lg:border-l lg:border-[#242424]">
      {/*
        Context strip, not a page title — it stays one row at every width and
        borrows the body's type scale so it costs a control's worth of height
        rather than a header's.
      */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#242424] px-3 py-2.5 sm:px-4">
        <span className="min-w-0 truncate text-anchor text-ink">
          {setup.symbol}
        </span>
        <div className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-data text-ink-muted">Current Price:</span>
          <span className="text-control text-ink">
            ${setup.price}
          </span>
        </div>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        data-tour="copilot-trade-setup"
      >
        {/*
          Budgeted to clear an 800px viewport without an inner scrollbar:
          panel height − context strip − padding. Only spacing was compressed —
          the type scale is fixed (see CLAUDE.md) and the field order is the
          perp-DEX convention documented below.
        */}
        <div className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 max-tablet:px-3 max-tablet:py-3 sm:px-4 sm:py-3.5">
          <div className="flex flex-col gap-2.5">
            {/*
              Order mirrors the perp-DEX convention (Hyperliquid / Variational /
              Lighter): sticky account config first, then order type, then the
              per-trade direction — which sits closest to the size inputs and
              the CTA it drives.
            */}
            {/*
              Account-level settings read as value chips, not dropdowns. Every
              reference DEX opens a dedicated modal here: the choice needs
              explanation (cross vs isolated liquidation) and leverage needs a
              slider plus a risk warning — neither fits a select list, and a
              one-click select makes the riskiest control the cheapest to hit.
            */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setMarginModeOpen(true)}
                className="flex h-10 min-w-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 text-control text-ink transition-colors hover:border-[#3a3a3a] hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#f2b500]/50 focus-visible:outline-none"
              >
                {marginMode === "cross" ? "Cross" : "Isolated"}
              </button>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Leverage: ${leverage}x`}
                onClick={() => setLeverageOpen(true)}
                className="flex h-10 min-w-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 text-control text-ink transition-colors hover:border-[#3a3a3a] hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#f2b500]/50 focus-visible:outline-none"
              >
                {leverage}x
              </button>
            </div>
            <div className="flex justify-center gap-5 border-b border-[#242424]">
              <button
                type="button"
                aria-pressed={orderType === "market"}
                onClick={() => setOrderType("market")}
                className={`flex-1 py-2 text-control ${
                  orderType === "market"
                    ? "border-b-[3px] border-[#f2b500] font-medium text-ink"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                Market
              </button>
              <button
                type="button"
                aria-pressed={orderType === "limit"}
                onClick={() => setOrderType("limit")}
                className={`flex-1 py-2 text-control ${
                  orderType === "limit"
                    ? "border-b-[3px] border-[#f2b500] font-medium text-ink"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                Limit
              </button>
            </div>
            <div className="flex rounded-[10px] border border-[#242424] p-0.5">
              <button
                type="button"
                aria-pressed={direction === "long"}
                onClick={() => setDirection("long")}
                className={`flex-1 rounded-lg py-2 text-control transition-colors ${
                  direction === "long"
                    ? "bg-[#0e381f] font-medium text-ink"
                    : "text-ink-subtle hover:bg-white/5"
                }`}
              >
                Buy / Long
              </button>
              <button
                type="button"
                aria-pressed={direction === "short"}
                onClick={() => setDirection("short")}
                className={`flex-1 rounded-lg py-2 text-control transition-colors ${
                  direction === "short"
                    ? "bg-[#5f1414] font-medium text-ink"
                    : "text-ink-subtle hover:bg-white/5"
                }`}
              >
                Sell / Short
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 border-y border-[#242424] py-2">
              <span className="text-data text-ink-muted">Available Balance</span>
              <div className="flex items-center gap-2">
                <img alt="" className="size-5 shrink-0" src={a.usdc} />
                <span className="text-data text-ink">
                  {setup.balance} USDC
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-2">
                {/*
                  Limit differs from Market by exactly one field. Everything
                  else stays put so switching tabs never reflows the form —
                  same as the reference panels.
                */}
                {orderType === "limit" ? (
                  <AmountField
                    label="Price"
                    value={limitPrice}
                    onChange={setLimitPrice}
                    readOnly={openAtMark}
                  />
                ) : null}
                <AmountField
                  label="Size"
                  value={size}
                  onChange={(v) => {
                    setSize(v);
                    setMargin((toNum(v) / Math.max(leverage, 1)).toFixed(2));
                  }}
                />
                {/*
                  Labelled stops instead of bare dots — the rail alone never
                  said what fraction of the balance a position was, and the
                  quarter marks are the sizes people actually reach for.
                */}
                <div className="flex items-start gap-2 pt-0.5">
                  <CopilotSetupSlider
                    value={Math.round(marginPct)}
                    min={0}
                    max={100}
                    ticks={5}
                    milestones
                    ariaLabel="Percent of available balance"
                    onChange={onMarginPctChange}
                    valueLabel={`${marginPct.toFixed(1)}%`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {/*
                  A checkbox, not a disclosure chevron: attaching TP/SL is an
                  order option the user opts into — same control and layout as
                  Early Exit Optimization below, which nests under it.
                */}
                <CheckboxRow
                  checked={takeProfitOpen}
                  onChange={setTakeProfitOpen}
                  label={
                    <span className="text-control font-medium text-ink-muted">
                      Take Profit / Stop Loss
                    </span>
                  }
                />
                {takeProfitOpen ? (
                  <>
                    <div className="flex gap-2">
                      <TriggerField
                        label="TP Price"
                        value={tpPrice}
                        onChange={setTpPrice}
                      />
                      <TriggerField
                        label="Gain"
                        value={gainUnit === "pct" ? gainPct : gainUsd}
                        onChange={gainUnit === "pct" ? setGainPct : setGainUsd}
                        unitSlot={
                          <Segmented
                            size="xs"
                            ariaLabel="Gain unit"
                            value={gainUnit}
                            onChange={(next) => {
                              if (next === gainUnit) return;
                              if (next === "usd")
                                setGainUsd(pctToUsd(gainPct).toFixed(2));
                              else setGainPct(usdToPct(gainUsd).toFixed(2));
                              setGainUnit(next);
                            }}
                            options={AMOUNT_UNITS}
                          />
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <TriggerField
                        label="SL Price"
                        value={slPrice}
                        onChange={setSlPrice}
                      />
                      <TriggerField
                        label="Loss"
                        value={lossUnit === "pct" ? lossPct : lossUsd}
                        onChange={lossUnit === "pct" ? setLossPct : setLossUsd}
                        unitSlot={
                          <Segmented
                            size="xs"
                            ariaLabel="Loss unit"
                            value={lossUnit}
                            onChange={(next) => {
                              if (next === lossUnit) return;
                              if (next === "usd")
                                setLossUsd(pctToUsd(lossPct).toFixed(2));
                              else setLossPct(usdToPct(lossUsd).toFixed(2));
                              setLossUnit(next);
                            }}
                            options={AMOUNT_UNITS}
                          />
                        }
                      />
                    </div>
                    {/* The ladder stays optional so the core order path remains compact. */}
                    <div className="flex flex-col gap-2">
                      <CheckboxRow
                        checked={earlyExit}
                        onChange={setEarlyExit}
                        label={
                          <span className="text-data text-ink-muted">
                            Early Exit Optimization
                          </span>
                        }
                      />
                      {earlyExit ? (
                        <div className="minimal-scrollbar overflow-x-auto overflow-y-hidden rounded-lg border border-[#242424] max-tablet:-mx-0.5">
                          <div className="flex border-b border-[#242424] bg-[#0f0f0f] ds-eyebrow text-ink-muted">
                            <div className="flex min-w-0 flex-1 items-center justify-center px-3 py-2">
                              Take Profit
                            </div>
                            <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-2">
                              TP%
                            </div>
                            <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-2">
                              Winning %
                            </div>
                            {/* Wider than the data columns so the button can
                                clear the cell walls — at 75px it filled the
                                cell edge to edge and read as a filled cell. */}
                            <div className="flex w-22 shrink-0 items-center justify-center px-2 py-2">
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
                              <div className="flex min-w-0 flex-1 items-center justify-center px-3 py-2 text-data text-ink">
                                $3.73
                              </div>
                              <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-2 text-data text-ink">
                                75%
                              </div>
                              <div className="flex w-[75px] shrink-0 items-center justify-center px-3 py-2 text-data text-ink">
                                96%
                              </div>
                              <div className="flex w-22 shrink-0 items-center justify-center px-2 py-1.5">
                                {/*
                                  Reads as a raised control, not a cell: a fill
                                  a step above the row, a border lighter than
                                  the table's own #242424 grid lines (which is
                                  what made the old outline vanish into the
                                  chrome), a 1px top highlight and a press
                                  nudge. Greyscale and 11px, so it stays quiet
                                  next to the numbers it acts on — the picked
                                  row carries the muted brand tint instead.
                                */}
                                <button
                                  type="button"
                                  aria-pressed={activeRow === row}
                                  onClick={() => setActiveRow(row)}
                                  className={`cursor-pointer rounded-md border px-2 py-1 text-micro transition-colors active:translate-y-px ${
                                    activeRow === row
                                      ? "border-[#3e2e00] bg-[#171200] text-[#f2b500]"
                                      : "border-[#3a3a3a] bg-[#1c1c1c] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-[#4a4a4a] hover:bg-[#262626]"
                                  }`}
                                >
                                  {activeRow === row ? "Active" : "Activate"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 border-t border-[#242424] pt-2.5">
                {/*
                  Snaps Price to the live quote and locks the field — otherwise
                  the checkbox and an edited limit price state two different
                  intents at once.
                */}
                {orderType === "limit" ? (
                  <CheckboxRow
                    className="min-h-9"
                    checked={openAtMark}
                    onChange={(next) => {
                      setOpenAtMark(next);
                      if (next) setLimitPrice(String(setup.price));
                    }}
                    label={
                      <span className="text-data text-ink">
                        Open Position at Current Price
                      </span>
                    }
                  />
                ) : null}
                <button
                  type="button"
                  data-tour="trade-open-cta"
                  onClick={() => onOpenTradeCtaClick?.()}
                  className={`min-h-11 w-full rounded-lg py-2.5 text-control font-medium text-ink transition-[filter,transform] hover:brightness-110 active:translate-y-px ${
                    direction === "long" ? "bg-[#0e6b3a]" : "bg-[#d53d3d]"
                  }`}
                >
                  {openTradeCtaLabel ?? `Open ${setup.symbol} ${dirLabel}`}
                </button>
              </div>
            </div>
            {/*
              Consequences of the order above — read-only, so they live below
              the CTA. Facts stay neutral; the two copilot-derived edge metrics
              carry the brand accent.
            */}
            <dl className="flex flex-col gap-1.5 border-t border-[#242424] pt-2.5 text-data">
              {[
                ["Liquidation Price", setup.additional.liquidation, false],
                ["Asset Size", assetSize, false],
                ["Risk:Reward", riskReward, true],
                ["Winning %", winningPct, true],
              ].map(([term, value, accent]) => (
                <div key={term} className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{term}</dt>
                  <dd
                    className={`${
                      accent ? "text-[#f2b500]" : "text-ink"
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <MarginModeModal
        open={marginModeOpen}
        onClose={() => setMarginModeOpen(false)}
        symbol={setup.symbol}
        value={marginMode}
        onConfirm={setMarginMode}
      />
      <LeverageModal
        open={leverageOpen}
        onClose={() => setLeverageOpen(false)}
        symbol={setup.symbol}
        value={leverage}
        max={MAX_LEVERAGE}
        onConfirm={onLeverageChange}
      />
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
          <p className="max-w-[280px] text-data text-ink-faint">
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
