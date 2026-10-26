import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, LoaderCircle, Lock, Wallet } from "lucide-react";
import GoldRange from "../agents/GoldRange.jsx";
import { useAppToast } from "../appToastContext.js";
import { Dn2Button, GroupToggle, InfoButton } from "../dn2/Dn2Ui.jsx";
import { CARD, CARD_EDGE, CARD_FILL, EYEBROW, FIELD, HERO_EDGE, HERO_FILL, LABEL, TILE } from "../dn2/dn2Theme.js";
import { DexLogo, StrategyGlyph } from "../../../market-making/ui.tsx";
import { blockingReason, estimateVolume } from "../../../market-making/Configure.tsx";
import {
  STRATEGY_LINE,
  buyingPower,
  cutoffCeiling,
  effectiveCutoff,
  floorCents,
  maxLeverage,
  minMargin,
  strategyAllowed,
  usd,
  usdCompact,
  usdFine,
} from "../../../market-making/lib.ts";
import { InfoSheet, MmPage, Switch } from "./MmUi.jsx";
import { MmMarketSheet, MmVenueSheet } from "./MmSetupSheets.jsx";

/**
 * Production's Configure screen on a phone: a pushed "Set up agent" page
 * (Delta Neutral 2's "Set up vault" pattern) with production's sections in
 * its order — Venue setup, Market, Strategy, Margin, Leverage, Expected
 * volume, Cut-off, Duration — and the CTA pinned above the home indicator.
 * The dropdowns become sheets, the ⓘ tooltips become info sheets.
 *
 * Every rule (defaults, auto-margin, what blocks activation, the estimate) is
 * the desktop form's own, from `market-making/Configure.tsx`.
 */

const TIPS = {
  market: ["Market", "Volume decides your cost. Deeper books fill more often and cost less per million traded."],
  strategy: ["Strategy", "How HyprEarn quotes. This drives your fill rate, your turnover and your cost."],
  margin: ["Margin", "The more margin your agent has, the bigger each order and the faster your volume grows."],
  leverage: [
    "Leverage",
    "How hard each quote leans. Cross shares one margin pool across inventory; isolated ring fences margin per position so losses cannot reach the rest of your balance.",
  ],
  volume: [
    "Expected volume",
    "A modelled range, not a promise. Actual volume moves with book depth, volatility and how long your quotes rest.",
  ],
  cutoff: [
    "Cut-off",
    "A hard floor. The agent cancels every quote and flattens inventory the moment equity falls this far below where it started.",
  ],
};

const DURATION_RANGE = { hr: [1, 168], min: [5, 60] };
const UNIT_WORD = { hr: "hours", min: "minutes" };
const UNIT_DEFAULT = { hr: 10, min: 30 };
const DERIVED = "text-[11px] leading-[15px] text-[#8f90a1]";
const MAX_LABEL = "text-[10px] font-semibold uppercase leading-[14px] tracking-[0.3px] text-[#ccb17f]";
/** The balance bar joined to its action, as on the Delta Neutral 2 DEX card (36 tall). */
const BAR = "flex h-9 items-stretch overflow-hidden rounded-[10px] border border-white/[0.07]";
const BAR_ACTION =
  "app-pressable flex shrink-0 items-center gap-1.5 border-l border-white/[0.07] bg-white/[0.02] px-4 text-[12px] font-medium leading-4 text-[#ccb17f] disabled:text-[#5f606c]";

/**
 * Round stops under the leverage slider: 1x, even steps, then the max
 * (1 · 10 · 20 · 30 · 40 for 40x; 1 · 5 · 10 for 10x). A step too close to
 * the max is dropped so two labels never touch.
 */
function leverageTicks(max) {
  if (max <= 1) return [1];
  const step = [1, 2, 5, 10, 25, 50, 100].find((s) => Math.ceil((max - 1) / s) <= 4) ?? 100;
  const ticks = [1];
  for (let v = step; v < max; v += step) if (v > 1 && max - v >= step * 0.6) ticks.push(v);
  ticks.push(max);
  return ticks;
}

function Card({ label, tip, onTip, right = null, hero = false, children }) {
  return (
    <section className={`${CARD} ${hero ? HERO_EDGE : CARD_EDGE}`} style={hero ? HERO_FILL : CARD_FILL} aria-label={label}>
      <div className="flex min-h-5 items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className={EYEBROW}>{label}</h2>
          {tip ? <InfoButton label={`About ${label.toLowerCase()}`} onPress={() => onTip(tip)} /> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/** A 44px picker field: what is picked, a chevron, or a lock while editing. */
function SelectField({ onPress, disabled, locked, label, children }) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled || locked}
      aria-haspopup="dialog"
      aria-label={label}
      className={`app-pressable flex h-11 w-full min-w-0 items-center gap-2 px-3 text-left ${FIELD} disabled:active:scale-100 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      {locked ? (
        <Lock size={14} className="shrink-0 text-[#717182]" aria-hidden />
      ) : (
        <ChevronDown size={16} className="shrink-0 text-[#8f90a1]" aria-hidden />
      )}
    </button>
  );
}

/** Production's MoneyField: digits only, clamped to `max`, the typed text kept while it parses. */
function AmountField({ value, onChange, prefix = "$", suffix, max, onMax, label, disabled = false }) {
  const v = Number.isFinite(value) && value > 0 ? value : 0;
  const [text, setText] = useState(() => (v === 0 ? "" : String(v)));
  useEffect(() => {
    // Mirror a value set from outside (the slider, Max) without fighting what is typed
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText((t) => (Number(t || 0) === v ? t : v === 0 ? "" : String(v)));
  }, [v]);
  const type = (raw) => {
    const s = raw.replace(/[,\s]/g, "");
    if (!/^\d*\.?\d*$/.test(s)) return;
    const n = s === "" ? 0 : Number(s);
    if (max !== undefined && n > max) {
      setText(max > 0 ? String(max) : "");
      onChange(max);
      return;
    }
    setText(s);
    onChange(n);
  };
  return (
    <div className={`flex h-11 items-center gap-1.5 px-3 ${FIELD} ${disabled ? "opacity-40" : ""}`}>
      {prefix ? <span className="text-[14px] font-medium leading-5 text-[#d6b06a]">{prefix}</span> : null}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        disabled={disabled}
        value={text}
        placeholder="0"
        aria-label={label}
        onChange={(e) => type(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[16px] font-medium leading-5 text-[#f0f0f0] outline-none placeholder:text-[#717182]"
      />
      {suffix ? <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.4px] text-[#717182]">{suffix}</span> : null}
      {onMax ? (
        <>
          <span className="h-5 w-px shrink-0 bg-white/[0.1]" aria-hidden />
          <button
            type="button"
            onClick={onMax}
            disabled={disabled}
            className="relative shrink-0 pl-1 text-[12px] font-semibold uppercase tracking-[0.3px] text-[#ccb17f] after:absolute after:-inset-3"
          >
            Max
          </button>
        </>
      ) : null}
    </div>
  );
}

function BreakdownRow({ label, note, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[12px] leading-4 text-[#bfbfbf]">{label}</p>
        <p className="text-[10px] leading-[13px] text-[#63646f]">{note}</p>
      </div>
      <p className="shrink-0 text-[12px] font-medium leading-4 text-[#f5f5f5]">{value}</p>
    </div>
  );
}

export default function MmSetupPage({ open, onClose, mm, onLogin, onDone }) {
  const toast = useAppToast();
  const { config, setConfig, overview, dex, editing, pending } = mm;
  const locked = editing !== null;
  // Functional, so two changes in one tick (a fast double tap) both land
  const patch = (p) => setConfig((c) => ({ ...c, ...p }));
  const [sheet, setSheet] = useState(null);
  const [tip, setTip] = useState(null);
  const [inputsOpen, setInputsOpen] = useState(false);

  const venue = overview.venues.find((v) => v.id === config.venueId) ?? null;
  const markets = overview.markets.filter((m) => m.venueId === config.venueId);
  const market = markets.find((m) => m.symbol === config.marketSymbol) ?? null;
  const strategy = overview.strategies.find((s) => s.id === config.strategyId) ?? null;
  const maxLev = maxLeverage(market);
  const ticks = leverageTicks(maxLev);
  const estimate = estimateVolume(config, strategy);
  const balanceMax = floorCents(dex.balance);
  const ceiling = cutoffCeiling(config.margin);
  const cut = effectiveCutoff(config);
  const [durMin, durMax] = DURATION_RANGE[config.durationUnit];

  const status = venue ? dex.status : "select-dex";
  const needsConnect = status === "connect-wallet" || status === "connect-dex";
  const blocked = blockingReason(config, {
    venue,
    market,
    isConnected: dex.isConnected,
    balance: dex.balance,
    isBalanceLoading: dex.isBalanceLoading,
  });
  const busy = status === "ready" && (pending === "create" || pending === "update");

  const cta =
    status === "connect-wallet"
      ? { label: "Connect wallet", icon: Wallet, onPress: onLogin }
      : status === "connect-dex"
        ? { label: `Connect ${config.venueId} wallet`, icon: Wallet, onPress: dex.connect, disabled: dex.isConnecting }
        : status === "ready"
          ? {
              label: busy ? (editing ? "Saving…" : "Activating…") : editing ? "Save changes" : "Activate agent",
              icon: busy ? LoaderCircle : null,
              spin: busy,
              disabled: Boolean(blocked) || busy,
              onPress: async () => {
                const wasEditing = Boolean(editing);
                const id = await mm.submit();
                if (!id) return;
                toast.show({ title: wasEditing ? "Changes saved." : "Strategy activated.", tone: "success", theme: "gold" });
                onDone(id);
              },
            }
          : { label: "Select a DEX", disabled: true };
  const hint =
    blocked && !needsConnect
      ? blocked
      : venue && market && config.strategyId
        ? `Quotes ${market.symbol} on ${venue.id} at ${config.leverage}x. Runs on HyprEarn infra, not in this browser.`
        : null;

  const pickVenue = (id) => {
    const same = overview.markets.find((m) => m.venueId === id && m.symbol === config.marketSymbol) ?? null;
    patch({ venueId: id, marketSymbol: same?.symbol ?? null, leverage: Math.max(1, Math.min(config.leverage, maxLeverage(same))) });
  };

  const footer = (
    <div className="flex flex-col gap-2">
      {hint ? <p className="text-center text-[11px] leading-[15px] text-[#8f90a1]" aria-live="polite">{hint}</p> : null}
      <Dn2Button variant="primary" size="lg" className="w-full" disabled={cta.disabled} onClick={cta.onPress}>
        {cta.icon ? <cta.icon size={16} className={cta.spin ? "animate-spin" : ""} aria-hidden /> : null}
        <span className="truncate">{cta.label}</span>
      </Dn2Button>
    </div>
  );

  return (
    <>
      <MmPage
        open={open}
        onClose={onClose}
        title={editing ? "Edit agent" : "Set up agent"}
        footer={footer}
      >
        {editing ? (
          <div className="flex flex-col gap-1 rounded-[12px] border border-[rgba(204,177,127,0.35)] bg-[rgba(204,177,127,0.06)] px-3.5 py-3">
            <p className="text-[13px] leading-[18px] text-[#f0ddb9]">
              Editing <span className="font-semibold">{editing.marketSymbol}</span> on {editing.venueId}
            </p>
            <p className="text-[11px] leading-[15px] text-[#8f90a1]">
              Only margin, leverage, cut-off and duration can change. Changes apply when you save.{" "}
              {editing.status === "running" ? "The agent keeps running meanwhile." : "It stays paused until you resume it."}
            </p>
          </div>
        ) : null}

        {/* Venue setup */}
        <Card label="Venue setup" hero>
          <SelectField label={`DEX venue: ${venue?.id ?? "none"}`} locked={locked} onPress={() => setSheet("venue")}>
            {venue ? (
              <>
                <span
                  className={`size-1.5 shrink-0 rounded-full ${dex.connectedVenues[venue.id] ? "bg-[#00d492]" : "bg-[#6b7280]"}`}
                  aria-hidden
                />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.05] bg-[#121212]">
                  <DexLogo dex={venue.id} className="h-4 w-4 rounded-full" />
                </span>
                <span className="truncate text-[14px] font-medium leading-[18px] text-[#dcdce8]">{venue.id}</span>
              </>
            ) : (
              <span className="text-[14px] leading-[18px] text-[#717182]">Select DEX</span>
            )}
          </SelectField>

          {venue && dex.isConnected ? (
            <>
              <div className={BAR}>
                <p className="flex min-w-0 flex-1 items-center justify-between gap-2 bg-[rgba(0,212,146,0.07)] px-3">
                  <span className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[rgba(134,239,172,0.8)]">
                    Balance
                  </span>
                  {dex.isBalanceLoading ? (
                    <LoaderCircle size={14} className="animate-spin text-[#00d492]" aria-label="Loading balance" />
                  ) : (
                    <span className="truncate text-[13px] font-semibold leading-4 text-[#86efac]">{usdFine(dex.balance)}</span>
                  )}
                </p>
                <button type="button" onClick={dex.deposit} className={BAR_ACTION}>
                  Deposit
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 px-0.5">
                <p className="flex min-w-0 items-center gap-1.5 text-[11px] leading-[14px] text-[#8f90a1]">
                  <Wallet size={12} className="shrink-0" aria-hidden />
                  <span className="truncate font-[ui-monospace,SF_Mono,Menlo,Consolas,monospace]">
                    {dex.walletAddress ? `${dex.walletAddress.slice(0, 6)}…${dex.walletAddress.slice(-4)}` : ""}
                  </span>
                </p>
                {!locked ? (
                  <button
                    type="button"
                    onClick={dex.changeWallet}
                    disabled={dex.isConnecting}
                    className="relative shrink-0 text-[11px] font-medium leading-[14px] text-[#f87171] after:absolute after:-inset-x-1 after:-inset-y-3 active:text-[#fca5a5]"
                  >
                    Change wallet
                  </button>
                ) : null}
              </div>
            </>
          ) : venue ? (
            <div className={BAR}>
              <p className="flex min-w-0 flex-1 items-center gap-2 bg-white/[0.02] px-3">
                <span className="size-1.5 shrink-0 rounded-full bg-[#6b7280]" aria-hidden />
                <span className="truncate text-[12px] leading-4 text-[#8f90a1]">Not connected</span>
              </p>
              <button type="button" disabled={dex.isConnecting} onClick={dex.connect} className={BAR_ACTION}>
                {dex.isConnecting ? <LoaderCircle size={13} className="animate-spin" aria-hidden /> : null}
                {dex.isConnecting ? "Connecting" : "Connect DEX"}
              </button>
            </div>
          ) : (
            <p className="text-[11px] leading-[15px] text-[#8f90a1]">Pick the venue you want to quote on. One venue at a time.</p>
          )}
        </Card>

        {/* Market */}
        <Card label="Market" tip={TIPS.market} onTip={setTip}>
          <SelectField
            label={`Market token: ${market?.symbol ?? "none"}`}
            locked={locked}
            disabled={!venue}
            onPress={() => setSheet("market")}
          >
            {market ? (
              <span className="truncate text-[14px] font-medium leading-[18px] text-[#dcdce8]">{market.symbol}</span>
            ) : (
              <span className="text-[14px] leading-[18px] text-[#717182]">Select token</span>
            )}
          </SelectField>
          <dl className={`${TILE} grid grid-cols-2`}>
            <div className="flex min-w-0 flex-col gap-1 px-3 py-2">
              <dt className={LABEL}>Min margin</dt>
              <dd className="text-[13px] font-medium leading-4 text-[#dcdce8]">{market ? usdFine(minMargin(market)) : "—"}</dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1 border-l border-white/[0.05] px-3 py-2">
              <dt className={LABEL}>Max lev</dt>
              <dd className="text-[13px] font-medium leading-4 text-[#dcdce8]">{market ? `${maxLeverage(market)}x` : "—"}</dd>
            </div>
          </dl>
        </Card>

        {/* Strategy */}
        <Card label="Strategy" tip={TIPS.strategy} onTip={setTip}>
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Strategy">
            {overview.strategies.map((s) => {
              const allowed = strategyAllowed(market, s.id);
              const on = s.id === config.strategyId;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!allowed || locked}
                  onClick={() => patch({ strategyId: s.id })}
                  className={`app-pressable flex w-full items-start gap-3 rounded-[12px] border p-3 text-left transition-colors disabled:active:scale-100 ${
                    on
                      ? "border-[rgba(214,176,106,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)]"
                      : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(26,25,23,0.98)_0%,rgba(13,12,11,0.98)_100%)]"
                  } ${!allowed ? "opacity-40" : locked && !on ? "opacity-50" : ""}`}
                >
                  <StrategyGlyph id={s.id} className={`mt-0.5 h-4 w-4 shrink-0 ${on ? "text-[#ccb17f]" : "text-[#8f90a1]"}`} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`text-[14px] font-semibold leading-[18px] ${on ? "text-[#f0ddb9]" : "text-[#dcdce8]"}`}>{s.name}</span>
                      {s.badge ? (
                        <span
                          className={`rounded-[6px] border px-1.5 py-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.08em] ${
                            on
                              ? "border-[rgba(120,90,40,0.55)] bg-[rgba(120,90,40,0.14)] text-[#e8d5b5]"
                              : "border-white/[0.08] text-[#717182]"
                          }`}
                        >
                          {s.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className={`text-[12px] leading-[17px] ${on ? "text-[#bfbfbf]" : "text-[#8f90a1]"}`}>
                      {allowed
                        ? (STRATEGY_LINE[s.id] ?? "Quotes both sides of the book and manages inventory.")
                        : `${market?.symbol} does not support this strategy on ${config.venueId}.`}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border ${
                      on ? "border-[#ccb17f]" : "border-white/25"
                    }`}
                    aria-hidden
                  >
                    {on ? <span className="size-2 rounded-full bg-[#ccb17f]" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Margin */}
        <Card
          label="Margin"
          tip={TIPS.margin}
          onTip={setTip}
          right={
            dex.isConnected ? (
              <button
                type="button"
                onClick={() => mm.setMargin(balanceMax)}
                className={`relative ${MAX_LABEL} after:absolute after:-inset-3`}
              >
                Max: {usdFine(balanceMax)}
              </button>
            ) : null
          }
        >
          <GoldRange
            size="md"
            value={Math.min(config.margin, balanceMax)}
            min={0}
            max={Math.max(1, balanceMax)}
            step={1}
            disabled={!dex.isConnected}
            onChange={mm.setMargin}
            ariaLabel="Margin"
            ariaValueText={usdFine(config.margin)}
          />
          <AmountField
            label="Margin in dollars"
            value={config.margin}
            max={balanceMax}
            disabled={!dex.isConnected}
            onChange={(v) => mm.setMargin(Math.max(0, v))}
          />
          <p className={DERIVED}>
            {!venue ? (
              "select a venue to read your balance"
            ) : !dex.isConnected ? (
              `connect your ${venue.id} account to read your balance`
            ) : dex.isBalanceLoading ? (
              `balance loading from ${venue.id}…`
            ) : (
              <>
                min {usdFine(minMargin(market))} · balance {usdFine(dex.balance)} · × {config.leverage}x ={" "}
                <span className="text-[#d4d4d8]">{usdFine(buyingPower(config))} buying power</span>
              </>
            )}
          </p>
        </Card>

        {/* Leverage */}
        <Card
          label="Leverage"
          tip={TIPS.leverage}
          onTip={setTip}
          right={
            <GroupToggle
              ariaLabel="Margin mode"
              className="w-[148px] shrink-0"
              disabled={locked}
              value={config.marginMode}
              onChange={(marginMode) => patch({ marginMode })}
              options={[
                { id: "cross", label: "Cross" },
                { id: "isolated", label: "Isolated" },
              ]}
            />
          }
        >
          <div className="flex items-start gap-3">
            {/* The ticks share the slider's column, so each sits under its own value, inside the track */}
            <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-3">
              <GoldRange
                size="md"
                value={Math.min(config.leverage, maxLev)}
                min={1}
                max={Math.max(1, maxLev)}
                onChange={(v) => patch({ leverage: v })}
                ariaLabel="Leverage"
                ariaValueText={`${config.leverage}x`}
              />
              <div className="relative h-3">
                {ticks.map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => patch({ leverage: v })}
                    style={{ left: `${((v - 1) / (maxLev - 1 || 1)) * 100}%` }}
                    className={`absolute top-0 text-[10px] leading-3 text-[#717182] after:absolute after:-inset-2 active:text-[#ccb17f] ${
                      i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
                    }`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
            </div>
            <span className={`flex h-11 w-[72px] shrink-0 items-center justify-center gap-1 ${FIELD}`}>
              <span className="text-[16px] leading-5 text-[#f0f0f0]">{Math.min(config.leverage, maxLev)}</span>
              <span className="text-[14px] font-medium leading-5 text-[#d6b06a]">x</span>
            </span>
          </div>
          <p className={DERIVED}>
            buying power ≈ {usdFine(buyingPower(config))} · max {maxLev}x
          </p>
        </Card>

        {/* Expected volume */}
        <Card label="Expected volume" tip={TIPS.volume} onTip={setTip}>
          {estimate ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[16px] font-medium leading-[22px] text-[#f0ddb9]">
                  {usdCompact(estimate.low)}
                  <span className="text-[13px] text-[#8f90a1]"> to </span>
                  {usdCompact(estimate.high)}
                </p>
                <span className="rounded-[6px] border border-white/[0.08] px-1.5 py-[3px] text-[9px] font-semibold uppercase leading-none tracking-[0.08em] text-[#717182]">
                  Estimate
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] leading-4 text-[#8f90a1]">
                  {estimate.perDay
                    ? "Per day, while the run stays active."
                    : `Over the ${config.durationValue} ${config.durationUnit === "hr" ? "hour" : "minute"} run.`}
                </p>
                <button
                  type="button"
                  aria-expanded={inputsOpen}
                  onClick={() => setInputsOpen((o) => !o)}
                  className="relative flex shrink-0 items-center gap-1 text-[12px] font-medium leading-4 text-[#ccb17f] after:absolute after:-inset-3"
                >
                  {inputsOpen ? "Hide inputs" : "Show inputs"}
                  {inputsOpen ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
                </button>
              </div>
              {inputsOpen ? (
                <div className={`${TILE} flex flex-col gap-2.5 p-3`}>
                  <BreakdownRow label="Margin" note="what you deploy" value={usdFine(estimate.margin)} />
                  <BreakdownRow label="Leverage" note="your setting" value={`${estimate.leverage}x`} />
                  <BreakdownRow label="Buying power" note="margin × leverage" value={usdFine(estimate.buyingPower)} />
                  <BreakdownRow
                    label="Volume rate"
                    note="traded for each $1 of buying power"
                    value={`${usdFine(estimate.ratePerUsdPerHour)} per hour`}
                  />
                  <p className="border-t border-white/[0.06] pt-2.5 text-[11px] leading-[15px] text-[#717182]">
                    Range is the midpoint plus or minus 20 percent. Every figure here is an estimate.
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-[12px] leading-[17px] text-[#8f90a1]">Set a strategy, a market and your margin to see an estimate.</p>
          )}
        </Card>

        {/* Cut-off */}
        <Card
          label="Cut-off"
          tip={TIPS.cutoff}
          onTip={setTip}
          right={
            <label className="flex items-center gap-2.5">
              <span className="text-[12px] leading-4 text-[#bfbfbf]">Stop on drawdown</span>
              <Switch checked={config.cutoffOn} onChange={(cutoffOn) => patch({ cutoffOn })} label="Stop on drawdown" />
            </label>
          }
        >
          {config.cutoffOn ? (
            <>
              <AmountField label="Cut-off in dollars" value={cut} max={ceiling} onChange={(v) => patch({ cutoff: Math.max(0, v) })} />
              <GoldRange
                size="md"
                value={cut}
                min={1}
                max={Math.max(2, ceiling)}
                onChange={(v) => patch({ cutoff: v })}
                ariaLabel="Cut-off"
                ariaValueText={usd(cut, 0)}
              />
              <p className="text-[12px] leading-[17px] text-[#8f90a1]">Halts and flattens {usd(cut, 0)} below start.</p>
            </>
          ) : (
            <p className="text-[12px] leading-[17px] text-[#8f90a1]">No custom floor added.</p>
          )}
        </Card>

        {/* Duration */}
        <Card
          label="Duration"
          right={
            <label className="flex items-center gap-2.5">
              <span className="text-[12px] leading-4 text-[#bfbfbf]">Stop after a set time</span>
              <Switch checked={config.durationOn} onChange={(durationOn) => patch({ durationOn })} label="Stop after a set time" />
            </label>
          }
        >
          {config.durationOn ? (
            <>
              <GroupToggle
                ariaLabel="Duration unit"
                value={config.durationUnit}
                onChange={(u) => u !== config.durationUnit && patch({ durationUnit: u, durationValue: UNIT_DEFAULT[u] })}
                options={[
                  { id: "min", label: "Minutes" },
                  { id: "hr", label: "Hours" },
                ]}
              />
              <AmountField
                label="Run length"
                prefix=""
                suffix={UNIT_WORD[config.durationUnit]}
                value={config.durationValue}
                onChange={(v) => patch({ durationValue: Math.max(0, v) })}
              />
              <GoldRange
                size="md"
                value={Math.min(Math.max(config.durationValue, durMin), durMax)}
                min={durMin}
                max={durMax}
                onChange={(v) => patch({ durationValue: v })}
                ariaLabel="Run length"
                ariaValueText={`${config.durationValue} ${UNIT_WORD[config.durationUnit]}`}
              />
              <p className="text-[12px] leading-[17px] text-[#8f90a1]">
                Flattens and stops after {config.durationValue} {UNIT_WORD[config.durationUnit]}.
              </p>
            </>
          ) : (
            <p className="text-[12px] leading-[17px] text-[#8f90a1]">No limit. The run continues until you press Pause.</p>
          )}
        </Card>
      </MmPage>

      <MmVenueSheet
        open={sheet === "venue"}
        onClose={() => setSheet(null)}
        venues={overview.venues}
        value={config.venueId}
        connectedVenues={dex.connectedVenues}
        blockedVenues={dex.blockedVenues}
        onSelect={pickVenue}
      />
      <MmMarketSheet
        open={sheet === "market"}
        onClose={() => setSheet(null)}
        markets={markets}
        categories={overview.categories}
        value={config.marketSymbol}
        onSelect={(m) => patch({ marketSymbol: m.symbol, leverage: Math.max(1, Math.min(config.leverage, maxLeverage(m))) })}
      />
      <InfoSheet open={tip !== null} onClose={() => setTip(null)} title={tip?.[0] ?? ""} body={tip?.[1] ?? ""} />
    </>
  );
}
