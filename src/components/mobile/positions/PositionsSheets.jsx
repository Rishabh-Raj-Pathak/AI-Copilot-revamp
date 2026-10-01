import { useId, useState } from "react";
import { motion } from "framer-motion";
import BottomSheet from "../BottomSheet.jsx";
import AppButton from "../AppButton.jsx";
import { InfoNote, Tag, TokenIcon } from "./PositionsUi.jsx";
import {
  formatSignedPct,
  formatSignedUsd,
  formatSizeUnit,
  formatUsd,
  pnlTone,
  roundSize,
  sizeInputValue,
} from "./positionsFormat.js";
import { closeEstimate, expectedPnl, positionPnl, roePct } from "./positionsMath.js";

/* ---------------------------------------------------------------- inputs */

/** Keep a decimal string typeable: digits and one separator ("," → "."). */
function sanitizeDecimal(raw) {
  const s = raw.replace(",", ".").replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  return dot === -1 ? s : `${s.slice(0, dot + 1)}${s.slice(dot + 1).replace(/\./g, "")}`;
}

/**
 * Input that grows with its value so the unit sits right after the number
 * (Figma "Amount Input": "1.8 ETH … ≈ $4,515.12"). 16px text — iOS webviews
 * zoom on focus below that.
 */
function AutoWidthInput({ value, onChange, placeholder, ariaLabel }) {
  return (
    <span className="inline-grid min-w-[1ch] max-w-[65%] text-[16px] font-medium leading-[22px]">
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre">
        {value || placeholder}
      </span>
      <input
        type="text"
        size={1}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(sanitizeDecimal(e.target.value))}
        className="col-start-1 row-start-1 w-0 min-w-full bg-transparent p-0 text-[16px] font-medium leading-[22px] text-ink outline-none placeholder:text-ink-faint"
      />
    </span>
  );
}

/** 44px field shell; tapping anywhere focuses the input (it's a <label>). */
function FieldShell({ invalid, children }) {
  return (
    <label
      className={`flex h-11 w-full cursor-text items-center gap-1.5 overflow-hidden rounded-[10px] border bg-app-bg px-3 transition-colors ${
        invalid ? "border-app-negative" : "border-app-line-strong focus-within:border-ink-subtle"
      }`}
    >
      {children}
    </label>
  );
}

/** Sliding two-option control (Figma "Order Type", 38px). */
function Segmented({ value, onChange, options, ariaLabel }) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex w-full gap-0.5 rounded-lg border border-app-line bg-app-bg p-0.5"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`relative flex h-8 min-w-0 flex-1 items-center justify-center rounded-md text-app-callout leading-4 transition-colors ${
              selected ? "font-medium text-ink" : "text-ink-subtle"
            }`}
          >
            {selected ? (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: "spring", damping: 34, stiffness: 420 }}
                className="absolute inset-0 rounded-md border border-app-line-strong bg-app-subtle"
              />
            ) : null}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Label / value row in the Estimate box (12px; the total row is 14px). */
function EstimateRow({ label, value, valueClass = "text-ink", total = false }) {
  return (
    <div className="flex items-center justify-between gap-3 whitespace-nowrap">
      <span className={`text-app-caption ${total ? "text-ink-muted" : "text-ink-subtle"}`}>{label}</span>
      <span
        className={`font-medium ${total ? "text-app-body leading-[18px]" : "text-app-caption"} ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function EstimateBox({ children }) {
  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-app-line bg-app-bg px-3 py-2.5">
      {children}
    </div>
  );
}

/** Figma "Position Summary" (1103:24157): token, coin, side, leverage, PnL. */
function PositionSummary({ position }) {
  const pnl = positionPnl(position);
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-app-line bg-app-bg px-3 py-2.5">
      <TokenIcon coin={position.coin} />
      <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        <span className="text-app-body font-medium leading-[18px] text-ink">{position.coin}</span>
        <Tag tone={position.direction === "long" ? "positive" : "negative"}>
          {position.direction === "long" ? "Long" : "Short"}
        </Tag>
        <Tag>{position.leverage}x</Tag>
      </span>
      <span className={`flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap ${pnlTone(pnl)}`}>
        <span className="text-app-body font-medium leading-[18px]">{formatSignedUsd(pnl)}</span>
        <span className="text-app-label">{formatSignedPct(roePct(position, pnl))}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------ Close Position sheet */

const PERCENTS = [25, 50, 75, 100];

function ClosePositionForm({ position, onCancel, onConfirm }) {
  const { coin } = position;
  const [amount, setAmount] = useState(() => sizeInputValue(position.size, coin));
  const [orderType, setOrderType] = useState("market");
  const [limitPx, setLimitPx] = useState(() => position.currentPrice.toFixed(2));

  const amt = Number.parseFloat(amount) || 0;
  const tooBig = amt > position.size + 1e-9;
  const px = orderType === "market" ? position.currentPrice : Number.parseFloat(limitPx) || 0;
  const valid = amt > 0 && !tooBig && px > 0;
  const est = closeEstimate(position, Math.min(amt, position.size), px, orderType);

  const chipAmount = (pct) => sizeInputValue(roundSize((position.size * pct) / 100, coin), coin);

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <PositionSummary position={position} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between whitespace-nowrap text-app-caption text-ink-subtle">
          <span className="tracking-[0.04em]">Amount to close</span>
          <span>Position {formatSizeUnit(position.size, coin)}</span>
        </div>
        <FieldShell invalid={tooBig}>
          <AutoWidthInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            ariaLabel={`Amount to close in ${coin}`}
          />
          <span className="shrink-0 text-app-body leading-5 text-ink-subtle">{coin}</span>
          <span className="min-w-0 flex-1" />
          <span className="shrink-0 truncate text-app-caption text-ink-subtle">
            ≈ {formatUsd(amt * px)}
          </span>
        </FieldShell>
        {tooBig ? (
          <p className="text-app-caption text-app-negative">
            You can close at most {formatSizeUnit(position.size, coin)}.
          </p>
        ) : null}
        <div className="flex gap-2">
          {PERCENTS.map((pct) => {
            const selected = chipAmount(pct) === amount;
            return (
              <button
                key={pct}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmount(chipAmount(pct))}
                className={`app-pressable flex h-7 min-w-0 flex-1 items-center justify-center rounded-md border text-app-caption font-medium ${
                  selected
                    ? "border-app-line-accent bg-app-line-accent-subtle text-app-accent"
                    : "border-app-line bg-app-bg text-ink-muted"
                }`}
              >
                {pct}%
              </button>
            );
          })}
        </div>
      </div>

      <Segmented
        ariaLabel="Order type"
        value={orderType}
        onChange={setOrderType}
        options={[
          { value: "market", label: "Market" },
          { value: "limit", label: "Limit" },
        ]}
      />

      {orderType === "limit" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between whitespace-nowrap text-app-caption text-ink-subtle">
            <span className="tracking-[0.04em]">Limit price</span>
            <button
              type="button"
              onClick={() => setLimitPx(position.currentPrice.toFixed(2))}
              className="app-pressable -my-1 py-1 text-app-caption font-medium text-app-accent"
            >
              Use current {formatUsd(position.currentPrice)}
            </button>
          </div>
          <FieldShell invalid={!(px > 0)}>
            <span className="shrink-0 text-[16px] font-medium leading-[22px] text-ink-subtle">$</span>
            <AutoWidthInput
              value={limitPx}
              onChange={setLimitPx}
              placeholder="0.00"
              ariaLabel="Limit price in US dollars"
            />
          </FieldShell>
        </div>
      ) : null}

      <EstimateBox>
        <EstimateRow
          label={orderType === "market" ? "Est. close price" : "Close price"}
          value={px > 0 ? formatUsd(px) : "—"}
        />
        <EstimateRow
          label="Est. realized PnL"
          value={valid ? formatSignedUsd(est.realizedPnl) : "—"}
          valueClass={valid ? pnlTone(est.realizedPnl) : "text-ink"}
        />
        <EstimateRow label="Est. fee" value={valid ? formatUsd(est.fee) : "—"} />
        <div className="h-px w-full bg-app-line" />
        <EstimateRow total label="You’ll receive" value={valid ? `≈ ${formatUsd(est.receive)}` : "—"} />
      </EstimateBox>

      <InfoNote>
        {orderType === "market"
          ? "Market orders close immediately at the best available price. Slippage may apply."
          : "Limit orders close only when the price reaches your limit. Until then the order waits in Open orders."}
      </InfoNote>

      <div className="flex flex-col gap-1">
        <AppButton
          variant="destructive"
          disabled={!valid}
          onClick={() =>
            onConfirm({
              position,
              amount: Math.min(amt, position.size),
              orderType,
              closePx: px,
              ...est,
            })
          }
        >
          {orderType === "market" ? "Close position" : "Place limit close"}
        </AppButton>
        <AppButton variant="ghost" onClick={onCancel}>
          Cancel
        </AppButton>
      </div>
    </div>
  );
}

/**
 * Figma "Close Position / Confirm" (1103:24131, sheet 1103:24154).
 * Close never acts directly — this sheet is the confirmation.
 * `sessionKey` resets the form each time the sheet opens.
 */
export function ClosePositionSheet({ open, position, sessionKey, onClose, onConfirm }) {
  return (
    <BottomSheet open={open && position != null} onClose={onClose} title="Close position">
      {position ? (
        <ClosePositionForm
          key={sessionKey}
          position={position}
          onCancel={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </BottomSheet>
  );
}

/* ------------------------------------------------------- Edit TP/SL sheet */

function parseOptional(text) {
  if (text === "") return null;
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : Number.NaN;
}

function PriceField({ label, value, onChange, hint, hintClass, error, ariaLabel }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between whitespace-nowrap text-app-caption text-ink-subtle">
        <span className="tracking-[0.04em]">{label}</span>
        {hint ? <span className={`font-medium ${hintClass}`}>{hint}</span> : null}
      </div>
      <FieldShell invalid={Boolean(error)}>
        <span className="shrink-0 text-[16px] font-medium leading-[22px] text-ink-subtle">$</span>
        <AutoWidthInput value={value} onChange={onChange} placeholder="Not set" ariaLabel={ariaLabel} />
        <span className="min-w-0 flex-1" />
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange("");
            }}
            className="app-pressable -mr-1 shrink-0 rounded-md px-1 py-1 text-app-caption text-ink-subtle"
          >
            Clear
          </button>
        ) : null}
      </FieldShell>
      {error ? <p className="text-app-caption text-app-negative">{error}</p> : null}
    </div>
  );
}

function TpSlForm({ position, onCancel, onSave }) {
  const long = position.direction === "long";
  const mark = position.currentPrice;
  const [tpText, setTpText] = useState(() => (position.tp != null ? String(position.tp) : ""));
  const [slText, setSlText] = useState(() => (position.sl != null ? String(position.sl) : ""));
  const tp = parseOptional(tpText);
  const sl = parseOptional(slText);

  let tpError = null;
  if (Number.isNaN(tp) || tp === 0) tpError = "Enter a valid price.";
  else if (tp != null && (long ? tp <= mark : tp >= mark))
    tpError = `Take profit must be ${long ? "above" : "below"} the current price.`;

  let slError = null;
  if (Number.isNaN(sl) || sl === 0) slError = "Enter a valid price.";
  else if (sl != null && (long ? sl >= mark : sl <= mark))
    slError = `Stop loss must be ${long ? "below" : "above"} the current price.`;
  else if (sl != null && (long ? sl <= position.liqPrice : sl >= position.liqPrice))
    slError = `Stop loss must trigger before liquidation at ${formatUsd(position.liqPrice)}.`;

  const exp = expectedPnl({ ...position, tp: tpError ? null : tp, sl: slError ? null : sl });
  const changed = tp !== position.tp || sl !== position.sl;
  const valid = !tpError && !slError && changed;

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <PositionSummary position={position} />
      <PriceField
        label="Take profit price"
        ariaLabel="Take profit price in US dollars"
        value={tpText}
        onChange={setTpText}
        error={tpError}
        hint={exp.profit != null ? `Est. ${formatSignedUsd(exp.profit)}` : null}
        hintClass={pnlTone(exp.profit)}
      />
      <PriceField
        label="Stop loss price"
        ariaLabel="Stop loss price in US dollars"
        value={slText}
        onChange={setSlText}
        error={slError}
        hint={exp.loss != null ? `Est. ${formatSignedUsd(exp.loss)}` : null}
        hintClass={pnlTone(exp.loss)}
      />
      <EstimateBox>
        <EstimateRow label="Entry price" value={formatUsd(position.entryPrice)} />
        <EstimateRow label="Current price" value={formatUsd(mark)} />
        <EstimateRow label="Liq. price" value={formatUsd(position.liqPrice)} />
      </EstimateBox>
      <InfoNote>
        TP and SL are reduce-only market orders. They trigger on the mark price and close the whole
        position.
      </InfoNote>
      <div className="flex flex-col gap-1">
        <AppButton disabled={!valid} onClick={() => onSave({ position, tp, sl })}>
          Save
        </AppButton>
        <AppButton variant="ghost" onClick={onCancel}>
          Cancel
        </AppButton>
      </div>
    </div>
  );
}

/** Edit TP/SL — same sheet language as Close Position. */
export function EditTpSlSheet({ open, position, sessionKey, onClose, onSave }) {
  return (
    <BottomSheet open={open && position != null} onClose={onClose} title="Edit TP/SL">
      {position ? (
        <TpSlForm key={sessionKey} position={position} onCancel={onClose} onSave={onSave} />
      ) : null}
    </BottomSheet>
  );
}

/* ------------------------------------------------------ Cancel all sheet */

function joinWords(words) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** Body copy names the TP/SL orders that go with "Cancel all" (Figma 1103:24280). */
function cancelAllCopy(orders) {
  const protective = orders.filter((o) => o.type === "Take Profit" || o.type === "Stop Loss");
  if (!protective.length) return "This cancels every open order. Your positions stay open.";
  const kinds = [];
  if (protective.some((o) => o.type === "Take Profit")) kinds.push("take-profit");
  if (protective.some((o) => o.type === "Stop Loss")) kinds.push("stop-loss");
  const coins = [...new Set(protective.map((o) => o.coin))];
  return `This cancels every open order, including the ${joinWords(kinds)} orders on your ${joinWords(
    coins,
  )} position${coins.length > 1 ? "s" : ""}. Your positions stay open.`;
}

/** Figma "Open Orders / Cancel All Confirm" (1103:24254, sheet 1103:24277). */
export function CancelAllSheet({ open, orders, onClose, onConfirm }) {
  const n = orders.length;
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`Cancel all ${n} ${n === 1 ? "order" : "orders"}?`}
    >
      <div className="flex flex-col gap-4 px-4 pt-4">
        <p className="text-app-callout text-ink-muted">{cancelAllCopy(orders)}</p>
        <div className="flex flex-col gap-1">
          <AppButton variant="destructive" onClick={onConfirm}>
            Cancel all
          </AppButton>
          <AppButton variant="ghost" onClick={onClose}>
            Keep orders
          </AppButton>
        </div>
      </div>
    </BottomSheet>
  );
}
