import BottomSheet from "../BottomSheet.jsx";
import { appImages } from "../mobileAssets.js";
import { POINTS_SEASONS, formatPoints } from "../pointsData.js";

/** Figma "Season Card" (1001:5923). */
export function SeasonCard({ season }) {
  return (
    <div
      className={`flex w-full flex-col gap-1.5 rounded-xl border p-4 ${
        season.active
          ? "border-app-line-points bg-gradient-to-b from-[#1a140b] to-[#0f0e0c]"
          : "border-app-line bg-app-surface"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-app-headline font-medium text-[#f5e6c8]">{season.title}</p>
        <span
          className={`shrink-0 rounded-full border border-app-line-points px-2.5 py-1 font-points text-app-caption font-medium text-[#e0b36a] ${
            season.active ? "bg-app-line-points" : "bg-app-surface"
          }`}
        >
          {season.status}
        </span>
      </div>
      <p className="text-app-callout leading-[19px] text-[#9a9a9a]">
        {season.description.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

/** Figma "Copilot / HyprEarn Points Modal" → Points Sheet (944:2905). */
export default function PointsSheet({ open, onClose, balance = 0 }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="HyprEarn Points">
      <div className="flex flex-col items-center gap-6 px-4 pt-6">
        <div className="flex flex-col items-center gap-3">
          <img alt="" src={appImages.coinBronze} className="size-[100px] rounded-full object-contain" />
          <div className="flex h-10 min-w-16 items-center justify-center rounded-full border border-app-line-points bg-[#120f0a] px-5">
            <span className="bg-gradient-to-b from-[#e0e0e0] from-[53%] to-[#724a2c] to-[92%] bg-clip-text font-points text-app-display font-bold leading-[28.8px] text-transparent">
              {formatPoints(balance)}
            </span>
          </div>
        </div>
        <section className="flex w-full flex-col gap-3" aria-labelledby="points-seasons">
          <h3
            id="points-seasons"
            className="text-app-caption font-medium uppercase tracking-[0.08em] text-ink-faint"
          >
            Seasons
          </h3>
          <div className="flex flex-col gap-3">
            {POINTS_SEASONS.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
          </div>
        </section>
      </div>
    </BottomSheet>
  );
}
