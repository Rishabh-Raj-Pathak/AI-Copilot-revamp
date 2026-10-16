import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { historyTableMock, positionsTableMock } from "../../vaults/vaultsPositionsHistoryMock.js";
import { useMobileApp } from "../MobileAppContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { Dn2Button, EmptyCard, SectionTitle, SubTabs } from "../dn2/Dn2Ui.jsx";
import AgentVenueSheet, { AgentVenueMark } from "./AgentVenueSheet.jsx";
import AgentsAboutSheet from "./AgentsAboutSheet.jsx";
import MobileAgentCard, { ActivatedAgentCard } from "./MobileAgentCard.jsx";
import { AgentHistoryView, AgentPositionsView } from "./MobileAgentPositions.jsx";

/**
 * Alpha Agents on a phone — Figma "02 Agents - Alpha Agents"
 * (DoY28sP7SwidihlLGoGrEa, 1220:38293). Under the Agents header, the same
 * chrome as Delta Neutral 2 (`Dn2Screen`):
 *
 *   AGENTS   POSITIONS   HISTORY                  ← sub-tabs (shared SubTabs)
 *   Agents     venue chip + How it works, then the shelves:
 *              Activated vaults · Alpha Agents · Prime Agents
 *   Positions  one card per position (C1–C3)
 *   History    one card per closed trade (D1–D2)
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

/** The grey ⓘ beside a shelf title; it opens "How it works". */
function SectionInfo({ label, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      aria-haspopup="dialog"
      className="app-pressable relative flex size-4 shrink-0 items-center justify-center text-[#717182] after:absolute after:-inset-3"
    >
      <Info size={14} strokeWidth={1.75} aria-hidden />
    </button>
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
  const signedIn = app.walletConnected;
  const [tab, setTab] = useState("agents");
  const [scrollEl, setScrollEl] = useState(null);
  const [venueOpen, setVenueOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const activeTab = dexTabs.find((t) => t.id === dexId) ?? dexTabs[0];
  const openAbout = () => setAboutOpen(true);

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
      <div className="flex items-center justify-between gap-3" data-tour="vaults-overview">
        <button
          type="button"
          onClick={() => setVenueOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Venue: ${activeTab.label}. Change venue`}
          data-tour="vaults-dex-tabs"
          className="app-pressable flex h-8 min-w-0 items-center gap-1.5 rounded-[16px] border border-white/[0.08] bg-white/[0.04] pl-2.5 pr-3"
        >
          <span className="flex size-3.5 shrink-0 items-center justify-center">
            <AgentVenueMark id={activeTab.id} size={14} />
          </span>
          <span className="truncate text-[12px] font-medium leading-4 text-[#e8d5b5]">{activeTab.label}</span>
          <ChevronDown size={12} strokeWidth={2} className="shrink-0 text-[#ccb17f]" aria-hidden />
        </button>
        <button
          type="button"
          onClick={openAbout}
          aria-haspopup="dialog"
          className="app-pressable flex h-8 shrink-0 items-center gap-1.5 text-[12px] font-medium leading-4 text-[#ccb17f]"
        >
          <Info size={14} strokeWidth={1.75} aria-hidden />
          How it works
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
            <SectionTitle aside={<SectionInfo label="How Alpha Agents work" onPress={openAbout} />}>
              Alpha Agents
            </SectionTitle>
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
            <SectionTitle aside={<SectionInfo label="How Prime Agents work" onPress={openAbout} />}>
              Prime Agents
            </SectionTitle>
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
              rows={signedIn ? positionsTableMock : []}
              expandedKey={expandedPosition}
              onToggle={(key) => setExpandedPosition((k) => (k === key ? null : key))}
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
              rows={signedIn ? historyTableMock : []}
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
