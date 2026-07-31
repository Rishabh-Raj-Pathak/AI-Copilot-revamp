import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  AmountField,
  Checkbox,
  CopilotSetupSlider,
} from "../terminal/detailsPanelParts.jsx";
import { DexIcon } from "../terminal/dexIcons.jsx";
import { terminalPlatforms } from "../../design-system/tokens/terminalPlatformSelect";
import { getMarket } from "./tradeMockData.js";

const toNum = (v) => {
  const n = Number.parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const usd = (n) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function dexLabel(id) {
  return terminalPlatforms.find((p) => p.id === id)?.label ?? id;
}

/** No wallet SDK exists yet (see `lib/wallet.js`) — one deterministic mock balance per dex. */
const MOCK_BALANCE_BY_DEX = {
  hyperliquid: 128.42,
  nado: 64.05,
  pacifica: 212.9,
  paradex: 47.31,
};

const LEVERAGE_STEPS = [1, 2, 3, 5, 10, 15, 20, 25, 33, 40];

function leverageOptions(maxLeverage) {
  const steps = LEVERAGE_STEPS.filter((l) => l <= maxLeverage);
  if (!steps.includes(maxLeverage)) steps.push(maxLeverage);
  return steps;
}

/** Connect/balance row shown at the top of every leg — one row, no card/avatar. */
function DexConnectRow({ dex, direction, connected, balance, onConnect }) {
  const dirLong = direction === "long";
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-[#242424] px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <DexIcon id={dex} className="size-[18px] shrink-0" />
        <span className="truncate text-sm font-medium text-white">
          {dexLabel(dex)}
        </span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${
            dirLong
              ? "bg-[rgba(0,212,146,0.12)] text-[#00d492]"
              : "bg-[rgba(229,72,77,0.12)] text-[#e5484d]"
          }`}
        >
          {dirLong ? "Long" : "Short"}
        </span>
      </div>
      {connected ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-white tabular-nums">
            {usd(balance)}
          </span>
          <span
            className="size-1.5 shrink-0 rounded-full bg-[#00d492]"
            title="Connected"
            aria-hidden
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="shrink-0 rounded-md border border-[#242424] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/5"
        >
          Connect
        </button>
      )}
    </div>
  );
}

function LegSelect({ label, value, options, onChange, renderLabel }) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center rounded-md border border-[#242424] bg-black px-3 py-2 text-sm font-medium text-white">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent pr-4 outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-black">
            {renderLabel ? renderLabel(opt) : opt}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 size-3.5 shrink-0 text-[#bfbfbf]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-[#bfbfbf]">{label}</dt>
      <dd className="font-medium text-white tabular-nums">{value}</dd>
    </div>
  );
}

/** One venue's connect + size/leverage controls + TP/SL + stats. */
function LegCard({
  dex,
  direction,
  market,
  leverage,
  orderType,
  size,
  tpslOpen,
  tpPrice,
  gainPct,
  slPrice,
  lossPct,
  connected,
  balance,
  onConnect,
  onPatch,
  copyLabel,
  onCopy,
}) {
  const sizeNum = toNum(size);
  const notional = sizeNum * leverage;
  const midPx = market.markPx;
  const liqPx =
    direction === "long"
      ? midPx * (1 - 1 / Math.max(leverage, 1))
      : midPx * (1 + 1 / Math.max(leverage, 1));

  const sizePct = balance ? Math.min(100, (sizeNum / balance) * 100) : 0;
  const onSizePctChange = (pct) => {
    onPatch({ size: connected ? ((balance * pct) / 100).toFixed(4) : size });
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-[#242424] p-3">
      <DexConnectRow
        dex={dex}
        direction={direction}
        connected={connected}
        balance={balance}
        onConnect={onConnect}
      />

      <div className="flex gap-2">
        <LegSelect
          label="Leverage"
          value={String(leverage)}
          options={leverageOptions(market.maxLeverage).map(String)}
          onChange={(v) => onPatch({ leverage: Number(v) })}
          renderLabel={(v) => `${v}x`}
        />
        <LegSelect
          label="Order type"
          value={orderType}
          options={["market", "limit"]}
          onChange={(v) => onPatch({ orderType: v })}
          renderLabel={(v) => (v === "market" ? "Market" : "Limit")}
        />
      </div>

      <AmountField
        label="Size"
        value={size}
        onChange={(v) => onPatch({ size: v })}
        hint="USDC"
      />

      <CopilotSetupSlider
        value={Math.round(sizePct)}
        min={0}
        max={100}
        ticks={5}
        ariaLabel={`${dexLabel(dex)} size percent`}
        onChange={onSizePctChange}
        valueLabel={`${sizePct.toFixed(0)}%`}
      />

      <button
        type="button"
        onClick={onCopy}
        className="w-full rounded-md border border-[#242424] py-2 text-xs font-medium text-[#bfbfbf] transition-colors hover:bg-white/5 hover:text-white"
      >
        {copyLabel}
      </button>

      <label className="flex min-h-9 cursor-pointer items-center gap-2.5">
        <Checkbox
          checked={tpslOpen}
          onChange={(v) => onPatch({ tpslOpen: v })}
          className="size-5 shrink-0"
        />
        <span className="text-sm font-medium text-white">
          Take profit / Stop loss
        </span>
      </label>
      {tpslOpen ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <AmountField
              label="TP Price"
              value={tpPrice}
              onChange={(v) => onPatch({ tpPrice: v })}
            />
            <AmountField
              label="Gain %"
              value={gainPct}
              onChange={(v) => onPatch({ gainPct: v })}
              percent
            />
          </div>
          <div className="flex gap-2">
            <AmountField
              label="SL Price"
              value={slPrice}
              onChange={(v) => onPatch({ slPrice: v })}
            />
            <AmountField
              label="Loss %"
              value={lossPct}
              onChange={(v) => onPatch({ lossPct: v })}
              percent
            />
          </div>
        </div>
      ) : null}

      <dl className="flex flex-col gap-1.5 border-t border-[#242424] pt-3">
        <StatRow
          label="Available margin"
          value={connected ? usd(balance) : "—"}
        />
        <StatRow label="Required margin" value={sizeNum > 0 ? usd(sizeNum) : "—"} />
        <StatRow label="Position size" value={notional > 0 ? usd(notional) : "—"} />
        <StatRow
          label="Mid price"
          value={`$${midPx.toLocaleString("en-US", {
            minimumFractionDigits: market.pxDecimals,
            maximumFractionDigits: market.pxDecimals,
          })}`}
        />
        <StatRow
          label="Est. Liquidation price"
          value={notional > 0 ? usd(liqPx) : "—"}
        />
        <StatRow
          label="Est. Entry price"
          value={
            notional > 0
              ? orderType === "market"
                ? usd(midPx)
                : "Pending"
              : "—"
          }
        />
        <StatRow
          label="Est. slippage"
          value={notional > 0 ? "0.01%" : "—"}
        />
      </dl>
    </div>
  );
}

function defaultLeg(index, market) {
  return {
    direction: index === 0 ? "long" : "short",
    leverage: Math.min(10, market.maxLeverage),
    orderType: "market",
    size: "0",
    tpslOpen: false,
    tpPrice: "0",
    gainPct: "0",
    slPrice: "0",
    lossPct: "0",
  };
}

export default function TradeOrderPanel({
  coin,
  selectedDexes = ["hyperliquid"],
  onSubmit,
}) {
  const market = getMarket(coin);
  const legs = selectedDexes.length ? selectedDexes : ["hyperliquid"];
  const isMulti = legs.length > 1;

  const [legState, setLegState] = useState({});
  const [connectedMap, setConnectedMap] = useState({});
  const [openAtMark, setOpenAtMark] = useState(false);

  const getLeg = (dex, index) =>
    legState[dex] ?? defaultLeg(index, market);

  const patchLeg = (dex, index, patch) => {
    setLegState((prev) => ({
      ...prev,
      [dex]: { ...getLeg(dex, index), ...patch },
    }));
  };

  const connectDex = (dex) => {
    setConnectedMap((prev) => ({ ...prev, [dex]: true }));
  };

  const copyLegToOthers = (fromDex, fromIndex) => {
    const { size, leverage, orderType } = getLeg(fromDex, fromIndex);
    setLegState((prev) => {
      const next = { ...prev };
      legs.forEach((dex, i) => {
        if (dex === fromDex) return;
        next[dex] = { ...getLeg(dex, i), size, leverage, orderType };
      });
      return next;
    });
  };

  const canSubmit = legs.some((dex, i) => toNum(getLeg(dex, i).size) > 0);

  const handleSubmit = () => {
    onSubmit?.({
      coin,
      legs: legs.map((dex, i) => ({ dex, ...getLeg(dex, i) })),
    });
  };

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-black lg:border-l lg:border-[#242424]">
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#242424] px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
        <span className="text-lg font-semibold text-white">
          Open a position: {market.symbol}
        </span>
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

          <div
            className={
              isMulti
                ? "grid grid-cols-1 gap-3 tablet:grid-cols-2"
                : "flex flex-col gap-3"
            }
          >
            {legs.map((dex, index) => {
              const leg = getLeg(dex, index);
              const otherDirLabel = isMulti
                ? legs.length === 2
                  ? leg.direction === "long"
                    ? "Short"
                    : "Long"
                  : "all"
                : null;
              return (
                <LegCard
                  key={dex}
                  dex={dex}
                  {...leg}
                  market={market}
                  connected={!!connectedMap[dex]}
                  balance={MOCK_BALANCE_BY_DEX[dex] ?? 0}
                  onConnect={() => connectDex(dex)}
                  onPatch={(patch) => patchLeg(dex, index, patch)}
                  copyLabel={isMulti ? `Copy to ${otherDirLabel}` : "Copy to other legs"}
                  onCopy={() => copyLegToOthers(dex, index)}
                />
              );
            })}
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
          onClick={handleSubmit}
          className={`min-h-11 w-full rounded-lg py-2.5 text-base font-medium transition-[filter] ${
            canSubmit
              ? "text-black hover:brightness-110"
              : "cursor-not-allowed bg-[#12291d] text-[#5f7a6c]"
          }`}
          style={
            canSubmit
              ? { backgroundImage: "linear-gradient(90deg, #f2b500, #00f3b6)" }
              : undefined
          }
        >
          Set Size
        </button>
      </div>
    </aside>
  );
}
