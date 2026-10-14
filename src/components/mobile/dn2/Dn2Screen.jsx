import { useState } from "react";
import { HISTORY_PAIRS, POSITION_PAIRS } from "../../../delta-neutral/components/PerpBottomPanel.tsx";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import Dn2ChartSheet from "./Dn2ChartSheet.jsx";
import { Dn2ClosePairSheet, Dn2HistoryView, Dn2PositionsView } from "./Dn2Positions.jsx";
import { Dn2Button, EmptyCard, GroupToggle } from "./Dn2Ui.jsx";
import { Dn2DeactivateSheet, Dn2EditVaultSheet, Dn2PnlSheet, Dn2VaultCard } from "./Dn2Vaults.jsx";
import { payoutCountdown, useNow, wholeUsd } from "./dn2Data.js";

/**
 * Delta Neutral 2 on a phone — Figma "Delta Neutral 2 · Mobile-native (390)"
 * (`kN9AkNRzaxmg4mhFVkt1Bo`, 4476:2). Under the Agents header:
 *
 *   VAULTS ⓝ   POSITIONS ⓝ   HISTORY ⓝ          ← DN Tabs (4492:36)
 *   Vaults     Cross-DEX setup → Active vaults (A1–A5, manage sheets C1–C3)
 *   Positions  one card per pair (D1–D3)
 *   History    paired fills per vault action (D4)
 *
 * The web page's bottom panel becomes the two sub-tabs and its platform stats
 * are not shown on the phone. Vault state and its handlers stay in the page
 * (`DeltaNeutralVaultsV2Page`); the builder is rendered through
 * `renderBuilder(heroVisible, onActivate)` at one fixed spot so it stays
 * mounted across tabs.
 */

const TABS = [
  { id: "vaults", label: "Vaults" },
  { id: "positions", label: "Positions" },
  { id: "history", label: "History" },
];

/** Figma "DN Tabs": uppercase, a count pill each, gradient underline. */
function Dn2SubTabs({ value, onChange, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Delta Neutral"
      className="flex shrink-0 items-start gap-[22px] border-b border-white/[0.06] bg-black px-5 max-[374px]:px-4"
    >
      {TABS.map((tab) => {
        const on = tab.id === value;
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.id)}
            className="relative flex h-[42px] items-center justify-center"
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`text-[12px] font-semibold uppercase leading-4 tracking-[0.6px] ${
                  on ? "text-[#f0ddb9]" : "text-[#8f90a1]"
                }`}
              >
                {tab.label}
              </span>
              {count != null ? (
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-semibold leading-[14px] ${
                    on ? "bg-[rgba(214,177,107,0.14)] text-[#f0ddb9]" : "bg-white/[0.06] text-[#8f90a1]"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </span>
            {on ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[linear-gradient(90deg,#785a28_0%,#ccb17f_100%)]"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Figma "Section Title": hairlines fading in towards a centred title. */
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(255,255,255,0.08)_100%)]" aria-hidden />
      <h2 className="shrink-0 text-[16px] font-medium leading-[22px] text-[#e8d5b5]">{children}</h2>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_100%)]" aria-hidden />
    </div>
  );
}

function phonePairLabel(pair) {
  return String(pair).replace("/", "-").replace(/, /g, " + ");
}

export default function Dn2Screen({ vaults, onAddVault, onSaveSettings, onStop, renderBuilder }) {
  const app = useMobileApp();
  const toast = useAppToast();
  const now = useNow(1000);
  const countdown = payoutCountdown(now);
  // State, not a ref: the activate handler that scrolls it is handed to the builder at render.
  const [scrollEl, setScrollEl] = useState(null);
  const signedIn = app.walletConnected;

  const [tab, setTab] = useState("vaults");
  const [group, setGroup] = useState("all");
  const [expandedVault, setExpandedVault] = useState(null);
  const [freshIds, setFreshIds] = useState(() => new Set());
  /** The manage sheet. `vault` outlives `open` so the sheet keeps its content while it slides away. */
  const [sheet, setSheet] = useState({ kind: null, open: false, vault: null });
  const [chart, setChart] = useState({ open: false, pair: "", venues: [] });
  const [positions, setPositions] = useState(POSITION_PAIRS);
  const [expandedPair, setExpandedPair] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [closing, setClosing] = useState({ open: false, position: null });
  const [connectOpen, setConnectOpen] = useState(false);

  const history = HISTORY_PAIRS;
  const shownVaults = signedIn ? vaults : [];
  const categoryCount = shownVaults.filter((v) => v.marketType === "category").length;
  const tokenCount = shownVaults.length - categoryCount;
  // A vault opened this session leads the list, then categories, then tokens (web grouping).
  const ordered = [
    ...shownVaults.filter((v) => freshIds.has(v.id)),
    ...shownVaults.filter((v) => !freshIds.has(v.id) && v.marketType === "category"),
    ...shownVaults.filter((v) => !freshIds.has(v.id) && v.marketType === "token"),
  ].filter((v) => group === "all" || v.marketType === group);

  const openSheet = (kind, vault) => setSheet({ kind, open: true, vault });
  const closeSheet = () => setSheet((prev) => ({ ...prev, open: false }));
  // Read the live vault so an edit shows its saved figures; fall back to the snapshot once it is gone.
  const sheetVault = vaults.find((v) => v.id === sheet.vault?.id) ?? sheet.vault;

  const goTo = (next) => {
    setTab(next);
    scrollEl?.scrollTo({ top: 0 });
  };

  const handleActivate = (payload) => {
    const model = onAddVault(payload);
    setFreshIds((prev) => new Set(prev).add(model.id));
    setGroup("all");
    goTo("vaults");
    const margin = payload.marginUsd ? ` · ${wholeUsd(payload.marginUsd)} margin` : "";
    const lev = payload.leverage ? ` · ${payload.leverage}x` : "";
    toast.show({
      title: `${phonePairLabel(payload.pair)} vault opened`,
      message: `${model.longAccount} ⇄ ${model.shortAccount}${margin}${lev}`,
      tone: "success",
      theme: "gold",
      action: {
        label: "View",
        onPress: () => {
          setExpandedVault(model.id);
          goTo("vaults");
        },
      },
    });
  };

  const copyWallet = async (wallet, dex) => {
    try {
      await navigator.clipboard.writeText(wallet);
      toast.show({ title: "Address copied", message: `${dex} wallet`, tone: "success", theme: "gold" });
    } catch {
      toast.show({ title: "Couldn’t copy", message: wallet, tone: "error", theme: "gold" });
    }
  };

  const connectAction = (
    <Dn2Button size="lg" className="w-full" onClick={() => setConnectOpen(true)}>
      Connect wallet
    </Dn2Button>
  );

  const vaultsBody = (
    <>
      <SectionTitle>Active vaults</SectionTitle>
      {!signedIn ? (
        <EmptyCard
          title="No active vaults yet"
          message="Connect a wallet to open vaults and track their volume, funding and PnL here."
          action={connectAction}
        />
      ) : (
        <>
          <GroupToggle
            ariaLabel="Vault group"
            value={group}
            onChange={setGroup}
            options={[
              { id: "all", label: `All ${shownVaults.length}` },
              { id: "category", label: `Categories ${categoryCount}` },
              { id: "token", label: `Tokens ${tokenCount}` },
            ]}
          />
          {ordered.length === 0 ? (
            <EmptyCard
              title={`No ${group === "token" ? "token " : group === "category" ? "category " : ""}vaults yet`}
              message="Open one from the Cross-DEX setup above."
            />
          ) : (
            ordered.map((vault) => (
              <Dn2VaultCard
                key={vault.id}
                vault={vault}
                isNew={freshIds.has(vault.id)}
                expanded={expandedVault === vault.id}
                countdown={countdown}
                onToggle={() => setExpandedVault((id) => (id === vault.id ? null : vault.id))}
                onPnl={() => openSheet("pnl", vault)}
                onEdit={() => openSheet("edit", vault)}
                onDeactivate={() => openSheet("deactivate", vault)}
                onChart={(pair) => setChart({ open: true, pair, venues: [vault.longAccount, vault.shortAccount] })}
                onCopy={copyWallet}
              />
            ))
          )}
        </>
      )}
    </>
  );

  const signedOutEmpty = (what) => (
    <EmptyCard
      title={`No ${what} yet`}
      message={`Connect a wallet to see your delta-neutral ${what} here.`}
      action={connectAction}
    />
  );

  return (
    <>
      <Dn2SubTabs
        value={tab}
        onChange={goTo}
        counts={signedIn ? { vaults: vaults.length, positions: positions.length, history: history.length } : null}
      />
      <div
        ref={setScrollEl}
        className="delta-neutral-minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]"
      >
        <div
          className={`flex flex-col gap-3 px-5 pb-6 max-[374px]:px-4 ${tab === "vaults" ? "pt-4" : "pt-3.5"}`}
          role="tabpanel"
          aria-label={TABS.find((t) => t.id === tab)?.label}
        >
          {/* Always rendered here, so the builder keeps its state across tabs. */}
          {renderBuilder(tab === "vaults", handleActivate)}
          {tab === "vaults" ? (
            vaultsBody
          ) : tab === "positions" ? (
            <Dn2PositionsView
              positions={signedIn ? positions : []}
              now={now}
              expandedKey={expandedPair}
              onToggle={(key) => setExpandedPair((k) => (k === key ? null : key))}
              onClosePair={(position) => setClosing({ open: true, position })}
              onChart={(position) =>
                setChart({ open: true, pair: position.coin, venues: [position.long.dex, position.short.dex] })
              }
              emptyState={signedIn ? <EmptyCard title="No open positions" message="Pairs a vault opens show up here." /> : signedOutEmpty("positions")}
            />
          ) : (
            <Dn2HistoryView
              rows={signedIn ? history : []}
              now={now}
              expandedKey={expandedHistory}
              onToggle={(key) => setExpandedHistory((k) => (k === key ? null : key))}
              emptyState={signedIn ? <EmptyCard title="No history yet" message="Each vault action lands here as a paired fill." /> : signedOutEmpty("history")}
            />
          )}
        </div>
      </div>

      <Dn2PnlSheet open={sheet.open && sheet.kind === "pnl"} vault={sheet.kind === "pnl" ? sheetVault : null} onClose={closeSheet} />
      <Dn2EditVaultSheet
        open={sheet.open && sheet.kind === "edit"}
        vault={sheet.kind === "edit" ? sheetVault : null}
        onClose={closeSheet}
        onSave={(next) => {
          const vault = sheetVault;
          onSaveSettings(vault.id, next);
          closeSheet();
          toast.show({
            title: `${vault.pair} updated`,
            message: `${wholeUsd(next.marginUsd)} margin · ${next.leverage}x`,
            tone: "success",
            theme: "gold",
          });
        }}
      />
      <Dn2DeactivateSheet
        open={sheet.open && sheet.kind === "deactivate"}
        vault={sheet.kind === "deactivate" ? sheetVault : null}
        countdown={countdown}
        onClose={closeSheet}
        onConfirm={() => {
          const vault = sheetVault;
          onStop(vault.id);
          if (expandedVault === vault.id) setExpandedVault(null);
          closeSheet();
          toast.show({
            title: `${vault.pair} deactivated`,
            message: `Legs on ${vault.longAccount} and ${vault.shortAccount} closed at market.`,
            tone: "success",
            theme: "gold",
          });
        }}
      />
      <Dn2ClosePairSheet
        open={closing.open}
        position={closing.position}
        now={now}
        onClose={() => setClosing((prev) => ({ ...prev, open: false }))}
        onConfirm={() => {
          const position = closing.position;
          setPositions((prev) => prev.filter((p) => p.coin !== position.coin));
          setClosing((prev) => ({ ...prev, open: false }));
          toast.show({
            title: `${position.coin} closed`,
            message: "Both legs closed at market.",
            tone: "success",
            theme: "gold",
          });
        }}
      />
      <Dn2ChartSheet
        open={chart.open}
        onClose={() => setChart((prev) => ({ ...prev, open: false }))}
        pair={chart.pair}
        venues={chart.venues}
      />
      <ConnectNetworkSheet
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        onSelect={() => {
          setConnectOpen(false);
          app.connectWallet();
        }}
      />
    </>
  );
}
