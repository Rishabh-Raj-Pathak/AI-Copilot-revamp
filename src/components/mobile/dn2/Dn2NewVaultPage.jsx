import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRight, Check, ChevronDown, Cookie, Wallet } from "lucide-react";
import { THEME_CATALOG } from "../../../delta-neutral/utils/markets.ts";
import {
  formatCompactUsd,
  formatCostPct,
  formatDuration,
  formatPct,
  formatSignedUsd,
  formatUsd,
} from "../../../delta-neutral/utils/format.ts";
import { formatWalletAddress } from "../../../delta-neutral/utils/wallet.ts";
import AppNavBar from "../AppNavBar.jsx";
import { useHistoryBack } from "../appHistory.js";
import { Divider, Dn2Button, GroupToggle, InfoButton, StackRow, TokenIcon, VenueDisc, VenueMark } from "./Dn2Ui.jsx";
import { LeverageField, MarginField } from "./Dn2SizeFields.jsx";
import { formatTokenPrice, tokenPrice, venueFunding, withMinus } from "./dn2Data.js";
import {
  CARD,
  CARD_EDGE,
  CARD_FILL,
  CHIP,
  CHIP_ON,
  EYEBROW,
  FIELD,
  FIELD_LABEL,
  HERO_EDGE,
  HERO_FILL,
  LABEL,
  TILE,
} from "./dn2Theme.js";

/**
 * Figma B1–B3 "New vault" (4493:30, 4494:2, 4494:257): the builder as a pushed
 * page. Web left → right order kept top → bottom — each output sits under the
 * inputs that drive it: Cross-DEX setup → Live rates for that pair, Size →
 * its estimates. The CTA is pinned in a footer above the home indicator.
 *
 * Stateless: `DeltaVaultBuilder` owns every value; `Dn2Builder` owns which
 * sheet is open. This file only lays the page out.
 */

const GREEN = "text-[#00d492]";
const RED = "text-[#e5484d]";
const MUTED = "text-[#717182]";

/** Figma "Venue Select" + balance row for one leg. */
function VenueBlock({
  label,
  dex,
  instrument,
  otherInstrument,
  connected,
  needsSession,
  balance,
  wallet,
  onOpen,
  onInstrument,
  onConnect,
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className={FIELD_LABEL}>{label}</p>
      <div className={`flex h-11 items-center gap-2 pl-2.5 pr-1.5 ${FIELD}`}>
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`${label}: ${dex || "none"}. Change venue`}
          className="flex min-w-0 flex-1 items-center gap-2 self-stretch text-left"
        >
          {dex ? (
            <VenueDisc dex={dex} size={28} logo={17} className="border border-white/[0.05]" />
          ) : null}
          <span className="truncate text-[14px] font-medium leading-[18px] text-[#dcdce8]">{dex || "Select venue"}</span>
          <ChevronDown size={14} className="shrink-0 text-[#8f90a1]" aria-hidden />
        </button>
        <div
          role="group"
          aria-label={`Instrument for ${label}`}
          className="flex shrink-0 gap-0.5 rounded-[8px] border border-white/[0.06] bg-black/35 p-0.5"
        >
          {["Perp", "Spot"].map((option) => {
            const on = instrument === option;
            // One leg has to stay short to hedge the other, and spot cannot be shorted.
            const blocked = option === "Spot" && otherInstrument === "Spot";
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                disabled={blocked}
                onClick={() => onInstrument(option)}
                className={`relative flex h-7 items-center justify-center rounded-[6px] border px-2.5 text-[12px] font-medium leading-4 transition-colors after:absolute after:-inset-y-2 after:inset-x-0 disabled:opacity-30 ${
                  on
                    ? "border-[rgba(173,134,73,0.56)] bg-[linear-gradient(180deg,rgba(42,34,25,0.98)_0%,rgba(20,16,12,0.99)_100%)] text-[#f0ddb9]"
                    : "border-transparent text-[#8f90a1]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      {connected ? (
        <div className="flex items-center justify-between gap-3 whitespace-nowrap px-0.5">
          <p className="flex items-center gap-1.5 font-medium">
            <span className="text-[10px] uppercase leading-[14px] tracking-[0.4px] text-[#717182]">Balance</span>
            <span className={`text-[12px] leading-4 ${GREEN}`}>{formatCompactUsd(balance)}</span>
          </p>
          <p className="truncate text-[11px] leading-[14px] text-[#717182]">
            {wallet ? formatWalletAddress(wallet) : "Wallet linked"}
          </p>
        </div>
      ) : dex ? (
        <div className="flex items-center justify-between gap-3 px-0.5">
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 shrink-0 rounded-full bg-[#6b7280]" aria-hidden />
            <span className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]">
              Not connected
            </span>
          </p>
          <Dn2Button variant="small" size="sm" onClick={onConnect}>
            {needsSession ? "Set up" : "Connect DEX"}
          </Dn2Button>
        </div>
      ) : null}
    </div>
  );
}

function SetupCard({ p }) {
  const tokens = p.market.mode === "tokens";
  const selectedThemes = THEME_CATALOG.filter((t) => p.market.themes.includes(t.value));
  return (
    <section className={`${CARD} ${HERO_EDGE}`} style={HERO_FILL} aria-label="Cross-DEX setup">
      <p className={EYEBROW}>Cross-DEX setup</p>
      <VenueBlock label="Venue A" {...p.venueProps("a")} />
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-[rgba(120,90,40,0.35)]" aria-hidden />
        <button
          type="button"
          onClick={p.onSwapVenues}
          disabled={!p.dexA || !p.dexB}
          aria-label="Swap Venue A and Venue B"
          className="app-pressable relative flex size-6 shrink-0 items-center justify-center rounded-full border border-[rgba(120,90,40,0.5)] bg-[#121212] text-[#ccb17f] after:absolute after:-inset-2.5 disabled:opacity-50"
        >
          <ArrowLeftRight size={12} aria-hidden />
        </button>
        <span className="h-px flex-1 bg-[rgba(120,90,40,0.35)]" aria-hidden />
      </div>
      <VenueBlock label="Venue B" {...p.venueProps("b")} />
      {p.showPairWarning ? (
        <p className={`text-[11px] leading-[15px] ${RED}`}>Pick two different venues to unlock the cross-venue spread.</p>
      ) : null}
      <Divider />

      <div className="flex flex-col gap-2">
        <p className={FIELD_LABEL}>Market</p>
        <GroupToggle
          ariaLabel="Market mode"
          value={p.market.mode}
          onChange={p.onModeChange}
          disabled={p.marketDisabled}
          options={[
            { id: "tokens", label: "Tokens" },
            { id: "themes", label: "Categories" },
          ]}
        />
        {tokens ? (
          // One control: the coin, its pair and price, and the caret that says it opens the picker.
          <button
            type="button"
            disabled={p.marketDisabled}
            onClick={p.onOpenMarket}
            aria-haspopup="dialog"
            aria-label={`Market pair: ${p.market.token}. Change pair`}
            className={`flex h-11 w-full items-center gap-2 pl-2.5 pr-2 text-left disabled:opacity-50 ${FIELD}`}
          >
            <TokenIcon pair={p.market.token} size={24} />
            <span className="flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap">
              <span className="text-[15px] font-medium leading-5 text-[#e8d5b5]">{p.market.token}</span>
              <span className="truncate text-[12px] leading-4 text-[#8f90a1]">
                {formatTokenPrice(tokenPrice(p.market.token))}
              </span>
            </span>
            <ChevronDown size={14} className="shrink-0 text-[#8f90a1]" aria-hidden />
          </button>
        ) : (
          <>
            <div
              role="group"
              aria-label="Market categories. Pick one or more."
              className={`grid grid-cols-3 gap-1 rounded-[12px] border border-white/[0.09] bg-[rgba(10,10,11,0.94)] p-1 ${
                p.marketDisabled ? "opacity-50" : ""
              }`}
            >
              {THEME_CATALOG.map(({ value: theme, icon: Icon }) => {
                const on = p.market.themes.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    aria-pressed={on}
                    disabled={p.marketDisabled}
                    onClick={() =>
                      p.onThemesChange(on ? p.market.themes.filter((x) => x !== theme) : [...p.market.themes, theme])
                    }
                    className={`${CHIP} app-pressable min-w-0 justify-center gap-1.5 ${
                      on ? CHIP_ON : "border-transparent font-medium text-[#9a9ba8]"
                    }`}
                  >
                    {on ? <Check size={12} aria-hidden /> : <Icon size={13} aria-hidden />}
                    <span className="truncate">{theme}</span>
                  </button>
                );
              })}
            </div>
            {selectedThemes.length ? (
              <dl className={`${TILE} flex flex-col gap-2 px-3 py-2.5`}>
                {selectedThemes.map((t) => (
                  <div key={t.value} className="flex flex-col gap-0.5">
                    <dt className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#ccb17f]">
                      {t.value}
                    </dt>
                    <dd className="text-[12px] leading-4 text-[#8f90a1]">{t.description}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-[11px] leading-[15px] text-[#8d8e99]">Pick one or more categories to trade.</p>
            )}
          </>
        )}
        {p.marketDisabled ? (
          <p className="text-[11px] leading-[15px] text-[#8d8e99]">Pick both venues to unlock the market.</p>
        ) : null}
      </div>
    </section>
  );
}

/** Figma "Live Rates" (4493:119) — what the picked pair pays, per venue. */
function LiveRatesCard({ p }) {
  const { summary, metrics, legSlippage, dexA, dexB } = p;
  const venues = [dexA, dexB].filter(Boolean);
  const apyValid = Boolean(summary?.valid);
  const apy = apyValid ? formatPct(summary.netAprOnCapitalPct) : "—";
  const apyTone = apyValid && summary.netAprOnCapitalPct > 0 ? GREEN : RED;

  return (
    <section className={`${CARD} ${CARD_EDGE}`} style={CARD_FILL} aria-label="Live rates">
      <div className="flex items-center justify-between gap-3 whitespace-nowrap text-[11px] leading-[14px]">
        <p className={EYEBROW}>Live rates</p>
        <p className="truncate text-[#8f90a1]">
          {p.market.token} · {venues.join(" ⇄ ")}
        </p>
      </div>
      <div className="flex items-end justify-between gap-3 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <p className={LABEL}>APY</p>
          <p className={`text-[24px] font-semibold leading-[30px] ${apyTone}`}>{apy}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 font-medium">
          <p className={LABEL}>Funding settlement</p>
          <p className="text-[14px] leading-[18px] text-[#ccb17f]">{metrics.fundingSettlement}</p>
        </div>
      </div>
      <Divider />
      <dl className="flex flex-col gap-3">
        <RateRow label="Current spread" value={per8h(metrics.currentSpread)} tone={metrics.spreadPositive ? GREEN : RED} />
        <RateRow label="Max funding spread" value={per8h(metrics.maxFundingSpread)} tone={RED} />
        <RateRow
          label="Hedge integrity"
          value={metrics.hedgeIntegrity === "–" ? "—" : metrics.hedgeIntegrity}
          tone="text-[#dcdce8]"
        />
      </dl>
      <Divider />
      {/* Per venue, side by side: the two rates the spread is the gap between. */}
      <div className="flex flex-col gap-[9px]" role="table" aria-label="Rates per venue">
        <div className="flex items-center gap-2" role="row">
          <span className="w-[84px] shrink-0" role="columnheader" aria-label="Figure" />
          {venues.map((dex) => (
            <span key={dex} role="columnheader" className="flex min-w-0 flex-1 items-center justify-end gap-[5px]">
              <VenueMark dex={dex} size={12} />
              <span className="truncate text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#8f90a1]">
                {dex}
              </span>
            </span>
          ))}
        </div>
        <VenueRow label="Funding" cells={venues.map((dex) => ({ key: dex, value: venueFunding(dex).funding }))} />
        <VenueRow
          label="APY"
          cells={venues.map((dex) => {
            const rate = venueFunding(dex);
            return { key: dex, value: rate.aprLabel, tone: rate.apr >= 0 ? GREEN : RED };
          })}
        />
        <VenueRow
          label="Slippage"
          cells={venues.map((dex) => {
            const leg = summary?.valid ? legSlippage?.[dex] : null;
            return {
              key: dex,
              value: leg ? `${formatCostPct(leg.pct)} · ${formatUsd(leg.usd)}` : "—",
              tone: leg ? undefined : MUTED,
            };
          })}
        />
      </div>
    </section>
  );
}

function VenueRow({ label, cells }) {
  return (
    <div className="flex items-center gap-2" role="row">
      <span role="rowheader" className={`w-[84px] shrink-0 ${LABEL}`}>
        {label}
      </span>
      {cells.map((cell) => (
        <span
          key={cell.key}
          role="cell"
          className={`min-w-0 flex-1 truncate text-right text-[12px] leading-4 ${cell.tone ?? "text-[#dcdce8]"}`}
        >
          {cell.value}
        </span>
      ))}
    </div>
  );
}

/** Spreads are quoted per 8h on the web strip; "—" stays bare. */
function per8h(value) {
  return value === "—" ? value : `${value} / 8h`;
}

function RateRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={LABEL}>{label}</dt>
      <dd className={`text-right text-[12px] leading-4 ${tone}`}>{withMinus(value)}</dd>
    </div>
  );
}

/** Figma "Size" (4493:168) — margin, leverage, then what they produce. */
function SizeCard({ p }) {
  const { summary } = p;
  const valid = Boolean(summary?.valid);
  const pctOfNotional = valid && summary.notionalUsd > 0 ? (summary.costToOpenUsd.total / summary.notionalUsd) * 100 : 0;
  return (
    <section className={`${CARD} ${CARD_EDGE}`} style={CARD_FILL} aria-label="Size">
      <p className={EYEBROW}>Size</p>
      <MarginField
        percent={p.percent}
        amount={p.amount}
        maxAmount={p.maxAmount}
        onPercentChange={p.onPercentChange}
        onAmountChange={p.onAmountChange}
        disabled={p.marginOff}
        onInfo={() => p.onInfo("margin")}
      />
      <LeverageField
        leverage={p.leverage}
        min={p.minLeverage}
        max={p.maxLeverage}
        onChange={p.onLeverageChange}
        disabled={p.leverageDisabled}
        onInfo={() => p.onInfo("leverage")}
      />
      <Divider />
      <dl className="flex flex-col gap-2.5">
        <StackRow
          label="Est. income"
          value={valid ? withMinus(`${formatSignedUsd(summary.incomeUsd.daily)} /day`) : "—"}
          sub={valid ? withMinus(`≈ ${formatSignedUsd(summary.incomeUsd.monthly)} / 30d`) : null}
          tone={valid ? (summary.incomeUsd.daily >= 0 ? GREEN : RED) : MUTED}
        />
        <StackRow
          label="Break-even"
          value={valid ? formatDuration(summary.breakEvenDays) : "—"}
          sub={valid ? `${formatUsd(summary.roundTripCostUsd.total)} round-trip` : null}
          tone={valid ? "text-[#ccb17f]" : MUTED}
        />
        <StackRow
          label="Cost to open"
          aside={<InfoButton label="How cost to open adds up" onPress={p.onOpenCost} />}
          value={valid ? formatUsd(summary.costToOpenUsd.total) : "—"}
          sub={valid ? `${formatCostPct(pctOfNotional)} of notional` : null}
          tone={valid ? "text-[#dcdce8]" : MUTED}
        />
      </dl>
    </section>
  );
}

/**
 * App toasts float above the tab bar; this page hides it behind a pinned
 * footer, so while it is open they clear the footer instead (the delete
 * flow's rule).
 */
function useToastClearsFooter(footerRef, active) {
  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!active || !footer || typeof ResizeObserver === "undefined") return undefined;
    const root = document.documentElement;
    const sync = () => root.style.setProperty("--app-toast-bottom", `${footer.offsetHeight + 12}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(footer);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--app-toast-bottom");
    };
  }, [footerRef, active]);
}

export default function Dn2NewVaultPage({ open, onClose, cta, ...p }) {
  const reduceMotion = useReducedMotion();
  const footerRef = useRef(null);
  useHistoryBack(open, onClose);
  useToastClearsFooter(footerRef, open);

  if (typeof document === "undefined") return null;
  const CtaIcon = cta.icon === "wallet" ? Wallet : cta.icon === "cookie" ? Cookie : null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="dn2-new-vault"
          role="dialog"
          aria-modal="true"
          aria-label="New vault"
          className="fixed inset-0 z-[60] flex flex-col bg-black text-white proportional-nums tablet:hidden"
          initial={{ x: reduceMotion ? 0 : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: reduceMotion ? 0 : "100%" }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 34, stiffness: 340, mass: 0.9 }}
        >
          <AppNavBar title="New vault" onBack={onClose} />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <div className="flex flex-col gap-3 px-5 pb-6 pt-4 max-[374px]:px-4">
              <SetupCard p={p} />
              {p.market.mode === "tokens" ? <LiveRatesCard p={p} /> : null}
              <SizeCard p={p} />
            </div>
          </div>
          <footer
            ref={footerRef}
            className="shrink-0 border-t border-white/[0.06] bg-black px-5 pb-[var(--app-safe-bottom)] pt-3 max-[374px]:px-4"
          >
            <Dn2Button variant="primary" size="lg" className="w-full" disabled={cta.disabled} onClick={cta.onPress}>
              {CtaIcon ? <CtaIcon size={16} aria-hidden /> : null}
              <span className="truncate">{cta.label}</span>
            </Dn2Button>
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

