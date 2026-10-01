import { useState } from "react";
import AppNavBar from "../AppNavBar.jsx";
import { useMobileApp } from "../MobileAppContext.js";
import { POINTS_SEASONS } from "../pointsData.js";
import PointsLeaderboard from "./PointsLeaderboard.jsx";
import PointsSummaryCard from "./PointsSummaryCard.jsx";

/**
 * Phone Points — Figma "More / Points — Full Page" (957:5421).
 *
 * A pushed screen: back nav bar titled "Points", the Season 1 | Season 2
 * pill, the balance card with the weekly distribution countdown, then the
 * leaderboard. Only an active season has a balance and standings; the
 * others read `-` like the signed-out artboard.
 */
const SEASON_TABS = POINTS_SEASONS.slice(0, 2).map((season, i) => ({
  ...season,
  label: `Season ${i + 1}`,
}));

export default function MobilePointsPage() {
  const app = useMobileApp();
  const [seasonId, setSeasonId] = useState(SEASON_TABS[0].id);
  const season = SEASON_TABS.find((item) => item.id === seasonId) ?? SEASON_TABS[0];

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-app-bg text-ink">
      <AppNavBar title="Points" />
      <main className="app-no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--app-tab-bar-h)]">
        <div className="flex flex-col items-center gap-5 px-4 pb-6 pt-4">
          <div
            role="tablist"
            aria-label="Season"
            className="flex rounded-full border border-[rgba(120,90,40,0.5)] bg-app-subtle p-[3px]"
          >
            {SEASON_TABS.map((item) => {
              const selected = item.id === seasonId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSeasonId(item.id)}
                  className={`app-pressable relative rounded-full border px-3 py-1 text-app-caption font-medium leading-4 text-ink after:absolute after:-inset-y-2 after:inset-x-0 ${
                    selected
                      ? "border-[#785a28] bg-gradient-to-b from-[#1a140b] to-[#0f0e0c]"
                      : "border-transparent opacity-60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-4">
            <PointsSummaryCard balance={app.pointsBalance} active={season.active} />
            <PointsLeaderboard key={season.id} active={season.active} />
          </div>
        </div>
      </main>
    </div>
  );
}
