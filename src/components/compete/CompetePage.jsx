import { useState } from "react";
import CopilotBottomNav from "../terminal/CopilotBottomNav.jsx";
import CopilotMobileHeader from "../terminal/CopilotMobileHeader.jsx";
import HeaderTerminal from "../terminal/HeaderTerminal.jsx";
import CompeteEntryModal from "./CompeteEntryModal.jsx";
import CompeteEntryPrompt from "./CompeteEntryPrompt.jsx";
import CompetitionCard from "./CompetitionCard.jsx";
import { COMPETITIONS } from "./competeMockData.js";
import {
  dismissEntryPrompt,
  enterCompetition,
  readEnteredCompetitions,
  readEntryPromptDismissed,
} from "./competeSession.js";

/** The first competition still running that this session has not joined. */
function liveUnentered(entered) {
  return (
    COMPETITIONS.find(
      (item) => item.status === "live" && !entered.has(item.id),
    ) ?? null
  );
}

/**
 * What the hub opens on — the same competition the banner points at, unless
 * the modal has already been waved away this session.
 *
 * A pure read of module state, which is what lets it run from a lazy `useState`
 * initialiser: StrictMode invokes those twice, and both calls have to agree.
 */
function autoPromptTarget() {
  if (readEntryPromptDismissed()) return null;
  return liveUnentered(readEnteredCompetitions());
}

/**
 * Compete — the competition hub.
 *
 * A primary nav destination, so it uses the same shell as `RewardsPage`: mobile
 * header, desktop nav, scrolling content, bottom nav. Nothing here is backed by
 * a service (see `competeMockData.js`).
 *
 * Two across, ordered live-first, following the Figma section (7098:2). The
 * cards carry key art and a full stat row now, so they get half a row each
 * rather than the three-up grid the compact tiles used.
 *
 * Entering a live competition happens here too, in `CompeteEntryModal` — a
 * layer over this page rather than a route, so the grid is still behind the
 * dialog and closing it costs nothing. It opens by itself on arrival, which is
 * why it is a layer and not a route: the hub has to be visibly there behind
 * the invitation, or the invitation reads as the destination.
 */
export default function CompetePage({
  walletConnected,
  onWalletConnected,
  onWalletDisconnect,
  onOpenProfile,
  onOpenSupport,
  terminalPlatform,
  onTerminalPlatformChange,
  onOpenCopilot,
  onOpenTrade,
  onOpenRewards,
  onOpenCompete,
  onVaultViewChange,
}) {
  /**
   * Which competition the entry modal is for, and which have been entered.
   *
   * The modal target is page state — closing the page closes the modal, which
   * is what you want — but it is seeded open, so landing on the hub leads with
   * the invitation. Both initial values come from `competeSession`, because
   * this page unmounts on every visit to Trade or Rewards: an entry that
   * disappeared on the way back would read as a bug, and a modal that came
   * back after being closed would read as a nag.
   */
  const [entryFor, setEntryFor] = useState(autoPromptTarget);
  const [enteredIds, setEnteredIds] = useState(readEnteredCompetitions);

  /** Closing is the answer "not now", and it is remembered for the session. */
  const closeEntry = () => {
    dismissEntryPrompt();
    setEntryFor(null);
  };

  /**
   * Only a running competition has anything to join. A settled one still owns
   * its `Results` button, which is waiting on the leaderboard view.
   */
  const openEntry = (id) => {
    const competition = COMPETITIONS.find((item) => item.id === id);
    if (competition?.status === "live") setEntryFor(competition);
  };

  /** What the banner offers, and `null` once there is nothing left to join. */
  const pendingEntry = liveUnentered(enteredIds);

  const walletHeaderProps = {
    walletConnected,
    onWalletConnected,
    onWalletDisconnect,
    onOpenProfile,
    onOpenSupport,
    terminalPlatform,
    onTerminalPlatformChange,
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white max-tablet:pb-[calc(4.25rem+env(safe-area-inset-bottom))]">
      <CopilotMobileHeader {...walletHeaderProps} />
      <HeaderTerminal
        {...walletHeaderProps}
        activeNavItem="Compete"
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onNavItemClick={(label) => {
          if (label === "AI Copilot") onOpenCopilot?.();
          if (label === "Trade") onOpenTrade?.();
          if (label === "Rewards") onOpenRewards?.("rewards");
          if (label === "KOL") onOpenRewards?.("kol");
          if (label === "Compete") onOpenCompete?.();
        }}
        showCopilotTutorial={false}
      />

      <main className="minimal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {/* Same gutter scale as every other page (see `RewardsPage`). */}
        <div className="flex w-full flex-col gap-8 px-5 py-8 pb-16 max-tablet:gap-6 max-tablet:px-4 max-tablet:py-5 max-tablet:pb-4 sm:px-8 lg:px-10 xl:px-12">
          <header>
            <h1 className="text-hero text-ink">
              Compete
            </h1>
            {/* One line from `sm` up — the measure cap was splitting a sentence that
              comfortably fits. */}
            <p className="text-copy mt-3 text-ink-muted sm:whitespace-nowrap xl:mt-4">
              Trade our partner venues through HyprEarn and climb the volume
              leaderboard.
            </p>
            {/* Inside the header, as a third sentence of the hub's opening
                statement — what this page is, what it is for, and what you get
                for joining. Above the title it was a banner about the page
                rather than part of it. */}
            {pendingEntry ? (
              <CompeteEntryPrompt onOpen={() => openEntry(pendingEntry.id)} />
            ) : null}
          </header>

          {/* The hub holds a season of these, so the grid is built to grow:
              one up on a phone, two from `lg`, three from `xl`. The fourth
              column waits for `wide` (1800px) rather than 2xl: at 1536 the fluid type
              is already at its ceiling while the tile would be at its narrowest,
              so the venue name and the stat labels start truncating. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 xl:gap-5 wide:grid-cols-4">
            {COMPETITIONS.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                entered={enteredIds.has(competition.id)}
                onOpen={openEntry}
              />
            ))}
          </div>
        </div>
      </main>

      <CopilotBottomNav
        activeId="compete"
        vaultView="featured"
        onVaultViewChange={onVaultViewChange}
        onOpenSupport={onOpenSupport}
        onOpenCompete={onOpenCompete}
        onNavClick={(id) => {
          if (id === "copilot") onOpenCopilot?.();
          if (id === "trade") onOpenTrade?.();
          if (id === "rewards") onOpenRewards?.("rewards");
          if (id === "kol") onOpenRewards?.("kol");
        }}
      />

      {/* Mounted only while open, so each visit starts from a clean state. */}
      {entryFor ? (
        <CompeteEntryModal
          competition={entryFor}
          onEntered={(id) => setEnteredIds(enterCompetition(id))}
          onClose={closeEntry}
        />
      ) : null}
    </div>
  );
}
