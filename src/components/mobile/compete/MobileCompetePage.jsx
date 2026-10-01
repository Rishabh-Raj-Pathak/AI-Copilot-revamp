import AppNavBar from "../AppNavBar.jsx";
import { useAppToast } from "../appToastContext.js";
import CompeteEntrySheet from "./CompeteEntrySheet.jsx";
import MobileCompetitionCard from "./MobileCompetitionCard.jsx";

/**
 * Phone Compete — Figma "More / Compete — Full Page" (956:5275).
 *
 * A pushed screen: the back nav bar with no title (the 26px "Compete" sits in
 * the body), a one-line pitch, then the competitions stacked 16px apart.
 *
 * State stays in `CompetePage` so desktop and phone share one entry flow;
 * entering opens `CompeteEntrySheet` from the bottom instead of the desktop's
 * centred dialog.
 */
export default function MobileCompetePage({
  competitions,
  enteredIds,
  entryFor,
  onOpenEntry,
  onCloseEntry,
  onEntered,
}) {
  const toast = useAppToast();

  const showResults = (competition) =>
    toast.show({
      title: "Results coming soon",
      message: `Final ${competition.venue} standings will appear here once published.`,
    });

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-ink">
      <AppNavBar title="" />
      <main className="app-no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-col gap-2 px-4 pb-6 pt-2">
          <h1 className="text-[26px] font-bold leading-[25.2px] tracking-[-0.72px] text-ink">Compete</h1>
          <p className="text-app-callout leading-[17.4px] text-[#b4b5c2]">
            Trade on a partner venue and climb its leaderboard for a share of the prize pool.
          </p>
          <div className="flex flex-col gap-4 pt-3">
            {competitions.map((competition) => (
              <MobileCompetitionCard
                key={competition.id}
                competition={competition}
                entered={enteredIds.has(competition.id)}
                onEnter={onOpenEntry}
                onResults={showResults}
              />
            ))}
          </div>
        </div>
      </main>

      <CompeteEntrySheet competition={entryFor} onEntered={onEntered} onClose={onCloseEntry} />
    </div>
  );
}
