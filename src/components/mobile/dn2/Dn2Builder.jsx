import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatPct } from "../../../delta-neutral/utils/format.ts";
import { useMobileApp } from "../MobileAppContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { Dn2CostSheet, Dn2InfoSheet, Dn2MarketSheet, Dn2VenueSheet } from "./Dn2BuilderSheets.jsx";
import Dn2NewVaultPage from "./Dn2NewVaultPage.jsx";
import Dn2OpeningScreen from "./Dn2OpeningScreen.jsx";
import { Dn2Button, VenuePair } from "./Dn2Ui.jsx";
import { CARD, EYEBROW, HERO_EDGE, HERO_FILL } from "./dn2Theme.js";

/**
 * Delta Neutral 2 on a phone — the builder's face (Figma 4476:2).
 *
 *  - Vaults tab: the Cross-DEX setup hero (A1) — what the product does, the
 *    pre-filled pair and its estimated APY, and "Set up vault →".
 *  - "Set up vault" opens the builder as a pushed page (B1–B3) with its sheets:
 *    DEX (B4), market (B5), cost to open (B6), ⓘ explainers. Only the web
 *    builder's fields: Deposit and Change wallet sit on each DEX card, as on
 *    web, and the token field has no chart button (the chart, A6, is on the
 *    vault and pair cards).
 *  - Opening runs full screen (B7) while the builder prepares the vault.
 *
 * Stateless about the vault: `DeltaVaultBuilder` keeps owning venues, legs,
 * market, sizing and activation for every layout; this only decides what is
 * open. It stays mounted across the Vaults / Positions / History tabs so a
 * half-built vault survives a look at the positions.
 *
 * A venue counts as connected only while the app wallet is, as on the other
 * phone builder: the mock venue sessions describe a wallet.
 */

const SESSION_VENUES = new Set(["Variational"]);
const needsSession = (dex) => SESSION_VENUES.has(dex);

function marketLabel(market) {
  if (market.mode === "tokens") return market.token;
  return market.themes.length ? market.themes.join(" + ") : "Pick a category";
}

/**
 * Figma "Cross-DEX Setup" (4492:93) on the Vaults tab: an entry point, not an
 * action. One line says what the product does, the pre-filled pair sits in a
 * preview tile (its APY is an estimate at live rates), and the button names
 * the next step, "Set up vault →", over a line saying nothing opens yet.
 */
function SetupHero({ dexA, dexB, legA, legB, market, summary, onSetUp }) {
  const apyValid = Boolean(summary?.valid);
  const venuesPicked = Boolean(dexA && dexB);
  return (
    <section className={`${CARD} ${HERO_EDGE} gap-3.5!`} style={HERO_FILL} aria-label="Cross-DEX setup">
      <div className="flex flex-col gap-1">
        <p className={EYEBROW}>Cross-DEX setup</p>
        <p className="text-[12px] leading-4 text-[#b4b5c2]">Earn the funding spread, hedged across two DEXs.</p>
      </div>

      <div className="flex items-center gap-3 rounded-[12px] border border-white/[0.06] bg-black/[0.28] p-3">
        {venuesPicked ? <VenuePair a={dexA} b={dexB} size={30} logo={17} /> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-[15px] font-medium leading-5 text-[#e8d5b5]">{marketLabel(market)}</p>
          <p className="truncate text-[11px] leading-[14px] text-[#8f90a1]">
            {venuesPicked ? `${dexA} ⇄ ${dexB}` : "Pick two venues to start"}
          </p>
          {venuesPicked ? (
            <p className="truncate text-[11px] leading-[14px] text-[#717182]">
              {legA} / {legB}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap">
          <p
            className={`text-right text-[18px] font-semibold leading-[22px] ${
              apyValid && summary.netAprOnCapitalPct > 0 ? "text-[#00d492]" : "text-[#717182]"
            }`}
          >
            {apyValid ? formatPct(summary.netAprOnCapitalPct) : "—"}
          </p>
          <p className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.4px] text-[#717182]">Est. APY</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Dn2Button variant="primary" size="md" className="w-full" onClick={onSetUp}>
          Set up vault
          <ArrowRight size={16} aria-hidden />
        </Dn2Button>
        <p className="text-center text-[11px] leading-[14px] text-[#717182]">Nothing opens until you review and confirm.</p>
      </div>
    </section>
  );
}

export default function Dn2Builder(props) {
  const {
    heroVisible,
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
    dualValid,
    showPairWarning,
    firstDisconnectedVenue,
    primaryLabel,
    onPrimary,
    preparing,
    summary,
    metrics,
    legSlippage,
  } = props;

  const app = useMobileApp();
  const [pageOpen, setPageOpen] = useState(false);
  const [venueSlot, setVenueSlot] = useState(null);
  const [marketOpen, setMarketOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [info, setInfo] = useState(null);
  /** Set when the wallet sheet was opened to connect a venue; `true` for the CTA. */
  const [connectFor, setConnectFor] = useState(null);

  // The opening screen takes over the moment the vault starts preparing, so
  // the page underneath pops back to the Vaults tab behind it.
  const [wasPreparing, setWasPreparing] = useState(preparing);
  if (preparing !== wasPreparing) {
    setWasPreparing(preparing);
    if (preparing) setPageOpen(false);
  }

  const walletOn = app.walletConnected;
  const isConnected = (dex) => Boolean(dex) && walletOn && Boolean(dexConnected[dex]);

  // Variational authenticates in its own sheet; the rest connect on the spot (web).
  const requestVenue = (dex) => {
    if (!dex) return;
    if (!walletOn) {
      setConnectFor(dex);
      return;
    }
    onConnectDex(dex);
  };

  const venueProps = (slot) => {
    const dex = slot === "a" ? dexA : dexB;
    return {
      dex,
      instrument: slot === "a" ? legA : legB,
      otherInstrument: slot === "a" ? legB : legA,
      connected: isConnected(dex),
      balance: dex ? dexBalances[dex] : 0,
      wallet: dex ? dexWallets[dex] : null,
      onOpen: () => setVenueSlot(slot),
      onInstrument: (option) => onLegInstrumentChange(slot, option),
      onConnect: () => requestVenue(dex),
      onDeposit: () => dex && onDepositDex(dex),
      onChangeWallet: () => dex && onChangeWalletDex(dex),
    };
  };

  /*
   * The footer CTA walks the same ladder as the web button -- wallet, then each
   * venue ("Connect Nado wallet", "Activate Variational"), then open -- but names
   * the market the phone way: "Open BTC-USDC vault", "Open Bluechip + Meme vault".
   */
  const tokens = market.mode === "tokens";
  const cta = !walletOn
    ? { label: "Connect wallet", icon: "wallet", onPress: () => setConnectFor(true) }
    : !dualValid
      ? { label: "Pick two venues to continue", disabled: true }
      : firstDisconnectedVenue
        ? {
            label: primaryLabel,
            icon: needsSession(firstDisconnectedVenue) ? null : "wallet",
            onPress: onPrimary,
            disabled: preparing,
          }
        : !tokens && market.themes.length === 0
          ? { label: "Pick a category", disabled: true }
          : { label: `Open ${marketLabel(market)} vault`, onPress: onPrimary, disabled: preparing };

  const otherOf = (slot) => (slot === "b" ? dexA : dexB);
  const slotLabel = (slot) => (slot === "b" ? "Select DEX B" : "Select DEX A");

  return (
    <>
      {heroVisible ? (
        <SetupHero
          dexA={dexA}
          dexB={dexB}
          legA={legA}
          legB={legB}
          market={market}
          summary={summary}
          onSetUp={() => setPageOpen(true)}
        />
      ) : null}

      <Dn2NewVaultPage
        open={pageOpen}
        onClose={() => setPageOpen(false)}
        cta={cta}
        dexA={dexA}
        dexB={dexB}
        venueProps={venueProps}
        showPairWarning={showPairWarning}
        market={market}
        marketDisabled={marketDisabled}
        onModeChange={onModeChange}
        onThemesChange={onThemesChange}
        onOpenMarket={() => setMarketOpen(true)}
        onOpenCost={() => setCostOpen(true)}
        onInfo={setInfo}
        summary={summary}
        metrics={metrics}
        legSlippage={legSlippage}
        amount={amount}
        percent={percent}
        maxAmount={maxAmount}
        marginOff={marginDisabled || !walletOn}
        onAmountChange={onAmountChange}
        onPercentChange={onPercentChange}
        leverage={leverage}
        minLeverage={minLeverage}
        maxLeverage={maxLeverage}
        leverageDisabled={leverageDisabled}
        onLeverageChange={onLeverageChange}
      />

      <Dn2VenueSheet
        open={venueSlot != null}
        onClose={() => setVenueSlot(null)}
        slotLabel={slotLabel(venueSlot)}
        options={dexOptions}
        value={venueSlot === "b" ? dexB : dexA}
        other={otherOf(venueSlot)}
        isConnected={isConnected}
        onSelect={(dex) => (venueSlot === "b" ? onDexBChange(dex) : onDexAChange(dex))}
      />

      <Dn2MarketSheet
        open={marketOpen}
        onClose={() => setMarketOpen(false)}
        value={market.token}
        structure={structure}
        onSelect={onTokenChange}
      />

      <Dn2CostSheet open={costOpen} onClose={() => setCostOpen(false)} summary={summary?.valid ? summary : null} />

      <Dn2InfoSheet
        open={info != null}
        onClose={() => setInfo(null)}
        title={info === "leverage" ? "Leverage" : "Margin"}
        body={info === "leverage" ? leverageInfo : marginInfo}
      />

      <ConnectNetworkSheet
        open={connectFor != null}
        onClose={() => setConnectFor(null)}
        onSelect={() => {
          const venue = connectFor;
          setConnectFor(null);
          app.connectWallet();
          if (typeof venue === "string") onConnectDex(venue);
        }}
      />

      <Dn2OpeningScreen open={preparing && Boolean(dexA && dexB)} venueA={dexA} venueB={dexB} />
    </>
  );
}
