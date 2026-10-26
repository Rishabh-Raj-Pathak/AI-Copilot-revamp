import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { useMobileApp } from "../MobileAppContext.js";
import { useAppToast } from "../appToastContext.js";
import ConnectNetworkSheet from "../sheets/ConnectNetworkSheet.jsx";
import { Dn2Button, EmptyCard, InfoButton, SectionTitle, SubTabs } from "../dn2/Dn2Ui.jsx";
import { CARD, EYEBROW, HERO_EDGE, HERO_FILL } from "../dn2/dn2Theme.js";
import { DexLogo } from "../../../market-making/ui.tsx";
import { estimateVolume, useConfigAutofill } from "../../../market-making/Configure.tsx";
import { usdCompact, usdFineSigned } from "../../../market-making/lib.ts";
import { useMarketMaking } from "../../../market-making/useMarketMaking.ts";
import MmAgentPage from "./MmAgentPage.jsx";
import MmSetupPage from "./MmSetupPage.jsx";
import { AgentCard, InfoSheet, StatStrip } from "./MmUi.jsx";

/**
 * Market Making on a phone, under the Agents header — production's page
 * (app.hyprearn.com/market-making) in the Delta Neutral 2 phone pattern:
 *
 *   AGENTS   HISTORY                         ← sub-tabs, as on DN2 / Alpha
 *   Agents   setup hero → "Set up agent" page (production's Configure),
 *            your totals, the active agents → agent page
 *   History  completed runs → run results
 *
 * Production's Configure / Dashboard switch becomes the hero + pushed page,
 * and its All / Active / Completed filter becomes the two tabs. Signed out,
 * the agent lists ask you to connect, as production's dashboard does.
 *
 * State and actions are the desktop page's (`useMarketMaking`), so both
 * layouts behave the same; production's toasts ("Strategy activated.") use
 * the kit's gold toast.
 */

const TABS = [
  { id: "agents", label: "Agents" },
  { id: "history", label: "History" },
];
const PAGE = 10;
const ABOUT =
  "Two sided quoting on a single perp DEX, from your own account. Non custodial. Runs on HyprEarn infra, not in your browser.";

export default function MmScreen() {
  const app = useMobileApp();
  const toast = useAppToast();
  const signedIn = app.walletConnected;
  const [connectOpen, setConnectOpen] = useState(false);
  const mm = useMarketMaking({ signedIn, onLogin: () => setConnectOpen(true) });

  const [tab, setTab] = useState("agents");
  const [scrollEl, setScrollEl] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);
  /** The agent page. `id` outlives `open` so the page keeps its content while it slides away. */
  const [agent, setAgent] = useState({ id: null, open: false });
  const [shown, setShown] = useState(PAGE);
  const [about, setAbout] = useState(false);
  const [cpmTip, setCpmTip] = useState(false);

  const { config, overview, dex } = mm;
  const venue = overview.venues.find((v) => v.id === config.venueId) ?? null;
  const market = overview.markets.find((m) => m.venueId === config.venueId && m.symbol === config.marketSymbol) ?? null;
  const strategy = overview.strategies.find((s) => s.id === config.strategyId) ?? null;
  const estimate = estimateVolume(config, strategy);
  // The form fills itself in (Arcus, BTC, the first strategy, 30% margin) before it is opened
  useConfigAutofill({
    config,
    onConfigChange: mm.setConfig,
    overview,
    dex,
    locked: mm.editing !== null,
    marginTouched: mm.marginTouched,
    venue,
    market,
  });

  const running = mm.active.filter((a) => a.status === "running").length;
  const paused = mm.active.length - running;

  const goTo = (next) => {
    setTab(next);
    scrollEl?.scrollTo({ top: 0 });
  };
  const openAgent = (id) => setAgent({ id, open: true });
  const closeSetup = () => {
    setSetupOpen(false);
    // Backing out of an edit drops it, as production's Cancel does
    if (mm.editing) mm.resetForm();
  };

  const connectAction = (
    <Dn2Button size="lg" className="w-full" onClick={() => setConnectOpen(true)}>
      Connect wallet
    </Dn2Button>
  );

  const hero = (
    <section className={`${CARD} ${HERO_EDGE} gap-3.5!`} style={HERO_FILL} aria-label="Market making">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className={EYEBROW}>Market making</p>
          {/* Alpha Agents' "More info": a quiet grey link, not a gold control */}
          <button
            type="button"
            onClick={() => setAbout(true)}
            aria-haspopup="dialog"
            className="app-pressable relative flex shrink-0 items-center gap-1 rounded-full text-[12px] leading-4 text-[#8f90a1] after:absolute after:-inset-x-2 after:-inset-y-3 active:text-[#dcdce8]"
          >
            <Info size={13} strokeWidth={1.75} aria-hidden />
            More info
          </button>
        </div>
        <p className="text-[12px] leading-4 text-[#b4b5c2]">
          Run a market making agent on autopilot. Maker orders keep fees low, you earn the spread, no directional bets.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-[12px] border border-white/[0.06] bg-black/[0.28] p-3">
        {venue ? (
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full border border-white/[0.05] bg-[#121212]">
            <DexLogo dex={venue.id} className="h-[17px] w-[17px] rounded-full" />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-[15px] font-medium leading-5 text-[#e8d5b5]">{market?.symbol ?? "Pick a market"}</p>
          <p className="truncate text-[11px] leading-[14px] text-[#8f90a1]">
            {venue ? `${venue.id}${strategy ? ` · ${strategy.name}` : ""}` : "Pick a venue to start"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5 whitespace-nowrap">
          <p className={`text-right text-[15px] font-semibold leading-5 ${estimate ? "text-[#f0ddb9]" : "text-[#717182]"}`}>
            {estimate ? `${usdCompact(estimate.low)}–${usdCompact(estimate.high)}` : "—"}
          </p>
          <p className="text-[10px] font-medium uppercase leading-[13px] tracking-[0.4px] text-[#717182]">
            {estimate && !estimate.perDay ? "Est. volume / run" : "Est. volume / day"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Dn2Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => {
            if (mm.editing) mm.resetForm(true);
            setSetupOpen(true);
          }}
        >
          Set up agent
          <ArrowRight size={16} aria-hidden />
        </Dn2Button>
        <p className="text-center text-[11px] leading-[14px] text-[#717182]">Nothing runs until you review and activate.</p>
      </div>
    </section>
  );

  const agentsBody = !signedIn ? (
    <>
      <SectionTitle>Your agents</SectionTitle>
      <EmptyCard
        title="Log in to view your agents"
        message="Connect your wallet to see your running agents, their results and the details of each run."
        action={connectAction}
      />
    </>
  ) : (
    <>
      {mm.active.length + mm.completed.length > 0 ? (
        <StatStrip
          items={[
            { label: "Total volume", value: usdCompact(mm.totals.volume), sub: "Volume generated" },
            {
              label: "Avg CPM",
              value: mm.totals.cpm !== null ? `$${mm.totals.cpm.toFixed(2)}` : "—",
              sub: "Execution cost",
              aside: <InfoButton quiet label="About average CPM" onPress={() => setCpmTip(true)} />,
            },
            { label: "Active agents", value: String(mm.active.length), sub: `${running} running · ${paused} paused` },
          ]}
        />
      ) : null}
      <SectionTitle
        caption={
          mm.active.length > 0
            ? `${running} of ${mm.active.length} running · Net PnL ${usdFineSigned(mm.totals.realizedPnl)}`
            : null
        }
      >
        Active agents
      </SectionTitle>
      {mm.active.length === 0 ? (
        <EmptyCard
          title="No agents running yet"
          message="Launch one to start quoting."
          action={
            <Dn2Button variant="primary" size="lg" className="w-full" onClick={() => setSetupOpen(true)}>
              New agent
            </Dn2Button>
          }
        />
      ) : (
        mm.active.map((a) => <AgentCard key={a.id} agent={a} onOpen={() => openAgent(a.id)} />)
      )}
    </>
  );

  const historyBody = !signedIn ? (
    <EmptyCard
      title="No completed runs yet"
      message="Connect your wallet to see every finished run and its results."
      action={connectAction}
    />
  ) : mm.completed.length === 0 ? (
    <EmptyCard title="No completed runs yet" message="A run lands here once its agent is deactivated or its timer ends." />
  ) : (
    <>
      {mm.completed.slice(0, shown).map((a) => (
        <AgentCard key={a.id} agent={a} onOpen={() => openAgent(a.id)} />
      ))}
      {mm.completed.length > shown ? (
        <Dn2Button size="md" className="w-full" onClick={() => setShown((n) => n + PAGE)}>
          Show more · {mm.completed.length - shown} left
        </Dn2Button>
      ) : null}
    </>
  );

  return (
    <>
      <SubTabs tabs={TABS} value={tab} onChange={goTo} ariaLabel="Market Making" />
      <div
        ref={setScrollEl}
        className="delta-neutral-minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]"
      >
        <div
          className={`flex flex-col gap-3 px-5 pb-6 max-[374px]:px-4 ${tab === "agents" ? "pt-4" : "pt-3.5"}`}
          role="tabpanel"
          aria-label={TABS.find((t) => t.id === tab)?.label}
        >
          {tab === "agents" ? (
            <>
              {hero}
              {agentsBody}
            </>
          ) : (
            historyBody
          )}
        </div>
      </div>

      <MmSetupPage
        open={setupOpen}
        onClose={closeSetup}
        mm={mm}
        onLogin={() => setConnectOpen(true)}
        onDone={(id) => {
          setSetupOpen(false);
          setTab("agents");
          openAgent(id);
        }}
      />

      <MmAgentPage
        open={agent.open}
        onClose={() => setAgent((a) => ({ ...a, open: false }))}
        detail={agent.id ? mm.getDetail(agent.id) : null}
        pending={mm.pending}
        onEdit={() => {
          const row = mm.active.find((a) => a.id === agent.id);
          if (!row) return;
          mm.edit(row);
          setSetupOpen(true);
        }}
        onToggleRun={async () => {
          const row = mm.active.find((a) => a.id === agent.id);
          if (!row) return;
          const did = await mm.toggleRun(row);
          toast.show({ title: did === "paused" ? "Strategy paused." : "Strategy resumed.", tone: "success", theme: "gold" });
        }}
        onDeactivate={async () => {
          const row = mm.active.find((a) => a.id === agent.id);
          if (row) await mm.deactivate(row);
        }}
      />

      <InfoSheet
        open={cpmTip}
        onClose={() => setCpmTip(false)}
        title="Avg CPM"
        body="Average cost per $1M of volume across all of your runs. Shows a dash until you pass $10k of volume."
      />
      <InfoSheet open={about} onClose={() => setAbout(false)} title="About Market Making" body={ABOUT} />

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
