import { useState } from "react";
import { ChevronDown, Info, Layers } from "lucide-react";
import { historyTableMock, positionsTableMock } from "../../vaults/vaultsPositionsHistoryMock.js";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { Dn2Button, EmptyCard, SectionTitle, SubTabs } from "../dn2/Dn2Ui.jsx";
import { ClosePositionSheet, EditTpSlSheet } from "../positions/PositionsSheets.jsx";
import { formatSignedUsd, formatSizeUnit, formatUsd, roundSize } from "../positions/positionsFormat.js";
import AgentVenueSheet, { AgentVenueMark } from "./AgentVenueSheet.jsx";
import AgentsAboutSheet from "./AgentsAboutSheet.jsx";
import MobileAgentCard, { ActivatedAgentCard } from "./MobileAgentCard.jsx";
import { AgentHistoryView, AgentPositionsView } from "./MobileAgentPositions.jsx";
import { historyRowFromClose, toAgentPosition } from "./agentPositionsData.js";

/**
 * Alpha Agents on a phone — Figma "02 Agents - Alpha Agents"
 * (DoY28sP7SwidihlLGoGrEa, 1220:38293). Under the Agents header, the same
 * chrome as Delta Neutral 2 (`Dn2Screen`):
 *
 *   AGENTS   POSITIONS   HISTORY                  ← sub-tabs (shared SubTabs)
 *   Agents     venue chip + More info, then the shelves:
 *              Activated vaults · Alpha Agents · Prime Agents
 *   Positions  one card per position (C1–C3); Edit and Close open the
 *              Positions & Orders sheets (Edit TP/SL, Close position)
 *   History    one card per closed trade (D1–D2); a market close lands here
 *
 * Each shelf scrolls sideways, one 280px card at a time, bleeding to the
 * screen edge so the next card peeks in. All agent state is VaultsPage's (the
 * venue filter, the per-vault UI rows and the single `onPatch` updater), so the
 * vaults product tour and the activation flow behave as on desktop; activated
 * agents lift out of their shelf into Activated vaults, as on web.
 */

const TABS = [
  { id: "agents", label: "Agents" },
  { id: "positions", label: "Positions" },
  { id: "history", label: "History" },
];

/** A sideways shelf of cards that runs edge to edge under the 20px gutters. */
function Shelf({ label, children }) {
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="app-no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto overscroll-x-contain px-5 max-[374px]:-mx-4 max-[374px]:scroll-px-4 max-[374px]:px-4"
    >
      {children}
    </div>
  );
}

export default function MobileAlphaAgents({
  dexTabs,
  dexId,
  onDexChange,
  activated,
  featured,
  available,
  rowUi,
  onPatch,
}) {
  const app = useMobileApp();
  const toast = useAppToast();
  const signedIn = app.walletConnected;
  const [tab, setTab] = useState("agents");
  const [scrollEl, setScrollEl] = useState(null);
  const [venueOpen, setVenueOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [positions, setPositions] = useState(() => positionsTableMock.map(toAgentPosition));
  const [history, setHistory] = useState(historyTableMock);
  /** The Edit TP/SL or Close sheet. `position` outlives `kind` so the sheet keeps its content while it slides away. */
  const [sheet, setSheet] = useState({ kind: null, position: null, session: 0 });
  const activeTab = dexTabs.find((t) => t.id === dexId) ?? dexTabs[0];

  const openSheet = (kind, position) => setSheet((prev) => ({ kind, position, session: prev.session + 1 }));
  const closeSheet = () => setSheet((prev) => ({ ...prev, kind: null }));

  // Same rules as the Positions & Orders panel: a market close shrinks or removes
  // the position and books the trade in History; a limit close only places the order.
  const confirmClose = ({ position, amount, orderType, closePx, realizedPnl }) => {
    closeSheet();
    const { coin } = position;
    if (orderType === "limit") {
      toast.show({
        title: "Limit close placed",
        message: `${formatSizeUnit(amount, coin)} at ${formatUsd(closePx)}`,
        tone: "success",
        theme: "gold",
      });
      return;
    }
    const full = amount >= position.size - 1e-9;
    const fraction = amount / position.size;
    setPositions((prev) =>
      full
        ? prev.filter((p) => p.id !== position.id)
        : prev.map((p) =>
            p.id === position.id
              ? {
                  ...p,
                  size: roundSize(p.size - amount, coin),
                  margin: p.margin * (1 - fraction),
                  funding: p.funding * (1 - fraction),
                }
              : p,
          ),
    );
    setHistory((prev) => [historyRowFromClose({ position, amount, closePx, realizedPnl }), ...prev]);
    if (full) setExpandedPosition((id) => (id === position.id ? null : id));
    toast.show({
      title: full ? `${coin} position closed` : `${coin} position reduced`,
      message: `Realized PnL ${formatSignedUsd(realizedPnl)}`,
      tone: "success",
      theme: "gold",
    });
  };

  const saveTpSl = ({ position, tp, sl }) => {
    closeSheet();
    setPositions((prev) => prev.map((p) => (p.id === position.id ? { ...p, tp, sl } : p)));
    toast.show({
      title: "TP/SL updated",
      message: `${position.coin} · TP ${tp != null ? formatUsd(tp) : "—"} · SL ${sl != null ? formatUsd(sl) : "—"}`,
      tone: "success",
      theme: "gold",
    });
  };

  const goTo = (next) => {
    setTab(next);
    scrollEl?.scrollTo({ top: 0 });
  };

  const connectAction = (
    <Dn2Button size="lg" className="w-full" onClick={() => setConnectOpen(true)}>
      Connect wallet
    </Dn2Button>
  );

  const agentsBody = (
    <>
      {/*
        Three columns, the outer two equal, so the venue chip sits on the screen's
        centre line whatever the width of "More info" beside it.
      */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2" data-tour="vaults-overview">
        <span aria-hidden />
        <button
          type="button"
          onClick={() => setVenueOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Venue: ${activeTab.label}. Change venue`}
          data-tour="vaults-dex-tabs"
          className="app-pressable flex h-8 min-w-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 text-[12px] font-medium leading-4 text-[#e8d5b5]"
        >
          {/* "All Dexs" has no logo, so it draws the stack glyph at the logos' 14px. */}
          {activeTab.id === "all" ? (
            <Layers size={14} strokeWidth={1.75} className="shrink-0" aria-hidden />
          ) : (
            <AgentVenueMark id={activeTab.id} size={14} />
          )}
          <span className="truncate">{activeTab.label}</span>
          <ChevronDown size={14} strokeWidth={2} className="-mr-0.5 shrink-0 text-[#ccb17f]" aria-hidden />
        </button>
        {/* Secondary to the venue chip: a quiet grey link, not a control. */}
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-haspopup="dialog"
          className="app-pressable flex h-8 shrink-0 items-center gap-1 justify-self-end text-[12px] leading-4 text-[#8f90a1] active:text-[#dcdce8]"
        >
          <Info size={13} strokeWidth={1.75} aria-hidden />
          More info
        </button>
      </div>

      {activated.length > 0 ? (
        <>
          <SectionTitle>Activated vaults</SectionTitle>
          <Shelf label="Activated vaults">
            {activated.map((vault) => (
              <ActivatedAgentCard key={vault.id} vault={vault} ui={rowUi[vault.id]} venueId={dexId} onPatch={onPatch} />
            ))}
          </Shelf>
        </>
      ) : null}

      <div className="flex flex-col gap-3" data-tour="vaults-opportunities">
        {featured.length > 0 ? (
          <>
            <SectionTitle>Alpha Agents</SectionTitle>
            <Shelf label="Alpha agents">
              {featured.map((vault, index) => (
                <MobileAgentCard
                  key={vault.id}
                  vault={vault}
                  ui={rowUi[vault.id]}
                  venueId={dexId}
                  onPatch={onPatch}
                  tourControls={index === 0}
                />
              ))}
            </Shelf>
          </>
        ) : null}
        {available.length > 0 ? (
          <>
            <SectionTitle>Prime Agents</SectionTitle>
            <Shelf label="Prime agents">
              {available.map((vault) => (
                <MobileAgentCard key={vault.id} vault={vault} ui={rowUi[vault.id]} venueId={dexId} onPatch={onPatch} />
              ))}
            </Shelf>
          </>
        ) : null}
        {activated.length + featured.length + available.length === 0 ? (
          <EmptyCard title="No agents match this venue filter." />
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <SubTabs tabs={TABS} value={tab} onChange={goTo} ariaLabel="Alpha Agents" />
      <div
        ref={setScrollEl}
        className="vaults-minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]"
      >
        <div
          className={`flex flex-col gap-3 px-5 pb-6 max-[374px]:px-4 ${tab === "agents" ? "pt-4" : "pt-3.5"}`}
          role="tabpanel"
          aria-label={TABS.find((t) => t.id === tab)?.label}
        >
          {tab === "agents" ? (
            agentsBody
          ) : tab === "positions" ? (
            <AgentPositionsView
              positions={signedIn ? positions : []}
              expandedKey={expandedPosition}
              onToggle={(key) => setExpandedPosition((k) => (k === key ? null : key))}
              onEdit={(position) => openSheet("tpsl", position)}
              onClose={(position) => openSheet("close", position)}
              emptyState={
                signedIn ? (
                  <EmptyCard title="Open positions will appear here" />
                ) : (
                  <EmptyCard
                    title="No open positions"
                    message="Connect a wallet to activate agents and track their positions and P&L here."
                    action={connectAction}
                  />
                )
              }
            />
          ) : (
            <AgentHistoryView
              rows={signedIn ? history : []}
              expandedKey={expandedTrade}
              onToggle={(key) => setExpandedTrade((k) => (k === key ? null : key))}
              emptyState={
                signedIn ? (
                  <EmptyCard title="Closed trades will appear here" />
                ) : (
                  <EmptyCard
                    title="No history yet"
                    message="Connect a wallet to see the trades your agents closed."
                    action={connectAction}
                  />
                )
              }
            />
          )}
        </div>
      </div>

      <AgentVenueSheet
        open={venueOpen}
        onClose={() => setVenueOpen(false)}
        tabs={dexTabs}
        value={dexId}
        onChange={onDexChange}
      />
      <AgentsAboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <EditTpSlSheet
        open={sheet.kind === "tpsl"}
        position={sheet.position}
        sessionKey={sheet.session}
        onClose={closeSheet}
        onSave={saveTpSl}
      />
      <ClosePositionSheet
        open={sheet.kind === "close"}
        position={sheet.position}
        sessionKey={sheet.session}
        onClose={closeSheet}
        onConfirm={confirmClose}
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
