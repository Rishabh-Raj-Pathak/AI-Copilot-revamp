import { useState } from "react";
import { ChartCandlestick, ChevronRight, Copy, TriangleAlert, X } from "lucide-react";
import { latestFundingFor } from "../../../delta-neutral/components/StrategyDeepDive.tsx";
import { formatWalletAddress } from "../../../delta-neutral/utils/wallet.ts";
import {
  CancelButton,
  DataRow,
  Divider,
  Dn2Button,
  Dn2Sheet,
  ExpandButton,
  StackRow,
  VaultSummaryTile,
  VenueMark,
  VenuePair,
} from "./Dn2Ui.jsx";
import { LeverageField, MarginField } from "./Dn2SizeFields.jsx";
import { Dn2InfoSheet } from "./Dn2BuilderSheets.jsx";
import {
  MINUS,
  capitalUsedPct,
  compactUsd,
  marginCeilingFor,
  signedUsd,
  vaultLeverage,
  vaultMarginUsd,
  vaultPnlBreakdown,
  wholeUsd,
} from "./dn2Data.js";
import { CARD, CARD_EDGE, CARD_FILL, LABEL, TILE } from "./dn2Theme.js";

/**
 * Active vaults on the Delta Neutral 2 phone tab — Figma A1–A6 (4476:5) and the
 * manage sheets C1–C3 (4476:7). The card is the Alpha Agents card pattern and
 * carries the web card's fields only; expanding it shows each venue's wallet
 * and latest funding (the web deep-dive's figures, without its charts), plus a
 * link to the Copilot chart (A6) for a token vault.
 */

const LEG_SEPARATOR = "  ⇄  ";

/** Figma "Vault Card" (4492:120 collapsed, 4492:542 expanded). */
export function Dn2VaultCard({ vault, expanded, countdown, onToggle, onPnl, onEdit, onDeactivate, onChart, onCopy }) {
  const isToken = vault.marketType === "token";
  const pairLabel = vault.pair.replace("/", "-");
  return (
    <article className={`${CARD} ${CARD_EDGE}`} style={CARD_FILL} aria-label={`${vault.pair} vault`}>
      <header className="flex items-center gap-2.5">
        <VenuePair a={vault.longAccount} b={vault.shortAccount} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-[16px] font-medium leading-5 text-[#e8d5b5]">{vault.pair}</h3>
          <p className="truncate whitespace-pre text-[11px] leading-[14px] text-[#8f90a1]">
            {`${vault.longAccount}${LEG_SEPARATOR}${vault.shortAccount}`}
          </p>
        </div>
        <ExpandButton
          expanded={expanded}
          onPress={onToggle}
          label={expanded ? `Collapse ${vault.pair}` : `Expand ${vault.pair}`}
        />
      </header>
      <Divider />
      <dl className="flex flex-col gap-2.5">
        <DataRow label="Total volume" value={compactUsd(vault.totalVolumeUsd ?? 0)} />
        <DataRow label="Volume 7D" value={compactUsd(vault.volume7dUsd ?? 0)} />
        <DataRow label="Funding settlement" value={countdown} tone="text-[#ccb17f]" />
        {/* Two rows, as the web card shows them. */}
        <DataRow label="Margin" value={`${Math.round(capitalUsedPct(vault.hedgeHealth))}%`} />
        <DataRow label="Leverage" value={`${vaultLeverage(vault)}x`} />
      </dl>

      {expanded ? (
        <dl className={`${TILE} flex flex-col gap-2.5 px-3 py-2.5`}>
          {[
            [vault.longAccount, vault.longWallet],
            [vault.shortAccount, vault.shortWallet],
          ].map(([dex, wallet]) => (
            <div key={`${dex}-${wallet}`} className="flex items-center justify-between gap-3">
              <dt className={`flex items-center gap-1.5 ${LABEL}`}>
                <VenueMark dex={dex} size={14} />
                {dex}
              </dt>
              <dd className="flex items-center gap-1.5 text-[12px] leading-4 text-[#dcdce8]">
                {formatWalletAddress(wallet)}
                <button
                  type="button"
                  onClick={() => onCopy(wallet, dex)}
                  aria-label={`Copy ${dex} wallet address`}
                  className="relative text-[#8f90a1] after:absolute after:-inset-3 active:text-[#dcdce8]"
                >
                  <Copy size={12} aria-hidden />
                </button>
              </dd>
            </div>
          ))}
          <Divider />
          {[vault.longAccount, vault.shortAccount].map((dex) => {
            const latest = latestFundingFor(dex) * 100;
            return (
              <DataRow
                key={`funding-${dex}`}
                label={`Latest funding · ${dex}`}
                value={`${latest >= 0 ? "+" : MINUS}${Math.abs(latest).toFixed(3)}%`}
                tone={latest >= 0 ? "text-[#00d492]" : "text-[#e5484d]"}
              />
            );
          })}
          {isToken ? (
            <button
              type="button"
              onClick={() => onChart(pairLabel)}
              className="flex items-center gap-1.5 self-start pt-0.5 text-[12px] font-medium leading-4 text-[#ccb17f]"
            >
              <ChartCandlestick size={14} aria-hidden />
              View {pairLabel} chart
              <ChevronRight size={12} aria-hidden />
            </button>
          ) : null}
        </dl>
      ) : null}

      <div className="flex gap-2">
        <Dn2Button className="flex-1" onClick={onPnl}>
          PnL breakdown
        </Dn2Button>
        <Dn2Button className="flex-1" onClick={onEdit}>
          Edit
        </Dn2Button>
        <Dn2Button variant="danger" className="w-[38px] px-0!" aria-label={`Deactivate ${vault.pair}`} onClick={onDeactivate}>
          <X size={16} aria-hidden />
        </Dn2Button>
      </div>
    </article>
  );
}

/* ── C1 Edit position (4496:279) ──────────────────────────────────────── */

const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 50;

const EDIT_INFO = {
  margin:
    "The margin each leg is sized from. The slider runs to a ceiling that always holds the current margin; saving re-sizes both legs at margin × leverage.",
  leverage:
    "Multiplies both legs equally, so the hedge stays delta-neutral. Higher leverage captures more funding but liquidates on a smaller adverse move.",
};

/**
 * The web card's inline editor as a sheet. Values are a draft: the vault keeps
 * running at its saved settings until Save; Cancel costs nothing.
 */
function EditBody({ vault, onSave, onCancel }) {
  const leverage = vaultLeverage(vault);
  const marginUsd = vaultMarginUsd(vault);
  const ceiling = marginCeilingFor(marginUsd);
  const [draftAmount, setDraftAmount] = useState(String(marginUsd));
  const [draftLeverage, setDraftLeverage] = useState(leverage);
  const [info, setInfo] = useState(null);
  const draftMargin = Number(String(draftAmount).replace(/[^0-9.]/g, "")) || 0;
  const draftPercent = Math.round(Math.min(100, Math.max(0, (draftMargin / ceiling) * 100)));
  const size = draftMargin * draftLeverage;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <VaultSummaryTile vault={vault} />
      <MarginField
        percent={draftPercent}
        amount={draftAmount}
        maxAmount={ceiling}
        onPercentChange={(pct) => setDraftAmount(String(Math.round((pct / 100) * ceiling)))}
        onAmountChange={(val) => {
          if (!/^\d*\.?\d*$/.test(val)) return;
          const num = parseFloat(val);
          setDraftAmount(!Number.isNaN(num) && num > ceiling ? String(ceiling) : val);
        }}
        onInfo={() => setInfo("margin")}
      />
      <LeverageField
        leverage={draftLeverage}
        min={MIN_LEVERAGE}
        max={MAX_LEVERAGE}
        onChange={setDraftLeverage}
        onInfo={() => setInfo("leverage")}
      />
      <Divider />
      <dl>
        <StackRow
          label="New position size"
          value={wholeUsd(size)}
          sub={`was ${wholeUsd(vault.notional)}`}
          tone="text-[#e8d5b5]"
          size="text-[14px]"
        />
      </dl>
      <div className="flex flex-col gap-0.5">
        <Dn2Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={draftMargin <= 0}
          onClick={() => onSave({ marginUsd: Math.round(draftMargin), leverage: draftLeverage })}
        >
          Save
        </Dn2Button>
        <CancelButton onPress={onCancel} />
      </div>
      <Dn2InfoSheet
        open={info != null}
        onClose={() => setInfo(null)}
        title={info === "leverage" ? "Leverage" : "Margin"}
        body={EDIT_INFO[info] ?? ""}
      />
    </div>
  );
}

export function Dn2EditVaultSheet({ open, vault, onClose, onSave }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title="Edit position">
      {vault ? <EditBody key={vault.id} vault={vault} onSave={onSave} onCancel={onClose} /> : null}
    </Dn2Sheet>
  );
}

/* ── C2 PnL breakdown (4496:606) ──────────────────────────────────────── */

export function Dn2PnlSheet({ open, vault, onClose }) {
  const breakdown = vault ? vaultPnlBreakdown(vault) : null;
  return (
    <Dn2Sheet open={open} onClose={onClose} title="PnL breakdown">
      {vault ? (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <VaultSummaryTile vault={vault} />
          <div className="flex flex-col gap-0.5">
            <p className={LABEL}>Net PnL</p>
            <p
              className={`text-[24px] font-semibold leading-[30px] ${
                breakdown.net >= 0 ? "text-[#00d492]" : "text-[#e5484d]"
              }`}
            >
              {signedUsd(breakdown.net)}
            </p>
          </div>
          <dl className={`${TILE} flex flex-col gap-2.5 p-3`}>
            {breakdown.lines.map((line) => (
              <DataRow
                key={line.label}
                label={line.label}
                value={signedUsd(line.value)}
                tone={line.value >= 0 ? "text-[#00d492]" : "text-[#e5484d]"}
              />
            ))}
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <dt className={`${LABEL} text-[#e8d5b5]!`}>Net delta</dt>
              <dd className="text-[12px] font-medium leading-4 text-[#e8d5b5]">
                +{breakdown.netDeltaPct.toFixed(1)}%
              </dd>
            </div>
          </dl>
          <Dn2Button size="lg" className="w-full" onClick={onClose}>
            Done
          </Dn2Button>
        </div>
      ) : null}
    </Dn2Sheet>
  );
}

/* ── C3 Deactivate vault (4496:925) ───────────────────────────────────── */

/**
 * Phone-only confirm (on the web, Deactivate fires immediately) — so it adds no
 * figures of its own: the vault, what happens, and the two choices.
 */
export function Dn2DeactivateSheet({ open, vault, onClose, onConfirm }) {
  return (
    <Dn2Sheet open={open} onClose={onClose} title="Deactivate vault">
      {vault ? (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <VaultSummaryTile vault={vault} />
          <p className="flex items-start gap-2 text-[12px] leading-[17px] text-[#8f90a1]">
            <TriangleAlert size={14} className="mt-0.5 shrink-0 text-[#f87171]" aria-hidden />
            {vault.pair} stops and its legs on {vault.longAccount} and {vault.shortAccount} are closed at market.
          </p>
          <div className="flex flex-col gap-0.5">
            <Dn2Button variant="danger" size="lg" className="w-full" onClick={onConfirm}>
              Deactivate vault
            </Dn2Button>
            <CancelButton onPress={onClose} />
          </div>
        </div>
      ) : null}
    </Dn2Sheet>
  );
}
