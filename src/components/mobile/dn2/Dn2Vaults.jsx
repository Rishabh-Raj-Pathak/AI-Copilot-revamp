import { useState } from "react";
import { ChartCandlestick, Check, ChevronRight, Copy, TriangleAlert } from "lucide-react";
import { latestFundingFor } from "../../../delta-neutral/components/StrategyDeepDive.tsx";
import { formatWalletAddress } from "../../../delta-neutral/utils/wallet.ts";
import {
  CancelButton,
  DataRow,
  Divider,
  Dn2Button,
  Dn2Sheet,
  ExpandButton,
  VaultSummaryTile,
  VenueMark,
  VenuePair,
} from "./Dn2Ui.jsx";
import {
  MINUS,
  capitalUsedPct,
  compactUsd,
  signedUsd,
  vaultLeverage,
  vaultPnlBreakdown,
} from "./dn2Data.js";
import { CARD, CARD_EDGE, CARD_FILL, LABEL, TILE } from "./dn2Theme.js";

/**
 * Active vaults on the Delta Neutral 2 phone tab — Figma A1–A6 (4476:5) and the
 * manage sheets C2–C4 (4476:7). The card is the Alpha Agents card pattern with
 * the web card's fields and two actions, PnL breakdown and Deactivate (no Edit
 * on phone). Expanding it shows each venue's wallet and latest funding (the web
 * deep-dive's figures, without its charts), plus a link to the Copilot chart
 * (A6) for a token vault.
 */

const LEG_SEPARATOR = "  ⇄  ";

/** Figma "Vault Card" (4492:120 collapsed, 4492:542 expanded). */
export function Dn2VaultCard({ vault, expanded, countdown, onToggle, onPnl, onDeactivate, onChart, onCopy }) {
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

      {/*
        The everyday action gets the wide target; the destructive one sits apart at
        the edge, smaller, red and labelled, with 12px of dead space between them.
        It still asks to confirm (C3) before anything closes.
      */}
      <div className="flex items-center gap-3">
        <Dn2Button className="flex-1" onClick={onPnl}>
          PnL breakdown
        </Dn2Button>
        <Dn2Button variant="danger" className="px-5" aria-label={`Deactivate ${vault.pair}`} onClick={onDeactivate}>
          Deactivate
        </Dn2Button>
      </div>
    </article>
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

/* ── C3 Deactivate vault (4496:925) → C4 Vault deactivated ──────────────── */

/**
 * Phone-only, two steps (on the web, Deactivate fires immediately):
 *
 *  1. Confirm — the vault, what will happen, and the two choices. No figures of
 *     its own.
 *  2. Done — once confirmed the same sheet turns into the receipt: a green
 *     check, what happened, the vault it happened to, and Done. The card has
 *     already left the list behind it, so the screen agrees with the sheet.
 *
 * Every time the sheet opens it starts at step 1.
 */
export function Dn2DeactivateSheet({ open, vault, onClose, onConfirm }) {
  const [done, setDone] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDone(false);
  }

  return (
    <Dn2Sheet open={open} onClose={onClose} title={done ? "Vault deactivated" : "Deactivate vault"}>
      {!vault ? null : done ? (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <div className="flex flex-col items-center gap-3 pt-1 text-center" role="status">
            <span className="flex size-12 items-center justify-center rounded-full border border-[rgba(0,212,146,0.35)] bg-[rgba(0,212,146,0.1)] text-[#00d492]">
              <Check size={22} strokeWidth={2.5} aria-hidden />
            </span>
            <p className="max-w-[300px] text-[13px] leading-[18px] text-[#b4b5c2]">
              {vault.pair} has stopped. Its legs on {vault.longAccount} and {vault.shortAccount} were closed at market.
            </p>
          </div>
          <VaultSummaryTile
            vault={vault}
            aside={
              <span className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase leading-[13px] tracking-[0.4px] text-[#8f90a1]">
                Deactivated
              </span>
            }
          />
          <Dn2Button size="lg" className="w-full" onClick={onClose}>
            Done
          </Dn2Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <VaultSummaryTile vault={vault} />
          <p className="flex items-start gap-2 text-[12px] leading-[17px] text-[#8f90a1]">
            <TriangleAlert size={14} className="mt-0.5 shrink-0 text-[#f87171]" aria-hidden />
            {vault.pair} stops and its legs on {vault.longAccount} and {vault.shortAccount} are closed at market.
          </p>
          <div className="flex flex-col gap-0.5">
            <Dn2Button
              variant="danger"
              size="lg"
              className="w-full"
              onClick={() => {
                onConfirm();
                setDone(true);
              }}
            >
              Deactivate vault
            </Dn2Button>
            <CancelButton onPress={onClose} />
          </div>
        </div>
      )}
    </Dn2Sheet>
  );
}
