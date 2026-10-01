import { useState } from "react";
import AppIcon from "../AppIcon.jsx";
import { appIcons } from "../mobileAssets.js";
import VaultsActivatedSection from "../../vaults/VaultsActivatedSection.jsx";
import AgentVenueSheet, { AgentVenueMark } from "./AgentVenueSheet.jsx";
import AgentsSwitcher from "./AgentsSwitcher.jsx";
import MobileAgentCard from "./MobileAgentCard.jsx";
import MobileAgentPositions from "./MobileAgentPositions.jsx";
import { GOLD_PILL_FILL, GOLD_TITLE_AGENTS_CLASS } from "./agentsTheme.js";

/** Figma "Section Divider (Gold)" (950:4040). */
function SectionDivider({ label }) {
  return (
    <div className="flex h-4 items-center gap-2.5">
      <span className="h-px min-w-0 flex-1 bg-white/[0.06]" aria-hidden />
      <h2 className="shrink-0 text-[12px] font-medium uppercase leading-4 tracking-[2px] text-[#717182]">
        {label}
      </h2>
      <AppIcon src={appIcons.info14} size={14} className="text-[#717182]" />
      <span className="h-px min-w-0 flex-1 bg-white/[0.06]" aria-hidden />
    </div>
  );
}

/**
 * Figma "Alpha Agents Carousel" (953:4170): cards snap one at a time, with a
 * 48px fade on the trailing edge while there is more to scroll to.
 */
function AgentCarousel({ label, vaults, rowUi, venueId, onPatch, tourFirst = false }) {
  const [atEnd, setAtEnd] = useState(false);

  if (vaults.length === 0) {
    return (
      <p className="rounded-[14px] border border-white/[0.05] bg-[#0c0c0c] px-4 py-6 text-center text-app-callout text-[#717182]">
        No agents match this venue filter.
      </p>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onScroll={(e) => {
        const el = e.currentTarget;
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
      }}
      className={`app-no-scrollbar flex snap-x snap-mandatory scroll-px-2.5 gap-3 overflow-x-auto overscroll-x-contain p-2.5 ${
        atEnd || vaults.length < 2
          ? ""
          : "[mask-image:linear-gradient(90deg,#000_calc(100%-48px),transparent)]"
      }`}
    >
      {vaults.map((vault, index) => (
        <MobileAgentCard
          key={vault.id}
          vault={vault}
          ui={rowUi[vault.id]}
          venueId={venueId}
          onPatch={onPatch}
          tourControls={tourFirst && index === 0}
        />
      ))}
    </div>
  );
}

/**
 * Phone body of the Alpha Agents screen — Figma "Agents / Alpha Agents — Full
 * Page" (953:4116). All state is VaultsPage's: the venue filter, the per-vault
 * UI rows and the single `onPatch` updater, so the vaults product tour and
 * activation flow behave exactly as on desktop.
 *
 * Featured vaults fill the "Alpha Agents" carousel and available vaults the
 * "Prime Agents" one; activated vaults lift out of both into the activated
 * list above them, as on desktop.
 */
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
  const [venueOpen, setVenueOpen] = useState(false);
  const activeTab = dexTabs.find((t) => t.id === dexId) ?? dexTabs[0];

  return (
    <div className="flex flex-col gap-4 px-4 pb-5 pt-4">
      <AgentsSwitcher />

      <section className="flex flex-col gap-4" data-tour="vaults-overview">
        <div className="flex items-center gap-3">
          <h1 className={GOLD_TITLE_AGENTS_CLASS}>
            Agents
          </h1>
          <span
            className={`flex h-[34px] min-w-0 items-center gap-2 rounded-full border border-[#785a28] px-4 ${GOLD_PILL_FILL}`}
          >
            <AppIcon src={appIcons.shieldCheck16} size={16} className="text-[#e8d5b5]" />
            <span className="truncate text-[12px] font-medium uppercase leading-[15px] tracking-[0.3px] text-[#e8d5b5]">
              Fully non-custodial
            </span>
          </span>
        </div>
        <p className="text-[13px] leading-5 text-[#b4b5c2]">
          AI agents trade perps for you, live, 24/7. Your agent trades on your behalf, but your
          funds stay fully in your control non-custodial, no lock-in. Withdraw anytime.
        </p>
      </section>

      <section className="flex flex-col gap-5 pt-2" aria-label="Agents">
        <div className="flex justify-center" data-tour="vaults-dex-tabs">
          <button
            type="button"
            onClick={() => setVenueOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Venue: ${activeTab.label}. Change venue`}
            className="app-pressable flex h-[50px] items-center gap-2 rounded-full border border-white/[0.05] bg-app-subtle px-4"
          >
            <span className="flex size-6 items-center justify-center">
              <AgentVenueMark id={activeTab.id} size={24} />
            </span>
            <span className="text-[14px] font-medium uppercase leading-[18px] tracking-[0.35px] text-[#e8d5b5]">
              {activeTab.label}
            </span>
            <AppIcon src={appIcons.chevronDown16} size={16} className="text-[#ccb17f]" />
          </button>
        </div>

        {activated.length > 0 ? (
          <VaultsActivatedSection vaults={activated} rowUi={rowUi} onPatch={onPatch} />
        ) : null}

        <div className="flex flex-col gap-5" data-tour="vaults-opportunities">
          <SectionDivider label="Alpha Agents" />
          <AgentCarousel
            label="Alpha agents"
            vaults={featured}
            rowUi={rowUi}
            venueId={dexId}
            onPatch={onPatch}
            tourFirst
          />
          <SectionDivider label="Prime Agents" />
          <AgentCarousel
            label="Prime agents"
            vaults={available}
            rowUi={rowUi}
            venueId={dexId}
            onPatch={onPatch}
          />
        </div>
      </section>

      <MobileAgentPositions venueId={dexId} />

      <AgentVenueSheet
        open={venueOpen}
        onClose={() => setVenueOpen(false)}
        tabs={dexTabs}
        value={dexId}
        onChange={onDexChange}
      />
    </div>
  );
}
