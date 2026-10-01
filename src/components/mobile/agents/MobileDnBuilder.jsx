import { useState } from "react";
import AppIcon from "../AppIcon.jsx";
import BottomSheet from "../BottomSheet.jsx";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { appIcons } from "../mobileAssets.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import { formatCompactUsd } from "../../../delta-neutral/utils/format.ts";
import { formatWalletAddress } from "../../../delta-neutral/utils/wallet.ts";
import DnTokenSheet from "./DnTokenSheet.jsx";
import DnVenueSheet from "./DnVenueSheet.jsx";
import GoldRange from "./GoldRange.jsx";
import { DN_VENUE_CHAINS, DN_VENUE_LOGOS } from "./agentsTheme.js";

/**
 * Phone layout of the Delta Neutral builder — Figma "Cross-DEX Setup" (951:4087)
 * and "Controls" (952:4088) on "Agents / Delta Neutral — Full Page".
 *
 * Stateless: every value and handler comes from `DeltaVaultBuilder`, which
 * keeps owning the venue, leg, market, sizing and activation logic for both
 * Delta Neutral versions. This file only decides how it looks on a phone.
 *
 * A venue only counts as connected while the app wallet is — the builder's
 * mock venue sessions describe a wallet, so with none connected the legs read
 * "Connect DEX" and the CTA asks for the wallet first, as in Figma.
 */

const SETUP_CARD_FILL = {
  backgroundImage:
    "radial-gradient(112px 119px at 134px 71px, rgba(214,177,107,0.08) 0%, rgba(0,0,0,0) 58%), linear-gradient(180deg, rgba(14,13,12,0.9) 0%, rgba(10,10,10,0.96) 100%)",
};

/** "Connect DEX" chip and the big CTA share this fill (Figma 951:4106, 952:4131). */
const BRONZE_CHIP_FILL =
  "bg-[linear-gradient(180deg,rgba(42,34,25,0.98)_0%,rgba(20,16,12,0.99)_100%)]";

const CONTROL_CARD =
  "flex flex-col rounded-[11px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,12,10,0.88)_0%,rgba(9,9,10,0.93)_100%)] px-[13px] pb-[13px] pt-4";

const INPUT_WELL =
  "rounded-[10px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,18,19,0.98)_0%,rgba(11,11,12,0.99)_100%)]";

/** Top Picks has no chip glyph in Figma (it shows the check when picked), so it borrows the trophy. */
const THEME_GLYPHS = {
  "Top Picks": { icon: appIcons.trophy14 },
  Bluechip: { icon: appIcons.chipBluechip },
  Stocks: { icon: appIcons.chipStocks },
  Commodities: { icon: appIcons.dnCommodities12, tint: "text-[#efeff0]" },
  Meme: { icon: appIcons.dnMeme12 },
  // Full-colour mark (USDC blue) — drawn as an image, not through the mask.
  FX: { image: appIcons.dnFx12 },
};

function StatusDot({ connected }) {
  return (
    <span
      className={`size-1.5 shrink-0 rounded-full ${connected ? "bg-[#4ade80]" : "bg-[#6b7280]"}`}
      aria-hidden
    />
  );
}

function InfoButton({ label, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      aria-haspopup="dialog"
      className="app-pressable relative flex size-5 shrink-0 items-center justify-center rounded-full border border-[rgba(204,177,127,0.4)] bg-[rgba(204,177,127,0.1)] text-[#ccb17f] after:absolute after:-inset-3"
    >
      <AppIcon src={appIcons.info14} size={12} />
    </button>
  );
}

function ControlLabel({ children, infoLabel, onInfo }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-[11px] uppercase leading-[13px] tracking-[0.6px] text-[#9c9cac]">{children}</p>
      <InfoButton label={infoLabel} onPress={onInfo} />
    </div>
  );
}

/**
 * Digits typed into a field the builder clamps. The draft lets the user clear
 * the field mid-edit; the committed value is the builder's.
 */
function useDraft(committed) {
  const [draft, setDraft] = useState(null);
  return {
    value: draft ?? committed,
    edit: setDraft,
    reset: () => setDraft(null),
  };
}

function DexSlot({
  label,
  aside,
  value,
  connected,
  balance,
  wallet,
  instrument,
  otherInstrument,
  onOpenVenue,
  onInstrument,
  onConnect,
  onDeposit,
  onChangeWallet,
}) {
  const logo = DN_VENUE_LOGOS[value];
  const chain = DN_VENUE_CHAINS[value];

  return (
    <div className="flex flex-col gap-2 rounded-[11px] border border-white/[0.08] bg-[rgba(10,10,12,0.84)] p-3">
      <div className="flex items-center justify-between gap-2 uppercase">
        <p className="text-[10px] font-semibold leading-[11px] tracking-[1.2px] text-[#8f90a1]">{label}</p>
        {aside ? (
          <p className="truncate text-[9px] leading-[10px] tracking-[0.7px] text-[#6b7280]">{aside}</p>
        ) : null}
      </div>

      {/* Venue and the book it trades on are one decision, so one fused field. */}
      <div className="flex items-center gap-1 overflow-hidden rounded-[10px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(19,19,21,0.96)_0%,rgba(11,11,13,0.98)_100%)]">
        <button
          type="button"
          onClick={onOpenVenue}
          aria-haspopup="dialog"
          aria-label={`${label}: ${value || "none selected"}. Change venue`}
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-3 py-[13px] text-left transition-colors active:bg-white/[0.04]"
        >
          {/* Figma clips the trailing caret rather than truncating the name (951:4114). */}
          <StatusDot connected={connected} />
          {logo ? <img alt="" src={logo} className="size-4 shrink-0 object-contain" /> : null}
          <span className="shrink-0 whitespace-nowrap text-[14px] leading-4 text-[#9ca3af]">
            {value || "Select DEX"}
          </span>
          {chain ? (
            <span className="shrink-0 rounded-[4px] bg-[rgba(120,80,40,0.3)] px-1.5 py-0.5 text-[9px] font-medium uppercase leading-[10px] tracking-[0.5px] text-[#d4a76a]">
              {chain}
            </span>
          ) : null}
          <AppIcon src={appIcons.caretDown16} size={16} className="text-[rgba(227,202,156,0.76)]" />
        </button>
        <span className="h-[43px] w-px shrink-0 bg-white/[0.09]" aria-hidden />
        <div
          role="group"
          aria-label={`Instrument for ${label}`}
          className="flex shrink-0 items-center gap-px pl-1 pr-[5px]"
        >
          {["Perp", "Spot"].map((option) => {
            const active = instrument === option;
            // One leg must stay short to hedge the other, and spot cannot be shorted.
            const blocked = option === "Spot" && otherInstrument === "Spot";
            return (
              <button
                key={option}
                type="button"
                disabled={blocked}
                aria-pressed={active}
                onClick={() => onInstrument(option)}
                className={`relative flex h-[26px] w-[58px] items-center justify-center rounded-[7px] border text-[11px] font-semibold uppercase leading-[13px] tracking-[0.6px] transition-colors after:absolute after:-inset-y-2.5 after:inset-x-0 disabled:opacity-30 ${
                  active
                    ? `border-[rgba(173,134,73,0.56)] text-[#f0ddb9] ${BRONZE_CHIP_FILL}`
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
        <>
          <div className="flex items-center gap-2">
            <div className="flex h-[38px] min-w-0 items-center gap-2 rounded-[10px] border border-[rgba(74,222,128,0.18)] bg-[rgba(74,222,128,0.08)] px-[14px]">
              <StatusDot connected />
              <span className="text-[10px] font-semibold uppercase leading-3 tracking-[0.7px] text-[#9de7b5]">
                Balance
              </span>
              <span className="truncate text-[12px] font-medium leading-3 text-[#4ade80]">
                {formatCompactUsd(balance)}
              </span>
            </div>
            <button
              type="button"
              onClick={onDeposit}
              className={`app-pressable flex h-[38px] shrink-0 items-center rounded-[10px] border border-white/10 px-[14px] text-[10px] font-semibold uppercase leading-3 tracking-[0.7px] text-[#c2ab80] ${BRONZE_CHIP_FILL}`}
            >
              Deposit
            </button>
          </div>
          <div className="flex items-center gap-2 border-t border-white/[0.06] pt-2">
            <AppIcon src={appIcons.wallet20} size={14} className="text-[#82838f]" />
            <span className="min-w-0 flex-1 truncate font-app-mono text-[11px] text-[#b9bac6]">
              {wallet ? formatWalletAddress(wallet) : "Wallet linked"}
            </span>
            <button
              type="button"
              onClick={onChangeWallet}
              className="app-pressable -my-2 shrink-0 rounded-md px-1.5 py-2 text-[11px] font-medium text-[#e06a6a]"
            >
              Change wallet
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={!value}
          onClick={onConnect}
          className={`app-pressable flex h-[38px] items-center gap-2 self-start rounded-[10px] border border-white/10 px-[14px] disabled:opacity-50 ${BRONZE_CHIP_FILL}`}
        >
          <StatusDot connected={false} />
          <span className="text-[10px] font-semibold uppercase leading-3 tracking-[0.7px] text-[#7f8090]">
            Connect DEX
          </span>
        </button>
      )}
    </div>
  );
}

export default function MobileDnBuilder({
  dexOptions,
  dexA,
  dexB,
  onDexAChange,
  onDexBChange,
  legA,
  legB,
  onLegInstrumentChange,
  dexConnected,
  dexBalances,
  dexWallets,
  onConnectDex,
  onDepositDex,
  onChangeWalletDex,
  market,
  marketDisabled,
  structure,
  themeCatalog,
  metrics,
  onModeChange,
  onThemesChange,
  onTokenChange,
  amount,
  percent,
  maxAmount,
  marginDisabled,
  marginInfo,
  onAmountChange,
  onPercentChange,
  leverage,
  minLeverage,
  maxLeverage,
  leverageDisabled,
  leverageInfo,
  onLeverageChange,
  showPairWarning,
  primaryLabel,
  primaryDisabled,
  onPrimary,
}) {
  const app = useMobileApp();
  const toast = useAppToast();
  const [venueSlot, setVenueSlot] = useState(null);
  const [tokenSheetOpen, setTokenSheetOpen] = useState(false);
  const [info, setInfo] = useState(null);
  /** Set when the wallet sheet was opened to connect a venue; `true` for the CTA. */
  const [connectFor, setConnectFor] = useState(null);

  const walletOn = app.walletConnected;
  const isConnected = (dex) => Boolean(dex) && walletOn && Boolean(dexConnected[dex]);

  const percentDraft = useDraft(String(percent));
  const leverageDraft = useDraft(String(leverage));

  const connectVenue = (dex) => {
    onConnectDex(dex);
    // Variational authenticates in its own modal; the rest connect on the spot.
    if (dex !== "Variational") {
      toast.show({ title: `${dex} connected`, message: "This leg is ready to fund.", tone: "success" });
    }
  };

  const requestVenue = (dex) => {
    if (!dex) return;
    if (!walletOn) {
      setConnectFor(dex);
      return;
    }
    connectVenue(dex);
  };

  const slotProps = (slot) => {
    const value = slot === "a" ? dexA : dexB;
    return {
      value,
      connected: isConnected(value),
      balance: value ? dexBalances[value] : 0,
      wallet: value ? dexWallets[value] : null,
      instrument: slot === "a" ? legA : legB,
      otherInstrument: slot === "a" ? legB : legA,
      onOpenVenue: () => setVenueSlot(slot),
      onInstrument: (option) => onLegInstrumentChange(slot, option),
      onConnect: () => requestVenue(value),
      onDeposit: () => {
        onDepositDex(value);
        toast.show({ title: "Deposit added", message: `$500 added to your ${value} balance.`, tone: "success" });
      },
      onChangeWallet: () => onChangeWalletDex(value),
    };
  };

  // Margin is sized against venue balances, which only exist behind a wallet.
  const marginOff = marginDisabled || !walletOn;
  const ctaNeedsWallet = !walletOn;
  const ctaDisabled = ctaNeedsWallet ? false : primaryDisabled;

  return (
    <div className="flex flex-col gap-4">
      <section
        className="flex flex-col gap-3 overflow-hidden rounded-[14px] border border-[rgba(214,177,107,0.22)] p-4"
        style={SETUP_CARD_FILL}
      >
        <p className="text-[11px] font-semibold uppercase leading-[13px] tracking-[1.3px] text-[rgba(227,202,156,0.82)]">
          Cross-DEX Setup
        </p>
        <DexSlot label="Select Dex 1" {...slotProps("a")} />
        <DexSlot label="Select Dex 2" aside="Can use different wallet" {...slotProps("b")} />
        {showPairWarning ? (
          <p className="font-app-mono text-[11px] text-[#f87171]">
            Select two different DEX sources to unlock cross-venue spread.
          </p>
        ) : null}

        <p className="text-[11px] uppercase leading-[13px] tracking-[1.2px] text-[#8f90a1]">Market</p>
        <div
          className={`flex self-start rounded-[10px] border border-white/[0.09] bg-[rgba(10,10,11,0.94)] p-1 ${
            marketDisabled ? "opacity-50" : ""
          }`}
          role="tablist"
          aria-label="Market mode"
        >
          {["themes", "tokens"].map((mode) => {
            const active = market.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={marketDisabled}
                onClick={() => onModeChange(mode)}
                className={`relative rounded-lg px-3 py-1.5 text-[11px] font-semibold leading-[14px] tracking-[0.3px] transition-colors after:absolute after:-inset-y-2 after:inset-x-0 ${
                  active
                    ? "bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9]"
                    : "text-[#7f8090]"
                }`}
              >
                {mode === "themes" ? "Categories" : "Tokens"}
              </button>
            );
          })}
        </div>

        {market.mode === "themes" ? (
          <div
            role="group"
            aria-label="Market categories. Select one or more."
            className={`grid grid-cols-3 gap-1 rounded-[10px] border border-white/[0.09] bg-[rgba(10,10,11,0.94)] p-1 ${
              marketDisabled ? "opacity-50" : ""
            }`}
          >
            {themeCatalog.map(({ value: theme }) => {
              const selected = market.themes.includes(theme);
              const glyph = THEME_GLYPHS[theme] ?? {};
              return (
                <button
                  key={theme}
                  type="button"
                  disabled={marketDisabled}
                  aria-pressed={selected}
                  onClick={() =>
                    onThemesChange(
                      selected ? market.themes.filter((x) => x !== theme) : [...market.themes, theme],
                    )
                  }
                  className={`app-pressable flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border text-[12px] font-semibold leading-[14px] tracking-[0.2px] ${
                    selected
                      ? "border-[rgba(214,177,107,0.62)] bg-[linear-gradient(180deg,rgba(73,56,31,0.92)_0%,rgba(35,28,19,0.95)_100%)] text-[#f0ddb9]"
                      : "border-transparent text-[#9a9ba8]"
                  }`}
                >
                  {selected ? (
                    <AppIcon src={appIcons.check12} size={12} />
                  ) : glyph.image ? (
                    <img alt="" src={glyph.image} className="size-3 shrink-0" />
                  ) : glyph.icon ? (
                    <AppIcon src={glyph.icon} size={12} className={glyph.tint ?? ""} />
                  ) : null}
                  <span className="truncate">{theme}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={marketDisabled}
              onClick={() => setTokenSheetOpen(true)}
              aria-haspopup="dialog"
              aria-label={`Market pair: ${market.token}. Change pair`}
              className="flex h-12 items-center justify-between gap-2 rounded-[10px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(19,19,21,0.96)_0%,rgba(11,11,13,0.98)_100%)] px-3 text-left transition-colors active:bg-white/[0.04] disabled:opacity-50"
            >
              <span className="truncate text-[14px] leading-4 text-[#f5f5f5]">{market.token}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.75px] text-[#838492]">{structure}</span>
                <AppIcon src={appIcons.caretDown16} size={16} className="text-[rgba(227,202,156,0.76)]" />
              </span>
            </button>
            {!marketDisabled && metrics?.length ? (
              <dl className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-[rgba(214,176,106,0.16)] bg-[#080808]">
                {metrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`flex min-w-0 flex-col gap-1 px-2.5 py-2 ${index > 0 ? "border-l border-white/[0.07]" : ""}`}
                  >
                    <dt className="line-clamp-2 min-h-[22px] text-[9px] uppercase leading-[11px] tracking-[0.6px] text-[#838492]">
                      {metric.label}
                    </dt>
                    <dd className={`truncate text-[13px] font-medium leading-4 ${metric.tone ?? "text-[#e8d5b5]"}`}>
                      {metric.value}
                    </dd>
                    <dd className="truncate text-[9px] leading-[11px] text-[#6b7280]">{metric.sub ?? " "}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        )}

        {marketDisabled ? (
          <p className="text-[11px] leading-relaxed text-[#7d7e88]">
            Select a DEX on both venues to unlock category and token controls.
          </p>
        ) : null}
      </section>

      <section className={`${CONTROL_CARD} gap-[14px]`} aria-label="Margin">
        <ControlLabel infoLabel="About margin" onInfo={() => setInfo("margin")}>
          Margin
        </ControlLabel>
        <div className="px-2.5">
          <GoldRange
            value={percent}
            onChange={onPercentChange}
            disabled={marginOff}
            ariaLabel="Margin, percent of max"
            ariaValueText={`${percent}%`}
          />
        </div>
        <div className={`flex items-center py-3 ${INPUT_WELL} ${marginOff ? "opacity-30" : ""}`}>
          <label className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <span className="text-[14px] font-medium leading-4 text-[#d6b06a]">%</span>
            <input
              type="text"
              inputMode="numeric"
              disabled={marginOff}
              value={percentDraft.value}
              aria-label="Margin percent of max"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                percentDraft.edit(v);
                if (v !== "") onPercentChange(Math.min(100, Number(v)));
              }}
              onBlur={percentDraft.reset}
              className="w-[3.2ch] min-w-0 bg-transparent text-[16px] leading-4 text-[#f0f0f0] outline-none"
            />
          </label>
          <span className="h-5 w-px shrink-0 bg-white/[0.28]" aria-hidden />
          <label className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <span className="text-[14px] font-medium leading-4 text-[#d6b06a]">$</span>
            <input
              type="text"
              inputMode="decimal"
              disabled={marginOff}
              value={amount}
              placeholder="0"
              aria-label="Margin in USD"
              onChange={(e) => onAmountChange(e.target.value.replace(/,/g, ""))}
              className="w-[7ch] min-w-0 bg-transparent text-[16px] font-semibold leading-4 tracking-[0.225px] text-[#ccb17f] outline-none placeholder:text-[#ccb17f]"
            />
          </label>
          <span className="h-5 w-px shrink-0 bg-white/[0.28]" aria-hidden />
          <button
            type="button"
            disabled={marginOff}
            onClick={() => onAmountChange(String(maxAmount))}
            className="flex min-h-11 min-w-0 flex-1 items-center justify-center -my-3 text-[9px] font-semibold uppercase leading-[10px] tracking-[0.225px] text-[#ccb17f]"
          >
            Max: {Number(maxAmount).toLocaleString()}
          </button>
        </div>
      </section>

      <section className={`${CONTROL_CARD} gap-2.5`} aria-label="Leverage">
        <ControlLabel infoLabel="About leverage" onInfo={() => setInfo("leverage")}>
          Leverage
        </ControlLabel>
        <div className="flex items-center gap-5 pl-2.5">
          <GoldRange
            className="flex-1"
            value={leverage}
            min={minLeverage}
            max={maxLeverage}
            onChange={onLeverageChange}
            disabled={leverageDisabled}
            ariaLabel="Leverage"
            ariaValueText={`${leverage}x`}
          />
          <label
            className={`flex shrink-0 items-center gap-2 px-[13px] py-3 ${INPUT_WELL} ${leverageDisabled ? "opacity-30" : ""}`}
          >
            <input
              type="text"
              inputMode="numeric"
              disabled={leverageDisabled}
              value={leverageDraft.value}
              aria-label="Leverage multiple"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                leverageDraft.edit(v);
                const n = Number(v);
                if (v !== "" && n >= minLeverage) onLeverageChange(Math.min(maxLeverage, n));
              }}
              onBlur={leverageDraft.reset}
              className="w-[2.2ch] min-w-0 bg-transparent text-[16px] leading-4 text-[#f0f0f0] outline-none"
            />
            <span className="text-[14px] font-medium leading-4 text-[#d6b06a]">x</span>
            <span className="h-5 w-px shrink-0 bg-white/[0.28]" aria-hidden />
            <span className="whitespace-nowrap text-[9px] font-semibold uppercase leading-[10px] tracking-[0.225px] text-[#ccb17f]">
              Max: {maxLeverage} x
            </span>
          </label>
        </div>
      </section>

      <button
        type="button"
        disabled={ctaDisabled}
        onClick={() => {
          if (ctaNeedsWallet) {
            setConnectFor(true);
            return;
          }
          onPrimary();
        }}
        className={`app-pressable flex h-[52px] w-full items-center justify-center rounded-[14px] border px-4 text-[16px] font-semibold uppercase leading-5 tracking-[1px] disabled:opacity-60 ${
          ctaNeedsWallet
            ? "border-white/10 text-[#7f8090]"
            : "border-[rgba(173,134,73,0.56)] text-[#f0ddb9]"
        } bg-[linear-gradient(180deg,rgba(56,42,28,0.98)_0%,rgba(28,24,18,0.99)_100%)]`}
      >
        <span className="truncate">{ctaNeedsWallet ? "Connect Wallet" : primaryLabel}</span>
      </button>

      <DnVenueSheet
        open={venueSlot != null}
        onClose={() => setVenueSlot(null)}
        title={venueSlot === "b" ? "Select DEX 2" : "Select DEX 1"}
        options={dexOptions}
        value={venueSlot === "b" ? dexB : dexA}
        excluded={venueSlot === "b" ? dexA : dexB}
        isConnected={isConnected}
        onSelect={(dex) => (venueSlot === "b" ? onDexBChange(dex) : onDexAChange(dex))}
      />

      <DnTokenSheet
        open={tokenSheetOpen}
        onClose={() => setTokenSheetOpen(false)}
        value={market.token}
        structure={structure}
        onSelect={onTokenChange}
      />

      <BottomSheet
        open={info != null}
        onClose={() => setInfo(null)}
        title={info === "leverage" ? "Leverage" : "Margin"}
      >
        <p className="whitespace-pre-line px-4 pt-4 text-app-body leading-[21px] text-ink-muted">
          {info === "leverage" ? leverageInfo : marginInfo}
        </p>
      </BottomSheet>

      <ConnectNetworkSheet
        open={connectFor != null}
        onClose={() => setConnectFor(null)}
        onSelect={() => {
          const venue = connectFor;
          setConnectFor(null);
          app.connectWallet();
          if (typeof venue === "string") connectVenue(venue);
        }}
      />
    </div>
  );
}
