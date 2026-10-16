import { useState } from "react";
import { HISTORY_PAIRS, POSITION_PAIRS } from "../../../delta-neutral/components/PerpBottomPanel.tsx";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import Dn2ChartSheet from "./Dn2ChartSheet.jsx";
import { Dn2ClosePairSheet, Dn2HistoryView, Dn2PositionsView } from "./Dn2Positions.jsx";
import { Dn2Button, EmptyCard, GroupToggle, SectionTitle, SubTabs } from "./Dn2Ui.jsx";
import { Dn2DeactivateSheet, Dn2PnlSheet, Dn2VaultCard } from "./Dn2Vaults.jsx";
import { payoutCountdown, useNow } from "./dn2Data.js";

/**
 * Delta Neutral 2 on a phone — Figma "Delta Neutral 2 · Mobile-native (390)"
 * (`kN9AkNRzaxmg4mhFVkt1Bo`, 4476:2). Under the Agents header:
 *
 *   VAULTS   POSITIONS   HISTORY                  ← DN Tabs (4492:36)
 *   Vaults     Cross-DEX setup → Active vaults (A1–A6, manage sheets C2–C4)
 *   Positions  one card per pair (D1–D3)
 *   History    paired fills per vault action (D4)
 *
 * The web page's bottom panel becomes the two sub-tabs and its platform stats
 * are not shown on the phone. Every field here is one the web Delta Neutral 2
 * page shows; the phone adds no counts, badges or toasts of its own (the copy
 * button's "Address copied" is the one feedback toast, since a copy has no
 * other visible result). Vault state and its handlers stay in the page
 * (`DeltaNeutralVaultsV2Page`); the builder is rendered through
 * `renderBuilder(heroVisible, onActivate)` at one fixed spot so it stays
 * mounted across tabs.
 */

const TABS = [
  { id: "vaults", label: "Vaults" },
  { id: "positions", label: "Positions" },
  { id: "history", label: "History" },
];

/** The web Active vaults caption for each filter (DeltaNeutralVaultsV2Page). */
const GROUP_CAPTION = {
  all: "All active vaults grouped by category and token.",
  category: "Showing category-based vaults only.",
  token: "Showing token-pair vaults only.",
};

export default function Dn2Screen({ vaults, onAddVault, onStop, renderBuilder }) {
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
  // A vault opened this session leads the list, then categories, then tokens (web grouping).
  const ordered = [
    ...shownVaults.filter((v) => freshIds.has(v.id)),
    ...shownVaults.filter((v) => !freshIds.has(v.id) && v.marketType === "category"),
    ...shownVaults.filter((v) => !freshIds.has(v.id) && v.marketType === "token"),
  ].filter((v) => group === "all" || v.marketType === group);

  const openSheet = (kind, vault) => setSheet({ kind, open: true, vault });
  const closeSheet = () => setSheet((prev) => ({ ...prev, open: false }));
  // Read the live vault; fall back to the snapshot once it is gone (a deactivated vault).
  const sheetVault = vaults.find((v) => v.id === sheet.vault?.id) ?? sheet.vault;

  const goTo = (next) => {
    setTab(next);
    scrollEl?.scrollTo({ top: 0 });
  };

  // As on the web, a new vault simply joins the list (at the top here): no toast, no badge.
  const handleActivate = (payload) => {
    const model = onAddVault(payload);
    setFreshIds((prev) => new Set(prev).add(model.id));
    setGroup("all");
    goTo("vaults");
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
      <SectionTitle caption={signedIn ? GROUP_CAPTION[group] : null}>Active vaults</SectionTitle>
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
              { id: "all", label: "All" },
              { id: "category", label: "Categories" },
              { id: "token", label: "Tokens" },
            ]}
          />
          {ordered.length === 0 ? (
            // The web empty state, word for word.
            <EmptyCard title={`No ${group === "category" ? "category" : "token"} vaults are active right now.`} />
          ) : (
            ordered.map((vault) => (
              <Dn2VaultCard
                key={vault.id}
                vault={vault}
                expanded={expandedVault === vault.id}
                countdown={countdown}
                onToggle={() => setExpandedVault((id) => (id === vault.id ? null : vault.id))}
                onPnl={() => openSheet("pnl", vault)}
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
      <SubTabs tabs={TABS} value={tab} onChange={goTo} ariaLabel="Delta Neutral" />
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
      <Dn2DeactivateSheet
        open={sheet.open && sheet.kind === "deactivate"}
        vault={sheet.kind === "deactivate" ? sheetVault : null}
        onClose={closeSheet}
        // The sheet stays up and shows its "Vault deactivated" step; Done closes it.
        onConfirm={() => {
          onStop(sheetVault.id);
          if (expandedVault === sheetVault.id) setExpandedVault(null);
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
