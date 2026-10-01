import AppIcon from "../AppIcon.jsx";
import { appIcons, appImages } from "../mobileAssets.js";
import {
  formatEndedOn,
  formatUsdCompact,
} from "../../compete/competeMockData.js";
import {
  CTA_SWEEP,
  EDGE_ENDED,
  EDGE_SWEEP,
  INK_FAINT,
  INK_MUTED,
  LIVE_GREEN,
  LIVE_ICON,
  SETTLED_BG,
  SETTLED_BORDER,
  SETTLED_GREEN,
} from "../../compete/competeTheme.js";

/**
 * Figma "Competition / *" card (956:5298 live, 956:5354 ended).
 *
 * Venue lockup and status pill over the venue's 3D coin, the title, a
 * Pool / Traders / Volume row and a footer rail. Live cards sit inside the
 * HyprEarn sweep (a 1px gradient edge) and tint their icons lime; ended ones
 * drop to a grey edge. The coin is clipped by the hero, so it stops dead on
 * the first rule exactly as the artboard draws it.
 */

/** Venue marks in the lockup — each sized to its own artboard box. */
const VENUE_MARK = {
  lighter: { src: appImages.lighterMarkSmall, className: "h-[22px] w-[13px]" },
  pacifica: { src: appImages.venue.pacifica, className: "size-[21px]" },
  decibel: { src: appImages.venue.decibel, className: "size-[21px] object-contain" },
};

const ART = {
  lighter: appImages.competeArt.lighter,
  pacifica: appImages.competeArt.pacifica,
  decibel: appImages.competeArt.decibel,
};

function StatusPill({ live }) {
  return (
    <span
      className="relative flex shrink-0 items-center gap-1 rounded-full border bg-black/45 py-1.5 pl-[13px] pr-3"
      style={{ borderColor: live ? "rgba(74,222,128,0.5)" : "#555555" }}
    >
      <span
        className={`size-2 shrink-0 rounded-full${live ? " ds-live-dot" : ""}`}
        style={{
          backgroundColor: live ? LIVE_GREEN : INK_FAINT,
          color: live ? LIVE_GREEN : undefined,
          boxShadow: live ? `0 0 6px ${LIVE_GREEN}` : undefined,
        }}
        aria-hidden
      />
      <span
        className="text-app-micro font-semibold leading-[10px] tracking-[0.6px]"
        style={{ color: live ? LIVE_GREEN : INK_MUTED }}
      >
        {live ? "LIVE" : "ENDED"}
      </span>
    </span>
  );
}

function Stat({ icon, tint, value, label, divided }) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-3 ${divided ? "border-l border-[#262626] pl-[11px]" : ""}`}
    >
      <span style={{ color: tint }} className="flex shrink-0">
        <AppIcon src={icon} size={20} />
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-app-body font-semibold leading-[16.8px] text-ink">{value}</p>
        <p className="truncate text-app-caption leading-[15.6px] text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

/** 33px tall like the artboard; the `after` box stretches the hit area to 44. */
const CTA =
  "app-pressable relative flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-[7px] text-app-body font-semibold leading-[18.2px] after:absolute after:-inset-y-1.5 after:inset-x-0";

export default function MobileCompetitionCard({ competition, entered = false, onEnter, onResults }) {
  const { id, venue, title, status, prizePool, participants, volume, endedAt } = competition;
  const live = status === "live";
  const tint = live ? LIVE_ICON : INK_MUTED;
  const mark = VENUE_MARK[id];

  return (
    <article
      className="w-full rounded-[14px] p-px"
      style={{ background: live ? EDGE_SWEEP : EDGE_ENDED }}
    >
      <div className="flex flex-col gap-4 overflow-hidden rounded-[13px] bg-app-bg px-4 pb-4">
        <div className="relative flex flex-col gap-4 overflow-hidden pt-4">
          <img
            alt=""
            src={ART[id] ?? competition.art?.src}
            className="pointer-events-none absolute -right-[3px] top-1 size-[104px] select-none object-contain"
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <img alt="" src={appImages.hyprEarnMarkSmall} className="h-4 w-3 shrink-0" />
              <span className="text-app-caption leading-[15px] text-ink-subtle" aria-hidden>
                ×
              </span>
              {mark ? <img alt="" src={mark.src} className={`shrink-0 ${mark.className}`} /> : null}
              <span className="truncate text-app-caption leading-[15px] text-ink">{venue}</span>
            </div>
            <StatusPill live={live} />
          </div>
          <h2 className="relative max-w-[232px] text-app-headline font-bold leading-5 tracking-[-0.16px] text-ink">
            {title}
          </h2>
          <div className="relative h-px w-full bg-[#262626]" />
        </div>

        <div className="flex w-full items-start">
          <Stat icon={appIcons.coins20} tint={tint} value={formatUsdCompact(prizePool.total)} label="Pool" />
          <Stat
            icon={appIcons.users20}
            tint={tint}
            value={participants.toLocaleString("en-US")}
            label="Traders"
            divided
          />
          <Stat icon={appIcons.activity20} tint={tint} value={formatUsdCompact(volume)} label="Volume" divided />
        </div>

        <div className="h-px w-full bg-[#262626]" />

        <footer className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-[11px]">
            <span className="flex shrink-0" style={{ color: tint }}>
              <AppIcon src={live ? appIcons.timer20 : appIcons.calendar20} size={20} />
            </span>
            <span
              className="truncate text-app-caption leading-[15px]"
              style={{ color: live ? LIVE_GREEN : INK_MUTED }}
            >
              {live ? "Live now" : `Ended on ${formatEndedOn(endedAt)}`}
            </span>
          </p>

          {entered ? (
            <span
              className={`${CTA} border`}
              style={{ borderColor: SETTLED_BORDER, backgroundColor: SETTLED_BG, color: SETTLED_GREEN }}
            >
              <AppIcon src={appIcons.check12} size={14} />
              Entered
            </span>
          ) : live ? (
            <button
              type="button"
              onClick={() => onEnter?.(id)}
              className={`${CTA} text-[#0a0a0a]`}
              style={{ backgroundImage: CTA_SWEEP }}
            >
              Enter
              <AppIcon src={appIcons.arrowRight15} size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onResults?.(competition)}
              className={`${CTA} border border-[#3e3e3e] text-ink active:bg-white/[0.06]`}
            >
              Results
              <AppIcon src={appIcons.arrowRight15} size={15} />
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}
